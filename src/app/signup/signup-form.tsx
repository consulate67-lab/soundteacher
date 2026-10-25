"use client";

import { useActionState } from "react";
import { signupAction, type AuthFormState } from "./actions";

const initial: AuthFormState = {};

/** S01 — Auth.js Credentials kayıt (mock kullanıcı deposu). */
export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, initial);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">E-posta</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="ornek@posta.com"
          className="h-11 rounded-md border border-border bg-surface px-3 text-foreground placeholder:text-muted/70"
          required
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">Şifre</span>
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="En az 8 karakter"
          minLength={8}
          className="h-11 rounded-md border border-border bg-surface px-3 text-foreground placeholder:text-muted/70"
          required
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">Görünen ad (isteğe bağlı)</span>
        <input
          type="text"
          name="displayName"
          autoComplete="nickname"
          placeholder="Nasıl hitap edelim?"
          className="h-11 rounded-md border border-border bg-surface px-3 text-foreground placeholder:text-muted/70"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
      >
        {pending ? "Kaydediliyor…" : "Kayıt ol"}
      </button>

      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-border bg-brand-soft px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}

      <p className="text-xs text-muted">
        Mock kimlik doğrulama — gerçek e-posta doğrulaması yok. Şifre yalnızca bu süreç
        belleğinde tutulur.
      </p>
    </form>
  );
}
