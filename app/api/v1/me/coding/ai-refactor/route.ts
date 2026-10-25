import { NextRequest, NextResponse } from "next/server";
import { getProblemById } from "@/lib/coding-problems";
import { generateOptimalSolution } from "@/lib/dsa-solution-generator";
import type { SupportedLanguage } from "@/lib/ai-code-reviewer";

export const runtime = "nodejs";

// In-memory cache for fast O(1) response on repeated runs
const SOLUTION_CACHE = new Map<string, string>();

const CANDIDATE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-flash-latest",
  "gemini-3-flash-preview",
];

async function fetchFromGemini(
  problemTitle: string,
  problemId: number,
  description: string,
  starterCode: string,
  language: string,
  apiKey: string,
): Promise<string | null> {
  const prompt = `You are an expert LeetCode contest champion and Senior Staff Algorithm Engineer.
Write the 100% correct, optimal, working solution for Problem #${problemId}: "${problemTitle}" in ${language}.

Problem Description:
${description.slice(0, 600)}

Target Starter Code signature:
${starterCode}

Requirements:
1. Provide the complete, working, optimal algorithm (best time and space complexity).
2. Follow standard LeetCode class and function signatures.
3. Return ONLY the valid ${language} code inside a markdown code block (\`\`\`${language.toLowerCase()} ... \`\`\`).
4. Do NOT include markdown text outside the code block, and do NOT include any pleasantries or conversational comments.`;

  for (const model of CANDIDATE_MODELS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 7500);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 900,
          },
        }),
      });
      clearTimeout(timer);

      if (!res.ok) continue;

      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };

      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) continue;

      // Extract code inside triple backticks
      const codeMatch = raw.match(/```(?:[a-zA-Z0-9_+]+)?\n([\s\S]*?)```/);
      const extracted = codeMatch ? codeMatch[1].trim() : raw.trim();

      if (extracted && (extracted.includes("class Solution") || extracted.includes("def ") || extracted.includes("function") || extracted.includes("public "))) {
        return extracted;
      }
    } catch {
      // Try next model or fallback
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { problemId, language = "Python", code = "" } = body;

    if (!problemId) {
      return NextResponse.json({ error: "problemId is required" }, { status: 400 });
    }

    const problem = getProblemById(String(problemId));
    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const cacheKey = `${problem.id}_${language}`;
    if (SOLUTION_CACHE.has(cacheKey)) {
      return NextResponse.json({
        success: true,
        snippet: SOLUTION_CACHE.get(cacheKey),
        source: "cache",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let optimalSnippet: string | null = null;

    if (apiKey) {
      const starter = problem.starterCode?.[language] || problem.functionSignature || "";
      optimalSnippet = await fetchFromGemini(
        problem.title,
        problem.id,
        problem.description,
        starter,
        language,
        apiKey,
      );
    }

    // High quality algorithmic fallback if offline / API key not reachable
    if (!optimalSnippet) {
      optimalSnippet = generateOptimalSolution(
        problem,
        language as SupportedLanguage,
        code,
      );
    }

    if (optimalSnippet) {
      SOLUTION_CACHE.set(cacheKey, optimalSnippet);
    }

    return NextResponse.json({
      success: true,
      snippet: optimalSnippet,
      source: apiKey ? "ai-generated" : "synthesizer",
    });
  } catch (err: any) {
    console.error("AI Refactor API Error:", err);
    return NextResponse.json(
      { error: "Failed to generate refactored code", message: err?.message || "Internal error" },
      { status: 500 },
    );
  }
}
