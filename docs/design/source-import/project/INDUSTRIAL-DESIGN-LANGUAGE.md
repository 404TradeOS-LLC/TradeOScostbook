# TradeOS Industrial Design Language
*The grammar of the brand — not an asset library. These are the construction rules that make any page, screen, document, or presentation recognizable as TradeOS even with the logo completely removed. Extends Brand Bible §23 (Brand Language) and §24 (Material Language) with concrete, numeric standards.*

## 1. Corner treatments

- **Chamfered corners, never rounded, on anything "fabricated"** (nameplates, terminal frames, module cards, document Frame containers). Standard chamfer: **corner cut = 2.5% of the shorter edge**, minimum 10px, maximum 20px at any scale. This is a straight diagonal cut, never a radius — a rounded corner reads as injection-molded plastic, a chamfer reads as machined metal.
- **True rounded corners are reserved for**: pills/badges/status chips (fully round), and ordinary product UI surfaces in the Blueprint register (cards, buttons — existing radius tokens: 3/6/10/14px) where the "equipment" metaphor doesn't apply. Never mix a chamfer and a large radius on the same object.
- **Rule of thumb:** if the object represents something bolted/fabricated/mounted, chamfer it. If it's an ordinary software control (button, input, card), use the existing radius tokens instead.

## 2. Chamfer &amp; bevel standards

- **Plate chamfer depth:** the diagonal cut spans 10–20px at document/hero scale (see §1), scaling proportionally down to a minimum legible 4px at icon scale (below which, drop the chamfer entirely — see Refinement R4/R8).
- **Edge bevel (inset border):** every fabricated plate gets a **1px inset border at 24px from the outer edge** at hero scale (proportionally ~4% of plate height), in `rgba(255,255,255,0.1–0.15)` — simulates a machined lip, not a flat sticker edge.
- **Engraving depth (text):** letterforms use a **two-part shadow** — a light rim above (`rgba(255,255,255,0.25–0.35)`, 1px offset up) and a dark drop below (`rgba(0,0,0,0.7)`, 4–6px offset down, soft blur). Deeper drop = more "recessed into metal"; use the deeper variant (Refinement R3) only at hero/large scale where it registers — at small sizes, flatten to the light gradient text alone.

## 3. Bolt &amp; fastener patterns

- **Standard fastener: 4 corner bolts**, positioned at a fixed inset from each corner (**~6% of plate width from each edge**, never flush against the chamfer cut itself).
- **Bolt diameter scales with plate size:** roughly **3.4% of plate height** at hero/document scale (22px on a 320px-tall plate); scale down proportionally; below ~10px diameter, drop the cross-slot detail and render as a plain dot (see Refinement R2).
- **Cross-slot orientation:** two perpendicular lines at 45°/135°, dark (`rgba(20,20,20,0.9)`) on the metal gradient — never a Phillips-style + at 0°/90° (reads more mechanical at the diagonal).
- **When to use 2 bolts vs. 4:** 4 for any "plate mounted to a surface" object (nameplate, terminal frame). 2 (top corners only) is acceptable for a lighter/smaller treatment (Refinement R2) where 4 would feel heavy. Never use 1, 3, or non-symmetric bolt counts.
- **Black oxide hardware** (§24 material) is the fastener finish for any *photographed/physical* mockup; the digital gradient rivet (light-to-dark radial) is the on-screen equivalent — keep them visually consistent (same highlight angle: light source from upper-left, ~33%/28% position).

## 4. Line weights

Fixed, never arbitrary — pick from this scale, nothing in between:
- **Hairline (structural):** 1px — plate borders, document table rules, card borders. The default weight for 90% of all lines in the system.
- **Emphasis line (0.5):** 1.5px — dividers with meaning (the TRADE|OS separator, dimension lines, focus underlines).
- **Bold structural (rare):** 2px — outer plate silhouette stroke, primary chart/diagram axis lines. Never used for body-level UI dividers.
- **Never** use line weights below 1px (invisible at most screen densities) or above 2px (reads as a UI-toolkit box, not an engineered line) within this system.

## 5. Measurement &amp; calibration systems

- **Tick-mark ruler convention:** ticks at a fixed rhythm along any "instrument edge" (nameplate top/bottom, section dividers) — **major tick every 5th interval, minor ticks between**, minor at ~35% opacity of major. Spacing: ticks every ~30px at hero scale (Refinement baseline), proportionally tighter/looser at other scales — never irregular spacing.
- **Dimension callouts** (Direction D, blueprint precision): a horizontal/vertical line with perpendicular end-caps (4px tall) and a centered mono value label, e.g. `42.0`. Reserved for diagrams and architectural/engineering-styled layouts — never used decoratively on ordinary content.
- **Crosshair reticle:** a simple perpendicular cross (1px lines, copper, ~70–80% opacity) with an optional surrounding ring at ~40% opacity. Used for: marketing hero mouse-tracking, section/anchor markers, loading states, empty-state substitutes. Fixed proportions: ring diameter ≈ 3.5× the cross arm length.

