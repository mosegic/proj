import { Resend } from "resend";

let client: Resend | null = null;

function getClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  if (!client) client = new Resend(apiKey);
  return client;
}

function getFromAddress() {
  return process.env.EMAIL_FROM || "MenuSaaS <onboarding@resend.dev>";
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const resend = getClient();
  const { error } = await resend.emails.send({
    from: getFromAddress(),
    to,
    subject: "Reset your MenuSaaS password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #111827;">Reset your password</h2>
        <p style="color: #374151;">
          We received a request to reset the password for your MenuSaaS account.
          Click the button below to choose a new password. This link expires in 1 hour.
        </p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
            Reset Password
          </a>
        </p>
        <p style="color: #6b7280; font-size: 13px;">
          If you didn't request this, you can safely ignore this email — your password will
          not be changed.
        </p>
        <p style="color: #9ca3af; font-size: 12px; word-break: break-all;">${resetUrl}</p>
      </div>
    `,
  });
  if (error) {
    throw new Error(error.message || "Failed to send password reset email");
  }
}
