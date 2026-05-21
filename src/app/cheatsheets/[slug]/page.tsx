import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle, ArrowLeft, Layers, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { startQuizAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { requireMember } from "@/lib/auth";
import { categorySlug, prioritySlug } from "@/lib/cheatsheet-style";
import {
  countFlashcardsForCheatsheet,
  countQuestionsForCheatsheet,
  getCheatsheetBySlug,
  getCheatsheetMastery,
  getFlashcardDeckProgress,
} from "@/lib/exam-data";

export const dynamic = "force-dynamic";

export default async function CheatsheetDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireMember();
  const { slug } = await params;
  const sp = await searchParams;
  const sheet = await getCheatsheetBySlug(slug);
  if (!sheet) notFound();

  const [questionCount, mastery, flashcardCount, flashcardProgress] =
    await Promise.all([
      countQuestionsForCheatsheet(sheet.id),
      getCheatsheetMastery(user.id, sheet.id),
      countFlashcardsForCheatsheet(sheet.id),
      getFlashcardDeckProgress(user.id, sheet.id),
    ]);

  const catClass = categorySlug(sheet.category);
  const tierClass = prioritySlug(sheet.priority);
  const masteryPct =
    mastery && mastery.masteryRate !== null
      ? Math.round(mastery.masteryRate)
      : null;
  const emptyQuizError = sp.quiz === "empty";
  const flashcardMasteryPct =
    flashcardProgress.total > 0
      ? Math.round((flashcardProgress.mastered / flashcardProgress.total) * 100)
      : null;

  return (
    <main className="page-shell">
      <section
        className={`paper-card user-list-hero cheatsheet-detail-hero cheatsheet-hero--${catClass}`}
      >
        <div>
          <div className="cheatsheet-detail-tags">
            <span className={`cheatsheet-chip cheatsheet-chip--${catClass}`}>
              {sheet.category}
            </span>
            {sheet.priority ? (
              <span className={`cheatsheet-card-priority cheatsheet-tier--${tierClass}`}>
                {sheet.priority}
              </span>
            ) : null}
          </div>
          <h1 className="users-title">{sheet.title}</h1>
          <p className="users-subtitle">{sheet.domains || "AWS SAA-C03"}</p>
        </div>
        <Link className="secondary-button" href="/cheatsheets">
          <ArrowLeft size={16} />
          Liste
        </Link>
      </section>

      <section className="paper-card cheatsheet-quiz-card">
        <div className="cheatsheet-quiz-info">
          <p className="eyebrow">Quiz</p>
          <h2>Teste tes connaissances sur cette fiche</h2>
          <p className="cheatsheet-quiz-meta">
            {questionCount === 0
              ? "Aucune question n'est encore liée à cette cheatsheet."
              : `${questionCount} question${questionCount > 1 ? "s" : ""} liée${questionCount > 1 ? "s" : ""}${
                  questionCount > 20 ? " · 20 tirées au sort par quiz" : ""
                }${
                  masteryPct !== null
                    ? ` · ${masteryPct}% maîtrisée${mastery!.mastered > 1 ? "s" : ""} (${mastery!.mastered}/${mastery!.total})`
                    : ""
                }`}
          </p>
          {emptyQuizError ? (
            <p className="cheatsheet-quiz-error">
              <AlertCircle size={14} />
              Impossible de lancer un quiz : aucune question liée pour l&apos;instant.
            </p>
          ) : null}
        </div>
        <form action={startQuizAction}>
          <input name="cheatsheetId" type="hidden" value={sheet.id} />
          <input name="cheatsheetSlug" type="hidden" value={sheet.slug} />
          <FormSubmitButton
            className="primary-button"
            disabled={questionCount === 0}
            pendingLabel="Démarrage…"
          >
            <Sparkles size={16} />
            Lancer le quiz
          </FormSubmitButton>
        </form>
      </section>

      <section className={`paper-card cheatsheet-quiz-card cheatsheet-flashcards-card cheatsheet-flashcards-card--${catClass}`}>
        <div className="cheatsheet-quiz-info">
          <p className="eyebrow">Flashcards</p>
          <h2>Révise par cartes mémorables</h2>
          <p className="cheatsheet-quiz-meta">
            {flashcardCount === 0
              ? "Aucune flashcard générée pour cette fiche."
              : `${flashcardCount} carte${flashcardCount > 1 ? "s" : ""}${
                  flashcardMasteryPct !== null
                    ? ` · ${flashcardMasteryPct}% maîtrisée${flashcardProgress.mastered > 1 ? "s" : ""} (${flashcardProgress.mastered}/${flashcardProgress.total})`
                    : ""
                }`}
          </p>
          {flashcardCount > 0 ? (
            <div className="cheatsheet-flashcards-bar" aria-hidden>
              <span
                className="cheatsheet-flashcards-bar-seg cheatsheet-flashcards-bar-seg--mastered"
                style={{ width: `${(flashcardProgress.mastered / flashcardProgress.total) * 100}%` }}
              />
              <span
                className="cheatsheet-flashcards-bar-seg cheatsheet-flashcards-bar-seg--learning"
                style={{ width: `${(flashcardProgress.learning / flashcardProgress.total) * 100}%` }}
              />
              <span className="cheatsheet-flashcards-bar-legend">
                <span>{flashcardProgress.mastered} maîtrisée{flashcardProgress.mastered > 1 ? "s" : ""}</span>
                <span>{flashcardProgress.learning} en cours</span>
                <span>{flashcardProgress.fresh} jamais vue{flashcardProgress.fresh > 1 ? "s" : ""}</span>
              </span>
            </div>
          ) : null}
        </div>
        {flashcardCount === 0 ? (
          <span className="secondary-button" aria-disabled style={{ opacity: 0.55, cursor: "not-allowed" }}>
            <Layers size={16} />
            Bientôt
          </span>
        ) : (
          <div className="cheatsheet-flashcards-actions">
            <Link
              className="primary-button"
              href={`/cheatsheets/${sheet.slug}/flashcards`}
            >
              <Layers size={16} />
              Tout le deck
            </Link>
            {flashcardProgress.learning + flashcardProgress.fresh > 0 ? (
              <Link
                className="secondary-button"
                href={`/cheatsheets/${sheet.slug}/flashcards?filter=unknown`}
              >
                Non maîtrisées ({flashcardProgress.learning + flashcardProgress.fresh})
              </Link>
            ) : null}
          </div>
        )}
      </section>

      <article className="paper-card cheatsheet-article">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{sheet.content}</ReactMarkdown>
      </article>
    </main>
  );
}
