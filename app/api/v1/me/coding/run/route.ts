import { NextRequest, NextResponse } from "next/server";
import { getProblemById } from "@/lib/coding-problems";
import { executeCode } from "@/lib/server-code-runner";
import { getCurrentUser } from "@/lib/server/auth";
import { db } from "@/lib/db";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { problemId, code, language = "Python", isSubmit = false } = body;

    if (!problemId) {
      return NextResponse.json({ error: "problemId is required" }, { status: 400 });
    }

    const problem = getProblemById(problemId);
    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    // If code is empty or only whitespace, return 0 test cases passed immediately with clear failure
    if (!code || typeof code !== "string" || code.trim().length === 0) {
      const activeCases = isSubmit
        ? problem.testCases
        : problem.testCases.filter((tc) => !tc.hidden);
      const cases = activeCases.length > 0 ? activeCases : problem.testCases.slice(0, 3);
      return NextResponse.json({
        success: true,
        data: {
          results: cases.map((tc) => ({
            id: tc.id,
            status: "fail",
            runtime: "0ms",
            got: "(no code executed)",
            expected: tc.output,
            input: tc.input,
            error: "No code provided. Function body is empty.",
          })),
          passCount: 0,
          total: cases.length,
          allPassed: false,
          message: "No code provided",
        },
      });
    }

    // Cap payload to 64KB for safety
    if (code.length > 65536) {
      return NextResponse.json({ error: "Code payload exceeds 64KB limit" }, { status: 413 });
    }

    // Execute code securely
    const runnerRes = await executeCode(problem, code, language, Boolean(isSubmit));

    // Async record CodeRun audit trail to DB if user is logged in
    try {
      const user = await getCurrentUser().catch(() => null);
      if (user) {
        const sourceHash = crypto.createHash("sha256").update(code).digest("hex");
        await db.codeRun.create({
          data: {
            language,
            runtimeVersion: language === "Java" ? "17.0" : language === "Python" ? "3.12" : "24.0",
            sourceHash,
            status: runnerRes.allPassed ? "PASSED" : "FAILED",
            timeLimitMs: problem.timeLimit || 2000,
            memoryLimitKb: (problem.memoryLimit || 256) * 1024,
            networkDisabled: true,
            passedCount: runnerRes.passCount,
            totalCount: runnerRes.total,
            failureCode: runnerRes.allPassed ? null : "TEST_FAILED",
          },
        }).catch(() => null);

        // When submitted in Coding Arena, create in-app notification for the active session
        if (isSubmit) {
          const { createInAppNotification } = await import("@/lib/server/notifications");
          await createInAppNotification(db, {
            userId: user.id,
            type: runnerRes.allPassed ? "CODING_ACCEPTED" : "CODING_EVALUATED",
            payload: {
              title: runnerRes.allPassed ? `Accepted: ${problem.title}` : `Coding Evaluated: ${problem.title}`,
              message: runnerRes.allPassed
                ? `All ${runnerRes.total} test cases passed. Code submitted successfully.`
                : `${runnerRes.passCount}/${runnerRes.total} test cases passed. Review failing cases and retry.`,
              screen: "coding",
            },
          }).catch(() => null);
        }
      }
    } catch (_) {
      // Non-blocking audit record
    }

    return NextResponse.json({
      success: true,
      data: runnerRes,
    });
  } catch (err: any) {
    console.error("Coding Run API Error:", err);
    return NextResponse.json(
      { error: "Internal code execution error", message: err?.message || "Execution failed" },
      { status: 500 },
    );
  }
}
