import Link from "next/link";
import { ArrowRight, FileQuestion, Home, ShieldCheck, Users } from "lucide-react";

import { requireAdmin } from "@/lib/auth";
import { countAdmins, listUsersWithStats } from "@/lib/exam-data";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  await requireAdmin();
  const [users, admins] = await Promise.all([listUsersWithStats(), countAdmins()]);
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
          <p className="eyebrow">
            <ShieldCheck size={14} /> Panel admin
          </p>
          <h1 className="users-title">Administration</h1>
          <p className="users-subtitle">
            {users.length} utilisateurs · {counts.admin} admin
            {counts.admin > 1 ? "s" : ""} · {counts.member} membre
            {counts.member > 1 ? "s" : ""} · {counts.free} free
            {admins === 0 ? " · ⚠ aucun admin restant" : ""}
          </p>
        </div>
        <Link className="secondary-button" href="/">
          <Home size={16} />
          Accueil
        </Link>
      </section>

      <section className="admin-grid">
        <Link className="paper-card admin-card" href="/admin/users">
          <div className="admin-card-head">
            <Users size={20} />
            <h2>Utilisateurs</h2>
          </div>
          <p>
            Gérer les rôles, voir les stats par utilisateur, supprimer un compte
            si besoin.
          </p>
          <span className="admin-card-cta">
            Ouvrir <ArrowRight size={14} />
          </span>
        </Link>

        <Link className="paper-card admin-card" href="/admin/questions">
          <div className="admin-card-head">
            <FileQuestion size={20} />
            <h2>Questions</h2>
          </div>
          <p>
            Parcourir, rechercher et éditer les énoncés, options et explications
            du dump.
          </p>
          <span className="admin-card-cta">
            Ouvrir <ArrowRight size={14} />
          </span>
        </Link>
      </section>
    </main>
  );
}
