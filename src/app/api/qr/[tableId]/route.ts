import { NextRequest } from "next/server";
import QRCode from "qrcode";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getMenuUrl } from "@/lib/tenant";
import { jsonError } from "@/lib/api-utils";
import { getRestaurantTier } from "@/lib/tier-limits";
import { overlayCenteredLogo, qrRenderOptions } from "@/lib/qr";

type RouteParams = { params: Promise<{ tableId: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { tableId } = await params;
  const format = request.nextUrl.searchParams.get("format") || "png";
  const branded = request.nextUrl.searchParams.get("branded") === "elite";

  const table = await db.table.findUnique({
    where: { id: tableId },
    include: { restaurant: true },
  });

  if (!table || table.restaurant.ownerId !== session.userId) {
    return jsonError("Table not found", 404);
  }

  const url = getMenuUrl(table.restaurant.slug, table.tableNumber);
  const color = table.restaurant.themeColor.replace("#", "");
  if (branded && (await getRestaurantTier(table.restaurant.id)) !== "elite") {
    return jsonError("Branded QR codes are available on the Elite plan", 403);
  }

  const renderOptions = qrRenderOptions(color, branded);
  const logoDataUri =
    branded && table.restaurant.logoUrl
      ? await getLogoDataUri(table.restaurant.logoUrl)
      : null;

  if (format === "svg") {
    const svg = await QRCode.toString(url, {
      type: "svg",
      ...renderOptions,
    });
    const brandedSvg = logoDataUri ? overlayCenteredLogo(svg, logoDataUri) : svg;
    return new Response(brandedSvg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  const png = await QRCode.toBuffer(url, {
    type: "png",
    width: 512,
    ...renderOptions,
  });

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

async function getLogoDataUri(logoUrl: string) {
  if (logoUrl.startsWith("data:image/")) return logoUrl;
  const response = await fetch(logoUrl);
  if (!response.ok) return null;
  const contentType = response.headers.get("content-type") || "image/png";
  if (!contentType.startsWith("image/")) return null;
  const bytes = Buffer.from(await response.arrayBuffer()).toString("base64");
  return `data:${contentType};base64,${bytes}`;
}
