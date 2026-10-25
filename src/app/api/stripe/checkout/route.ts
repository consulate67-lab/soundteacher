import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPlan, type PlanId } from "@/lib/plans";
import { appBaseUrl, getStripe, isStripeMockMode, priceIdForPlan } from "@/lib/stripe";

export const dynamic = "force-dynamic";

type Body = {
  plan?: string;
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const planId = body.plan as PlanId | undefined;
  const plan = getPlan(planId);
  if (!plan) {
    return NextResponse.json({ error: "Geçersiz plan" }, { status: 400 });
  }

  const base = appBaseUrl();
  const successPath = `/checkout/success?plan=${plan.id}&session_id={CHECKOUT_SESSION_ID}`;
  const successUrl = `${base}${successPath}`;
  const cancelUrl = `${base}/plans`;

  if (isStripeMockMode()) {
    const mockSessionId = `cs_mock_${plan.id}_${Date.now()}`;
    // Relative path — App Router `router.push` 404s on absolute same-origin URLs.
    return NextResponse.json({
      mode: "mock",
      url: `/checkout/success?plan=${plan.id}&session_id=${mockSessionId}`,
      message:
        "STRIPE_SECRET_KEY yok — mock checkout. Abonelik başarı sayfasında etkinleşir.",
    });
  }

  const stripe = getStripe();
  const priceId = priceIdForPlan(plan.id);
  if (!stripe || !priceId) {
    return NextResponse.json(
      {
        error:
          "Stripe test anahtarı veya fiyat ID eksik. .env.example alanlarını doldurun veya mock moda dönün.",
      },
      { status: 503 },
    );
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: plan.id === "trial" ? "subscription" : "subscription",
    customer_email: session.user.email ?? undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: session.user.id,
    metadata: {
      userId: session.user.id,
      plan: plan.id,
    },
  });

  return NextResponse.json({
    mode: "stripe",
    url: checkout.url,
    sessionId: checkout.id,
  });
}
