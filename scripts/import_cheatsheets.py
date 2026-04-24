from __future__ import annotations

import re
import sqlite3
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
CHEATSHEET_DIR = ROOT / "cheatsheet"
DB_PATH = ROOT / "data" / "aws-saa.sqlite"

PROPERTY_KEYS = {"category", "domains", "priority"}


def parse_cheatsheet(path: Path) -> dict[str, str] | None:
    raw = path.read_text(encoding="utf-8")
    lines = raw.splitlines()

    title = ""
    props: dict[str, str] = {}
    content_start = 0

    for index, line in enumerate(lines):
        stripped = line.strip()
        if index == 0 and stripped.startswith("# "):
            title = stripped[2:].strip()
            continue
        if not stripped:
            continue
        match = re.match(r"^([A-Za-z ]+):\s*(.+)$", stripped)
        if match and match.group(1).lower().strip() in PROPERTY_KEYS:
            key = match.group(1).lower().strip()
            props[key] = match.group(2).strip()
            continue
        content_start = index
        break

    if not title:
        title = path.stem.rsplit(" ", 1)[0]

    content = "\n".join(lines[content_start:]).strip()
    if not content:
        return None

    return {
        "title": title,
        "category": props.get("category", "Uncategorized"),
        "domains": props.get("domains", ""),
        "priority": props.get("priority", ""),
        "content": content,
    }


def main() -> None:
    if not CHEATSHEET_DIR.exists():
        print("No cheatsheet directory found.", file=sys.stderr)
        sys.exit(1)

    connection = sqlite3.connect(DB_PATH)
    connection.execute("PRAGMA foreign_keys = ON;")
    cursor = connection.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS cheatsheets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT NOT NULL UNIQUE,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            domains TEXT NOT NULL,
            priority TEXT NOT NULL,
            content TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """
    )
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_cheatsheets_category ON cheatsheets(category)"
    )
    cursor.execute("DELETE FROM cheatsheets")

    inserted = 0
    for path in sorted(CHEATSHEET_DIR.iterdir()):
        if path.suffix.lower() != ".md":
            continue
        parsed = parse_cheatsheet(path)
        if not parsed:
            print(f"skipped (empty): {path.name}", file=sys.stderr)
            continue
        slug = re.sub(r"[^a-z0-9]+", "-", parsed["title"].lower()).strip("-") or path.stem
        cursor.execute(
            """
            INSERT INTO cheatsheets (slug, title, category, domains, priority, content, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(slug) DO UPDATE SET
                title=excluded.title,
                category=excluded.category,
                domains=excluded.domains,
                priority=excluded.priority,
                content=excluded.content,
                updated_at=datetime('now')
            """,
            (
                slug,
                parsed["title"],
                parsed["category"],
                parsed["domains"],
                parsed["priority"],
                parsed["content"],
            ),
        )
        inserted += 1

    connection.commit()
    connection.close()
    print(f"Imported {inserted} cheatsheets into {DB_PATH.name}.")


if __name__ == "__main__":
    main()
