"""
carbon.py — Material-Aware CO₂ Emission Calculator (Confidence-Tier Edition)
=============================================================================
Plugs into the Flask /predict pipeline as a post-processing step.
Does NOT touch the ML model or prediction logic.

The model outputs 3 categories (Biodegradable, Recyclable, Hazardous).
Since we cannot identify the specific item (plastic vs glass vs metal),
we use the model's CONFIDENCE SCORE as a proxy for material identity:

    High confidence → item is a "typical" high-impact representative
    Mid  confidence → common mid-impact material
    Low  confidence → uncertain → use a conservative estimate

This produces meaningfully different CO₂ values per scan automatically,
without any user interaction or model changes.

Usage:
    from carbon import calculate_carbon

    result = calculate_carbon(
        waste_type  = "Recyclable",   # model's top_class
        confidence  = 0.87,           # 0–1 float
        hint        = "bottle.jpg",   # optional filename (used as bonus keyword check)
        weight_kg   = 1.0             # defaults to 1.0; Node.js applies real weight at save
    )
"""

# ---------------------------------------------------------------------------
# 1.  EMISSION FACTOR TABLE  (kg CO₂ saved per kg of properly disposed waste)
#     Sources: IPCC AR6, EPA WARM model, UK DEFRA conversion factors 2023
# ---------------------------------------------------------------------------

EMISSION_FACTORS: dict[str, float] = {
    # ── Recyclable ────────────────────────────────────────────────────────
    "Aluminium":     8.14,   # highest impact — smelting avoidance
    "Metal":         2.50,   # generic metals (steel / iron)
    "Steel":         1.46,
    "E-Waste":       3.50,   # rare-metal recovery
    "Textile":       3.30,   # fast-fashion landfill avoidance
    "Plastic":       1.80,   # virgin plastic production avoided
    "PET":           1.50,
    "HDPE":          1.40,
    "Glass":         0.30,   # low-energy recovery
    "Paper":         1.10,   # virgin pulp production avoided
    "Cardboard":     0.95,

    # ── Biodegradable ─────────────────────────────────────────────────────
    "Wood":          0.90,   # biomass / mulch
    "Food":          0.60,   # methane avoidance through composting
    "Organic":       0.50,   # general organics
    "Garden":        0.40,   # leaves, grass clippings

    # ── Hazardous ─────────────────────────────────────────────────────────
    "Medical":       4.00,   # biomedical / sharps
    "Chemical":      3.20,   # solvents, acids
    "Paint":         2.80,   # VOC avoidance
    "Oil":           2.40,   # motor oil / lubricants
    "Battery":       2.10,   # lithium / lead-acid safe disposal

    # ── Category-level fallbacks ─────────────────────────────────────────
    "Recyclable":    1.20,
    "Biodegradable": 0.50,
    "Hazardous":     2.00,
}

# ---------------------------------------------------------------------------
# 2.  AVERAGE ITEM WEIGHTS  (kg per typical item of this material type)
#     Used with weight_kg=1.0 default — returns per-item carbon estimate.
# ---------------------------------------------------------------------------

AVERAGE_WEIGHTS: dict[str, float] = {
    # Recyclable
    "Aluminium":    0.015,   # aluminium can
    "Metal":        0.200,   # generic metal object
    "Steel":        0.250,   # steel container
    "E-Waste":      0.300,   # small electronic device
    "Textile":      0.350,   # garment
    "Plastic":      0.025,   # plastic bottle
    "PET":          0.025,
    "HDPE":         0.050,
    "Glass":        0.350,   # glass jar / bottle
    "Paper":        0.050,   # newspaper / magazine
    "Cardboard":    0.200,   # flat-pack box
    # Biodegradable
    "Wood":         0.500,
    "Food":         0.200,   # food waste portion
    "Organic":      0.150,
    "Garden":       0.300,
    # Hazardous
    "Medical":      0.050,
    "Chemical":     0.400,
    "Paint":        0.500,
    "Oil":          1.000,
    "Battery":      0.050,
}

# ---------------------------------------------------------------------------
# 3.  CONFIDENCE-TIER SUB-MATERIAL MAP
#     For each waste category, we map confidence brackets to a sub-material.
#     Entries are (min_confidence_threshold, sub_material, emission_factor).
#     Evaluated top-to-bottom; first matching tier wins.
#
#     Rationale:
#       • Very high confidence → item is visually very "typical" for its class
#         → use the representative high-impact material for the category
#       • Medium confidence → common mid-impact material
#       • Low confidence → conservative / fallback estimate
# ---------------------------------------------------------------------------

