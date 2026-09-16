import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const restaurant = await db.restaurant.findFirst({
    where: { ownerId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { subscription: true },
  });
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { isDemo: true, email: true },
  });
  const isDemo = user?.isDemo === true || (user?.email ? isAdminEmail(user.email) : false);
  return NextResponse.json({
    subscription: isDemo ? null : restaurant.subscription,
    isDemo,
  });
}
