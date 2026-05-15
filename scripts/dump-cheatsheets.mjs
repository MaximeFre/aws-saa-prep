import { mkdirSync, writeFileSync } from "node:fs";
import { makeClient } from "./_db-helpers.mjs";

const OUT_DIR = "/tmp/cheatsheet-inputs";
mkdirSync(OUT_DIR, { recursive: true });

const client = makeClient();
const r = await client.execute(
  "SELECT slug, title, category, domains, priority, content FROM cheatsheets ORDER BY slug",
);

for (const row of r.rows) {
  const payload = {
    slug: String(row.slug),
    title: String(row.title),
    category: String(row.category),
    domains: String(row.domains),
    priority: String(row.priority),
    existing_content: String(row.content),
    existing_length: String(row.content).length,
  };
  writeFileSync(
    `${OUT_DIR}/${payload.slug}.json`,
    JSON.stringify(payload, null, 2),
  );
}

console.log(`Dumped ${r.rows.length} cheatsheets to ${OUT_DIR}`);
