import type { CodingProblem } from "./coding-problems";
import type { EvaluatedTestCase } from "./code-evaluator";
import { generateOptimalSolution } from "./dsa-solution-generator";

export type SupportedLanguage = "Python" | "Java" | "JavaScript" | "C++";

export interface AICodeReviewData {
  overallScore: number;
  correctnessScore: number;
  codeQualityScore: number;
  readabilityScore: number;
  complexityScore: number;
  timeComplexity: string;
  spaceComplexity: string;
  isTimeOptimal: boolean;
  isSpaceOptimal: boolean;
  timeBigO: string;
  spaceBigO: string;
  timeLabel: string;
  spaceLabel: string;
  strengths: string[];
  suggestions: string[];
  refactoredSnippet: string;
}

/**
 * Checks if the submitted code is empty, comments-only, or merely starter boilerplate.
 */
function isCodeEmptyOrPlaceholder(code: string): boolean {
  if (!code || !code.trim()) return true;

  // Strip multi-line comments and docstrings
  const stripped = code
    .replace(/"""[\s\S]*?"""/g, "")
    .replace(/'''[\s\S]*?'''/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");

  const lines = stripped
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => {
      if (!l) return false;
      if (l.startsWith("#") || l.startsWith("//") || l.startsWith("*")) return false;
      if (/^(import|from)\b/.test(l)) return false;
      if (/^(package|using)\b/.test(l)) return false;
      return true;
    });

  if (lines.length === 0) return true;

  // Filter out class/method headers, single return null/pass, braces
  const substantiveLines = lines.filter((l) => {
    if (/^(class\s+|public\s+class\s+|def\s+|var\s+solution|function\b|public\s+|public:)/.test(l)) return false;
    if (/^(pass|return\s*(null|0|false|true|\[\]|\{\}|""|'')?;?)$/.test(l)) return false;
    if (l === "{" || l === "}" || l === "};") return false;
    return true;
  });

  return substantiveLines.length === 0;
}

/**
 * Generates an accurate, professional AI code review with multi-metric scoring.
 * Heavily prioritizes Correctness (40%) and Code Quality (30%), then Time/Space Complexity (20%) and Readability (10%).
 */
