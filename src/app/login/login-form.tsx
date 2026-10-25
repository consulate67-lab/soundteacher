"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import type { AuthFormState } from "@/app/signup/actions";

const initial: AuthFormState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4" noValidate>
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
          autoComplete="current-password"
          placeholder="Şifren"
          minLength={8}
          className="h-11 rounded-md border border-border bg-surface px-3 text-foreground placeholder:text-muted/70"
          required
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
      >
        {pending ? "Giriş yapılıyor…" : "Giriş yap"}
      </button>

      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-border bg-brand-soft px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
