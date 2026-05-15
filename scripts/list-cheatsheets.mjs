import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const line of env.split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
}

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const res = await client.execute(
  "SELECT id, slug, title, category, domains, priority, length(content) AS len FROM cheatsheets ORDER BY category, title",
);

console.log(`Total: ${res.rows.length}\n`);
const byCat = new Map();
for (const r of res.rows) {
  const cat = String(r.category);
  if (!byCat.has(cat)) byCat.set(cat, []);
  byCat.get(cat).push(r);
}

for (const [cat, rows] of [...byCat.entries()].sort()) {
  console.log(`### ${cat} (${rows.length})`);
  for (const r of rows) {
    console.log(
      `  ${String(r.id).padStart(3)}  ${String(r.priority).padEnd(6)}  ${String(r.len).padStart(5)}  ${r.title}  [${r.slug}]  domains=${r.domains}`,
    );
  }
  console.log();
}
