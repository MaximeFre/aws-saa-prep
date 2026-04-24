"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  LogIn,
  LogOut,
  User as UserIcon,
  Users,
} from "lucide-react";
import { useActionState } from "react";

import { loginAction, logoutAction, startExamAction } from "@/app/actions";

type LoginState = { error: string | null };
const initialLoginState: LoginState = { error: null };

async function loginFormAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  return loginAction(formData);
}

export function UserPicker({ pseudo }: { pseudo: string | null }) {
  const [state, formAction, pending] = useActionState(
    loginFormAction,
    initialLoginState,
  );

  if (!pseudo) {
    return (
      <div className="user-picker">
        <label className="user-picker-label" htmlFor="pseudo-input">
          <LogIn size={16} />
          <span>Connecte-toi ou cree un compte</span>
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
            {pending ? "..." : "Valider"}
          </button>
        </form>
        {state.error ? (
          <p className="user-picker-error" role="alert">
            {state.error}
          </p>
        ) : null}
        <div className="user-picker-links">
          <Link className="user-picker-link" href="/users">
            <Users size={14} />
            Voir les pseudos existants
          </Link>
          <Link className="user-picker-link" href="/questions">
            <BookOpen size={14} />
            Editer les questions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="user-picker user-picker--active">
      <div className="user-picker-header">
        <div className="user-picker-identity">
          <UserIcon size={16} />
          <span>
            Connecte en tant que <strong>{pseudo}</strong>
          </span>
        </div>
        <div className="user-picker-links">
          <Link
            className="user-picker-link"
            href={`/users/${encodeURIComponent(pseudo)}`}
          >
            Mes sessions
          </Link>
          <Link className="user-picker-link" href="/questions">
            Editer les questions
          </Link>
          <form action={logoutAction}>
            <button
              className="user-picker-link user-picker-link--button"
              type="submit"
            >
              <LogOut size={12} />
              Se deconnecter
            </button>
          </form>
        </div>
      </div>

      <div className="user-picker-actions">
        <form action={startExamAction}>
          <input name="mode" type="hidden" value="timed" />
          <button className="primary-button" type="submit">
            Lancer l&apos;exam chronometre
            <ArrowRight size={16} />
          </button>
        </form>

        <form action={startExamAction}>
          <input name="mode" type="hidden" value="review" />
          <button className="secondary-button" type="submit">
            Ouvrir le mode review
          </button>
        </form>
      </div>
    </div>
  );
}
