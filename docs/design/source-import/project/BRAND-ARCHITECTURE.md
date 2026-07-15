# Brand Architecture — Phase 2
*No colors, type, or logos changed here. This document defines why the existing decisions exist, and gives every future decision a rule to check against.*

## 1. The relationship: one family, two expressions

**404 TradeOS** (the company) and **TradeOS** (the platform) are not sister brands — TradeOS is what 404 TradeOS *builds*. The company markets; the product works.

| | 404 TradeOS | TradeOS |
|---|---|---|
| Role | Company — sells, tells the story, wins trust before purchase | Product — is used 8+ hrs/day, must earn trust every session |
| Register | **Forge** — dark, expressive, motif-rich (crosshair, CNC brackets, terminal chrome) | **Blueprint** — light, quiet, dense (`.theme-blueprint`, already in `styles.css`) |
| Job | Persuade in seconds | Disappear into the work |
| Logo | Full lockup: Badge404 + Wordmark, expressive placement (hero, footer, nav) | **Wordmark only**, small, top-left utility position — never the full ceremonial lockup |
| Copper's job | Attention (CTAs, hover, accent) | Confirmation (active states, links, one primary action) — never decorative |

**Rule:** if you're not sure which register applies, ask "does this get used once during a sales conversation, or a hundred times during a workday?" Once → Forge. Hundred times → Blueprint.

### When each logo appears
- **404 TradeOS full lockup** (Badge404 + Wordmark): marketing site, decks, business cards, merch, proposal covers, letterhead. Anywhere the *company* is the subject.
- **TradeOS wordmark alone** (copper "OS", no badge): the product's own nav bar, in-app about/settings, product documentation headers. The "404" ceremony would be noise 50 times a day.
- **Co-branding rule:** the product may show a small "by 404 TradeOS" credit in account/settings — never in the primary nav, never competing with the product's own identity.

### How they evolve independently (5-year view)
- Tokens (`tokens/*.css`) are the shared spine — both brands import the same file, so they physically cannot drift apart without someone noticing in a diff.
- 404 TradeOS's Forge register can add new marketing motifs freely (new campaign textures, seasonal treatments) as long as copper + Space Grotesk + voice hold.
- TradeOS's Blueprint register changes only through usability evidence (data density needs, new module patterns) — never through marketing trends. A new product surface (Field Ops, Knowledge Engine) extends Blueprint patterns; it doesn't invent a third register.
- If the product ever needs its own sub-mark (e.g., "TradeOS Field" for a mobile app), it inherits Wordmark + copper, never a new color or typeface.

---

## 2. Design principles (permanent, actionable)

Each has rationale + example + implementation rule. These bind marketing and product both, expressed differently per register.

1. **One primary action per screen.**
   *Why:* a contractor on a ladder or between jobs has seconds, not minutes, to find the next step.
   *Example:* an estimate screen has one filled `Button` (Send estimate); everything else is `outline`/`ghost`.
   *Implementation:* never render two `variant="primary"` buttons in the same view.

2. **Precision before decoration.**
   *Why:* the brand's credibility rests on "engineered," not "designed-to-impress." Decoration that doesn't carry information is a liability in Blueprint, and only earns its place in Forge as a *signature* motif (crosshair/CNC), never generic sparkle.
   *Example:* CornerBrackets and the crosshair cursor exist because they mimic real measurement tools — not because motion is fun.
   *Implementation:* before adding any visual flourish, name the real-world instrument it references. If you can't, cut it.

3. **Motion teaches; it never distracts.**
   *Why:* every animation should tell the user something happened (state changed, item saved, error occurred) — not perform.
   *Example:* StatusLED pulses because status is live; a button never bounces for its own sake.
   *Implementation:* if an animation has no state to communicate, remove it. All motion respects `prefers-reduced-motion`.

4. **Information density without clutter.**
   *Why:* a foreman comparing 40 line items needs them all visible; whitespace for its own sake costs scrolling, which costs time on a job site.
   *Example:* `--ui-body: 14px`, tabular numerals, 1px borders (not shadows) to separate rows — Blueprint's whole point.
   *Implementation:* product tables default to compact row height; "comfortable" is opt-in, never default.

