import { NextRequest } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { jsonError, jsonSuccess, parseBody } from "@/lib/api-utils";
import {
  menuItemOptionSchema,
  reorderMenuItemOptionsSchema,
} from "@/lib/validations";

type RouteParams = { params: Promise<{ id: string }> };

async function getOwnedMenuItem(id: string, userId: string) {
  return db.menuItem.findFirst({
    where: { id, category: { restaurant: { ownerId: userId } } },
    select: { id: true },
  });
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await params;
  const item = await getOwnedMenuItem(id, session.userId);
  if (!item) return jsonError("Menu item not found", 404);

  const body = await parseBody<unknown>(request);
  const parsed = menuItemOptionSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Validation failed");
  }

  const maxOrder = await db.menuItemOption.aggregate({
    where: { menuItemId: id },
    _max: { sortOrder: true },
  });
  const option = await db.menuItemOption.create({
    data: {
      ...parsed.data,
      menuItemId: id,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  return jsonSuccess({ option }, 201);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await params;
  const item = await getOwnedMenuItem(id, session.userId);
  if (!item) return jsonError("Menu item not found", 404);

  const body = await parseBody<unknown>(request);
  const parsed = reorderMenuItemOptionsSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Validation failed");
  }

  const { optionIds } = parsed.data;
  if (new Set(optionIds).size !== optionIds.length) {
    return jsonError("Option order contains duplicate IDs");
  }

  const options = await db.menuItemOption.findMany({
    where: { menuItemId: id },
    select: { id: true },
  });
  if (
    options.length !== optionIds.length ||
    options.some(({ id: optionId }) => !optionIds.includes(optionId))
  ) {
    return jsonError("Option list has changed. Reload and try again.", 409);
  }

  await db.$transaction(
    optionIds.map((optionId, sortOrder) =>
      db.menuItemOption.update({
        where: { id: optionId },
        data: { sortOrder },
      }),
    ),
  );

  return jsonSuccess({ ok: true });
}
