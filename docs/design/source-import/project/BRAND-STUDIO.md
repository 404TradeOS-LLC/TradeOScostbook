# TradeOS Brand Studio + White-Label Experience System
*A first-class design module — not a settings page. Extends the Brand Bible and Document Design System. No tokens or logos changed here.*

## The two systems, restated (do not confuse these)

1. **404 TradeOS Corporate Brand** — our own brand. Forge, copper, full ceremonial identity, used boldly. Powers: the 404 TradeOS website, consulting/web-dev/AI-consulting proposals, our own invoices, pitch decks, capability statements, case studies, internal docs, sales collateral. Rules: Brand Bible §5, §14; Document Design System §0 System 1.
2. **TradeOS White-Label Brand Studio** — the product feature described in this document. Every contractor's brand is the star; TradeOS supplies the Frame (layout, spacing, typography discipline, PDF quality, print/accessibility standards, section ordering). Document Design System §0 System 2, §5, §9.

**Design philosophy, in one line:** *the contractor owns the Skin — logo, colors, photos, story, badges, trust signals, contact details; TradeOS owns the Frame — layout, spacing, typographic hierarchy, tables, document flow, print standards, accessibility, PDF quality, section ordering, premium structure.* The target feeling: **"I uploaded my logo once, and now my entire company looks professional everywhere."**

**The document philosophy test:** a 3-person contractor's proposal should read like a $50M construction company's. Recipient reaction: *"This company has their shit together."* Remove the contractor's logo — if a stranger can't tell it apart from an enterprise builder's document, the Frame is doing its job (Document Design System §10).

---

## 1. Brand Studio IA (information architecture)

