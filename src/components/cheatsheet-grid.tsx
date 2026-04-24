"use client";

import Link from "next/link";
import { BookOpen, ChevronDown, ListFilter, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { categorySlug, prioritySlug } from "@/lib/cheatsheet-style";
import type { CheatsheetListRow } from "@/lib/exam-data";

export function CheatsheetGrid({
  rows,
  categories,
}: {
  rows: CheatsheetListRow[];
  categories: string[];
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (selected.size > 0 && !selected.has(row.category)) {
        return false;
      }
      if (!needle) return true;
      const haystack = `${row.title} ${row.category} ${row.priority}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [query, rows, selected]);

  const toggleCategory = (cat: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const triggerLabel =
    selected.size === 0
      ? "Toutes les categories"
      : selected.size === 1
        ? Array.from(selected)[0]
        : `${selected.size} categories`;

  return (
    <>
      <section className="paper-card questions-toolbar">
        <div className="cheatsheet-toolbar">
          <div className="questions-search cheatsheet-search">
            <Search size={16} />
            <input
              autoComplete="off"
              className="user-picker-input questions-search-input"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cherche par titre ou categorie"
              type="text"
              value={query}
            />
          </div>

          <div className="cheatsheet-multiselect" ref={dropdownRef}>
            <button
              aria-expanded={open}
              aria-haspopup="listbox"
              className="cheatsheet-multiselect-trigger"
              onClick={() => setOpen((value) => !value)}
              type="button"
            >
              <ListFilter size={16} />
              <span className="cheatsheet-multiselect-label">{triggerLabel}</span>
              {selected.size > 0 ? (
                <span
                  aria-label="Reinitialiser le filtre"
                  className="cheatsheet-multiselect-clear"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelected(new Set());
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      event.stopPropagation();
                      setSelected(new Set());
                    }
                  }}
                >
                  <X size={14} />
                </span>
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            {open ? (
              <div className="cheatsheet-multiselect-menu" role="listbox">
                {categories.map((cat) => {
                  const checked = selected.has(cat);
                  const slug = categorySlug(cat);
                  return (
                    <label
                      className={`cheatsheet-multiselect-option ${checked ? "cheatsheet-multiselect-option--checked" : ""}`}
                      key={cat}
                    >
                      <input
                        checked={checked}
                        onChange={() => toggleCategory(cat)}
                        type="checkbox"
                      />
                      <span className={`cheatsheet-chip cheatsheet-chip--${slug}`}>
                        {cat}
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {filtered.length === 0 ? (
        <section className="paper-card">
          <p className="users-subtitle">Aucune fiche ne correspond aux filtres.</p>
        </section>
      ) : (
        <section className="cheatsheet-grid">
          {filtered.map((row) => {
            const catClass = categorySlug(row.category);
            const tierClass = prioritySlug(row.priority);
            return (
              <Link
                className={`paper-card cheatsheet-card cheatsheet-card--${catClass}`}
                href={`/cheatsheets/${row.slug}`}
                key={row.id}
              >
                <div className="cheatsheet-card-head">
                  <BookOpen size={16} />
                  <span
                    className={`cheatsheet-card-category cheatsheet-chip--${catClass}`}
                  >
                    {row.category}
                  </span>
                  {row.priority ? (
                    <span
                      className={`cheatsheet-card-priority cheatsheet-tier--${tierClass}`}
                    >
                      {row.priority}
                    </span>
                  ) : null}
                </div>
                <h2 className="cheatsheet-card-title">{row.title}</h2>
              </Link>
            );
          })}
        </section>
      )}
    </>
  );
}
