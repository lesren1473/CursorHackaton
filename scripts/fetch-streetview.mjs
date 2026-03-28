/**
 * Jednokratno preuzimanje Street View slika u public/media/sv-{OBJECTID}.jpg
 * i ažuriranje public/overlays.json (imageUrl). Zahtijeva isti API ključ kao u .env.
 *
 * Pokretanje: npm run fetch-streetview
 */
import "dotenv/config";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Papa from "papaparse";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

/** Serverski ključ (bez samo referrer ograničenja). Inače Google vraća REQUEST_DENIED iz Nodea. */
const apiKey =
  process.env.GOOGLE_STREETVIEW_SERVER_KEY?.trim() ||
  process.env.VITE_GOOGLE_STREETVIEW_API_KEY?.trim() ||
  process.env.GOOGLE_STREETVIEW_API_KEY?.trim();

if (!apiKey) {
  console.error(
    "Nedostaje ključ: u .env postavi GOOGLE_STREETVIEW_SERVER_KEY (preporuka za ovu skriptu) ili VITE_GOOGLE_STREETVIEW_API_KEY."
  );
  process.exit(1);
}

const csvPath = join(root, "Geoportal_javna_sportska_igralista.csv");
const overlaysPath = join(root, "public", "overlays.json");
const mediaDir = join(root, "public", "media");

function toNumber(value) {
  const parsed = Number.parseFloat(String(value).trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function headingForObjectId(objectId) {
  return (objectId * 53 + 17) % 360;
}

function buildStaticUrl(lat, lng, objectId) {
  const h = headingForObjectId(objectId);
  const params = new URLSearchParams({
    size: "640x360",
    location: `${lat},${lng}`,
    fov: "75",
    pitch: "0",
    heading: String(h),
    key: apiKey
  });
  return `https://maps.googleapis.com/maps/api/streetview?${params.toString()}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const csvText = readFileSync(csvPath, "utf8");
const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
if (parsed.errors.length > 0) {
  console.error(parsed.errors);
  process.exit(1);
}

mkdirSync(mediaDir, { recursive: true });

let overlays = {};
if (existsSync(overlaysPath)) {
  try {
    overlays = JSON.parse(readFileSync(overlaysPath, "utf8"));
  } catch {
    overlays = {};
  }
}

const rows = parsed.data
  .map((row) => {
    const objectId = Number.parseInt(String(row.OBJECTID).trim(), 10);
    const lat = toNumber(row.Y);
    const lng = toNumber(row.X);
    if (!Number.isFinite(objectId) || lat === null || lng === null) return null;
    return { objectId, lat, lng };
  })
  .filter(Boolean);

let ok = 0;
let skipped = 0;
const delayMs = 280;

for (let i = 0; i < rows.length; i++) {
  const { objectId, lat, lng } = rows[i];
  const metaUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&key=${apiKey}`;
  try {
    const metaRes = await fetch(metaUrl);
    const meta = await metaRes.json();
    if (meta.status !== "OK") {
      if (meta.status === "REQUEST_DENIED" && i === 0) {
        console.error("Google:", meta.error_message ?? "(nema error_message)");
        console.error(`
Skripta poziva API iz Nodea, ne iz preglednika. Ključ ograničen samo na "HTTP referrers"
neće raditi.

Što napraviti:
1. Google Cloud → APIs → uključi "Street View Static API" (i billing ako traži).
2. Napravi DRUGI API ključ za skriptu: Application restrictions = IP adrese (tvoj javni IP)
   ili privremeno "None", NE samo "HTTP referrers".
3. U .env stavi: GOOGLE_STREETVIEW_SERVER_KEY=... (za npm run fetch-streetview)
   a VITE_... ostavi s referrerom za npm run dev.
`);
        process.exit(1);
      }
      console.warn(`#${objectId}: metadata ${meta.status}${meta.error_message ? ` – ${meta.error_message}` : ""}`);
      skipped += 1;
      await sleep(delayMs);
      continue;
    }

    const imgUrl = buildStaticUrl(lat, lng, objectId);
    const imgRes = await fetch(imgUrl);
    if (!imgRes.ok) {
      console.warn(`#${objectId}: static HTTP ${imgRes.status}`);
      skipped += 1;
      await sleep(delayMs);
      continue;
    }

    const buf = Buffer.from(await imgRes.arrayBuffer());
    const outPath = join(mediaDir, `sv-${objectId}.jpg`);
    writeFileSync(outPath, buf);

    const key = String(objectId);
    const prev = overlays[key] && typeof overlays[key] === "object" ? overlays[key] : {};
    overlays[key] = { ...prev, imageUrl: `/media/sv-${objectId}.jpg` };
    ok += 1;
    process.stdout.write(`\rPreuzeto ${ok}/${rows.length}`);
  } catch (err) {
    console.warn(`\n#${objectId}:`, err.message);
    skipped += 1;
  }
  await sleep(delayMs);
}

writeFileSync(overlaysPath, JSON.stringify(overlays, null, 2), "utf8");
console.log(`\nGotovo. Uspješno: ${ok}, preskočeno: ${skipped}. Ažurirano: public/overlays.json`);
