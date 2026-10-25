import dataset from "./coding-dataset.json";
import meta from "./coding-meta.json";

export type Difficulty = "Easy" | "Medium" | "Hard";
export type Topic = string;

export interface CodingExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  id: number;
  input: string;
  expected: string;
  hidden: boolean;
}

export interface CodingProblem {
  id: number;
  title: string;
  difficulty: Difficulty;
  topic: string;
  description: string;
  examples: CodingExample[];
  constraints: string[];
  testCases: TestCase[];
  functionSignature: string;
  starterCode: Record<string, string>;
  acceptance: number;
  companies?: string[];
  leetcodeLink?: string | null;
  timeLimit?: number;
  memoryLimit?: number;
}

export const TOPICS: string[] = meta.topics;
export const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];
export const COMPANIES: Array<{ name: string; count: number }> = meta.companies;

// Full 600-question catalog loaded into memory sorted by ID ascending
export const CODING_PROBLEMS: CodingProblem[] = (dataset as unknown as CodingProblem[])
  .slice()
  .sort((a, b) => a.id - b.id);

// Fast O(1) ID lookup map
const PROBLEM_MAP = new Map<number, CodingProblem>();
for (const p of CODING_PROBLEMS) {
  PROBLEM_MAP.set(p.id, p);
}

export function getProblemById(id: number | string): CodingProblem | undefined {
  const numericId = typeof id === "string" ? Number(id) : id;
  return PROBLEM_MAP.get(numericId);
}

export function getProblemsByTopic(topic: string): CodingProblem[] {
  if (!topic || topic === "All") return CODING_PROBLEMS;
  return CODING_PROBLEMS.filter((p) => p.topic.toLowerCase() === topic.toLowerCase());
}

export function getProblemsByCompany(company: string): CodingProblem[] {
  if (!company || company === "all") return CODING_PROBLEMS;
  const lower = company.toLowerCase();
  return CODING_PROBLEMS.filter(
    (p) => Array.isArray(p.companies) && p.companies.some((c) => c.toLowerCase() === lower),
  );
}

export function searchProblems(query: string): CodingProblem[] {
  if (!query || !query.trim()) return CODING_PROBLEMS;
  const q = query.trim().toLowerCase();
  return CODING_PROBLEMS.filter((p) => {
    return (
      String(p.id).includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.topic.toLowerCase().includes(q) ||
      (p.companies && p.companies.some((c) => c.toLowerCase().includes(q)))
    );
  });
}
