import Link from "next/link";
import { ChevronRight, Layers } from "lucide-react";

import { AdminNav } from "@/components/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { categorySlug, prioritySlug } from "@/lib/cheatsheet-style";
import { listCheatsheetsWithFlashcardCount } from "@/lib/exam-data";

export const dynamic = "force-dynamic";

export default async function AdminFlashcardsIndexPage() {
  await requireAdmin();
  const rows = await listCheatsheetsWithFlashcardCount();
  const totalCards = rows.reduce((acc, r) => acc + r.flashcardCount, 0);
  const sheetsWithCards = rows.filter((r) => r.flashcardCount > 0).length;

  return (
    <main className="page-shell">
      <AdminNav />
      <section className="paper-card user-list-hero">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="users-title">Flashcards</h1>
          <p className="users-subtitle">
            {totalCards} carte{totalCards > 1 ? "s" : ""} · {sheetsWithCards}/{rows.length} fiches couvertes.
            Clique sur une fiche pour éditer son deck.
          </p>
        </div>
      </section>

      <section className="questions-list">
        {rows.map((row) => {
          const catClass = categorySlug(row.category);
          const tierClass = prioritySlug(row.priority);
          return (
            <Link
              className="paper-card question-row"
              href={`/admin/flashcards/${row.slug}`}
              key={row.id}
            >
              <div className="question-row-head">
                <span className="question-row-number">
                  <Layers size={14} /> {row.flashcardCount}
                </span>
                <div className="question-row-tags">
                  <span className={`cheatsheet-chip cheatsheet-chip--${catClass}`}>
                    {row.category}
                  </span>
                  {row.priority ? (
                    <span className={`cheatsheet-card-priority cheatsheet-tier--${tierClass}`}>
                      {row.priority}
                    </span>
                  ) : null}
                </div>
                <ChevronRight size={16} aria-hidden />
              </div>
              <p className="question-row-prompt">{row.title}</p>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
