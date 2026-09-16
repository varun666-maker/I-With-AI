"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  Copy,
  Download,
  Info,
  Play,
  PlayCircle,
  Sparkles,
  Terminal,
  X,
  Zap,
} from "lucide-react";
import {
  AuroraBackground,
  GlowCard,
  PageWrap,
  PulseBadge,
  SectionHeading,
} from "@/components/shared/primitives";
import { BackToHome } from "@/components/shared/top-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";

const LANGUAGES = ["Python", "Java", "C++", "JavaScript", "SQL", "Go", "TypeScript"];

const STARTER_CODE: Record<string, string> = {
  Python: `def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n    return []\n`,
  JavaScript: `function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    if (seen.has(target - nums[i])) {\n      return [seen.get(target - nums[i]), i];\n    }\n    seen.set(nums[i], i);\n  }\n  return [];\n}\n`,
  Java: `public int[] twoSum(int[] nums, int target) {\n    Map<Integer, Integer> seen = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n        if (seen.containsKey(target - nums[i]))\n            return new int[]{seen.get(target - nums[i]), i};\n        seen.put(nums[i], i);\n    }\n    return new int[]{};\n}\n`,
  TypeScript: `function twoSum(nums: number[], target: number): number[] {\n  const seen = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    if (seen.has(target - nums[i]))\n      return [seen.get(target - nums[i])!, i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}\n`,
  "C++": `vector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int,int> seen;\n    for (int i = 0; i < nums.size(); i++) {\n        if (seen.count(target - nums[i]))\n            return {seen[target - nums[i]], i};\n        seen[nums[i]] = i;\n    }\n    return {};\n}\n`,
  Go: `func twoSum(nums []int, target int) []int {\n    seen := map[int]int{}\n    for i, n := range nums {\n        if j, ok := seen[target-n]; ok {\n            return []int{j, i}\n        }\n        seen[n] = i\n    }\n    return []\n}\n`,
  SQL: `-- SQL variant: find pairs of ids\nSELECT a.id AS id1, b.id AS id2\nFROM nums a JOIN nums b\n  ON a.id < b.id AND a.value + b.value = :target;\n`,
};

const TEST_CASES = [
  { id: 1, input: "nums = [2,7,11,15], target = 9", expected: "[0,1]", hidden: false },
  { id: 2, input: "nums = [3,2,4], target = 6", expected: "[1,2]", hidden: false },
  { id: 3, input: "nums = [3,3], target = 6", expected: "[0,1]", hidden: false },
  { id: 4, input: "nums = [1,5,8,12,7], target = 13", expected: "[2,3]", hidden: true },
  { id: 5, input: "nums = [10,20,30,40], target = 50", expected: "[1,2]", hidden: true },
  { id: 6, input: "nums = [0,-1,2,-3,1], target = -2", expected: "[1,3]", hidden: true },
  { id: 7, input: "nums = [5,5,5,5], target = 10", expected: "[0,1]", hidden: true },
  { id: 8, input: "nums = [99,1,2,99], target = 100", expected: "[]", hidden: true },
  { id: 9, input: "nums = [-3,4,3,90], target = 0", expected: "[0,2]", hidden: true },
  { id: 10, input: "nums = [1,8,2,7,3,6,4,5], target = 9", expected: "[0,1]", hidden: true },
];

