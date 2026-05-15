import Link from "next/link";
import { Search } from "lucide-react";

import { AdminNav } from "@/components/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { listQuestions } from "@/lib/exam-data";

export const dynamic = "force-dynamic";

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const { q } = await searchParams;
  const search = q?.trim() ?? "";
  const rows = await listQuestions(search);

  return (
    <main className="page-shell">
      <AdminNav />
      <section className="paper-card user-list-hero">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="users-title">Base de questions</h1>
          <p className="users-subtitle">
            {rows.length} resultat{rows.length > 1 ? "s" : ""}
            {search ? ` pour "${search}"` : ""}. Clique pour ouvrir et editer.
          </p>
        </div>
      </section>

      <section className="paper-card questions-toolbar">
        <form className="questions-search" method="get">
          <Search size={16} />
          <input
            autoComplete="off"
            className="user-picker-input questions-search-input"
            defaultValue={search}
            name="q"
            placeholder="Cherche par numero ou texte"
            type="text"
          />
          <button className="primary-button" type="submit">
            Filtrer
          </button>
        </form>
      </section>

      <section className="questions-list">
        {rows.map((row) => (
          <Link
            className="paper-card question-row"
            href={`/admin/questions/${row.id}`}
            key={row.id}
          >
            <div className="question-row-head">
              <span className="question-row-number">#{row.sourceNumber}</span>
              <div className="question-row-tags">
                <span
                  className={`session-mode-pill session-mode-pill--${row.selectionMode === "multiple" ? "timed" : "review"}`}
                >
                  {row.selectionMode === "multiple" ? "multi" : "single"}
                </span>
                <span className="question-row-correct">
                  {row.correctAnswers.join(", ")}
                </span>
                {row.explanationSource === "generated" ? (
                  <span className="question-row-badge">generated</span>
                ) : null}
                {row.explanationLength < 30 ? (
                  <span className="question-row-badge question-row-badge--warn">
                    expl. courte
                  </span>
                ) : null}
              </div>
            </div>
            <p className="question-row-prompt">{row.prompt}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
