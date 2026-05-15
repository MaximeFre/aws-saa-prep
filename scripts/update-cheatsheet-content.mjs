import { readFileSync } from "node:fs";
import { makeClient } from "./_db-helpers.mjs";

const slug = process.argv[2];
const contentPath = process.argv[3];

if (!slug || !contentPath) {
  console.error(
    "Usage: node scripts/update-cheatsheet-content.mjs <slug> <path-to-md>",
  );
  process.exit(1);
}

const content = readFileSync(contentPath, "utf8");
if (content.length < 4000) {
  console.error(
    `Refusing to write: content is only ${content.length} chars (min 4000). Enrich more.`,
  );
  process.exit(2);
}

const client = makeClient();
const now = new Date().toISOString();
const result = await client.execute({
  sql: "UPDATE cheatsheets SET content = ?, updated_at = ? WHERE slug = ?",
  args: [content, now, slug],
});

if (result.rowsAffected === 0) {
  console.error(`No cheatsheet found with slug=${slug}`);
  process.exit(3);
}

console.log(
  `OK slug=${slug} chars=${content.length} updated_at=${now}`,
);
