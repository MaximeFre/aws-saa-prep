import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { categorySlug, prioritySlug } from "@/lib/cheatsheet-style";
import { getCheatsheetBySlug } from "@/lib/exam-data";

export const dynamic = "force-dynamic";

export default async function CheatsheetDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sheet = await getCheatsheetBySlug(slug);
  if (!sheet) notFound();

  const catClass = categorySlug(sheet.category);
  const tierClass = prioritySlug(sheet.priority);

  return (
    <main className="page-shell">
      <section
        className={`paper-card user-list-hero cheatsheet-detail-hero cheatsheet-hero--${catClass}`}
      >
        <div>
          <div className="cheatsheet-detail-tags">
            <span className={`cheatsheet-chip cheatsheet-chip--${catClass}`}>
              {sheet.category}
            </span>
            {sheet.priority ? (
              <span className={`cheatsheet-card-priority cheatsheet-tier--${tierClass}`}>
                {sheet.priority}
              </span>
            ) : null}
          </div>
          <h1 className="users-title">{sheet.title}</h1>
          <p className="users-subtitle">{sheet.domains || "AWS SAA-C03"}</p>
        </div>
        <Link className="secondary-button" href="/cheatsheets">
          <ArrowLeft size={16} />
          Liste
        </Link>
      </section>

      <article className="paper-card cheatsheet-article">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{sheet.content}</ReactMarkdown>
      </article>
    </main>
  );
}
