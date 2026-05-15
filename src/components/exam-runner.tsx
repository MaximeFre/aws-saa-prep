"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ChevronDown,
  CloudOff,
  ExternalLink,
  Home,
  Loader2,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { finalizeExamAction, saveProgressAction } from "@/app/actions";
import type { ExamSession, SessionProgress } from "@/lib/exam-data";
import { splitPromptParagraphs } from "@/lib/format-prompt";
import {
  formatCountdown,
  isAnswerCorrect,
  normalizeAnswerSet,
  scoreOutOf1000,
} from "@/lib/scoring";

function SaveIndicator({
  status,
}: {
  status: "idle" | "saving" | "saved" | "error";
}) {
  if (status === "idle") {
    return null;
  }
  if (status === "saving") {
    return (
      <span
        aria-live="polite"
        className="exam-save-pill exam-save-pill--saving"
      >
        <Loader2 className="spin" size={12} />
        Sauvegarde…
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span aria-live="polite" className="exam-save-pill exam-save-pill--saved">
        <CheckCircle size={12} />
        Sauvegardé
      </span>
    );
  }
  return (
    <span aria-live="polite" className="exam-save-pill exam-save-pill--error">
      <CloudOff size={12} />
      Hors-ligne
    </span>
  );
}

function QuestionPrompt({
  prompt,
  extra,
  className,
}: {
  prompt: string;
  extra?: string | null;
  className: string;
}) {
  const paragraphs = splitPromptParagraphs(prompt);
  const extraBlock = extra ? (
    <pre className="question-extra">
      <code>{extra}</code>
    </pre>
  ) : null;
  if (paragraphs.length <= 1) {
    return (
      <div className="question-prompt">
        <h2 className={className}>{paragraphs[0] ?? prompt}</h2>
        {extraBlock}
      </div>
    );
  }
  const [scenario, ...rest] = paragraphs;
  return (
    <div className="question-prompt">
      <p className="question-scenario">{scenario}</p>
      {extraBlock}
      <h2 className={className}>{rest.join(" ")}</h2>
    </div>
  );
}

type RunnerState = {
  answers: Record<number, string[]>;
  submitted: Record<number, boolean>;
  currentIndex: number;
  finished: boolean;
  finishedAt: string | null;
};

const emptyState: RunnerState = {
  answers: {},
  submitted: {},
  currentIndex: 0,
  finished: false,
  finishedAt: null,
};

function isMultipleAnswer(correctAnswers: string[], selectionMode: string): boolean {
  return selectionMode === "multiple" || correctAnswers.length > 1;
}

