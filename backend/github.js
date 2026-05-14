import { Router } from 'express';
import { Octokit } from '@octokit/rest';

const router = Router();

function getOctokit() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      'GITHUB_TOKEN is not set. Add it to your .env file.'
    );
  }
  return new Octokit({ auth: token });
}

/**
 * Validate that the required GitHub env vars are present.
 * Returns { owner, repo, baseBranch } or throws.
 */
function getGitHubConfig() {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;

  if (!owner || !repo) {
    throw new Error(
      'GITHUB_OWNER and GITHUB_REPO must be set in your .env file.'
    );
  }

  return {
    owner,
    repo,
    baseBranch: process.env.GITHUB_BASE_BRANCH || 'main',
  };
}

/**
 * Read a file from GitHub.
 * Returns { content (utf-8 string), sha, path }
 */
async function readGitHubFile(octokit, { owner, repo, path, ref }) {
  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path,
    ...(ref ? { ref } : {}),
  });

  if (data.type !== 'file') {
    throw new Error(`Path "${path}" is not a file (type: ${data.type})`);
  }

  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  return { content, sha: data.sha, path: data.path };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Find lines in `content` that contain `keyword` (case-insensitive).
 * Returns up to `maxLines` surrounding lines as a formatted snippet.
 */
function findRelevantLines(content, keyword, maxLines = 10) {
  const lines = content.split('\n');
  const keyword_lc = keyword.toLowerCase();
  const hits = [];

  lines.forEach((line, i) => {
    if (line.toLowerCase().includes(keyword_lc)) {
      // Include 1 line of context on each side
      const start = Math.max(0, i - 1);
      const end   = Math.min(lines.length - 1, i + 1);
      for (let j = start; j <= end; j++) {
        const entry = { lineNo: j + 1, text: lines[j] };
        if (!hits.find(h => h.lineNo === entry.lineNo)) hits.push(entry);
      }
    }
  });

  return hits
    .sort((a, b) => a.lineNo - b.lineNo)
    .slice(0, maxLines)
    .map(h => `  L${h.lineNo}: ${h.text}`)
    .join('\n');
}

/**
 * YAML-aware line-level patch.
 *
 * Matches a line by key name + value, ignoring:
 *   - surrounding quotes  ('512Mi'  or  "512Mi")
 *   - inline YAML comments  (# anything)
 *   - leading/trailing whitespace
 *
 * Preserves the original indentation and any inline comment on the replaced line.
 *
 * Returns { patched, matchCount } or null if the find string doesn't look like a
 * YAML key:value pair (so the caller can fall back to exact matching).
 */