5. **Automation should reduce decisions, not add settings.**
   *Why:* TradeOS's AI/automation features fail if they become one more thing to configure.
   *Example:* an AI-suggested estimate line appears inline with an accept/reject affordance — not a separate "AI panel" to manage.
   *Implementation:* any automation feature ships with a sane default and at most one toggle.

6. **Copper means "this is the one action."**
   *Why:* copper's power comes from scarcity. If it colors navigation, badges, and buttons all at once, it stops meaning anything.
   *Example:* in Blueprint, copper = the single primary CTA + active nav item + focus ring. Not icons, not decorative accents.
   *Implementation:* audit any new screen — copper should appear in at most 2–3 places.

7. **Green means online/success. Never anything else.**
   *Why:* already documented; repeating here because it's load-bearing for trust — a green dot must always mean "this is working."
   *Implementation:* lint rule of thumb — grep for `--color-system-green` usage outside status contexts and flag it.

8. **Borders carry structure; shadows are rare and earn their use.**
   *Why:* consistent with "precision" — a hairline border reads as engineered, a soft shadow reads as decorative software.
   *Example:* Card, TerminalFrame, table rows all use 1px borders. The one shadow exception: the floating hero Control Center panel, because it's genuinely elevated off the page.
   *Implementation:* default to `border: 1px solid var(--border-default)`; only add shadow when something is literally floating above other content.

9. **The mono face is for machine output, not human prose.**
   *Why:* mono (Roboto Mono) signals "the system is telling you something" — status, IDs, timestamps, code, data. Using it for body copy would blur that signal.
   *Implementation:* mono only for labels, badges, table headers/data, terminal/status chrome — never paragraphs.

10. **Every screen answers "what changed and why" before "what can I do."**
    *Why:* trust in a Construction Intelligence Platform depends on transparency — a user needs to believe the numbers before they'll act on them.
    *Example:* an AI-generated estimate shows its inputs (materials list, labor rate source) alongside the output, not just a total.
    *Implementation:* any AI/automated output ships with a visible "why" affordance (tooltip, expandable source) — never a bare number.

11. **Voice is the same person everywhere, at different volumes.**
    *Why:* a user shouldn't feel like the marketing site and the product were written by different companies.
    *Example:* marketing: "Stop being a 404." Product empty state: "No projects yet — add your first job." Same directness, no exclamation marks, no jargon, just quieter in-product.
    *Implementation:* run any new copy through the existing readme.md Content Fundamentals examples before shipping.

12. **Dark is for persuasion, light is for production.**
    *Why:* codifies the Forge/Blueprint split above as a hard rule, not a preference.
    *Implementation:* any full-screen dark UI proposed for the *product* (not marketing) needs an explicit usability justification (e.g., an on-site night-mode field view) — it is never the default.

13. **The 404 badge is a signature, not a UI element.**
    *Why:* "404" is core brand identity, memorable specifically because it's rare and ceremonial.
    *Implementation:* it appears at entry points (site header/footer, deck title slides, proposal covers) — never repeated inline as a UI chip or status indicator.

14. **Real photography over illustration, real data over placeholder data.**
    *Why:* the brand's credibility is "built by people who've been on the truck." Abstract illustration or fake dashboards undercut that authenticity.
    *Implementation:* marketing uses real jobsite photography (already sourced); product screens/demos use plausible real-world data (real trade names, real line items), never "Lorem Ipsum" or generic SaaS placeholder content.

15. **When in doubt, cut — don't add.**
    *Why:* every principle above is a filter for saying no. A distinctive brand stays distinctive by refusing 10 additions for every 1 it accepts.
    *Implementation:* any new pattern proposal must name which existing pattern it replaces, or justify why none of the 14 principles above already covers the need.

---

## 3. Product philosophy (TradeOS — behavior, not slogans)

**What TradeOS should feel like:** a well-calibrated tool, not a "platform." Opening it should feel like picking up a level, not scrolling a feed — quiet, precise, immediately legible.

