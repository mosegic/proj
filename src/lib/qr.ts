import type { QRCodeToBufferOptions, QRCodeToStringOptions } from "qrcode";

/** ISO/IEC 18004 quiet zone: four blank modules on every side. */
export const QR_QUIET_ZONE_MODULES = 4;

/**
 * Logo coverage stays at the conservative end of the 20–30% area range so
 * error correction (level H recovers up to 30%) still has headroom for print
 * damage and camera noise.
 */
export const MAX_LOGO_AREA_RATIO = 0.2;

const FINDER_PATTERN_MODULES = 7;
const FINDER_SEPARATOR_MODULES = 1;
const FINDER_CLEARANCE_MODULES = 1;

export function qrRenderOptions(
  colorHex: string,
  branded: boolean,
): Pick<QRCodeToStringOptions & QRCodeToBufferOptions, "margin" | "errorCorrectionLevel" | "color"> {
  return {
    margin: QR_QUIET_ZONE_MODULES,
    errorCorrectionLevel: branded ? "H" : "M",
    color: { dark: `#${colorHex}`, light: "#ffffff" },
  };
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

export function overlayCenteredLogo(
  svg: string,
  logoDataUri: string,
  quietZoneModules = QR_QUIET_ZONE_MODULES,
) {
  const match = svg.match(/viewBox="0 0 ([0-9.]+) ([0-9.]+)"/);
  if (!match) return svg;

  const total = Number(match[1]);
  const moduleCount = total - quietZoneModules * 2;
  if (moduleCount <= 0) return svg;

  const maxFromArea = Math.sqrt(MAX_LOGO_AREA_RATIO) * moduleCount;
  const finderReserve =
    FINDER_PATTERN_MODULES + FINDER_SEPARATOR_MODULES + FINDER_CLEARANCE_MODULES;
  const maxFromFinders = moduleCount - 2 * finderReserve;
  const logoSize = Math.min(maxFromArea, maxFromFinders);
  if (logoSize <= 0) return svg;

  const x = (total - logoSize) / 2;
  const y = (total - logoSize) / 2;
  const inset = logoSize * 0.08;
  const href = escapeXml(logoDataUri);
  const overlay =
    `<rect x="${x}" y="${y}" width="${logoSize}" height="${logoSize}" rx="${logoSize * 0.08}" fill="#ffffff"/>` +
    `<image href="${href}" x="${x + inset}" y="${y + inset}" width="${logoSize - inset * 2}" height="${logoSize - inset * 2}" preserveAspectRatio="xMidYMid meet"/>`;

  return svg.replace("</svg>", `${overlay}</svg>`);
}
