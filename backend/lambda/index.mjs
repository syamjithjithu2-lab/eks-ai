/**
 * AWS Lambda Function — EKS Incident Log Analyzer
 * 
 * Invoked via API Gateway POST /analyze
 * Calls AWS Bedrock (Claude) with incident logs and returns root cause + suggestions.
 *
 * Lambda IAM Role needs: bedrock:InvokeModel
 */

import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || "us-east-1" });

// Model to use — Claude 3 Haiku is fast and cheap; swap to Sonnet for better quality
const MODEL_ID = "anthropic.claude-3-haiku-20240307-v1:0";
// const MODEL_ID = "anthropic.claude-3-sonnet-20240229-v1:0"; // Higher quality

export const handler = async (event) => {
    // ── CORS preflight (OPTIONS request from browser/API GW) ─────────────
    if (event.httpMethod === "OPTIONS") {
        return corsResponse(200, {});
    }

    let body;
    try {
        body = JSON.parse(event.body || "{}");
    } catch {
        return corsResponse(400, { error: "Invalid JSON body" });
    }

    const { logs = [], incident = {} } = body;

    if (logs.length === 0) {
        return corsResponse(400, { error: "No logs provided. Please include pod logs in the request." });
    }

    // ── Build the prompt ──────────────────────────────────────────────────
    const logsText = logs.slice(0, 50).join("\n"); // Limit to 50 lines to control cost/latency

    const prompt = `You are an expert Kubernetes and AWS EKS Site Reliability Engineer.

A pod has triggered an incident. Analyze the following pod logs and provide:
1. A clear, concise root cause explanation (2-3 sentences)
2. 3-5 specific, actionable remediation steps

Pod Details:
- Pod: ${incident.pod || "unknown"}
- Cluster: ${incident.cluster || "unknown"}
- Namespace: ${incident.namespace || "unknown"}
- Severity: ${incident.severity || "unknown"}

Pod Logs (most recent ${logs.length} entries):
${logsText}

Respond ONLY with valid JSON in this exact format, no extra text:
{
  "answer": "Root cause explanation here",
  "suggestions": [
    "First remediation step",
    "Second remediation step",
    "Third remediation step"
  ]
}`;

    // ── Call Bedrock (Claude 3) ───────────────────────────────────────────
    const bedrockPayload = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1024,
        temperature: 0.2,
        messages: [
            {
                role: "user",
                content: prompt
            }
        ]
    };

    try {
        const command = new InvokeModelCommand({
            modelId: MODEL_ID,
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(bedrockPayload),
        });

        const response = await client.send(command);
        const rawBody = JSON.parse(new TextDecoder().decode(response.body));

        // Claude response is in rawBody.content[0].text
        const text = rawBody.content?.[0]?.text || "{}";

        // Extract JSON from the response (Claude sometimes wraps in markdown)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Model did not return valid JSON");
        }

        const parsed = JSON.parse(jsonMatch[0]);

        return corsResponse(200, {
            answer: parsed.answer || "Analysis complete. See suggestions below.",
            suggestions: parsed.suggestions || [],
        });

    } catch (err) {
        console.error("Bedrock invocation error:", err);

        // Return a graceful error the frontend can display
        return corsResponse(500, {
            answer: `Agent error: ${err.message}. Please check Lambda logs in CloudWatch for details.`,
            suggestions: ["Check CloudWatch Logs for the Lambda function", "Verify Bedrock model access is enabled in your AWS account"],
        });
    }
};

// ── Helper: Always attach CORS headers ───────────────────────────────────────
function corsResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",          // Tighten this in production
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "POST,OPTIONS",
        },
        body: JSON.stringify(body),
    };
}
