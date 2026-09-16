"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AtSign,
  Briefcase,
  Calendar,
  CheckCircle2,
  Code2,
  GraduationCap,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Save,
  Sparkles,
  Upload,
  User,
  X,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNav } from "@/lib/store";
import { cn } from "@/lib/utils";

const DEGREE_OPTIONS = [
  "B.Tech", "B.E.", "B.Sc", "B.A.", "B.Com",
  "M.Tech", "M.E.", "M.Sc", "MCA", "MBA", "Ph.D.",
];

const ROLE_OPTIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Full-stack Developer",
  "Data Scientist",
  "Data Analyst",
  "DevOps Engineer",
  "Mobile Developer",
  "ML Engineer",
  "Product Manager",
  "Engineering Manager",
];

const EXP_OPTIONS = ["Fresher (0-1)", "Junior (1-3)", "Mid (3-5)", "Senior (5-8)", "Staff (8+)"];

const SKILL_SUGGESTIONS = [
  "Python", "Java", "JavaScript", "TypeScript", "React", "Node.js", "FastAPI",
  "Django", "Flask", "SQL", "PostgreSQL", "MongoDB", "Redis", "Docker",
  "Kubernetes", "AWS", "GCP", "Azure", "GraphQL", "REST", "Kafka",
  "TensorFlow", "PyTorch", "Pandas", "NumPy", "Spark", "Git", "CI/CD",
  "System Design", "Microservices",
];

const CITY_SUGGESTIONS = ["Bengaluru", "Mumbai", "Delhi NCR", "Hyderabad", "Pune", "Chennai", "Remote"];

export function StudentProfile() {
  return (
    <AuroraBackground showGrid={false}>
      <PageWrap>
        <BackToHome />
        <SectionHeading
          eyebrow="Student Profile"
          title={<>Your <span className="gradient-text">profile</span></>}
          description="This data personalizes your AI interview questions, resume analysis, and learning roadmap. Keep it current — the more accurate your profile, the more targeted your prep."
          align="left"
        />

        <div className="mt-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="flex w-full flex-wrap justify-start gap-1 rounded-full border border-white/10 bg-white/5 p-1 h-auto">
              <TabsTrigger value="personal" className="rounded-full data-[state=active]:bg-violet-500/15 data-[state=active]:text-violet-100">
                <User className="mr-1.5 h-3.5 w-3.5" /> Personal Info
              </TabsTrigger>
              <TabsTrigger value="education" className="rounded-full data-[state=active]:bg-violet-500/15 data-[state=active]:text-violet-100">
                <GraduationCap className="mr-1.5 h-3.5 w-3.5" /> Education
              </TabsTrigger>
              <TabsTrigger value="skills" className="rounded-full data-[state=active]:bg-violet-500/15 data-[state=active]:text-violet-100">
                <Code2 className="mr-1.5 h-3.5 w-3.5" /> Skills
              </TabsTrigger>
              <TabsTrigger value="prefs" className="rounded-full data-[state=active]:bg-violet-500/15 data-[state=active]:text-violet-100">
                <Briefcase className="mr-1.5 h-3.5 w-3.5" /> Job Preferences
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-4">
              <PersonalTab />
            </TabsContent>
            <TabsContent value="education" className="mt-4">
              <EducationTab />
            </TabsContent>
            <TabsContent value="skills" className="mt-4">
              <SkillsTab />
            </TabsContent>
            <TabsContent value="prefs" className="mt-4">
              <PreferencesTab />
            </TabsContent>
          </Tabs>
        </div>

      </PageWrap>
    </AuroraBackground>
  );
}

/* -------------------------------------------------------------------------- */

function SaveButton({ saved }: { saved: boolean }) {
  const [loading, setLoading] = useState(false);
  const handle = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 900);
  };
  return (
    <Button
      onClick={handle}
      disabled={loading || saved}
      className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0 disabled:opacity-60"
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
      {loading ? "Saving…" : saved ? "Saved" : "Save Changes"}
    </Button>
  );
}

