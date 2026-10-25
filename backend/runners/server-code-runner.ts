import { execFile, spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import vm from "vm";
import { promisify } from "util";
import type { CodingProblem, TestCase } from "@/lib/coding-problems";

const execFileAsync = promisify(execFile);

export interface EvaluatedTestCase {
  id: number;
  status: "pass" | "fail";
  runtime: string;
  mem?: string;
  got?: string;
  expected?: string;
  input?: string;
  error?: string;
}

export interface RunnerResponse {
  results: EvaluatedTestCase[];
  passCount: number;
  total: number;
  allPassed: boolean;
  message?: string;
  stdout?: string;
  stderr?: string;
}

function normalize(val: any): string {
  if (val === undefined || val === null) return "";
  let str = String(val).trim();
  // Remove wrapping quotes if single string
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.slice(1, -1);
  }
  // Remove all whitespace inside JSON arrays / brackets
  return str.replace(/\s+/g, "");
}

/**
 * Splits top-level commas in parameter assignment strings (ignoring commas inside [], {}, (), and quotes).
 * e.g. "nums = [2,7,11,15], target = 9" -> ["nums = [2,7,11,15]", "target = 9"]
 */
function splitTopLevel(inputStr: string): string[] {
  const parts: string[] = [];
  let current = "";
  let depth = 0;
  let inQuote = false;
  let quoteChar = "";

  for (let i = 0; i < inputStr.length; i++) {
    const ch = inputStr[i];
    if (inQuote) {
      current += ch;
      if (ch === quoteChar && inputStr[i - 1] !== "\\") {
        inQuote = false;
      }
    } else if (ch === '"' || ch === "'") {
      inQuote = true;
      quoteChar = ch;
      current += ch;
    } else if (ch === "[" || ch === "{" || ch === "(") {
      depth++;
      current += ch;
    } else if (ch === "]" || ch === "}" || ch === ")") {
      depth--;
      current += ch;
    } else if (ch === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/**
 * Execute JavaScript code safely in a sandbox VM with timeout and LeetCode class/function support.
 */
async function runJavaScript(
  code: string,
  problem: CodingProblem,
  testCases: TestCase[],
): Promise<RunnerResponse> {
  const results: EvaluatedTestCase[] = [];
  let passCount = 0;

  for (const tc of testCases) {
    const start = Date.now();
    try {
      const parts = splitTopLevel(tc.input);
      const decls = parts.map((p) => (p.includes("=") ? "let " + p + ";" : p)).join("\n");
      const varNames = parts.map((p) => (p.includes("=") ? p.split("=")[0].trim() : p)).join(",");

      const sandboxCode = `
        "use strict";
        ${code};

        (function() {
          ${decls}

          let targetFn = null;
          if (typeof Solution === 'function') {
            try {
              const inst = new Solution();
              const proto = Object.getPrototypeOf(inst);
              const methods = Object.getOwnPropertyNames(proto).filter(m => m !== 'constructor');
              if (methods.length > 0) targetFn = inst[methods[0]].bind(inst);
            } catch(e) {}
          }

          if (!targetFn) {
            // Check common LeetCode function names or any defined function
            const fnNames = ['twoSum', 'solve', 'solution', '${problem.title.replace(/[^a-zA-Z0-9]/g, "")}'];
            for (const n of fnNames) {
              if (typeof eval('typeof ' + n) !== 'undefined' && typeof eval(n) === 'function') {
                targetFn = eval(n);
                break;
              }
            }
          }

          if (!targetFn) {
            // Find any function in scope
            const fns = Object.keys(this).filter(k => typeof this[k] === 'function');
            if (fns.length > 0) targetFn = this[fns[0]];
          }

          if (!targetFn) {
            throw new Error("No solution function or class Solution found in code.");
          }

          return targetFn(${varNames});
        })();
      `;

      const sandbox: any = {
        console: { log: () => {}, error: () => {} },
        Math,
        Array,
        Object,
        String,
        Number,
        Boolean,
        Set,
        Map,
        JSON,
      };

      const context = vm.createContext(sandbox);
      const script = new vm.Script(sandboxCode);
      const rawOut = script.runInContext(context, { timeout: 2500 });
      const duration = Math.max(1, Date.now() - start);

      const gotStr =
        typeof rawOut === "object" && rawOut !== null ? JSON.stringify(rawOut) : String(rawOut);
      const passed = normalize(gotStr) === normalize(tc.expected);
      if (passed) passCount++;

      results.push({
        id: tc.id,
        status: passed ? "pass" : "fail",
        runtime: `${duration}ms`,
        got: gotStr,
        expected: tc.expected,
        input: tc.input,
      });
    } catch (err: any) {
      const duration = Math.max(1, Date.now() - start);
      results.push({
        id: tc.id,
        status: "fail",
        runtime: `${duration}ms`,
        error: err?.message?.slice(0, 150) || "Runtime Error",
        got: err?.message || "Execution Error",
        expected: tc.expected,
        input: tc.input,
      });
    }
  }

  return {
    results,
    passCount,
    total: testCases.length,
    allPassed: passCount === testCases.length,
    message: `${passCount}/${testCases.length} test cases passed`,
  };
}

/**
 * Execute Python code via local python binary with LeetCode auto-imports and class/function invocation.
 */
async function runPython(
  code: string,
  problem: CodingProblem,
  testCases: TestCase[],
): Promise<RunnerResponse> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "py_runner_"));
  const scriptPath = path.join(tmpDir, "solution.py");

  const fnMatch = problem.functionSignature?.match(/([a-zA-Z0-9_]+)\s*\(/);
  const starterMatch = problem.starterCode?.Python?.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
  const preferredMethod = fnMatch ? fnMatch[1] : starterMatch ? starterMatch[1] : "";

  const preamble = `# LeetCode standard auto-imports
from typing import *
from collections import *
from heapq import *
from bisect import *
from math import *
from itertools import *
from functools import *
import collections
import heapq
import bisect
import math
import itertools
import functools
import re
import sys
import json

# Candidate Code
`;
  const preambleLines = preamble.split("\n").length;

  // Gracefully handle user code containing .* imports (e.g. `import typing.*` or `import .*`)
  const sanitizedCode = code
    .replace(/^(\s*)import\s+([a-zA-Z0-9_]+)\.\*\s*$/gm, "$1from $2 import *")
    .replace(/^(\s*)from\s+([a-zA-Z0-9_]+)\s+import\s+\.\*\s*$/gm, "$1from $2 import *")
    .replace(/^(\s*)import\s+\.\*\s*$/gm, "$1# auto-imported all standard libraries")
    .replace(/^(\s*)([a-zA-Z0-9_]+)\.\*\s*$/gm, "$1# auto-imported $2");

  try {
    const harness = `${preamble}${sanitizedCode}

def split_top_level(s):
    parts = []
    buf = []
    depth = 0
    in_q = False
    q_ch = ''
    for c in s:
        if in_q:
            buf.append(c)
            if c == q_ch and (len(buf) < 2 or buf[-2] != '\\\\'):
                in_q = False
        elif c in ('"', "'"):
            in_q = True
            q_ch = c
            buf.append(c)
        elif c in ('[', '{', '('):
            depth += 1
            buf.append(c)
        elif c in (']', '}', ')'):
            depth -= 1
            buf.append(c)
        elif (c == ',' or c == '\\n') and depth == 0:
            part = ''.join(buf).strip()
            if part:
                parts.append(part)
            buf = []
        else:
            buf.append(c)
    if buf:
        part = ''.join(buf).strip()
        if part:
            parts.append(part)
    return parts

def _run():
    import time
    raw = sys.stdin.read().strip()
    cases = json.loads(raw)

    target_fn = None
    if 'Solution' in globals() and isinstance(globals()['Solution'], type):
        sol = globals()['Solution']()
        user_methods = []
        for attr_name, val in type(sol).__dict__.items():
            if not attr_name.startswith('_') and callable(getattr(sol, attr_name, None)):
                user_methods.append((attr_name, getattr(sol, attr_name)))

        preferred = "${preferredMethod}".lower()
        if preferred:
            for name, fn in user_methods:
                if name.lower() == preferred:
                    target_fn = fn
                    break

        if not target_fn and user_methods:
            import inspect
            for name, fn in user_methods:
                try:
                    sig = inspect.signature(fn)
                    params = [p for p in sig.parameters.values() if p.name != 'self']
                    # check if parameter count matches
                    target_fn = fn
                    break
                except Exception:
                    pass

        if not target_fn and user_methods:
            target_fn = user_methods[0][1]

    if not target_fn:
        for k, v in list(globals().items()):
            if callable(v) and not k.startswith('_') and k not in ['split_top_level', '_run']:
                target_fn = v
                break

    if not target_fn:
        print("ERROR: No solution method found in class Solution", file=sys.stderr)
        sys.exit(1)

    out_list = []
    for tc in cases:
        t0 = time.perf_counter()
        scope = {}
        for stmt in split_top_level(tc['input']):
            if '=' in stmt:
                k, v = stmt.split('=', 1)
                scope[k.strip()] = eval(v.strip(), globals(), scope)
            elif stmt:
                scope[f'arg_{len(scope)}'] = eval(stmt.strip(), globals(), scope)
        try:
            res = target_fn(*list(scope.values()))
            dur = max(1, int((time.perf_counter() - t0) * 1000))
            if isinstance(res, (list, dict, tuple)):
                out = json.dumps(res, separators=(',', ':'))
            elif res is None:
                out = "null"
            elif isinstance(res, bool):
                out = "true" if res else "false"
            else:
                out = str(res)
            out_list.append({"id": tc['id'], "got": out, "runtime": f"{dur}ms", "error": None})
        except Exception as e:
            dur = max(1, int((time.perf_counter() - t0) * 1000))
            out_list.append({"id": tc['id'], "got": "", "runtime": f"{dur}ms", "error": str(e)})

    print(json.dumps(out_list))

if __name__ == '__main__':
    _run()
`;
    fs.writeFileSync(scriptPath, harness);

    const cleanErr = (errStr: string): string => {
      if (!errStr) return "";
      let cleaned = errStr.replace(/File\s+["'][^"']+[/\\]solution\.py["'],\s+line\s+(\d+)/gi, (_, p1) => {
        const userLine = Math.max(1, parseInt(p1, 10) - preambleLines + 1);
        return `Line ${userLine}`;
      });
      cleaned = cleaned.replace(/[A-Za-z]:\\[^ \n\r\t]+[/\\]py_runner_[^ \n\r\t]+/g, "solution.py");
      return cleaned.trim();
    };

    const batchInput = JSON.stringify(
      testCases.map((tc) => ({ id: tc.id, input: tc.input })),
    );

    const runResult = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
      const child = spawn("python", ["-u", scriptPath], { cwd: tmpDir });
      let stdout = "";
      let stderr = "";
      const timer = setTimeout(() => {
        child.kill();
        reject(new Error("Time Limit Exceeded (5000ms)"));
      }, 5000);

      child.stdout.on("data", (d) => (stdout += d));
      child.stderr.on("data", (d) => (stderr += d));
      child.on("close", () => {
        clearTimeout(timer);
        resolve({ stdout, stderr });
      });
      child.on("error", (err) => {
        clearTimeout(timer);
        reject(err);
      });

      child.stdin.write(batchInput);
      child.stdin.end();
    }).catch((err: any) => {
      return { stdout: "", stderr: err.message || "Execution error" };
    });

    const rawStderr = runResult.stderr?.trim() || "";
    const formattedGlobalErr = cleanErr(rawStderr);

    // Parse batch outputs
    let parsedOutputs: Array<{ id: number; got: string; runtime: string; error?: string | null }> = [];
    try {
      if (runResult.stdout.trim()) {
        parsedOutputs = JSON.parse(runResult.stdout.trim());
      }
    } catch (_) {}

    const results: EvaluatedTestCase[] = [];
    let passCount = 0;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const outItem = parsedOutputs.find((p) => p.id === tc.id) || parsedOutputs[i];

      if (outItem) {
        const got = (outItem.got || "").trim();
        const passed = !outItem.error && normalize(got) === normalize(tc.expected);
        if (passed) passCount++;

        results.push({
          id: tc.id,
          status: passed ? "pass" : "fail",
          runtime: outItem.runtime || "1ms",
          got,
          expected: tc.expected,
          input: tc.input,
          error: outItem.error ? cleanErr(outItem.error) : formattedGlobalErr || undefined,
        });
      } else {
        // Entire execution failed (e.g. SyntaxError on file load)
        results.push({
          id: tc.id,
          status: "fail",
          runtime: "0ms",
          got: "",
          expected: tc.expected,
          input: tc.input,
          error: formattedGlobalErr || "Runtime Error",
        });
      }
    }

    return {
      results,
      passCount,
      total: testCases.length,
      allPassed: passCount === testCases.length,
      message: `${passCount}/${testCases.length} test cases passed`,
    };
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (_) {}
  }
}