export function CodingArena() {
  const { set } = useNav();
  const [language, setLanguage] = useState("Python");
  const [code, setCode] = useState(STARTER_CODE.Python);
  const [customInput, setCustomInput] = useState("nums = [2,7,11,15], target = 9");
  const [results, setResults] = useState<{ id: number; status: "pass" | "fail"; runtime: string; mem: string; got?: string }[] | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [running, setRunning] = useState(false);
  const [confirmLang, setConfirmLang] = useState<string | null>(null);
  const [autoSaved, setAutoSaved] = useState(false);

  // autosave simulation
  useEffect(() => {
    const t = setInterval(() => {
      setAutoSaved(true);
      setTimeout(() => setAutoSaved(false), 1500);
    }, 30000);
    return () => clearInterval(t);
  }, []);

  const onLangChange = (lang: string) => {
    if (lang === language) return;
    setConfirmLang(lang);
  };
  const confirmSwitch = () => {
    if (!confirmLang) return;
    setLanguage(confirmLang);
    setCode(STARTER_CODE[confirmLang] ?? "");
    setResults(null);
    setSubmitted(false);
    setConfirmLang(null);
  };

  const run = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      setResults([
        { id: 1, status: "pass", runtime: "12ms", mem: "14.0MB" },
        { id: 2, status: "pass", runtime: "8ms", mem: "14.2MB" },
        { id: 3, status: "fail", runtime: "15ms", mem: "14.1MB", got: "[1,0]" },
      ]);
    }, 900);
  };

  const submit = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      // 7/10 pass — case 3 and case 8 fail
      setResults(
        TEST_CASES.map((tc) => ({
          id: tc.id,
          status: tc.id === 3 || tc.id === 8 ? "fail" as const : "pass" as const,
          runtime: `${8 + Math.floor(Math.random() * 12)}ms`,
          mem: "14.0MB",
          got: tc.id === 3 ? "[1,0]" : tc.id === 8 ? "[0,3]" : undefined,
        })),
      );
      setSubmitted(true);
    }, 1400);
  };

  const passCount = results ? results.filter((r) => r.status === "pass").length : 0;

  return (
    <AuroraBackground showGrid={false}>
      <PageWrap wide>
        <BackToHome />
        <SectionHeading
          eyebrow="Coding Arena"
          title={<>Practice with the <span className="gradient-text">AI code reviewer</span></>}
          description="A VS Code-like editor with syntax highlighting, 10 test cases per problem, real-time execution, and an AI review that scores complexity, readability, and gives refactor suggestions."
          align="left"
        />

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* LEFT PANE: problem statement */}
          <GlowCard className="flex h-full flex-col p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">
                  <span className="font-mono text-muted-foreground">#</span> Two Sum
                </h3>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Problem #1 · Asked 3,241 times this week</p>
              </div>
              <Badge className="border-emerald-400/30 bg-emerald-500/10 text-emerald-200">Easy</Badge>
            </div>

            <div className="mt-4 space-y-3 text-sm text-foreground/85">
              <p>
                Given an array of integers <code className="rounded bg-white/10 px-1 font-mono text-xs text-violet-200">nums</code> and an integer <code className="rounded bg-white/10 px-1 font-mono text-xs text-violet-200">target</code>, return <em>indices of the two numbers</em> such that they add up to <code className="rounded bg-white/10 px-1 font-mono text-xs text-violet-200">target</code>.
              </p>
              <p>
                You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice. You can return the answer in any order.
              </p>
            </div>

            <div className="mt-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Examples</p>
              <div className="mt-2 space-y-2">
                {[
                  { i: "nums = [2,7,11,15], target = 9", o: "[0,1]", note: "Because nums[0] + nums[1] == 9." },
                  { i: "nums = [3,2,4], target = 6", o: "[1,2]", note: "Because nums[1] + nums[2] == 6." },
                  { i: "nums = [3,3], target = 6", o: "[0,1]", note: "Same value, different indices." },
                ].map((e, i) => (
                  <div key={i} className="rounded-md border border-white/10 bg-black/30 p-3 font-mono text-xs">
                    <p className="text-emerald-300">Input: <span className="text-white/80">{e.i}</span></p>
                    <p className="mt-1 text-violet-300">Output: <span className="text-white/80">{e.o}</span></p>
                    <p className="mt-1 text-muted-foreground"># {e.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Constraints</p>
              <ul className="mt-2 space-y-1 font-mono text-xs text-foreground/70">
                <li>• 2 ≤ nums.length ≤ 10⁴</li>
                <li>• -10⁹ ≤ nums[i] ≤ 10⁹</li>
                <li>• -10⁹ ≤ target ≤ 10⁹</li>
                <li>• Only one valid answer exists.</li>
                <li>• Follow-up: O(n) time, O(n) space.</li>
              </ul>
            </div>

            <div className="mt-auto pt-5">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Avg solve time: <span className="text-foreground">4m 12s</span> · Acceptance rate: <span className="text-emerald-300">52%</span>
              </div>
            </div>
          </GlowCard>

          {/* RIGHT PANE: editor */}
          <GlowCard className="flex h-full flex-col p-0 overflow-hidden">
            {/* Editor chrome */}
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                <span className="ml-3 font-mono text-xs text-muted-foreground">solution.{language === "C++" ? "cpp" : language.toLowerCase().replace("+", "pp")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Select value={language} onValueChange={onLangChange}>
                  <SelectTrigger size="sm" className="w-32 rounded-md border-white/10 bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {autoSaved && (
                  <span className="text-[11px] text-emerald-300">
                    <Check className="mr-0.5 inline h-3 w-3" /> Auto-saved
                  </span>
                )}
              </div>
            </div>

            {/* Editor (textarea styled like Monaco) */}
            <div className="relative bg-[#0a0a0f]">
              <div className="flex">
                {/* Line numbers */}
                <div className="select-none border-r border-white/5 px-2 py-3 text-right font-mono text-xs text-white/30">
                  {code.split("\n").map((_, i) => (
                    <div key={i} className="leading-6">{i + 1}</div>
                  ))}
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                  className="flex-1 resize-none bg-transparent p-3 font-mono text-xs leading-6 text-emerald-100 outline-none"
                  style={{ minHeight: 280, tabSize: 4 }}
                />
              </div>
            </div>

            {/* Custom input + actions */}
            <div className="border-t border-white/5 p-4">
              <Label2 text="Custom Input" />
              <Textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="mt-1 h-16 rounded-md bg-black/40 font-mono text-xs border-white/10"
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={run}
                  disabled={running}
                  className="rounded-full border-white/15 bg-white/5 hover:bg-white/10"
                >
                  {running ? <Clock className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                  Run
                </Button>
                <Button
                  size="sm"
                  onClick={submit}
                  disabled={running}
                  className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0"
                >
                  {running ? <Clock className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  Submit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full text-muted-foreground"
                  onClick={() => navigator.clipboard?.writeText(code)}
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
              </div>
            </div>

            {/* Test cases */}
            {results && (
              <div className="border-t border-white/5 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {submitted ? "Submit Results" : "Run Results"}
                  </p>
                  {submitted && (
                    <Badge className="border-violet-400/30 bg-violet-500/10 text-violet-200">
                      {passCount}/{results.length} passed
                    </Badge>
                  )}
                </div>
                <ul className="mt-3 space-y-1.5">
                  {results.map((r) => {
                    const tc = TEST_CASES.find((x) => x.id === r.id)!;
                    return (
                      <li key={r.id} className="flex items-center justify-between rounded-md border border-white/5 bg-white/[0.02] px-3 py-1.5 text-xs">
                        <div className="flex min-w-0 items-center gap-2">
                          {r.status === "pass" ? (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                          ) : (
                            <X className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                          )}
                          <span className="truncate font-mono text-muted-foreground">
                            Case {r.id} {tc.hidden && <span className="text-[10px]">(hidden)</span>}
                          </span>
                          {r.status === "fail" && (
                            <span className="ml-2 truncate text-rose-300">
                              Expected {tc.expected} · Got <span className="font-mono">{r.got}</span>
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">{r.runtime} · {r.mem}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* AI review panel */}
            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-white/5"
                >
                  <AIReview language={language} code={code} passCount={passCount} total={TEST_CASES.length} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Proctoring footer */}
            <div className="mt-auto border-t border-white/5 px-4 py-2 text-[11px] text-muted-foreground">
              <Info className="mr-1 inline h-3 w-3" />
              Tab switches: <span className="text-foreground">1</span> · Fullscreen exits: <span className="text-foreground">0</span> — logged for awareness only. No penalties.
            </div>
          </GlowCard>
        </div>

        {/* Bottom strip: quick navigation */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Problems", icon: Code2, value: "1,247", tone: "text-violet-300" },
            { label: "Solved", icon: CheckCircle2, value: "312", tone: "text-emerald-300" },
            { label: "Streak", icon: Zap, value: "9 days", tone: "text-amber-300" },
            { label: "Avg score", icon: Sparkles, value: "85/100", tone: "text-fuchsia-300" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <s.icon className={cn("h-4 w-4", s.tone)} />
              <p className="mt-2 text-xl font-semibold tracking-tight">{s.value}</p>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

      </PageWrap>

      <Dialog open={confirmLang !== null} onOpenChange={(o) => !o && setConfirmLang(null)}>
        <DialogContent className="border-white/10 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Switch language?</DialogTitle>
            <DialogDescription>
              Switching to <strong className="text-foreground">{confirmLang}</strong> will clear your current code. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setConfirmLang(null)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmSwitch}
              className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0"
            >
              Switch &amp; Clear Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuroraBackground>
  );
}

/* -------------------------------------------------------------------------- */

function Label2({ text }: { text: string }) {
  return (
    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{text}</p>
  );
}

function AIReview({ language, code, passCount, total }: { language: string; code: string; passCount: number; total: number }) {
  const [showRefactor, setShowRefactor] = useState(false);
  const overall = passCount === total ? 92 : passCount >= total - 2 ? 85 : 72;

  return (
    <div className="p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-violet-300" />
        <p className="text-sm font-medium">AI Code Review</p>
        <Badge className="border-violet-400/30 bg-violet-500/10 text-violet-200">
          Gemini 1.5 Flash · {language}
        </Badge>
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Overall Score</p>
          <p className="text-xl font-semibold text-violet-300">{overall}/100</p>
        </div>
        <Progress value={overall} className="mt-2 bg-white/10" />
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          <SubScore label="Correctness" value={Math.round((passCount / total) * 100)} />
          <SubScore label="Code Quality" value={90} />
          <SubScore label="Readability" value={85} />
          <SubScore label="Complexity" value={95} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
          <Badge className="border-emerald-400/30 bg-emerald-500/10 text-emerald-200">
            <Check className="h-3 w-3" /> Time: O(n) · Optimal
          </Badge>
          <Badge className="border-sky-400/30 bg-sky-500/10 text-sky-200">
            <Terminal className="h-3 w-3" /> Space: O(n)
          </Badge>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/[0.04] p-4">
          <p className="text-xs font-medium text-emerald-300">Strengths</p>
          <ul className="mt-2 space-y-1.5 text-xs text-foreground/80">
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" /> Clean, descriptive variable naming (<code className="font-mono text-emerald-200">seen</code>, <code className="font-mono text-emerald-200">target</code>).</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" /> Single pass O(n) — no nested loop. Optimal.</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" /> Handles edge case where no solution exists.</li>
          </ul>
        </div>
        <div className="rounded-lg border border-amber-400/20 bg-amber-500/[0.04] p-4">
          <p className="text-xs font-medium text-amber-300">Suggestions</p>
          <ul className="mt-2 space-y-1.5 text-xs text-foreground/80">
            <li className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" /> Add a docstring explaining parameters and return type.</li>
            <li className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" /> Type hints missing — add <code className="font-mono text-amber-200">nums: list[int], target: int</code>.</li>
            <li className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" /> Raise <code className="font-mono text-amber-200">ValueError</code> instead of returning empty list when no pair found.</li>
          </ul>
        </div>
      </div>

      <Collapsible open={showRefactor} onOpenChange={setShowRefactor} className="mt-4">
        <GlowCard className="p-0">
          <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-left">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-300" />
              <span className="text-sm font-medium">Refactored Snippet</span>
              <Badge className="border-white/10 bg-white/5 text-white/70">AI-generated</Badge>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showRefactor && "rotate-180")} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t border-white/5 bg-[#0a0a0f] p-4">
              <pre className="overflow-x-auto whitespace-pre font-mono text-xs text-emerald-100">
{`def two_sum(nums: list[int], target: int) -> list[int]:
    """Return indices of two numbers summing to target.

    Raises:
        ValueError: if no valid pair exists.
    """
    seen: dict[int, int] = {}
    for i, n in enumerate(nums):
        complement = target - n
        if complement in seen:
            return [seen[complement], i]
        seen[n] = i
    raise ValueError("No two sum solution")
`}
              </pre>
              <div className="mt-3 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border-white/15 bg-white/5 hover:bg-white/10"
                  onClick={() => navigator.clipboard?.writeText(code)}
                >
                  <Copy className="h-3.5 w-3.5" /> Copy Refactor
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full text-muted-foreground"
                >
                  <Download className="h-3.5 w-3.5" /> Export Snippet
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </GlowCard>
      </Collapsible>
    </div>
  );
}

function SubScore({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <Progress value={value} className="bg-white/10" />
        <span className="font-mono text-[11px] font-semibold text-foreground">{value}</span>
      </div>
    </div>
  );
}

/* keep imports referenced */
export const __icons = { ChevronRight, PlayCircle };