function TabShell({ title, desc, children, saved }: { title: string; desc: string; children: React.ReactNode; saved?: boolean }) {
  return (
    <GlowCard className="p-6 sm:p-8">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
        </div>
        <SaveButton saved={!!saved} />
      </div>
      <div className="mt-6">{children}</div>
    </GlowCard>
  );
}

function PersonalTab() {
  const [saved, setSaved] = useState(false);
  return (
    <TabShell
      title="Personal Information"
      desc="Your name, contact, and avatar. Used on your dashboard and report header."
      saved={saved}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Avatar */}
        <div className="lg:col-span-1">
          <Label className="text-xs text-muted-foreground">Avatar</Label>
          <div className="mt-2 flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <div className="relative grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-3xl font-semibold text-white shadow-2xl">
              PS
              <span className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-card/90 backdrop-blur-xl">
                <Upload className="h-3.5 w-3.5 text-violet-300" />
              </span>
            </div>
            <Button variant="outline" size="sm" className="rounded-full border-white/15 bg-white/5 hover:bg-white/10">
              <Upload className="mr-2 h-3.5 w-3.5" /> Upload Image
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">
              PNG, JPG or GIF · max 2&nbsp;MB · Square 1:1 preferred
            </p>
          </div>
        </div>

        {/* Fields */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full Name" icon={User} value="Priya Sharma" />
            <Field label="Phone Number" icon={Phone} value="+91 98765 43210" />
            <Field label="Date of Birth" icon={Calendar} value="1999-08-14" type="date" />
            <Field label="City" icon={MapPin} value="Bengaluru" />
            <Field label="Email (read-only)" icon={AtSign} value="priya@email.com" disabled />
            <Field label="LinkedIn (optional)" icon={AtSign} value="linkedin.com/in/priya" />
            <Field label="GitHub (optional)" icon={Code2} value="github.com/priya" />
            <Field label="Portfolio (optional)" icon={Sparkles} value="priya.dev" />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Short Bio</Label>
            <textarea
              defaultValue="Backend engineer with 3 years of experience building FastAPI services that handle 2M+ requests/day. Strong with Postgres, Redis, and Kafka. Looking for SDE-2 backend roles."
              className="mt-1 h-24 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-violet-400/40 focus:ring-2 focus:ring-violet-400/20"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Used by the AI to personalize interview questions. Aim for 50-200 words.
            </p>
          </div>

          <div className="rounded-md border border-amber-400/20 bg-amber-500/[0.04] p-3 text-xs text-amber-200">
            <PulseBadge color="amber" className="mb-1 text-[10px] uppercase tracking-widest">
              Why we ask
            </PulseBadge>
            <p>
              Your city and DOB are used to align job recommendations with local eligibility (age + work authorization). This data never appears on reports shared with companies — only on your personal dashboard.
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setSaved(true)} className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
        </div>
      </div>
    </TabShell>
  );
}

