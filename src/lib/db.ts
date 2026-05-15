import "server-only";

import { createClient, type Client } from "@libsql/client";

type GlobalWithClient = typeof globalThis & {
  __awsExamLibsql?: Client;
  __awsExamLibsqlReady?: Promise<void>;
};

export function getClient(): Client {
  const g = globalThis as GlobalWithClient;
  if (!g.__awsExamLibsql) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (!url) {
      throw new Error("TURSO_DATABASE_URL is not set");
    }
    g.__awsExamLibsql = createClient({ url, authToken });
  }
  return g.__awsExamLibsql;
}

export async function ensureMigrations(): Promise<void> {
  const g = globalThis as GlobalWithClient;
  if (g.__awsExamLibsqlReady) {
    return g.__awsExamLibsqlReady;
  }
  g.__awsExamLibsqlReady = (async () => {
    const client = getClient();
    const sessionCols = (
      await client.execute("PRAGMA table_info(exam_sessions)")
    ).rows;
    if (!sessionCols.some((c) => c.name === "current_index")) {
      await client.execute(
        "ALTER TABLE exam_sessions ADD COLUMN current_index INTEGER NOT NULL DEFAULT 0",
      );
    }
    const answerCols = (
      await client.execute("PRAGMA table_info(exam_session_answers)")
    ).rows;
    if (!answerCols.some((c) => c.name === "submitted")) {
      await client.execute(
        "ALTER TABLE exam_session_answers ADD COLUMN submitted INTEGER NOT NULL DEFAULT 0",
      );
    }
    const userCols = (
      await client.execute("PRAGMA table_info(users)")
    ).rows;
    if (!userCols.some((c) => c.name === "password_hash")) {
      await client.execute("ALTER TABLE users ADD COLUMN password_hash TEXT");
    }
    await client.execute(
      `CREATE TABLE IF NOT EXISTS user_auth_sessions (
         token TEXT PRIMARY KEY,
         user_id INTEGER NOT NULL,
         created_at TEXT NOT NULL,
         FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
       )`,
    );
    await client.execute(
      `CREATE TABLE IF NOT EXISTS question_cheatsheets (
         question_id INTEGER NOT NULL,
         cheatsheet_id INTEGER NOT NULL,
         PRIMARY KEY(question_id, cheatsheet_id),
         FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE,
         FOREIGN KEY(cheatsheet_id) REFERENCES cheatsheets(id) ON DELETE CASCADE
       )`,
    );
    await client.execute(
      "CREATE INDEX IF NOT EXISTS idx_question_cheatsheets_cheatsheet ON question_cheatsheets(cheatsheet_id)",
    );
    if (!sessionCols.some((c) => c.name === "kind")) {
      await client.execute(
        "ALTER TABLE exam_sessions ADD COLUMN kind TEXT NOT NULL DEFAULT 'exam'",
      );
    }
    if (!sessionCols.some((c) => c.name === "cheatsheet_id")) {
      await client.execute(
        "ALTER TABLE exam_sessions ADD COLUMN cheatsheet_id INTEGER REFERENCES cheatsheets(id) ON DELETE SET NULL",
      );
    }
    if (!userCols.some((c) => c.name === "role")) {
      await client.execute(
        "ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'free'",
      );
    }
    await client.execute(
      "UPDATE users SET role = 'admin' WHERE pseudo_key = 'max' AND role != 'admin'",
    );
    const questionCols = (
      await client.execute("PRAGMA table_info(questions)")
    ).rows;
    if (!questionCols.some((c) => c.name === "extra_content")) {
      await client.execute(
        "ALTER TABLE questions ADD COLUMN extra_content TEXT",
      );
    }
  })();
  return g.__awsExamLibsqlReady;
}

export async function getDb(): Promise<Client> {
  await ensureMigrations();
  return getClient();
}

export function asNumber(v: unknown): number {
  if (typeof v === "bigint") return Number(v);
  if (typeof v === "number") return v;
  if (v === null || v === undefined) return 0;
  return Number(v);
}

export function asNullableNumber(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  return asNumber(v);
}

export function asString(v: unknown): string {
  return v == null ? "" : String(v);
}

export function asNullableString(v: unknown): string | null {
  return v == null ? null : String(v);
}
