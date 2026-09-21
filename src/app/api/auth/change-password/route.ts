import { NextRequest } from "next/server";
import db from "@/lib/db";
import { getSession, hashPassword, verifyPassword } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validations";
import { jsonError, jsonSuccess, parseBody } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const body = await parseBody<unknown>(request);
  if (!body) return jsonError("Invalid request body");

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Validation failed");
  }
  const { currentPassword, newPassword } = parsed.data;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, passwordHash: true, isDemo: true },
  });
  if (!user) return jsonError("User not found", 404);
  if (user.isDemo) {
    return jsonError("Demo accounts cannot change their password", 403);
  }

  const isValid = await verifyPassword(currentPassword, user.passwordHash);
  if (!isValid) {
    return jsonError("Current password is incorrect", 401);
  }
  if (currentPassword === newPassword) {
    return jsonError("New password must be different from the current password");
  }

  const passwordHash = await hashPassword(newPassword);
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return jsonSuccess({ success: true });
}
