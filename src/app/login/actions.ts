"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import type { AuthFormState } from "@/app/signup/actions";

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const rawCallback = String(formData.get("callbackUrl") ?? "/home");
  const redirectTo =
    rawCallback.startsWith("/") && !rawCallback.startsWith("//")
      ? rawCallback
      : "/home";

  if (!email.includes("@") || password.length < 8) {
    return { error: "Geçerli bir e-posta ve şifre gir." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      mode: "login",
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Giriş başarısız. E-posta veya şifre hatalı." };
    }
    throw error;
  }

  return {};
}
