import Link from "next/link";
import { ArrowLeft, UserRound } from "lucide-react";

import { listUsersWithStats } from "@/lib/exam-data";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await listUsersWithStats();

  return (
    <main className="page-shell">
      <section className="paper-card user-list-hero">
        <div>
          <p className="eyebrow">Pseudos</p>
          <h1 className="users-title">Historique par utilisateur</h1>
          <p className="users-subtitle">
            Retrouve toutes les sessions enregistrees par pseudo, avec leur score
            moyen et leur meilleur score.
          </p>
        </div>
        <Link className="secondary-button" href="/">
          <ArrowLeft size={16} />
          Accueil
        </Link>
      </section>

      {users.length === 0 ? (
        <section className="paper-card">
          <p>Aucun pseudo enregistre pour l&apos;instant.</p>
        </section>
      ) : (
        <section className="user-grid">
          {users.map((user) => (
            <Link
              className="paper-card user-card"
              href={`/users/${encodeURIComponent(user.pseudo)}`}
              key={user.id}
            >
              <div className="user-card-head">
                <UserRound size={18} />
                <h2>{user.pseudo}</h2>
              </div>
              <dl className="user-card-stats">
                <div>
                  <dt>Sessions</dt>
                  <dd>{user.sessionCount}</dd>
                </div>
                <div>
                  <dt>Moyenne</dt>
                  <dd>
                    {user.avgScore !== null
                      ? Math.round(user.avgScore)
                      : "-"}
                  </dd>
                </div>
                <div>
                  <dt>Meilleur</dt>
                  <dd>{user.bestScore ?? "-"}</dd>
                </div>
              </dl>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
