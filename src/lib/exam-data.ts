import "server-only";

import { randomUUID } from "node:crypto";

import {
  asNullableNumber,
  asNullableString,
  asNumber,
  asString,
  getDb,
} from "./db";

export type ExamMode = "timed" | "review";
export type SessionKind = "exam" | "quiz";

export type ExamOption = {
  label: string;
  body: string;
};

export type ExamQuestion = {
  id: number;
  sourceNumber: number;
  prompt: string;
  extraContent: string | null;
  selectionMode: "single" | "multiple";
  correctAnswers: string[];
  explanation: string;
  explanationSource: "provided" | "generated";
  options: ExamOption[];
  cheatsheets: Array<{ slug: string; title: string; category: string }>;
};

export type ExamSession = {
  id: string;
  mode: ExamMode;
  kind: SessionKind;
  cheatsheetId: number | null;
  cheatsheetSlug: string | null;
  cheatsheetTitle: string | null;
  totalQuestions: number;
  timeLimitSeconds: number | null;
  startedAt: string;
  questions: ExamQuestion[];
};

export type DatasetStats = {
  totalQuestions: number;
  multipleChoiceQuestions: number;
  reconstructedExplanations: number;
};

const QUESTIONS_PER_EXAM = 65;
const TIMED_EXAM_SECONDS = 2 * 60 * 60 + 10 * 60;
export const QUIZ_MAX_QUESTIONS = 20;

export function normalizePseudoKey(pseudo: string): string {
  return pseudo.trim().toLowerCase();
}

export async function updateQuestionExplanation(
  questionId: number,
  explanation: string,
): Promise<void> {
  const db = await getDb();
  await db.execute({
    sql: "UPDATE questions SET explanation = ?, explanation_source = 'generated' WHERE id = ?",
    args: [explanation, questionId],
  });
}

export type QuestionListRow = {
  id: number;
  sourceNumber: number;
  prompt: string;
  selectionMode: "single" | "multiple";
  correctAnswers: string[];
  optionCount: number;
  explanationLength: number;
  explanationSource: "provided" | "generated";
};

export async function listQuestions(search?: string): Promise<QuestionListRow[]> {
  const db = await getDb();
  const sql = search && search.trim()
    ? `SELECT q.id, q.source_number, q.prompt, q.selection_mode,
              q.correct_answers, q.explanation, q.explanation_source,
              (SELECT COUNT(*) FROM question_options o WHERE o.question_id = q.id) AS option_count
       FROM questions q
       WHERE q.prompt LIKE ? OR CAST(q.source_number AS TEXT) LIKE ?
       ORDER BY q.source_number ASC`
    : `SELECT q.id, q.source_number, q.prompt, q.selection_mode,
              q.correct_answers, q.explanation, q.explanation_source,
              (SELECT COUNT(*) FROM question_options o WHERE o.question_id = q.id) AS option_count
       FROM questions q
       ORDER BY q.source_number ASC`;
  const args = search && search.trim() ? [`%${search}%`, `%${search}%`] : [];
  const result = await db.execute({ sql, args });
  return result.rows.map((row) => ({
    id: asNumber(row.id),
    sourceNumber: asNumber(row.source_number),
    prompt: asString(row.prompt),
    selectionMode: asString(row.selection_mode) as "single" | "multiple",
    correctAnswers: JSON.parse(asString(row.correct_answers)) as string[],
    optionCount: asNumber(row.option_count),
    explanationLength: asString(row.explanation).length,
    explanationSource: asString(row.explanation_source) as "provided" | "generated",
  }));
}

export type QuestionDetail = {
  id: number;
  sourceNumber: number;
  prompt: string;
  extraContent: string | null;
  selectionMode: "single" | "multiple";
  correctAnswers: string[];
  explanation: string;
  explanationSource: "provided" | "generated";
  options: Array<{ label: string; body: string; position: number }>;
};

