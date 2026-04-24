import "server-only";

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { getDb, normalizePseudoKey, type User } from "./exam-data";

const COOKIE_NAME = "aws_saa_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
const SCRYPT_KEYLEN = 64;

function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, SCRYPT_KEYLEN);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const derived = scryptSync(password, salt, expected.length);
  return (
    derived.length === expected.length && timingSafeEqual(derived, expected)
  );
}

export type AuthResult =
  | { ok: true; user: User }
  | { ok: false; error: string };

export function loginOrRegister(
  pseudo: string,
  password: string,
): AuthResult {
  const cleanedPseudo = pseudo.trim();
  const cleanedPassword = password;
  if (!cleanedPseudo) return { ok: false, error: "Pseudo requis." };
  if (cleanedPassword.length < 4)
    return { ok: false, error: "Mot de passe (min. 4 caracteres)." };

  const db = getDb();
  const key = normalizePseudoKey(cleanedPseudo);
  const existing = db
    .prepare(
      "SELECT id, pseudo, password_hash FROM users WHERE pseudo_key = ?",
    )
    .get(key) as
    | { id: number; pseudo: string; password_hash: string | null }
    | undefined;

  if (existing) {
    if (!existing.password_hash) {
      db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(
        hashPassword(cleanedPassword),
        existing.id,
      );
      return { ok: true, user: { id: existing.id, pseudo: existing.pseudo } };
    }
    if (!verifyPassword(cleanedPassword, existing.password_hash)) {
      return { ok: false, error: "Mot de passe incorrect." };
    }
    return { ok: true, user: { id: existing.id, pseudo: existing.pseudo } };
  }

  const info = db
    .prepare(
      "INSERT INTO users (pseudo, pseudo_key, created_at, password_hash) VALUES (?, ?, ?, ?)",
    )
    .run(cleanedPseudo, key, new Date().toISOString(), hashPassword(cleanedPassword));
  return {
    ok: true,
    user: { id: Number(info.lastInsertRowid), pseudo: cleanedPseudo },
  };
}

export async function createAuthSession(userId: number): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const db = getDb();
  db.prepare(
    "INSERT INTO user_auth_sessions (token, user_id, created_at) VALUES (?, ?, ?)",
  ).run(token, userId, new Date().toISOString());
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function destroyAuthSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) {
    getDb()
      .prepare("DELETE FROM user_auth_sessions WHERE token = ?")
      .run(token);
  }
  jar.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const row = getDb()
    .prepare(
      `SELECT u.id, u.pseudo
       FROM user_auth_sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ?`,
    )
    .get(token) as { id: number; pseudo: string } | undefined;
  return row ?? null;
}

