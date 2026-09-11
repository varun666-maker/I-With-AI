"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  ChevronLeft,
  Code2,
  Database,
  FileText,
  Pencil,
  Plus,
  Save,
  ShieldQuestion,
  Terminal,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  AuroraBackground,
  GlowCard,
  MagneticButton,
  PageWrap,
  PulseBadge,
  SectionHeading,
} from "@/components/shared/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";

type AptQuestion = {
  id: string;
  category: string;
  subTopic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  text: string;
  options: [string, string, string, string];
  correct: "A" | "B" | "C" | "D";
  explanation: string;
};

type CodingProblem = {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  type: "DSA" | "SQL";
  statement: string;
  signatures: string;
  visibleTests: number;
  hiddenTests: number;
  timeLimit: number;
  memoryLimit: number;
  schema?: string;
};

const APT_QUESTIONS: AptQuestion[] = [
  {
    id: "q1",
    category: "Quant",
    subTopic: "Time & Work",
    difficulty: "Medium",
    text: "If 6 men can complete a task in 12 days, how long will 9 men take?",
    options: ["8 days", "9 days", "6 days", "18 days"],
    correct: "A",
    explanation:
      "Total man-days = 6 × 12 = 72. With 9 men, time = 72 / 9 = 8 days.",
  },
  {
    id: "q2",
    category: "Logical",
    subTopic: "Series",
    difficulty: "Easy",
    text: "Find the next term: 2, 6, 12, 20, 30, ?",
    options: ["40", "42", "44", "46"],
    correct: "B",
    explanation:
      "Differences: 4, 6, 8, 10, 12 → next term = 30 + 12 = 42.",
  },
  {
    id: "q3",
    category: "Verbal",
    subTopic: "Synonyms",
    difficulty: "Easy",
    text: "Choose the synonym of 'Ephemeral':",
    options: ["Permanent", "Brief", "Strong", "Heavy"],
    correct: "B",
    explanation: "Ephemeral = lasting for a very short time.",
  },
  {
    id: "q4",
    category: "Analytical",
    subTopic: "Puzzles",
    difficulty: "Hard",
    text: "5 friends sit in a row. A is left of B but right of C. D is left of C. E is between A and B. Who is in the middle?",
    options: ["A", "B", "C", "E"],
    correct: "A",
    explanation:
      "Order: D - C - A - E - B. The middle position (3rd) is A.",
  },
  {
    id: "q5",
    category: "DI",
    subTopic: "Bar charts",
    difficulty: "Medium",
    text: "If a bar chart shows Q1=40, Q2=60, Q3=80 — what is the % growth from Q1 to Q3?",
    options: ["50%", "75%", "100%", "120%"],
    correct: "C",
    explanation: "Growth = (80-40)/40 × 100 = 100%.",
  },
];

const CODING_PROBLEMS: CodingProblem[] = [
  {
    id: "c1",
    title: "Two Sum (Sorted)",
    difficulty: "Easy",
    type: "DSA",
    statement:
      "Given a sorted array of integers and a target, return the 1-based indices of the two numbers that add to target.",
    signatures: "function twoSum(arr: number[], target: number): number[]",
    visibleTests: 3,
    hiddenTests: 7,
    timeLimit: 1000,
    memoryLimit: 256,
  },
  {
    id: "c2",
    title: "LRU Cache Implementation",
    difficulty: "Hard",
    type: "DSA",
    statement:
      "Design a data structure that supports get/put in O(1) with LRU eviction at capacity.",
    signatures: "class LRUCache { constructor(capacity: number) {} }",
    visibleTests: 3,
    hiddenTests: 7,
    timeLimit: 1500,
    memoryLimit: 256,
  },
  {
    id: "c3",
    title: "Top 3 Products by Revenue",
    difficulty: "Medium",
    type: "SQL",
    statement:
      "Given `orders(order_id, product_id, qty, price, created_at)`, return the top 3 products by total revenue in the last 30 days.",
    signatures: "SELECT product_id, SUM(qty*price) AS revenue ...",
    visibleTests: 3,
    hiddenTests: 7,
    timeLimit: 2000,
    memoryLimit: 512,
    schema: "CREATE TABLE orders (\n  order_id INT PRIMARY KEY,\n  product_id INT,\n  qty INT,\n  price DECIMAL(10,2),\n  created_at TIMESTAMP\n);",
  },
];

