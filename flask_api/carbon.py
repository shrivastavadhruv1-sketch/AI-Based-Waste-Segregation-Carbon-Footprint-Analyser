"""
carbon.py — Material-Aware CO₂ Emission Calculator
====================================================
Plugs into the Flask /predict pipeline as a post-processing step.
Does NOT touch the ML model or prediction logic.

Usage:
    from carbon import calculate_carbon

    result = calculate_carbon(
        waste_type  = "Recyclable",   # model's top_class
        confidence  = 0.87,           # 0–1 float
        hint        = "plastic bottle",  # optional: filename or user label
        weight_kg   = 1.0             # kg of waste (default 1; Node applies real weight at save)
    )
    # → {emissionFactor, carbonSaved, subMaterial, basis, unit}
"""

# ---------------------------------------------------------------------------
# 1.  EMISSION FACTOR TABLE
#     Values represent kg CO₂ saved per kg of waste when properly handled
#     vs. sending to landfill/incineration.
#     Sources: IPCC AR6, EPA WARM model, UK DEFRA conversion factors 2023.
# ---------------------------------------------------------------------------

EMISSION_FACTORS: dict[str, float] = {
    # ── Recyclable sub-materials ──────────────────────────────────────────
    "Plastic":          1.80,   # mixed plastics (virgin production avoided)
    "PET":              1.50,   # PET bottles (polyethylene terephthalate)
    "HDPE":             1.40,   # HDPE containers
    "PVC":              2.10,   # PVC (chlorine processing avoided)
    "Glass":            0.30,   # low-energy recovery
    "Aluminium":        8.14,   # highest-impact — smelting avoidance
    "Metal":            2.50,   # generic metals (steel/iron)
    "Steel":            1.46,   # steel specifically
    "Paper":            1.10,   # virgin pulp production avoided
    "Cardboard":        0.95,   # corrugated cardboard
    "Textile":          3.30,   # fast-fashion textile landfill avoidance
    "E-Waste":          3.50,   # electronic waste (rare metal recovery)
    "Rubber":           1.50,   # tyre/rubber recycling

    # ── Biodegradable sub-materials ───────────────────────────────────────
    "Food":             0.60,   # methane avoidance through composting
    "Organic":          0.50,   # general organics
    "Garden":           0.40,   # leaves, grass clippings
    "Wood":             0.90,   # wood → biomass / mulch

    # ── Hazardous sub-materials ───────────────────────────────────────────
    "Battery":          2.10,   # lithium/lead-acid safe disposal
    "Chemical":         3.20,   # solvents, acids
    "Medical":          4.00,   # biomedical/sharps
    "Paint":            2.80,   # VOC avoidance
    "Oil":              2.40,   # motor oil / lubricants

    # ── Category-level fallbacks (model's 3 raw classes) ─────────────────
    "Recyclable":       1.20,
    "Biodegradable":    0.50,
    "Hazardous":        2.00,
}

# ---------------------------------------------------------------------------
# 2.  KEYWORD → SUB-MATERIAL MAPPING
#     Checked against the hint string (filename, label, or user input).
#     Longer/more-specific strings are tried via substring match.
#     Order matters: more specific entries should come first in the dict.
# ---------------------------------------------------------------------------

MATERIAL_KEYWORDS: dict[str, list[str]] = {
    # Recyclable
    "Aluminium":    ["aluminium", "aluminum", "foil", "cans", "soda can", "beer can"],
    "PET":          ["pet bottle", "polyethylene terephthalate", "water bottle"],
    "HDPE":         ["hdpe", "milk jug", "detergent bottle"],
    "PVC":          ["pvc", "vinyl", "pipe"],
    "Plastic":      ["plastic", "bottle", "bag", "wrap", "polystyrene", "styrofoam", "pvc", "nylon"],
    "Steel":        ["steel", "iron", "tin can", "tin"],
    "Metal":        ["metal", "copper", "brass", "scrap metal"],
    "Glass":        ["glass", "jar", "window pane", "mirror"],
    "Cardboard":    ["cardboard", "carton", "box", "corrugated"],
    "Paper":        ["paper", "newspaper", "magazine", "book", "notebook"],
    "Textile":      ["cloth", "textile", "fabric", "shirt", "jeans", "clothing"],
    "E-Waste":      ["electronic", "phone", "laptop", "computer", "circuit", "cable",
                     "charger", "keyboard", "monitor", "tv", "television"],
    "Rubber":       ["rubber", "tyre", "tire", "hose"],

    # Biodegradable
    "Food":         ["food", "vegetable", "fruit", "banana", "apple", "egg", "meat",
                     "bread", "rice", "kitchen waste", "leftover"],
    "Garden":       ["garden", "grass", "leaves", "branch", "plant", "flower"],
    "Wood":         ["wood", "timber", "plank", "sawdust", "stick"],
    "Organic":      ["organic", "compost", "peel", "manure"],

    # Hazardous
    "Medical":      ["medical", "syringe", "needle", "medicine", "pill", "medication",
                     "bandage", "glove"],
    "Chemical":     ["chemical", "solvent", "acid", "bleach", "detergent", "pesticide",
                     "fertiliser", "fertilizer"],
    "Oil":          ["oil", "motor oil", "lubricant", "grease", "petroleum"],
    "Paint":        ["paint", "varnish", "lacquer", "spray can"],
    "Battery":      ["battery", "batteries", "cell", "lithium", "lead acid", "alkaline"],
}

# ---------------------------------------------------------------------------
# 3.  CORE CALCULATION FUNCTION
# ---------------------------------------------------------------------------

def _detect_sub_material(hint: str) -> str | None:
    """
    Scan MATERIAL_KEYWORDS for any keyword that appears in the hint string.
    Returns the first matching sub-material name, or None if no match found.
    """
    hint_lower = hint.lower()
    for material, keywords in MATERIAL_KEYWORDS.items():
        for kw in keywords:
            if kw in hint_lower:
                return material
    return None


def calculate_carbon(
    waste_type: str,
    confidence: float,           # 0.0 – 1.0
    hint: str | None = None,     # optional filename / label for sub-material detection
    weight_kg: float = 1.0       # kg of waste (Node.js multiplies by real weight at save)
) -> dict:
    """
    Calculate confidence-weighted CO₂ savings for a classified waste item.

    Formula:
        carbon_saved = emission_factor × confidence × weight_kg

    Rationale for confidence weighting:
        A prediction with 55% confidence should contribute fewer "credits"
        than one at 95% — the environmental accounting reflects uncertainty.

    Returns a dict ready to be merged into the Flask /predict JSON response.
    """
    sub_material: str | None = None
    basis: str = "category-fallback"

    # Step 1 — Try sub-material detection from hint
    if hint:
        sub_material = _detect_sub_material(hint)
        if sub_material:
            basis = "material-aware"

    # Step 2 — Pick emission factor
    if sub_material and sub_material in EMISSION_FACTORS:
        emission_factor = EMISSION_FACTORS[sub_material]
    elif waste_type in EMISSION_FACTORS:
        emission_factor = EMISSION_FACTORS[waste_type]
    else:
        # Absolute fallback (should never reach here with the 3 known categories)
        emission_factor = 0.50

    # Step 3 — Confidence-weighted carbon saved
    carbon_saved = round(emission_factor * confidence * weight_kg, 4)

    return {
        "emissionFactor": emission_factor,
        "carbonSaved":    carbon_saved,
        "subMaterial":    sub_material or waste_type,
        "basis":          basis,
        "unit":           "kg CO₂ per kg waste"
    }