export async function getQuestionDetail(
  questionId: number,
): Promise<QuestionDetail | null> {
  const db = await getDb();
  const q = await db.execute({
    sql: `SELECT id, source_number, prompt, extra_content, selection_mode, correct_answers,
                 explanation, explanation_source
          FROM questions WHERE id = ?`,
    args: [questionId],
  });
  const row = q.rows[0];
  if (!row) return null;
  const opts = await db.execute({
    sql: `SELECT label, body, position FROM question_options
          WHERE question_id = ? ORDER BY position ASC`,
    args: [questionId],
  });
  return {
    id: asNumber(row.id),
    sourceNumber: asNumber(row.source_number),
    prompt: asString(row.prompt),
    extraContent: asNullableString(row.extra_content),
    selectionMode: asString(row.selection_mode) as "single" | "multiple",
    correctAnswers: JSON.parse(asString(row.correct_answers)) as string[],
    explanation: asString(row.explanation),
    explanationSource: asString(row.explanation_source) as "provided" | "generated",
    options: opts.rows.map((o) => ({
      label: asString(o.label),
      body: asString(o.body),
      position: asNumber(o.position),
    })),
  };
}

export type CheatsheetListRow = {
  id: number;
  slug: string;
  title: string;
  category: string;
  priority: string;
};

export async function listCheatsheetCategories(): Promise<string[]> {
  const db = await getDb();
  const r = await db.execute(
    "SELECT DISTINCT category FROM cheatsheets ORDER BY category ASC",
  );
  return r.rows.map((row) => asString(row.category));
}

export async function listCheatsheets(
  category?: string,
): Promise<CheatsheetListRow[]> {
  const db = await getDb();
  const sql = category && category.trim()
    ? `SELECT id, slug, title, category, priority FROM cheatsheets
       WHERE category = ? ORDER BY priority ASC, title ASC`
    : `SELECT id, slug, title, category, priority FROM cheatsheets
       ORDER BY category ASC, priority ASC, title ASC`;
  const args = category && category.trim() ? [category] : [];
  const r = await db.execute({ sql, args });
  return r.rows.map((row) => ({
    id: asNumber(row.id),
    slug: asString(row.slug),
    title: asString(row.title),
    category: asString(row.category),
    priority: asString(row.priority),
  }));
}

export type CheatsheetDetail = {
  id: number;
  slug: string;
  title: string;
  category: string;
  domains: string;
  priority: string;
  content: string;
};

export async function getCheatsheetBySlug(
  slug: string,
): Promise<CheatsheetDetail | null> {
  const db = await getDb();
  const r = await db.execute({
    sql: `SELECT id, slug, title, category, domains, priority, content
          FROM cheatsheets WHERE slug = ?`,
    args: [slug],
  });
  const row = r.rows[0];
  if (!row) return null;
  return {
    id: asNumber(row.id),
    slug: asString(row.slug),
    title: asString(row.title),
    category: asString(row.category),
    domains: asString(row.domains),
    priority: asString(row.priority),
    content: asString(row.content),
  };
}

export async function getCheatsheetById(
  id: number,
): Promise<{ id: number; slug: string; title: string } | null> {
  const db = await getDb();
  const r = await db.execute({
    sql: "SELECT id, slug, title FROM cheatsheets WHERE id = ?",
    args: [id],
  });
  const row = r.rows[0];
  if (!row) return null;
  return {
    id: asNumber(row.id),
    slug: asString(row.slug),
    title: asString(row.title),
  };
}

export async function countQuestionsForCheatsheet(
  cheatsheetId: number,
): Promise<number> {
  const db = await getDb();
  const r = await db.execute({
    sql: "SELECT COUNT(*) AS n FROM question_cheatsheets WHERE cheatsheet_id = ?",
    args: [cheatsheetId],
  });
  return asNumber(r.rows[0]?.n);
}

export async function listCheatsheetsForQuestion(
  questionId: number,
): Promise<Array<{ id: number; slug: string; title: string }>> {
  const db = await getDb();
  const r = await db.execute({
    sql: `SELECT c.id, c.slug, c.title
          FROM question_cheatsheets qc
          JOIN cheatsheets c ON c.id = qc.cheatsheet_id
          WHERE qc.question_id = ?
          ORDER BY c.category ASC, c.title ASC`,
    args: [questionId],
  });
  return r.rows.map((row) => ({
    id: asNumber(row.id),
    slug: asString(row.slug),
    title: asString(row.title),
  }));
}

