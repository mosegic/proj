import { NextRequest } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { tableSchema } from "@/lib/validations";
import { jsonError, jsonSuccess, parseBody } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const restaurantId = request.nextUrl.searchParams.get("restaurantId");
  if (!restaurantId) return jsonError("restaurantId required");

  const restaurant = await db.restaurant.findFirst({
    where: { id: restaurantId, ownerId: session.userId },
  });
  if (!restaurant) return jsonError("Restaurant not found", 404);

  const tables = await db.table.findMany({
    where: { restaurantId },
    orderBy: { tableNumber: "asc" },
  });

  return jsonSuccess({ tables, slug: restaurant.slug });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const body = await parseBody<{ restaurantId: string } & Record<string, unknown>>(request);
  if (!body?.restaurantId) return jsonError("restaurantId required");

  const restaurant = await db.restaurant.findFirst({
    where: { id: body.restaurantId, ownerId: session.userId },
  });
  if (!restaurant) return jsonError("Restaurant not found", 404);

  const parsed = tableSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Validation failed");
  }

  const existing = await db.table.findUnique({
    where: {
      restaurantId_tableNumber: {
        restaurantId: body.restaurantId,
        tableNumber: parsed.data.tableNumber,
      },
    },
  });
  if (existing) {
    return jsonError("Table number already exists", 409);
  }

  const table = await db.table.create({
    data: {
      label: parsed.data.label,
      tableNumber: parsed.data.tableNumber,
      restaurantId: body.restaurantId,
    },
  });

  return jsonSuccess({ table, slug: restaurant.slug }, 201);
}
