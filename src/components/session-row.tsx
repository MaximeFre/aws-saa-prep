"use client";

import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import { deleteSessionAction } from "@/app/actions";
import type { UserSessionRow } from "@/lib/exam-data";

export function SessionRow({
  session,
  formattedDate,
  formattedDuration,
}: {
  session: UserSessionRow;
  formattedDate: string;
  formattedDuration: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const inProgress = !session.finishedAt;
  const total = session.totalQuestions || 1;
  const answered = Math.min(session.answeredCount, total);
  const progressPct = Math.round((answered / total) * 100);
  const currentQuestion = Math.min(session.currentIndex + 1, total);

  function onDelete() {
    if (
      !window.confirm(
        "Supprimer cette session ? Cette action est definitive.",
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteSessionAction(session.id);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="user-sessions-row user-sessions-row--link">
      <Link
        className="user-sessions-row__link"
        href={`/exam/${session.id}`}
        aria-label={`Ouvrir la session du ${formattedDate}`}
      >
        <span>{formattedDate}</span>
        <span>
          <span
            className={`session-mode-pill session-mode-pill--${session.mode}`}
          >
            {session.mode}
          </span>
        </span>
        <span>{formattedDuration}</span>
        <span>
          {inProgress ? (
            <span className="session-progress">
              <span className="session-progress-label">
                en cours · Q{currentQuestion}/{total}
              </span>
              <span
                className="session-progress-bar"
                role="progressbar"
                aria-valuenow={progressPct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span
                  className="session-progress-bar-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </span>
            </span>
          ) : session.score !== null ? (
            `${session.score} / 1000`
          ) : (
            "-"
          )}
        </span>
        <span>
          {inProgress
            ? `${answered} / ${total} repondues`
            : session.correctCount !== null
              ? `${session.correctCount} / ${total}`
              : "-"}
        </span>
      </Link>
      <div className="user-sessions-row__actions">
        <button
          aria-label="Supprimer la session"
          className="session-delete-button"
          disabled={pending}
          onClick={onDelete}
          title="Supprimer la session"
          type="button"
        >
          {pending ? (
            <Loader2 className="spin" size={14} />
          ) : (
            <Trash2 size={14} />
          )}
        </button>
        {error ? (
          <span className="session-delete-error" role="alert">
            {error}
          </span>
        ) : null}
      </div>
    </div>
  );
}
