import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Hourglass,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
} from "lucide-react";

import { startExamAction } from "@/app/actions";
import { UserPicker } from "@/components/user-picker";
import { getCurrentUser } from "@/lib/auth";
import {
  getUserStats,
  isAdminRole,
  listCheatsheetMastery,
} from "@/lib/exam-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    return <PublicLanding />;
  }

  if (user.role === "free") {
    return <FreeLanding pseudo={user.pseudo} />;
  }

  return (
    <MemberDashboard
      isAdmin={isAdminRole(user.role)}
      pseudo={user.pseudo}
      role={user.role}
      userId={user.id}
    />
  );
}

function MarketingSections() {
  return (
    <section className="feature-grid">
      <article className="paper-card feature-card">
        <Timer size={20} />
        <h2>Exam mode</h2>
        <p>
          65 questions chronométrées en 2 h 10, score final calculé sur 1000.
          Reprends une session interrompue à tout moment.
        </p>
      </article>
      <article className="paper-card feature-card">
        <BookOpen size={20} />
        <h2>Quiz par cheatsheet</h2>
        <p>
          Chaque fiche service propose un quiz ciblé sur ses concepts. Idéal
          pour bosser un thème spécifique avant la session blanche.
        </p>
      </article>
      <article className="paper-card feature-card">
        <Target size={20} />
        <h2>Maîtrise par thématique</h2>
        <p>
          Le suivi calcule ton taux de réussite par cheatsheet en agrégeant
          tes dernières réponses — tu sais où concentrer ta révision.
        </p>
      </article>
    </section>
  );
}

function PublicLanding() {
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
              684 questions, 83 cheatsheets, suivi de compréhension par
              thématique. Connecte-toi pour accéder à l&apos;app.
            </p>
            <UserPicker pseudo={null} />
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

      <MarketingSections />
    </main>
  );
}

function FreeLanding({ pseudo }: { pseudo: string }) {
  return (
    <main className="page-shell">
      <section className="paper-card free-banner">
        <Hourglass size={20} />
        <div className="free-banner-text">
          <strong>
            Salut {pseudo}, ton compte est en attente d&apos;activation.
          </strong>
          <p>
            Un administrateur doit te débloquer l&apos;accès aux questions et
            aux cheatsheets. Reviens plus tard ou contacte-le.
          </p>
        </div>
        <UserPicker pseudo={pseudo} role="free" />
      </section>

      <MarketingSections />
    </main>
  );
}

async function MemberDashboard({
  userId,
  pseudo,
  role,
  isAdmin,
}: {
  userId: number;
  pseudo: string;
  role: "member" | "admin";
  isAdmin: boolean;
}) {
  const [stats, mastery] = await Promise.all([
    getUserStats(userId),
    listCheatsheetMastery(userId),
  ]);
  const sortedMastery = [...mastery].sort(
    (a, b) => (b.masteryRate ?? 0) - (a.masteryRate ?? 0),
  );
  const top = sortedMastery.slice(0, 3);
  const bottom = sortedMastery.slice(-3).reverse();

  return (
    <main className="page-shell">
      <section className="paper-card dashboard-hero">
        <div>
          <p className="eyebrow">Bonjour</p>
          <h1 className="users-title">{pseudo}</h1>
          <p className="users-subtitle">
            {stats.sessionsFinished} session
            {stats.sessionsFinished > 1 ? "s" : ""} terminée
            {stats.sessionsFinished > 1 ? "s" : ""} · {stats.sessionsInProgress}{" "}
            en cours
            {stats.avgScore !== null
              ? ` · moyenne ${Math.round(stats.avgScore)} / 1000`
              : ""}
          </p>
        </div>
        <div className="dashboard-hero-actions">
          <UserPicker pseudo={pseudo} role={role} />
          {isAdmin ? (
            <Link className="primary-button" href="/admin">
              <ShieldCheck size={16} />
              Panel admin
            </Link>
          ) : null}
        </div>
      </section>

      <section className="dashboard-quick-grid">
        <form action={startExamAction}>
          <input name="mode" type="hidden" value="timed" />
          <button className="paper-card quick-card" type="submit">
            <Timer size={20} />
            <strong>Exam timed</strong>
            <span>65 questions · 2 h 10</span>
          </button>
        </form>
        <form action={startExamAction}>
          <input name="mode" type="hidden" value="review" />
          <button className="paper-card quick-card" type="submit">
            <Sparkles size={20} />
            <strong>Mode review</strong>
            <span>Feedback immédiat</span>
          </button>
        </form>
        <Link className="paper-card quick-card" href="/cheatsheets">
          <BookOpen size={20} />
          <strong>Cheatsheets</strong>
          <span>83 fiches · quiz par fiche</span>
        </Link>
        <Link
          className="paper-card quick-card"
          href={`/users/${encodeURIComponent(pseudo)}`}
        >
          <Clock3 size={20} />
          <strong>Mes stats</strong>
          <span>Sessions et compréhension</span>
        </Link>
      </section>

      {top.length > 0 ? (
        <section className="paper-card dashboard-mastery">
          <div className="dashboard-mastery-head">
            <h2>Compréhension par thématique</h2>
            <Link className="secondary-button" href={`/users/${encodeURIComponent(pseudo)}`}>
              Tout voir
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="dashboard-mastery-cols">
            <div>
              <p className="eyebrow">À l&apos;aise</p>
              <ul>
                {top.map((row) => (
                  <li key={row.cheatsheetId}>
                    <Link href={`/cheatsheets/${row.slug}`}>
                      {row.title}
                      <span>
                        {row.masteryRate !== null
                          ? `${Math.round(row.masteryRate)}%`
                          : "—"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow">À retravailler</p>
              <ul>
                {bottom.map((row) => (
                  <li key={row.cheatsheetId}>
                    <Link href={`/cheatsheets/${row.slug}`}>
                      {row.title}
                      <span>
                        {row.masteryRate !== null
                          ? `${Math.round(row.masteryRate)}%`
                          : "—"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