export function generateAICodeReview(
  problem: CodingProblem,
  code: string,
  language: SupportedLanguage,
  results: EvaluatedTestCase[] | null,
  passCount: number,
  totalCount: number,
): AICodeReviewData {
  const codeTrimmed = code.trim();
  const isEmpty = isCodeEmptyOrPlaceholder(codeTrimmed);

  const hasSyntaxError = Boolean(
    results?.some(
      (r) =>
        r.error &&
        (r.error.includes("SyntaxError") ||
          r.error.includes("unmatched") ||
          r.error.includes("Compile") ||
          r.error.includes("invalid syntax")),
    ),
  );
  const hasRuntimeError = Boolean(
    results?.some(
      (r) => r.error && (r.error.includes("Error") || r.error.includes("Exception")),
    ),
  );
  const allPassed = totalCount > 0 && passCount === totalCount;

  // Determine if there is any working / correct code
  const hasNoCorrectCode = isEmpty || passCount === 0 || hasSyntaxError;

  // --------------------------------------------------------------------------
  // 1. Time & Space Complexity Extraction
  // --------------------------------------------------------------------------
  let timeBigO = "N/A";
  let timeLabel = "No Code";
  let isTimeOptimal = false;

  let spaceBigO = "N/A";
  let spaceLabel = "No Code";
  let isSpaceOptimal = false;

  if (!hasNoCorrectCode) {
    // Strip import lines and comments before pattern analysis so boilerplate imports don't fake algorithms
    const algorithmicLines = code
      .split("\n")
      .filter((l) => !/^(import|from|#|\/\/|\/\*|\*)\b/.test(l.trim()))
      .join("\n");
    const lowerAlgo = algorithmicLines.toLowerCase();

    // Loop analysis on algorithmic code
    const loopMatches = algorithmicLines.match(/\b(for|while)\b/g) || [];
    const loopCount = loopMatches.length;

    // Check for nested loops
    const hasNestedLoops =
      /(for|while)[\s\S]*?(for|while)/.test(algorithmicLines) &&
      (algorithmicLines.includes("    for ") ||
        algorithmicLines.includes("\tfor ") ||
        algorithmicLines.includes("    while ") ||
        algorithmicLines.includes("\twhile ") ||
        algorithmicLines.includes("for (") ||
        algorithmicLines.includes("while ("));

    // Check for binary search
    const hasBinarySearch =
      (lowerAlgo.includes("low <") ||
        lowerAlgo.includes("left <") ||
        lowerAlgo.includes("low <=") ||
        lowerAlgo.includes("left <=")) &&
      (lowerAlgo.includes("mid =") ||
        lowerAlgo.includes("mid=") ||
        lowerAlgo.includes("// 2") ||
        lowerAlgo.includes("bisect"));

    // Check for sorting
    const hasSorting =
      lowerAlgo.includes(".sort(") ||
      lowerAlgo.includes("sorted(") ||
      lowerAlgo.includes("arrays.sort") ||
      lowerAlgo.includes("sort(nums");

    // Check for recursion
    const hasRecursion = /\b(def|function)\s+([a-zA-Z0-9_]+)[\s\S]*?\b\2\s*\(/.test(
      algorithmicLines,
    );

    // Check memory allocation
    const usesMapOrSet =
      lowerAlgo.includes("set(") ||
      lowerAlgo.includes("dict(") ||
      lowerAlgo.includes("new set") ||
      lowerAlgo.includes("new map") ||
      lowerAlgo.includes("hashmap") ||
      lowerAlgo.includes("unordered_map") ||
      lowerAlgo.includes("unordered_set") ||
      lowerAlgo.includes("defaultdict") ||
      lowerAlgo.includes("counter(") ||
      lowerAlgo.includes("seen =");

    const usesAuxiliaryArray =
      lowerAlgo.includes("dp = [") ||
      lowerAlgo.includes("new int[") ||
      lowerAlgo.includes("vector<int>") ||
      lowerAlgo.includes("res = []") ||
      lowerAlgo.includes("result = []") ||
      lowerAlgo.includes("new array(");

    // Problem-specific optimizations (e.g. #279 Perfect Squares)
    if (problem.id === 279 || problem.title.toLowerCase().includes("perfect square")) {
      if (
        lowerAlgo.includes("math.isqrt") &&
        (lowerAlgo.includes("% 8 == 7") || lowerAlgo.includes("while temp % 4 == 0"))
      ) {
        timeBigO = "O(√n)";
        timeLabel = "Optimal (Legendre's Theorem)";
        isTimeOptimal = true;
        spaceBigO = "O(1)";
        spaceLabel = "Constant";
        isSpaceOptimal = true;
      } else if (hasNestedLoops) {
        timeBigO = "O(n·√n)";
        timeLabel = "Optimal DP";
        isTimeOptimal = true;
        spaceBigO = "O(n)";
        spaceLabel = "Auxiliary DP Table";
        isSpaceOptimal = true;
      } else {
        timeBigO = "O(n)";
        timeLabel = "Linear Search";
        isTimeOptimal = false;
        spaceBigO = "O(n)";
        spaceLabel = "Auxiliary Table";
      }
    } else if (hasBinarySearch) {
      timeBigO = "O(log n)";
      timeLabel = "Optimal Logarithmic";
      isTimeOptimal = true;
      spaceBigO = "O(1)";
      spaceLabel = "Constant In-Place";
      isSpaceOptimal = true;
    } else if (hasSorting) {
      timeBigO = "O(n log n)";
      timeLabel = "Comparison Sort";
      isTimeOptimal = true;
      spaceBigO = usesMapOrSet || usesAuxiliaryArray ? "O(n)" : "O(1)";
      spaceLabel = usesMapOrSet || usesAuxiliaryArray ? "Linear Auxiliary" : "In-place";
    } else if (hasNestedLoops) {
      timeBigO = "O(n²)";
      timeLabel = "Suboptimal Quadratic";
      isTimeOptimal = false;
      spaceBigO = usesMapOrSet || usesAuxiliaryArray ? "O(n)" : "O(1)";
      spaceLabel = usesMapOrSet || usesAuxiliaryArray ? "Auxiliary Space" : "In-place";
      isSpaceOptimal = !usesMapOrSet;
    } else if (hasRecursion) {
      timeBigO = "O(n)";
      timeLabel = "Recursive Traversal";
      isTimeOptimal = true;
      spaceBigO = "O(n)";
      spaceLabel = "Call Stack Depth";
      isSpaceOptimal = true;
    } else if (loopCount === 1) {
      timeBigO = "O(n)";
      timeLabel = "Optimal Linear";
      isTimeOptimal = true;
      spaceBigO = usesMapOrSet || usesAuxiliaryArray ? "O(n)" : "O(1)";
      spaceLabel =
        usesMapOrSet || usesAuxiliaryArray ? "Hash Table Auxiliary" : "Constant In-Place";
      isSpaceOptimal = true;
    } else {
      timeBigO = "O(1)";
      timeLabel = "Constant Time";
      isTimeOptimal = true;
      spaceBigO = "O(1)";
      spaceLabel = "Constant Space";
      isSpaceOptimal = true;
    }
  }

  const timeComplexity = `${timeBigO} • ${timeLabel}`;
  const spaceComplexity = `${spaceBigO} • ${spaceLabel}`;

  // --------------------------------------------------------------------------
  // 2. Score Computation (Strict Preference: Correctness 40%, Quality 30%, Complexity 20%, Readability 10%)
  // --------------------------------------------------------------------------
  let correctnessScore = 0;
  let codeQualityScore = 0;
  let readabilityScore = 0;
  let complexityScore = 0;
  let overallScore = 0;

  if (hasNoCorrectCode) {
    correctnessScore = 0;
    codeQualityScore = 0;
    readabilityScore = 0;
    complexityScore = 0;
    overallScore = 0;
  } else {
    // 1. Correctness: directly determined by test case pass ratio
    correctnessScore = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;

    // 2. Code Quality (30% weight)
    let q = 65;
    if (code.includes("class Solution") || code.includes("public class")) q += 10;
    if (code.includes(": ") || code.includes("->") || code.includes("<Integer>") || code.includes("/**")) q += 8;
    if (code.toLowerCase().includes("min(") || code.toLowerCase().includes("max(") || code.toLowerCase().includes("len(") || code.toLowerCase().includes("range(")) q += 7;
    if (!hasRuntimeError) q += 10;
    codeQualityScore = Math.min(100, q);

    // 3. Complexity Score (20% weight)
    complexityScore = isTimeOptimal ? 96 : 65;
    if (!isSpaceOptimal) complexityScore -= 10;
    if (allPassed && isTimeOptimal) complexityScore = 98;

    // 4. Readability Score (10% weight)
    let r = 50;
    if (code.includes("#") || code.includes("//") || code.includes("/*")) r += 20;
    if (code.includes('"""') || code.includes("/**")) r += 15;
    if (code.split("\n").some((l) => l.length > 100)) r -= 10;
    if (code.includes("    ") || code.includes("  ")) r += 10;
    readabilityScore = Math.max(20, Math.min(100, r));

    // Weighted Overall Score
    const rawOverall = Math.round(
      correctnessScore * 0.40 +
      codeQualityScore * 0.30 +
      complexityScore * 0.20 +
      readabilityScore * 0.10
    );

    if (!allPassed) {
      // Partial pass cap
      const passRatio = passCount / Math.max(1, totalCount);
      overallScore = Math.min(Math.round(passRatio * 75), rawOverall);
    } else {
      overallScore = Math.max(78, Math.min(100, rawOverall));
    }
  }

  // --------------------------------------------------------------------------
  // 3. Strengths Generation
  // --------------------------------------------------------------------------
  const strengths: string[] = [];
  const lower = code.toLowerCase();

  if (hasNoCorrectCode) {
    strengths.push("Test environment is loaded and ready for execution.");
    strengths.push("Pre-imported standard DSA utilities (typing, collections, math) are available.");
    strengths.push("Awaiting working code submission to evaluate algorithmic efficiency.");
  } else {
    if (allPassed) {
      strengths.push(`Flawless execution: Passed 100% (${passCount}/${totalCount}) test cases including edge constraints.`);
    } else if (passCount > 0) {
      strengths.push(`Successfully passed ${passCount}/${totalCount} verification cases.`);
    }

    if (isTimeOptimal) {
      strengths.push(`Optimal time complexity achieved (${timeBigO}): efficient traversal without redundant iterations.`);
    } else {
      strengths.push("Clear step-by-step sequential approach to problem solving.");
    }

    if (isSpaceOptimal) {
      strengths.push(`Minimal space footprint (${spaceBigO}): efficient in-place state management.`);
    } else if (lower.includes("dp") || lower.includes("seen") || lower.includes("map")) {
      strengths.push("Structured state representation with dedicated auxiliary storage.");
    } else {
      strengths.push("Follows standard LeetCode class encapsulation practices.");
    }
  }

  // Ensure exactly 3 strengths
  while (strengths.length < 3) {
    strengths.push("Algorithm sandbox ready for verification.");
  }

  // --------------------------------------------------------------------------
  // 4. Suggestions Generation (Highlighting Mistakes & Correct Approaches)
  // --------------------------------------------------------------------------
  const suggestions: string[] = [];

  if (isEmpty) {
    suggestions.push("Missing Implementation: The function only contains placeholder code or pass statement.");
    suggestions.push("Implement the core algorithmic logic to process inputs and return the required data structure.");
    suggestions.push("Check the examples in the problem description to formulate the recurrence or iteration.");
  } else if (hasSyntaxError) {
    if (code.includes("]]") || code.includes("))") || code.includes("}}")) {
      suggestions.push("Syntax Error: Found unmatched closing bracket or parenthesis. Review bracket pairing.");
    } else if (code.includes("- >")) {
      suggestions.push("Syntax Error: Space between '-' and '>' in return type hint. Use '-> int'.");
    } else {
      suggestions.push("Syntax Error: Fix indentation or punctuation syntax error before submission.");
    }
    suggestions.push("Verify that all parentheses, brackets, and quotes are properly balanced.");
    suggestions.push("Ensure indentation uses 4 consistent spaces per nesting level.");
  } else if (passCount === 0) {
    suggestions.push(`Test Failure: 0/${totalCount} test cases passed. Review your return value against expected output.`);
    suggestions.push("Trace boundary values: Empty inputs, single element arrays, and zero-value arguments.");
    if (!code.includes("if ") || !lower.includes("return")) {
      suggestions.push("Ensure you return the result instead of printing, and guard against empty inputs.");
    } else {
      suggestions.push("Re-check state transitions to prevent off-by-one errors in iteration bounds.");
    }
  } else if (!allPassed) {
    suggestions.push(`Edge Case Failure: Passed ${passCount}/${totalCount} cases. Check large inputs or corner cases.`);
    if (!isTimeOptimal) {
      suggestions.push(`Optimize runtime from ${timeBigO} to optimal bound using hash map, two pointers, or DP.`);
    } else {
      suggestions.push("Double-check 0, negative, and maximum constraint handling.");
    }
    if (!code.includes('"""') && !code.includes("/*")) {
      suggestions.push("Add explanatory docstrings detailing time and space complexity.");
    }
  } else {
    // All passed! Provide polish suggestions
    if (!isTimeOptimal) {
      suggestions.push(`Performance Polish: Current runtime is ${timeBigO}. Consider an optimal ${problem.topic.toLowerCase()} approach.`);
    } else if (!code.includes('"""') && !code.includes("/**")) {
      suggestions.push("Documentation: Add docstring explaining recurrence relation and edge case handling.");
    } else if (language === "Python" && (!code.includes("->") || !code.includes(": int"))) {
      suggestions.push("Type Safety: Add explicit PEP-484 type annotations for parameters and return types.");
    } else {
      suggestions.push("Production readiness: Solution is optimal and clean. Ready for real interview submission!");
    }

    if (code.split("\n").some((l) => l.length > 100)) {
      suggestions.push("Style: Break long lines (> 100 chars) for better readability across mobile/split screens.");
    }

    if (suggestions.length < 3) {
      suggestions.push("Consider testing with extreme upper constraint values to verify memory overhead.");
    }
  }

  // --------------------------------------------------------------------------
  // 5. Solution Refactor Snippet
  // --------------------------------------------------------------------------
  const refactoredSnippet = generateOptimalSolution(problem, language, code);

  return {
    overallScore,
    correctnessScore,
    codeQualityScore,
    readabilityScore,
    complexityScore,
    timeComplexity,
    spaceComplexity,
    isTimeOptimal,
    isSpaceOptimal,
    timeBigO,
    spaceBigO,
    timeLabel,
    spaceLabel,
    strengths: strengths.slice(0, 3),
    suggestions: suggestions.slice(0, 3),
    refactoredSnippet,
  };
}
