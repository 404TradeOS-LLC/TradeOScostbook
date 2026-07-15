# TradeOS Document Design System
*An extension of the Brand Bible (Phase 3). Governs every customer-facing document TradeOS generates: proposals, estimates, contracts, invoices, change orders, purchase orders, scopes of work, project reports, closeout packages, warranty packets, maintenance guides.*

## §0 — There are two document systems

This is the single most important structural fact in this document. Everything below in §1–10 describes **System 2**. System 1 is documented here for completeness and to prevent the two from ever being confused.

### System 1 — 404 TradeOS Corporate Documents
**Our own company's documents.** Not white-label. Fully embrace the 404 TradeOS brand — Forge identity, copper, the full ceremonial lockup, large and bold. These should feel cinematic, premium, unforgettable, and unmistakably 404 TradeOS.

Covers: sales proposals, consulting proposals, web-development proposals, AI-consulting documents, service agreements, our own invoices, capability statements, pitch decks, case studies, marketing collateral, internal documentation, presentation templates.

**Goal:** a client who receives one of these should immediately recognize the 404 TradeOS brand and associate it with quality and craftsmanship — the opposite discipline from System 2 below. These follow the Brand Bible directly (§5 logo rules, ceremonial lockup, Forge register) with no white-label constraints.

### System 2 — TradeOS White-Label Document Engine
**What TradeOS (the product) generates on behalf of contractor customers**, for those contractors' own customers. This is everything in §1–10 below: the contractor's brand is the primary identity; TradeOS provides the premium *Frame* underneath it; 404 TradeOS's own brand appears only as a small optional "Powered by TradeOS" footer credit — same logic as Stripe invoices not looking like Stripe, they look like the merchant.

**The contractor owns the branding. TradeOS owns the craftsmanship.** Regardless of a contractor's own design ability, the output looks like it came from a world-class creative agency, because the parts that create "premium" — layout, spacing, typography, hierarchy, print quality, accessibility — are never in the contractor's hands to weaken.

**This white-label branding system extends beyond documents** to: customer portals, emails, PDF exports, client-facing web pages, estimate links, invoices, payment portals, and any other customer-facing surface TradeOS generates on a contractor's behalf. Wherever a contractor's *own customer* is the audience, System 2 rules apply — not System 1.

### Contractor Branding settings (System 2 — what every contractor configures)

Every contractor gets a **Branding section in Settings** covering: company logo, alternate logo, light/dark logo variants, primary brand color, secondary brand color, accent color, typography preference (from an approved font set — never arbitrary uploads, protects print fidelity), header style, footer style, watermark, cover-page style, project photography defaults, team photography, certifications, licenses, insurance information, social media, website, QR codes, payment information, financing partners, review badges, Google rating, contact information, legal footer, email signature, document signature, company slogan.

TradeOS applies these automatically across every generated document and customer-facing surface, while preserving the Frame (§6–8 below) untouched. This is the literal implementation of the "contractor owns branding / TradeOS owns craftsmanship" contract in §9.

---

## A framing correction before the rules (System 2 detail)

These documents are generated **by TradeOS, for TradeOS's contractor customers, to send to *their* customers** (homeowners, property managers, commercial clients). That makes System 2 a **white-label system**, not a 404 TradeOS-branded one.

- **404 TradeOS's own copper/Forge brand does not appear on System 2 documents** except as a small, optional "Powered by TradeOS" credit line.
- **The contractor's brand is the star.** Their logo, their colors, their photography, their license numbers.
- **What TradeOS actually owns and controls is the *system* the contractor's brand is poured into** — the layout discipline, typographic quality, spacing, print fidelity, and structural flow that make *any* contractor's document look premium. This is the real product: turning a $12/hr Word-doc estimate habit into something that reads like a luxury-builder proposal, regardless of which contractor sent it.

This reframes the deliverable: not "documents branded in copper," but "a document engine so well-designed that whichever contractor's logo goes on top, the result looks like it came from a firm with an in-house design team."

---

## 1. Document philosophy

**Every document is a sales document first, a record second.** A proposal's job is to help win the job; an invoice's job is to get paid *and* reinforce that hiring this contractor was the right call. Records-keeping (line items, terms, signatures) is necessary but never the *design* driver — trust and craftsmanship are.

