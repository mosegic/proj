import { NextRequest } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { jsonError, jsonSuccess, parseBody } from "@/lib/api-utils";
import { reorderMenuItemsSchema } from "@/lib/validations";

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const body = await parseBody<unknown>(request);
  const parsed = reorderMenuItemsSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Validation failed");
  }

  const { categoryId, itemIds } = parsed.data;
  const category = await db.category.findUnique({
    where: { id: categoryId },
    include: { restaurant: true },
  });
  if (!category || category.restaurant.ownerId !== session.userId) {
    return jsonError("Category not found", 404);
  }

  if (new Set(itemIds).size !== itemIds.length) {
    return jsonError("Menu item order contains duplicate IDs");
  }

  const items = await db.menuItem.findMany({
    where: { categoryId },
    select: { id: true },
  });
  if (
    items.length !== itemIds.length ||
    items.some(({ id }) => !itemIds.includes(id))
  ) {
    return jsonError("Menu item list has changed. Reload and try again.", 409);
  }

  await db.$transaction(
    itemIds.map((id, sortOrder) =>
      db.menuItem.update({ where: { id }, data: { sortOrder } }),
    ),
  );

  return jsonSuccess({ ok: true });
}
