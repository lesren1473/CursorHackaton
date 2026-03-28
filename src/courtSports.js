/** Sportovi za polivalentna / nejasna igrališta (prema zahtjevu). */
export const POLIVALENT_SPORTS = [
  "Nogomet",
  "Košarka",
  "Odbojka",
  "Rukomet",
  "Badminton"
];

/**
 * Predloženi tipovi sporta za kreiranje termina, prema opisu igrališta (Vrsta_objekta).
 * Polivalentno → fiksni skup od 5 sportova. Inače kombinacija ključnih riječi u nizu.
 */
export function getSuggestedSportsForCourtType(objectType) {
  const t = String(objectType ?? "").toLowerCase();

  if (t.includes("polivalentno")) {
    return [...POLIVALENT_SPORTS];
  }

  const out = new Set();

  if (t.includes("košarkaško") && t.includes("nogometno")) {
    out.add("Košarka");
    out.add("Nogomet");
  } else if (t.includes("košarkaško")) {
    out.add("Košarka");
  }

  if (t.includes("malonogometno") || t.includes("mali nogomet")) {
    out.add("Nogomet");
  }

  if (t.includes("travnato sportsko")) {
    out.add("Nogomet");
  }

  if (t.includes("stolni tenis")) {
    out.add("Stolni tenis");
  }

  if (t.includes("boćalište") || t.includes("boće")) {
    out.add("Boće");
  }

  if (t.includes("street workout")) {
    out.add("Street workout");
  }

  if (t.includes("skate")) {
    out.add("Skateboarding");
  }

  if (t.includes("vježbalište") || t.includes("sprave") || t.includes("teretana")) {
    out.add("Grupni trening");
    out.add("Kalistenika");
  }

  if (t.includes("odbojka na pijesku") || t.includes("igralište za odbojku")) {
    out.add("Odbojka na pijesku");
  } else if (t.includes("odbojka")) {
    out.add("Odbojka");
  }

  if (t.includes("skvoš") || t.includes("squash")) {
    out.add("Skvoš");
  }

  if (t.includes("šah na travi")) {
    out.add("Šah na travi");
  }

  if (t.includes("trim staza")) {
    out.add("Trčanje");
  }

  if (t.includes("park za pse")) {
    out.add("Šetnja / igra s psom");
  }

  if (t.includes("nogomet") && !t.includes("malonogometno") && !t.includes("nogometno")) {
    out.add("Nogomet");
  }

  if (out.size > 0) {
    return [...out];
  }

  if (
    t.includes("sportsko-rekreacijsko") ||
    t.includes("sportsko igralište") ||
    t.includes("dječje igralište")
  ) {
    return [...POLIVALENT_SPORTS];
  }

  return [...POLIVALENT_SPORTS];
}
