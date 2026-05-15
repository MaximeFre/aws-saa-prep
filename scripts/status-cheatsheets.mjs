import { makeClient } from "./_db-helpers.mjs";

const client = makeClient();
const r = await client.execute(
  "SELECT slug, title, category, length(content) AS len FROM cheatsheets ORDER BY len ASC",
);

let todo = 0;
let done = 0;
console.log("Fiches courtes (< 8000 chars, à enrichir) :\n");
for (const row of r.rows) {
  const len = Number(row.len);
  if (len < 8000) {
    console.log(`  ${String(len).padStart(5)}  ${row.slug}  [${row.category}]`);
    todo++;
  } else {
    done++;
  }
}
console.log(`\nTotal: ${r.rows.length}  |  Enrichies (>= 8000): ${done}  |  À enrichir: ${todo}`);