Brand Studio is a **product settings module inside TradeOS**, built in **Blueprint** (not Forge) — it is contractor-facing daily-use software, subject to all product-register rules (Brand Bible §13, Principle #12).

```
Brand Studio
├── Overview                  (completion score, previews, quick actions)
├── Company Identity          (name, tagline, service area, story, licenses/insurance/certs)
├── Logos                     (all lockup variants + generated derivatives)
├── Colors                    (primary/secondary/accent, semantic mapping, contrast check)
├── Typography                (curated pairings, not open font upload)
├── Photography               (hero, team, equipment, jobsite/before-after galleries)
├── Trust Signals             (licenses, insurance, certs, awards, reviews, financing, warranty)
├── Document Style            (per-document-type style controls, all Frame-safe)
├── Client Portal             (portal header/dashboard/status/payment/signature previews)
├── Email Branding            (transactional email templates + signature)
├── Website/Future Web        (future contractor website skin previews — road-mapped, not built yet)
└── Preview Lab               (live, cross-surface preview of everything above at once)
```

**Navigation rule:** left rail, flat, one level deep (matches Contractor Experience navigation rule, Brand Bible §4/§13) — no nested settings-within-settings. Overview is the landing/home of the module and always reachable in one click.

---

## 2. Brand Studio UX flow

1. **First-run:** a contractor opens Brand Studio for the first time to an **Overview** showing a completion score (e.g. "40% — add your logo to get started") and a short ordered checklist: Logo → Colors → Company Identity → Trust Signals → Photography. Order matches what most immediately improves document quality.
2. **Each section is a focused, single-purpose screen** — upload/select, see an inline preview of the effect, save. No multi-step wizards; a contractor can leave and return at any point without losing progress (autosave, per Brand Bible §13 Rule 8).
3. **Every change updates live previews** across Preview Lab and any section-local preview card — a color change shows immediately on a mini proposal-cover thumbnail, not just as a swatch.
4. **Guardrails surface as help, not errors.** If a contractor picks a color that fails contrast, Brand Studio explains in plain language and offers a safe adjustment — never a dead-end validation error (Brand Bible Principle #10, "show your work").
5. **Exit state:** Preview Lab is the natural "I'm done, does it all look right?" destination — reachable from Overview's quick actions and from every section's header.

---

## 3. Brand Studio screen specs

### 3.1 Overview
- **Brand completion score** — a simple percentage/progress ring + short label ("Your brand is 60% set up"), not a gamified badge system — informational, not game-like (avoids "AI slop"/gimmick tone).
- **Missing setup items** — plain-language checklist ("Add your logo," "Add a license number") each linking directly to the relevant section.
- **Preview cards** — 3–4 small live thumbnails (proposal cover, invoice, email) reflecting current settings — the contractor sees the effect of their setup immediately, without opening Preview Lab.
- **Quick actions** — "Upload logo," "Set your colors," "Preview all documents" as primary buttons (one primary action visible at a time per Principle #1 — the single most-missing item is the one action emphasized).
- **Document readiness score** — separate from brand completion: tells the contractor whether their documents are *legally/functionally* complete (license numbers present, insurance on file) vs. just *visually* branded — two different scores because a beautiful proposal missing a license number is still a liability.

### 3.2 Company Identity
Fields: company display name, tagline, service area(s), years in business, story/about (short-form, guided by a prompt like "What should a new customer know about you?"), licenses, insurance, bonding, certifications. Plain-language labels throughout (§7 below).

### 3.3 Logos
Upload/select: primary, horizontal, stacked, icon, favicon, dark variant, light variant, monochrome, watermark, print-safe version. **Brand Studio auto-derives what it can** (e.g. a monochrome or print-safe version from the primary upload) rather than asking a non-designer contractor to produce 10 separate files — this is a craftsmanship moment where TradeOS quietly does design work for them (Invisible Intelligence, Brand Bible §21 — a "better documents" outcome, never framed as "AI logo processing").

### 3.4 Colors
Primary, secondary, accent, neutral/base. **Semantic mapping is shown as a live preview, not a settings grid** — "Here's where your primary color shows up" with a small annotated proposal-cover thumbnail highlighting the 2–3 places it's actually used (Document Design System §5's guardrail, made visible rather than just enforced silently). Contrast checking runs automatically; a failing pair shows a plain-language warning ("This color is hard to read on white — try a darker shade") with one-tap safe alternatives, never a raw contrast-ratio number.

### 3.5 Typography
**Curated pairings only** — no open font upload (protects print fidelity, matches Document Design System §5). Offer named, plain-language style families rather than font names:
- **Professional** — classic serif headings + clean sans body (traditional GC, established firm feel).
- **Modern** — geometric sans throughout (like TradeOS's own Space Grotesk-driven look, offered as an option, not forced).
- **Luxury** — refined serif, generous spacing (high-end remodel/custom home feel).
- **Industrial** — bold condensed sans, mono accents (matches the "engineered" register — commercial/industrial contractors).
- **Traditional** — a warm serif system (family-owned, generational business feel).
- **Minimal** — quiet sans, maximal whitespace (design-forward or younger firms).
Each shown as a live "your company name set in this style" preview — never a bare font-name list.

### 3.6 Photography
Hero photo, team photo, truck/equipment photo, jobsite gallery, before/after gallery, drone photos, project photos, default cover photo (fallback when a specific document has none). **Guardrail:** low-resolution or low-quality uploads get a plain-language nudge ("This photo may look blurry when printed — try a higher-resolution version") rather than silently shipping a bad print (Document Design System §6 Rule 5).

### 3.7 Trust Signals
License numbers, insurance, certifications, awards, Google rating, testimonials, financing partners, manufacturer badges, warranty claims. Each renders as a small badge/line in the Frame's dedicated trust-signal zone (Proposal §3 sections 4–5) — the contractor fills in data, the Frame decides layout.

### 3.8 Document Style
Per-document-type controls (proposal/estimate/invoice/contract/closeout) plus shared cover/header/footer/watermark/signature/QR styles. Every control maps to a Skin-layer choice only (Document Design System §5) — there is no control here that can alter the Frame (e.g., no "change table layout" option).

### 3.9 Client Portal
Preview-only for now (road-mapped): portal header, customer dashboard, project-status page, payment page, approval/signature page — shown as live-updating thumbnails driven by the same brand settings, so a contractor understands their brand extends beyond documents before that surface ships.

### 3.10 Email Branding
Proposal email, invoice email, reminder email, appointment email, project-update email, email signature — each a short, brand-consistent template (Skin: logo + colors + signature block; Frame: layout, type, spacing) consistent with Brand Bible voice rules (§3) even though the *words* are TradeOS defaults the contractor can lightly edit.

### 3.11 Website/Future Web Presence
Preview-only, clearly labeled "coming soon": future contractor website skin, landing page, service page, contact section, review/testimonial section — proves the brand system's reach without overpromising a shipped feature.

### 3.12 Preview Lab
The single screen showing everything at once: proposal cover, invoice, contract signature page, project report, client portal, email, and a mobile view toggle. This is the "does it all look right" destination (§2, step 5) and the natural screen to screenshot/share for a contractor proud of their setup.

---

## 4. Brand Studio component list

New Blueprint-register product components needed (Phase 4 dependency — not built yet):

- **CompletionRing** — circular progress indicator + label (Overview).
- **ChecklistItem** — icon + plain-language task + link (Overview missing-items list).
- **PreviewThumbnail** — small live-rendered document/email/portal preview card, reusable across Overview/Preview Lab/every section.
- **LogoSlot** — upload/preview control per logo variant, with auto-derivation messaging ("We'll generate a print-safe version automatically").
- **ColorSwatchPicker** — primary/secondary/accent picker with inline contrast warning.
- **SemanticMapPreview** — annotated thumbnail showing *where* a color is actually used.
- **TypeStylePicker** — named style-family cards (Professional/Modern/Luxury/Industrial/Traditional/Minimal), each rendering a live sample.
- **PhotoSlotGrid** — hero/team/equipment/gallery upload grid with quality warnings.
- **TrustSignalRow** — license/insurance/cert/award/rating entry row, consistent across the Trust Signals section.
- **DocumentStyleCard** — per-document-type style summary + edit entry point.
- **ReadinessScore** — the "document readiness" (legal/functional completeness) indicator, visually distinct from CompletionRing so the two scores are never confused.

All of the above are **Blueprint-register, dense, quiet** — none borrow Forge's dark surfaces, terminal chrome, or marketing motion (explicit user constraint: "Do not make the product look like the Forge marketing site").

---

## 5. Brand Studio preview card specs

Every preview card (Overview, section-local, Preview Lab) follows one spec regardless of which document/surface it represents:
- Renders at a fixed small aspect ratio (portrait for documents/covers, wide for emails/web previews).
- Shows real contractor data where available, sensible neutral placeholders where not ("Your Company Name," a generic silhouette icon in place of a missing logo) — never 404 TradeOS's own branding as the placeholder (would misrepresent whose brand is being previewed).
- Updates live/optimistically the moment a setting changes — no "refresh preview" button.
- Is clickable through to the full Preview Lab view of that surface.
- Never includes an editing affordance directly on the thumbnail — preview cards preview; the section screen edits.

---

## 6. White-label document rules (restates + extends Document Design System §5, §9)

1. Documents never default to 404 TradeOS copper — a contractor's own primary color (or a sensible neutral default before they set one) is used instead. Copper only appears if a contractor explicitly chooses it as their own brand color, coincidentally.
2. The Frame (layout/spacing/type hierarchy/tables/flow/print/accessibility/section order) is never contractor-editable, directly or indirectly through any Brand Studio control.
3. "Powered by TradeOS" footer credit is present by default, small, non-competing with the contractor's own branding; hideable on a paid tier per existing plan, never replaceable with a different platform's credit.
4. Every document — regardless of which contractor's Skin is applied — passes the same accessibility and print-quality checks (Document Design System §6, §7, §12) before being considered "ready."

## 7. Contractor customization rules (plain-language mapping)

Brand Studio must never expose design jargon. Every internal design-system term has a required plain-language surface label:

| Internal term | Contractor-facing label |
|---|---|
| Visual identity system | Your company brand |
| Semantic color mapping | Where your colors appear |
| Typography pairing | Document font style |
| Contrast ratio / WCAG AA | Readability check |
| Brand Frame vs. Skin | (never surfaced directly — described through effect: "TradeOS handles the layout, you handle the look") |
| Lockup / wordmark | Logo |
| Watermark opacity | How visible your watermark is |

**Rule:** any new Brand Studio copy is checked against this table before shipping — if a needed label isn't listed, add it here first, in plain language, before writing the UI string.

## 8. 404 TradeOS corporate document rules (System 1 — unaffected by Brand Studio)

Brand Studio is a **System 2 (white-label) feature only**. It has no relationship to 404 TradeOS's own corporate documents (proposals, pitch decks, our invoices, capability statements) — those remain hand-authored/hand-templated in full Forge/copper per Document Design System §0 System 1 and Brand Bible §5/§14, outside of Brand Studio entirely. **Do not build a "404 TradeOS" entry inside Brand Studio's contractor-facing UI** — the two systems must stay structurally separate, not just visually different.

## 9. Do / Don't examples

| Do | Don't |
|---|---|
| "Your company brand" | "Visual Identity System" |
| "Where your colors appear" (with a picture) | "Semantic color mapping" |
| Auto-generate a print-safe/monochrome logo from one upload | Ask a contractor to produce 10 logo files themselves |
| Show a contrast warning with a one-tap fix | Show a raw WCAG ratio number with no guidance |
| Default document color = neutral until the contractor sets one | Default document color = 404 TradeOS copper |
| "Powered by TradeOS" small footer credit | No credit, or a credit that competes with the contractor's own logo |
| One primary action per Brand Studio screen | A screen with three equally-weighted buttons |
| Live preview updates instantly on every change | A "generate preview" button the contractor must click |
| Preview Lab as one unified cross-surface view | Ten separate preview pages the contractor must hunt across |

## 10. Future implementation notes for engineers

- Brand Studio settings are the single source of truth consumed by: the Document Design System's Frame renderer, transactional email templates, the (future) client portal, and (future) contractor website skins — one settings object, many consuming renderers, never per-surface duplicated brand config.
- Logo auto-derivation (monochrome, print-safe, favicon-cropped versions) should be a backend job triggered on upload, with Brand Studio showing a "processing…" state on the relevant LogoSlot rather than blocking the save.
- Contrast checking and print-quality (resolution) checks should run both client-side (instant feedback while editing) and server-side (guaranteed enforcement at document-generation time) — never trust client-side-only validation for something that gates document quality.
- Completion score and Readiness score are computed from two different rule sets (visual completeness vs. legal/functional completeness) and must remain visually distinct components so they're never conflated in the UI or in engineering's data model.
- Typography style families (§3.5) should ship as a small, fixed, versioned set (not user-extensible) so print fidelity and pairing quality stay guaranteed — new families are a design-team decision, not a contractor-facing feature.

---

## What is now locked
- Brand Studio's IA (12 sections), UX flow, and the plain-language mapping table (§7) — any future copy must pass through it.
- The Frame/Skin split as it applies specifically to a *settings UI* (not just to documents themselves) — Brand Studio can only ever edit Skin.
- The explicit rule that Brand Studio is a System 2 (white-label)-only feature, structurally separate from 404 TradeOS's own corporate documents (System 1).
- Two distinct, non-conflatable scores: Brand Completion vs. Document Readiness.
- The component list (§4) as the target inventory for Phase 4/6 product-component work.

## What still needs implementation
- All 11 new Blueprint components in §4 — none exist yet; they extend the current primitive set (Button/Card/etc.) into product-specific patterns.
- Actual Preview Lab rendering pipeline — needs the Document Design System's Frame templates (still pending per that document's own "what still needs to be built" list) before previews can render real documents rather than mockups.
- Logo auto-derivation backend logic (favicon crop, monochrome, print-safe generation).
- The typography style-family set (§3.5) — six named pairings need real font selections and specimens, not just names.
- Client Portal and Website/Future Web Presence sections remain preview-only placeholders until those product surfaces are actually built.

## What Codex (or the next engineering pass) should build next
1. The Document Design System's Frame templates (blocking dependency for Preview Lab to show anything real).
2. Brand Studio's Overview + Colors + Logos screens first — the three sections with the highest immediate impact on document quality, per the first-run checklist order in §2.
3. The six typography style-family specimens (§3.5), each with a real, license-safe font selection.
4. The plain-language label table (§7) as a literal shared copy constants file, so engineering and design never drift on terminology.

---
**Review checkpoint.** Confirm before any Brand Studio screens or Frame templates are built.
