import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Layers } from "lucide-react";

import { FlashcardRunner } from "@/components/flashcard-runner";
import { requireMember } from "@/lib/auth";
import { categorySlug } from "@/lib/cheatsheet-style";
import {
  getCheatsheetBySlug,
  listFlashcardsForCheatsheetWithReview,
} from "@/lib/exam-data";

export const dynamic = "force-dynamic";

export default async function FlashcardsRunPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requireMember();
  const { slug } = await params;
  const sheet = await getCheatsheetBySlug(slug);
  if (!sheet) notFound();

  const cards = await listFlashcardsForCheatsheetWithReview(user.id, sheet.id);

  if (cards.length === 0) {
    redirect(`/cheatsheets/${slug}`);
  }

  const catClass = categorySlug(sheet.category);

  return (
    <div className={`flashcards-shell flashcards-shell--${catClass}`}>
      <header className="flashcards-shell-header">
        <Link
          aria-label="Retour à la fiche"
          className="flashcards-shell-close"
          href={`/cheatsheets/${slug}`}
        >
          <span aria-hidden>×</span>
        </Link>
        <div className="flashcards-shell-title">
          <Layers size={14} />
          <span>{sheet.title}</span>
        </div>
        <span className="flashcards-shell-spacer" />
      </header>
      <FlashcardRunner
        cards={cards.map((c) => ({
          id: c.id,
          question: c.question,
          answer: c.answer,
          hint: c.hint,
          lastRating: c.lastRating,
          streak: c.streak,
        }))}
        cheatsheetSlug={slug}
        cheatsheetTitle={sheet.title}
        categoryClass={catClass}
      />
    </div>
  );
}
