import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle, ArrowLeft, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { startQuizAction } from "@/app/actions";
import { getCurrentUser } from "@/lib/auth";
import { categorySlug, prioritySlug } from "@/lib/cheatsheet-style";
import {
  countQuestionsForCheatsheet,
  getCheatsheetBySlug,
  getCheatsheetMastery,
} from "@/lib/exam-data";

export const dynamic = "force-dynamic";

export default async function CheatsheetDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const sheet = await getCheatsheetBySlug(slug);
  if (!sheet) notFound();

  const user = await getCurrentUser();
  const [questionCount, mastery] = await Promise.all([
    countQuestionsForCheatsheet(sheet.id),
    user ? getCheatsheetMastery(user.id, sheet.id) : null,
  ]);

  const catClass = categorySlug(sheet.category);
  const tierClass = prioritySlug(sheet.priority);
  const masteryPct =
    mastery && mastery.masteryRate !== null
      ? Math.round(mastery.masteryRate)
      : null;
  const emptyQuizError = sp.quiz === "empty";

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
        {user ? (
          <form action={startQuizAction}>
            <input name="cheatsheetId" type="hidden" value={sheet.id} />
            <input name="cheatsheetSlug" type="hidden" value={sheet.slug} />
            <button
              className="primary-button"
              disabled={questionCount === 0}
              type="submit"
            >
              <Sparkles size={16} />
              Lancer le quiz
            </button>
          </form>
        ) : (
          <Link className="secondary-button" href="/">
            Connecte-toi pour quizzer
          </Link>
        )}
      </section>

      <article className="paper-card cheatsheet-article">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{sheet.content}</ReactMarkdown>
      </article>
    </main>
  );
}
