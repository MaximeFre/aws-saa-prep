import { Loader2 } from "lucide-react";

type PageLoaderProps = {
  eyebrow?: string;
  title?: string;
  hint?: string;
  variant?: "stack" | "grid" | "bare";
  skeletonCount?: number;
};

export function PageLoader({
  eyebrow,
  title,
  hint,
  variant = "stack",
  skeletonCount,
}: PageLoaderProps) {
  return (
    <main className="page-shell">
      <section
        aria-busy
        aria-live="polite"
        className="paper-card page-loader"
      >
        <div className="page-loader-spinner">
          <Loader2 className="spin" size={28} />
        </div>
        <div className="page-loader-copy">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1 className="users-title">{title ?? "Chargement…"}</h1>
          {hint ? <p className="users-subtitle">{hint}</p> : null}
        </div>
      </section>
      {variant === "grid" ? (
        <SkeletonGrid count={skeletonCount ?? 9} />
      ) : variant === "stack" ? (
        <SkeletonStack count={skeletonCount ?? 3} />
      ) : null}
    </main>
  );
}

export function SkeletonStack({ count = 3 }: { count?: number }) {
  return (
    <section className="skeleton-stack" aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <div className="paper-card skeleton-card" key={index}>
          <div className="skeleton-line skeleton-line--xs" />
          <div className="skeleton-line skeleton-line--lg" />
          <div className="skeleton-line skeleton-line--md" />
        </div>
      ))}
    </section>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <section className="skeleton-grid" aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <div className="paper-card skeleton-card" key={index}>
          <div className="skeleton-line skeleton-line--xs" />
          <div className="skeleton-line skeleton-line--lg" />
          <div className="skeleton-line skeleton-line--sm" />
        </div>
      ))}
    </section>
  );
}
