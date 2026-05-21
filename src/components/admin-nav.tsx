"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileQuestion, Home, Layers, Users } from "lucide-react";

const TABS = [
  { href: "/admin/users", label: "Utilisateurs", Icon: Users },
  { href: "/admin/questions", label: "Questions", Icon: FileQuestion },
  { href: "/admin/flashcards", label: "Flashcards", Icon: Layers },
] as const;

export function AdminNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav aria-label="Navigation admin" className="admin-nav">
      <div className="admin-nav-tabs" role="tablist">
        {TABS.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={`admin-nav-tab${isActive ? " admin-nav-tab--active" : ""}`}
              href={href}
              key={href}
              role="tab"
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </div>
      <Link className="secondary-button admin-nav-home" href="/">
        <Home size={16} />
        Accueil
      </Link>
    </nav>
  );
}
