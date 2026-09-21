import { NextRequest } from "next/server";
import db from "@/lib/db";
import { generatePasswordResetToken, PASSWORD_RESET_TOKEN_TTL_MS } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { forgotPasswordSchema } from "@/lib/validations";
import { jsonError, jsonSuccess, parseBody } from "@/lib/api-utils";

// Always return the same generic success response, whether or not the email
// is registered, so this endpoint cannot be used to enumerate accounts.
const GENERIC_RESPONSE = {
  message: "If an account exists for that email, a password reset link has been sent.",
};

export async function POST(request: NextRequest) {
  const body = await parseBody<unknown>(request);
  if (!body) return jsonError("Invalid request body");

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Validation failed");
  }
  const { email } = parsed.data;

  const user = await db.user.findUnique({ where: { email } });

  if (user && !user.isDemo) {
    const { token, tokenHash } = generatePasswordResetToken();
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS),
      },
    });

    const resetUrl = new URL(
      `/reset-password?token=${token}`,
      process.env.NEXT_PUBLIC_APP_URL || request.url,
    ).toString();

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (error) {
      // Log for operational visibility, but still return the generic
      // response below — surfacing send failures here would let an
      // attacker distinguish registered emails from unregistered ones.
      console.error("Failed to send password reset email", {
        userId: user.id,
        message: error instanceof Error ? error.message : error,
      });
    }
  }

  return jsonSuccess(GENERIC_RESPONSE);
}
