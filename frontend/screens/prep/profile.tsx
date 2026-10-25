"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AtSign,
  Briefcase,
  Calendar,
  CheckCircle2,
  Code2,
  Download,
  Globe,
  GraduationCap,
  Info,
  Loader2,
  LogOut,
  MapPin,
  Phone,
  Plus,
  Save,
  Upload,
  User,
  X,
} from "lucide-react";
import {
  PageWrap,
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
    <div className="min-h-screen bg-background text-foreground">
      <PageWrap>
        <BackToHome />
        <SectionHeading
          eyebrow="Student Profile"
          title={<>Your <span className="text-violet-500 dark:text-violet-400">profile</span></>}
          description="Everything you entered during onboarding lives here. Keep it current to personalize your AI interview questions, resume analysis, and learning roadmap."
          align="left"
        />

        <ProfileOverview />

        <div className="mt-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="flex w-full flex-wrap justify-start gap-1 rounded-full border border-black/10 bg-black/[0.02] p-1 h-auto dark:border-white/10 dark:bg-white/5">
              <TabsTrigger value="personal" className="rounded-full data-[state=active]:bg-violet-500/15 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-100">
                <User className="mr-1.5 h-3.5 w-3.5" /> Personal Info
              </TabsTrigger>
              <TabsTrigger value="education" className="rounded-full data-[state=active]:bg-violet-500/15 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-100">
                <GraduationCap className="mr-1.5 h-3.5 w-3.5" /> Education
              </TabsTrigger>
              <TabsTrigger value="skills" className="rounded-full data-[state=active]:bg-violet-500/15 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-100">
                <Code2 className="mr-1.5 h-3.5 w-3.5" /> Skills
              </TabsTrigger>
              <TabsTrigger value="prefs" className="rounded-full data-[state=active]:bg-violet-500/15 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-100">
                <Briefcase className="mr-1.5 h-3.5 w-3.5" /> Job Preferences
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-4">
              <PersonalTabLive />
            </TabsContent>
            <TabsContent value="education" className="mt-4">
              <EducationTabLive />
            </TabsContent>
            <TabsContent value="skills" className="mt-4">
              <SkillsTabLive />
            </TabsContent>
            <TabsContent value="prefs" className="mt-4">
              <PreferencesTabLive />
            </TabsContent>
          </Tabs>
        </div>

        <PrivacyControls />

      </PageWrap>
    </div>
  );
}

type ProfileOverviewData = {
  displayName: string;
  email: string;
  targetRole: string;
  completeness: number;
  skills: string[];
  education: string[];
};

function ProfileOverview() {
  const [summary, setSummary] = useState<ProfileOverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const responses = await Promise.all([
        fetch("/api/v1/me/profile"),
        fetch("/api/v1/me/education"),
        fetch("/api/v1/me/skills"),
      ]);
      const payloads = await Promise.all(responses.map((response) => response.json()));
      const failed = responses.findIndex((response) => !response.ok);
      if (failed >= 0) throw new Error(payloads[failed]?.error?.message ?? "Unable to load your profile overview.");

      const profile = payloads[0].data.profile;
      const education = payloads[1].data.entries as Array<{ degree: string; institution: string; graduationYear?: number | null }>;
      const skills = payloads[2].data.skills as Array<{ skill?: { normalizedName?: string } }>;
      setSummary({
        displayName: profile?.user?.displayName ?? "",
        email: profile?.user?.emailNormalized ?? "",
        targetRole: profile?.targetRole ?? "Not set yet",
        completeness: profile?.completenessPercent ?? 0,
        skills: skills.map((entry) => entry.skill?.normalizedName ?? "").filter(Boolean),
        education: education.map((entry) => [entry.degree, entry.institution, entry.graduationYear].filter(Boolean).join(" · ")),
      });
    };

    load().catch((cause: Error) => setError(cause.message));
  }, []);

  if (error) {
    return <p className="mt-6 rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300" role="alert">{error}</p>;
  }

  if (!summary) {
    return <div className="mt-6 rounded-lg border border-black/10 bg-card p-6 text-sm text-muted-foreground shadow-sm dark:border-white/10">Loading your saved profile…</div>;
  }

  return (
    <section className="mt-6 rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-violet-500/15 text-lg font-semibold text-violet-700 dark:text-violet-200">
            {summary.displayName.slice(0, 1).toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold">{summary.displayName || "Your profile"}</h2>
            <p className="truncate text-sm text-muted-foreground">{summary.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="w-fit border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200">
            {summary.completeness}% complete
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await fetch("/api/v1/auth/logout", { method: "POST" });
              } catch {}
              useNav.getState().setCurrentUserId(null);
              useNav.getState().set("auth");
            }}
            className="rounded-full border-destructive/30 text-xs font-medium text-destructive hover:bg-destructive/10"
          >
            <LogOut className="mr-1.5 h-3.5 w-3.5" />
            Log out
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><Briefcase className="h-3.5 w-3.5" /> Target role</div>
          <p className="mt-2 text-sm font-medium">{summary.targetRole}</p>
        </div>
        <div className="rounded-lg border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><Code2 className="h-3.5 w-3.5" /> Skills</div>
          <p className="mt-2 line-clamp-2 text-sm font-medium">{summary.skills.length ? summary.skills.join(" · ") : "Add your skills"}</p>
        </div>
        <div className="rounded-lg border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><GraduationCap className="h-3.5 w-3.5" /> Education</div>
          <p className="mt-2 line-clamp-2 text-sm font-medium">{summary.education.length ? summary.education.join(" · ") : "Add your education"}</p>
        </div>
      </div>
    </section>
  );
}