export async function linkQuestionToCheatsheet(
  questionId: number,
  cheatsheetId: number,
): Promise<void> {
  const db = await getDb();
  await db.execute({
    sql: `INSERT INTO question_cheatsheets (question_id, cheatsheet_id)
          VALUES (?, ?) ON CONFLICT DO NOTHING`,
    args: [questionId, cheatsheetId],
  });
}

export async function unlinkQuestionFromCheatsheet(
  questionId: number,
  cheatsheetId: number,
): Promise<void> {
  const db = await getDb();
  await db.execute({
    sql: "DELETE FROM question_cheatsheets WHERE question_id = ? AND cheatsheet_id = ?",
    args: [questionId, cheatsheetId],
  });
}

export type CheatsheetMastery = {
  cheatsheetId: number;
  total: number;
  attempted: number;
  mastered: number;
  masteryRate: number | null;
};

export async function getCheatsheetMastery(
  userId: number,
  cheatsheetId: number,
): Promise<CheatsheetMastery> {
  const db = await getDb();
  const r = await db.execute({
    sql: `WITH user_answers AS (
            SELECT esa.question_id, esa.is_correct,
                   ROW_NUMBER() OVER (
                     PARTITION BY esa.question_id
                     ORDER BY es.started_at DESC
                   ) AS rn
            FROM exam_session_answers esa
            JOIN exam_sessions es ON es.id = esa.session_id
            WHERE es.user_id = ?
          ),
          latest AS (
            SELECT question_id, is_correct FROM user_answers WHERE rn = 1
          )
          SELECT
            COUNT(qc.question_id) AS total,
            COUNT(l.question_id) AS attempted,
            SUM(CASE WHEN l.is_correct = 1 THEN 1 ELSE 0 END) AS mastered
          FROM question_cheatsheets qc
          LEFT JOIN latest l ON l.question_id = qc.question_id
          WHERE qc.cheatsheet_id = ?`,
    args: [userId, cheatsheetId],
  });
  const row = r.rows[0];
  const total = asNumber(row?.total);
  const attempted = asNumber(row?.attempted);
  const mastered = asNumber(row?.mastered);
  return {
    cheatsheetId,
    total,
    attempted,
    mastered,
    masteryRate: total > 0 ? (mastered / total) * 100 : null,
  };
}

export type CheatsheetMasteryRow = CheatsheetMastery & {
  slug: string;
  title: string;
  category: string;
  priority: string;
};

export async function listCheatsheetMastery(
  userId: number,
): Promise<CheatsheetMasteryRow[]> {
  const db = await getDb();
  const r = await db.execute({
    sql: `WITH user_answers AS (
            SELECT esa.question_id, esa.is_correct,
                   ROW_NUMBER() OVER (
                     PARTITION BY esa.question_id
                     ORDER BY es.started_at DESC
                   ) AS rn
            FROM exam_session_answers esa
            JOIN exam_sessions es ON es.id = esa.session_id
            WHERE es.user_id = ?
          ),
          latest AS (
            SELECT question_id, is_correct FROM user_answers WHERE rn = 1
          )
          SELECT
            c.id, c.slug, c.title, c.category, c.priority,
            COUNT(qc.question_id) AS total,
            COUNT(l.question_id) AS attempted,
            SUM(CASE WHEN l.is_correct = 1 THEN 1 ELSE 0 END) AS mastered
          FROM cheatsheets c
          JOIN question_cheatsheets qc ON qc.cheatsheet_id = c.id
          LEFT JOIN latest l ON l.question_id = qc.question_id
          GROUP BY c.id
          ORDER BY c.category ASC, c.title ASC`,
    args: [userId],
  });
  return r.rows.map((row) => {
    const total = asNumber(row.total);
    const mastered = asNumber(row.mastered);
    return {
      cheatsheetId: asNumber(row.id),
      slug: asString(row.slug),
      title: asString(row.title),
      category: asString(row.category),
      priority: asString(row.priority),
      total,
      attempted: asNumber(row.attempted),
      mastered,
      masteryRate: total > 0 ? (mastered / total) * 100 : null,
    };
  });
}

