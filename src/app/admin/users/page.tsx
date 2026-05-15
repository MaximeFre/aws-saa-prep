import Link from "next/link";
import { ArrowLeft, UserRound } from "lucide-react";

import { RoleSelector } from "@/components/role-selector";
import { requireAdmin } from "@/lib/auth";
import { listUsersWithStats } from "@/lib/exam-data";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const me = await requireAdmin();
  const users = await listUsersWithStats();
  const counts = users.reduce(
    (acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    },
    { free: 0, member: 0, admin: 0 } as Record<string, number>,
  );

  return (
    <main className="page-shell">
      <section className="paper-card user-list-hero">
        <div>
          <p className="eyebrow">Admin · Utilisateurs</p>
          <h1 className="users-title">Gestion des utilisateurs</h1>
          <p className="users-subtitle">
            {users.length} utilisateurs · {counts.admin} admin
            {counts.admin > 1 ? "s" : ""} · {counts.member} membre
            {counts.member > 1 ? "s" : ""} · {counts.free} free
          </p>
        </div>
        <Link className="secondary-button" href="/admin">
          <ArrowLeft size={16} />
          Admin
        </Link>
      </section>

      {users.length === 0 ? (
        <section className="paper-card">
          <p>Aucun utilisateur enregistré.</p>
        </section>
      ) : (
        <section className="admin-user-list">
          {users.map((user) => (
            <article className="paper-card admin-user-row" key={user.id}>
              <Link
                className="admin-user-info"
                href={`/users/${encodeURIComponent(user.pseudo)}`}
              >
                <UserRound size={18} />
                <div>
                  <strong>{user.pseudo}</strong>
                  <span className="admin-user-meta">
                    {user.sessionCount} session{user.sessionCount > 1 ? "s" : ""}
                    {user.bestScore !== null
                      ? ` · best ${user.bestScore} / 1000`
                      : ""}
                    {user.avgScore !== null
                      ? ` · avg ${Math.round(user.avgScore)}`
                      : ""}
                  </span>
                </div>
              </Link>
              <RoleSelector
                currentRole={user.role}
                disabled={user.id === me.id && counts.admin <= 1}
                userId={user.id}
              />
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