**Principle: the document is downstream of the same system as everything else in TradeOS.** It inherits the platform's discipline (tabular numerals, precise spacing, hairline structure, restraint) even while wearing someone else's colors — because *quality of construction*, not color, is what actually reads as "premium." A gorgeous layout in the wrong palette is still credible; a sloppy layout in beautiful colors is not.

**The customer should want to keep it.** Test: would this document survive being left on a kitchen counter or forwarded to a spouse/business partner without embarrassment? If a document looks like it came out of free invoicing software, it fails this test regardless of accuracy.

**Trust is built through structure, not decoration.** Licenses, insurance, certifications, and a clear scope aren't legal boilerplate to bury in an appendix — surfaced early and cleanly, they *are* the sales pitch, per Brand Bible Principle #10 ("what changed and why" / show your work).

---

## 2. Template architecture

**Two layers, always:**

1. **The Frame** (TradeOS-owned, fixed): page geometry, grid, type scale, table styling, spacing rhythm, header/footer mechanics, cover-page layout skeleton, print bleed/margin rules. This is what guarantees quality regardless of contractor.
2. **The Skin** (contractor-owned, variable): logo, brand colors (mapped onto a small set of *semantic* slots, not free-for-all), cover photo, team/project photography, watermark, typography accent (optional), QR codes, review/award badges, financing-partner logos.

**Document family and structure:**

| Document | Primary job | Typical length |
|---|---|---|
| Proposal | Win the job | Long-form, multi-section (see §3) |
| Estimate | Quote a price clearly | Short — cover optional, mostly the pricing table |
| Contract | Formalize terms | Long-form, legal-forward, minimal decoration |
| Invoice | Get paid | Short, transactional, payment-forward |
| Change Order | Document a scope/price change | Very short, references the original contract |
| Purchase Order | Internal/supplier record | Short, functional, minimal branding (B2B-to-B2B) |
| Scope of Work | Define exactly what's included/excluded | Medium, list-forward, unambiguous |
| Project Report | Show progress | Medium, photo-forward |
| Closeout Package | Formally hand off a finished job | Medium-long, celebratory tone, compiles warranties/manuals |
| Warranty Packet | Set expectations post-completion | Short-medium, reference document, kept long-term |
| Maintenance Guide | Ongoing care instructions | Medium, instructional, likely to be kept longest of all |

**Shared skeleton every document uses:**
Cover (optional, recommended for Proposal/Contract/Closeout) → Header band (compact, recurring on every page) → Body sections (per §3 for proposals; simpler for transactional docs) → Signature/approval block (where relevant) → Footer band (contact, page number, doc ID, "Powered by TradeOS" credit).

---

## 3. Proposal structure (the flagship document)

The full confidence-building sequence, in order — pricing arrives only after trust is established:

1. **Cover** — company branding, customer name, project name/address, property or hero photo, date, "Prepared by," version number.
2. **About the company** — short, concrete (years in business, service area, a real specific fact — not a mission statement).
3. **Why choose us** — 3–4 concrete differentiators, not adjectives ("Licensed & insured since 2014," not "Committed to excellence").
4. **Licenses & insurance** — shown plainly, license numbers visible — this is a trust signal, not fine print.
5. **Certifications** — manufacturer/trade certifications, badges.
6. **Team** — real photos of the actual people (per Brand Bible §10, no stock photography).
7. **Project understanding** — a short paragraph proving the contractor listened (site conditions, customer's stated goals).
8. **Scope of work** — unambiguous, itemized, explicit about what's included/excluded.
9. **Timeline** — phase-based, dated where possible, visual (a simple horizontal timeline, not prose).
10. **Materials** — brand names/specs where it matters to perceived quality (fixtures, finishes).
11. **Investment** — the pricing table. Tabular numerals, clean hierarchy (subtotal → adjustments → total), no hidden fees.
12. **Payment schedule** — clear milestones tied to the timeline in §9.
13. **Warranty** — what's covered, for how long.
14. **Terms** — the necessary legal language, formatted for readability (short paragraphs, not a wall of text).
15. **Signature** — a clean, dedicated block; digital-signature-ready.

**Rule:** sections 2–7 (trust-building) always precede section 11 (price). This order is structural, not optional — it is the core mechanism that turns "estimate" into "sales document."

---

## 4. Cover pages

Optional but strongly recommended for Proposal, Contract, and Closeout Package (skip for transactional docs like Invoice/Change Order/Purchase Order, where speed matters more than ceremony).

**Cover contents:** large contractor logo, customer name, project name/address, a property or hero photo (the actual job site if available, else the contractor's representative work), date, "Prepared by [name/company]," document version.

**Layout discipline (Frame-owned):** generous margins, a strong single focal image or clean typographic title treatment, contractor's brand color used exactly once as an accent (a rule, a section marker) — never a busy multi-color cover. This is the one place the contractor's brand gets to be expressive; the rest of the document is calmer.

---

## 5. Contractor branding — what's customizable, and how

**Customizable (contractor-owned):**
Logo · primary/accent brand color(s), mapped to semantic slots (see below) · cover photo · team photos · project photography · watermark · a typography *accent* choice (heading font, from a small curated set — never arbitrary font uploads that could break print fidelity) · header/footer content · QR codes (review link, payment link, portfolio) · social links · Google Reviews snippet/rating · awards/badges · financing-partner logos.

**Not customizable (Frame-owned, protects document quality regardless of contractor):**
Page grid and margins · type scale/hierarchy · table structure and rules · spacing rhythm · section order for structured documents (Proposal §3) · print bleed/safe-area geometry · accessibility minimums (contrast, type size floors) · signature block mechanics.

**Semantic color mapping (how a contractor's brand color gets used safely):**
A contractor supplies **one primary color**. The system maps it to: section dividers, the one "call to action" element (e.g., a "Pay now" or "Sign" button on digital versions), and cover-page accents — never to body text or large background fills (protects readability regardless of what color a contractor picks). This mirrors the Brand Bible's own "copper does one job" discipline (§6 of the Bible) — applied generically to *any* contractor's color, not just copper.

**Watermark/"Powered by TradeOS":** small, footer-level, optional-but-default-on, never competing with the contractor's own branding for attention.

---

## 6. Visual standards (Frame-level, non-negotiable)

1. **Large, confident branding on the cover** — the logo is not shy.
2. **Strong typographic hierarchy** — a reader should identify section, subsection, and body at a glance without color-coding.
3. **Professional spacing** — generous margins (print-safe), consistent vertical rhythm; never cramped to fit one more line.
4. **Beautiful tables** — this is where most estimate software fails. Rules: right-aligned tabular numerals, clear header row (weight/color, not just underline), zebra-striping only if it aids scanning (optional, subtle), subtotal/total rows visually distinguished by weight not color-shouting.
5. **High-quality photography** — real project/team photos, properly cropped and color-corrected, never stretched or pixelated. If a contractor has no usable photos, use clean typographic covers instead of a low-quality photo — never let bad imagery ship.
6. **Architectural layout logic** — generous whitespace used *purposefully* to guide the eye (like a floor plan or spec sheet), not decoratively.
7. **Premium print quality assumptions** — design for print resolution (300dpi imagery, CMYK-safe color choices for anything a contractor might physically print), not just screen PDF viewing.

---

## 7. Print specifications

- **Page size:** Letter (US) default, A4 supported for international use — both handled by the same Frame, not separate designs.
- **Margins:** minimum 0.75in on all sides; cover pages may bleed full-page imagery to the edge with a safe interior margin for text.
- **Resolution:** all raster imagery embedded at 300dpi minimum for print-intended documents; screen-only documents (e.g., a quick change order) can use lower-res web images.
- **Color:** design choices should hold up if a contractor prints in-house on a basic office printer — avoid designs that depend on rich color reproduction to remain legible (i.e., don't rely on subtle color contrast alone; pair with weight/spacing, per accessibility rules in the Brand Bible §12).
- **Typography at print sizes:** 12pt minimum body text (matches system-wide print rule already set in the Brand Bible), generous line-height for print legibility (1.5–1.75).
- **Page numbering & document ID:** every multi-page document carries a running footer with page number and a unique document ID/version — critical for contracts and change orders that may be referenced later.

---

## 8. PDF standards

1. Every generated document is a real, selectable-text PDF — never a flattened image export (accessibility, searchability, professionalism).
2. Digital-only affordances (QR codes, "Pay now" / "Sign" buttons, hyperlinked review/social links) render correctly in the PDF but degrade gracefully in print (QR still scannable, links still visible as visited URLs in a footer if needed).
3. File naming: predictable, professional pattern — e.g. `[Contractor]-Proposal-[CustomerLastName]-[Date].pdf` — never a generic export filename.
4. Version control: every regenerated document increments a visible version number on the cover/footer — protects both contractor and customer from confusion over which version is current.
5. Signature-ready: contract/proposal templates leave a clean, unambiguous signature block compatible with standard e-signature overlay tools.

---

## 9. White-label customization rules (summary contract between TradeOS and the contractor)

**TradeOS guarantees:** the Frame — layout quality, typographic discipline, table design, print fidelity, accessibility — regardless of what the contractor uploads.

**The contractor controls:** their own logo, color, photography, and the specific badges/credentials they want surfaced.

**Neither party can break:** the semantic color-mapping guardrails (§5), the minimum type-size/contrast floors (§6, §7), the structural section order for trust-building documents (§3), or the "Powered by TradeOS" footer credit (contractor can hide it on a paid tier, but cannot replace it with a competing platform's credit).

**What this protects:** a contractor with mediocre design instincts still ships something that looks like an in-house design team built it — because the parts that create "premium" (spacing, hierarchy, structure, print quality) are never in their hands to mess up. That consistency, across every contractor on the platform, is what makes "generated by TradeOS" become a quiet quality signal over time — the way "invoiced via Stripe" quietly signals legitimacy today.

---

## 10. Premium presentation guidelines (the taste test)

Before any document template ships, it should survive comparison against the reference bar named by leadership: luxury custom-home-builder proposals, commercial bid packages, architectural firm presentations, Apple product guides, Tesla delivery documents, high-end annual reports. Not by copying their visual style — construction has its own honest, grounded voice (Brand Bible §2–3) — but by matching their *level of craft*: nothing cramped, nothing default-template-looking, nothing that reads as an afterthought.

**Concrete pass/fail test:** if you removed the contractor's logo from the document, could a stranger tell it was made by a $500M homebuilder rather than a 3-person crew? If yes, the Frame is doing its job.

---

## What is now locked

- **The two-system split (§0):** System 1 (404 TradeOS's own corporate documents — full Forge/copper brand, no constraints) vs. System 2 (the white-label document engine for contractor customers — Frame/Skin separation). These are never to be confused; a future request for "our proposal template" vs. "a contractor's invoice template" now has an unambiguous home.
- Document philosophy: sales-document-first, white-label (System 2), Frame/Skin separation.
- Full document family (11 types) and their relative priority/length.
- Proposal's 15-section structure and the "trust before price" ordering rule.
- Cover page contents and layout discipline.
- What's contractor-customizable vs. TradeOS-protected, including the semantic color-mapping guardrail.
- The full Contractor Branding settings inventory (System 2) and its extension beyond documents to portals, emails, PDF exports, client-facing pages, estimate/payment links.
- Print and PDF technical standards.

## What still needs to be built (Phase 4/7 dependency)

- Actual Frame templates (HTML/print-ready) for each of the 11 document types — this document defines the rules they must follow; none are built yet.
- A real cover-page template family (Proposal/Contract/Closeout variants) for System 2, and a separate cinematic cover treatment for System 1 corporate documents.
- The pricing-table component itself (Frame-owned, reused across Estimate/Invoice/Proposal/Change Order) — this is arguably the single highest-leverage component to get right first, since every document type touches it.
- Sample "mock contractor" skins (2–3 example brand palettes poured through the Frame) to prove the white-label system actually protects quality across different color choices — recommended as the first proof-of-concept before building all 11 full templates.
- At least one System 1 corporate template (e.g. a 404 TradeOS consulting/services proposal) to prove out the cinematic Forge treatment distinctly from System 2's white-label restraint.

---
**Review checkpoint.** Confirm this framing (especially §0's two-system split) before any templates are built.
