import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";

export async function POST() {
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
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });

  const existing = await db.subscription.findUnique({ where: { restaurantId: restaurant.id } });
  if (existing) {
    // Never let an active or already-trialing plan be silently reset. Only
    // legacy accounts with no prior trial (e.g. created before trials were
    // granted at signup) or an abandoned/never-completed checkout attempt
    // may claim the one-time 30-day trial.
    if (existing.status === "active" || existing.status === "trialing") {
      return NextResponse.json({ error: "A plan has already been selected" }, { status: 409 });
    }
    if (existing.trialEndsAt) {
      return NextResponse.json({ error: "Free trial has already been used" }, { status: 409 });
    }
  }

  const trialEndsAt = new Date();
  trialEndsAt.setMonth(trialEndsAt.getMonth() + 1);
  const subscription = await db.subscription.upsert({
    where: { restaurantId: restaurant.id },
    create: {
      restaurantId: restaurant.id,
      status: "trialing",
      tier: "standard",
      planCode: "free",
      email: session.email,
      trialEndsAt,
    },
    update: {
      status: "trialing",
      tier: "standard",
      planCode: "free",
      email: session.email,
      trialEndsAt,
    },
  });
  return NextResponse.json({ subscription });
}
