import { NextRequest } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";
import { jsonError, jsonSuccess, parseBody } from "@/lib/api-utils";
import { canAddCategory, getRestaurantTier, TIER_LIMITS } from "@/lib/tier-limits";

async function verifyRestaurantAccess(restaurantId: string, userId: string) {
  return db.restaurant.findFirst({
    where: { id: restaurantId, ownerId: userId },
  });
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const restaurantId = request.nextUrl.searchParams.get("restaurantId");
  if (!restaurantId) return jsonError("restaurantId required");

  const restaurant = await verifyRestaurantAccess(restaurantId, session.userId);
  if (!restaurant) return jsonError("Restaurant not found", 404);

  const categories = await db.category.findMany({
    where: { restaurantId },
    include: {
      _count: { select: { items: true } },
    },
    orderBy: { sortOrder: "asc" },
  });

  const tier = await getRestaurantTier(restaurantId);
  return jsonSuccess({ categories, tier });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const body = await parseBody<{ restaurantId: string } & Record<string, unknown>>(request);
  if (!body?.restaurantId) return jsonError("restaurantId required");

  const restaurant = await verifyRestaurantAccess(body.restaurantId, session.userId);
  if (!restaurant) return jsonError("Restaurant not found", 404);

  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Validation failed");
  }

  const categoryLimit = await canAddCategory(body.restaurantId);
  if (!categoryLimit.allowed) {
    return jsonError(
      `Standard plan is limited to ${TIER_LIMITS.standard.maxCategories} categories. Upgrade to Business Elite to add more.`,
      403,
    );
  }

  const maxOrder = await db.category.aggregate({
    where: { restaurantId: body.restaurantId },
    _max: { sortOrder: true },
  });

  const category = await db.category.create({
    data: {
      ...parsed.data,
      restaurantId: body.restaurantId,
      sortOrder: parsed.data.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });

  return jsonSuccess({ category }, 201);
}
