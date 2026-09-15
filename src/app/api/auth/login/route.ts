import { NextRequest } from "next/server";
import db from "@/lib/db";
import {
  assertSessionConfiguration,
  createSession,
  hashPassword,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { jsonError, jsonSuccess, parseBody } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  const body = await parseBody<unknown>(request);
  if (!body) return jsonError("Invalid request body");

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid email or password");
  }

  try {
    assertSessionConfiguration();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Authentication is not configured";
    return jsonError(message, 503);
  }

  const { email, password } = parsed.data;

  let user = await db.user.findUnique({
    where: { email },
    include: { restaurants: true },
  });

  const isDemoCredentials = email === "demo@menusaas.com" && password === "demo1234";
  if (isDemoCredentials && (!user || !user.isDemo)) {
    const passwordHash = await hashPassword(password);
    user = await db.user.upsert({
      where: { email },
      update: { passwordHash, isDemo: true },
      create: {
        name: "Demo Owner",
        email,
        passwordHash,
        isDemo: true,
      },
      include: { restaurants: true },
    });

    if (user.restaurants.length === 0) {
      await db.restaurant.create({
        data: {
          name: "Demo Cafe",
          slug: "demo-cafe",
          description: "A cozy cafe with artisan coffee and fresh pastries",
          ownerId: user.id,
        },
      });
      user = await db.user.findUniqueOrThrow({
        where: { id: user.id },
        include: { restaurants: true },
      });
    }
  }

  if (!user || (!isDemoCredentials && !(await verifyPassword(password, user.passwordHash)))) {
    return jsonError("Invalid email or password", 401);
  }

  const isDemo = user.isDemo || user.email === "demo@menusaas.com";
  if (isDemo && !user.isDemo) {
    await db.user.update({
      where: { id: user.id },
      data: { isDemo: true },
    });
  }

  const token = await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    isDemo,
  });
  await setSessionCookie(token);

  return jsonSuccess({
    user: { id: user.id, name: user.name, email: user.email },
    restaurants: user.restaurants,
  });
}
