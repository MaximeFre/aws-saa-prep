"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

import { setUserRoleAction } from "@/app/actions";
import type { UserRole } from "@/lib/exam-data";

const ROLES: UserRole[] = ["free", "member", "admin"];

export function RoleSelector({
  userId,
  currentRole,
  disabled,
}: {
  userId: number;
  currentRole: UserRole;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [role, setRole] = useState<UserRole>(currentRole);
  const [error, setError] = useState<string | null>(null);

  function onChange(next: UserRole) {
    if (next === role) return;
    const previous = role;
    setRole(next);
    setError(null);
    const fd = new FormData();
    fd.set("userId", String(userId));
    fd.set("role", next);
    startTransition(async () => {
      const result = await setUserRoleAction(fd);
      if (result?.error) {
        setRole(previous);
        setError(result.error);
      }
    });
  }

  return (
    <div className="role-selector">
      <div className={`role-pill role-pill--${role}`}>
        {role}
        {pending ? <Loader2 className="spin" size={12} /> : null}
      </div>
      <select
        aria-label="Rôle de l'utilisateur"
        className="role-select"
        disabled={pending || disabled}
        onChange={(event) => onChange(event.target.value as UserRole)}
        value={role}
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      {error ? (
        <span className="role-selector-error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
