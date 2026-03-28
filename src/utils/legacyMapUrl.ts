/** Puna stranica s timovskom Leaflet kartom (`map.html` + `main.js`). */
export function getLegacyMapPageUrl(): string {
  const base = import.meta.env.BASE_URL;
  if (base === '/' || base === '') return '/map.html';
  return base.endsWith('/') ? `${base}map.html` : `${base}/map.html`;
}

export function openLegacyMapPage(): void {
  window.location.assign(getLegacyMapPageUrl());
}
