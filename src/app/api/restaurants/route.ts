import { NextRequest } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { restaurantUpdateSchema } from "@/lib/validations";
import { jsonError, jsonSuccess, parseBody } from "@/lib/api-utils";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const restaurants = await db.restaurant.findMany({
    where: { ownerId: session.userId },
    include: {
      _count: { select: { categories: true, tables: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return jsonSuccess({ restaurants });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const body = await parseBody<{ id: string } & Record<string, unknown>>(request);
  if (!body?.id) return jsonError("Restaurant ID required");

  const parsed = restaurantUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Validation failed");
  }

  const restaurant = await db.restaurant.findFirst({
    where: { id: body.id, ownerId: session.userId },
  });
  if (!restaurant) return jsonError("Restaurant not found", 404);

  const updated = await db.restaurant.update({
    where: { id: body.id },
    data: parsed.data,
  });

  return jsonSuccess({ restaurant: updated });
}
