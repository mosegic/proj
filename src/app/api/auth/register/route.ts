import { NextRequest } from "next/server";
import db from "@/lib/db";
import {
  assertSessionConfiguration,
  createSession,
  hashPassword,
  setSessionCookie,
} from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import { jsonError, jsonSuccess, parseBody } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  const body = await parseBody<unknown>(request);
  if (!body) return jsonError("Invalid request body");

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Validation failed");
  }

  try {
    assertSessionConfiguration();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Authentication is not configured";
    return jsonError(message, 503);
  }

  const {
    name,
    email,
    password,
    businessName,
    slug,
    description,
    themeColor,
    accentColor,
    logoUrl,
  } = parsed.data;

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return jsonError("Email already registered", 409);
  }

  const existingSlug = await db.restaurant.findUnique({ where: { slug } });
  if (existingSlug) {
    return jsonError("This URL slug is already taken", 409);
  }

  const passwordHash = await hashPassword(password);

  const trialEndsAt = new Date();
  trialEndsAt.setMonth(trialEndsAt.getMonth() + 1);

  const user = await db.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        name,
        email,
        passwordHash,
        restaurants: {
          create: {
            name: businessName,
            slug,
            description: description || null,
            themeColor: themeColor || "#2563eb",
            accentColor: accentColor || "#1e40af",
            logoUrl: logoUrl || null,
          },
        },
      },
      include: { restaurants: true },
    });

    const restaurant = createdUser.restaurants[0];
    if (!restaurant) {
      throw new Error("Restaurant creation failed");
    }

    await tx.subscription.create({
      data: {
        restaurantId: restaurant.id,
        status: "trialing",
        tier: "standard",
        planCode: "free",
        email: createdUser.email,
        trialEndsAt,
      },
    });

    return createdUser;
  });

  const token = await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
  });
  await setSessionCookie(token);

  return jsonSuccess(
    {
      user: { id: user.id, name: user.name, email: user.email },
      restaurant: user.restaurants[0],
    },
    201
  );
}