export function QuestionManager() {
  const { set } = useNav();
  const [tab, setTab] = useState<"aptitude" | "coding">("aptitude");

  return (
    <AuroraBackground>
      <PageWrap className="pt-8">
        <button
          onClick={() => set("admin-dashboard")}
          className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-white"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            align="left"
            eyebrow="Campaign · backend-sde-1"
            title="Question Set Manager"
            description="Aptitude MCQs and coding problems. Questions are scoped to this campaign only."
          />
          <PulseBadge color="sky">
            {APT_QUESTIONS.length + CODING_PROBLEMS.length} questions
          </PulseBadge>
        </div>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as typeof tab)}
          className="mt-6"
        >
          <TabsList className="h-auto bg-white/[0.03] p-1">
            <TabsTrigger
              value="aptitude"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white px-4 py-1.5 text-sm"
            >
              <Brain className="mr-1.5 h-3.5 w-3.5" />
              Aptitude Questions
            </TabsTrigger>
            <TabsTrigger
              value="coding"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white px-4 py-1.5 text-sm"
            >
              <Code2 className="mr-1.5 h-3.5 w-3.5" />
              Coding Problems
            </TabsTrigger>
          </TabsList>

          {/* TAB 1 — Aptitude */}
          <TabsContent value="aptitude" className="mt-5">
            <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
              <AptitudeForm />
              <AptitudeList />
            </div>
          </TabsContent>

          {/* TAB 2 — Coding */}
          <TabsContent value="coding" className="mt-5">
            <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
              <CodingForm />
              <CodingList />
            </div>
          </TabsContent>
        </Tabs>
      </PageWrap>
    </AuroraBackground>
  );
}

/* ---------- Aptitude form ---------- */

function AptitudeForm() {
  const [cat, setCat] = useState<string>("");
  const [diff, setDiff] = useState<string>("");
  const [sub, setSub] = useState("");
  const [text, setText] = useState("");
  const [opts, setOpts] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState<"A" | "B" | "C" | "D">("A");
  const [explanation, setExplanation] = useState("");

  const valid =
    cat && diff && sub.trim() && text.trim() && opts.every((o) => o.trim());

  return (
    <GlowCard className="p-6">
      <div className="flex items-center gap-2">
        <ShieldQuestion className="h-4 w-4 text-violet-300" />
        <h3 className="text-sm font-medium">Add a question</h3>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Category</Label>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Quant">Quant</SelectItem>
              <SelectItem value="Logical">Logical</SelectItem>
              <SelectItem value="Verbal">Verbal</SelectItem>
              <SelectItem value="Analytical">Analytical</SelectItem>
              <SelectItem value="DI">DI</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Difficulty</Label>
          <Select value={diff} onValueChange={setDiff}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <Label className="text-xs text-muted-foreground">Sub-topic</Label>
        <Input
          value={sub}
          onChange={(e) => setSub(e.target.value)}
          placeholder="e.g. Time & Work"
          className="h-10"
        />
      </div>

      <div className="mt-4 space-y-1.5">
        <Label className="text-xs text-muted-foreground">
          Question text
        </Label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Type the question…"
        />
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Options · select correct
        </p>
        <RadioGroup
          value={correct}
          onValueChange={(v) => setCorrect(v as typeof correct)}
          className="gap-2"
        >
          {opts.map((o, i) => {
            const letter = ["A", "B", "C", "D"][i] as "A" | "B" | "C" | "D";
            return (
              <div
                key={letter}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors",
                  correct === letter
                    ? "border-violet-400/40 bg-violet-500/10"
                    : "border-white/10 bg-white/[0.02]",
                )}
              >
                <RadioGroupItem value={letter} id={`opt-${letter}`} />
                <Label
                  htmlFor={`opt-${letter}`}
                  className="w-6 text-center font-semibold text-violet-200"
                >
                  {letter}
                </Label>
                <Input
                  value={o}
                  onChange={(e) => {
                    const next = [...opts];
                    next[i] = e.target.value;
                    setOpts(next as typeof opts);
                  }}
                  className="h-9 flex-1 border-0 bg-transparent px-1 focus-visible:ring-0"
                  placeholder={`Option ${letter}`}
                />
              </div>
            );
          })}
        </RadioGroup>
      </div>

      <div className="mt-4 space-y-1.5">
        <Label className="text-xs text-muted-foreground">Explanation</Label>
        <Textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={2}
          placeholder="Shown to candidate after submission"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <MagneticButton
          disabled={!valid}
          className="h-10 rounded-full border-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 text-white hover:from-violet-400 hover:to-fuchsia-400 disabled:opacity-50"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Question
        </MagneticButton>
        <Button
          variant="outline"
          className="h-10 rounded-full border-white/15 bg-white/5 hover:bg-white/10"
        >
          <Upload className="mr-1.5 h-4 w-4" />
          Bulk Upload CSV
        </Button>
        <Button
          variant="ghost"
          className="h-10 rounded-full text-muted-foreground"
        >
          <FileText className="mr-1.5 h-4 w-4" />
          Download template
        </Button>
      </div>
    </GlowCard>
  );
}

