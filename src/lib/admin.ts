import { getSession } from "@/lib/auth";

export function isAdminEmail(email: string) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(adminEmail && email.toLowerCase() === adminEmail);
}

export async function getAdminSession() {
  const session = await getSession();
  if (!session || !isAdminEmail(session.email)) return null;
  return session;
}