## 6. Engineering annotations &amp; callouts

- **Section eyebrow (SecLabel):** copper mono, 11px, 0.16em tracking, uppercase — precedes every H2 (existing rule, restated here as part of the grammar, not just a component).
- **Identifier line** (used above a nameplate/hero wordmark): mono, wide tracking (0.3–0.4em), e.g. `404 · INDUSTRIAL IDENTIFICATION` — always centered, always above the primary mark, never below.
- **Annotation color:** engineering/technical annotations (dimension values, tick labels, identifier lines) are always copper or copper-adjacent (rust `#998066`) — never bone/white, which is reserved for primary content text. This is the visual rule that separates "the content" from "the instrumentation around the content."

## 7. Serial &amp; model number conventions

Fixed format, used identically everywhere a serial appears (nameplates, document footers, settings/about screens, boot sequences):

- **Model line:** `MODEL TOS-##` — two-digit sequence, TOS prefix (TradeOS), always uppercase mono.
- **Serial line:** `SER. 404-####` — four-digit sequence, 404 prefix (the brand identifier doing double duty as a serial prefix), always uppercase mono.
- **Placement:** bottom-left (model+serial) and bottom-right (origin/fabrication line, e.g. `FABRICATED · TERRE HAUTE, IN`) of any plate-style object — never centered, never top-placed (mimics real equipment nameplates, which place identifying data at the bottom edge).
- **Document footers** use a lighter version of the same convention: a document ID (`Contract #VE-118 · Page 4 of 4` — already in use in `documents/frame.css`) in the same position logic (left = identity, right = context).

## 8. Inspection marks &amp; status conventions

- **Status LED vocabulary is fixed** (Brand Bible §6, §21): green = online/success only, copper = processing, red = error, rust = idle (no pulse). This is an inspection-mark system — like a QC stamp — and must never be reassigned per-feature.
- **"Fabricated/verified" stamp convention:** where a document or screen needs to convey "this was checked," use the existing StatusPill in `neutral` tone with a checkmark glyph — never invent a new stamp/seal graphic. Consistency of the inspection vocabulary is what makes it trustworthy.

## 9. Spacing rules (grammar-level, restates Brand Bible §8 for fabricated objects specifically)

- **Plate padding:** interior content sits at a fixed **inset of ~8% of plate height** from the chamfer edge (24px on a 320px plate) — this is the "safe zone" no bolt, tick, or serial line ever crosses into from the outside, and no primary content crosses out of from the inside.
- **Bolt-to-edge distance:** bolts sit inside the padding zone, roughly at its outer boundary (not centered within it) — closer to the edge than the content, establishing a clear visual hierarchy: edge → fasteners → tick marks → content.

## 10. Manufacturing metadata (the "who/where/when" convention)

Every primary brand plate (nameplate, capability statement cover, booth banner) carries a small manufacturing-metadata line, always mono, always low-emphasis (rust color, not copper) — e.g. `FABRICATED · TERRE HAUTE, IN`. This is not filler — it's the detail that makes an object feel like it was actually produced somewhere real, the same way examining a real piece of equipment reveals a stamped origin city. Never omit it from a hero-scale primary mark; always omit it below icon/favicon scale (no room, and it stops being legible anyway).

## 11. Industrial UI primitives (product-safe subset)

Not every grammar element belongs in the Blueprint product register — these do, in restrained form:

- **Tabular numerals** on every figure (already a hard rule, Brand Bible §7) — the product-safe expression of "measured precision."
- **Hairline borders (1px)** as the default structural device (§4) — never shadows-first.
- **Serial/build convention** in Settings/About screens only (§7) — not on every card.
- **Copper focus ring** (`--focus-ring` token) as the one calibrated "this is selected/active" signal — functions like a crosshair lock, without literally drawing one in product UI.
- **What does NOT belong in product UI:** chamfered corners, rivets/bolts, tick-mark rulers, crosshair reticles, engraved/beveled text. Those stay in the Forge/marketing and physical-object registers — the product's "industrial" feeling comes from precision (numbers, spacing, hairlines), not from literally drawing machine parts on screen (Brand Bible §12, §21).

---

## What this makes possible

Strip the logo from a 404 TradeOS proposal cover, marketing page, or presentation slide, and this grammar — the chamfer, the tick rulers, the copper mono annotations, the serial-line convention, the fixed bolt pattern — should still be enough to identify it as TradeOS. That is the test for every future page, screen, or document: **does it use this grammar, or does it just use the logo?** If it's only the logo, it isn't finished.

## What's now production-ready vs. still open

- **Locked:** every numeric standard above (chamfer %, bolt %, line weights, tick rhythm, serial format, spacing insets) — these are the actual values to implement, not placeholders.
- **Still open:** a physical style-guide sheet with these values laid out as a single reference (recommended next artifact — see `explorations/industrial-design-language-specimen.html` for a first pass); and confirming these numeric standards survive real print/embroidery production (physical constraints may force minor adjustments Codex/production should flag if hit).
