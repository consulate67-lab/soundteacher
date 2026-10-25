"use client";

import { FormEvent, useState } from "react";

/** S01 shell — no real auth; Dilim B will wire Clerk/Auth.js. */
export function SignupForm() {
  const [notice, setNotice] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Kayıt henüz bağlanmadı. Dilim B’de kimlik doğrulama ve ödeme eklenecek.");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4" noValidate>
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
        className="mt-2 inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
      >
        Kayıt ol
      </button>

      {notice ? (
        <p
          role="status"
          className="rounded-md border border-border bg-brand-soft px-3 py-2 text-sm text-foreground"
        >
          {notice}
        </p>
      ) : null}
    </form>
  );
}