function AptitudeList() {
  return (
    <GlowCard className="p-0">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
        <div>
          <p className="text-sm font-medium">Added questions</p>
          <p className="text-xs text-muted-foreground">
            {APT_QUESTIONS.length} questions in this campaign
          </p>
        </div>
        <PulseBadge color="violet">{APT_QUESTIONS.length} total</PulseBadge>
      </div>
      <div className="max-h-[680px] overflow-y-auto scrollbar-custom">
        {APT_QUESTIONS.map((q) => (
          <div
            key={q.id}
            className="border-b border-white/5 px-5 py-4 transition-colors hover:bg-white/[0.02]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tag={q.category} tone="violet" />
                <Badge tag={q.subTopic} tone="slate" />
                <Badge tag={q.difficulty} tone={difficultyTone(q.difficulty)} />
              </div>
              <div className="flex items-center gap-1">
                <button className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-violet-200">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-rose-300">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-2 text-sm font-medium text-foreground/90">
              {q.text}
            </p>
            <div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
              {q.options.map((o, i) => {
                const letter = ["A", "B", "C", "D"][i];
                const isCorrect = letter === q.correct;
                return (
                  <div
                    key={letter}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1 text-xs",
                      isCorrect
                        ? "bg-emerald-500/10 text-emerald-200"
                        : "text-muted-foreground",
                    )}
                  >
                    <span className="font-mono font-semibold">{letter}.</span>
                    {o}
                    {isCorrect && <span className="ml-auto">✓ correct</span>}
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              <span className="text-violet-200">Explanation:</span>{" "}
              {q.explanation}
            </p>
          </div>
        ))}
      </div>
    </GlowCard>
  );
}

/* ---------- Coding form ---------- */

function CodingForm() {
  const [title, setTitle] = useState("");
  const [diff, setDiff] = useState("");
  const [type, setType] = useState<"DSA" | "SQL">("DSA");
  const [statement, setStatement] = useState("");
  const [signatures, setSignatures] = useState("");
  const [visibleTests, setVisibleTests] = useState(3);
  const [hiddenTests, setHiddenTests] = useState(7);
  const [timeLimit, setTimeLimit] = useState(1000);
  const [memoryLimit, setMemoryLimit] = useState(256);
  const [schema, setSchema] = useState("");

  const valid =
    title.trim() && diff && statement.trim() && signatures.trim();

  return (
    <GlowCard className="p-6">
      <div className="flex items-center gap-2">
        <Terminal className="h-4 w-4 text-violet-300" />
        <h3 className="text-sm font-medium">Add a coding problem</h3>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Two Sum (Sorted)"
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Difficulty</Label>
          <Select value={diff} onValueChange={setDiff}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <Label className="text-xs text-muted-foreground">Type</Label>
        <RadioGroup
          value={type}
          onValueChange={(v) => setType(v as "DSA" | "SQL")}
          className="grid grid-cols-2 gap-2"
        >
          {(
            [
              { v: "DSA", label: "DSA Problem", icon: <Code2 className="h-4 w-4" /> },
              { v: "SQL", label: "SQL Problem", icon: <Database className="h-4 w-4" /> },
            ] as const
          ).map((o) => (
            <label
              key={o.v}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm transition-colors",
                type === o.v
                  ? "border-violet-400/40 bg-violet-500/10 text-violet-100"
                  : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]",
              )}
            >
              <RadioGroupItem value={o.v} />
              <span className="text-muted-foreground">{o.icon}</span>
              {o.label}
            </label>
          ))}
        </RadioGroup>
      </div>

      <div className="mt-4 space-y-1.5">
        <Label className="text-xs text-muted-foreground">
          Problem statement (markdown)
        </Label>
        <Textarea
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          rows={5}
          placeholder="Describe the problem, constraints, examples…"
          className="font-mono text-sm"
        />
      </div>

      <div className="mt-4 space-y-1.5">
        <Label className="text-xs text-muted-foreground">
          Function signatures (one per line)
        </Label>
        <Textarea
          value={signatures}
          onChange={(e) => setSignatures(e.target.value)}
          rows={3}
          placeholder="function solve(arr: number[]): number\n# python: def solve(arr: list[int]) -> list[int]"
          className="font-mono text-sm"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Visible test cases
          </Label>
          <Input
            type="number"
            min={1}
            max={10}
            value={visibleTests}
            onChange={(e) => setVisibleTests(Number(e.target.value))}
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Hidden test cases
          </Label>
          <Input
            type="number"
            min={0}
            max={20}
            value={hiddenTests}
            onChange={(e) => setHiddenTests(Number(e.target.value))}
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Time limit (ms)
          </Label>
          <Input
            type="number"
            min={100}
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Memory limit (KB)
          </Label>
          <Input
            type="number"
            min={64}
            value={memoryLimit}
            onChange={(e) => setMemoryLimit(Number(e.target.value))}
            className="h-10"
          />
        </div>
      </div>

      {/* SQL schema conditional */}
      {type === "SQL" && (
        <div className="mt-4 space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Schema setup SQL (DDL + seed)
          </Label>
          <Textarea
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
            rows={5}
            placeholder="CREATE TABLE ..."
            className="font-mono text-sm"
          />
        </div>
      )}

      <div className="mt-5">
        <MagneticButton
          disabled={!valid}
          className="h-10 rounded-full border-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 text-white hover:from-violet-400 hover:to-fuchsia-400 disabled:opacity-50"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Coding Problem
        </MagneticButton>
      </div>
    </GlowCard>
  );
}

