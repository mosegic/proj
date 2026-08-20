import { NextRequest } from "next/server";
import db from "@/lib/db";
import {
  createSession,
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

  const { email, password } = parsed.data;

  const user = await db.user.findUnique({
    where: { email },
    include: { restaurants: true },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return jsonError("Invalid email or password", 401);
  }

  const token = await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
  });
  await setSessionCookie(token);

  return jsonSuccess({
    user: { id: user.id, name: user.name, email: user.email },
    restaurants: user.restaurants,
  });
}
