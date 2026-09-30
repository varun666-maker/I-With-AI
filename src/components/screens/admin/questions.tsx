"use client";

import { useState } from "react";
import {
  Brain,
  Check,
  CheckCircle2,
  ChevronLeft,
  Code2,
  Database,
  Download,
  FileText,
  FileUp,
  Pencil,
  Plus,
  ShieldQuestion,
  Terminal,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { PageWrap } from "@/components/shared/primitives";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
      "Differences: 4, 6, 8, 10, 12. Next term = 30 + 12 = 42.",
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
    text: "If a bar chart shows Q1=40, Q2=60, Q3=80. What is the % growth from Q1 to Q3?",
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
    <div className="min-h-screen bg-background text-foreground">
      <PageWrap className="pt-8">
        <button
          onClick={() => set("admin-dashboard")}
          className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Campaign · backend-sde-1
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Question Set Manager
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Aptitude MCQs and coding problems. Add one-by-one or bulk-upload
              via CSV. Questions are scoped to this campaign only.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground dark:border-white/15">
            {APT_QUESTIONS.length + CODING_PROBLEMS.length} questions
          </span>
        </div>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as typeof tab)}
          className="mt-6"
        >
          <TabsList className="h-auto bg-muted/40 p-1">
            <TabsTrigger
              value="aptitude"
              className="data-[state=active]:bg-violet-500 data-[state=active]:text-white px-4 py-1.5 text-sm"
            >
              <Brain className="mr-1.5 h-3.5 w-3.5" />
              Aptitude Questions
            </TabsTrigger>
            <TabsTrigger
              value="coding"
              className="data-[state=active]:bg-violet-500 data-[state=active]:text-white px-4 py-1.5 text-sm"
            >
              <Code2 className="mr-1.5 h-3.5 w-3.5" />
              Coding Problems
            </TabsTrigger>
          </TabsList>

          {/* TAB 1. Aptitude */}
          <TabsContent value="aptitude" className="mt-5">
            <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
              <AptitudeForm />
              <AptitudeList />
            </div>
          </TabsContent>

          {/* TAB 2. Coding */}
          <TabsContent value="coding" className="mt-5">
            <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
              <CodingForm />
              <CodingList />
            </div>
          </TabsContent>
        </Tabs>

      </PageWrap>
    </div>
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
  const [bulkOpen, setBulkOpen] = useState(false);

  const valid =
    cat && diff && sub.trim() && text.trim() && opts.every((o) => o.trim());

  return (
    <div className="rounded-lg border border-black/10 bg-background p-6 shadow-sm dark:border-white/10">
      <div className="flex items-center gap-2">
        <ShieldQuestion className="h-4 w-4 text-violet-600 dark:text-violet-300" />
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
          placeholder="Type the question..."
        />
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Options · Select correct
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
                    : "border-black/10 bg-muted/30 dark:border-white/10",
                )}
              >
                <RadioGroupItem value={letter} id={`opt-${letter}`} />
                <Label
                  htmlFor={`opt-${letter}`}
                  className="w-6 text-center font-semibold text-violet-700 dark:text-violet-300"
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
        <Button
          disabled={!valid}
          className="h-10 rounded-full bg-violet-500 px-5 text-white hover:bg-violet-600 disabled:opacity-50 dark:bg-violet-500 dark:hover:bg-violet-600"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Question
        </Button>
        <Button
          variant="outline"
          onClick={() => setBulkOpen(true)}
          className="h-10 rounded-full"
        >
          <Upload className="mr-1.5 h-4 w-4" />
          Bulk Upload CSV
        </Button>
        <Button
          variant="ghost"
          onClick={() => downloadCsvTemplate("aptitude")}
          className="h-10 rounded-full text-muted-foreground"
        >
          <FileText className="mr-1.5 h-4 w-4" />
          Download template
        </Button>
      </div>

      <BulkUploadDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        kind="aptitude"
      />
    </div>
  );
}

