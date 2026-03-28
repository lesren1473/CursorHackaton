export type CsvLocationRow = {
  objectId: number;
  lat: number;
  lng: number;
  address: string;
  objectType: string;
};

export function loadLocationsFromCsv(): Promise<CsvLocationRow[]>;

export function loadOverlayDatabase(): Promise<Record<string, unknown>>;

export function mergeLocationsWithOverlayData(
  locations: unknown[],
  overlays: Record<string, unknown>,
): unknown[];
