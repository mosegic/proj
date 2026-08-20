import { NextRequest } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";
import { jsonError, jsonSuccess, parseBody } from "@/lib/api-utils";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await params;
  const category = await db.category.findUnique({
    where: { id },
    include: { restaurant: true },
  });

  if (!category || category.restaurant.ownerId !== session.userId) {
    return jsonError("Category not found", 404);
  }

  const body = await parseBody<Record<string, unknown>>(request);
  const parsed = categorySchema.partial().safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Validation failed");
  }

  const updated = await db.category.update({
    where: { id },
    data: parsed.data,
  });

  return jsonSuccess({ category: updated });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await params;
  const category = await db.category.findUnique({
    where: { id },
    include: { restaurant: true },
  });

  if (!category || category.restaurant.ownerId !== session.userId) {
    return jsonError("Category not found", 404);
  }

  await db.category.delete({ where: { id } });
  return jsonSuccess({ ok: true });
}
