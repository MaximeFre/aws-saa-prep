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

const tables = await client.execute(
  "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
);
console.log("TABLES:");
for (const r of tables.rows) console.log(" -", r.name);

const cheatTables = tables.rows
  .map((r) => String(r.name))
  .filter((n) => n.toLowerCase().includes("cheat"));
console.log("\nCHEATSHEET TABLES:", cheatTables);

for (const t of cheatTables) {
  console.log(`\n--- SCHEMA ${t} ---`);
  const cols = await client.execute(`PRAGMA table_info(${t})`);
  for (const c of cols.rows) {
    console.log(`  ${c.name}  ${c.type}  notnull=${c.notnull}  pk=${c.pk}`);
  }
  const count = await client.execute(`SELECT COUNT(*) AS c FROM ${t}`);
  console.log(`  ROWS: ${count.rows[0].c}`);
}