export function ExamRunner({
  session,
  initialProgress,
}: {
  session: ExamSession;
  initialProgress: SessionProgress | null;
}) {
  const persistRef = useRef(false);
  const finalizedRef = useRef(Boolean(initialProgress?.finished));
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const saveResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [runnerState, setRunnerState] = useState<RunnerState>(() =>
    initialProgress
      ? {
          answers: initialProgress.answers,
          submitted: initialProgress.submitted,
          currentIndex: initialProgress.currentIndex,
          finished: initialProgress.finished,
          finishedAt: initialProgress.finishedAt,
        }
      : emptyState,
  );
  const [now, setNow] = useState(() => Date.parse(session.startedAt));

  useEffect(() => {
    setNow(Date.now());
  }, []);
  const [navCollapsed, setNavCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 720px)");
    const apply = () => setNavCollapsed(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);
  const currentQuestion = session.questions[runnerState.currentIndex];
  const currentAnswers = currentQuestion
    ? runnerState.answers[currentQuestion.id] ?? []
    : [];
  const currentSubmitted = currentQuestion
    ? Boolean(runnerState.submitted[currentQuestion.id])
    : false;
  const remainingSeconds =
    session.mode === "timed" && session.timeLimitSeconds !== null
      ? session.timeLimitSeconds -
        Math.floor((now - Date.parse(session.startedAt)) / 1000)
      : null;

  const questionResults = session.questions.map((question) => {
    const selectedAnswers = runnerState.answers[question.id] ?? [];
    const correct = isAnswerCorrect(selectedAnswers, question.correctAnswers);

    return {
      question,
      selectedAnswers,
      correct,
    };
  });

  const answeredCount = questionResults.filter(
    (result) => result.selectedAnswers.length > 0,
  ).length;
  const correctCount = questionResults.filter((result) => result.correct).length;
  const scaledScore = scoreOutOf1000(correctCount, session.questions.length);
  const incorrectResults = questionResults.filter((result) => !result.correct);

  const finishExam = () => {
    setRunnerState((current) => {
      if (current.finished) {
        return current;
      }

      return {
        ...current,
        finished: true,
        finishedAt: new Date().toISOString(),
      };
    });
  };

  useEffect(() => {
    if (!persistRef.current) {
      persistRef.current = true;
      return;
    }
    if (runnerState.finished) return;

    const handle = window.setTimeout(() => {
      const entries = session.questions
        .map((question) => {
          const selected = runnerState.answers[question.id] ?? [];
          return {
            questionId: question.id,
            selected,
            isCorrect: isAnswerCorrect(selected, question.correctAnswers),
            submitted: Boolean(runnerState.submitted[question.id]),
          };
        })
        .filter((entry) => entry.selected.length > 0);
      setSaveStatus("saving");
      saveProgressAction(session.id, runnerState.currentIndex, entries)
        .then(() => {
          setSaveStatus("saved");
          if (saveResetRef.current) {
            clearTimeout(saveResetRef.current);
          }
          saveResetRef.current = setTimeout(() => {
            setSaveStatus("idle");
          }, 1600);
        })
        .catch(() => {
          setSaveStatus("error");
        });
    }, 400);

    return () => window.clearTimeout(handle);
  }, [runnerState, session.id, session.questions]);

  useEffect(() => {
    return () => {
      if (saveResetRef.current) {
        clearTimeout(saveResetRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!runnerState.finished || finalizedRef.current) return;
    finalizedRef.current = true;
    const payload = session.questions.map((question) => {
      const selected = runnerState.answers[question.id] ?? [];
      return {
        questionId: question.id,
        selected,
        isCorrect: isAnswerCorrect(selected, question.correctAnswers),
      };
    });
    const correctTotal = payload.filter((entry) => entry.isCorrect).length;
    const finalScore = scoreOutOf1000(correctTotal, session.questions.length);
    finalizeExamAction(session.id, correctTotal, finalScore, payload).catch(
      () => {
        finalizedRef.current = false;
      },
    );
  }, [runnerState.finished, runnerState.answers, session.id, session.questions]);

  useEffect(() => {
    if (session.mode !== "timed" || runnerState.finished) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const nextNow = Date.now();
      setNow(nextNow);

      if (
        session.timeLimitSeconds !== null &&
        session.timeLimitSeconds -
          Math.floor((nextNow - Date.parse(session.startedAt)) / 1000) <=
          0
      ) {
        setRunnerState((current) => {
          if (current.finished) {
            return current;
          }

          return {
            ...current,
            finished: true,
            finishedAt: new Date().toISOString(),
          };
        });
      }
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [runnerState.finished, session.mode, session.startedAt, session.timeLimitSeconds]);

  if (!currentQuestion) {
    return null;
  }

  const handleSelect = (optionLabel: string) => {
    if (runnerState.finished || (session.mode === "review" && currentSubmitted)) {
      return;
    }

    setRunnerState((current) => {
      const selectedForQuestion = current.answers[currentQuestion.id] ?? [];
      const allowMultiple = isMultipleAnswer(
        currentQuestion.correctAnswers,
        currentQuestion.selectionMode,
      );
      let nextValues: string[];

      if (allowMultiple) {
        nextValues = selectedForQuestion.includes(optionLabel)
          ? selectedForQuestion.filter((value) => value !== optionLabel)
          : [...selectedForQuestion, optionLabel];
      } else {
        nextValues = [optionLabel];
      }

      return {
        ...current,
        answers: {
          ...current.answers,
          [currentQuestion.id]: normalizeAnswerSet(nextValues),
        },
      };
    });
  };

  const submitCurrentReviewAnswer = () => {
    if (!currentAnswers.length) {
      return;
    }

    setRunnerState((current) => ({
      ...current,
      submitted: {
        ...current.submitted,
        [currentQuestion.id]: true,
      },
    }));
  };

  const goToQuestion = (index: number) => {
    setRunnerState((current) => ({
      ...current,
      currentIndex: Math.max(0, Math.min(index, session.questions.length - 1)),
    }));
  };

  const nextQuestion = () => {
    if (runnerState.currentIndex === session.questions.length - 1) {
      finishExam();
      return;
    }

    goToQuestion(runnerState.currentIndex + 1);
  };

  const previousQuestion = () => {
    if (runnerState.currentIndex === 0) {
      return;
    }

    goToQuestion(runnerState.currentIndex - 1);
  };

  const getOptionState = (optionLabel: string) => {
    const selected = currentAnswers.includes(optionLabel);
    const correct = currentQuestion.correctAnswers.includes(optionLabel);
    const shouldReveal = runnerState.finished || (session.mode === "review" && currentSubmitted);

    if (!shouldReveal) {
      return selected ? "selected" : "idle";
    }

    if (correct) {
      return "correct";
    }

    if (selected && !correct) {
      return "incorrect";
    }

    return "idle";
  };

  const showReviewDetails =
    runnerState.finished || (session.mode === "review" && currentSubmitted);

  const isQuiz = session.kind === "quiz";
  const masteryPct =
    session.questions.length > 0
      ? Math.round((correctCount / session.questions.length) * 100)
      : 0;

  if (runnerState.finished) {
    return (
      <main className="page-shell exam-shell">
        <section className="paper-card results-hero">
          <div>
            <p className="eyebrow">
              {isQuiz
                ? `Quiz terminé${session.cheatsheetTitle ? ` · ${session.cheatsheetTitle}` : ""}`
                : "Session terminee"}
            </p>
            <h1 className="results-title">
              {isQuiz
                ? `${correctCount} / ${session.questions.length}`
                : `${scaledScore} / 1000`}
            </h1>
            <p className="results-subtitle">
              {isQuiz
                ? `${masteryPct}% de bonnes réponses sur ce quiz.`
                : `${correctCount} bonnes reponses sur ${session.questions.length}. ${scaledScore >= 720 ? "Seuil de validation atteint." : "Encore un tour et ca passe."}`}
            </p>
          </div>

          <div className="results-metrics">
            <div>
              <span>Mode</span>
              <strong>
                {isQuiz
                  ? "Quiz"
                  : session.mode === "timed"
                    ? "Timed"
                    : "Review"}
              </strong>
            </div>
            <div>
              <span>Questions repondues</span>
              <strong>{answeredCount}</strong>
            </div>
            <div>
              <span>A revoir</span>
              <strong>{incorrectResults.length}</strong>
            </div>
          </div>
        </section>

        <section className="paper-card results-actions">
          <p>
            Les explications ci-dessous montrent en priorite les questions
            incorrectes ou non repondues.
          </p>
          {isQuiz && session.cheatsheetSlug ? (
            <Link
              className="secondary-button"
              href={`/cheatsheets/${session.cheatsheetSlug}`}
            >
              <ArrowLeft size={16} />
              Retour à la cheatsheet
            </Link>
          ) : (
            <Link className="secondary-button" href="/">
              <Home size={16} />
              Revenir a l&apos;accueil
            </Link>
          )}
        </section>

        <section className="results-list">
          {(incorrectResults.length ? incorrectResults : questionResults).map(
            ({ question, selectedAnswers, correct }) => (
              <article className="paper-card result-card" key={question.id}>
                <div className="result-head">
                  <div>
                    <p className="eyebrow">Question {question.sourceNumber}</p>
                    <QuestionPrompt
                      className="result-question"
                      prompt={question.prompt}
                      extra={question.extraContent}
                    />
                  </div>
                  <div
                    className={`result-pill ${correct ? "result-pill--ok" : "result-pill--bad"}`}
                  >
                    {correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    {correct ? "Correct" : "Incorrect"}
                  </div>
                </div>

                <p className="result-line">
                  <strong>Ta reponse :</strong>{" "}
                  {selectedAnswers.length ? selectedAnswers.join(", ") : "non repondu"}
                </p>
                <p className="result-line">
                  <strong>Bonne reponse :</strong>{" "}
                  {question.correctAnswers.join(", ")}
                </p>
                <p className="result-explanation">{question.explanation}</p>
              </article>
            ),
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell exam-shell">
      <section className="paper-card exam-topbar">
        <div className="topbar-copy">
          <p className="eyebrow">
            {isQuiz
              ? `Quiz${session.cheatsheetTitle ? ` · ${session.cheatsheetTitle}` : ""}`
              : session.mode === "timed"
                ? "Timed exam"
                : "Review mode"}
          </p>
          <h1 className="exam-title">
            Question {runnerState.currentIndex + 1} / {session.questions.length}
          </h1>
          <p className="exam-meta">
            {answeredCount} repondues, {session.questions.length - answeredCount} restantes
          </p>
        </div>

        <div className="topbar-side">
          <SaveIndicator status={saveStatus} />
          {isQuiz && session.cheatsheetSlug ? (
            <Link
              className="timer-pill timer-pill--soft"
              href={`/cheatsheets/${session.cheatsheetSlug}`}
            >
              <BookOpen size={16} />
              <span>Cheatsheet</span>
            </Link>
          ) : session.mode === "timed" && remainingSeconds !== null ? (
            <div className="timer-pill">
              <Clock3 size={16} />
              <span>{formatCountdown(remainingSeconds)}</span>
            </div>
          ) : (
            <div className="timer-pill timer-pill--soft">
              <CheckCircle2 size={16} />
              <span>Sans chrono</span>
            </div>
          )}

          <button className="secondary-button" onClick={() => finishExam()} type="button">
            Terminer
          </button>
        </div>
      </section>

      <section className="exam-layout">
        <aside className="paper-card exam-sidebar">
          <button
            aria-expanded={!navCollapsed}
            className="sidebar-toggle"
            onClick={() => setNavCollapsed((value) => !value)}
            type="button"
          >
            <div className="sidebar-head">
              <h2>Navigation</h2>
            </div>
            <ChevronDown
              className={`sidebar-chevron ${
                navCollapsed ? "" : "sidebar-chevron--open"
              }`}
              size={18}
            />
          </button>

          <div
            className={`navigator-grid ${
              navCollapsed ? "navigator-grid--collapsed" : ""
            }`}
          >
            {session.questions.map((question, index) => {
              const selected = runnerState.answers[question.id] ?? [];
              const reviewed = runnerState.submitted[question.id];

              return (
                <button
                  className={`navigator-chip ${
                    index === runnerState.currentIndex
                      ? "navigator-chip--current"
                      : selected.length
                        ? reviewed
                          ? "navigator-chip--reviewed"
                          : "navigator-chip--answered"
                        : "navigator-chip--idle"
                  }`}
                  key={question.id}
                  onClick={() => goToQuestion(index)}
                  type="button"
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </aside>

        <section className="paper-card question-panel">
          <div className="question-head">
            <div>
              <p className="eyebrow">Question {currentQuestion.sourceNumber}</p>
              <QuestionPrompt
                className="question-title"
                prompt={currentQuestion.prompt}
                extra={currentQuestion.extraContent}
              />
            </div>

            {isMultipleAnswer(
              currentQuestion.correctAnswers,
              currentQuestion.selectionMode,
            ) ? (
              <span className="question-badge">Choisir plusieurs reponses</span>
            ) : (
              <span className="question-badge">Choisir une reponse</span>
            )}
          </div>

          <div className="option-list">
            {currentQuestion.options.map((option) => {
              const state = getOptionState(option.label);
              const isLocked =
                runnerState.finished ||
                (session.mode === "review" && currentSubmitted);

              return (
                <button
                  aria-disabled={isLocked}
                  className={`option-card option-card--${state}${isLocked ? " option-card--locked" : ""}`}
                  key={option.label}
                  onClick={() => handleSelect(option.label)}
                  type="button"
                >
                  <span className="option-letter">{option.label}</span>
                  <span className="option-body">{option.body}</span>
                </button>
              );
            })}
          </div>

          {showReviewDetails ? (
            <div className="paper-card feedback-panel">
              <div className="feedback-head">
                {isAnswerCorrect(currentAnswers, currentQuestion.correctAnswers) ? (
                  <div className="feedback-pill feedback-pill--ok">
                    <CheckCircle2 size={16} />
                    Bonne reponse
                  </div>
                ) : (
                  <div className="feedback-pill feedback-pill--bad">
                    <AlertTriangle size={16} />
                    Bonne reponse : {currentQuestion.correctAnswers.join(", ")}
                  </div>
                )}
              </div>

              <p className="feedback-copy">{currentQuestion.explanation}</p>

              {currentQuestion.cheatsheets.length > 0 ? (
                <div className="feedback-cheatsheets">
                  <p className="feedback-cheatsheets-label">
                    <BookOpen size={14} />
                    Cheatsheets liées
                  </p>
                  <div className="feedback-cheatsheets-list">
                    {currentQuestion.cheatsheets.map((sheet) => (
                      <a
                        className="feedback-cheatsheet-link"
                        href={`/cheatsheets/${sheet.slug}`}
                        key={sheet.slug}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <span className="feedback-cheatsheet-category">
                          {sheet.category}
                        </span>
                        <span className="feedback-cheatsheet-title">
                          {sheet.title}
                        </span>
                        <ExternalLink size={12} />
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="question-actions">
            <button
              className="secondary-button"
              disabled={runnerState.currentIndex === 0}
              onClick={previousQuestion}
              type="button"
            >
              <ChevronLeft size={16} />
              Precedente
            </button>

            <div className="question-actions-right">
              {session.mode === "review" && !currentSubmitted ? (
                <button
                  className="primary-button"
                  disabled={!currentAnswers.length}
                  onClick={submitCurrentReviewAnswer}
                  type="button"
                >
                  Valider la reponse
                </button>
              ) : (
                <button className="primary-button" onClick={nextQuestion} type="button">
                  {runnerState.currentIndex === session.questions.length - 1
                    ? isQuiz
                      ? "Voir le résultat"
                      : "Voir le score"
                    : "Question suivante"}
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
