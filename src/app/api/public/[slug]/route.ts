import { NextRequest } from "next/server";
import db from "@/lib/db";
import { jsonError, jsonSuccess } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const languageCode = request.nextUrl.searchParams.get("lang")?.trim().toLowerCase();

  const restaurant = await db.restaurant.findUnique({
    where: { slug, isActive: true },
    include: {
      categories: {
        where: { isVisible: true },
        orderBy: { sortOrder: "asc" },
        include: {
          translations: languageCode
            ? { where: { languageCode } }
            : undefined,
          items: {
            where: { isVisible: true },
            orderBy: { sortOrder: "asc" },
            include: {
              options: true,
              translations: languageCode
                ? { where: { languageCode } }
                : undefined,
            },
          },
        },
      },
    },
  });

  if (!restaurant) return jsonError("Restaurant not found", 404);

  return jsonSuccess({ restaurant });
}
