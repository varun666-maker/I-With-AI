import { db } from "@/lib/db";
import { AttemptMode, AttemptRoundType, AttemptStatus } from "@prisma/client";
import { createInAppNotification } from "@/lib/server/notifications";

export interface SanitizedQuestion {
  id: string;
  position: number;
  category: string;
  subTopic: string | null;
  difficulty: string;
  questionText: string;
  options: string[];
}

export interface GradedQuestion extends SanitizedQuestion {
  selectedOption: string | null;
  correctOption: string;
  isCorrect: boolean;
  explanation: string | null;
  bookmarked: boolean;
}

export interface CategoryScore {
  category: string;
  total: number;
  attempted: number;
  correct: number;
  scorePercent: number;
}

export interface ProctoringTelemetry {
  tabSwitches: number;
  fullscreenExits: number;
  audioSpikes: number;
  copyPasteAttempts: number;
  mouseWindowLeaves: number;
  integrityScore: number;
  verdict: "Clean Session" | "Minor Inattentions" | "Attention Recommended";
}

export interface AptitudeScorecard {
  attemptId: string;
  status: AttemptStatus;
  startedAt: Date;
  submittedAt: Date;
  durationSecondsUsed: number;
  totalQuestions: number;
  attempted: number;
  unanswered: number;
  correct: number;
  incorrect: number;
  scorePercent: number;
  accuracyPercent: number;
  categoryBreakdown: CategoryScore[];
  tabSwitches: number;
  fullscreenExits: number;
  proctoringTelemetry?: ProctoringTelemetry;
  questions: GradedQuestion[];
}

function shuffleArray<T>(items: T[]): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function startAptitudeAttempt(userId: string) {
  // Stratified sampling blueprint:
  // 7 Quantitative, 7 Logical Reasoning, 6 Verbal Ability, 5 Data Interpretation / Analytical
  const [quantPool, logicalPool, verbalPool, diPool] = await Promise.all([
    db.aptitudeQuestion.findMany({
      where: { category: "Quantitative", status: "published" },
      select: { id: true, category: true, subTopic: true, difficulty: true, questionText: true, options: true },
    }),
    db.aptitudeQuestion.findMany({
      where: { category: "Logical Reasoning", status: "published" },
      select: { id: true, category: true, subTopic: true, difficulty: true, questionText: true, options: true },
    }),
    db.aptitudeQuestion.findMany({
      where: { category: "Verbal Ability", status: "published" },
      select: { id: true, category: true, subTopic: true, difficulty: true, questionText: true, options: true },
    }),
    db.aptitudeQuestion.findMany({
      where: {
        category: { in: ["Data Interpretation", "Analytical Reasoning"] },
        status: "published",
      },
      select: { id: true, category: true, subTopic: true, difficulty: true, questionText: true, options: true },
    }),
  ]);

  const sampledQuant = shuffleArray(quantPool).slice(0, 7);
  const sampledLogical = shuffleArray(logicalPool).slice(0, 7);
  const sampledVerbal = shuffleArray(verbalPool).slice(0, 6);
  const sampledDI = shuffleArray(diPool).slice(0, 5);

  const allSampled = shuffleArray([
    ...sampledQuant,
    ...sampledLogical,
    ...sampledVerbal,
    ...sampledDI,
  ]);

  if (allSampled.length < 25) {
    // Fallback in case of smaller database pool: take any remaining published
    const fallback = await db.aptitudeQuestion.findMany({
      where: { status: "published" },
      take: 25,
      select: { id: true, category: true, subTopic: true, difficulty: true, questionText: true, options: true },
    });
    allSampled.push(...fallback.slice(0, 25 - allSampled.length));
  }

  const now = new Date();
  const hardDeadline = new Date(now.getTime() + 30 * 60 * 1000 + 15 * 1000); // 30 mins + 15s grace

  // Create attempt and items
  const createdAttempt = await db.assessmentAttempt.create({
    data: {
      userId,
      mode: AttemptMode.PREP,
      roundType: AttemptRoundType.APTITUDE,
      status: AttemptStatus.IN_PROGRESS,
      startedAt: now,
      hardDeadlineAt: hardDeadline,
    },
  });

  try {
    // Insert in batches of 5 to prevent HTTP socket exhaustion
    const batchSize = 5;
    for (let i = 0; i < allSampled.length; i += batchSize) {
      const chunk = allSampled.slice(i, i + batchSize);
      await Promise.all(
        chunk.map((q, cIdx) =>
          db.aptitudeAttemptItem.create({
            data: {
              attemptId: createdAttempt.id,
              questionId: q.id,
              position: i + cIdx + 1,
            },
          })
        )
      );
    }
  } catch (err) {
    await db.assessmentAttempt.delete({ where: { id: createdAttempt.id } }).catch(() => {});
    throw err;
  }

  const sanitizedQuestions: SanitizedQuestion[] = allSampled.map((q, idx) => {
    let opts: string[] = [];
    if (Array.isArray(q.options)) {
      opts = q.options as string[];
    } else if (typeof q.options === "string") {
      try {
        const parsed = JSON.parse(q.options);
        if (Array.isArray(parsed)) opts = parsed;
      } catch {}
    }
    return {
      id: q.id,
      position: idx + 1,
      category: q.category,
      subTopic: q.subTopic,
      difficulty: q.difficulty,
      questionText: q.questionText,
      options: opts,
    };
  });

  return {
    attemptId: createdAttempt.id,
    startedAt: createdAttempt.startedAt,
    hardDeadlineAt: createdAttempt.hardDeadlineAt,
    durationSeconds: 1800,
    questions: sanitizedQuestions,
  };
}

