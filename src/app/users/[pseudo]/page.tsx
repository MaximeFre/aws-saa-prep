import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock3, Gauge, Trophy } from "lucide-react";

import {
  getUserByPseudo,
  getUserSessions,
  getUserStats,
} from "@/lib/exam-data";

export const dynamic = "force-dynamic";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(startIso: string, endIso: string | null): string {
  if (!endIso) return "-";
  const delta = Math.max(
    0,
    Math.round((Date.parse(endIso) - Date.parse(startIso)) / 1000),
  );
  const h = Math.floor(delta / 3600);
  const m = Math.floor((delta % 3600) / 60);
  const s = delta % 60;
  if (h > 0) return `${h}h ${m}min`;
  if (m > 0) return `${m}min ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ pseudo: string }>;
}) {
  const { pseudo } = await params;
  const decoded = decodeURIComponent(pseudo);
  const user = await getUserByPseudo(decoded);
  if (!user) notFound();
  const [stats, sessions] = await Promise.all([
    getUserStats(user.id),
    getUserSessions(user.id),
  ]);

  return (
    <main className="page-shell">
      <section className="paper-card user-detail-hero">
        <div>
          <p className="eyebrow">Pseudo</p>
          <h1 className="users-title">{user.pseudo}</h1>
          <p className="users-subtitle">
            {stats.sessionsFinished} session{stats.sessionsFinished > 1 ? "s" : ""}{" "}
            termine{stats.sessionsFinished > 1 ? "es" : "e"},{" "}
            {stats.sessionsInProgress} en cours.
          </p>
        </div>
        <div className="user-detail-actions">
          <Link className="secondary-button" href="/users">
            <ArrowLeft size={16} />
            Tous les pseudos
          </Link>
          <Link className="secondary-button" href="/">
            Accueil
          </Link>
        </div>
      </section>

      <section className="stats-grid">
        <article className="paper-card stat-card">
          <Gauge size={18} />
          <div>
            <p className="stat-value">
              {stats.avgScore !== null ? Math.round(stats.avgScore) : "-"}
            </p>
            <p className="stat-label">score moyen / 1000</p>
          </div>
        </article>

        <article className="paper-card stat-card">
          <Trophy size={18} />
          <div>
            <p className="stat-value">{stats.bestScore ?? "-"}</p>
            <p className="stat-label">meilleur score</p>
          </div>
        </article>

        <article className="paper-card stat-card">
          <CheckCircle2 size={18} />
          <div>
            <p className="stat-value">
              {stats.successRate !== null
                ? `${Math.round(stats.successRate)}%`
                : "-"}
            </p>
            <p className="stat-label">taux de bonnes reponses</p>
          </div>
        </article>

        <article className="paper-card stat-card">
          <Clock3 size={18} />
          <div>
            <p className="stat-value">
              {stats.avgByMode.timed !== null
                ? Math.round(stats.avgByMode.timed)
                : "-"}
            </p>
            <p className="stat-label">moyenne mode timed</p>
          </div>
        </article>
      </section>

      <section className="paper-card user-sessions-card">
        <div className="user-sessions-head">
          <h2>Sessions</h2>
          <p>Derniere session en haut.</p>
        </div>

        {sessions.length === 0 ? (
          <p>Aucune session enregistree pour ce pseudo.</p>
        ) : (
          <div className="user-sessions-table">
            <div className="user-sessions-row user-sessions-row--head">
              <span>Demarrage</span>
              <span>Mode</span>
              <span>Duree</span>
              <span>Score</span>
              <span>Bonnes</span>
            </div>
            {sessions.map((session) => (
              <Link
                className="user-sessions-row user-sessions-row--link"
                href={`/exam/${session.id}`}
                key={session.id}
              >
                <span>{formatDate(session.startedAt)}</span>
                <span>
                  <span
                    className={`session-mode-pill session-mode-pill--${session.mode}`}
                  >
                    {session.mode}
                  </span>
                </span>
                <span>{formatDuration(session.startedAt, session.finishedAt)}</span>
                <span>
                  {session.score !== null
                    ? `${session.score} / 1000`
                    : session.finishedAt
                      ? "-"
                      : "en cours"}
                </span>
                <span>
                  {session.correctCount !== null
                    ? `${session.correctCount} / ${session.totalQuestions}`
                    : "-"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