function yamlAwarePatch(content, find, replace) {
  // Must look like:  [optional-ws] key: value
  const findParts = find.match(/^(\s*)([\w.-]+):\s*["']?(.+?)["']?\s*$/);
  if (!findParts) return null;

  const [, , key, findValue] = findParts;

  // Extract the new value from the replace string (strip key prefix if present)
  const replaceParts = replace.match(/^\s*[\w.-]+:\s*["']?(.+?)["']?\s*$/);
  const newValue = replaceParts ? replaceParts[1] : replace;

  // Build a pattern:  <indent><key>: <optional-quote><value><optional-quote><optional-comment>
  const linePattern = new RegExp(
    `^([ \\t]*${escapeRegex(key)}:\\s*)["']?${escapeRegex(findValue.trim())}["']?([ \\t]*(?:#[^\\n]*)?)$`,
    'gm'
  );

  let matchCount = 0;
  const patched = content.replace(linePattern, (_, prefix, trailingComment) => {
    matchCount++;
    // Re-quote the value if the original had quotes, else leave bare
    return `${prefix}${newValue}${trailingComment}`;
  });

  return matchCount > 0 ? { patched, matchCount } : null;
}

/**
 * Apply a find-and-replace patch to `content`.
 *
 * Strategy (in order):
 *   1. Exact literal match (fast path)
 *   2. YAML-aware match  — ignores quotes + inline comments around the value
 *   3. If useRegex=true, treat `find` as a regex pattern (gm flags)
 *
 * Returns { patched, matchCount }
 * Throws a descriptive error (with file snippet) when no strategy matches.
 */
function applyPatch(content, { find, replace, useRegex = false }) {
  if (!find) throw new Error('Patch must include a "find" value.');
  if (replace === undefined) throw new Error('Patch must include a "replace" value.');

  // ── Strategy 1: exact literal ─────────────────────────────────────────────
  if (!useRegex) {
    const exactPattern = new RegExp(escapeRegex(find), 'g');
    let exactCount = 0;
    const exactPatched = content.replace(exactPattern, () => { exactCount++; return replace; });
    if (exactCount > 0) return { patched: exactPatched, matchCount: exactCount };
  }

  // ── Strategy 2: YAML-aware (quotes + comments ignored) ───────────────────
  if (!useRegex) {
    const yamlResult = yamlAwarePatch(content, find, replace);
    if (yamlResult) {
      console.log('[GitHub] Exact match failed — YAML-aware match succeeded.');
      return yamlResult;
    }
  }

  // ── Strategy 3: regex ─────────────────────────────────────────────────────
  if (useRegex) {
    let pattern;
    try {
      pattern = new RegExp(find, 'gm');
    } catch (e) {
      throw new Error(`Invalid regex pattern "${find}": ${e.message}`);
    }
    let regexCount = 0;
    const regexPatched = content.replace(pattern, (m) => { regexCount++; return replace; });
    if (regexCount > 0) return { patched: regexPatched, matchCount: regexCount };
  }

  // ── All strategies failed — return helpful error with file snippet ─────────
  const keyword = find.split(/[:\s"']/)[0] || find;
  const snippet = findRelevantLines(content, keyword);
  const hint = snippet
    ? `\n\nLines in the file that contain "${keyword}":\n${snippet}\n\nCopy one of those lines exactly into your "find" field.`
    : `\n\nThe keyword "${keyword}" was not found anywhere in the file. Double-check the filePath.`;

  throw new Error(`Patch had no effect — "${find}" was not found in the file.${hint}`);
}

/**
 * Get the SHA of the tip commit on `branchName`.
 */
async function getBranchSha(octokit, { owner, repo, branchName }) {
  const { data } = await octokit.repos.getBranch({ owner, repo, branch: branchName });
  return data.commit.sha;
}

/**
 * Create a new git branch off `fromSha`.
 */
async function createBranch(octokit, { owner, repo, branchName, fromSha }) {
  await octokit.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${branchName}`,
    sha: fromSha,
  });
}

/**
 * Commit an updated file to an existing branch.
 */
async function commitFile(octokit, { owner, repo, path, content, message, branch, fileSha }) {
  const encodedContent = Buffer.from(content, 'utf-8').toString('base64');

  const { data } = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: encodedContent,
    branch,
    sha: fileSha,   // Required to update an existing file
  });

  return data.commit.sha;
}

/**
 * Open a Pull Request.
 */
async function createPullRequest(octokit, { owner, repo, title, body, head, base }) {
  const { data } = await octokit.pulls.create({
    owner,
    repo,
    title,
    body,
    head,
    base,
  });

  return {
    number: data.number,
    url: data.html_url,
    title: data.title,
    state: data.state,
    branch: head,
  };
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * GET /github/file?path=<file-path>[&ref=<branch|commit>]
 *
 * Read any file from the configured GitHub repo.
 * Useful for previewing content before patching.
 */
router.get('/file', async (req, res) => {
  const { path, ref } = req.query;

  if (!path) {
    return res.status(400).json({ error: 'Query param "path" is required.' });
  }

  try {
    const octokit = getOctokit();
    const config = getGitHubConfig();

    const file = await readGitHubFile(octokit, {
      owner: config.owner,
      repo: config.repo,
      path,
      ref,
    });

    return res.json({
      success: true,
      owner: config.owner,
      repo: config.repo,
      path: file.path,
      sha: file.sha,
      content: file.content,
    });
  } catch (err) {
    console.error('[GitHub] Read file error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /github/create-pr
 *
 * Body:
 * {
 *   "filePath":        "manifests/prometheus-deployment.yaml",   // required
 *   "fix": {
 *     "find":      "memory: 512Mi",  // required — must match file content exactly
 *     "replace":   "memory: 1Gi",   // required
 *     "useRegex":  false             // optional — treat find as a regex (gm flags)
 *   },
 *   "podName":         "prometheus-1",                            // optional
 *   "editDescription": "Increase memory limit from 512Mi to 1Gi",// optional
 *   "preview":         false         // optional — if true, returns diff WITHOUT creating the PR
 * }
 *
 * Flow:
 *   1. Read the target file from GitHub (get content + SHA)
 *   2. Apply find/replace patch  (error includes a file snippet if find fails)
 *   3. [preview=true]  Return diff only — no branch / PR created
 *   4. Create a new branch:  fix/<podName>-<timestamp>
 *   5. Commit patched file to that branch
 *   6. Open a PR targeting GITHUB_BASE_BRANCH
 *   7. Return PR details (number, URL, branch, title)
 */
router.post('/create-pr', async (req, res) => {
  const { filePath, fix, podName = 'pod', editDescription, preview = false } = req.body;

  // ── Input validation ──────────────────────────────────────────────────────
  if (!filePath) {
    return res.status(400).json({ success: false, error: '"filePath" is required.' });
  }
  if (!fix || !fix.find || fix.replace === undefined) {
    return res.status(400).json({
      success: false,
      error: '"fix" object with "find" and "replace" fields is required.',
    });
  }

  try {
    const octokit = getOctokit();
    const config = getGitHubConfig();
    const { owner, repo, baseBranch } = config;

    // ── Step 1: Read the file ─────────────────────────────────────────────
    console.log(`[GitHub] Reading "${filePath}" from ${owner}/${repo}@${baseBranch}`);
    const file = await readGitHubFile(octokit, { owner, repo, path: filePath, ref: baseBranch });

    // ── Step 2: Apply the patch ───────────────────────────────────────────
    console.log(`[GitHub] Applying patch: "${fix.find}" → "${fix.replace}" (regex=${!!fix.useRegex})`);
    const { patched: patchedContent, matchCount } = applyPatch(file.content, fix);
    console.log(`[GitHub] Patch applied — ${matchCount} occurrence(s) replaced.`);

    // ── Step 2b: Preview mode (dry run) ──────────────────────────────────
    if (preview) {
      return res.json({
        success: true,
        preview: true,
        filePath,
        matchCount,
        original: file.content,
        patched:  patchedContent,
        message: `Preview only — no branch or PR was created. ${matchCount} occurrence(s) would be replaced.`,
      });
    }

    // ── Step 3: Create a new branch ───────────────────────────────────────
    const timestamp = Date.now();
    const safeName = podName.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
    const branchName = `fix/${safeName}-${timestamp}`;

    console.log(`[GitHub] Creating branch "${branchName}" from "${baseBranch}"`);
    const baseSha = await getBranchSha(octokit, { owner, repo, branchName: baseBranch });
    await createBranch(octokit, { owner, repo, branchName, fromSha: baseSha });

    // ── Step 4: Commit the patched file ───────────────────────────────────
    const commitMessage = editDescription
      ? `fix: ${editDescription}`
      : `fix: patch ${filePath} for ${podName}`;

    console.log(`[GitHub] Committing to "${branchName}": ${commitMessage}`);
    await commitFile(octokit, {
      owner,
      repo,
      path: filePath,
      content: patchedContent,
      message: commitMessage,
      branch: branchName,
      fileSha: file.sha,
    });

    // ── Step 5: Open the Pull Request ─────────────────────────────────────
    const prTitle = editDescription
      ? `Fix: ${editDescription} (${podName})`
      : `Fix: auto-patch ${filePath} for ${podName}`;

    const prBody = [
      `## Automated Fix`,
      ``,
      `**Pod:** \`${podName}\``,
      `**File:** \`${filePath}\``,
      ``,
      `### Change`,
      `\`\`\`diff`,
      `- ${fix.find}`,
      `+ ${fix.replace}`,
      `\`\`\``,
      ``,
      editDescription ? `**Description:** ${editDescription}` : '',
      ``,
      `---`,
      `*Created automatically by EKS AI Dashboard*`,
    ].filter(line => line !== undefined).join('\n');

    console.log(`[GitHub] Opening PR: "${prTitle}" → ${baseBranch}`);
    const pr = await createPullRequest(octokit, {
      owner,
      repo,
      title: prTitle,
      body: prBody,
      head: branchName,
      base: baseBranch,
    });

    console.log(`[GitHub] ✅ PR #${pr.number} created: ${pr.url}`);

    return res.json({
      success: true,
      pr: {
        number: pr.number,
        url: pr.url,
        title: pr.title,
        branch: branchName,
        base: baseBranch,
        status: pr.state,
        filePath,
        patchApplied: { find: fix.find, replace: fix.replace },
      },
    });

  } catch (err) {
    console.error('[GitHub] Create PR error:', err.message);

    // ── Friendly guidance for common GitHub API errors ────────────────────
    let userError = err.message;

    if (err.status === 404 && err.message.includes('Not Found')) {
      if (err.request?.url?.includes('/git/refs') || err.request?.url?.includes('/pulls')) {
        userError = [
          'GitHub returned 404 when trying to write to the repository.',
          'This usually means your GITHUB_TOKEN does not have write access.',
          '',
          'Fix: Go to GitHub → Settings → Developer settings → Personal access tokens',
          'and make sure the token has the "repo" scope (full control of private repositories)',
          'or "public_repo" scope if the repository is public.',
        ].join('\n');
      } else {
        userError = `File or repository not found. Check that GITHUB_OWNER, GITHUB_REPO, and filePath are correct. (${err.message})`;
      }
    } else if (err.status === 401 || err.status === 403) {
      userError = `Authentication failed. Check that your GITHUB_TOKEN is valid and not expired. (${err.status})`;
    } else if (err.status === 422) {
      userError = `GitHub rejected the request (422 Unprocessable Entity). The branch may already exist, or the SHA is stale. Try again. (${err.message})`;
    }

    return res.status(err.status || 500).json({ success: false, error: userError });
  }
});

export default router;

// ── Named exports for internal use by server.js ──────────────────────────────
export {
  getOctokit,
  getGitHubConfig,
  readGitHubFile,
  applyPatch,
  getBranchSha,
  createBranch,
  commitFile,
  createPullRequest,
};
