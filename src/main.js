import "leaflet/dist/leaflet.css";
import "./styles.css";

import { createMap } from "./map.js";
import {
  loadLocationsFromCsv,
  loadOverlayDatabase,
  mergeLocationsWithOverlayData
} from "./data.js";

const app = document.querySelector("#app");

app.innerHTML = `
  <main class="page">
    <section class="map-shell">
      <header class="map-header">
        <h1>Javna sportska igralista - Zagreb</h1>
        <p id="status" class="status">Učitavanje lokacija…</p>
      </header>
      <div id="map" class="map"></div>

      <aside id="pin-overlay" class="pin-overlay hidden" aria-live="polite">
        <button id="close-overlay" class="close-overlay" aria-label="Zatvori">×</button>
        <img id="overlay-image" alt="Prikaz igralista" />
        <h2 id="overlay-address"></h2>
        <p>
          <strong>Tip igralista:</strong>
          <span id="overlay-type"></span>
        </p>
      </aside>
    </section>
  </main>
`;

const statusElement = document.querySelector("#status");
const overlayElement = document.querySelector("#pin-overlay");
const closeOverlayButton = document.querySelector("#close-overlay");
const overlayImage = document.querySelector("#overlay-image");
const overlayAddress = document.querySelector("#overlay-address");
const overlayType = document.querySelector("#overlay-type");

function closeOverlay() {
  overlayElement.classList.add("hidden");
}

function openOverlay(location) {
  overlayImage.onerror = () => {
    overlayImage.onerror = null;
    if (location.fallbackImageUrl) {
      overlayImage.src = location.fallbackImageUrl;
    }
  };
  overlayImage.src = location.imageUrl;
  overlayAddress.textContent = location.address || "Adresa nije dostupna";
  overlayType.textContent = location.objectType || "Nije navedeno";
  overlayElement.classList.remove("hidden");
}

closeOverlayButton.addEventListener("click", closeOverlay);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeOverlay();
  }
});

overlayElement.addEventListener("click", (event) => {
  if (event.target === overlayElement) {
    closeOverlay();
  }
});

async function bootstrap() {
  try {
    const [locations, overlays] = await Promise.all([
      loadLocationsFromCsv(),
      loadOverlayDatabase()
    ]);
    const mappedLocations = mergeLocationsWithOverlayData(locations, overlays);

    createMap("map", mappedLocations, openOverlay);
    statusElement.textContent = `Učitano lokacija: ${mappedLocations.length}`;
  } catch (error) {
    statusElement.textContent =
      "Dogodila se greška pri učitavanju podataka. Provjeri format CSV datoteke.";
    console.error(error);
  }
}

bootstrap();