export type QuestionUpdatePayload = {
  prompt: string;
  selectionMode: "single" | "multiple";
  correctAnswers: string[];
  explanation: string;
  options: Array<{ label: string; body: string }>;
};

export async function updateQuestion(
  questionId: number,
  payload: QuestionUpdatePayload,
): Promise<void> {
  const db = await getDb();
  const statements = [
    {
      sql: `UPDATE questions
            SET prompt = ?, selection_mode = ?, correct_answers = ?,
                explanation = ?, explanation_source = 'generated'
            WHERE id = ?`,
      args: [
        payload.prompt,
        payload.selectionMode,
        JSON.stringify(payload.correctAnswers),
        payload.explanation,
        questionId,
      ],
    },
    {
      sql: "DELETE FROM question_options WHERE question_id = ?",
      args: [questionId],
    },
    ...payload.options.map((opt, i) => ({
      sql: `INSERT INTO question_options (question_id, label, body, position)
            VALUES (?, ?, ?, ?)`,
      args: [questionId, opt.label, opt.body, i + 1],
    })),
  ];
  await db.batch(statements, "write");
}

export async function getDatasetStats(): Promise<DatasetStats> {
  const db = await getDb();
  const r = await db.execute(
    `SELECT
       COUNT(*) AS totalQuestions,
       SUM(CASE WHEN selection_mode = 'multiple' THEN 1 ELSE 0 END) AS multipleChoiceQuestions,
       SUM(CASE WHEN explanation_source = 'generated' THEN 1 ELSE 0 END) AS reconstructedExplanations
     FROM questions`,
  );
  const row = r.rows[0];
  return {
    totalQuestions: asNumber(row.totalQuestions),
    multipleChoiceQuestions: asNumber(row.multipleChoiceQuestions),
    reconstructedExplanations: asNumber(row.reconstructedExplanations),
  };
}

export type UserRole = "free" | "member" | "admin";

export const ALL_ROLES: UserRole[] = ["free", "member", "admin"];

export function isMemberRole(role: UserRole): boolean {
  return role === "member" || role === "admin";
}

export function isAdminRole(role: UserRole): boolean {
  return role === "admin";
}

function normalizeRole(value: unknown): UserRole {
  const s = String(value ?? "free");
  return s === "admin" || s === "member" ? s : "free";
}

export type User = { id: number; pseudo: string; role: UserRole };

export async function findOrCreateUser(pseudo: string): Promise<User> {
  const db = await getDb();
  const cleaned = pseudo.trim();
  if (!cleaned) throw new Error("Pseudo cannot be empty.");
  const key = normalizePseudoKey(cleaned);
  const existing = await db.execute({
    sql: "SELECT id, pseudo, role FROM users WHERE pseudo_key = ?",
    args: [key],
  });
  if (existing.rows[0]) {
    return {
      id: asNumber(existing.rows[0].id),
      pseudo: asString(existing.rows[0].pseudo),
      role: normalizeRole(existing.rows[0].role),
    };
  }
  const info = await db.execute({
    sql: "INSERT INTO users (pseudo, pseudo_key, created_at, role) VALUES (?, ?, ?, 'free')",
    args: [cleaned, key, new Date().toISOString()],
  });
  return { id: Number(info.lastInsertRowid), pseudo: cleaned, role: "free" };
}

export async function getUserByPseudo(pseudo: string): Promise<User | null> {
  const db = await getDb();
  const r = await db.execute({
    sql: "SELECT id, pseudo, role FROM users WHERE pseudo_key = ?",
    args: [normalizePseudoKey(pseudo)],
  });
  const row = r.rows[0];
  if (!row) return null;
  return {
    id: asNumber(row.id),
    pseudo: asString(row.pseudo),
    role: normalizeRole(row.role),
  };
}

