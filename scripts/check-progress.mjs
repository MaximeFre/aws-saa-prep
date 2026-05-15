import { makeClient } from "./_db-helpers.mjs";

const client = makeClient();
const r = await client.execute(
  "SELECT slug, length(content) AS len FROM cheatsheets ORDER BY len ASC",
);

const enriched = [];
const pending = [];
for (const row of r.rows) {
  const len = Number(row.len);
  if (len < 8000) pending.push({ slug: String(row.slug), len });
  else enriched.push({ slug: String(row.slug), len });
}

console.log(`TOTAL: ${r.rows.length}`);
console.log(`ENRICHED (>=8000 chars): ${enriched.length}`);
console.log(`PENDING (<8000 chars): ${pending.length}\n`);
console.log("PENDING SLUGS:");
for (const p of pending) console.log(`  ${String(p.len).padStart(5)}  ${p.slug}`);
