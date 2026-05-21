"use client";

import Link from "next/link";
import { Check, RotateCcw, Sparkles, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type PointerEvent as ReactPointerEvent,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { rateFlashcardAction } from "@/app/actions";

type Rating = "again" | "good" | "easy";

type RunnerCard = {
  id: number;
  question: string;
  answer: string;
  hint: string | null;
  lastRating: Rating | null;
  streak: number;
};

type SessionStat = { cardId: number; rating: Rating };

const SWIPE_TRIGGER = 90;
const SWIPE_LOCK_AXIS = 12;

function vibrate(pattern: number | number[]) {
  if (typeof navigator === "undefined") return;
  if (typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore
    }
  }
}

export function FlashcardRunner({
  cards,
  cheatsheetSlug,
  cheatsheetTitle,
  categoryClass,
}: {
  cards: RunnerCard[];
  cheatsheetSlug: string;
  cheatsheetTitle: string;
  categoryClass: string;
}) {
  const [order, setOrder] = useState<number[]>(() => cards.map((_, i) => i));
  const [cursor, setCursor] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState<SessionStat[]>([]);
  const [drag, setDrag] = useState<{ dx: number; dy: number; locked: "x" | "y" | null } | null>(
    null,
  );
  const [exitVector, setExitVector] = useState<{ x: number; y: number } | null>(null);
  const [, startTransition] = useTransition();

  const pointerStart = useRef<{ x: number; y: number; id: number } | null>(null);
  const movedRef = useRef(false);

  const currentIndex = order[cursor];
  const current = currentIndex !== undefined ? cards[currentIndex] : null;
  const finished = cursor >= order.length;

  const progressPct = order.length
    ? Math.min(100, Math.round((cursor / order.length) * 100))
    : 0;

  useEffect(() => {
    setFlipped(false);
    setDrag(null);
    setExitVector(null);
  }, [cursor]);

  const advance = useCallback(
    (rating: Rating) => {
      if (!current) return;
      const direction =
        rating === "again" ? { x: -1, y: 0 } : rating === "easy" ? { x: 0, y: -1 } : { x: 1, y: 0 };
      setExitVector(direction);
      vibrate(rating === "again" ? 18 : 10);
      const cardId = current.id;
      setStats((s) => [...s, { cardId, rating }]);
      startTransition(() => {
        rateFlashcardAction(cardId, rating).catch(() => {
          // silently ignore — UI a déjà avancé
        });
      });
      window.setTimeout(() => {
        // Reset within the same batch as the cursor advance so the
        // newly-promoted card never inherits the exit transform of
        // the card that just left.
        setExitVector(null);
        setFlipped(false);
        setDrag(null);
        setCursor((c) => c + 1);
      }, 220);
    },
    [current, startTransition],
  );

  const flip = useCallback(() => {
    setFlipped((f) => !f);
    vibrate(6);
  }, []);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!current || exitVector) return;
    pointerStart.current = {
      x: event.clientX,
      y: event.clientY,
      id: event.pointerId,
    };
    movedRef.current = false;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Some browsers refuse capture; pointer events still fire normally.
    }
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointerStart.current || pointerStart.current.id !== event.pointerId) return;
    const dx = event.clientX - pointerStart.current.x;
    const dy = event.clientY - pointerStart.current.y;
    if (!movedRef.current && Math.hypot(dx, dy) > 6) {
      movedRef.current = true;
    }
    let locked: "x" | "y" | null = drag?.locked ?? null;
    if (!locked && (Math.abs(dx) > SWIPE_LOCK_AXIS || Math.abs(dy) > SWIPE_LOCK_AXIS)) {
      locked = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    setDrag({ dx, dy, locked });
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointerStart.current || pointerStart.current.id !== event.pointerId) return;
    const start = pointerStart.current;
    pointerStart.current = null;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const moved = movedRef.current;

    if (!moved) {
      flip();
      setDrag(null);
      return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx <= -SWIPE_TRIGGER) {
        advance("again");
        return;
      }
      if (dx >= SWIPE_TRIGGER) {
        advance("good");
        return;
      }
    } else if (dy <= -SWIPE_TRIGGER) {
      advance("easy");
      return;
    }
    setDrag(null);
  };

  const onPointerCancel = () => {
    pointerStart.current = null;
    setDrag(null);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (finished) return;
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        flip();
      } else if (event.key === "1" || event.key === "ArrowLeft") {
        advance("again");
      } else if (event.key === "2" || event.key === "ArrowRight") {
        advance("good");
      } else if (event.key === "3" || event.key === "ArrowUp") {
        advance("easy");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, finished, flip]);

  const totalRated = stats.length;
  const masteredApprox = useMemo(
    () => stats.filter((s) => s.rating === "easy").length,
    [stats],
  );
  const stillToRevisit = useMemo(
    () => stats.filter((s) => s.rating === "again").map((s) => s.cardId),
    [stats],
  );

  if (finished) {
    const goodCount = stats.filter((s) => s.rating === "good").length;
    const easyCount = masteredApprox;
    const againCount = stillToRevisit.length;
    const successRate = totalRated
      ? Math.round(((goodCount + easyCount) / totalRated) * 100)
      : 0;

    const restart = () => {
      setOrder(cards.map((_, i) => i));
      setStats([]);
      setCursor(0);
    };
    const restartDifficult = () => {
      const set = new Set(stillToRevisit);
      const remaining = cards
        .map((c, i) => ({ c, i }))
        .filter(({ c }) => set.has(c.id))
        .map(({ i }) => i);
      if (remaining.length === 0) return restart();
      setOrder(remaining);
      setStats([]);
      setCursor(0);
    };

    return (
      <main className={`flashcards-end flashcards-end--${categoryClass}`}>
        <div className="flashcards-end-card">
          <span className="flashcards-end-emoji" aria-hidden>
            🎉
          </span>
          <h2>Deck terminé</h2>
          <p className="flashcards-end-sub">
            {totalRated} carte{totalRated > 1 ? "s" : ""} révisée{totalRated > 1 ? "s" : ""} sur{" "}
            <strong>{cheatsheetTitle}</strong>
          </p>
          <dl className="flashcards-end-stats">
            <div className="flashcards-end-stat flashcards-end-stat--again">
              <dt>À revoir</dt>
              <dd>{againCount}</dd>
            </div>
            <div className="flashcards-end-stat flashcards-end-stat--good">
              <dt>OK</dt>
              <dd>{goodCount}</dd>
            </div>
            <div className="flashcards-end-stat flashcards-end-stat--easy">
              <dt>Facile</dt>
              <dd>{easyCount}</dd>
            </div>
          </dl>
          <p className="flashcards-end-rate">
            <Sparkles size={14} />
            {successRate}% sans hésiter
          </p>
          <div className="flashcards-end-actions">
            {stillToRevisit.length > 0 ? (
              <button
                className="primary-button"
                onClick={restartDifficult}
                type="button"
              >
                <RotateCcw size={16} />
                Recommencer les difficiles ({stillToRevisit.length})
              </button>
            ) : null}
            <button className="secondary-button" onClick={restart} type="button">
              <RotateCcw size={16} />
              Tout recommencer
            </button>
            <Link
              className="secondary-button"
              href={`/cheatsheets/${cheatsheetSlug}`}
            >
              Retour à la fiche
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!current) {
    return null;
  }

  const dx = exitVector ? exitVector.x * 900 : drag?.dx ?? 0;
  const dy = exitVector ? exitVector.y * 900 : drag?.dy ?? 0;
  const rotate = exitVector
    ? exitVector.x * 22
    : drag && drag.locked === "x"
      ? Math.max(-14, Math.min(14, drag.dx / 14))
      : 0;
  const swipeIntent: "again" | "good" | "easy" | null = (() => {
    if (exitVector) {
      if (exitVector.x < 0) return "again";
      if (exitVector.x > 0) return "good";
      return "easy";
    }
    if (!drag) return null;
    if (drag.locked === "x") {
      if (drag.dx <= -SWIPE_TRIGGER) return "again";
      if (drag.dx >= SWIPE_TRIGGER) return "good";
    }
    if (drag.locked === "y" && drag.dy <= -SWIPE_TRIGGER) return "easy";
    return null;
  })();

  const activeTransform = `translate3d(${dx}px, ${dy}px, 0) rotate(${rotate}deg)`;
  const activeTransition = exitVector
    ? "transform 0.26s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.22s ease-out"
    : drag
      ? "none"
      : undefined;

  type StackEntry = { card: RunnerCard; depth: 0 | 1 | 2 };
  const stack: StackEntry[] = [];
  for (let depth = 2 as const; depth >= 0; depth--) {
    const idx = order[cursor + depth];
    if (idx === undefined) continue;
    stack.push({ card: cards[idx], depth: depth as 0 | 1 | 2 });
  }

  return (
    <main className="flashcards-runner">
      <div className="flashcards-progress">
        <span className="flashcards-progress-bar">
          <span
            className="flashcards-progress-fill"
            style={{ width: `${progressPct}%` }}
          />
        </span>
        <span className="flashcards-progress-text">
          {cursor + 1} / {order.length}
        </span>
      </div>

      <div className="flashcards-deck">
        {stack.map(({ card, depth }) => {
          const isActive = depth === 0;
          const positionClass = isActive
            ? "flashcard--active"
            : `flashcard--ghost flashcard--ghost-${depth}`;
          return (
            <div
              aria-hidden={!isActive}
              aria-label={isActive ? (flipped ? "Réponse" : "Question") : undefined}
              className={`flashcard ${positionClass} flashcard--${categoryClass}${
                isActive && flipped ? " flashcard--flipped" : ""
              }${isActive && swipeIntent ? ` flashcard--swiping-${swipeIntent}` : ""}`}
              key={card.id}
              onPointerCancel={isActive ? onPointerCancel : undefined}
              onPointerDown={isActive ? onPointerDown : undefined}
              onPointerMove={isActive ? onPointerMove : undefined}
              onPointerUp={isActive ? onPointerUp : undefined}
              role={isActive ? "button" : undefined}
              style={
                isActive
                  ? {
                      transform: activeTransform,
                      transition: activeTransition,
                      opacity: exitVector ? 0 : 1,
                    }
                  : undefined
              }
              tabIndex={isActive ? 0 : -1}
            >
              <div className="flashcard-inner">
                <div className="flashcard-face flashcard-face--front">
                  <span className="flashcard-eyebrow">Question</span>
                  <div className="flashcard-content flashcard-content--question">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {card.question}
                    </ReactMarkdown>
                  </div>
                  {isActive && card.hint ? (
                    <p className="flashcard-hint">💡 {card.hint}</p>
                  ) : null}
                  {isActive ? (
                    <span className="flashcard-flip-hint">Tap pour révéler</span>
                  ) : null}
                </div>
                <div className="flashcard-face flashcard-face--back" aria-hidden={!isActive}>
                  <span className="flashcard-eyebrow">Réponse</span>
                  <div className="flashcard-content flashcard-content--answer">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {card.answer}
                    </ReactMarkdown>
                  </div>
                  {isActive ? (
                    <span className="flashcard-flip-hint">Note ta réussite ↓</span>
                  ) : null}
                </div>
              </div>
              <span className="flashcard-swipe-hint flashcard-swipe-hint--left" aria-hidden>
                <X size={14} /> À revoir
              </span>
              <span className="flashcard-swipe-hint flashcard-swipe-hint--right" aria-hidden>
                <Check size={14} /> OK
              </span>
              <span className="flashcard-swipe-hint flashcard-swipe-hint--up" aria-hidden>
                <Sparkles size={14} /> Facile
              </span>
            </div>
          );
        })}
      </div>

      <div className="flashcards-controls" role="group" aria-label="Notation">
        <button
          aria-label="À revoir"
          className="flashcards-rate flashcards-rate--again"
          onClick={() => advance("again")}
          type="button"
        >
          <X size={18} />
          <span>À revoir</span>
        </button>
        <button
          aria-label="OK"
          className="flashcards-rate flashcards-rate--good"
          onClick={() => advance("good")}
          type="button"
        >
          <Check size={18} />
          <span>OK</span>
        </button>
        <button
          aria-label="Facile"
          className="flashcards-rate flashcards-rate--easy"
          onClick={() => advance("easy")}
          type="button"
        >
          <Sparkles size={18} />
          <span>Facile</span>
        </button>
      </div>
    </main>
  );
}
