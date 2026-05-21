import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AdminNav } from "@/components/admin-nav";
import { FlashcardsEditor } from "@/components/flashcards-editor";
import { requireAdmin } from "@/lib/auth";
import { categorySlug } from "@/lib/cheatsheet-style";
import {
  getCheatsheetBySlug,
  listFlashcardsForCheatsheet,
} from "@/lib/exam-data";

export const dynamic = "force-dynamic";

export default async function AdminFlashcardsEditPage({
  params,
}: {
  params: Promise<{ cheatsheetSlug: string }>;
}) {
  await requireAdmin();
  const { cheatsheetSlug } = await params;
  const sheet = await getCheatsheetBySlug(cheatsheetSlug);
  if (!sheet) notFound();
  const cards = await listFlashcardsForCheatsheet(sheet.id);
  const catClass = categorySlug(sheet.category);

  return (
    <main className="page-shell">
      <AdminNav />
      <section className={`paper-card user-list-hero cheatsheet-hero--${catClass}`}>
        <div>
          <p className="eyebrow">Flashcards</p>
          <h1 className="users-title">{sheet.title}</h1>
          <p className="users-subtitle">
            {cards.length} carte{cards.length > 1 ? "s" : ""} · catégorie {sheet.category}
          </p>
        </div>
        <Link className="secondary-button" href="/admin/flashcards">
          <ArrowLeft size={16} />
          Decks
        </Link>
      </section>

      <FlashcardsEditor
        cards={cards.map((c) => ({
          id: c.id,
          question: c.question,
          answer: c.answer,
          hint: c.hint,
          position: c.position,
          source: c.source,
        }))}
        cheatsheetId={sheet.id}
      />
    </main>
  );
}
