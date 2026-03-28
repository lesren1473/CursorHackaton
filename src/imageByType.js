/**
 * Ilustracije po ključnim riječima iz Vrsta_objekta (CSV).
 * Samo URL-ovi koji stvarno vraćaju sliku (Unsplash imgix 200) — inače preglednik
 * pada na onerror → Picsum koji često izgleda kao šuma.
 */
const W640 = "?w=640&h=360&fit=crop&q=80";

const IMG = {
  streetWorkout: `https://images.unsplash.com/photo-1593079831268-3381b0db4a77${W640}`,
  skate: `https://images.unsplash.com/photo-1578662996442-48f60103fc96${W640}`,
  tableTennis: `https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa${W640}`,
  dogPark: `https://images.unsplash.com/photo-1558929996-da64ba858215${W640}`,
  beachVolleyball: `https://images.unsplash.com/photo-1612872087720-bb876e2e67d1${W640}`,
  runningTrack: `https://images.unsplash.com/photo-1476480862126-209bfaa8edc8${W640}`,
  outdoorGym: `https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b${W640}`,
  smallSoccer: `https://images.unsplash.com/photo-1574629810360-7efbbe195018${W640}`,
  basketball: `https://images.unsplash.com/photo-1546519638-68e109498ffc${W640}`,
  soccer: `https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d${W640}`,
  bocce:
    "https://i.pinimg.com/736x/14/4d/3f/144d3f086cae1134cf2c5f20fa2446f0.jpg",
  playground:
    "https://i.pinimg.com/1200x/f6/97/56/f697565302021c778a95802271cc68a6.jpg",
  /** Vježbalište za odrasle (ostala vježbališta ostaju exerciseBars). */
  adultFitness:
    "https://i.pinimg.com/1200x/d6/13/91/d61391a62403b138d72833fbb32cb2d9.jpg",
  exerciseBars: `https://images.unsplash.com/photo-1517836357463-d25dfeac3438${W640}`,
  multiPurpose: `https://images.unsplash.com/photo-1579952363873-27f3bade9f55${W640}`,
  grassField: `https://images.unsplash.com/photo-1574629810360-7efbbe195018${W640}`,
  asphaltCourt: `https://images.unsplash.com/photo-1546519638-68e109498ffc${W640}`,
  chessOutdoor: `https://images.unsplash.com/photo-1589829545856-d10d557cf95f${W640}`,
  squash: `https://images.unsplash.com/photo-1626224583764-f87db24ac4ea${W640}`,
  defaultPitch: `https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d${W640}`
};

/** Normalizacija za usporedbu (hr. dijakritici → ASCII). */
export function normalizeForMatch(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/dž/gi, "dz")
    .replace(/lj/g, "lj")
    .replace(/nj/g, "nj")
    .replace(/đ/g, "dj")
    .replace(/[čć]/g, "c")
    .replace(/š/g, "s")
    .replace(/ž/g, "z");
}

/**
 * Redoslijed pravila: specifičnije prije općenitijeg.
 * @param {string} objectType Vrsta_objekta iz CSV-a
 */
export function imageUrlForObjectType(objectType) {
  const n = normalizeForMatch(objectType);
  const rules = [
    ["street workout", IMG.streetWorkout],
    ["skate park", IMG.skate],
    ["skate", IMG.skate],
    ["stolni tenis", IMG.tableTennis],
    ["park za pse", IMG.dogPark],
    ["istrcavanje pasa", IMG.dogPark],
    ["odbojka", IMG.beachVolleyball],
    ["skvos", IMG.squash],
    ["sah na travi", IMG.chessOutdoor],
    ["trim staza", IMG.runningTrack],
    ["teretana", IMG.outdoorGym],
    ["malonogomet", IMG.smallSoccer],
    ["mali nogomet", IMG.smallSoccer],
    ["kosarka", IMG.basketball],
    ["nogomet", IMG.soccer],
    ["bocaliste", IMG.bocce],
    ["djecje", IMG.playground],
    ["vjezbaliste za odrasle", IMG.adultFitness],
    ["vjezbaliste", IMG.exerciseBars],
    ["sprave", IMG.exerciseBars],
    ["polivalentno asfaltirano", IMG.asphaltCourt],
    ["polivalentno", IMG.multiPurpose],
    ["travnato", IMG.grassField],
    ["sportsko-rekreacijsko", IMG.multiPurpose],
    ["sportsko", IMG.defaultPitch]
  ];

  for (const [needle, url] of rules) {
    if (n.includes(needle)) return url;
  }
  return IMG.defaultPitch;
}
