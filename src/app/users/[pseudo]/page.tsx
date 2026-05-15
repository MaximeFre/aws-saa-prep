import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock3, Gauge, Trophy } from "lucide-react";

import { SessionRow } from "@/components/session-row";
import { categorySlug } from "@/lib/cheatsheet-style";
import {
  getUserByPseudo,
  getUserSessions,
  getUserStats,
  listCheatsheetMastery,
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
  const [stats, sessions, mastery] = await Promise.all([
    getUserStats(user.id),
    getUserSessions(user.id),
    listCheatsheetMastery(user.id),
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
          <h2>Compréhension par thématique</h2>
          <p>Calculée sur la dernière réponse donnée à chaque question.</p>
        </div>
        {mastery.length === 0 ? (
          <p className="users-subtitle">
            Aucune question n&apos;est encore liée à une cheatsheet.
          </p>
        ) : (
          <div className="cheatsheet-mastery-list">
            {mastery.map((row) => {
              const pct =
                row.masteryRate !== null ? Math.round(row.masteryRate) : 0;
              const catClass = categorySlug(row.category);
              return (
                <Link
                  className="cheatsheet-mastery-row"
                  href={`/cheatsheets/${row.slug}`}
                  key={row.cheatsheetId}
                >
                  <div className="cheatsheet-mastery-meta">
                    <span
                      className={`cheatsheet-chip cheatsheet-chip--${catClass}`}
                    >
                      {row.category}
                    </span>
                    <strong>{row.title}</strong>
                  </div>
                  <div className="cheatsheet-mastery-bar">
                    <span
                      className="cheatsheet-mastery-bar-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="cheatsheet-mastery-pct">
                    {pct}% · {row.mastered}/{row.total}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
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
              <div className="user-sessions-row__link">
                <span>Demarrage</span>
                <span>Mode</span>
                <span>Duree</span>
                <span>Score</span>
                <span>Bonnes</span>
              </div>
              <div aria-hidden className="user-sessions-row__actions" />
            </div>
            {sessions.map((session) => (
              <SessionRow
                formattedDate={formatDate(session.startedAt)}
                formattedDuration={formatDuration(
                  session.startedAt,
                  session.finishedAt,
                )}
                key={session.id}
                session={session}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
