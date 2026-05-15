"use client";

import { Loader2, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { useActionState } from "react";

import { loginAction, logoutAction } from "@/app/actions";
import type { UserRole } from "@/lib/exam-data";

type LoginState = { error: string | null };
const initialLoginState: LoginState = { error: null };

async function loginFormAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  return loginAction(formData);
}

export function UserPicker({
  pseudo,
  role,
}: {
  pseudo: string | null;
  role?: UserRole;
}) {
  const [state, formAction, pending] = useActionState(
    loginFormAction,
    initialLoginState,
  );

  if (!pseudo) {
    return (
      <div className="user-picker">
        <label className="user-picker-label" htmlFor="pseudo-input">
          <LogIn size={16} />
          <span>Connecte-toi ou crée un compte</span>
        </label>
        <form action={formAction} className="user-picker-form">
          <input
            autoComplete="username"
            className="user-picker-input"
            id="pseudo-input"
            maxLength={32}
            name="pseudo"
            placeholder="Pseudo"
            required
            type="text"
          />
          <input
            autoComplete="current-password"
            className="user-picker-input"
            maxLength={128}
            minLength={4}
            name="password"
            placeholder="Mot de passe"
            required
            type="password"
          />
          <button className="primary-button" disabled={pending} type="submit">
            {pending ? (
              <>
                <Loader2 className="spin" size={16} />
                Connexion...
              </>
            ) : (
              "Valider"
            )}
          </button>
        </form>
        {state.error ? (
          <p className="user-picker-error" role="alert">
            {state.error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="user-picker user-picker--active">
      <div className="user-picker-identity">
        <UserIcon size={16} />
        <span>
          Connecté en tant que <strong>{pseudo}</strong>
        </span>
        {role ? (
          <span className={`role-pill role-pill--${role}`}>{role}</span>
        ) : null}
      </div>
      <form action={logoutAction}>
        <button
          className="user-picker-link user-picker-link--button"
          type="submit"
        >
          <LogOut size={12} />
          Se déconnecter
        </button>
      </form>
    </div>
  );
}
