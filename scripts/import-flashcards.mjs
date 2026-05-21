#!/usr/bin/env node
// Import flashcards en DB pour une cheatsheet donnée.
//
// Usage:
//   node scripts/import-flashcards.mjs --slug=<slug> [--dry-run] < cards.json
//   echo '[...]' | node scripts/import-flashcards.mjs --slug=s3
//
// Le JSON sur stdin est un tableau d'objets:
//   { position: number, question: string, answer: string, hint?: string|null, tags?: string[] }
//
// Comportement: DELETE + INSERT atomique. Toute carte existante (incl. manual) est
// remplacée. Source forcée à 'generated'.

import { makeClient } from "./_db-helpers.mjs";

function parseArgs(argv) {
  const args = { slug: null, dryRun: false };
  for (const a of argv.slice(2)) {
    if (a === "--dry-run") args.dryRun = true;
    else if (a.startsWith("--slug=")) args.slug = a.slice("--slug=".length);
    else if (a === "-h" || a === "--help") args.help = true;
    else {
      console.error(`Argument inconnu: ${a}`);
      process.exit(2);
    }
  }
  return args;
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

function validateCards(raw) {
  if (!Array.isArray(raw)) {
    throw new Error("Le JSON doit être un tableau de cartes.");
  }
  const cards = [];
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (!c || typeof c !== "object") {
      throw new Error(`Carte #${i + 1}: doit être un objet.`);
    }
    const question = typeof c.question === "string" ? c.question.trim() : "";
    const answer = typeof c.answer === "string" ? c.answer.trim() : "";
    if (!question) throw new Error(`Carte #${i + 1}: 'question' vide.`);
    if (!answer) throw new Error(`Carte #${i + 1}: 'answer' vide.`);
    const hint =
      typeof c.hint === "string" && c.hint.trim() ? c.hint.trim() : null;
    const position =
      Number.isInteger(c.position) && c.position > 0 ? c.position : i + 1;
    cards.push({ position, question, answer, hint });
  }
  cards.sort((a, b) => a.position - b.position);
  return cards.map((c, i) => ({ ...c, position: i + 1 }));
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(
      "Usage: node scripts/import-flashcards.mjs --slug=<slug> [--dry-run] < cards.json",
    );
    process.exit(0);
  }
  if (!args.slug) {
    console.error("Erreur: --slug=<slug> requis.");
    process.exit(2);
  }

  const stdin = await readStdin();
  if (!stdin.trim()) {
    console.error("Erreur: aucun JSON reçu sur stdin.");
    process.exit(2);
  }
  let parsed;
  try {
    parsed = JSON.parse(stdin);
  } catch (err) {
    console.error(`Erreur: JSON invalide — ${err.message}`);
    process.exit(2);
  }

  let cards;
  try {
    cards = validateCards(parsed);
  } catch (err) {
    console.error(`Erreur: ${err.message}`);
    process.exit(2);
  }

  const db = makeClient();

  // Idempotent: assure que les tables flashcards existent (au cas où la
  // migration côté Next.js n'a pas encore tourné dans ce process).
  await db.execute(
    `CREATE TABLE IF NOT EXISTS flashcards (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       cheatsheet_id INTEGER NOT NULL,
       question TEXT NOT NULL,
       answer TEXT NOT NULL,
       hint TEXT,
       position INTEGER NOT NULL DEFAULT 0,
       source TEXT NOT NULL DEFAULT 'manual',
       created_at TEXT NOT NULL,
       updated_at TEXT NOT NULL,
       FOREIGN KEY(cheatsheet_id) REFERENCES cheatsheets(id) ON DELETE CASCADE
     )`,
  );
  await db.execute(
    "CREATE INDEX IF NOT EXISTS idx_flashcards_cheatsheet ON flashcards(cheatsheet_id, position)",
  );
  await db.execute(
    `CREATE TABLE IF NOT EXISTS flashcard_reviews (
       user_id INTEGER NOT NULL,
       flashcard_id INTEGER NOT NULL,
       rating TEXT NOT NULL,
       streak INTEGER NOT NULL DEFAULT 0,
       reviewed_at TEXT NOT NULL,
       PRIMARY KEY (user_id, flashcard_id),
       FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
       FOREIGN KEY(flashcard_id) REFERENCES flashcards(id) ON DELETE CASCADE
     )`,
  );
  await db.execute(
    "CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_card ON flashcard_reviews(flashcard_id)",
  );

  const lookup = await db.execute({
    sql: "SELECT id, title FROM cheatsheets WHERE slug = ?",
    args: [args.slug],
  });
  const sheet = lookup.rows[0];
  if (!sheet) {
    console.error(`Erreur: cheatsheet slug='${args.slug}' introuvable.`);
    process.exit(3);
  }
  const cheatsheetId = Number(sheet.id);
  const title = String(sheet.title);

  if (args.dryRun) {
    console.log(
      `[dry-run] slug='${args.slug}' (id=${cheatsheetId}, title='${title}')`,
    );
    console.log(`[dry-run] DELETE FROM flashcards WHERE cheatsheet_id=${cheatsheetId}`);
    console.log(`[dry-run] INSERT ${cards.length} cartes`);
    for (const c of cards.slice(0, 3)) {
      console.log(
        `  #${c.position}  Q: ${c.question.slice(0, 70)}${c.question.length > 70 ? "…" : ""}`,
      );
      console.log(
        `              A: ${c.answer.slice(0, 70)}${c.answer.length > 70 ? "…" : ""}`,
      );
    }
    if (cards.length > 3) console.log(`  …(+${cards.length - 3} cartes)`);
    process.exit(0);
  }

  const now = new Date().toISOString();
  const statements = [
    {
      sql: "DELETE FROM flashcards WHERE cheatsheet_id = ?",
      args: [cheatsheetId],
    },
    ...cards.map((c) => ({
      sql: `INSERT INTO flashcards
              (cheatsheet_id, question, answer, hint, position, source, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 'generated', ?, ?)`,
      args: [cheatsheetId, c.question, c.answer, c.hint, c.position, now, now],
    })),
  ];

  try {
    await db.batch(statements, "write");
  } catch (err) {
    console.error(`Erreur DB: ${err.message}`);
    process.exit(4);
  }
  console.log(
    `✓ ${cards.length} flashcards insérées pour '${title}' (slug=${args.slug}, id=${cheatsheetId})`,
  );
}

main().catch((err) => {
  console.error(`Erreur fatale: ${err?.stack || err}`);
  process.exit(1);
});