function PrivacyControls() {
  const router = useRouter();
  const [loading, setLoading] = useState<"export" | "delete" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestExport = async () => {
    setLoading("export");
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/v1/me/data/export", { method: "POST" });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error?.message ?? "Unable to request your export.");
      setMessage("Your export request is queued. We will email a secure download link within 7 business days.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to request your export.");
    } finally {
      setLoading(null);
    }
  };

  const requestDeletion = async () => {
    if (!window.confirm("Delete your account and all stored data? This action cannot be undone.")) return;
    setLoading("delete");
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/v1/me/data/delete", { method: "POST" });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error?.message ?? "Unable to request account deletion.");
      router.push("/");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to request account deletion.");
      setLoading(null);
    }
  };

  return (
    <section className="mt-6 rounded-lg border border-black/10 bg-card p-6 shadow-sm dark:border-white/10">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Privacy and data</p>
        <h3 className="mt-1 text-lg font-semibold tracking-tight">Control your data</h3>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Prep recordings and resume history are retained for 30 days by default. Your Prep media is private to your account.</p>
      </div>
      {(message || error) && <p className={cn("mt-4 rounded-md border px-3 py-2 text-xs", error ? "border-rose-400/30 bg-rose-500/10 text-rose-600 dark:text-rose-300" : "border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300")} role="status">{error ?? message}</p>}
      <div className="mt-5 flex flex-wrap gap-3">
        <Button onClick={requestExport} disabled={loading !== null} variant="outline" className="rounded-full border-black/10 dark:border-white/15"><Download className="mr-2 h-4 w-4" />{loading === "export" ? "Requesting..." : "Export my data"}</Button>
        <Button onClick={requestDeletion} disabled={loading !== null} variant="outline" className="rounded-full border-rose-400/30 text-rose-600 hover:bg-rose-500/10 dark:text-rose-300"><X className="mr-2 h-4 w-4" />{loading === "delete" ? "Processing..." : "Delete account and all data"}</Button>
        <Button
          onClick={async () => {
            try {
              await fetch("/api/v1/auth/logout", { method: "POST" });
            } catch {}
            useNav.getState().setCurrentUserId(null);
            useNav.getState().set("auth");
          }}
          variant="outline"
          className="rounded-full border-black/10 text-muted-foreground hover:text-foreground dark:border-white/15"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out of session
        </Button>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function SaveButton({ saved, onSave }: { saved: boolean; onSave?: () => Promise<void> }) {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try {
      await onSave?.();
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button
      onClick={handle}
      disabled={loading || saved}
      className="rounded-full bg-violet-500 text-white hover:bg-violet-600 disabled:opacity-60"
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
      {loading ? "Saving…" : saved ? "Saved" : "Save Changes"}
    </Button>
  );
}

function TabShell({ title, desc, children, saved, onSave }: { title: string; desc: string; children: React.ReactNode; saved?: boolean; onSave?: () => Promise<void> }) {
  return (
    <div className="rounded-lg border border-black/10 bg-card p-6 shadow-sm sm:p-8 dark:border-white/10">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
        </div>
        <SaveButton saved={!!saved} onSave={onSave} />
      </div>
      <div className="mt-6">{children}</div>
    </div>
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
          <div className="mt-2 flex flex-col items-center gap-3 rounded-lg border border-black/10 bg-black/[0.02] p-6 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="relative grid h-28 w-28 place-items-center rounded-full bg-violet-500 text-3xl font-semibold text-white shadow-sm">
              PS
              <span className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full border border-black/10 bg-card dark:border-white/15">
                <Upload className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
              </span>
            </div>
            <Button variant="outline" size="sm" className="rounded-full border-black/10 bg-black/[0.02] hover:bg-black/[0.05] dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10">
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
            <Field label="Portfolio (optional)" icon={Globe} value="priya.dev" />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Short Bio</Label>
            <textarea
              defaultValue="Backend engineer with 3 years of experience building FastAPI services that handle 2M+ requests/day. Strong with Postgres, Redis, and Kafka. Looking for SDE-2 backend roles."
              className="mt-1 h-24 w-full resize-none rounded-lg border border-black/10 bg-black/[0.02] px-3 py-2 text-sm outline-none focus:border-violet-400/40 focus:ring-2 focus:ring-violet-400/20 dark:border-white/10 dark:bg-white/5"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Used by the AI to personalize interview questions. Aim for 50-200 words.
            </p>
          </div>

          <div className="rounded-md border border-amber-400/20 bg-amber-500/[0.04] p-3 text-xs text-amber-700 dark:text-amber-200">
            <Badge variant="outline" className="mb-1 border-amber-400/30 bg-amber-500/10 text-[10px] uppercase tracking-widest text-amber-700 dark:text-amber-200">
              Why we ask
            </Badge>
            <p>
              Your city and DOB are used to align job recommendations with local eligibility (age + work authorization). This data never appears on reports shared with companies. Only on your personal dashboard.
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setSaved(true)} className="rounded-full bg-violet-500 text-white hover:bg-violet-600">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
        </div>
      </div>
    </TabShell>
  );
}

