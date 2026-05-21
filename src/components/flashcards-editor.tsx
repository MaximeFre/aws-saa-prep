"use client";

import { Plus, Save, Sparkles, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import {
  bulkReplaceFlashcardsAction,
  createFlashcardAction,
  deleteFlashcardAction,
  updateFlashcardAction,
} from "@/app/actions";

type EditorCard = {
  id: number | null;
  question: string;
  answer: string;
  hint: string | null;
  position: number;
  source: "manual" | "generated";
  status: "clean" | "dirty" | "saving" | "saved" | "error";
  errorMsg?: string;
};

type Props = {
  cards: Array<{
    id: number;
    question: string;
    answer: string;
    hint: string | null;
    position: number;
    source: "manual" | "generated";
  }>;
  cheatsheetId: number;
};

export function FlashcardsEditor({ cards: initialCards, cheatsheetId }: Props) {
  const [cards, setCards] = useState<EditorCard[]>(() =>
    initialCards.map((c) => ({ ...c, status: "clean" as const })),
  );
  const [bulkRaw, setBulkRaw] = useState("");
  const [bulkStatus, setBulkStatus] = useState<{
    state: "idle" | "ok" | "error";
    msg: string | null;
  }>({ state: "idle", msg: null });
  const [, startTransition] = useTransition();

  const updateField = (
    index: number,
    field: "question" | "answer" | "hint",
    value: string,
  ) => {
    setCards((current) =>
      current.map((c, i) =>
        i === index
          ? {
              ...c,
              [field]: field === "hint" ? (value || null) : value,
              status: "dirty",
              errorMsg: undefined,
            }
          : c,
      ),
    );
  };

  const saveCard = (index: number) => {
    const card = cards[index];
    if (!card.question.trim() || !card.answer.trim()) {
      setCards((current) =>
        current.map((c, i) =>
          i === index ? { ...c, status: "error", errorMsg: "Question/réponse requises." } : c,
        ),
      );
      return;
    }
    setCards((current) =>
      current.map((c, i) => (i === index ? { ...c, status: "saving" } : c)),
    );
    startTransition(async () => {
      try {
        if (card.id === null) {
          const result = await createFlashcardAction(cheatsheetId, {
            question: card.question,
            answer: card.answer,
            hint: card.hint,
            position: card.position,
          });
          if (result.error || result.id === null) {
            throw new Error(result.error ?? "Erreur inconnue");
          }
          setCards((current) =>
            current.map((c, i) =>
              i === index ? { ...c, id: result.id, status: "saved" } : c,
            ),
          );
        } else {
          const result = await updateFlashcardAction(card.id, {
            question: card.question,
            answer: card.answer,
            hint: card.hint,
            position: card.position,
            source: card.source,
          });
          if (result.error) throw new Error(result.error);
          setCards((current) =>
            current.map((c, i) => (i === index ? { ...c, status: "saved" } : c)),
          );
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erreur";
        setCards((current) =>
          current.map((c, i) =>
            i === index ? { ...c, status: "error", errorMsg: msg } : c,
          ),
        );
      }
    });
  };

  const deleteCard = (index: number) => {
    const card = cards[index];
    if (card.id === null) {
      setCards((current) => current.filter((_, i) => i !== index));
      return;
    }
    if (!confirm("Supprimer cette flashcard ?")) return;
    startTransition(async () => {
      const result = await deleteFlashcardAction(card.id!);
      if (result.error) {
        setCards((current) =>
          current.map((c, i) =>
            i === index ? { ...c, status: "error", errorMsg: result.error! } : c,
          ),
        );
        return;
      }
      setCards((current) => current.filter((_, i) => i !== index));
    });
  };

  const addCard = () => {
    const nextPos = (cards.at(-1)?.position ?? 0) + 1;
    setCards((current) => [
      ...current,
      {
        id: null,
        question: "",
        answer: "",
        hint: null,
        position: nextPos,
        source: "manual",
        status: "dirty",
      },
    ]);
  };

  const importBulk = () => {
    setBulkStatus({ state: "idle", msg: null });
    let parsed: unknown;
    try {
      parsed = JSON.parse(bulkRaw);
    } catch (err) {
      setBulkStatus({
        state: "error",
        msg: `JSON invalide: ${err instanceof Error ? err.message : "erreur"}`,
      });
      return;
    }
    if (!Array.isArray(parsed)) {
      setBulkStatus({ state: "error", msg: "Doit être un tableau de cartes." });
      return;
    }
    const payload = parsed
      .map((c, i) => {
        if (!c || typeof c !== "object") return null;
        const obj = c as Record<string, unknown>;
        const question = typeof obj.question === "string" ? obj.question : "";
        const answer = typeof obj.answer === "string" ? obj.answer : "";
        const hint = typeof obj.hint === "string" ? obj.hint : null;
        const position =
          typeof obj.position === "number" && obj.position > 0
            ? Math.floor(obj.position)
            : i + 1;
        return { question, answer, hint, position };
      })
      .filter((c): c is NonNullable<typeof c> => !!c);
    if (payload.length === 0) {
      setBulkStatus({ state: "error", msg: "Aucune carte valide trouvée." });
      return;
    }
    if (
      !confirm(
        `Remplacer le deck par ${payload.length} cartes ? Les cartes actuelles seront supprimées.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await bulkReplaceFlashcardsAction(cheatsheetId, payload);
      if (result.error) {
        setBulkStatus({ state: "error", msg: result.error });
        return;
      }
      setBulkStatus({
        state: "ok",
        msg: `${result.inserted} cartes insérées. Recharge la page pour voir.`,
      });
      setBulkRaw("");
    });
  };

  return (
    <>
      <section className="paper-card question-edit-card">
        <div className="question-edit-row">
          <label className="question-edit-label">Import JSON (remplace le deck)</label>
        </div>
        <textarea
          className="question-edit-textarea"
          onChange={(event) => setBulkRaw(event.target.value)}
          placeholder='[{"question":"…","answer":"…","hint":null,"position":1}, …]'
          rows={6}
          value={bulkRaw}
        />
        <div className="question-edit-actions" style={{ marginTop: 12 }}>
          <div className="question-edit-status">
            {bulkStatus.state === "ok" ? (
              <span className="question-edit-saved">{bulkStatus.msg}</span>
            ) : null}
            {bulkStatus.state === "error" ? (
              <span className="question-edit-error">{bulkStatus.msg}</span>
            ) : null}
          </div>
          <button
            className="primary-button"
            disabled={!bulkRaw.trim()}
            onClick={importBulk}
            type="button"
          >
            <Sparkles size={16} />
            Remplacer le deck
          </button>
        </div>
      </section>

      <section className="questions-list" style={{ gap: 12 }}>
        {cards.length === 0 ? (
          <div className="paper-card">
            <p className="users-subtitle">
              Aucune flashcard pour cette fiche. Ajoute-en une ou importe du JSON.
            </p>
          </div>
        ) : (
          cards.map((card, index) => (
            <article className="paper-card question-edit-card" key={card.id ?? `new-${index}`}>
              <div className="question-edit-row">
                <span className="question-row-number">#{card.position}</span>
                <div className="question-row-tags">
                  <span
                    className={`session-mode-pill session-mode-pill--${
                      card.source === "generated" ? "timed" : "review"
                    }`}
                  >
                    {card.source}
                  </span>
                </div>
                <button
                  aria-label="Supprimer la carte"
                  className="question-edit-option-delete"
                  onClick={() => deleteCard(index)}
                  type="button"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <label className="question-edit-label">Question</label>
              <textarea
                className="question-edit-textarea"
                onChange={(event) => updateField(index, "question", event.target.value)}
                rows={3}
                value={card.question}
              />
              <label className="question-edit-label">Réponse</label>
              <textarea
                className="question-edit-textarea"
                onChange={(event) => updateField(index, "answer", event.target.value)}
                rows={4}
                value={card.answer}
              />
              <label className="question-edit-label">Indice (optionnel)</label>
              <textarea
                className="question-edit-textarea"
                onChange={(event) => updateField(index, "hint", event.target.value)}
                rows={2}
                value={card.hint ?? ""}
              />
              <div className="question-edit-actions" style={{ marginTop: 10 }}>
                <div className="question-edit-status">
                  {card.status === "saved" ? (
                    <span className="question-edit-saved">Enregistré.</span>
                  ) : null}
                  {card.status === "error" ? (
                    <span className="question-edit-error">
                      {card.errorMsg ?? "Erreur"}
                    </span>
                  ) : null}
                  {card.status === "dirty" ? (
                    <span className="question-edit-error" style={{ color: "#9a6c00" }}>
                      Modifications non enregistrées
                    </span>
                  ) : null}
                </div>
                <button
                  className="primary-button"
                  disabled={card.status === "saving"}
                  onClick={() => saveCard(index)}
                  type="button"
                >
                  <Save size={16} />
                  {card.status === "saving" ? "Sauvegarde…" : "Enregistrer"}
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="question-edit-actions" style={{ justifyContent: "center" }}>
        <button className="secondary-button" onClick={addCard} type="button">
          <Plus size={16} />
          Ajouter une carte
        </button>
      </section>
    </>
  );
}
