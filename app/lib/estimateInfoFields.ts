// Every calculator field that can carry an info (ⓘ) tooltip. Shared by the
// calculator (which pumps each field's key through `info()`) and the Sanity
// schema (which uses it for the "Field" dropdown), so the CMS can add a tooltip
// to ANY field. `value` is the stable key; `title` is the friendly Studio label.
export const INFO_FIELDS: { value: string; title: string }[] = [
  // Extension
  { value: "extType", title: "Extension · Type" },
  { value: "extSize", title: "Extension · Size" },
  { value: "opening", title: "Extension · Structural opening" },
  { value: "roof", title: "Extension · Roof type" },
  { value: "glazing", title: "Extension · Glazing package" },
  { value: "utility", title: "Extension · Utility room" },
  { value: "ufh", title: "Extension · Underfloor heating" },
  { value: "access", title: "Extension · Site access" },
  { value: "complexity", title: "Extension · Construction complexity" },
  { value: "wc", title: "Extension · WCs" },
  { value: "extEnsuite", title: "Extension · Ensuites" },
  { value: "bathroom", title: "Extension · Bathrooms" },
  // Loft
  { value: "loftType", title: "Loft · Type" },
  { value: "bedrooms", title: "Loft · Bedrooms created" },
  { value: "staircase", title: "Loft · Staircase" },
  { value: "joinery", title: "Loft · Built-in joinery" },
  { value: "ac", title: "Loft · Air conditioning" },
  { value: "chimney", title: "Loft · Chimney works" },
  { value: "steel", title: "Loft · Steel complexity" },
  { value: "ensuiteStd", title: "Loft · Standard ensuites" },
  { value: "ensuitePrem", title: "Loft · Premium ensuites" },
  { value: "rlStd", title: "Loft · Standard rooflights" },
  { value: "rlPrem", title: "Loft · Premium rooflights" },
  { value: "rlCabrio", title: "Loft · Cabrio rooflights" },
  // Shared
  { value: "finish", title: "Finish level" },
  { value: "partyWall", title: "Party wall" },
  // Advanced factors
  { value: "conservation", title: "Advanced · Conservation area" },
  { value: "article4", title: "Advanced · Article 4 restriction" },
  { value: "skip", title: "Advanced · Skip permit" },
  { value: "parking", title: "Advanced · Parking suspension" },
  { value: "logistics", title: "Advanced · Difficult site logistics" },
  { value: "smartHome", title: "Advanced · Smart home package" },
  { value: "premElec", title: "Advanced · Premium electrical" },
  { value: "rewire", title: "Advanced · Full house rewire" },
  { value: "heating", title: "Advanced · Heating system upgrade" },
  { value: "boiler", title: "Advanced · Boiler upgrade" },
  { value: "ashp", title: "Advanced · ASHP interface" },
  { value: "basement", title: "Advanced · Basement tie-in" },
  { value: "drainage", title: "Advanced · Complex drainage diversion" },
  { value: "sewer", title: "Advanced · Build over public sewer" },
  { value: "largeSteel", title: "Advanced · Large structural steel" },
  { value: "complexSteel", title: "Advanced · Complex structural steel" },
];
