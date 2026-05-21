import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Layers } from "lucide-react";

import { FlashcardRunner } from "@/components/flashcard-runner";
import { requireMember } from "@/lib/auth";
import { categorySlug } from "@/lib/cheatsheet-style";
import {
  FLASHCARD_MASTERY_STREAK,
  getCheatsheetBySlug,
  listFlashcardsForCheatsheetWithReview,
} from "@/lib/exam-data";

export const dynamic = "force-dynamic";

export default async function FlashcardsRunPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await requireMember();
  const { slug } = await params;
  const { filter } = await searchParams;
  const sheet = await getCheatsheetBySlug(slug);
  if (!sheet) notFound();

  const allCards = await listFlashcardsForCheatsheetWithReview(user.id, sheet.id);

  const isUnknownFilter = filter === "unknown";
  const cards = isUnknownFilter
    ? allCards.filter((c) => {
        // "Pas encore maîtrisée" = jamais vue, ratée la dernière fois,
        // ou streak insuffisant.
        if (c.lastRating === null) return true;
        if (c.lastRating === "again") return true;
        return c.streak < FLASHCARD_MASTERY_STREAK;
      })
    : allCards;

  if (cards.length === 0) {
    redirect(`/cheatsheets/${slug}`);
  }

  const catClass = categorySlug(sheet.category);
  const sessionKey = isUnknownFilter ? `${slug}:unknown` : slug;

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
          <span>
            {sheet.title}
            {isUnknownFilter ? " · non maîtrisées" : ""}
          </span>
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
        sessionKey={sessionKey}
      />
    </div>
  );
}
