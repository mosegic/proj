import { NextRequest } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { jsonError, jsonSuccess, parseBody } from "@/lib/api-utils";
import { reorderCategoriesSchema } from "@/lib/validations";

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const body = await parseBody<unknown>(request);
  const parsed = reorderCategoriesSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Validation failed");
  }

  const { restaurantId, categoryIds } = parsed.data;
  const restaurant = await db.restaurant.findFirst({
    where: { id: restaurantId, ownerId: session.userId },
  });
  if (!restaurant) return jsonError("Restaurant not found", 404);

  if (new Set(categoryIds).size !== categoryIds.length) {
    return jsonError("Category order contains duplicate IDs");
  }

  const categories = await db.category.findMany({
    where: { restaurantId },
    select: { id: true },
  });
  if (
    categories.length !== categoryIds.length ||
    categories.some(({ id }) => !categoryIds.includes(id))
  ) {
    return jsonError("Category list has changed. Reload and try again.", 409);
  }

  await db.$transaction(
    categoryIds.map((id, sortOrder) =>
      db.category.update({ where: { id }, data: { sortOrder } }),
    ),
  );

  return jsonSuccess({ ok: true });
}
