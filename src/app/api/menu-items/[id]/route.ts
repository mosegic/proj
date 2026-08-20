import { NextRequest } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { menuItemSchema } from "@/lib/validations";
import { jsonError, jsonSuccess, parseBody } from "@/lib/api-utils";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await params;
  const item = await db.menuItem.findUnique({
    where: { id },
    include: { category: { include: { restaurant: true } } },
  });

  if (!item || item.category.restaurant.ownerId !== session.userId) {
    return jsonError("Menu item not found", 404);
  }

  const body = await parseBody<Record<string, unknown>>(request);
  const parsed = menuItemSchema.partial().safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Validation failed");
  }

  const updated = await db.menuItem.update({
    where: { id },
    data: {
      ...parsed.data,
      description: parsed.data.description ?? undefined,
      imageUrl: parsed.data.imageUrl ?? undefined,
    },
    include: { options: true },
  });

  return jsonSuccess({ item: updated });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await params;
  const item = await db.menuItem.findUnique({
    where: { id },
    include: { category: { include: { restaurant: true } } },
  });

  if (!item || item.category.restaurant.ownerId !== session.userId) {
    return jsonError("Menu item not found", 404);
  }

  await db.menuItem.delete({ where: { id } });
  return jsonSuccess({ ok: true });
}