function EducationTab() {
  const [rows, setRows] = useState([
    { degree: "B.Tech", institution: "IIT Bombay", year: "2022", field: "Computer Science" },
    { degree: "M.Tech", institution: "IISc Bangalore", year: "2024", field: "Systems & Data" },
  ]);
  const add = () => setRows([...rows, { degree: "B.Tech", institution: "", year: "", field: "" }]);
  const remove = (i: number) => setRows(rows.filter((_, idx) => idx !== i));
  const update = (i: number, key: keyof typeof rows[0], v: string) =>
    setRows(rows.map((r, idx) => (idx === i ? { ...r, [key]: v } : r)));

  return (
    <TabShell
      title="Education"
      desc="List every degree you hold. Used to align interview difficulty and resume scoring."
    >
      <div className="space-y-3">
        {rows.map((r, i) => (
          <div key={i} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Entry {i + 1}</span>
              {rows.length > 1 && (
                <button onClick={() => remove(i)} className="text-muted-foreground hover:text-rose-300" aria-label="Remove">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label className="text-[11px] text-muted-foreground">Degree</Label>
                <Select value={r.degree} onValueChange={(v) => update(i, "degree", v)}>
                  <SelectTrigger className="mt-1 w-full rounded-lg bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEGREE_OPTIONS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground">Institution</Label>
                <Input
                  value={r.institution}
                  onChange={(e) => update(i, "institution", e.target.value)}
                  placeholder="e.g. IIT Bombay"
                  className="mt-1 rounded-lg bg-white/5 border-white/10"
                />
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground">Year of Graduation</Label>
                <Input
                  value={r.year}
                  onChange={(e) => update(i, "year", e.target.value)}
                  placeholder="2024"
                  className="mt-1 rounded-lg bg-white/5 border-white/10"
                />
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground">Field of Study</Label>
                <Input
                  value={r.field}
                  onChange={(e) => update(i, "field", e.target.value)}
                  placeholder="Computer Science"
                  className="mt-1 rounded-lg bg-white/5 border-white/10"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={add}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-violet-400/30 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-200 hover:bg-violet-500/15"
      >
        <Plus className="h-3.5 w-3.5" /> Add Education Row
      </button>

      <div className="mt-6 rounded-md border border-white/10 bg-white/[0.02] p-4 text-xs text-muted-foreground">
        <Sparkles className="mr-1 inline h-3.5 w-3.5 text-violet-300" />
        Tip: Include any MOOC certifications or bootcamp programs too — they affect your AI-driven question difficulty.
      </div>
    </TabShell>
  );
}

function SkillsTab() {
  const [skills, setSkills] = useState<string[]>(["Python", "FastAPI", "React", "SQL", "PostgreSQL", "Redis"]);
  const [input, setInput] = useState("");

  const suggestions = useMemo(
    () =>
      SKILL_SUGGESTIONS.filter(
        (s) =>
          s.toLowerCase().includes(input.toLowerCase()) &&
          !skills.some((x) => x.toLowerCase() === s.toLowerCase()),
      ).slice(0, 6),
    [input, skills],
  );

  const add = (s: string) => {
    if (!s.trim()) return;
    if (!skills.includes(s)) setSkills([...skills, s]);
    setInput("");
  };
  const remove = (s: string) => setSkills(skills.filter((x) => x !== s));

  return (
    <TabShell
      title="Skills"
      desc="Tag-input with autocomplete. Each skill you add directly influences the AI's question selection in technical interviews."
    >
      <div>
        <Label className="text-xs text-muted-foreground">Your Skills</Label>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 p-2">
          {skills.map((s) => (
            <Badge key={s} className="border-violet-400/30 bg-violet-500/15 text-violet-200">
              {s}
              <button onClick={() => remove(s)} className="ml-1" aria-label={`Remove ${s}`}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); add(input); }
            }}
            placeholder="Type a skill and press Enter…"
            className="min-w-[140px] flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {suggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="text-[11px] text-muted-foreground">Suggestions:</span>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => add(s)}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground hover:border-violet-400/30 hover:text-violet-200"
              >
                + {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SkillStat label="Total skills" value={String(skills.length)} tone="text-violet-300" />
        <SkillStat label="Backend" value="4" tone="text-emerald-300" />
        <SkillStat label="Frontend" value="1" tone="text-amber-300" />
        <SkillStat label="Infra" value="1" tone="text-sky-300" />
      </div>

      <div className="mt-6 rounded-md border border-emerald-400/20 bg-emerald-500/[0.04] p-4 text-xs text-emerald-200">
        <PulseBadge color="emerald" className="mb-1 text-[10px] uppercase tracking-widest">
          Profile completeness
        </PulseBadge>
        <p>
          Your profile is <strong>82% complete</strong>. Adding 2 more backend skills (Docker, CI/CD) would push you to 100% — unlocking more granular interview question sets.
        </p>
      </div>
    </TabShell>
  );
}

function PreferencesTab() {
  const [roles, setRoles] = useState<string[]>(["Backend Developer", "Full-stack Developer"]);
  const [exp, setExp] = useState("Junior (1-3)");
  const [salary, setSalary] = useState("18-25 LPA");
  const [locations, setLocations] = useState<string[]>(["Bengaluru", "Remote"]);

  const [locInput, setLocInput] = useState("");
  const locSuggest = useMemo(
    () =>
      CITY_SUGGESTIONS.filter(
        (c) =>
          c.toLowerCase().includes(locInput.toLowerCase()) &&
          !locations.some((x) => x.toLowerCase() === c.toLowerCase()),
      ).slice(0, 4),
    [locInput, locations],
  );

  const toggleRole = (r: string) =>
    setRoles(roles.includes(r) ? roles.filter((x) => x !== r) : [...roles, r]);
  const addLoc = (l: string) => {
    if (!l.trim()) return;
    if (!locations.includes(l)) setLocations([...locations, l]);
    setLocInput("");
  };
  const removeLoc = (l: string) => setLocations(locations.filter((x) => x !== l));

  return (
    <TabShell
      title="Job Preferences"
      desc="These signals shape the company invites you receive (Hiring Mode) and the AI's role-targeted interview questions (Prep Mode)."
    >
      <div className="space-y-6">
        {/* Roles */}
        <div>
          <Label className="text-xs text-muted-foreground">Preferred Roles (multi-select)</Label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {ROLE_OPTIONS.map((r) => {
              const sel = roles.includes(r);
              return (
                <button
                  key={r}
                  onClick={() => toggleRole(r)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                    sel
                      ? "border-violet-400/50 bg-violet-500/15 text-violet-100"
                      : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/20 hover:text-white",
                  )}
                >
                  {sel && <CheckCircle2 className="mr-1 inline h-3 w-3" />}
                  {r}
                </button>
              );
            })}
          </div>
        </div>

        {/* Experience + Salary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-xs text-muted-foreground">Experience Level</Label>
            <Select value={exp} onValueChange={setExp}>
              <SelectTrigger className="mt-1 w-full rounded-lg bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXP_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Expected Salary (CTC)</Label>
            <Input
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="e.g. 18-25 LPA"
              className="mt-1 rounded-lg bg-white/5 border-white/10"
            />
          </div>
        </div>

        {/* Locations */}
        <div>
          <Label className="text-xs text-muted-foreground">Preferred Locations</Label>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 p-2">
            {locations.map((l) => (
              <Badge key={l} className="border-sky-400/30 bg-sky-500/10 text-sky-200">
                <MapPin className="mr-1 h-3 w-3" />
                {l}
                <button onClick={() => removeLoc(l)} className="ml-1" aria-label={`Remove ${l}`}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <input
              value={locInput}
              onChange={(e) => setLocInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); addLoc(locInput); }
              }}
              placeholder="Type a city…"
              className="min-w-[120px] flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          {locSuggest.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="text-[11px] text-muted-foreground">Suggestions:</span>
              {locSuggest.map((c) => (
                <button
                  key={c}
                  onClick={() => addLoc(c)}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground hover:border-sky-400/30 hover:text-sky-200"
                >
                  + {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notice + Remote + Shift */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label className="text-xs text-muted-foreground">Notice Period</Label>
            <Select defaultValue="30">
              <SelectTrigger className="mt-1 w-full rounded-lg bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Immediate</SelectItem>
                <SelectItem value="15">15 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Open to Remote?</Label>
            <Select defaultValue="hybrid">
              <SelectTrigger className="mt-1 w-full rounded-lg bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remote">Remote only</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="onsite">On-site only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Shift Preference</Label>
            <Select defaultValue="day">
              <SelectTrigger className="mt-1 w-full rounded-lg bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day shift</SelectItem>
                <SelectItem value="rotational">Rotational</SelectItem>
                <SelectItem value="night">Night shift</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border border-violet-400/20 bg-violet-500/[0.04] p-4 text-xs text-violet-200">
          <Sparkles className="mr-1 inline h-3.5 w-3.5" />
          Saved preferences are visible to recruiters in Hiring Mode. You can opt out anytime under <em>Settings → Visibility</em>.
        </div>
      </div>
    </TabShell>
  );
}

/* -------------------------------------------------------------------------- */

function Field({
  label,
  icon: Icon,
  value,
  type = "text",
  disabled,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="relative mt-1">
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type={type}
          defaultValue={value}
          disabled={disabled}
          className={cn(
            "rounded-lg bg-white/5 pl-9 border-white/10",
            disabled && "opacity-60",
          )}
        />
      </div>
    </div>
  );
}

function SkillStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center">
      <p className={cn("text-2xl font-semibold tracking-tight", tone)}>{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
