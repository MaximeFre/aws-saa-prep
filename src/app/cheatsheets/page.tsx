import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CheatsheetGrid } from "@/components/cheatsheet-grid";
import { listCheatsheetCategories, listCheatsheets } from "@/lib/exam-data";

export const dynamic = "force-dynamic";

export default async function CheatsheetsPage() {
  const [categories, rows] = await Promise.all([
    listCheatsheetCategories(),
    listCheatsheets(),
  ]);

  return (
    <main className="page-shell">
      <section className="paper-card user-list-hero">
        <div>
          <p className="eyebrow">Cheatsheets</p>
          <h1 className="users-title">Fiches de revision</h1>
          <p className="users-subtitle">
            {rows.length} fiche{rows.length > 1 ? "s" : ""}. Clique pour lire.
          </p>
        </div>
        <Link className="secondary-button" href="/">
          <ArrowLeft size={16} />
          Accueil
        </Link>
      </section>

      <CheatsheetGrid categories={categories} rows={rows} />
    </main>
  );
}
