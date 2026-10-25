import Stripe from "stripe";

/** True when STRIPE_SECRET_KEY is unset — checkout/webhook run as labeled mock mode. */
export function isStripeMockMode(): boolean {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  return !key || key.startsWith("sk_test_placeholder") || key === "mock";
}

export function getStripe(): Stripe | null {
  if (isStripeMockMode()) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-09-30.endive",
  });
}

export function priceIdForPlan(plan: "trial" | "monthly" | "yearly"): string | undefined {
  switch (plan) {
    case "trial":
      return process.env.STRIPE_PRICE_TRIAL || undefined;
    case "monthly":
      return process.env.STRIPE_PRICE_MONTHLY || undefined;
    case "yearly":
      return process.env.STRIPE_PRICE_YEARLY || undefined;
  }
}

export function appBaseUrl(): string {
  return (
    process.env.AUTH_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}
