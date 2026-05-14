import { GitPullRequest, Search, GitBranch, FileDiff, Eye, Loader2, CheckCircle2, XCircle, ChevronDown, ChevronUp, ExternalLink, Bot, Zap } from 'lucide-react';
import { useState, useMemo, memo, useCallback, useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const TAG_KEYWORDS = {
    ALL: null,
    SCALING: ['scal', 'replica', 'hpa', 'autoscal', 'resize'],
    FIX: ['fix', 'oom', 'crash', 'error', 'loop', 'probe', 'restart'],
    SECURITY: ['secret', 'rbac', 'policy', 'secur', 'privilege', 'tls'],
};

const TAG_COLORS = {
    ALL: { active: 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-100', idle: 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600' },
    SCALING: { active: 'bg-amber-500 text-white border-amber-500 shadow-amber-100', idle: 'bg-white text-slate-600 border-slate-200 hover:border-amber-400 hover:text-amber-600' },
    FIX: { active: 'bg-rose-600 text-white border-rose-600 shadow-rose-100', idle: 'bg-white text-slate-600 border-slate-200 hover:border-rose-400 hover:text-rose-600' },
    SECURITY: { active: 'bg-violet-600 text-white border-violet-600 shadow-violet-100', idle: 'bg-white text-slate-600 border-slate-200 hover:border-violet-400 hover:text-violet-600' },
};

// ── Inline diff viewer ─────────────────────────────────────────────────────────
function DiffViewer({ original, patched }) {
    if (!original || !patched) return null;
    const origLines = original.split('\n');
    const patchLines = patched.split('\n');
    const maxLen = Math.max(origLines.length, patchLines.length);
    const diffs = [];
    for (let i = 0; i < maxLen; i++) {
        const o = origLines[i] ?? '';
        const p = patchLines[i] ?? '';
        if (o !== p) diffs.push({ lineNo: i + 1, removed: o, added: p });
    }
    if (diffs.length === 0) return <p className="text-xs text-emerald-600 font-bold mt-2">✓ No visible diff — content is identical.</p>;
    return (
        <div className="mt-3 rounded-xl overflow-hidden border border-slate-700 font-mono text-xs">
            {diffs.map((d, i) => (
                <div key={i}>
                    {d.removed && <div className="bg-rose-900/40 text-rose-300 px-4 py-1 whitespace-pre-wrap"><span className="opacity-50 mr-2">L{d.lineNo}</span>- {d.removed}</div>}
                    {d.added && <div className="bg-emerald-900/40 text-emerald-300 px-4 py-1 whitespace-pre-wrap"><span className="opacity-50 mr-2">L{d.lineNo}</span>+ {d.added}</div>}
                </div>
            ))}
        </div>
    );
}

// ── GitHub PR Creator Panel ────────────────────────────────────────────────────
function CreatePRPanel() {
    const [filePath, setFilePath] = useState('');
    const [findText, setFindText] = useState('');
    const [replaceText, setReplaceText] = useState('');
    const [useRegex, setUseRegex] = useState(false);
    const [podName, setPodName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [preview, setPreview] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [fileContent, setFileContent] = useState('');
    const [fileLoading, setFileLoading] = useState(false);
    const [showFile, setShowFile] = useState(false);

    const clearState = () => { setPreview(null); setResult(null); setError(''); };

    // GET /github/file
    const handleReadFile = useCallback(async () => {
        if (!filePath.trim()) { setError('File path is required.'); return; }
        clearState(); setFileLoading(true);
        try {
            const res = await fetch(`${API_BASE}/github/file?path=${encodeURIComponent(filePath.trim())}`);
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setFileContent(data.content);
            setShowFile(true);
            setError('');
        } catch (e) { setError(e.message); }
        finally { setFileLoading(false); }
    }, [filePath]);

    // POST /github/create-pr with preview=true
    const handlePreview = useCallback(async () => {
        if (!filePath.trim() || !findText.trim()) { setError('File path and Find text are required.'); return; }
        clearState(); setPreviewLoading(true);
        try {
            const res = await fetch(`${API_BASE}/github/create-pr`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filePath: filePath.trim(), fix: { find: findText, replace: replaceText, useRegex }, podName: podName || 'pod', editDescription: editDesc, preview: true }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setPreview(data);
            setError('');
        } catch (e) { setError(e.message); }
        finally { setPreviewLoading(false); }
    }, [filePath, findText, replaceText, useRegex, podName, editDesc]);

    // POST /github/create-pr (real)
    const handleSubmit = useCallback(async () => {
        if (!filePath.trim() || !findText.trim()) { setError('File path and Find text are required.'); return; }
        clearState(); setSubmitLoading(true);
        try {
            const res = await fetch(`${API_BASE}/github/create-pr`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filePath: filePath.trim(), fix: { find: findText, replace: replaceText, useRegex }, podName: podName || 'pod', editDescription: editDesc, preview: false }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setResult(data.pr);
            setPreview(null);
            setError('');
        } catch (e) { setError(e.message); }
        finally { setSubmitLoading(false); }
    }, [filePath, findText, replaceText, useRegex, podName, editDesc]);

    return (
        <div className="glass-card rounded-[2rem] md:rounded-[2.5rem] bg-white/40 p-6 md:p-8 flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0">
                    <GitBranch size={22} className="text-white" />
                </div>
                <div>
                    <h2 className="text-lg font-black text-slate-800 tracking-tight">GitHub PR Creator</h2>
                    <p className="text-[0.625rem] font-black text-indigo-500 uppercase tracking-[0.2em]">Read · Patch · Branch · PR</p>
                </div>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* File path */}
                <div className="md:col-span-2">
                    <label className="text-[0.625rem] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">File Path *</label>
                    <div className="flex gap-2">
                        <input
                            value={filePath} onChange={e => { setFilePath(e.target.value); clearState(); }}
                            placeholder="manifests/prometheus-deployment.yaml"
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-4 ring-indigo-50 transition-all"
                        />
                        <button
                            onClick={handleReadFile} disabled={fileLoading}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-black text-slate-600 transition-all disabled:opacity-50"
                        >
                            {fileLoading ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                            Preview File
                        </button>
                    </div>
                </div>

                {/* Find */}
                <div>
                    <label className="text-[0.625rem] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Find (exact / YAML-aware) *</label>
                    <input
                        value={findText} onChange={e => { setFindText(e.target.value); clearState(); }}
                        placeholder="memory: 512Mi"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-4 ring-indigo-50 transition-all font-mono"
                    />
                </div>

                {/* Replace */}
                <div>
                    <label className="text-[0.625rem] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Replace With *</label>
                    <input
                        value={replaceText} onChange={e => { setReplaceText(e.target.value); clearState(); }}
                        placeholder="memory: 1Gi"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-4 ring-indigo-50 transition-all font-mono"
                    />
                </div>

                {/* Pod name */}
                <div>
                    <label className="text-[0.625rem] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Pod Name (for branch)</label>
                    <input
                        value={podName} onChange={e => setPodName(e.target.value)}
                        placeholder="prometheus-1"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-4 ring-indigo-50 transition-all"
                    />
                </div>

                {/* Edit description */}
                <div>
                    <label className="text-[0.625rem] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Edit Description (PR title/commit)</label>
                    <input
                        value={editDesc} onChange={e => setEditDesc(e.target.value)}
                        placeholder="Increase memory limit from 512Mi to 1Gi"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-4 ring-indigo-50 transition-all"
                    />
                </div>

                {/* Regex toggle */}
                <div className="md:col-span-2 flex items-center gap-3">
                    <button
                        onClick={() => setUseRegex(v => !v)}
                        className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 ${useRegex ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${useRegex ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                    <span className="text-xs font-bold text-slate-500">Treat "Find" as a regex pattern (gm flags)</span>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={handlePreview}
                    disabled={previewLoading || submitLoading}
                    className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-indigo-200 hover:border-indigo-400 rounded-xl text-sm font-black text-indigo-700 transition-all disabled:opacity-50 active:scale-95"
                >
                    {previewLoading ? <Loader2 size={15} className="animate-spin" /> : <FileDiff size={15} />}
                    Preview Diff (Dry Run)
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={previewLoading || submitLoading}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800 rounded-xl text-sm font-black text-white shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 active:scale-95"
                >
                    {submitLoading ? <Loader2 size={15} className="animate-spin" /> : <GitPullRequest size={15} />}
                    Create Pull Request
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-2xl p-4">
                    <XCircle size={18} className="text-rose-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-rose-700 whitespace-pre-wrap">{error}</p>
                </div>
            )}

            {/* File preview */}
            {fileContent && (
                <div className="flex flex-col">
                    <button
                        onClick={() => setShowFile(v => !v)}
                        className="flex items-center gap-2 text-[0.625rem] font-black text-slate-500 uppercase tracking-widest mb-2 hover:text-indigo-600 transition-colors"
                    >
                        {showFile ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        Raw File Content ({fileContent.split('\n').length} lines)
                    </button>
                    {showFile && (
                        <div className="bg-slate-900 rounded-2xl p-5 overflow-auto max-h-64 custom-scrollbar">
                            <pre className="font-mono text-xs text-slate-300 whitespace-pre leading-relaxed">{fileContent}</pre>
                        </div>
                    )}
                </div>
            )}

            {/* Preview diff result */}
            {preview && (
                <div className="bg-slate-900 rounded-2xl p-5 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <FileDiff size={16} className="text-indigo-400" />
                        <p className="text-xs font-black text-indigo-300 uppercase tracking-widest">Diff Preview — {preview.matchCount} occurrence(s) would change</p>
                    </div>
                    <p className="text-[0.625rem] text-slate-400 font-bold">{preview.message}</p>
                    <DiffViewer original={preview.original} patched={preview.patched} />
                </div>
            )}

            {/* Success result */}
            {result && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />
                        <p className="text-sm font-black text-emerald-800">PR #{result.number} Created Successfully!</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-slate-600">
                        <div><span className="text-slate-400 font-black uppercase tracking-wider">Title: </span>{result.title}</div>
                        <div><span className="text-slate-400 font-black uppercase tracking-wider">Branch: </span><span className="font-mono">{result.branch}</span></div>
                        <div><span className="text-slate-400 font-black uppercase tracking-wider">Base: </span>{result.base}</div>
                        <div><span className="text-slate-400 font-black uppercase tracking-wider">Status: </span>{result.status}</div>
                    </div>
                    <a
                        href={result.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                        <ExternalLink size={13} /> Open on GitHub
                    </a>
                </div>
            )}
        </div>
    );
}

// ── PR Hub ─────────────────────────────────────────────────────────────────────
const PRHub = memo(({ prs = [], setActivePage }) => {
    const [search, setSearch] = useState('');
    const [activeTag, setActiveTag] = useState('ALL');
    const [autoPrBanner, setAutoPrBanner] = useState(null); // latest auto-PR for toast
    const prevPrsRef = useRef(prs);

    // Detect newly-arriving auto-created PRs and show a banner
    useEffect(() => {
        const prev = prevPrsRef.current;
        const newAuto = prs.find(
            pr => pr.autoCreated && pr.url && !prev.find(p => p.id === pr.id && p.url)
        );
        if (newAuto) setAutoPrBanner(newAuto);
        prevPrsRef.current = prs;
    }, [prs]);

    const filteredPrs = useMemo(() => {
        const keywords = TAG_KEYWORDS[activeTag];
        return prs.filter(pr => {
            const titleLower = pr.title?.toLowerCase() || '';
            const clusterLower = pr.cluster?.toLowerCase() || '';
            const matchesSearch = !search || titleLower.includes(search.toLowerCase()) || clusterLower.includes(search.toLowerCase());
            const matchesTag = !keywords || keywords.some(kw => titleLower.includes(kw));
            return matchesSearch && matchesTag;
        });
    }, [prs, search, activeTag]);

    const getPrNumber = useMemo(() => {
        const map = new Map();
        prs.forEach((pr, i) => { if (pr.id) map.set(pr.id, 100 + (i % 900)); });
        return (pr, i) => pr.id ? (map.get(pr.id) ?? 100 + i) : (100 + i);
    }, [prs]);

    return (
        <div className="p-4 md:p-8 min-h-full flex flex-col gap-6 md:gap-8">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Pull Requests</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Autonomous remediations and optimizations</p>
                </div>
                <div className="bg-white/80 border border-slate-300 py-2 px-4 md:px-5 rounded-xl shadow-sm flex items-center gap-3">
                    <span className="text-[0.625rem] font-black text-slate-800 uppercase tracking-widest">{filteredPrs.length} / {prs.length} PRs</span>
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                </div>
            </div>

            {/* GitHub PR Creator */}
            <CreatePRPanel />

            {/* Auto-PR success banner */}
            {autoPrBanner && (
                <div className="flex items-center gap-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 shadow-lg shadow-emerald-100/50 animate-in slide-in-from-top-2 duration-500">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <Bot size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-emerald-800">🤖 Auto-PR Created on GitHub!</p>
                        <p className="text-xs font-bold text-emerald-600 truncate mt-0.5">{autoPrBanner.title}</p>
                    </div>
                    {autoPrBanner.url && (
                        <a href={autoPrBanner.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition-all flex-shrink-0">
                            <ExternalLink size={12} /> View PR
                        </a>
                    )}
                    <button onClick={() => setAutoPrBanner(null)}
                        className="text-emerald-400 hover:text-emerald-600 transition-colors flex-shrink-0 text-lg font-black leading-none">&times;</button>
                </div>
            )}

            {/* PR List card */}
            <div className="glass-card rounded-[2rem] md:rounded-[2.5rem] flex-1 flex flex-col overflow-hidden bg-white/40">
                {/* Search + filter bar */}
                <div className="p-4 md:p-6 border-b border-slate-100 flex flex-wrap items-center gap-3 bg-white/20">
                    <div className="flex items-center gap-3 bg-white/80 border border-slate-200 rounded-xl px-4 py-2.5 flex-1 min-w-[12rem] max-w-md shadow-sm focus-within:ring-4 ring-indigo-50 transition-all">
                        <Search size={16} className="text-slate-400 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Search by cluster, title..."
                            className="bg-transparent outline-none text-xs font-bold text-slate-800 placeholder-slate-400 w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {Object.keys(TAG_KEYWORDS).map(tag => {
                            const isActive = activeTag === tag;
                            const tc = TAG_COLORS[tag];
                            return (
                                <button
                                    key={tag}
                                    onClick={() => setActiveTag(tag)}
                                    className={`px-3 md:px-4 py-2 text-[0.625rem] font-black rounded-lg border transition-all uppercase tracking-wider shadow-sm ${isActive ? tc.active + ' shadow-lg' : tc.idle}`}
                                >
                                    {tag}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* PR list */}
                <div className="flex-1 overflow-auto p-4 md:p-8 custom-scrollbar">
                    {filteredPrs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40 gap-4">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                                <GitPullRequest size={36} className="text-slate-400" />
                            </div>
                            <div>
                                <p className="text-xl font-black text-slate-800 uppercase tracking-widest">
                                    {activeTag !== 'ALL' ? `No "${activeTag}" PRs` : 'No Pull Requests'}
                                </p>
                                <p className="text-sm font-medium text-slate-500 mt-2 max-w-[18.75rem] mx-auto">
                                    {activeTag !== 'ALL' ? 'Try a different filter tag.' : 'The AI fleet is analyzing. Optimizations appear here.'}
                                </p>
                            </div>
                            {activeTag !== 'ALL' && (
                                <button
                                    onClick={() => setActiveTag('ALL')}
                                    className="text-[0.625rem] font-black text-indigo-600 border border-indigo-200 px-4 py-2 rounded-xl hover:bg-indigo-50 transition-all"
                                >
                                    Clear Filter
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredPrs.map((pr, i) => {
                                const isAuto = !!pr.autoCreated;
                                const isPending = pr.status === 'Creating PR…';
                                return (
                                    <div key={pr.id || i}
                                        className={`border rounded-2xl p-4 md:p-6 transition-all duration-300 group cursor-default flex items-center gap-4 md:gap-6 ${
                                            isAuto
                                                ? 'bg-orange-50/80 border-orange-200 hover:bg-orange-50 hover:shadow-xl hover:shadow-orange-50/50'
                                                : 'bg-white/80 border-slate-200 hover:bg-white hover:shadow-xl hover:shadow-indigo-50/50'
                                        }`}>
                                        {/* Icon */}
                                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center border group-hover:scale-110 transition-transform flex-shrink-0 ${
                                            isAuto ? 'bg-orange-100 border-orange-200' : 'bg-indigo-50 border-indigo-100'
                                        }`}>
                                            {isAuto
                                                ? <Bot size={20} className={isPending ? 'text-orange-400 animate-pulse' : 'text-orange-600'} />
                                                : <GitPullRequest size={20} className="text-indigo-600" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                <span className={`text-[0.5rem] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                                    isAuto ? 'bg-orange-500 text-white' : 'bg-indigo-600 text-white'
                                                }`}>#{getPrNumber(pr, i)}</span>

                                                {isAuto && (
                                                    <span className="flex items-center gap-1 text-[0.5rem] font-black px-2 py-0.5 bg-orange-100 text-orange-700 border border-orange-200 rounded-full uppercase tracking-wider">
                                                        <Zap size={8} /> Auto-Fixed
                                                    </span>
                                                )}

                                                <span className="text-[0.625rem] font-black text-slate-400 uppercase tracking-widest">{pr.cluster}</span>

                                                <div className="flex items-center gap-1.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
                                                    <span className="text-[0.625rem] font-bold text-slate-400 uppercase tracking-widest">{pr.status}</span>
                                                </div>

                                                {pr.url && (
                                                    <a href={pr.url} target="_blank" rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-[0.625rem] font-black text-indigo-500 hover:text-indigo-700 transition-colors">
                                                        <ExternalLink size={10} /> GitHub #{pr.number}
                                                    </a>
                                                )}
                                            </div>

                                            <h3 className={`text-sm md:text-base font-black tracking-tight leading-tight transition-colors ${
                                                isAuto
                                                    ? 'text-orange-900 group-hover:text-orange-700'
                                                    : 'text-slate-800 group-hover:text-indigo-600'
                                            }`}>{pr.title}</h3>

                                            {/* Auto-PR details row */}
                                            {isAuto && pr.fix && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="font-mono text-[0.6rem] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md border border-rose-200">{pr.fix.from}</span>
                                                    <span className="text-[0.6rem] text-slate-400 font-black">→</span>
                                                    <span className="font-mono text-[0.6rem] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">{pr.fix.to}</span>
                                                    {pr.filePath && <span className="text-[0.6rem] text-slate-400 font-mono truncate max-w-[12rem]">{pr.filePath}</span>}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 md:gap-8 flex-shrink-0">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-[0.5625rem] font-black text-slate-400 uppercase tracking-widest mb-0.5">IMPACT</p>
                                                <p className="text-base md:text-xl font-black text-emerald-600 tracking-tighter">{pr.savings}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default PRHub;