function PersonalTabLive() {
  const [profile, setProfile] = useState({ phone: "", dateOfBirth: "", city: "", linkedinUrl: "", githubUrl: "", portfolioUrl: "", bio: "" });
  const [user, setUser] = useState({ displayName: "", email: "" });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/me/profile")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error?.message ?? "Unable to load your profile.");
        const value = payload.data.profile;
        setUser({ displayName: value?.user?.displayName ?? "", email: value?.user?.emailNormalized ?? "" });
        setProfile({
          phone: value?.phone ?? "",
          dateOfBirth: value?.dateOfBirth ? String(value.dateOfBirth).slice(0, 10) : "",
          city: value?.city ?? "",
          linkedinUrl: value?.linkedinUrl ?? "",
          githubUrl: value?.githubUrl ?? "",
          portfolioUrl: value?.portfolioUrl ?? "",
          bio: value?.bio ?? "",
        });
      })
      .catch((cause: Error) => setError(cause.message));
  }, []);

  const update = (field: keyof typeof profile, value: string) => {
    setSaved(false);
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const save = async () => {
    setError(null);
    const response = await fetch("/api/v1/me/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...profile,
        dateOfBirth: profile.dateOfBirth || null,
        phone: profile.phone || null,
        city: profile.city || null,
        linkedinUrl: profile.linkedinUrl || null,
        githubUrl: profile.githubUrl || null,
        portfolioUrl: profile.portfolioUrl || null,
        bio: profile.bio || null,
      }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = payload?.error?.message ?? "Unable to save your profile.";
      setError(message);
      throw new Error(message);
    }
    setSaved(true);
  };

  return (
    <TabShell title="Personal Information" desc="Your name, contact, and avatar. Used on your dashboard and report header." saved={saved} onSave={save}>
      {error && <p className="mb-4 rounded-md border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-300" role="alert">{error}</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full Name" icon={User} value={user.displayName} disabled />
        <Field label="Phone Number" icon={Phone} value={profile.phone} onChange={(value) => update("phone", value)} />
        <Field label="Date of Birth" icon={Calendar} value={profile.dateOfBirth} type="date" onChange={(value) => update("dateOfBirth", value)} />
        <Field label="City" icon={MapPin} value={profile.city} onChange={(value) => update("city", value)} />
        <Field label="Email (read-only)" icon={AtSign} value={user.email} disabled />
        <Field label="LinkedIn (optional)" icon={AtSign} value={profile.linkedinUrl} onChange={(value) => update("linkedinUrl", value)} />
        <Field label="GitHub (optional)" icon={Code2} value={profile.githubUrl} onChange={(value) => update("githubUrl", value)} />
        <Field label="Portfolio (optional)" icon={Globe} value={profile.portfolioUrl} onChange={(value) => update("portfolioUrl", value)} />
        <div className="sm:col-span-2">
          <Label className="text-xs text-muted-foreground">Short Bio</Label>
          <textarea value={profile.bio} onChange={(event) => update("bio", event.target.value)} className="mt-1 h-24 w-full resize-none rounded-lg border border-black/10 bg-black/[0.02] px-3 py-2 text-sm outline-none focus:border-violet-400/40 focus:ring-2 focus:ring-violet-400/20 dark:border-white/10 dark:bg-white/5" />
        </div>
      </div>
    </TabShell>
  );
}

