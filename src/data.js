import Papa from "papaparse";
import csvUrl from "../Geoportal_javna_sportska_igralista.csv?url";
import { imageUrlForObjectType } from "./imageByType.js";

/** Ako vanjski URL padne (blokada, 404…) — ne Picsum, da ne izgleda kao “šuma”. */
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
      <rect fill="#e8eaef" width="640" height="360"/>
      <text x="320" y="180" text-anchor="middle" dominant-baseline="middle" fill="#64748b"
        font-family="system-ui,sans-serif" font-size="15">Nema pregleda slike</text>
    </svg>`
  );

function toNumber(value) {
  const parsed = Number.parseFloat(String(value).trim());
  return Number.isFinite(parsed) ? parsed : null;
}

export async function loadLocationsFromCsv() {
  const csvResponse = await fetch(csvUrl);
  if (!csvResponse.ok) {
    throw new Error("CSV datoteka nije dostupna.");
  }

  const csvText = await csvResponse.text();
  const parseResult = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true
  });

  if (parseResult.errors.length > 0) {
    throw new Error("Greška prilikom parsiranja CSV datoteke.");
  }

  return parseResult.data
    .map((row) => {
      const objectId = Number.parseInt(String(row.OBJECTID).trim(), 10);
      const lat = toNumber(row.Y);
      const lng = toNumber(row.X);

      if (!Number.isFinite(objectId) || lat === null || lng === null) {
        return null;
      }

      return {
        objectId,
        lat,
        lng,
        address: String(row.lokacija ?? "").trim(),
        objectType: String(row.Vrsta_objekta ?? "").trim()
      };
    })
    .filter(Boolean);
}

export async function loadOverlayDatabase() {
  try {
    const response = await fetch("/overlays.json");
    if (!response.ok) {
      return {};
    }

    const data = await response.json();
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

export function mergeLocationsWithOverlayData(locations, overlays) {
  return locations.map((location) => {
    const overlayData = overlays[String(location.objectId)] ?? {};
    const customImage =
      typeof overlayData.imageUrl === "string" && overlayData.imageUrl.trim().length > 0
        ? overlayData.imageUrl.trim()
        : null;

    const typeImage = imageUrlForObjectType(location.objectType);
    const imageUrl = customImage ?? typeImage;

    return {
      ...location,
      imageUrl,
      fallbackImageUrl: PLACEHOLDER_IMAGE
    };
  });
}
