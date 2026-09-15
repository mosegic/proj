import { NextRequest } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getRestaurantTier } from "@/lib/tier-limits";
import { jsonError, jsonSuccess, parseBody } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const body = await parseBody<{
    categoryId?: string;
    menuItemId?: string;
    languageCode?: string;
    name?: string;
    description?: string;
  }>(request);
  if (
    !body?.languageCode ||
    !body.name ||
    (!body.categoryId && !body.menuItemId) ||
    (body.categoryId && body.menuItemId)
  ) {
    return jsonError("Provide one menu resource, languageCode, and name");
  }
  if (!/^[a-z]{2,8}$/.test(body.languageCode)) {
    return jsonError("languageCode must be a lowercase code such as fr or sw");
  }

  const resource = body.categoryId
    ? await db.category.findUnique({
        where: { id: body.categoryId },
        include: { restaurant: true },
      })
    : await db.menuItem.findUnique({
        where: { id: body.menuItemId },
        include: { category: { include: { restaurant: true } } },
      });
  const restaurant = resource
    ? "restaurant" in resource
      ? resource.restaurant
      : resource.category.restaurant
    : null;
  if (!restaurant || restaurant.ownerId !== session.userId) {
    return jsonError("Menu resource not found", 404);
  }
  if ((await getRestaurantTier(restaurant.id)) !== "elite") {
    return jsonError("Multi-language translations are available on the Elite plan", 403);
  }

  if (body.categoryId) {
    const translation = await db.categoryTranslation.upsert({
      where: {
        categoryId_languageCode: {
          categoryId: body.categoryId,
          languageCode: body.languageCode,
        },
      },
      create: {
        categoryId: body.categoryId,
        languageCode: body.languageCode,
        name: body.name,
        description: body.description || null,
      },
      update: { name: body.name, description: body.description || null },
    });
    return jsonSuccess({ translation });
  }

  const translation = await db.menuItemTranslation.upsert({
    where: {
      menuItemId_languageCode: {
        menuItemId: body.menuItemId!,
        languageCode: body.languageCode,
      },
    },
    create: {
      menuItemId: body.menuItemId!,
      languageCode: body.languageCode,
      name: body.name,
      description: body.description || null,
    },
    update: { name: body.name, description: body.description || null },
  });
  return jsonSuccess({ translation });
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const categoryId = request.nextUrl.searchParams.get("categoryId");
  const menuItemId = request.nextUrl.searchParams.get("menuItemId");
  if ((!categoryId && !menuItemId) || (categoryId && menuItemId)) {
    return jsonError("Provide one menu resource");
  }

  const resource = categoryId
    ? await db.category.findUnique({
        where: { id: categoryId },
        include: { restaurant: true, translations: true },
      })
    : await db.menuItem.findUnique({
        where: { id: menuItemId! },
        include: { category: { include: { restaurant: true } }, translations: true },
      });
  if (!resource) return jsonError("Menu resource not found", 404);

  const restaurant = "restaurant" in resource
    ? resource.restaurant
    : resource.category.restaurant;
  if (restaurant.ownerId !== session.userId) {
    return jsonError("Menu resource not found", 404);
  }
  if ((await getRestaurantTier(restaurant.id)) !== "elite") {
    return jsonError("Multi-language translations are available on the Elite plan", 403);
  }

  return jsonSuccess({ translations: resource.translations });
}