export async function listUsersWithStats(): Promise<
  Array<
    User & {
      sessionCount: number;
      avgScore: number | null;
      bestScore: number | null;
    }
  >
> {
  const db = await getDb();
  const r = await db.execute(
    `SELECT u.id, u.pseudo, u.role,
            COUNT(s.id) AS sessionCount,
            AVG(s.score) AS avgScore,
            MAX(s.score) AS bestScore
     FROM users u
     LEFT JOIN exam_sessions s
       ON s.user_id = u.id AND s.finished_at IS NOT NULL
     GROUP BY u.id
     ORDER BY u.pseudo COLLATE NOCASE ASC`,
  );
  return r.rows.map((row) => ({
    id: asNumber(row.id),
    pseudo: asString(row.pseudo),
    role: normalizeRole(row.role),
    sessionCount: asNumber(row.sessionCount),
    avgScore: asNullableNumber(row.avgScore),
    bestScore: asNullableNumber(row.bestScore),
  }));
}

export async function setUserRole(
  userId: number,
  role: UserRole,
): Promise<void> {
  if (!ALL_ROLES.includes(role)) {
    throw new Error(`Invalid role: ${role}`);
  }
  const db = await getDb();
  await db.execute({
    sql: "UPDATE users SET role = ? WHERE id = ?",
    args: [role, userId],
  });
}

export async function countAdmins(): Promise<number> {
  const db = await getDb();
  const r = await db.execute("SELECT COUNT(*) AS n FROM users WHERE role = 'admin'");
  return asNumber(r.rows[0]?.n);
}

export type UserSessionRow = {
  id: string;
  mode: ExamMode;
  kind: SessionKind;
  cheatsheetId: number | null;
  cheatsheetSlug: string | null;
  cheatsheetTitle: string | null;
  startedAt: string;
  finishedAt: string | null;
  correctCount: number | null;
  score: number | null;
  totalQuestions: number;
  answeredCount: number;
  currentIndex: number;
};

export async function getUserSessions(userId: number): Promise<UserSessionRow[]> {
  const db = await getDb();
  const r = await db.execute({
    sql: `SELECT s.id, s.mode, s.kind,
                 s.cheatsheet_id AS cheatsheetId,
                 c.slug AS cheatsheetSlug,
                 c.title AS cheatsheetTitle,
                 s.started_at AS startedAt, s.finished_at AS finishedAt,
                 s.correct_count AS correctCount, s.score,
                 s.total_questions AS totalQuestions,
                 s.current_index AS currentIndex,
                 (SELECT COUNT(*) FROM exam_session_answers a
                  WHERE a.session_id = s.id) AS answeredCount
          FROM exam_sessions s
          LEFT JOIN cheatsheets c ON c.id = s.cheatsheet_id
          WHERE s.user_id = ?
          ORDER BY s.started_at DESC`,
    args: [userId],
  });
  return r.rows.map((row) => ({
    id: asString(row.id),
    mode: asString(row.mode) as ExamMode,
    kind: (asString(row.kind) || "exam") as SessionKind,
    cheatsheetId: asNullableNumber(row.cheatsheetId),
    cheatsheetSlug: asNullableString(row.cheatsheetSlug),
    cheatsheetTitle: asNullableString(row.cheatsheetTitle),
    startedAt: asString(row.startedAt),
    finishedAt: asNullableString(row.finishedAt),
    correctCount: asNullableNumber(row.correctCount),
    score: asNullableNumber(row.score),
    totalQuestions: asNumber(row.totalQuestions),
    answeredCount: asNumber(row.answeredCount),
    currentIndex: asNumber(row.currentIndex),
  }));
}

export async function deleteExamSession(sessionId: string): Promise<void> {
  const db = await getDb();
  await db.batch(
    [
      {
        sql: "DELETE FROM exam_session_answers WHERE session_id = ?",
        args: [sessionId],
      },
      {
        sql: "DELETE FROM exam_session_questions WHERE session_id = ?",
        args: [sessionId],
      },
      { sql: "DELETE FROM exam_sessions WHERE id = ?", args: [sessionId] },
    ],
    "write",
  );
}

