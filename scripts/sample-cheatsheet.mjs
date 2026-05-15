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

const slug = process.argv[2] || "s3";
const r = await client.execute({
  sql: "SELECT slug, title, category, domains, priority, content FROM cheatsheets WHERE slug=? LIMIT 1",
  args: [slug],
});
if (r.rows.length === 0) {
  console.log("not found");
  process.exit(1);
}
const row = r.rows[0];
console.log(`slug: ${row.slug}`);
console.log(`title: ${row.title}`);
console.log(`category: ${row.category}`);
console.log(`domains: ${row.domains}`);
console.log(`priority: ${row.priority}`);
console.log("---");
console.log(row.content);
