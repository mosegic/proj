import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import {
  getPaystackCallbackUrl,
  getPaystackPlanCode,
  initializePaystackTransaction,
} from "@/lib/paystack";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const restaurant = await db.restaurant.findFirst({
    where: { ownerId: session.userId },
    orderBy: { createdAt: "desc" },
  });
  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  const existing = await db.subscription.findUnique({ where: { restaurantId: restaurant.id } });
  if (existing?.status === "active") {
    return NextResponse.json({ error: "Subscription is already active" }, { status: 409 });
  }

  const reference = `menu_${restaurant.id}_${Date.now()}`;
  try {
    const planCode = getPaystackPlanCode();
    const transaction = await initializePaystackTransaction({
      email: session.email,
      reference,
      plan: planCode,
      callback_url: getPaystackCallbackUrl(),
      metadata: { restaurantId: restaurant.id },
    });

    await db.subscription.upsert({
      where: { restaurantId: restaurant.id },
      create: {
        restaurantId: restaurant.id,
        email: session.email,
        planCode,
        transactionReference: reference,
      },
      update: {
        status: "pending",
        email: session.email,
        planCode,
        transactionReference: reference,
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
