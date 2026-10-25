import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getPlan, type PlanId } from "@/lib/plans";
import { getStripe, isStripeMockMode } from "@/lib/stripe";
import {
  activateFromCheckout,
  setSubscriptionStatus,
  upsertSubscription,
} from "@/lib/subscription-store";
import type { SubscriptionStatus } from "@/lib/subscription";

export const dynamic = "force-dynamic";

/**
 * Stripe webhook stub (Dilim B).
 * - Mock mode (no STRIPE_WEBHOOK_SECRET / no secret key): accept JSON events.
 * - Test mode with secret: verify signature then apply status updates.
 *
 * Example mock body:
 * `{ "type": "checkout.session.completed", "data": { "userId": "...", "plan": "monthly" } }`
 * `{ "type": "invoice.payment_failed", "data": { "userId": "..." } }`
 */

type MockEvent = {
  type: string;
  data?: {
    userId?: string;
    plan?: PlanId;
    stripeCustomerId?: string;
    stripeSubId?: string;
    status?: SubscriptionStatus;
  };
};

function applyMockEvent(event: MockEvent) {
  const userId = event.data?.userId;
  if (!userId) {
    return { ok: false as const, error: "data.userId gerekli" };
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "customer.subscription.created": {
      const plan = getPlan(event.data?.plan)?.id ?? "monthly";
      const record = activateFromCheckout({
        userId,
        plan,
        stripeCustomerId: event.data?.stripeCustomerId ?? null,
        stripeSubId: event.data?.stripeSubId ?? null,
      });
      return { ok: true as const, record };
    }
    case "invoice.payment_failed":
    case "customer.subscription.past_due": {
      const record =
        setSubscriptionStatus(userId, "past_due") ??
        upsertSubscription({
          userId,
          plan: event.data?.plan ?? "monthly",
          status: "past_due",
        });
      return { ok: true as const, record };
    }
    case "customer.subscription.deleted":
    case "customer.subscription.canceled": {
      const record =
        setSubscriptionStatus(userId, "canceled") ??
        upsertSubscription({
          userId,
          plan: event.data?.plan ?? "monthly",
          status: "canceled",
        });
      return { ok: true as const, record };
    }
    case "invoice.paid":
    case "customer.subscription.updated": {
      const status = event.data?.status ?? "active";
      const plan = event.data?.plan ?? "monthly";
      const record = upsertSubscription({ userId, plan, status });
      return { ok: true as const, record };
    }
    default:
      return { ok: false as const, error: `İşlenmeyen mock event: ${event.type}` };
  }
}

function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): SubscriptionStatus {
  switch (status) {
    case "trialing":
      return "trial";
    case "active":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    default:
      return "past_due";
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (isStripeMockMode() || !webhookSecret) {
    let event: MockEvent;
    try {
      event = (await request.json()) as MockEvent;
    } catch {
      return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
    }
    const result = applyMockEvent(event);
    if (!result.ok) {
      return NextResponse.json({ mode: "mock", error: result.error }, { status: 400 });
    }
    return NextResponse.json({
      mode: "mock",
      received: true,
      subscription: result.record,
    });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe yapılandırılmadı" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "stripe-signature eksik" }, { status: 400 });
  }

  const rawBody = await request.text();
  let stripeEvent: Stripe.Event;
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "imza doğrulama başarısız";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId || session.client_reference_id;
    const plan = (session.metadata?.plan as PlanId | undefined) ?? "monthly";
    if (userId) {
      activateFromCheckout({
        userId,
        plan,
        stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
        stripeSubId:
          typeof session.subscription === "string" ? session.subscription : null,
      });
    }
  }

  if (
    stripeEvent.type === "customer.subscription.updated" ||
    stripeEvent.type === "customer.subscription.deleted"
  ) {
    const sub = stripeEvent.data.object as Stripe.Subscription;
    const userId = sub.metadata?.userId;
    if (userId) {
      const status =
        stripeEvent.type === "customer.subscription.deleted"
          ? "canceled"
          : mapStripeSubscriptionStatus(sub.status);
      const plan = (sub.metadata?.plan as PlanId | undefined) ?? "monthly";
      upsertSubscription({
        userId,
        plan,
        status,
        stripeCustomerId: typeof sub.customer === "string" ? sub.customer : null,
        stripeSubId: sub.id,
      });
    }
  }

  if (stripeEvent.type === "invoice.payment_failed") {
    const invoice = stripeEvent.data.object as Stripe.Invoice;
    const userId = invoice.metadata?.userId;
    if (userId) {
      setSubscriptionStatus(userId, "past_due");
    }
  }

  return NextResponse.json({ mode: "stripe", received: true, type: stripeEvent.type });
}
