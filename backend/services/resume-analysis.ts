import { z } from "zod";
import { ResumeProcessingError } from "@/lib/server/resume-extraction";

export const RESUME_ANALYSIS_PROMPT_VERSION = "resume-ats-v2";

const grammarIssueSchema = z.object({
  line: z.number().int().nonnegative().optional(),
  issue: z.string().min(1),
  fix: z.string().min(1),
});

const improvementSchema = z.object({
  priority: z.enum(["high", "medium", "low"]).catch("medium"),
  action: z.string().min(1),
  reason: z.string().min(1),
});

const sectionAuditItemSchema = z.object({
  name: z.string(),
  status: z.enum(["pass", "warning", "fail"]).catch("warning"),
  score: z.number().int().min(0).max(100).default(70),
  findings: z.array(z.string()).default([]),
  recommendation: z.string().default(""),
});

const bulletAuditItemSchema = z.object({
  original: z.string(),
  section: z.string().optional(),
  isQuantified: z.boolean().default(false),
  weakVerbs: z.array(z.string()).default([]),
  starCompliant: z.boolean().default(false),
  lengthStatus: z.enum(["good", "too_short", "too_long"]).catch("good"),
  critique: z.string().default(""),
  suggestedRewrite: z.string().default(""),
  leadershipRewrite: z.string().optional(),
  technicalRewrite: z.string().optional(),
});

const redFlagSchema = z.object({
  type: z.string(),
  severity: z.enum(["critical", "warning", "info"]).catch("warning"),
  detail: z.string(),
  location: z.string().optional(),
  recruiterInsight: z.string().default(""),
});

const seniorityEstimationSchema = z.object({
  estimatedYears: z.number().min(0).max(50).default(1),
  level: z.string().default("Mid-Level"),
  titleInflationDetected: z.boolean().default(false),
  inflationDetails: z.string().optional(),
  careerProgression: z.string().default(""),
  scopeOfImpact: z.string().default(""),
});

const softSkillInferenceSchema = z.object({
  skill: z.string(),
  score: z.number().int().min(0).max(100).default(75),
  evidence: z.string().default(""),
});

const atsCompatibilitySchema = z.object({
  score: z.number().int().min(0).max(100).default(85),
  extractability: z.enum(["high", "medium", "low"]).catch("high"),
  twoColumnDetected: z.boolean().default(false),
  tablesDetected: z.boolean().default(false),
  headerFooterRisk: z.boolean().default(false),
  verdict: z.string().default(""),
});

const reportSchema = z.object({
  atsScore: z.number().int().min(0).max(100),
  overallScore: z.number().int().min(0).max(100),
  jobFitScore: z.number().int().min(0).max(100),
  summary: z.string().min(1).max(5000),
  skillsFound: z.array(z.string().min(1)).max(100).default([]),
  skillsMissing: z.array(z.string().min(1)).max(100).default([]),
  skillsRecommended: z.array(z.string().min(1)).max(100).default([]),
  grammarIssues: z.array(grammarIssueSchema).max(100).default([]),
  formattingIssues: z.array(z.string().min(1)).max(100).default([]),
  improvementPlan: z.array(improvementSchema).max(50).default([]),

  // High-Impact Features
  sectionAudit: z.array(sectionAuditItemSchema).default([]),
  bulletQuality: z.object({
    quantificationRate: z.number().int().min(0).max(100).default(0),
    quantifiedCount: z.number().int().default(0),
    totalBulletsAnalyzed: z.number().int().default(0),
    strongVerbsFound: z.array(z.string()).default([]),
    weakVerbsFound: z.array(z.string()).default([]),
    starComplianceScore: z.number().int().min(0).max(100).default(0),
    bullets: z.array(bulletAuditItemSchema).default([]),
  }).default({}),
  redFlags: z.array(redFlagSchema).default([]),
  seniorityEstimation: seniorityEstimationSchema.optional(),
  softSkills: z.array(softSkillInferenceSchema).default([]),
  atsCompatibility: atsCompatibilitySchema.optional(),
});

