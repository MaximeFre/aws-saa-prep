"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

export function FormSubmitButton({
  children,
  className,
  pendingLabel = "Chargement…",
  disabled,
}: {
  children: ReactNode;
  className?: string;
  pendingLabel?: ReactNode;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      aria-busy={pending}
      className={className}
      disabled={pending || disabled}
      type="submit"
    >
      {pending ? (
        <>
          <Loader2 className="spin" size={16} />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function FormSubmitCard({
  children,
  className,
  pendingHint = "Démarrage…",
  disabled,
}: {
  children: ReactNode;
  className?: string;
  pendingHint?: ReactNode;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      aria-busy={pending}
      className={`${className ?? ""}${pending ? " quick-card--pending" : ""}`.trim()}
      disabled={pending || disabled}
      type="submit"
    >
      {children}
      {pending ? (
        <span className="quick-card-pending">
          <Loader2 className="spin" size={14} />
          {pendingHint}
        </span>
      ) : null}
    </button>
  );
}
