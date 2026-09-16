import { randomBytes } from "node:crypto";
import { NextRequest } from "next/server";
import db from "@/lib/db";
import { getAdminSession } from "@/lib/admin";
import { hashPassword } from "@/lib/auth";
import { jsonError, jsonSuccess, parseBody } from "@/lib/api-utils";

function createSlug(name: string) {
  const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return base || "test-restaurant";
}

async function uniqueSlug(name: string) {
  const base = createSlug(name);
  let slug = base;
  let suffix = 2;
  while (await db.restaurant.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

export async function GET() {
  if (!(await getAdminSession())) return jsonError("Forbidden", 403);

  const users = await db.user.findMany({
    where: { isDemo: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      restaurants: { select: { name: true, slug: true } },
    },
  });
  return jsonSuccess({ users });
}

export async function POST(request: NextRequest) {
  if (!(await getAdminSession())) return jsonError("Forbidden", 403);

  const body = await parseBody<{ name?: string; email?: string; restaurantName?: string }>(request);
  const name = body?.name?.trim();
  const email = body?.email?.trim().toLowerCase();
  const restaurantName = body?.restaurantName?.trim() || `${name || "Test"} Restaurant`;

  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonError("Provide a name and valid email address");
  }

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return jsonError("A user with that email already exists", 409);

  const password = randomBytes(12).toString("base64url");
  const passwordHash = await hashPassword(password);
  const slug = await uniqueSlug(restaurantName);

  const result = await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email, passwordHash, isDemo: true },
    });
    const restaurant = await tx.restaurant.create({
      data: {
        name: restaurantName,
        slug,
        ownerId: user.id,
        description: "Personalized Elite testing account",
      },
    });
    return { user, restaurant };
  });

  return jsonSuccess({
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      restaurant: { name: result.restaurant.name, slug: result.restaurant.slug },
    },
    password,
  }, 201);
}
