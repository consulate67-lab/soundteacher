"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type AuthFormState = {
  error?: string;
};

export async function signupAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "");

  if (!email.includes("@") || password.length < 8) {
    return { error: "Geçerli bir e-posta ve en az 8 karakterlik şifre gir." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      displayName,
      mode: "signup",
      redirectTo: "/plans",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Kayıt başarısız. Bilgileri kontrol et." };
    }
    throw error;
  }

  return {};
}