export type ResumeAnalysisReport = z.infer<typeof reportSchema>;

// JD Diff Schema
export const jdDiffSchema = z.object({
  tailoringScore: z.number().int().min(0).max(100),
  roleTitleDetected: z.string().default("Target Role"),
  companyDetected: z.string().default("Target Company"),
  verdict: z.string(),
  matchingKeywords: z.array(z.string()).default([]),
  missingKeywords: z.array(z.string()).default([]),
  missingRequirements: z.array(z.string()).default([]),
  tailoredBulletsSuggestions: z.array(
    z.object({
      original: z.string(),
      tailored: z.string(),
      keywordsCovered: z.array(z.string()).default([]),
    })
  ).default([]),
});

export type JobDescriptionDiff = z.infer<typeof jdDiffSchema>;

function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new ResumeProcessingError("GEMINI_NOT_CONFIGURED", "Gemini analysis is not configured.");
  return apiKey;
}

function candidateModels(): string[] {
  const configured = process.env.GEMINI_RESUME_MODEL || process.env.AI_MODEL;
  const list = [
    ...(configured ? [configured] : []),
    "gemini-3-flash-preview",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.6-flash",
  ];
  return Array.from(new Set(list));
}

function analysisTimeoutMs() {
  const configured = Number(process.env.GEMINI_RESUME_TIMEOUT_MS ?? 28_000);
  return Number.isInteger(configured) && configured >= 5_000 && configured <= 28_000 ? configured : 28_000;
}

function parseModelJson(value: string) {
  const withoutFence = value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(withoutFence) as unknown;
  } catch {
    const start = withoutFence.indexOf("{");
    const end = withoutFence.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(withoutFence.slice(start, end + 1)) as unknown;
    throw new ResumeProcessingError("GEMINI_INVALID_JSON", "Gemini returned an invalid resume report.");
  }
}

function score(value: unknown) {
  return typeof value === "number" ? Math.max(0, Math.min(100, Math.round(value))) : value;
}

function normalizeReport(value: unknown) {
  if (!value || typeof value !== "object") throw new ResumeProcessingError("GEMINI_INVALID_REPORT", "Gemini returned an invalid resume report.");
  const candidate = value as Record<string, unknown>;
  return reportSchema.parse({
    ...candidate,
    atsScore: score(candidate.atsScore),
    overallScore: score(candidate.overallScore),
    jobFitScore: score(candidate.jobFitScore),
  });
}