function CodingList() {
  return (
    <GlowCard className="p-0">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
        <div>
          <p className="text-sm font-medium">Added problems</p>
          <p className="text-xs text-muted-foreground">
            {CODING_PROBLEMS.length} problems in this campaign
          </p>
        </div>
        <PulseBadge color="sky">{CODING_PROBLEMS.length} total</PulseBadge>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="pl-5">Title</TableHead>
            <TableHead className="hidden sm:table-cell">Type</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead className="hidden md:table-cell">Tests</TableHead>
            <TableHead className="pr-5 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {CODING_PROBLEMS.map((p) => (
            <TableRow
              key={p.id}
              className="border-white/5 hover:bg-white/[0.02]"
            >
              <TableCell className="pl-5 py-3">
                <p className="text-sm font-medium">{p.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {p.statement}
                </p>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge
                  tag={p.type}
                  tone={p.type === "SQL" ? "amber" : "violet"}
                  icon={
                    p.type === "SQL" ? (
                      <Database className="h-3 w-3" />
                    ) : (
                      <Code2 className="h-3 w-3" />
                    )
                  }
                />
              </TableCell>
              <TableCell>
                <Badge
                  tag={p.difficulty}
                  tone={difficultyTone(p.difficulty)}
                />
              </TableCell>
              <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                {p.visibleTests} visible · {p.hiddenTests} hidden
              </TableCell>
              <TableCell className="pr-5 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-violet-200">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-rose-300">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </GlowCard>
  );
}

/* ---------- helpers ---------- */

function difficultyTone(d: string) {
  if (d === "Easy") return "emerald" as const;
  if (d === "Medium") return "amber" as const;
  return "rose" as const;
}

function Badge({
  tag,
  tone,
  icon,
}: {
  tag: string;
  tone: "violet" | "emerald" | "amber" | "rose" | "sky" | "slate";
  icon?: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    violet: "border-violet-400/30 bg-violet-500/10 text-violet-200",
    emerald: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
    amber: "border-amber-400/30 bg-amber-500/10 text-amber-200",
    rose: "border-rose-400/30 bg-rose-500/10 text-rose-200",
    sky: "border-sky-400/30 bg-sky-500/10 text-sky-200",
    slate: "border-white/15 bg-white/5 text-white/80",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
      )}
    >
      {icon}
      {tag}
    </span>
  );
}
