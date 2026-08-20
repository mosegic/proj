import { NextRequest } from "next/server";
import db from "@/lib/db";
import { jsonError, jsonSuccess } from "@/lib/api-utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const restaurant = await db.restaurant.findUnique({
    where: { slug, isActive: true },
    include: {
      categories: {
        where: { isVisible: true },
        orderBy: { sortOrder: "asc" },
        include: {
          items: {
            where: { isVisible: true },
            orderBy: { sortOrder: "asc" },
            include: { options: true },
          },
        },
      },
    },
  });

  if (!restaurant) return jsonError("Restaurant not found", 404);

  return jsonSuccess({ restaurant });
}