export async function saveAptitudeAnswer(
  userId: string,
  attemptId: string,
  questionId: string,
  selectedOption: string | null,
  bookmarked?: boolean,
) {
  const attempt = await db.assessmentAttempt.findFirst({
    where: {
      id: attemptId,
      roundType: AttemptRoundType.APTITUDE,
      OR: [{ userId }, { mode: AttemptMode.PREP }],
    },
    select: { id: true, status: true, hardDeadlineAt: true },
  });

  if (!attempt) {
    throw new Error("ATTEMPT_NOT_FOUND");
  }

  if (attempt.status !== AttemptStatus.IN_PROGRESS) {
    throw new Error("ATTEMPT_ALREADY_FINISHED");
  }

  // Update item
  const updateData: {
    selectedOption?: string | null;
    bookmarked?: boolean;
    answeredAt?: Date;
  } = {};

  if (selectedOption !== undefined) {
    updateData.selectedOption = selectedOption;
    updateData.answeredAt = new Date();
  }

  if (bookmarked !== undefined) {
    updateData.bookmarked = bookmarked;
  }

  const item = await db.aptitudeAttemptItem.findFirst({
    where: { attemptId, questionId },
    select: { id: true },
  });
  if (item) {
    await db.aptitudeAttemptItem.update({
      where: { id: item.id },
      data: updateData,
    });
  }

  return { success: true };
}

