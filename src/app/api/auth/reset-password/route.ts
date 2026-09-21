import { NextRequest } from "next/server";
import db from "@/lib/db";
import { hashPassword, hashPasswordResetToken } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validations";
import { jsonError, jsonSuccess, parseBody } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  const body = await parseBody<unknown>(request);
  if (!body) return jsonError("Invalid request body");

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Validation failed");
  }
  const { token, newPassword } = parsed.data;

  const tokenHash = hashPasswordResetToken(token);
  const resetToken = await db.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.expiresAt.getTime() < Date.now()
  ) {
    return jsonError("This password reset link is invalid or has expired.", 400);
  }

  const passwordHash = await hashPassword(newPassword);

  await db.$transaction([
    db.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    db.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    // Invalidate any other outstanding reset tokens for this user once one
    // has been successfully used.
    db.passwordResetToken.updateMany({
      where: { userId: resetToken.userId, usedAt: null, id: { not: resetToken.id } },
      data: { usedAt: new Date() },
    }),
  ]);

  return jsonSuccess({ email: resetToken.user.email });
}