function EducationTabLive() {
  type EducationEntry = { degree: string; institution: string; field: string; graduationYear: string };
  const [entries, setEntries] = useState<EducationEntry[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/me/education")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error?.message ?? "Unable to load education.");
        setEntries(payload.data.entries.map((entry: { degree: string; institution: string; field?: string | null; graduationYear?: number | null }) => ({ degree: entry.degree, institution: entry.institution, field: entry.field ?? "", graduationYear: entry.graduationYear ? String(entry.graduationYear) : "" })));
      })
      .catch((cause: Error) => setError(cause.message));
  }, []);

  const update = (index: number, field: keyof EducationEntry, value: string) => {
    setSaved(false);
    setEntries((current) => current.map((entry, position) => position === index ? { ...entry, [field]: value } : entry));
  };

  const save = async () => {
    const response = await fetch("/api/v1/me/education", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ entries: entries.map((entry, position) => ({ ...entry, graduationYear: entry.graduationYear ? Number(entry.graduationYear) : null, position })) }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) { const message = payload?.error?.message ?? "Unable to save education."; setError(message); throw new Error(message); }
    setSaved(true);
  };

  return (
    <TabShell title="Education" desc="List every degree you hold. Used to align interview difficulty and resume scoring." saved={saved} onSave={save}>
      {error && <p className="mb-4 rounded-md border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-300" role="alert">{error}</p>}
      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div key={`${entry.degree}-${index}`} className="rounded-lg border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between"><span className="text-xs uppercase tracking-wider text-muted-foreground">Entry {index + 1}</span><button onClick={() => setEntries((current) => current.filter((_, position) => position !== index))} className="text-muted-foreground hover:text-rose-500" aria-label="Remove education entry"><X className="h-4 w-4" /></button></div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Input value={entry.degree} onChange={(event) => update(index, "degree", event.target.value)} placeholder="Degree" className="rounded-lg bg-black/[0.02] dark:bg-white/5" />
              <Input value={entry.institution} onChange={(event) => update(index, "institution", event.target.value)} placeholder="Institution" className="rounded-lg bg-black/[0.02] dark:bg-white/5" />
              <Input value={entry.graduationYear} onChange={(event) => update(index, "graduationYear", event.target.value)} placeholder="Graduation year" className="rounded-lg bg-black/[0.02] dark:bg-white/5" />
              <Input value={entry.field} onChange={(event) => update(index, "field", event.target.value)} placeholder="Field of study" className="rounded-lg bg-black/[0.02] dark:bg-white/5" />
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => setEntries((current) => [...current, { degree: "", institution: "", field: "", graduationYear: "" }])} className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-violet-400/30 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-700 hover:bg-violet-500/15 dark:text-violet-200"><Plus className="h-3.5 w-3.5" /> Add Education Row</button>
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
          <div key={i} className="rounded-lg border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Entry {i + 1}</span>
              {rows.length > 1 && (
                <button onClick={() => remove(i)} className="text-muted-foreground hover:text-rose-500" aria-label="Remove">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label className="text-[11px] text-muted-foreground">Degree</Label>
                <Select value={r.degree} onValueChange={(v) => update(i, "degree", v)}>
                  <SelectTrigger className="mt-1 w-full rounded-lg bg-black/[0.02] border-black/10 dark:bg-white/5 dark:border-white/10">
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
                  className="mt-1 rounded-lg bg-black/[0.02] border-black/10 dark:bg-white/5 dark:border-white/10"
                />
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground">Year of Graduation</Label>
                <Input
                  value={r.year}
                  onChange={(e) => update(i, "year", e.target.value)}
                  placeholder="2024"
                  className="mt-1 rounded-lg bg-black/[0.02] border-black/10 dark:bg-white/5 dark:border-white/10"
                />
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground">Field of Study</Label>
                <Input
                  value={r.field}
                  onChange={(e) => update(i, "field", e.target.value)}
                  placeholder="Computer Science"
                  className="mt-1 rounded-lg bg-black/[0.02] border-black/10 dark:bg-white/5 dark:border-white/10"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={add}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-violet-400/30 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-700 hover:bg-violet-500/15 dark:text-violet-200"
      >
        <Plus className="h-3.5 w-3.5" /> Add Education Row
      </button>

      <div className="mt-6 rounded-md border border-black/10 bg-black/[0.02] p-4 text-xs text-muted-foreground dark:border-white/10 dark:bg-white/[0.02]">
        <Info className="mr-1 inline h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
        Tip: Include any MOOC certifications or bootcamp programs too. They affect your AI-driven question difficulty.
      </div>
    </TabShell>
  );
}

