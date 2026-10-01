import { NextRequest } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { jsonError, jsonSuccess, parseBody } from "@/lib/api-utils";
import { menuItemOptionSchema } from "@/lib/validations";

type RouteParams = { params: Promise<{ id: string; optionId: string }> };

async function getOwnedOption(id: string, optionId: string, userId: string) {
  return db.menuItemOption.findFirst({
    where: {
      id: optionId,
      menuItemId: id,
      menuItem: { category: { restaurant: { ownerId: userId } } },
    },
  });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id, optionId } = await params;
  const option = await getOwnedOption(id, optionId, session.userId);
  if (!option) return jsonError("Menu item option not found", 404);

  const body = await parseBody<unknown>(request);
  const parsed = menuItemOptionSchema.partial().safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Validation failed");
  }

  const updated = await db.menuItemOption.update({
    where: { id: option.id },
    data: parsed.data,
  });
  return jsonSuccess({ option: updated });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id, optionId } = await params;
  const option = await getOwnedOption(id, optionId, session.userId);
  if (!option) return jsonError("Menu item option not found", 404);

  await db.menuItemOption.delete({ where: { id: option.id } });
  return jsonSuccess({ ok: true });
}