export type UserStats = {
  sessionsFinished: number;
  sessionsInProgress: number;
  avgScore: number | null;
  bestScore: number | null;
  avgByMode: { timed: number | null; review: number | null };
  successRate: number | null;
};

export async function getUserStats(userId: number): Promise<UserStats> {
  const db = await getDb();
  const r = await db.execute({
    sql: `SELECT
            SUM(CASE WHEN finished_at IS NOT NULL THEN 1 ELSE 0 END) AS sessionsFinished,
            SUM(CASE WHEN finished_at IS NULL THEN 1 ELSE 0 END) AS sessionsInProgress,
            AVG(CASE WHEN finished_at IS NOT NULL THEN score END) AS avgScore,
            MAX(score) AS bestScore,
            AVG(CASE WHEN finished_at IS NOT NULL AND mode = 'timed' THEN score END) AS avgTimed,
            AVG(CASE WHEN finished_at IS NOT NULL AND mode = 'review' THEN score END) AS avgReview,
            SUM(CASE WHEN finished_at IS NOT NULL THEN correct_count ELSE 0 END) AS totalCorrect,
            SUM(CASE WHEN finished_at IS NOT NULL THEN total_questions ELSE 0 END) AS totalAnswered
          FROM exam_sessions WHERE user_id = ?`,
    args: [userId],
  });
  const row = r.rows[0];
  const totalAnswered = asNullableNumber(row.totalAnswered);
  const totalCorrect = asNullableNumber(row.totalCorrect);
  const successRate =
    totalAnswered && totalAnswered > 0
      ? ((totalCorrect ?? 0) / totalAnswered) * 100
      : null;
  return {
    sessionsFinished: asNumber(row.sessionsFinished),
    sessionsInProgress: asNumber(row.sessionsInProgress),
    avgScore: asNullableNumber(row.avgScore),
    bestScore: asNullableNumber(row.bestScore),
    avgByMode: {
      timed: asNullableNumber(row.avgTimed),
      review: asNullableNumber(row.avgReview),
    },
    successRate,
  };
}

export async function getExamSessionOwner(
  sessionId: string,
): Promise<number | null> {
  const db = await getDb();
  const r = await db.execute({
    sql: "SELECT user_id FROM exam_sessions WHERE id = ?",
    args: [sessionId],
  });
  const row = r.rows[0];
  if (!row) return null;
  return asNullableNumber(row.user_id);
}

export type SessionProgress = {
  answers: Record<number, string[]>;
  submitted: Record<number, boolean>;
  currentIndex: number;
  finished: boolean;
  finishedAt: string | null;
};

export async function getSessionProgress(
  sessionId: string,
): Promise<SessionProgress | null> {
  const db = await getDb();
  const s = await db.execute({
    sql: `SELECT current_index AS currentIndex, finished_at AS finishedAt
          FROM exam_sessions WHERE id = ?`,
    args: [sessionId],
  });
  const session = s.rows[0];
  if (!session) return null;
  const a = await db.execute({
    sql: `SELECT question_id AS questionId, selected_labels AS selectedLabels, submitted
          FROM exam_session_answers WHERE session_id = ?`,
    args: [sessionId],
  });
  const answers: Record<number, string[]> = {};
  const submitted: Record<number, boolean> = {};
  for (const row of a.rows) {
    try {
      const parsed = JSON.parse(asString(row.selectedLabels)) as string[];
      if (parsed.length) answers[asNumber(row.questionId)] = parsed;
    } catch {
      // ignore
    }
    if (asNumber(row.submitted)) submitted[asNumber(row.questionId)] = true;
  }
  const finishedAt = asNullableString(session.finishedAt);
  return {
    answers,
    submitted,
    currentIndex: asNumber(session.currentIndex),
    finished: Boolean(finishedAt),
    finishedAt,
  };
}

