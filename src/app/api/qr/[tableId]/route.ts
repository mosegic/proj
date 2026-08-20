import { NextRequest } from "next/server";
import QRCode from "qrcode";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getMenuUrl } from "@/lib/tenant";
import { jsonError } from "@/lib/api-utils";

type RouteParams = { params: Promise<{ tableId: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { tableId } = await params;
  const format = request.nextUrl.searchParams.get("format") || "png";

  const table = await db.table.findUnique({
    where: { id: tableId },
    include: { restaurant: true },
  });

  if (!table || table.restaurant.ownerId !== session.userId) {
    return jsonError("Table not found", 404);
  }

  const url = getMenuUrl(table.restaurant.slug, table.tableNumber);
  const color = table.restaurant.themeColor.replace("#", "");

  if (format === "svg") {
    const svg = await QRCode.toString(url, {
      type: "svg",
      margin: 2,
      color: { dark: `#${color}`, light: "#ffffff" },
    });
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  const png = await QRCode.toBuffer(url, {
    type: "png",
    width: 512,
    margin: 2,
    color: { dark: `#${color}`, light: "#ffffff" },
  });

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