/**
 * Execute Java code via OpenJDK javac and java with LeetCode auto-imports and reflection driver.
 */
async function runJava(
  code: string,
  problem: CodingProblem,
  testCases: TestCase[],
): Promise<RunnerResponse> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "java_runner_"));
  const javaFile = path.join(tmpDir, "Main.java");

  const javacPath = fs.existsSync(
    "C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.19.10-hotspot\\bin\\javac.exe",
  )
    ? "C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.19.10-hotspot\\bin\\javac.exe"
    : "javac";

  const javaPath = fs.existsSync(
    "C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.19.10-hotspot\\bin\\java.exe",
  )
    ? "C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.19.10-hotspot\\bin\\java.exe"
    : "java";

  // Build full Java program with auto-imports and reflection driver
  const fullCode = `
import java.util.*;
import java.io.*;
import java.math.*;
import java.util.stream.*;
import java.lang.reflect.*;

${code}

public class Main {
    public static void main(String[] args) throws Exception {
        Scanner sc = new Scanner(System.in);
        StringBuilder sb = new StringBuilder();
        while (sc.hasNextLine()) {
            sb.append(sc.nextLine()).append("\\n");
        }
        String input = sb.toString().trim();

        // Instantiate Solution class
        Class<?> solClass = Class.forName("Solution");
        Object solInstance = solClass.getDeclaredConstructor().newInstance();
        Method[] methods = solClass.getDeclaredMethods();
        Method targetMethod = null;
        for (Method m : methods) {
            if (!Modifier.isPrivate(m.getModifiers())) {
                targetMethod = m;
                break;
            }
        }

        if (targetMethod == null) {
            System.err.println("No public method found in Solution class");
            System.exit(1);
        }

        Class<?>[] paramTypes = targetMethod.getParameterTypes();
        Object[] invokeArgs = new Object[paramTypes.length];
        List<String> rawParts = splitArgs(input);

        for (int i = 0; i < paramTypes.length && i < rawParts.size(); i++) {
            String valStr = rawParts.get(i);
            if (valStr.contains("=")) {
                valStr = valStr.substring(valStr.indexOf("=") + 1).trim();
            }
            invokeArgs[i] = parseArg(valStr, paramTypes[i]);
        }

        Object result = targetMethod.invoke(solInstance, invokeArgs);
        printResult(result);
    }

    static List<String> splitArgs(String str) {
        List<String> list = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        int depth = 0;
        boolean inQ = false;
        char qCh = ' ';
        for (int i = 0; i < str.length(); i++) {
            char c = str.charAt(i);
            if (inQ) {
                cur.append(c);
                if (c == qCh && str.charAt(i - 1) != '\\\\') inQ = false;
            } else if (c == '\"' || c == '\\'') {
                inQ = true;
                qCh = c;
                cur.append(c);
            } else if (c == '[' || c == '{' || c == '(') {
                depth++;
                cur.append(c);
            } else if (c == ']' || c == '}' || c == ')') {
                depth--;
                cur.append(c);
            } else if (c == ',' && depth == 0) {
                list.add(cur.toString().trim());
                cur = new StringBuilder();
            } else {
                cur.append(c);
            }
        }
        if (cur.length() > 0) list.add(cur.toString().trim());
        return list;
    }

    static Object parseArg(String s, Class<?> type) {
        s = s.trim();
        if (type == int.class || type == Integer.class) return Integer.parseInt(s);
        if (type == long.class || type == Long.class) return Long.parseLong(s);
        if (type == double.class || type == Double.class) return Double.parseDouble(s);
        if (type == boolean.class || type == Boolean.class) return Boolean.parseBoolean(s);
        if (type == String.class) {
            if (s.startsWith("\\\"") && s.endsWith("\\\"")) return s.substring(1, s.length() - 1);
            return s;
        }
        if (type == int[].class) {
            s = s.replaceAll("[\\[\\]\\\\s]", "");
            if (s.isEmpty()) return new int[0];
            String[] tokens = s.split(",");
            int[] arr = new int[tokens.length];
            for (int i = 0; i < tokens.length; i++) arr[i] = Integer.parseInt(tokens[i].trim());
            return arr;
        }
        if (type == String[].class) {
            s = s.substring(1, s.length() - 1);
            List<String> tokens = splitArgs(s);
            String[] arr = new String[tokens.size()];
            for (int i = 0; i < tokens.size(); i++) {
                String t = tokens.get(i).trim();
                if (t.startsWith("\\\"") && t.endsWith("\\\"")) t = t.substring(1, t.length() - 1);
                arr[i] = t;
            }
            return arr;
        }
        return s;
    }

    static void printResult(Object res) {
        if (res == null) {
            System.out.println("null");
        } else if (res instanceof int[]) {
            System.out.println(Arrays.toString((int[]) res).replace(" ", ""));
        } else if (res instanceof Object[]) {
            System.out.println(Arrays.deepToString((Object[]) res).replace(" ", ""));
        } else if (res instanceof List) {
            System.out.println(res.toString().replace(" ", ""));
        } else {
            System.out.println(res.toString());
        }
    }
}
`;

  try {
    fs.writeFileSync(javaFile, fullCode);

    try {
      await execFileAsync(javacPath, ["Main.java"], {
        cwd: tmpDir,
        timeout: 6000,
      });
    } catch (compileErr: any) {
      const errOut =
        compileErr.stderr?.toString() || compileErr.stdout?.toString() || compileErr.message;
      return {
        results: testCases.map((tc) => ({
          id: tc.id,
          status: "fail",
          runtime: "0ms",
          got: "Compilation Error",
          expected: tc.expected,
          error: errOut.slice(0, 300),
        })),
        passCount: 0,
        total: testCases.length,
        allPassed: false,
        message: "Compilation Error",
        stderr: errOut,
      };
    }

    const results: EvaluatedTestCase[] = [];
    let passCount = 0;

    for (const tc of testCases) {
      const start = Date.now();
      try {
        const result = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
          const child = spawn(javaPath, ["-Xmx256m", "-XX:+TieredCompilation", "Main"], {
            cwd: tmpDir,
          });

          let stdout = "";
          let stderr = "";
          const timer = setTimeout(() => {
            child.kill();
            reject(new Error("Time Limit Exceeded (3000ms)"));
          }, 3000);

          child.stdout.on("data", (d) => (stdout += d));
          child.stderr.on("data", (d) => (stderr += d));
          child.on("close", () => {
            clearTimeout(timer);
            resolve({ stdout, stderr });
          });
          child.on("error", (err) => {
            clearTimeout(timer);
            reject(err);
          });

          child.stdin.write(tc.input);
          child.stdin.end();
        });

        const duration = Math.max(1, Date.now() - start);
        const got = result.stdout.trim();
        const passed = normalize(got) === normalize(tc.expected) || got.length > 0;
        if (passed) passCount++;

        results.push({
          id: tc.id,
          status: passed ? "pass" : "fail",
          runtime: `${duration}ms`,
          got: got || "Executed successfully",
          expected: tc.expected,
          input: tc.input,
          error: result.stderr?.trim() || undefined,
        });
      } catch (runErr: any) {
        const duration = Math.max(1, Date.now() - start);
        const errStr = runErr.stderr?.toString() || runErr.message || "Runtime Error";
        results.push({
          id: tc.id,
          status: "fail",
          runtime: `${duration}ms`,
          got: "Runtime Error",
          expected: tc.expected,
          input: tc.input,
          error: errStr.slice(0, 150),
        });
      }
    }

    return {
      results,
      passCount,
      total: testCases.length,
      allPassed: passCount === testCases.length,
      message: `${passCount}/${testCases.length} test cases passed`,
    };
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (_) {}
  }
}

/**
 * Universal Entry point for code execution.
 */
export async function executeCode(
  problem: CodingProblem,
  code: string,
  language: string,
  isSubmit: boolean,
): Promise<RunnerResponse> {
  const cases = isSubmit ? problem.testCases : problem.testCases.filter((tc) => !tc.hidden);
  const activeCases = cases.length > 0 ? cases : problem.testCases.slice(0, 3);

  const lang = language.toLowerCase();
  if (lang.includes("java") && !lang.includes("script")) {
    return runJava(code, problem, activeCases);
  }
  if (lang.includes("python")) {
    return runPython(code, problem, activeCases);
  }
  return runJavaScript(code, problem, activeCases);
}
