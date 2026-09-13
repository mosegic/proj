import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const restaurant = await db.restaurant.findFirst({
    where: { ownerId: session.userId },
    orderBy: { createdAt: "desc" },
  });
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });

  const existing = await db.subscription.findUnique({ where: { restaurantId: restaurant.id } });
  if (existing) {
    return NextResponse.json({ error: "A plan has already been selected" }, { status: 409 });
  }

  const trialEndsAt = new Date();
  trialEndsAt.setMonth(trialEndsAt.getMonth() + 1);
  const subscription = await db.subscription.create({
    data: {
      restaurantId: restaurant.id,
      status: "trialing",
      planCode: "free",
      email: session.email,
      trialEndsAt,
    },
  });
  return NextResponse.json({ subscription });
}
