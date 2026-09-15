import { NextRequest } from "next/server";
import QRCode from "qrcode";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getMenuUrl } from "@/lib/tenant";
import { jsonError } from "@/lib/api-utils";
import { getRestaurantTier } from "@/lib/tier-limits";

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

  if (format === "svg") {
    const svg = await QRCode.toString(url, {
      type: "svg",
      margin: 2,
      color: { dark: `#${color}`, light: "#ffffff" },
    });
    const logoDataUri = branded && table.restaurant.logoUrl
      ? await getLogoDataUri(table.restaurant.logoUrl)
      : null;
    const brandedSvg = logoDataUri
      ? svg.replace(
          "</svg>",
          `<rect x="45%" y="45%" width="10%" height="10%" rx="4" fill="#ffffff"/>` +
            `<image href="${logoDataUri}" x="46%" y="46%" width="8%" height="8%" preserveAspectRatio="xMidYMid meet"/>` +
            "</svg>",
        )
      : svg;
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

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  })[character] || character);
}

async function getLogoDataUri(logoUrl: string) {
  if (logoUrl.startsWith("data:image/")) return escapeXml(logoUrl);
  const response = await fetch(logoUrl);
  if (!response.ok) return null;
  const contentType = response.headers.get("content-type") || "image/png";
  if (!contentType.startsWith("image/")) return null;
  const bytes = Buffer.from(await response.arrayBuffer()).toString("base64");
  return `data:${contentType};base64,${bytes}`;
}
