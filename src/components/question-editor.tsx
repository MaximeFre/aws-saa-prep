"use client";

import Link from "next/link";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import { updateQuestionAction } from "@/app/actions";
import type { QuestionDetail } from "@/lib/exam-data";

const ALL_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

type EditableOption = { label: string; body: string };

export function QuestionEditor({ question }: { question: QuestionDetail }) {
  const [prompt, setPrompt] = useState(question.prompt);
  const [selectionMode, setSelectionMode] = useState<"single" | "multiple">(
    question.selectionMode,
  );
  const [options, setOptions] = useState<EditableOption[]>(
    question.options.map((option) => ({
      label: option.label,
      body: option.body,
    })),
  );
  const [correctAnswers, setCorrectAnswers] = useState<string[]>(
    question.correctAnswers,
  );
  const [explanation, setExplanation] = useState(question.explanation);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [isSaving, startSave] = useTransition();

  const updateOptionBody = (index: number, body: string) => {
    setOptions((current) =>
      current.map((option, i) => (i === index ? { ...option, body } : option)),
    );
  };

  const toggleCorrect = (label: string) => {
    if (selectionMode === "single") {
      setCorrectAnswers([label]);
      return;
    }
    setCorrectAnswers((current) =>
      current.includes(label)
        ? current.filter((value) => value !== label)
        : [...current, label].sort(),
    );
  };

  const addOption = () => {
    const used = new Set(options.map((o) => o.label));
    const next = ALL_LABELS.find((label) => !used.has(label));
    if (!next) return;
    setOptions((current) => [...current, { label: next, body: "" }]);
  };

  const removeOption = (index: number) => {
    const removed = options[index];
    setOptions((current) => current.filter((_, i) => i !== index));
    setCorrectAnswers((current) =>
      current.filter((label) => label !== removed.label),
    );
  };

  const save = () => {
    setStatus("idle");
    startSave(async () => {
      try {
        await updateQuestionAction(question.id, {
          prompt: prompt.trim(),
          selectionMode,
          correctAnswers,
          explanation,
          options: options.map((option) => ({
            label: option.label,
            body: option.body,
          })),
        });
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    });
  };

  const canSave =
    prompt.trim().length > 0 &&
    options.length >= 2 &&
    options.every((option) => option.body.trim().length > 0) &&
    correctAnswers.length > 0 &&
    correctAnswers.every((label) =>
      options.some((option) => option.label === label),
    );

  return (
    <main className="page-shell">
      <section className="paper-card user-list-hero">
        <div>
          <p className="eyebrow">Question {question.sourceNumber}</p>
          <h1 className="users-title">Edition</h1>
          <p className="users-subtitle">
            Modifie l&apos;enonce, les options, les bonnes reponses et
            l&apos;explication. Tes changements ecrasent la source en base.
          </p>
        </div>
        <Link className="secondary-button" href="/questions">
          <ArrowLeft size={16} />
          Liste
        </Link>
      </section>

      <section className="paper-card question-edit-card">
        <label className="question-edit-label">Enonce</label>
        <textarea
          className="question-edit-textarea"
          onChange={(event) => setPrompt(event.target.value)}
          rows={5}
          value={prompt}
        />
      </section>

      <section className="paper-card question-edit-card">
        <div className="question-edit-row">
          <label className="question-edit-label">Type de question</label>
          <div className="question-edit-mode">
            <label>
              <input
                checked={selectionMode === "single"}
                name={`mode-${question.id}`}
                onChange={() => {
                  setSelectionMode("single");
                  setCorrectAnswers((current) =>
                    current.length > 0 ? [current[0]] : [],
                  );
                }}
                type="radio"
              />
              Single
            </label>
            <label>
              <input
                checked={selectionMode === "multiple"}
                name={`mode-${question.id}`}
                onChange={() => setSelectionMode("multiple")}
                type="radio"
              />
              Multi
            </label>
          </div>
        </div>
      </section>

      <section className="paper-card question-edit-card">
        <div className="question-edit-row">
          <label className="question-edit-label">Options</label>
          <button
            className="secondary-button"
            disabled={options.length >= ALL_LABELS.length}
            onClick={addOption}
            type="button"
          >
            <Plus size={14} /> Ajouter
          </button>
        </div>

        <div className="question-edit-options">
          {options.map((option, index) => {
            const isCorrect = correctAnswers.includes(option.label);
            return (
              <div className="question-edit-option" key={option.label}>
                <div className="question-edit-option-head">
                  <span className="option-letter">{option.label}</span>
                  <label className="question-edit-option-correct">
                    <input
                      checked={isCorrect}
                      onChange={() => toggleCorrect(option.label)}
                      type={selectionMode === "single" ? "radio" : "checkbox"}
                      name={`correct-${question.id}`}
                    />
                    Bonne reponse
                  </label>
                  <button
                    aria-label={`Supprimer l'option ${option.label}`}
                    className="question-edit-option-delete"
                    disabled={options.length <= 2}
                    onClick={() => removeOption(index)}
                    type="button"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <textarea
                  className="question-edit-textarea"
                  onChange={(event) => updateOptionBody(index, event.target.value)}
                  rows={3}
                  value={option.body}
                />
              </div>
            );
          })}
        </div>
      </section>

      <section className="paper-card question-edit-card">
        <label className="question-edit-label">Explication</label>
        <textarea
          className="question-edit-textarea"
          onChange={(event) => setExplanation(event.target.value)}
          rows={8}
          value={explanation}
        />
      </section>

      <section className="question-edit-actions">
        <div className="question-edit-status">
          {status === "saved" ? (
            <span className="question-edit-saved">Modifications enregistrees.</span>
          ) : null}
          {status === "error" ? (
            <span className="question-edit-error">
              Erreur pendant la sauvegarde.
            </span>
          ) : null}
        </div>
        <button
          className="primary-button"
          disabled={!canSave || isSaving}
          onClick={save}
          type="button"
        >
          <Save size={16} />
          {isSaving ? "Sauvegarde..." : "Enregistrer"}
        </button>
      </section>
    </main>
  );
}
