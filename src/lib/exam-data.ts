import "server-only";

import { randomUUID } from "node:crypto";
import { join } from "node:path";

import Database from "better-sqlite3";

export type ExamMode = "timed" | "review";

export type ExamOption = {
  label: string;
  body: string;
};

export type ExamQuestion = {
  id: number;
  sourceNumber: number;
  prompt: string;
  selectionMode: "single" | "multiple";
  correctAnswers: string[];
  explanation: string;
  explanationSource: "provided" | "generated";
  options: ExamOption[];
};

export type ExamSession = {
  id: string;
  mode: ExamMode;
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

const DATABASE_PATH = join(process.cwd(), "data", "aws-saa.sqlite");
const QUESTIONS_PER_EXAM = 65;
const TIMED_EXAM_SECONDS = 2 * 60 * 60 + 10 * 60;

type GlobalWithDb = typeof globalThis & {
  __awsExamDb?: Database.Database;
};

export function getDb(): Database.Database {
  const globalForDb = globalThis as GlobalWithDb;

  if (!globalForDb.__awsExamDb) {
    globalForDb.__awsExamDb = new Database(DATABASE_PATH);
    globalForDb.__awsExamDb.pragma("foreign_keys = ON");
    globalForDb.__awsExamDb.pragma("journal_mode = WAL");
    ensureProgressColumns(globalForDb.__awsExamDb);
  }

  return globalForDb.__awsExamDb;
}

function ensureProgressColumns(db: Database.Database): void {
  const sessionCols = db
    .prepare("PRAGMA table_info(exam_sessions)")
    .all() as Array<{ name: string }>;
  if (!sessionCols.some((col) => col.name === "current_index")) {
    db.exec(
      "ALTER TABLE exam_sessions ADD COLUMN current_index INTEGER NOT NULL DEFAULT 0",
    );
  }
  const answerCols = db
    .prepare("PRAGMA table_info(exam_session_answers)")
    .all() as Array<{ name: string }>;
  if (!answerCols.some((col) => col.name === "submitted")) {
    db.exec(
      "ALTER TABLE exam_session_answers ADD COLUMN submitted INTEGER NOT NULL DEFAULT 0",
    );
  }
  const userCols = db
    .prepare("PRAGMA table_info(users)")
    .all() as Array<{ name: string }>;
  if (!userCols.some((col) => col.name === "password_hash")) {
    db.exec("ALTER TABLE users ADD COLUMN password_hash TEXT");
  }
  db.exec(
    `CREATE TABLE IF NOT EXISTS user_auth_sessions (
       token TEXT PRIMARY KEY,
       user_id INTEGER NOT NULL,
       created_at TEXT NOT NULL,
       FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
     )`,
  );
}

export function updateQuestionExplanation(
  questionId: number,
  explanation: string,
): void {
  const db = getDb();
  db.prepare(
    "UPDATE questions SET explanation = ?, explanation_source = 'generated' WHERE id = ?",
  ).run(explanation, questionId);
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

export function listQuestions(search?: string): QuestionListRow[] {
  const db = getDb();
  const rows = search && search.trim()
    ? db
        .prepare(
          `
            SELECT q.id, q.source_number, q.prompt, q.selection_mode,
                   q.correct_answers, q.explanation, q.explanation_source,
                   (SELECT COUNT(*) FROM question_options o WHERE o.question_id = q.id) AS option_count
            FROM questions q
            WHERE q.prompt LIKE ? OR CAST(q.source_number AS TEXT) LIKE ?
            ORDER BY q.source_number ASC
          `,
        )
        .all(`%${search}%`, `%${search}%`)
    : db
        .prepare(
          `
            SELECT q.id, q.source_number, q.prompt, q.selection_mode,
                   q.correct_answers, q.explanation, q.explanation_source,
                   (SELECT COUNT(*) FROM question_options o WHERE o.question_id = q.id) AS option_count
            FROM questions q
            ORDER BY q.source_number ASC
          `,
        )
        .all();
  return (rows as Array<{
    id: number;
    source_number: number;
    prompt: string;
    selection_mode: "single" | "multiple";
    correct_answers: string;
    explanation: string;
    explanation_source: "provided" | "generated";
    option_count: number;
  }>).map((row) => ({
    id: row.id,
    sourceNumber: row.source_number,
    prompt: row.prompt,
    selectionMode: row.selection_mode,
    correctAnswers: JSON.parse(row.correct_answers) as string[],
    optionCount: row.option_count,
    explanationLength: row.explanation.length,
    explanationSource: row.explanation_source,
  }));
}

export type QuestionDetail = {
  id: number;
  sourceNumber: number;
  prompt: string;
  selectionMode: "single" | "multiple";
  correctAnswers: string[];
  explanation: string;
  explanationSource: "provided" | "generated";
  options: Array<{ label: string; body: string; position: number }>;
};

export function getQuestionDetail(questionId: number): QuestionDetail | null {
  const db = getDb();
  const question = db
    .prepare(
      `
        SELECT id, source_number, prompt, selection_mode, correct_answers,
               explanation, explanation_source
        FROM questions
        WHERE id = ?
      `,
    )
    .get(questionId) as
    | {
        id: number;
        source_number: number;
        prompt: string;
        selection_mode: "single" | "multiple";
        correct_answers: string;
        explanation: string;
        explanation_source: "provided" | "generated";
      }
    | undefined;
  if (!question) return null;
  const options = db
    .prepare(
      `
        SELECT label, body, position
        FROM question_options
        WHERE question_id = ?
        ORDER BY position ASC
      `,
    )
    .all(questionId) as Array<{ label: string; body: string; position: number }>;
  return {
    id: question.id,
    sourceNumber: question.source_number,
    prompt: question.prompt,
    selectionMode: question.selection_mode,
    correctAnswers: JSON.parse(question.correct_answers) as string[],
    explanation: question.explanation,
    explanationSource: question.explanation_source,
    options,
  };
}

export type CheatsheetListRow = {
  id: number;
  slug: string;
  title: string;
  category: string;
  priority: string;
};

export function listCheatsheetCategories(): string[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT DISTINCT category FROM cheatsheets ORDER BY category ASC")
    .all() as Array<{ category: string }>;
  return rows.map((row) => row.category);
}

export function listCheatsheets(category?: string): CheatsheetListRow[] {
  const db = getDb();
  const rows = category && category.trim()
    ? db
        .prepare(
          `SELECT id, slug, title, category, priority FROM cheatsheets
           WHERE category = ? ORDER BY priority ASC, title ASC`,
        )
        .all(category)
    : db
        .prepare(
          `SELECT id, slug, title, category, priority FROM cheatsheets
           ORDER BY category ASC, priority ASC, title ASC`,
        )
        .all();
  return rows as CheatsheetListRow[];
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

export function getCheatsheetBySlug(slug: string): CheatsheetDetail | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, slug, title, category, domains, priority, content
       FROM cheatsheets WHERE slug = ?`,
    )
    .get(slug) as CheatsheetDetail | undefined;
  return row ?? null;
}

export type QuestionUpdatePayload = {
  prompt: string;
  selectionMode: "single" | "multiple";
  correctAnswers: string[];
  explanation: string;
  options: Array<{ label: string; body: string }>;
};

export function updateQuestion(
  questionId: number,
  payload: QuestionUpdatePayload,
): void {
  const db = getDb();
  const updateQ = db.prepare(
    `
      UPDATE questions
      SET prompt = ?, selection_mode = ?, correct_answers = ?,
          explanation = ?, explanation_source = 'generated'
      WHERE id = ?
    `,
  );
  const deleteOptions = db.prepare(
    "DELETE FROM question_options WHERE question_id = ?",
  );
  const insertOption = db.prepare(
    `
      INSERT INTO question_options (question_id, label, body, position)
      VALUES (?, ?, ?, ?)
    `,
  );
  const tx = db.transaction(() => {
    updateQ.run(
      payload.prompt,
      payload.selectionMode,
      JSON.stringify(payload.correctAnswers),
      payload.explanation,
      questionId,
    );
    deleteOptions.run(questionId);
    payload.options.forEach((option, index) => {
      insertOption.run(questionId, option.label, option.body, index + 1);
    });
  });
  tx();
}

export function getDatasetStats(): DatasetStats {
  const db = getDb();
  const row = db
    .prepare(
      `
        SELECT
          COUNT(*) AS totalQuestions,
          SUM(CASE WHEN selection_mode = 'multiple' THEN 1 ELSE 0 END) AS multipleChoiceQuestions,
          SUM(CASE WHEN explanation_source = 'generated' THEN 1 ELSE 0 END) AS reconstructedExplanations
        FROM questions
      `,
    )
    .get() as {
      totalQuestions: number;
      multipleChoiceQuestions: number;
      reconstructedExplanations: number;
    };

  return row;
}

export type User = { id: number; pseudo: string };

export function normalizePseudoKey(pseudo: string): string {
  return pseudo.trim().toLowerCase();
}

export function findOrCreateUser(pseudo: string): User {
  const db = getDb();
  const cleaned = pseudo.trim();
  if (!cleaned) {
    throw new Error("Pseudo cannot be empty.");
  }
  const key = normalizePseudoKey(cleaned);
  const existing = db
    .prepare("SELECT id, pseudo FROM users WHERE pseudo_key = ?")
    .get(key) as { id: number; pseudo: string } | undefined;
  if (existing) return existing;
  const info = db
    .prepare(
      "INSERT INTO users (pseudo, pseudo_key, created_at) VALUES (?, ?, ?)",
    )
    .run(cleaned, key, new Date().toISOString());
  return { id: Number(info.lastInsertRowid), pseudo: cleaned };
}

export function getUserByPseudo(pseudo: string): User | null {
  const db = getDb();
  const row = db
    .prepare("SELECT id, pseudo FROM users WHERE pseudo_key = ?")
    .get(normalizePseudoKey(pseudo)) as
    | { id: number; pseudo: string }
    | undefined;
  return row ?? null;
}

export function listUsersWithStats(): Array<
  User & { sessionCount: number; avgScore: number | null; bestScore: number | null }
> {
  const db = getDb();
  return db
    .prepare(
      `
        SELECT
          u.id,
          u.pseudo,
          COUNT(s.id) AS sessionCount,
          AVG(s.score) AS avgScore,
          MAX(s.score) AS bestScore
        FROM users u
        LEFT JOIN exam_sessions s
          ON s.user_id = u.id AND s.finished_at IS NOT NULL
        GROUP BY u.id
        ORDER BY u.pseudo COLLATE NOCASE ASC
      `,
    )
    .all() as Array<{
      id: number;
      pseudo: string;
      sessionCount: number;
      avgScore: number | null;
      bestScore: number | null;
    }>;
}

export type UserSessionRow = {
  id: string;
  mode: ExamMode;
  startedAt: string;
  finishedAt: string | null;
  correctCount: number | null;
  score: number | null;
  totalQuestions: number;
};

export function getUserSessions(userId: number): UserSessionRow[] {
  const db = getDb();
  return db
    .prepare(
      `
        SELECT
          id,
          mode,
          started_at AS startedAt,
          finished_at AS finishedAt,
          correct_count AS correctCount,
          score,
          total_questions AS totalQuestions
        FROM exam_sessions
        WHERE user_id = ?
        ORDER BY started_at DESC
      `,
    )
    .all(userId) as UserSessionRow[];
}

export type UserStats = {
  sessionsFinished: number;
  sessionsInProgress: number;
  avgScore: number | null;
  bestScore: number | null;
  avgByMode: { timed: number | null; review: number | null };
  successRate: number | null;
};

export function getUserStats(userId: number): UserStats {
  const db = getDb();
  const agg = db
    .prepare(
      `
        SELECT
          SUM(CASE WHEN finished_at IS NOT NULL THEN 1 ELSE 0 END) AS sessionsFinished,
          SUM(CASE WHEN finished_at IS NULL THEN 1 ELSE 0 END) AS sessionsInProgress,
          AVG(CASE WHEN finished_at IS NOT NULL THEN score END) AS avgScore,
          MAX(score) AS bestScore,
          AVG(CASE WHEN finished_at IS NOT NULL AND mode = 'timed' THEN score END) AS avgTimed,
          AVG(CASE WHEN finished_at IS NOT NULL AND mode = 'review' THEN score END) AS avgReview,
          SUM(CASE WHEN finished_at IS NOT NULL THEN correct_count ELSE 0 END) AS totalCorrect,
          SUM(CASE WHEN finished_at IS NOT NULL THEN total_questions ELSE 0 END) AS totalAnswered
        FROM exam_sessions
        WHERE user_id = ?
      `,
    )
    .get(userId) as {
      sessionsFinished: number | null;
      sessionsInProgress: number | null;
      avgScore: number | null;
      bestScore: number | null;
      avgTimed: number | null;
      avgReview: number | null;
      totalCorrect: number | null;
      totalAnswered: number | null;
    };
  const successRate =
    agg.totalAnswered && agg.totalAnswered > 0
      ? ((agg.totalCorrect ?? 0) / agg.totalAnswered) * 100
      : null;
  return {
    sessionsFinished: agg.sessionsFinished ?? 0,
    sessionsInProgress: agg.sessionsInProgress ?? 0,
    avgScore: agg.avgScore,
    bestScore: agg.bestScore,
    avgByMode: { timed: agg.avgTimed, review: agg.avgReview },
    successRate,
  };
}

export type SessionProgress = {
  answers: Record<number, string[]>;
  submitted: Record<number, boolean>;
  currentIndex: number;
  finished: boolean;
  finishedAt: string | null;
};

export function getExamSessionOwner(sessionId: string): number | null {
  const db = getDb();
  const row = db
    .prepare("SELECT user_id FROM exam_sessions WHERE id = ?")
    .get(sessionId) as { user_id: number | null } | undefined;
  return row ? row.user_id : null;
}

export function getSessionProgress(sessionId: string): SessionProgress | null {
  const db = getDb();
  const session = db
    .prepare(
      `SELECT current_index AS currentIndex, finished_at AS finishedAt
       FROM exam_sessions WHERE id = ?`,
    )
    .get(sessionId) as
    | { currentIndex: number; finishedAt: string | null }
    | undefined;
  if (!session) return null;
  const rows = db
    .prepare(
      `SELECT question_id AS questionId, selected_labels AS selectedLabels, submitted
       FROM exam_session_answers WHERE session_id = ?`,
    )
    .all(sessionId) as Array<{
      questionId: number;
      selectedLabels: string;
      submitted: number;
    }>;
  const answers: Record<number, string[]> = {};
  const submitted: Record<number, boolean> = {};
  for (const row of rows) {
    try {
      const parsed = JSON.parse(row.selectedLabels) as string[];
      if (parsed.length) answers[row.questionId] = parsed;
    } catch {
      // ignore malformed row
    }
    if (row.submitted) submitted[row.questionId] = true;
  }
  return {
    answers,
    submitted,
    currentIndex: session.currentIndex ?? 0,
    finished: Boolean(session.finishedAt),
    finishedAt: session.finishedAt,
  };
}

export function saveSessionProgress(
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
): void {
  const db = getDb();
  const updateIndex = db.prepare(
    "UPDATE exam_sessions SET current_index = ? WHERE id = ? AND finished_at IS NULL",
  );
  const deleteAnswers = db.prepare(
    "DELETE FROM exam_session_answers WHERE session_id = ?",
  );
  const insertAnswer = db.prepare(
    `INSERT INTO exam_session_answers
       (session_id, question_id, selected_labels, is_correct, submitted)
     VALUES (?, ?, ?, ?, ?)`,
  );
  const tx = db.transaction(() => {
    updateIndex.run(progress.currentIndex, sessionId);
    deleteAnswers.run(sessionId);
    for (const entry of progress.entries) {
      if (!entry.selected.length) continue;
      insertAnswer.run(
        sessionId,
        entry.questionId,
        JSON.stringify(entry.selected),
        entry.isCorrect ? 1 : 0,
        entry.submitted ? 1 : 0,
      );
    }
  });
  tx();
}

export function finalizeExamSession(
  sessionId: string,
  correctCount: number,
  score: number,
  answers: Array<{ questionId: number; selected: string[]; isCorrect: boolean }>,
): void {
  const db = getDb();
  const updateSession = db.prepare(
    `
      UPDATE exam_sessions
      SET finished_at = ?, correct_count = ?, score = ?
      WHERE id = ?
    `,
  );
  const deleteOldAnswers = db.prepare(
    "DELETE FROM exam_session_answers WHERE session_id = ?",
  );
  const insertAnswer = db.prepare(
    `
      INSERT INTO exam_session_answers (session_id, question_id, selected_labels, is_correct)
      VALUES (?, ?, ?, ?)
    `,
  );
  const tx = db.transaction(() => {
    updateSession.run(new Date().toISOString(), correctCount, score, sessionId);
    deleteOldAnswers.run(sessionId);
    for (const answer of answers) {
      insertAnswer.run(
        sessionId,
        answer.questionId,
        JSON.stringify(answer.selected),
        answer.isCorrect ? 1 : 0,
      );
    }
  });
  tx();
}

export function createExamSession(
  mode: ExamMode,
  userId: number | null = null,
): { id: string } {
  const db = getDb();
  const sessionId = randomUUID();
  const startedAt = new Date().toISOString();
  const questionIds = db
    .prepare(
      "SELECT id FROM questions ORDER BY RANDOM() LIMIT ?",
    )
    .all(QUESTIONS_PER_EXAM) as Array<{ id: number }>;

  if (questionIds.length !== QUESTIONS_PER_EXAM) {
    throw new Error("Not enough questions in the database to create an exam.");
  }

  const insertSession = db.prepare(
    `
      INSERT INTO exam_sessions (id, mode, total_questions, time_limit_seconds, started_at, user_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
  );
  const insertQuestion = db.prepare(
    `
      INSERT INTO exam_session_questions (session_id, position, question_id)
      VALUES (?, ?, ?)
    `,
  );

  const insertAll = db.transaction(() => {
    insertSession.run(
      sessionId,
      mode,
      QUESTIONS_PER_EXAM,
      mode === "timed" ? TIMED_EXAM_SECONDS : null,
      startedAt,
      userId,
    );

    questionIds.forEach((question, index) => {
      insertQuestion.run(sessionId, index + 1, question.id);
    });
  });

  insertAll();

  return { id: sessionId };
}

export function getExamSession(sessionId: string): ExamSession | null {
  const db = getDb();
  const session = db
    .prepare(
      `
        SELECT id, mode, total_questions, time_limit_seconds, started_at
        FROM exam_sessions
        WHERE id = ?
      `,
    )
    .get(sessionId) as
    | {
        id: string;
        mode: ExamMode;
        total_questions: number;
        time_limit_seconds: number | null;
        started_at: string;
      }
    | undefined;

  if (!session) {
    return null;
  }

  const rows = db
    .prepare(
      `
        SELECT
          esq.position AS question_position,
          q.id AS question_id,
          q.source_number,
          q.prompt,
          q.selection_mode,
          q.correct_answers,
          q.explanation,
          q.explanation_source,
          qo.label AS option_label,
          qo.body AS option_body
        FROM exam_session_questions esq
        JOIN questions q
          ON q.id = esq.question_id
        JOIN question_options qo
          ON qo.question_id = q.id
        WHERE esq.session_id = ?
        ORDER BY esq.position ASC, qo.position ASC
      `,
    )
    .all(sessionId) as Array<{
    question_position: number;
    question_id: number;
    source_number: number;
    prompt: string;
    selection_mode: "single" | "multiple";
    correct_answers: string;
    explanation: string;
    explanation_source: "provided" | "generated";
    option_label: string;
    option_body: string;
  }>;

  const groupedQuestions = new Map<number, ExamQuestion>();

  for (const row of rows) {
    if (!groupedQuestions.has(row.question_id)) {
      groupedQuestions.set(row.question_id, {
        id: row.question_id,
        sourceNumber: row.source_number,
        prompt: row.prompt,
        selectionMode: row.selection_mode,
        correctAnswers: JSON.parse(row.correct_answers) as string[],
        explanation: row.explanation,
        explanationSource: row.explanation_source,
        options: [],
      });
    }

    groupedQuestions.get(row.question_id)?.options.push({
      label: row.option_label,
      body: row.option_body,
    });
  }

  return {
    id: session.id,
    mode: session.mode,
    totalQuestions: session.total_questions,
    timeLimitSeconds: session.time_limit_seconds,
    startedAt: session.started_at,
    questions: [...groupedQuestions.values()],
  };
}
