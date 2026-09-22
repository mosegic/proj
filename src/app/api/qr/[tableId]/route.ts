import { NextRequest } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-utils";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await params;
  const table = await db.table.findUnique({
    where: { id },
    include: { restaurant: true },
  });

  if (!table || table.restaurant.ownerId !== session.userId) {
    return jsonError("Table not found", 404);
  }

  await db.table.delete({ where: { id } });
  return jsonSuccess({ ok: true });
}
