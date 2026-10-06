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

function getLogoDataUri(logoUrl: string) {
  // Never fetch user-controlled URLs from the server; only embed bounded raster data.
  const match = logoUrl.match(
    /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/i
  );
  if (!match) return null;

  const format = match[1].toLowerCase();
  const encoded = match[2];
  const bytes = Buffer.from(encoded, "base64");
  if (
    bytes.length === 0 ||
    bytes.length > 256 * 1024 ||
    bytes.toString("base64") !== encoded
  ) {
    return null;
  }

  const validSignature =
    (format === "png" &&
      bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ||
    (format === "jpeg" &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[bytes.length - 2] === 0xff &&
      bytes[bytes.length - 1] === 0xd9) ||
    (format === "webp" &&
      bytes.toString("ascii", 0, 4) === "RIFF" &&
      bytes.toString("ascii", 8, 12) === "WEBP");

  return validSignature
    ? `data:image/${format};base64,${encoded}`
    : null;
}