CONFIDENCE_TIERS: dict[str, list[tuple]] = {
    "Recyclable": [
        (0.92, "Aluminium",  8.14),   # ≥92% → shiny metallic can / foil
        (0.80, "Plastic",    1.80),   # 80–91% → clear plastic bottle / packaging
        (0.65, "Cardboard",  0.95),   # 65–79% → corrugated cardboard / boxes
        (0.00, "Paper",      1.10),   # <65%   → paper (conservative)
    ],
    "Biodegradable": [
        (0.88, "Food",       0.60),   # ≥88% → clear food / kitchen waste
        (0.70, "Organic",    0.50),   # 70–87% → general organic matter
        (0.00, "Garden",     0.40),   # <70%   → garden waste / leaves (conservative)
    ],
    "Hazardous": [
        (0.85, "Battery",    2.10),   # ≥85% → clearly identifiable battery
        (0.68, "Chemical",   3.20),   # 68–84% → chemical container
        (0.00, "Paint",      2.80),   # <68%   → paint / generic hazardous
    ],
}

# ---------------------------------------------------------------------------
# 4.  OPTIONAL KEYWORD OVERRIDE  (filename / hint bonus)
#     If the image filename contains a strong keyword, it overrides the tier.
#     This is a bonus — it doesn't replace tier logic, just refines it.
# ---------------------------------------------------------------------------

KEYWORD_OVERRIDES: dict[str, tuple[str, float]] = {
    # keyword (lowercase)  →  (sub_material, emission_factor)
    "aluminium":   ("Aluminium", 8.14),
    "aluminum":    ("Aluminium", 8.14),
    "foil":        ("Aluminium", 8.14),
    "battery":     ("Battery",   2.10),
    "batteries":   ("Battery",   2.10),
    "glass":       ("Glass",     0.30),
    "jar":         ("Glass",     0.30),
    "plastic":     ("Plastic",   1.80),
    "bottle":      ("Plastic",   1.80),
    "paper":       ("Paper",     1.10),
    "cardboard":   ("Cardboard", 0.95),
    "food":        ("Food",      0.60),
    "banana":      ("Food",      0.60),
    "vegetable":   ("Food",      0.60),
    "fruit":       ("Food",      0.60),
    "medical":     ("Medical",   4.00),
    "syringe":     ("Medical",   4.00),
    "chemical":    ("Chemical",  3.20),
    "paint":       ("Paint",     2.80),
    "oil":         ("Oil",       2.40),
    "metal":       ("Metal",     2.50),
    "steel":       ("Steel",     1.46),
    "electronic":  ("E-Waste",   3.50),
    "phone":       ("E-Waste",   3.50),
    "laptop":      ("E-Waste",   3.50),
    "textile":     ("Textile",   3.30),
    "cloth":       ("Textile",   3.30),
}


# ---------------------------------------------------------------------------
# 5.  CORE CALCULATION FUNCTION
# ---------------------------------------------------------------------------

def _tier_lookup(waste_type: str, confidence: float) -> tuple[str, float]:
    """Return (sub_material, emission_factor) using confidence-tier logic."""
    tiers = CONFIDENCE_TIERS.get(waste_type, [])
    for min_conf, material, factor in tiers:
        if confidence >= min_conf:
            return material, factor
    # Absolute fallback
    return waste_type, EMISSION_FACTORS.get(waste_type, 0.50)


def _keyword_lookup(hint: str) -> tuple[str, float] | None:
    """Scan KEYWORD_OVERRIDES against the hint string. Returns first match or None."""
    hint_lower = hint.lower()
    for keyword, (material, factor) in KEYWORD_OVERRIDES.items():
        if keyword in hint_lower:
            return material, factor
    return None


def calculate_carbon(
    waste_type: str,
    confidence: float,           # 0.0 – 1.0
    hint: str | None = None,     # optional filename / label
    weight_kg: float = 1.0
) -> dict:
    """
    Calculate confidence-weighted, material-aware CO₂ savings.

    Formula:
        carbon_saved = emission_factor × average_item_weight × confidence

    - Sub-material is selected first via keyword match (if hint given),
      then by confidence-tier fallback.
    - average_item_weight replaces the generic weight_kg so different
      material types produce meaningfully different values automatically.
    - Confidence weighting: higher model confidence → more carbon credit.
    """
    sub_material: str
    emission_factor: float
    basis: str

    # Step 1 — keyword override (bonus, only if hint provided)
    if hint:
        match = _keyword_lookup(hint)
        if match:
            sub_material, emission_factor = match
            basis = "keyword-match"
        else:
            sub_material, emission_factor = _tier_lookup(waste_type, confidence)
            basis = "confidence-tier"
    else:
        sub_material, emission_factor = _tier_lookup(waste_type, confidence)
        basis = "confidence-tier"

    # Step 2 — use average item weight for this sub-material
    item_weight = AVERAGE_WEIGHTS.get(sub_material, weight_kg)

    # Step 3 — confidence-weighted carbon saved
    carbon_saved = round(emission_factor * item_weight * confidence, 4)

    return {
        "emissionFactor": emission_factor,
        "itemWeightKg":   item_weight,
        "carbonSaved":    carbon_saved,
        "subMaterial":    sub_material,
        "basis":          basis,
        "unit":           "kg CO₂ per item"
    }