export async function submitAptitudeAttempt(
  userId: string,
  attemptId: string,
  telemetry?: {
    tabSwitches?: number;
    fullscreenExits?: number;
    audioSpikes?: number;
    copyPasteAttempts?: number;
    mouseWindowLeaves?: number;
  },
): Promise<AptitudeScorecard> {
  const attempt = await db.assessmentAttempt.findFirst({
    where: {
      id: attemptId,
      roundType: AttemptRoundType.APTITUDE,
      OR: [{ userId }, { mode: AttemptMode.PREP }],
    },
    include: {
      aptitudeItems: {
        include: { question: true },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!attempt) {
    throw new Error("ATTEMPT_NOT_FOUND");
  }

  const now = new Date();
  const isOverdue = attempt.hardDeadlineAt ? now > attempt.hardDeadlineAt : false;
  const finalStatus = isOverdue ? AttemptStatus.AUTO_SUBMITTED : AttemptStatus.SUBMITTED;

  let totalCorrect = 0;
  let totalAttempted = 0;
  const categoryMap = new Map<string, { total: number; attempted: number; correct: number }>();

  const gradedQuestions: GradedQuestion[] = attempt.aptitudeItems.map((item) => {
    const q = item.question;
    const cat = q.category;
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, { total: 0, attempted: 0, correct: 0 });
    }
    const catStats = categoryMap.get(cat)!;
    catStats.total += 1;

    const hasAnswer = item.selectedOption !== null && item.selectedOption !== "";
    if (hasAnswer) {
      totalAttempted += 1;
      catStats.attempted += 1;
    }

    // Determine correctness
    // In seed.json, correctOption is "A", "B", "C", "D".
    // Options is ["optA", "optB", "optC", "optD"].
    // The client may submit "A", "B", "C", "D" or the option text itself.
    const optionLabels = ["A", "B", "C", "D"];
    const optionsArray = Array.isArray(q.options) ? (q.options as string[]) : [];

    let isCorrect = false;
    if (hasAnswer && item.selectedOption) {
      const selected = item.selectedOption.trim().toUpperCase();
      const correctKey = q.correctOption.trim().toUpperCase();
      const correctIndex = optionLabels.indexOf(correctKey);
      const correctText = correctIndex >= 0 ? optionsArray[correctIndex]?.trim().toLowerCase() : "";

      if (selected === correctKey) {
        isCorrect = true;
      } else if (correctText && item.selectedOption.trim().toLowerCase() === correctText) {
        isCorrect = true;
      } else if (optionLabels.indexOf(selected) >= 0 && optionLabels.indexOf(selected) === correctIndex) {
        isCorrect = true;
      }
    }

    if (isCorrect) {
      totalCorrect += 1;
      catStats.correct += 1;
    }

    return {
      id: q.id,
      position: item.position,
      category: q.category,
      subTopic: q.subTopic,
      difficulty: q.difficulty,
      questionText: q.questionText,
      options: optionsArray,
      selectedOption: item.selectedOption,
      correctOption: q.correctOption,
      isCorrect,
      explanation: q.explanation,
      bookmarked: item.bookmarked,
    };
  });

  // Persist grades in DB in batches of 5
  const updateBatchSize = 5;
  for (let i = 0; i < attempt.aptitudeItems.length; i += updateBatchSize) {
    const chunk = attempt.aptitudeItems.slice(i, i + updateBatchSize);
    await Promise.all(
      chunk.map((item, cIdx) => {
        const g = gradedQuestions[i + cIdx];
        return db.aptitudeAttemptItem.update({
          where: { id: item.id },
          data: {
            correct: g.isCorrect,
            score: g.isCorrect ? 1.0 : 0.0,
            explanationSnapshot: {
              correctOption: g.correctOption,
              explanation: g.explanation,
            },
          },
        });
      })
    );
  }

  await db.assessmentAttempt.update({
    where: { id: attempt.id },
    data: {
      status: finalStatus,
      submittedAt: now,
      autoSubmitted: isOverdue,
    },
  });

  // Emit in-app notification for active assessment submission
  try {
    const scorePercentPreview = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    await createInAppNotification(db, {
      userId,
      type: "APTITUDE_COMPLETED",
      payload: {
        title: "Aptitude Evaluation Ready",
        message: `Your 25-question aptitude test scored ${scorePercentPreview}%. Breakdown and explanations are ready.`,
        screen: "aptitude",
      },
    });
  } catch {
    // Non-blocking notification
  }

  const totalQuestions = gradedQuestions.length;
  const unanswered = totalQuestions - totalAttempted;
  const incorrect = totalAttempted - totalCorrect;
  const scorePercent = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const accuracyPercent = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const startTime = attempt.startedAt ? attempt.startedAt.getTime() : now.getTime();
  const durationSecondsUsed = Math.min(1800, Math.max(0, Math.round((now.getTime() - startTime) / 1000)));

  const categoryBreakdown: CategoryScore[] = Array.from(categoryMap.entries()).map(([cat, stats]) => ({
    category: cat,
    total: stats.total,
    attempted: stats.attempted,
    correct: stats.correct,
    scorePercent: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
  }));

  const tabSwitches = telemetry?.tabSwitches ?? 0;
  const fullscreenExits = telemetry?.fullscreenExits ?? 0;
  const audioSpikes = telemetry?.audioSpikes ?? 0;
  const copyPasteAttempts = telemetry?.copyPasteAttempts ?? 0;
  const mouseWindowLeaves = telemetry?.mouseWindowLeaves ?? 0;

  const penalty =
    tabSwitches * 10 +
    fullscreenExits * 15 +
    audioSpikes * 5 +
    copyPasteAttempts * 10 +
    mouseWindowLeaves * 5;
  const integrityScore = Math.max(0, Math.min(100, 100 - penalty));
  const verdict: "Clean Session" | "Minor Inattentions" | "Attention Recommended" =
    integrityScore >= 85
      ? "Clean Session"
      : integrityScore >= 60
      ? "Minor Inattentions"
      : "Attention Recommended";

  return {
    attemptId: attempt.id,
    status: finalStatus,
    startedAt: attempt.startedAt ?? now,
    submittedAt: now,
    durationSecondsUsed,
    totalQuestions,
    attempted: totalAttempted,
    unanswered,
    correct: totalCorrect,
    incorrect,
    scorePercent,
    accuracyPercent,
    categoryBreakdown,
    tabSwitches,
    fullscreenExits,
    proctoringTelemetry: {
      tabSwitches,
      fullscreenExits,
      audioSpikes,
      copyPasteAttempts,
      mouseWindowLeaves,
      integrityScore,
      verdict,
    },
    questions: gradedQuestions,
  };
}

export async function getAptitudeHistory(userId: string) {
  const attempts = await db.assessmentAttempt.findMany({
    where: {
      userId,
      mode: AttemptMode.PREP,
      roundType: AttemptRoundType.APTITUDE,
      status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.AUTO_SUBMITTED] },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      aptitudeItems: {
        select: { correct: true, score: true },
      },
    },
  });

  return attempts.map((a) => {
    const total = a.aptitudeItems.length;
    const correct = a.aptitudeItems.filter((i) => i.correct === true).length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    return {
      id: a.id,
      status: a.status,
      scorePercent: score,
      correctCount: correct,
      totalCount: total,
      startedAt: a.startedAt,
      submittedAt: a.submittedAt,
      createdAt: a.createdAt,
    };
  });
}
