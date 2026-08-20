import { NextRequest } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { menuItemSchema } from "@/lib/validations";
import { jsonError, jsonSuccess, parseBody } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const restaurantId = request.nextUrl.searchParams.get("restaurantId");
  const categoryId = request.nextUrl.searchParams.get("categoryId");

  if (!restaurantId) return jsonError("restaurantId required");

  const restaurant = await db.restaurant.findFirst({
    where: { id: restaurantId, ownerId: session.userId },
  });
  if (!restaurant) return jsonError("Restaurant not found", 404);

  const items = await db.menuItem.findMany({
    where: {
      category: {
        restaurantId,
        ...(categoryId ? { id: categoryId } : {}),
      },
    },
    include: {
      category: { select: { id: true, name: true } },
      options: true,
    },
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });

  return jsonSuccess({ items });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const body = await parseBody<Record<string, unknown>>(request);
  if (!body) return jsonError("Invalid request body");

  const parsed = menuItemSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Validation failed");
  }

  const category = await db.category.findUnique({
    where: { id: parsed.data.categoryId },
    include: { restaurant: true },
  });

  if (!category || category.restaurant.ownerId !== session.userId) {
    return jsonError("Category not found", 404);
  }

  const maxOrder = await db.menuItem.aggregate({
    where: { categoryId: parsed.data.categoryId },
    _max: { sortOrder: true },
  });

  const item = await db.menuItem.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      price: parsed.data.price,
      imageUrl: parsed.data.imageUrl || null,
      isAvailable: parsed.data.isAvailable ?? true,
      isVisible: parsed.data.isVisible ?? true,
      isSoldOut: parsed.data.isSoldOut ?? false,
      categoryId: parsed.data.categoryId,
      sortOrder: parsed.data.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
    },
    include: { options: true },
  });

  return jsonSuccess({ item }, 201);
}
