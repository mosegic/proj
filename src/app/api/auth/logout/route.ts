import { clearSessionCookie } from "@/lib/auth";
import { jsonSuccess } from "@/lib/api-utils";

export async function POST() {
  await clearSessionCookie();
  return jsonSuccess({ ok: true });
}
