import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Kayıt",
  description: "SoundTeacher hesabı oluştur (S01 iskelet).",
};

/** S01 — Kayıt iskeleti. Gerçek auth Dilim B’de. */
export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <Link
        href="/"
        className="mb-8 font-[family-name:var(--font-display)] text-2xl font-semibold text-brand"
      >
        SoundTeacher
      </Link>

      <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium text-foreground">
        Hesap oluştur
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        E-posta ile başla. Ödeme ve yerleştirme sonraki adımlarda.
      </p>

      <SignupForm />

      <p className="mt-6 text-xs leading-relaxed text-muted">
        Verilerin güvenli tutulur. Çocuklar için bir ebeveyn veya bakıcı yardımcı
        olabilir; ayrı bakıcı hesabı bu fazda zorunlu değildir.
      </p>

      <p className="mt-8 text-center text-sm text-muted">
        Zaten hesabın var mı?{" "}
        <span className="font-medium text-foreground/70">Giriş yakında</span>
      </p>
    </main>
  );
}
