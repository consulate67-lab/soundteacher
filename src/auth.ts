import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { findUserByEmail, upsertMockUser } from "@/lib/users";

/**
 * Auth vendor choice (Dilim B): **Auth.js (next-auth v5)** with Credentials.
 * Clerk remains an alternative for later; mock/dev credentials only — no production IdP.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || "dev-only-soundteacher-auth-secret",
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "E-posta",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
        displayName: { label: "Görünen ad", type: "text" },
        mode: { label: "mode", type: "text" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");
        const displayName = credentials?.displayName
          ? String(credentials.displayName)
          : null;
        const mode = String(credentials?.mode ?? "login");

        if (!email || !email.includes("@") || password.length < 8) {
          return null;
        }

        if (mode === "signup") {
          const user = upsertMockUser({ email, password, displayName });
          return {
            id: user.id,
            email: user.email,
            name: user.displayName ?? user.email.split("@")[0],
          };
        }

        const existing = findUserByEmail(email);
        if (!existing) {
          // Dev convenience: first login creates the account (mock mode).
          const user = upsertMockUser({ email, password, displayName });
          return {
            id: user.id,
            email: user.email,
            name: user.displayName ?? user.email.split("@")[0],
          };
        }
        if (existing.password !== password) {
          return null;
        }
        return {
          id: existing.id,
          email: existing.email,
          name: existing.displayName ?? existing.email.split("@")[0],
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.email = token.email ?? session.user.email;
        session.user.name = token.name ?? session.user.name;
      }
      return session;
    },
  },
});
