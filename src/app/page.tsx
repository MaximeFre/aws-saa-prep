import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  Clock3,
  Database,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { UserPicker } from "@/components/user-picker";
import { getCurrentUser } from "@/lib/auth";
import { getDatasetStats } from "@/lib/exam-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const stats = getDatasetStats();
  const user = await getCurrentUser();

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <p className="eyebrow">AWS Solutions Architect Associate</p>
        <div className="hero-grid">
          <div className="hero-copy">
            <h1 className="hero-title">
              Passe un vrai faux examen, dans une interface claire et sans bruit.
            </h1>
            <p className="hero-description">
              Les questions restent en anglais comme dans la source d&apos;origine.
              L&apos;interface, le suivi de progression, le timer et le score final
              sont pensés pour s&apos;entrainer vite.
            </p>

            <UserPicker pseudo={user?.pseudo ?? null} />
          </div>

          <div className="hero-note">
            <div className="note-block">
              <span className="note-label">Format</span>
              <strong>65 questions</strong>
              <span>Score final sur 1000</span>
            </div>
            <div className="note-block">
              <span className="note-label">Timed</span>
              <strong>2 h 10</strong>
              <span>comme une vraie session</span>
            </div>
            <div className="note-block">
              <span className="note-label">Review</span>
              <strong>Feedback immediat</strong>
              <span>explication apres chaque reponse</span>
            </div>
          </div>
        </div>
      </section>

      <section className="paper-card home-cheatsheet-card">
        <div>
          <p className="eyebrow">Cheatsheets</p>
          <h2>Fiches de revision par service AWS</h2>
          <p>
            53 cheatsheets classees par categorie (Compute, Storage, Networking,
            Security, etc.) pour reviser en dehors des sessions d&apos;examen.
          </p>
        </div>
        <Link className="primary-button" href="/cheatsheets">
          <Sparkles size={16} />
          Voir les cheatsheets
          <ArrowRight size={16} />
        </Link>
      </section>

      <section className="stats-grid">
        <article className="paper-card stat-card">
          <Database size={18} />
          <div>
            <p className="stat-value">{stats.totalQuestions}</p>
            <p className="stat-label">questions en base SQLite</p>
          </div>
        </article>

        <article className="paper-card stat-card">
          <BookOpenText size={18} />
          <div>
            <p className="stat-value">{stats.multipleChoiceQuestions}</p>
            <p className="stat-label">questions multi-reponses</p>
          </div>
        </article>

        <article className="paper-card stat-card">
          <ShieldCheck size={18} />
          <div>
            <p className="stat-value">{stats.reconstructedExplanations}</p>
            <p className="stat-label">corriges reconstruits si source incomplete</p>
          </div>
        </article>

        <article className="paper-card stat-card">
          <Clock3 size={18} />
          <div>
            <p className="stat-value">7800 s</p>
            <p className="stat-label">limite du mode timed</p>
          </div>
        </article>
      </section>

      <section className="mode-grid">
        <article className="paper-card mode-card">
          <p className="eyebrow">Timed</p>
          <h2 className="mode-title">Simulation d&apos;exam</h2>
          <p className="mode-description">
            Tu avances librement parmi les 65 questions, le chrono tourne, et le
            score final est calcule a la fin de la session.
          </p>
          <ul className="mode-list">
            <li>timer persistant sur la session</li>
            <li>navigation question par question</li>
            <li>revue des erreurs a la fin</li>
          </ul>
        </article>

        <article className="paper-card mode-card">
          <p className="eyebrow">Review</p>
          <h2 className="mode-title">Apprentissage immediat</h2>
          <p className="mode-description">
            Tu valides chaque reponse au fil de l&apos;eau et l&apos;explication
            apparait juste apres. Pratique pour memoriser les patterns AWS.
          </p>
          <ul className="mode-list">
            <li>pas de limite de temps</li>
            <li>explication apres validation</li>
            <li>score final sur 1000 aussi</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