export async function saveSessionProgress(
  sessionId: string,
  progress: {
    currentIndex: number;
    entries: Array<{
      questionId: number;
      selected: string[];
      isCorrect: boolean;
      submitted: boolean;
    }>;
  },
): Promise<void> {
  const db = await getDb();
  const statements = [
    {
      sql: "UPDATE exam_sessions SET current_index = ? WHERE id = ? AND finished_at IS NULL",
      args: [progress.currentIndex, sessionId],
    },
    {
      sql: "DELETE FROM exam_session_answers WHERE session_id = ?",
      args: [sessionId],
    },
    ...progress.entries
      .filter((e) => e.selected.length > 0)
      .map((entry) => ({
        sql: `INSERT INTO exam_session_answers
                (session_id, question_id, selected_labels, is_correct, submitted)
              VALUES (?, ?, ?, ?, ?)`,
        args: [
          sessionId,
          entry.questionId,
          JSON.stringify(entry.selected),
          entry.isCorrect ? 1 : 0,
          entry.submitted ? 1 : 0,
        ],
      })),
  ];
  await db.batch(statements, "write");
}

export async function finalizeExamSession(
  sessionId: string,
  correctCount: number,
  score: number,
  answers: Array<{ questionId: number; selected: string[]; isCorrect: boolean }>,
): Promise<void> {
  const db = await getDb();
  const statements = [
    {
      sql: "UPDATE exam_sessions SET finished_at = ?, correct_count = ?, score = ? WHERE id = ?",
      args: [new Date().toISOString(), correctCount, score, sessionId],
    },
    {
      sql: "DELETE FROM exam_session_answers WHERE session_id = ?",
      args: [sessionId],
    },
    ...answers.map((a) => ({
      sql: `INSERT INTO exam_session_answers
              (session_id, question_id, selected_labels, is_correct)
            VALUES (?, ?, ?, ?)`,
      args: [
        sessionId,
        a.questionId,
        JSON.stringify(a.selected),
        a.isCorrect ? 1 : 0,
      ],
    })),
  ];
  await db.batch(statements, "write");
}

export async function createExamSession(
  mode: ExamMode,
  userId: number | null = null,
): Promise<{ id: string }> {
  const db = await getDb();
  const sessionId = randomUUID();
  const startedAt = new Date().toISOString();
  const qIds = await db.execute({
    sql: "SELECT id FROM questions ORDER BY RANDOM() LIMIT ?",
    args: [QUESTIONS_PER_EXAM],
  });
  if (qIds.rows.length !== QUESTIONS_PER_EXAM) {
    throw new Error("Not enough questions in the database to create an exam.");
  }
  const statements = [
    {
      sql: `INSERT INTO exam_sessions
              (id, mode, kind, cheatsheet_id, total_questions, time_limit_seconds, started_at, user_id)
            VALUES (?, ?, 'exam', NULL, ?, ?, ?, ?)`,
      args: [
        sessionId,
        mode,
        QUESTIONS_PER_EXAM,
        mode === "timed" ? TIMED_EXAM_SECONDS : null,
        startedAt,
        userId,
      ],
    },
    ...qIds.rows.map((row, i) => ({
      sql: `INSERT INTO exam_session_questions (session_id, position, question_id)
            VALUES (?, ?, ?)`,
      args: [sessionId, i + 1, asNumber(row.id)],
    })),
  ];
  await db.batch(statements, "write");
  return { id: sessionId };
}

export class QuizCreationError extends Error {
  code: "no-questions";
  constructor(code: "no-questions", message: string) {
    super(message);
    this.code = code;
  }
}

export async function createQuizSession(
  userId: number,
  cheatsheetId: number,
): Promise<{ id: string }> {
  const db = await getDb();
  const qIds = await db.execute({
    sql: `SELECT q.id FROM questions q
          JOIN question_cheatsheets qc ON qc.question_id = q.id
          WHERE qc.cheatsheet_id = ?
          ORDER BY RANDOM() LIMIT ?`,
    args: [cheatsheetId, QUIZ_MAX_QUESTIONS],
  });
  if (qIds.rows.length === 0) {
    throw new QuizCreationError(
      "no-questions",
      "Aucune question n'est liée à cette cheatsheet.",
    );
  }
  const sessionId = randomUUID();
  const startedAt = new Date().toISOString();
  const statements = [
    {
      sql: `INSERT INTO exam_sessions
              (id, mode, kind, cheatsheet_id, total_questions, time_limit_seconds, started_at, user_id)
            VALUES (?, 'review', 'quiz', ?, ?, NULL, ?, ?)`,
      args: [sessionId, cheatsheetId, qIds.rows.length, startedAt, userId],
    },
    ...qIds.rows.map((row, i) => ({
      sql: `INSERT INTO exam_session_questions (session_id, position, question_id)
            VALUES (?, ?, ?)`,
      args: [sessionId, i + 1, asNumber(row.id)],
    })),
  ];
  await db.batch(statements, "write");
  return { id: sessionId };
}

