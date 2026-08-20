import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-utils";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      restaurants: {
        select: {
          id: true,
          name: true,
          slug: true,
          themeColor: true,
          logoUrl: true,
        },
      },
    },
  });

  if (!user) return jsonError("User not found", 404);

  return jsonSuccess({ user });
}