function SkillsTabLive() {
  const [skills, setSkills] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/me/skills")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error?.message ?? "Unable to load skills.");
        setSkills(payload.data.skills.map((entry: { skill: { normalizedName: string } }) => entry.skill.normalizedName));
      })
      .catch((cause: Error) => setError(cause.message));
  }, []);

  const add = (value: string) => {
    const normalized = value.trim();
    if (!normalized || skills.some((skill) => skill.toLowerCase() === normalized.toLowerCase())) return;
    setSkills((current) => [...current, normalized]);
    setInput("");
    setSaved(false);
  };

  const save = async () => {
    const response = await fetch("/api/v1/me/skills", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ skills: skills.map((name, position) => ({ name, position })) }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) { const message = payload?.error?.message ?? "Unable to save skills."; setError(message); throw new Error(message); }
    setSaved(true);
  };

  return (
    <TabShell title="Skills" desc="Skills influence technical interview question selection." saved={saved} onSave={save}>
      {error && <p className="mb-4 rounded-md border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-300" role="alert">{error}</p>}
      <Label className="text-xs text-muted-foreground">Your Skills</Label>
      <div className="mt-1 flex flex-wrap items-center gap-1.5 rounded-lg border border-black/10 bg-black/[0.02] p-2 dark:border-white/10 dark:bg-white/5">
        {skills.map((skill) => <Badge key={skill} className="border-violet-400/30 bg-violet-500/15 text-violet-700 dark:text-violet-200">{skill}<button onClick={() => { setSkills((current) => current.filter((item) => item !== skill)); setSaved(false); }} className="ml-1" aria-label={`Remove ${skill}`}><X className="h-3 w-3" /></button></Badge>)}
        <input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); add(input); } }} placeholder="Type a skill and press Enter" className="min-w-[140px] flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground" />
      </div>
      {skills.length === 0 && <p className="mt-3 text-xs text-muted-foreground">No skills saved yet. Add the technologies you want to practice.</p>}
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
        <div className="mt-1 flex flex-wrap items-center gap-1.5 rounded-lg border border-black/10 bg-black/[0.02] p-2 dark:border-white/10 dark:bg-white/5">
          {skills.map((s) => (
            <Badge key={s} className="border-violet-400/30 bg-violet-500/15 text-violet-700 dark:text-violet-200">
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
                className="rounded-full border border-black/10 bg-black/[0.02] px-2.5 py-1 text-[11px] text-muted-foreground hover:border-violet-400/30 hover:text-violet-700 dark:border-white/10 dark:bg-white/5 dark:hover:text-violet-300"
              >
                + {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SkillStat label="Total skills" value={String(skills.length)} tone="text-violet-500 dark:text-violet-300" />
        <SkillStat label="Backend" value="4" tone="text-emerald-600 dark:text-emerald-300" />
        <SkillStat label="Frontend" value="1" tone="text-amber-600 dark:text-amber-300" />
        <SkillStat label="Infra" value="1" tone="text-sky-600 dark:text-sky-300" />
      </div>

      <div className="mt-6 rounded-md border border-emerald-400/20 bg-emerald-500/[0.04] p-4 text-xs text-emerald-700 dark:text-emerald-200">
        <Badge variant="outline" className="mb-1 border-emerald-400/30 bg-emerald-500/10 text-[10px] uppercase tracking-widest text-emerald-700 dark:text-emerald-200">
          Profile completeness
        </Badge>
        <p>
          Your profile is <strong>82% complete</strong>. Adding 2 more backend skills (Docker, CI/CD) would push you to 100%, unlocking more granular interview question sets.
        </p>
      </div>
    </TabShell>
  );
}

function PreferencesTabLive() {
  const [roles, setRoles] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [targetRole, setTargetRole] = useState("");
  const [exp, setExp] = useState("");
  const [salary, setSalary] = useState("");
  const [remote, setRemote] = useState("");
  const [shift, setShift] = useState("");
  const [notice, setNotice] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/me/profile")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error?.message ?? "Unable to load job preferences.");
        const value = payload.data.profile;
        setRoles(Array.isArray(value?.preferredRoles) ? value.preferredRoles : []);
        setLocations(Array.isArray(value?.preferredLocations) ? value.preferredLocations : []);
        setTargetRole(value?.targetRole ?? "");
        setExp(value?.experienceLevel ?? "");
        setSalary(value?.expectedSalary ?? "");
        setRemote(value?.remotePreference ?? "");
        setShift(value?.shiftPreference ?? "");
        setNotice(value?.noticePeriod ?? "");
      })
      .catch((cause: Error) => setError(cause.message));
  }, []);

  const save = async () => {
    const response = await fetch("/api/v1/me/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ targetRole: targetRole || null, experienceLevel: exp || null, expectedSalary: salary || null, remotePreference: remote || null, shiftPreference: shift || null, noticePeriod: notice || null, preferredRoles: roles, preferredLocations: locations }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) { const message = payload?.error?.message ?? "Unable to save job preferences."; setError(message); throw new Error(message); }
    setSaved(true);
  };

  const toggle = (items: string[], value: string, setter: (next: string[]) => void) => { setter(items.includes(value) ? items.filter((item) => item !== value) : [...items, value]); setSaved(false); };

  return (
    <TabShell title="Job Preferences" desc="These signals shape your Prep roadmap and future Hiring Mode recommendations." saved={saved} onSave={save}>
      {error && <p className="mb-4 rounded-md border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-300" role="alert">{error}</p>}
      <div className="space-y-5">
        <div><Label className="text-xs text-muted-foreground">Preferred Roles</Label><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">{ROLE_OPTIONS.map((role) => <button key={role} onClick={() => toggle(roles, role, setRoles)} className={cn("rounded-lg border px-3 py-2 text-xs font-medium", roles.includes(role) ? "border-violet-400/50 bg-violet-500/15 text-violet-700 dark:text-violet-100" : "border-black/10 bg-black/[0.02] text-muted-foreground dark:border-white/10 dark:bg-white/[0.02]")}>{roles.includes(role) && <CheckCircle2 className="mr-1 inline h-3 w-3" />}{role}</button>)}</div></div>
        <div><Label className="text-xs text-muted-foreground">Target Role</Label><Input value={targetRole} onChange={(event) => { setTargetRole(event.target.value); setSaved(false); }} placeholder="Backend Developer" className="mt-1 rounded-lg bg-black/[0.02] dark:bg-white/5" /></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><Label className="text-xs text-muted-foreground">Experience Level</Label><Select value={exp} onValueChange={(value) => { setExp(value); setSaved(false); }}><SelectTrigger className="mt-1 w-full rounded-lg bg-black/[0.02] dark:bg-white/5"><SelectValue placeholder="Choose level" /></SelectTrigger><SelectContent>{EXP_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></div><div><Label className="text-xs text-muted-foreground">Expected Salary</Label><Input value={salary} onChange={(event) => { setSalary(event.target.value); setSaved(false); }} placeholder="e.g. 18-25 LPA" className="mt-1 rounded-lg bg-black/[0.02] dark:bg-white/5" /></div></div>
        <div><Label className="text-xs text-muted-foreground">Preferred Locations</Label><div className="mt-2 flex flex-wrap gap-2">{CITY_SUGGESTIONS.map((location) => <button key={location} onClick={() => toggle(locations, location, setLocations)} className={cn("rounded-full border px-3 py-1.5 text-xs", locations.includes(location) ? "border-sky-400/50 bg-sky-500/10 text-sky-700 dark:text-sky-200" : "border-black/10 text-muted-foreground dark:border-white/10")}>{location}</button>)}</div></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><div><Label className="text-xs text-muted-foreground">Notice Period</Label><Input value={notice} onChange={(event) => { setNotice(event.target.value); setSaved(false); }} placeholder="30 days" className="mt-1 rounded-lg bg-black/[0.02] dark:bg-white/5" /></div><div><Label className="text-xs text-muted-foreground">Remote Preference</Label><Select value={remote} onValueChange={(value) => { setRemote(value); setSaved(false); }}><SelectTrigger className="mt-1 w-full rounded-lg bg-black/[0.02] dark:bg-white/5"><SelectValue placeholder="Choose" /></SelectTrigger><SelectContent><SelectItem value="remote">Remote only</SelectItem><SelectItem value="hybrid">Hybrid</SelectItem><SelectItem value="onsite">On-site only</SelectItem></SelectContent></Select></div><div><Label className="text-xs text-muted-foreground">Shift Preference</Label><Select value={shift} onValueChange={(value) => { setShift(value); setSaved(false); }}><SelectTrigger className="mt-1 w-full rounded-lg bg-black/[0.02] dark:bg-white/5"><SelectValue placeholder="Choose" /></SelectTrigger><SelectContent><SelectItem value="day">Day shift</SelectItem><SelectItem value="rotational">Rotational</SelectItem><SelectItem value="night">Night shift</SelectItem></SelectContent></Select></div></div>
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
                    "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                    sel
                      ? "border-violet-400/50 bg-violet-500/15 text-violet-700 dark:text-violet-100"
                      : "border-black/10 bg-black/[0.02] text-muted-foreground hover:border-black/20 hover:text-foreground dark:border-white/10 dark:bg-white/[0.02]",
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
              <SelectTrigger className="mt-1 w-full rounded-lg bg-black/[0.02] border-black/10 dark:bg-white/5 dark:border-white/10">
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
              className="mt-1 rounded-lg bg-black/[0.02] border-black/10 dark:bg-white/5 dark:border-white/10"
            />
          </div>
        </div>

        {/* Locations */}
        <div>
          <Label className="text-xs text-muted-foreground">Preferred Locations</Label>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 rounded-lg border border-black/10 bg-black/[0.02] p-2 dark:border-white/10 dark:bg-white/5">
            {locations.map((l) => (
              <Badge key={l} className="border-sky-400/30 bg-sky-500/10 text-sky-700 dark:text-sky-200">
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
                  className="rounded-full border border-black/10 bg-black/[0.02] px-2.5 py-1 text-[11px] text-muted-foreground hover:border-sky-400/30 hover:text-sky-700 dark:border-white/10 dark:bg-white/5 dark:hover:text-sky-300"
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
              <SelectTrigger className="mt-1 w-full rounded-lg bg-black/[0.02] border-black/10 dark:bg-white/5 dark:border-white/10">
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
              <SelectTrigger className="mt-1 w-full rounded-lg bg-black/[0.02] border-black/10 dark:bg-white/5 dark:border-white/10">
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
              <SelectTrigger className="mt-1 w-full rounded-lg bg-black/[0.02] border-black/10 dark:bg-white/5 dark:border-white/10">
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

        <div className="rounded-md border border-violet-400/20 bg-violet-500/[0.04] p-4 text-xs text-violet-700 dark:text-violet-200">
          <Info className="mr-1 inline h-3.5 w-3.5" />
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
  onChange,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  type?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="relative mt-1">
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type={type}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.value)}
          className={cn(
            "rounded-lg bg-black/[0.02] pl-9 border-black/10 dark:bg-white/5 dark:border-white/10",
            disabled && "opacity-60",
          )}
        />
      </div>
    </div>
  );
}

function SkillStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-lg border border-black/10 bg-black/[0.02] p-3 text-center dark:border-white/10 dark:bg-white/[0.03]">
      <p className={cn("text-2xl font-semibold tracking-tight", tone)}>{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