**What users should trust immediately:**
- Numbers are real and traceable (principle #10) — every estimate/total can be expanded to its source.
- The system never silently changes something a user entered — automation proposes, the user confirms.
- Status is always visibly current (StatusLED/online patterns) — no ambiguous "last synced" mysteries.

**What should never happen in the UI:**
- No modal-on-modal stacking. No auto-playing video/animation on a work screen. No marketing copy ("Unlock…", "Supercharge…") inside the product — product copy is instructional, not promotional.
- No destructive action without an explicit, specific confirmation ("Delete estimate #4021 for Wabash Property Mgmt?" — never a bare "Are you sure?").
- No hiding a total or a status behind an extra click if it drives a decision the user is about to make.

**Intentional trade-offs:**
- We choose density over whitespace for anyone managing >5 active projects — this will feel "busier" than a typical consumer SaaS demo, deliberately.
- We choose fewer, well-defended defaults over granular settings — some power users will want more configurability than we offer at first; that's an acceptable cost for keeping the tool usable for the other 95%.
- We choose showing our AI's reasoning (slower to read) over a magic black-box number (faster to read) — trust over speed, every time.

---

## 4. The contractor experience (primary user)

**Who:** owner-operators and small crews (2–30 people) in trades — plumbing, electrical, HVAC, roofing, general contracting. Often the person using TradeOS is also swinging a hammer that day.

**Environment:** truck cab, jobsite trailer, kitchen table at night. Frequently outdoors, on a phone with gloves on or a laptop balanced on a tailgate. Interrupted constantly — a call, a supplier, a crew question.

**Workflow:** bounces between bidding new work, tracking active jobs, and closing out finished ones — often in the same 10-minute window between tasks, not in a dedicated "office session."

**Constraints:** limited screen time, variable connectivity, no patience for onboarding flows, no dedicated IT support, often the sole person entering their own numbers.

**Expectations:** wants the tool to save time immediately, not "eventually with the free trial." Distrusts anything that feels like it's selling to them (hence Blueprint's restraint vs. Forge's persuasion).

### How this shapes design decisions
- **Layout:** primary actions reachable one-handed / one-thumb-friendly on mobile; no deeply nested navigation — the Contractor Experience punishes anything more than 2 taps to a common task.
- **Spacing:** compact by default (principle #4) — reflects real multi-project workloads, not a curated demo with 3 rows.
- **Typography:** `--ui-body: 14px` minimum, tabular numerals for anything financial — misread numbers on a job cost real money.
- **Density:** tables/lists default dense; comfortable spacing is an explicit user preference, not the default.
- **Navigation:** flat, task-oriented (Projects, Customers, Estimates) — not "modules" or "workspaces" language that reads as enterprise-SaaS bloat.
- **Color:** copper reserved for the one action that matters right now (principle #6) — a busy contractor scanning a screen should find it in under a second.
- **Interaction:** confirm destructive actions with specifics (principle above); autosave wherever possible — this user will not remember to click Save before an interruption.

---

## 5. Shared brand DNA vs. intentional divergence

**Always shared (non-negotiable, both brands):**
- Copper (`--color-copper` family) as the sole accent color, used per principle #6.
- Space Grotesk for any display/heading moment; Roboto Mono for any label/data/status moment; system sans for body/UI text.
- Voice: direct, trade-literate, no hype, no emoji (readme.md Content Fundamentals).
- Craftsmanship signal: hairline borders over shadows, tabular numerals, precise spacing — "engineered" over "designed."
- Terminology: "modules," "status: online," "installed" language for features — consistent metaphor across marketing and product (an OSModuleCard on the site describes the same service a TradeOS module performs).
- Green = online/success only, everywhere, no exceptions.

**Intentionally different (by register, not by accident):**
- **Surface:** Forge (dark) for 404 TradeOS marketing vs. Blueprint (light) for TradeOS product.
- **Density:** marketing is spacious/expressive (persuasion needs room to breathe); product is dense/compact (work needs everything visible).
- **Motion:** marketing motifs (crosshair, CRT hover, scanlines) are marketing-only signature flourishes; product motion is limited to state-change feedback only (principle #3).
- **Logo form:** full lockup (marketing) vs. wordmark-only (product) — see §1.
- **Weight of mono usage:** marketing uses mono sparingly for texture (eyebrows, terminal chrome); product uses mono functionally and constantly (every table, every ID, every timestamp).

---

## Review checkpoint

This document is the foundation every future website page, product screen, proposal, deck, doc, and merch item should be checked against. Confirm before Phase 3 (Brand Bible — the full source-of-truth document that formalizes all of Phase 1–2 plus the remaining foundations: mission/vision/values, full type/color/spacing specs, motion, photography, logo usage, print standards, accessibility).
