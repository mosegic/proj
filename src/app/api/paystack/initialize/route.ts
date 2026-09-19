import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import {
  getPaystackCallbackUrl,
  getPaystackAmount,
  getPaystackPlanCode,
  initializePaystackTransaction,
} from "@/lib/paystack";
import type { PaidPlan } from "@/lib/paystack";
import type { BillingInterval } from "@/lib/paystack";
import { isAdminEmail } from "@/lib/admin";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { isDemo: true, email: true },
  });
  if (user?.isDemo || (user?.email ? isAdminEmail(user.email) : false)) {
    return NextResponse.json({ error: "Demo accounts do not use subscription billing" }, { status: 403 });
  }

  const restaurant = await db.restaurant.findFirst({
    where: { ownerId: session.userId },
    orderBy: { createdAt: "desc" },
  });
  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  const existing = await db.subscription.findUnique({ where: { restaurantId: restaurant.id } });
  const body = (await request.json().catch(() => ({}))) as {
    plan?: PaidPlan;
    interval?: BillingInterval;
  };
  if (body.plan !== "standard" && body.plan !== "elite") {
    return NextResponse.json({ error: "Choose a valid paid plan" }, { status: 400 });
  }
  if (body.interval !== "monthly" && body.interval !== "annually") {
    return NextResponse.json({ error: "Choose a valid billing interval" }, { status: 400 });
  }
  if (existing?.status === "active" && existing.tier === body.plan) {
    return NextResponse.json({ error: "Subscription is already active" }, { status: 409 });
  }
  if (existing?.status === "active" && existing.tier === "elite") {
    return NextResponse.json({ error: "Subscription is already on the Elite plan" }, { status: 409 });
  }
  if (existing?.status === "active" && existing.tier !== "standard") {
    return NextResponse.json({ error: "This subscription cannot be upgraded here" }, { status: 409 });
  }

  const reference = `menu_${restaurant.id}_${Date.now()}`;
  try {
    const planCode = getPaystackPlanCode(body.plan, body.interval);
    const amount = getPaystackAmount(body.plan, body.interval);
    const transaction = await initializePaystackTransaction({
      email: session.email,
      reference,
      amount,
      currency: "KES",
      plan: planCode,
      callback_url: getPaystackCallbackUrl(request.url),
      metadata: {
        restaurantId: restaurant.id,
        tier: body.plan,
        interval: body.interval,
      },
    });
    const transactionReference = transaction.reference || reference;

    // Only downgrade the visible plan state to "pending" when there is no
    // existing trial/active subscription to preserve. If the user is
    // currently trialing or on an active plan (e.g. Standard upgrading to
    // Elite), keep that status intact so abandoning checkout does not strand
    // them without a plan — the transactionReference is still recorded so
    // verify()/webhook can find and activate this row once payment succeeds.
    const preserveCurrentState =
      existing?.status === "trialing" || existing?.status === "active";

    await db.subscription.upsert({
      where: { restaurantId: restaurant.id },
      create: {
        restaurantId: restaurant.id,
        tier: body.plan,
        email: session.email,
        planCode,
        transactionReference,
      },
      update: preserveCurrentState
        ? { transactionReference }
        : {
            status: "pending",
            tier: body.plan,
            planCode,
            email: session.email,
            transactionReference,
          },
    });

    return NextResponse.json({
      authorizationUrl: transaction.authorization_url,
      reference: transaction.reference,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start subscription";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