export async function getExamSession(
  sessionId: string,
): Promise<ExamSession | null> {
  const db = await getDb();
  const s = await db.execute({
    sql: `SELECT s.id, s.mode, s.kind,
                 s.cheatsheet_id AS cheatsheetId,
                 c.slug AS cheatsheetSlug,
                 c.title AS cheatsheetTitle,
                 s.total_questions, s.time_limit_seconds, s.started_at
          FROM exam_sessions s
          LEFT JOIN cheatsheets c ON c.id = s.cheatsheet_id
          WHERE s.id = ?`,
    args: [sessionId],
  });
  const sessionRow = s.rows[0];
  if (!sessionRow) return null;

  const r = await db.execute({
    sql: `SELECT
            esq.position AS question_position,
            q.id AS question_id, q.source_number, q.prompt, q.extra_content,
            q.selection_mode,
            q.correct_answers, q.explanation, q.explanation_source,
            qo.label AS option_label, qo.body AS option_body
          FROM exam_session_questions esq
          JOIN questions q ON q.id = esq.question_id
          JOIN question_options qo ON qo.question_id = q.id
          WHERE esq.session_id = ?
          ORDER BY esq.position ASC, qo.position ASC`,
    args: [sessionId],
  });

  const grouped = new Map<number, ExamQuestion>();
  for (const row of r.rows) {
    const qid = asNumber(row.question_id);
    if (!grouped.has(qid)) {
      grouped.set(qid, {
        id: qid,
        sourceNumber: asNumber(row.source_number),
        prompt: asString(row.prompt),
        extraContent: asNullableString(row.extra_content),
        selectionMode: asString(row.selection_mode) as "single" | "multiple",
        correctAnswers: JSON.parse(asString(row.correct_answers)) as string[],
        explanation: asString(row.explanation),
        explanationSource: asString(row.explanation_source) as "provided" | "generated",
        options: [],
        cheatsheets: [],
      });
    }
    grouped.get(qid)!.options.push({
      label: asString(row.option_label),
      body: asString(row.option_body),
    });
  }

  const sheets = await db.execute({
    sql: `SELECT qc.question_id AS qid, c.slug, c.title, c.category
          FROM question_cheatsheets qc
          JOIN cheatsheets c ON c.id = qc.cheatsheet_id
          JOIN exam_session_questions esq ON esq.question_id = qc.question_id
          WHERE esq.session_id = ?
          ORDER BY c.category ASC, c.title ASC`,
    args: [sessionId],
  });
  for (const row of sheets.rows) {
    const qid = asNumber(row.qid);
    const target = grouped.get(qid);
    if (!target) continue;
    target.cheatsheets.push({
      slug: asString(row.slug),
      title: asString(row.title),
      category: asString(row.category),
    });
  }

  return {
    id: asString(sessionRow.id),
    mode: asString(sessionRow.mode) as ExamMode,
    kind: (asString(sessionRow.kind) || "exam") as SessionKind,
    cheatsheetId: asNullableNumber(sessionRow.cheatsheetId),
    cheatsheetSlug: asNullableString(sessionRow.cheatsheetSlug),
    cheatsheetTitle: asNullableString(sessionRow.cheatsheetTitle),
    totalQuestions: asNumber(sessionRow.total_questions),
    timeLimitSeconds: asNullableNumber(sessionRow.time_limit_seconds),
    startedAt: asString(sessionRow.started_at),
    questions: [...grouped.values()],
  };
}
