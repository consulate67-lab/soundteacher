import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Kayıt",
  description: "SoundTeacher hesabı oluştur (S01).",
};

/** S01 — Kayıt (Auth.js Credentials, mock). */
export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <Link
        href="/"
        className="st-fade-up mb-8 font-[family-name:var(--font-display)] text-2xl font-semibold text-brand"
      >
        SoundTeacher
      </Link>

      <h1 className="st-fade-up-delay font-[family-name:var(--font-display)] text-3xl font-medium text-foreground">
        Hesap oluştur
      </h1>
      <p className="st-fade-up-delay mt-2 text-sm leading-relaxed text-muted">
        E-posta ile başla. İlk dersler ücretsiz deneme — abonelik sonra, istediğin
        zaman.
      </p>

      <div className="st-fade-up-delay-2 st-panel mt-8 px-5 py-5">
        <SignupForm />
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted">
        Verilerin güvenli tutulur. Çocuklar için bir ebeveyn veya bakıcı yardımcı
        olabilir; ayrı bakıcı hesabı bu fazda zorunlu değildir.
      </p>

      <p className="mt-8 text-center text-sm text-muted">
        Zaten hesabın var mı?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Giriş yap
        </Link>
      </p>
    </main>
  );
}
