import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Giriş",
  description: "SoundTeacher hesabına giriş.",
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <Link
        href="/"
        className="mb-8 font-[family-name:var(--font-display)] text-2xl font-semibold text-brand"
      >
        SoundTeacher
      </Link>

      <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium text-foreground">
        Giriş yap
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Mock Auth.js oturumu — üretim kimlik sağlayıcısı yok.
      </p>

      <LoginForm />

      <p className="mt-8 text-center text-sm text-muted">
        Hesabın yok mu?{" "}
        <Link href="/signup" className="font-medium text-brand hover:underline">
          Kayıt ol
        </Link>
      </p>
    </main>
  );
}
