import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Giriş",
  description: "SoundTeacher hesabına giriş.",
};

type Props = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { callbackUrl } = await searchParams;
  const safeCallback = sanitizeCallback(callbackUrl);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <Link
        href="/"
        className="st-fade-up mb-8 font-[family-name:var(--font-display)] text-2xl font-semibold text-brand"
      >
        SoundTeacher
      </Link>

      <h1 className="st-fade-up-delay font-[family-name:var(--font-display)] text-3xl font-medium text-foreground">
        Giriş yap
      </h1>
      <p className="st-fade-up-delay mt-2 text-sm leading-relaxed text-muted">
        Hesabınla yerleştirmeye ve deneme programına devam et.
      </p>

      <div className="st-fade-up-delay-2 st-panel mt-8 px-5 py-5">
        <LoginForm callbackUrl={safeCallback} />
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        Hesabın yok mu?{" "}
        <Link href="/signup" className="font-medium text-brand hover:underline">
          Kayıt ol
        </Link>
      </p>
    </main>
  );
}

/** Only same-origin relative paths — block open redirects. */
function sanitizeCallback(raw: string | undefined): string {
  if (!raw) return "/home";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/home";
  return raw;
}