export async function analyzeResumeWithGemini(input: {
  resumeText: string;
  targetRole?: string | null;
  experienceLevel?: string | null;
}) {
  const apiKey = getGeminiApiKey();
  const models = candidateModels();
  const roleContext = input.targetRole?.trim() || "the candidate's target role";
  const levelContext = input.experienceLevel?.trim() || "unknown experience level";

  const prompt = `You are a world-class executive recruiter, ATS parsing specialist, and engineering hiring manager. Perform an exhaustive, recruiter-grade audit of the following resume for ${roleContext} at ${levelContext}.

Resume text:
${input.resumeText}

Analyze every aspect of this resume with rigorous detail. Return ONLY valid JSON matching this exact structure:
{
  "atsScore": 75,
  "overallScore": 80,
  "jobFitScore": 82,
  "summary": "Concise evidence-based executive summary of candidate strengths, risks, and trajectory.",
  "skillsFound": ["Skill 1", "Skill 2"],
  "skillsMissing": ["Missing critical skill 1", "Missing critical skill 2"],
  "skillsRecommended": ["Bonus skill 1", "Bonus skill 2"],
  "grammarIssues": [{"line": 1, "issue": "Specific typo or grammar error", "fix": "Exact fix"}],
  "formattingIssues": ["Formatting irregularity observed"],
  "improvementPlan": [{"priority": "high", "action": "Specific immediate action", "reason": "Why it impacts recruiter decision"}],

  "sectionAudit": [
    {
      "name": "Contact Information",
      "status": "pass",
      "score": 95,
      "findings": ["Email present", "Phone present", "LinkedIn verified"],
      "recommendation": "Optimization recommendation for this section"
    },
    {
      "name": "Summary / Objective",
      "status": "warning",
      "score": 65,
      "findings": ["Analysis findings for summary"],
      "recommendation": "Rewrite recommendation"
    },
    {
      "name": "Work Experience",
      "status": "pass",
      "score": 80,
      "findings": ["Analysis of roles, dates, locations, bullet count"],
      "recommendation": "Actionable advice"
    },
    {
      "name": "Education",
      "status": "pass",
      "score": 90,
      "findings": ["Degree, institution, graduation year, GPA"],
      "recommendation": "Actionable advice"
    },
    {
      "name": "Technical Skills",
      "status": "pass",
      "score": 85,
      "findings": ["Categorization vs flat list, currency of tech stack"],
      "recommendation": "Actionable advice"
    },
    {
      "name": "Projects",
      "status": "pass",
      "score": 85,
      "findings": ["Project presence, metrics, tech stack, links"],
      "recommendation": "Actionable advice"
    },
    {
      "name": "Certifications & Awards",
      "status": "warning",
      "score": 60,
      "findings": ["Certifications presence and validity"],
      "recommendation": "Actionable advice"
    }
  ],

  "bulletQuality": {
    "quantificationRate": 50,
    "quantifiedCount": 2,
    "totalBulletsAnalyzed": 4,
    "strongVerbsFound": ["Spearheaded", "Architected", "Engineered"],
    "weakVerbsFound": ["Worked on", "Responsible for", "Helped with"],
    "starComplianceScore": 65,
    "bullets": [
      {
        "original": "Exact text of a weak bullet from resume",
        "section": "Work Experience",
        "isQuantified": false,
        "weakVerbs": ["Worked on"],
        "starCompliant": false,
        "lengthStatus": "good",
        "critique": "Why this bullet is weak (lacks numbers, passive phrasing).",
        "suggestedRewrite": "High-impact rewrite with numbers, metrics, and strong verb.",
        "leadershipRewrite": "Leadership/ownership-oriented rewrite.",
        "technicalRewrite": "Deep technical architecture-oriented rewrite."
      }
    ]
  },

  "redFlags": [
    {
      "type": "Employment Gap / Date Inconsistency / Passive Phrasing",
      "severity": "warning",
      "detail": "Description of the specific red flag detected.",
      "location": "Section or role name",
      "recruiterInsight": "What recruiters think when they see this and how to neutralize it."
    }
  ],

  "seniorityEstimation": {
    "estimatedYears": 2,
    "level": "Junior",
    "titleInflationDetected": false,
    "careerProgression": "Trajectory analysis (promotions, steady growth, lateral moves).",
    "scopeOfImpact": "Individual contributor, feature ownership, team leadership, or organization-wide."
  },

  "softSkills": [
    {
      "skill": "Problem Solving",
      "score": 85,
      "evidence": "Evidence extracted from resume bullets."
    },
    {
      "skill": "Collaboration",
      "score": 80,
      "evidence": "Evidence extracted from resume bullets."
    },
    {
      "skill": "Initiative",
      "score": 90,
      "evidence": "Evidence extracted from resume bullets."
    },
    {
      "skill": "Communication",
      "score": 75,
      "evidence": "Evidence extracted from resume bullets."
    }
  ],

  "atsCompatibility": {
    "score": 90,
    "extractability": "high",
    "twoColumnDetected": false,
    "tablesDetected": false,
    "headerFooterRisk": false,
    "verdict": "Single-column clean structure. Standard headers parse cleanly across Greenhouse, Workday, and Lever."
  }
}

Rules:
- Be strict, accurate, and completely grounded in the resume text. Do not invent facts.
- In bulletQuality:
  * totalBulletsAnalyzed should count all bullets evaluated across both Experience AND Projects (minimum 5-8 bullets if present).
  * quantifiedCount is the count of those bullets containing measurable numbers, percentages (%), scale (e.g. 10k users), latency (ms), or dollar figures.
  * quantificationRate must equal Math.round((quantifiedCount / totalBulletsAnalyzed) * 100). If no bullets contain numbers/metrics, it is legitimately 0.
  * For the bullets array, select 3-5 weak or unquantified bullets from the resume and generate 3 high-impact rewrites for each (suggestedRewrite with realistic metrics, leadershipRewrite, technicalRewrite).
- Detect any red flags like date inconsistencies, future dates without 'Expected', unexplained gaps, or passive verb clusters.
- All scores are integers 0 to 100.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), analysisTimeoutMs());

  let lastError: Error | null = null;
  try {
    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
          {
            method: "POST",
            signal: controller.signal,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.1,
                responseMimeType: "application/json",
              },
            }),
          },
        );

        if (!response.ok) {
          const body = await response.text().catch(() => "");
          console.warn(`resume.gemini.model_failed`, model, response.status, body.slice(0, 200));
          lastError = new ResumeProcessingError("GEMINI_REQUEST_FAILED", `Gemini model ${model} failed (${response.status}).`);
          continue;
        }

        const payload = (await response.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
        if (!text) {
          lastError = new ResumeProcessingError("GEMINI_EMPTY_RESPONSE", "Gemini returned an empty resume report.");
          continue;
        }

        return { model, report: normalizeReport(parseModelJson(text)) };
      } catch (err) {
        if (controller.signal.aborted) throw err;
        console.warn(`resume.gemini.model_error`, model, err);
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    if (lastError instanceof ResumeProcessingError) throw lastError;
    throw new ResumeProcessingError("GEMINI_UNAVAILABLE", "Gemini is temporarily unavailable.");
  } finally {
    clearTimeout(timeout);
  }
}

export async function compareResumeWithJobDescription(input: {
  resumeText: string;
  jobDescription: string;
}): Promise<JobDescriptionDiff> {
  const apiKey = getGeminiApiKey();
  const models = candidateModels();

  const prompt = `You are an elite technical recruiter and ATS parsing specialist. Perform a side-by-side gap analysis comparing this candidate's resume with the target Job Description.

Resume:
${input.resumeText.slice(0, 8000)}

Target Job Description:
${input.jobDescription.slice(0, 8000)}

Return ONLY valid JSON matching this exact structure:
{
  "tailoringScore": 65,
  "roleTitleDetected": "Role title extracted from JD",
  "companyDetected": "Company name if present in JD or 'Target Employer'",
  "verdict": "2-3 sentence recruiter verdict on how well the candidate matches the specific requirements.",
  "matchingKeywords": ["Keyword 1", "Keyword 2"],
  "missingKeywords": ["Missing Keyword 1", "Missing Keyword 2"],
  "missingRequirements": ["Specific requirement from JD not found in resume"],
  "tailoredBulletsSuggestions": [
    {
      "original": "Existing or relevant experience from resume",
      "tailored": "Optimized bullet integrating missing JD keywords naturally with metrics",
      "keywordsCovered": ["Keyword A", "Keyword B"]
    }
  ]
}

Rules:
- tailoringScore is an integer 0 to 100 based on keyword overlap, role seniority match, and required qualifications.
- Suggest 2 to 4 tangible bullet additions that truthfully incorporate missing keywords.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
          {
            method: "POST",
            signal: controller.signal,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.1,
                responseMimeType: "application/json",
              },
            }),
          },
        );

        if (!response.ok) continue;

        const payload = (await response.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
        if (!text) continue;

        const parsed = parseModelJson(text);
        return jdDiffSchema.parse(parsed);
      } catch (err) {
        if (controller.signal.aborted) throw err;
      }
    }
    throw new ResumeProcessingError("JD_DIFF_UNAVAILABLE", "Job Description analysis is temporarily unavailable.");
  } finally {
    clearTimeout(timeout);
  }
}