function AptitudeList() {
  return (
    <div className="overflow-hidden rounded-lg border border-black/10 bg-background shadow-sm dark:border-white/10">
      <div className="flex items-center justify-between border-b border-black/5 px-5 py-3 dark:border-white/5">
        <div>
          <p className="text-sm font-medium">Added questions</p>
          <p className="text-xs text-muted-foreground">
            {APT_QUESTIONS.length} questions in this campaign
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-300">
          {APT_QUESTIONS.length} total
        </span>
      </div>
      <div className="max-h-[680px] overflow-y-auto scrollbar-custom">
        {APT_QUESTIONS.map((q) => (
          <div
            key={q.id}
            className="border-b border-black/5 px-5 py-4 transition-colors hover:bg-muted/30 dark:border-white/5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Tag tag={q.category} tone="violet" />
                <Tag tag={q.subTopic} tone="slate" />
                <Tag tag={q.difficulty} tone={difficultyTone(q.difficulty)} />
              </div>
              <div className="flex items-center gap-1">
                <button className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-violet-700 dark:hover:text-violet-300">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-rose-600 dark:hover:text-rose-300">
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
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "text-muted-foreground",
                    )}
                  >
                    <span className="font-mono font-semibold">{letter}.</span>
                    {o}
                    {isCorrect && (
                      <span className="ml-auto inline-flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        correct
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              <span className="text-violet-700 dark:text-violet-300">Explanation:</span>{" "}
              {q.explanation}
            </p>
          </div>
        ))}
      </div>
    </div>
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
  const [bulkOpen, setBulkOpen] = useState(false);

  const valid =
    title.trim() && diff && statement.trim() && signatures.trim();

  return (
    <div className="rounded-lg border border-black/10 bg-background p-6 shadow-sm dark:border-white/10">
      <div className="flex items-center gap-2">
        <Terminal className="h-4 w-4 text-violet-600 dark:text-violet-300" />
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
                  ? "border-violet-400/40 bg-violet-500/10 text-violet-700 dark:text-violet-200"
                  : "border-black/10 bg-muted/30 hover:bg-muted/50 dark:border-white/10",
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
          placeholder="Describe the problem, constraints, examples..."
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
          placeholder="function solve(arr: number[]): number&#10;# python: def solve(arr: list[int]) -> list[int]"
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

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          disabled={!valid}
          className="h-10 rounded-full bg-violet-500 px-5 text-white hover:bg-violet-600 disabled:opacity-50 dark:bg-violet-500 dark:hover:bg-violet-600"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Coding Problem
        </Button>
        <Button
          variant="outline"
          onClick={() => setBulkOpen(true)}
          className="h-10 rounded-full"
        >
          <Upload className="mr-1.5 h-4 w-4" />
          Bulk Upload CSV
        </Button>
        <Button
          variant="ghost"
          onClick={() => downloadCsvTemplate("coding")}
          className="h-10 rounded-full text-muted-foreground"
        >
          <FileText className="mr-1.5 h-4 w-4" />
          Download template
        </Button>
      </div>

      <BulkUploadDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        kind="coding"
      />
    </div>
  );
}

function CodingList() {
  return (
    <div className="overflow-hidden rounded-lg border border-black/10 bg-background shadow-sm dark:border-white/10">
      <div className="flex items-center justify-between border-b border-black/5 px-5 py-3 dark:border-white/5">
        <div>
          <p className="text-sm font-medium">Added problems</p>
          <p className="text-xs text-muted-foreground">
            {CODING_PROBLEMS.length} problems in this campaign
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-700 dark:text-sky-300">
          {CODING_PROBLEMS.length} total
        </span>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-black/10 hover:bg-transparent dark:border-white/10">
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
              className="border-black/5 hover:bg-muted/30 dark:border-white/5"
            >
              <TableCell className="pl-5 py-3">
                <p className="text-sm font-medium">{p.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {p.statement}
                </p>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Tag
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
                <Tag
                  tag={p.difficulty}
                  tone={difficultyTone(p.difficulty)}
                />
              </TableCell>
              <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                {p.visibleTests} visible · {p.hiddenTests} hidden
              </TableCell>
              <TableCell className="pr-5 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-violet-700 dark:hover:text-violet-300">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-rose-600 dark:hover:text-rose-300">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/* ---------- Bulk upload dialog (shared, two variants) ---------- */

function BulkUploadDialog({
  open,
  onOpenChange,
  kind,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  kind: "aptitude" | "coding";
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [stage, setStage] = useState<"select" | "preview" | "done">("select");
  const [parsing, setParsing] = useState(false);

  const isApt = kind === "aptitude";

  const reset = () => {
    setFileName(null);
    setStage("select");
    setParsing(false);
  };

  const close = () => {
    onOpenChange(false);
    setTimeout(reset, 250);
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setParsing(true);
    setTimeout(() => {
      setParsing(false);
      setStage("preview");
    }, 700);
  };

  const onConfirmImport = () => {
    setStage("done");
    setTimeout(close, 1500);
  };

  // Mock preview rows shown after a "parse"
  const previewRows = isApt
    ? [
        { c1: "Quant", c2: "Time & Work", c3: "Medium", c4: "If 5 men build a wall in 10 days..." },
        { c1: "Logical", c2: "Series", c3: "Easy", c4: "Find the next: 3, 6, 11, 18..." },
        { c1: "Verbal", c2: "Synonyms", c3: "Easy", c4: "Synonym of 'Tenacious'" },
        { c1: "DI", c2: "Pie charts", c3: "Hard", c4: "If pie shows 30/20/50 split..." },
      ]
    : [
        { c1: "DSA", c2: "Easy", c3: "3/7", c4: "Reverse a Linked List" },
        { c1: "DSA", c2: "Medium", c3: "3/7", c4: "Kth Largest Element" },
        { c1: "SQL", c2: "Medium", c3: "3/7", c4: "Department Top 3 Salaries" },
        { c1: "DSA", c2: "Hard", c3: "3/7", c4: "Word Ladder II" },
      ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-lg border-black/10 bg-card dark:border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="h-4 w-4 text-violet-600 dark:text-violet-300" />
            Bulk upload {isApt ? "aptitude questions" : "coding problems"}
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file. We&apos;ll parse it, show a preview, and let you
            confirm before importing.
          </DialogDescription>
        </DialogHeader>

        {/* Stage 1: file picker */}
        {stage === "select" && (
          <div className="mt-3 space-y-3">
            <label
              htmlFor={`bulk-${kind}`}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-black/15 bg-muted/30 px-4 py-8 text-center transition-colors hover:border-violet-400/60 hover:bg-violet-500/5 dark:border-white/15",
                fileName && "border-violet-400/60 bg-violet-500/5",
              )}
            >
              <div className="grid h-10 w-10 place-items-center rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-300">
                {parsing ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400/40 border-t-violet-500" />
                ) : fileName ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Upload className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {parsing
                    ? "Parsing CSV..."
                    : fileName
                      ? fileName
                      : "Click to choose a CSV file"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {parsing
                    ? "Validating column headers..."
                    : "Max 5MB · UTF-8 encoded · .csv only"}
                </p>
              </div>
              <input
                id={`bulk-${kind}`}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={onFileSelected}
                disabled={parsing}
              />
            </label>

            <div className="rounded-lg border border-black/5 bg-muted/30 p-3 text-xs text-muted-foreground dark:border-white/5">
              <p className="font-medium text-foreground/80">Required columns</p>
              <code className="mt-1.5 block overflow-x-auto whitespace-pre font-mono text-[11px] text-violet-700 dark:text-violet-300">
                {isApt
                  ? "category,sub_topic,difficulty,question_text,option_a,option_b,option_c,option_d,correct,explanation"
                  : "title,difficulty,type,statement,signatures,visible_tests,hidden_tests,time_limit_ms,memory_limit_kb,schema"}
              </code>
              <p className="mt-2">
                Don&apos;t have a CSV yet?{" "}
                <button
                  type="button"
                  onClick={() => downloadCsvTemplate(kind)}
                  className="font-medium text-violet-700 hover:underline dark:text-violet-300"
                >
                  <Download className="mr-1 inline h-3 w-3" />
                  Download the template
                </button>{" "}
                to fill in.
              </p>
            </div>
          </div>
        )}

        {/* Stage 2: preview */}
        {stage === "preview" && (
          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Preview</p>
                <p className="text-xs text-muted-foreground">
                  Found <span className="font-semibold text-foreground/80">{previewRows.length} valid rows</span> · 0 errors
                </p>
              </div>
              <button
                onClick={() => setStage("select")}
                className="inline-flex items-center gap-1 rounded-full border border-black/10 px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted dark:border-white/10"
              >
                <X className="h-3 w-3" />
                Pick another file
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto rounded-lg border border-black/5 dark:border-white/5">
              <Table>
                <TableHeader>
                  <TableRow className="border-black/5 hover:bg-transparent dark:border-white/5">
                    {isApt ? (
                      <>
                        <TableHead className="pl-3 text-xs">Category</TableHead>
                        <TableHead className="text-xs">Sub-topic</TableHead>
                        <TableHead className="text-xs">Diff</TableHead>
                        <TableHead className="pr-3 text-xs">Question</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead className="pl-3 text-xs">Type</TableHead>
                        <TableHead className="text-xs">Diff</TableHead>
                        <TableHead className="text-xs">Tests</TableHead>
                        <TableHead className="pr-3 text-xs">Title</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.map((r, i) => (
                    <TableRow
                      key={i}
                      className="border-black/5 dark:border-white/5"
                    >
                      {isApt ? (
                        <>
                          <TableCell className="pl-3 py-2 text-xs">{r.c1}</TableCell>
                          <TableCell className="py-2 text-xs">{r.c2}</TableCell>
                          <TableCell className="py-2 text-xs">{r.c3}</TableCell>
                          <TableCell className="pr-3 py-2 text-xs text-muted-foreground">
                            <span className="line-clamp-1">{r.c4}</span>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="pl-3 py-2 text-xs">{r.c1}</TableCell>
                          <TableCell className="py-2 text-xs">{r.c2}</TableCell>
                          <TableCell className="py-2 text-xs font-mono">{r.c3}</TableCell>
                          <TableCell className="pr-3 py-2 text-xs font-medium">
                            <span className="line-clamp-1">{r.c4}</span>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Stage 3: done */}
        {stage === "done" && (
          <div className="mt-3 flex flex-col items-center justify-center gap-2 py-6 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium">Imported successfully</p>
            <p className="text-xs text-muted-foreground">
              {previewRows.length} {isApt ? "questions" : "problems"} added to
              this campaign.
            </p>
          </div>
        )}

        <DialogFooter className="mt-4 flex gap-2">
          {stage !== "done" && (
            <Button
              variant="ghost"
              onClick={close}
              className="text-muted-foreground"
              disabled={parsing}
            >
              Cancel
            </Button>
          )}
          {stage === "preview" && (
            <Button
              onClick={onConfirmImport}
              className="bg-violet-500 text-white hover:bg-violet-600"
            >
              <Check className="mr-1.5 h-4 w-4" />
              Import {previewRows.length} {isApt ? "questions" : "problems"}
            </Button>
          )}
          {stage === "done" && (
            <Button onClick={close} className="bg-violet-500 text-white hover:bg-violet-600">
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- CSV template downloader ---------- */

/**
 * Build a CSV template (with header row + 2 example rows) for either
 * aptitude or coding, then trigger a browser download. Pure client-side —
 * no backend call. The user fills this in and re-uploads via the Bulk
 * Upload dialog.
 */
function downloadCsvTemplate(kind: "aptitude" | "coding") {
  if (typeof window === "undefined") return;
  const isApt = kind === "aptitude";
  const header = isApt
    ? [
        "category",
        "sub_topic",
        "difficulty",
        "question_text",
        "option_a",
        "option_b",
        "option_c",
        "option_d",
        "correct",
        "explanation",
      ].join(",")
    : [
        "title",
        "difficulty",
        "type",
        "statement",
        "signatures",
        "visible_tests",
        "hidden_tests",
        "time_limit_ms",
        "memory_limit_kb",
        "schema",
      ].join(",");

  // Example rows. Comma-bearing fields are quoted and inner quotes escaped,
  // per RFC 4180.
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const rows = isApt
    ? [
        [
          "Quant",
          "Time & Work",
          "Medium",
          esc("If 6 men can complete a task in 12 days, how long will 9 men take?"),
          esc("8 days"),
          esc("9 days"),
          esc("6 days"),
          esc("18 days"),
          "A",
          esc("Total man-days = 6 × 12 = 72. With 9 men, time = 72 / 9 = 8 days."),
        ].join(","),
        [
          "Logical",
          "Series",
          "Easy",
          esc("Find the next term: 2, 6, 12, 20, 30, ?"),
          esc("40"),
          esc("42"),
          esc("44"),
          esc("46"),
          "B",
          esc("Differences: 4, 6, 8, 10, 12. Next term = 30 + 12 = 42."),
        ].join(","),
      ]
    : [
        [
          esc("Two Sum (Sorted)"),
          "Easy",
          "DSA",
          esc("Given a sorted array of integers and a target, return the 1-based indices of the two numbers that add to target."),
          esc("function twoSum(arr: number[], target: number): number[]"),
          "3",
          "7",
          "1000",
          "256",
          "",
        ].join(","),
        [
          esc("Top 3 Products by Revenue"),
          "Medium",
          "SQL",
          esc("Given orders(order_id, product_id, qty, price, created_at), return the top 3 products by total revenue in the last 30 days."),
          esc("SELECT product_id, SUM(qty*price) AS revenue ..."),
          "3",
          "7",
          "2000",
          "512",
          esc("CREATE TABLE orders (order_id INT PRIMARY KEY, product_id INT, qty INT, price DECIMAL(10,2), created_at TIMESTAMP);"),
        ].join(","),
      ];

  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = isApt
    ? "aptitude_questions_template.csv"
    : "coding_problems_template.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ---------- helpers ---------- */

function difficultyTone(d: string) {
  if (d === "Easy") return "emerald" as const;
  if (d === "Medium") return "amber" as const;
  return "rose" as const;
}

function Tag({
  tag,
  tone,
  icon,
}: {
  tag: string;
  tone: "violet" | "emerald" | "amber" | "rose" | "sky" | "slate";
  icon?: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    violet: "border-violet-400/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    emerald: "border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    amber: "border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    rose: "border-rose-400/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    sky: "border-sky-400/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    slate: "border-black/15 bg-muted/40 text-muted-foreground dark:border-white/15",
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
