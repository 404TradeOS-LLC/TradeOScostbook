# AI Estimating Architecture

**Status:** Architecture only. Nothing in this document has been implemented. It is a design for the next major capability layer of TradeOS Cost Book, written against the system as it actually exists today (see "Grounding" below), not against a green field.

**Role of this document:** this is the reference future AI estimators, retrieval systems, and agents in this product should be built against. It intentionally does not specify code, schemas, libraries, or file layouts — those are implementation decisions for whoever picks up each phase. It does specify data flow, retrieval strategy, confidence semantics, and review gates precisely enough that two different implementers would build compatible systems.

---

## 1. Grounding: what already exists

This design extends real, shipped mechanisms rather than inventing a parallel system. The table below is the load-bearing context for every section that follows.

| Concern | What exists today | Where |
|---|---|---|
| Scope classification | Deterministic keyword-rule trade classifier over 22 trades (`Deck`, `Roofing`, `Kitchen Remodel`, …), scored by keyword-hit count, no ML | `modules/project-intake/classifier.ts` |
| Missing-info detection | Per-trade field checklists (dimensions, material, permit, …) evaluated with regexes and keyword lists against the raw scope string | `modules/project-intake/questions.ts` |
| Confidence scoring | Deterministic penalty formula: `100 − missingCritical×20 − missingRecommended×8 − missingOptional×3`, mapped to a 5-level label | `modules/project-intake/confidence.ts` |
| Proposal drafting | Deterministic template fill (per-trade timeline strings, fixed assumptions/exclusions, linear price-per-sqft bands) | `modules/project-intake/proposalDraft.ts` |
| Site visit capture | `SiteVisit` already persists `transcript`, `notes`, `measurementsJson`, `aiQuestionsJson`, `missingInfoJson`, `confidenceScore`, `intakeResultJson` per project — i.e., the intake record already has a voice-transcript slot and a structured-output slot | `prisma/schema.prisma` (`SiteVisit`) |
| File capture | `ProjectFile` stores `fileType`/`fileUrl`/`fileName`/`storagePath` per project — generic enough to hold photos today, with no photo-specific metadata (no EXIF, no room/area tag, no annotation) | `prisma/schema.prisma` (`ProjectFile`) |
| Cost book | Org-scoped `CostItem` (labor rate + material + equipment + subcontractor rollup) organized under `Division → Category → Subcategory` | `prisma/schema.prisma`, `modules/cost-database/` |
| Assemblies | `Assembly` → `AssemblyItem` recursive tree (cost items and/or nested child assemblies), rolled up to a unit cost; `isTemplate` flag marks reusable starting points vs. one-off job assemblies | `prisma/schema.prisma` (`Assembly`, `AssemblyItem`), `modules/assemblies-database/` |
| Search today | `CostDatabaseService.search()` / `AssembliesDatabaseService.search()` — substring/keyword search, no embeddings, no ranking beyond DB match | `modules/cost-database/service.ts`, `modules/assemblies-database/service.ts` |
| Estimate | `Estimate` → `EstimateLineItem` (cost-item or assembly sourced), org-configurable markup-vs-target-margin pricing | `modules/estimate-engine/` |
| Proposal / Contract / Invoice | Full persisted lifecycles: `draft → sent → viewed → accepted/rejected`, contract signature capture gated on an accepted proposal, invoice full/progress billing | `modules/proposals/`, `modules/contracts/`, `modules/invoices/` |
| Change orders | Draft-editable, approval-gated, sequential per-project numbering | `modules/change-orders/` |
| Closeout | **Does not exist yet** — no entity, no module. This is new scope introduced by this document. | — |
| Multi-tenancy | Every tenant table is under forced PostgreSQL RLS, scoped by `org_id` derived from a verified session, never from a client-supplied header alone | `prisma/migrations/*_enable_org_rls*`, `backend/auth/session.ts` |
| Existing AI plan | `docs/frontend-platform-completion-plan.md` §5 already scopes a narrower "AI Estimate Assist" slice: scope text → suggested line items → per-line accept/edit/reject → committed via the existing line-item endpoint, AI never writes to the DB directly, suggestions logged to a feedback table | `docs/frontend-platform-completion-plan.md` |

Two things follow directly from this table and shape everything below:

1. **The org's own cost book and history is the knowledge base.** There is no generic national pricing database anywhere in this system, and the existing plan explicitly rejects "generic AI pricing" as a goal. Retrieval must be scoped to one organization's data, the same way every SQL query in this system already is.
2. **Deterministic components are not being thrown away.** The keyword classifier, missing-info checklists, and confidence formula are cheap, instant, offline-capable, and already tuned per trade. The architecture below treats them as the **fallback tier** and first-pass filter beneath an LLM/retrieval tier, not as legacy code to delete.

---

## 2. Guiding principles

- **Human-in-the-loop, always.** No AI output is ever auto-committed to a costed, priced, or contractual record. Every stage that touches money or a customer-facing document ends in an explicit accept/edit/reject action, mirroring the accept-per-line pattern already specified for AI Estimate Assist and the send/accept/sign gates already built into Proposal/Contract/Invoice.
- **Org-scoped knowledge, not general knowledge.** Retrieval indexes are partitioned by `org_id` with the same rigor as RLS. An org's estimating AI should never surface another org's cost items, prices, or historical estimates — this is a tenancy-isolation requirement, not just a relevance requirement.
- **Deterministic-first, AI-augmented.** Cheap deterministic checks (trade classification, missing-field detection, arithmetic rollups) run first and always. AI is layered on top to improve recall and produce natural-language output, never to replace the parts that are already reliable and free.
- **Every AI output carries a confidence score and a provenance trail.** "Why did the system suggest this assembly / this price / this clause" must be answerable from stored data, not from re-running the model.
- **Progressive disclosure of autonomy.** Early phases (below, §9) surface suggestions a human reviews line-by-line. Only after a suggestion type has an established accept-rate track record does the architecture allow tighter automation (e.g., pre-filling a field silently rather than flagging it as a suggestion).
- **The pipeline is a spine, not a monolith.** Photos → Voice → Scope → Retrieval → Matching → Cost Items → Estimate → Proposal → Contract → Invoice → Change Orders → Closeout is a sequence of independently reviewable artifacts, each persisted, each re-enterable. A contractor can stop at "Scope of Work" and manually build the rest, or use AI assistance at every step — the pipeline is not all-or-nothing.

---

## 3. The pipeline

```
 Photos ──┐
          ├──▶ Scope of Work ──▶ Knowledge Retrieval ──▶ Assembly Matching ──▶ Cost Items
 Voice ───┘                                                                        │
                                                                                    ▼
 Closeout ◀── Change Orders ◀── Invoice ◀── Contract ◀── Proposal ◀── Estimate ◀───┘
```

Each stage below is described as: **Input → Processing → Output**, the confidence signal it produces, the human review gate that must clear before the artifact is considered final, and how it maps onto existing or net-new persistence.

### 3.1 Photos

- **Input:** one or more site photos attached to a project (pre-work condition, existing structure, problem areas), optionally geotagged/timestamped by the capturing device.
- **Processing:** vision-model description pass extracts a structured photo note per image — visible materials, visible condition issues (rot, cracking, water staining, code violations), rough scale cues if a reference object is present. This is descriptive extraction, not measurement — the model is not asked to produce dimensions from a photo alone.
- **Output:** a short structured caption + tag set per photo (e.g., `{ subjects: ["deck ledger board"], conditions: ["visible rot"], suggestedTrade: "Deck" }`), attached to the existing file record.
- **Confidence signal:** per-tag confidence from the vision model; low-confidence tags are surfaced but not used to silently drive downstream trade classification.
- **Review gate:** none required to *store* the photo (that already works today); a review gate exists only where a photo-derived tag is about to influence the Scope of Work draft (§3.3).
- **Persistence:** extends the existing generic file record with photo-specific structured output (captions/tags/condition flags) rather than replacing it — the file record already has the right shape (`fileType`, `fileUrl`) to be a home for this.

### 3.2 Voice

- **Input:** a field recording (site-visit walkthrough, a phone call, a voicemail) or a live dictation during intake.
- **Processing:** speech-to-text transcription, followed by a light structuring pass that separates the transcript into scope-relevant statements vs. logistics/small talk, and extracts any explicit numbers mentioned (dimensions, counts, "about 300 square feet").
- **Output:** a transcript plus a structured extraction pass — this is exactly the shape `SiteVisit.transcript` / `SiteVisit.measurementsJson` already anticipate.
- **Confidence signal:** transcription confidence (ASR-native) and extraction confidence (did the structuring pass find explicit measurements or is it inferring).
- **Review gate:** the raw transcript is always shown alongside any extracted numbers so a human can spot a transcription error before it becomes a scope assumption.
- **Persistence:** `SiteVisit` as it exists today.

### 3.3 Scope of Work

This is the synthesis point where photos, voice, and any free-typed text merge into one scope statement — and where the existing deterministic intake brain already operates today, on text alone.

- **Input:** free-typed scope text (works standalone today) plus, when available, photo tags (§3.1) and voice extraction (§3.2).
- **Processing, two tiers:**
  1. **Deterministic tier (existing, unchanged):** `classifyScope` → `getMissingInformation` → `getFollowUpQuestions` → `calculateConfidence` runs first, on the merged text, exactly as it does today. This tier is fast, free, and offline-capable, and its output is always computed even when the AI tier below also runs.
  2. **AI tier (new):** an LLM pass takes the same merged input plus the deterministic tier's trade/category/missing-field output as context, and produces a natural-language scope narrative, reconciles any conflicts between photo tags, voice extraction, and typed text (e.g., voice mentions "300 sq ft," a photo tag suggests a much larger structure — surfaced as a conflict, not silently resolved), and can *propose* a trade classification when the deterministic keyword rules score zero (e.g., novel phrasing the keyword list doesn't cover).
- **Output:** a `IntakeResult`-shaped record (trade, project type, category, missing information, follow-up questions, confidence) exactly as produced today, with the AI tier able to widen (never override) the deterministic tier's findings — e.g., add a missing-info item the checklist didn't have a rule for, but never silently reclassify a trade the keyword rules were confident about.
- **Confidence signal:** the existing 0–100 deterministic score remains authoritative for "is this scope statement complete enough for the next stage." The AI tier's own confidence (e.g., how sure it is about a conflict-resolution or a novel-phrasing trade guess) is tracked separately and never blended into the deterministic score — see §6 for why these stay separate.
- **Review gate:** any follow-up question generated (deterministic or AI-sourced) must be answered or explicitly dismissed before the scope is marked "ready for estimating." This mirrors the existing `followUpQuestions` mechanism, just with a second source feeding it.
- **Persistence:** `SiteVisit.intakeResultJson` as it exists today, extended (conceptually — no schema given here) to distinguish deterministic-sourced vs. AI-sourced findings so a reviewer can tell which is which.

### 3.4 Knowledge Retrieval

Full design in §5. In pipeline terms: takes the finalized Scope of Work and returns a ranked, org-scoped set of candidate knowledge — prior similar estimates, relevant assemblies, relevant cost items, and relevant trade reference notes (permit rules, production-rate norms) — that the next two stages consume.

- **Input:** finalized scope narrative + trade/category classification from §3.3.
- **Output:** a ranked retrieval bundle: `{ similarEstimates[], candidateAssemblies[], candidateCostItems[], referenceNotes[] }`, each item carrying a retrieval score and a reason ("matched on: deck, composite decking, guard rail" style term-level explainability, not just a bare cosine score).
- **Confidence signal:** retrieval score distribution — a scope with one dominant high-scoring assembly match behaves very differently downstream than one with five weakly-scoring, similarly-ranked candidates (§6).
- **Review gate:** none by itself — retrieval output is intermediate. It becomes reviewable once it's turned into concrete suggestions in §3.5.

### 3.5 Assembly Matching

Full design in §5.3. Turns the retrieval bundle into concrete, quantity-estimated assembly and cost-item suggestions.

- **Input:** retrieval bundle (§3.4) + any explicit measurements from §3.1/§3.2 (square footage, linear footage, unit counts).
- **Processing:** for each candidate assembly, the model estimates a quantity (e.g., "310 sq ft of decking" → assembly unit is per-sq-ft → quantity 310) grounded in extracted measurements where available, flagged as an assumption where not. Candidates the model has low confidence in, or where no assembly exists at all, fall back to individual cost-item suggestions (the same mechanism as the existing AI Estimate Assist plan) rather than being forced into a poor-fit assembly.
- **Output:** a review list of `{ assemblyOrCostItem, suggestedQuantity, unitOfMeasure, confidence, matchReason, quantitySource: "extracted" | "assumed" }` rows — deliberately the same shape as the line-item review list already specified in the existing completion plan, so this slots into that UI rather than requiring a new one.
- **Review gate:** every row is accept/edit/reject, per-line, before it becomes a real `EstimateLineItem`. Nothing here writes to `Estimate`/`EstimateLineItem` directly — accepted rows call the same `POST /api/v1/estimates/:id/line-items` path a manual add already uses.

### 3.6 Cost Items

Not a distinct AI stage — this is the accepted output of §3.5, priced by the org's real `CostItem`/`Material`/`LaborRate`/`Equipment` records exactly as manual line-item entry already is. No AI ever invents a price; it only selects and quantifies existing org-owned cost data. This is the single most important invariant in the whole pipeline: **prices always come from the cost book, never from the model.**

### 3.7 Estimate

- **Input:** accepted line items from §3.5/§3.6.
- **Processing (new, optional):** a **pricing/margin advisor** pass (see §9) can suggest an overhead/profit percentage or target margin, informed by the org's historical won/lost estimates for similar scopes — e.g., "jobs classified as Deck in the last 12 months closed at a median 28% margin; this estimate is currently at 18%." This is advisory only.
- **Output:** the existing `Estimate` rollup (`subtotalCost`, `totalPrice`), unchanged in mechanism — the arithmetic stays deterministic (`modules/estimate-engine/formulas.ts`), only the *inputs* (margin suggestion) are AI-assisted.
- **Review gate:** the estimator sets/confirms the actual markup or target margin; a suggestion is never silently applied.

### 3.8 Proposal

- **Input:** a finalized estimate (as today).
- **Processing:** extends the existing deterministic `buildProposalDraft` (per-trade timeline strings, fixed assumption/exclusion lists) with an LLM pass that personalizes scope-of-work prose to the specific job's retrieved context (e.g., referencing the specific conditions noted in photos/voice, rather than a generic per-trade paragraph), and can draft trade-specific assumptions/exclusions beyond the current fixed list when the retrieval bundle surfaced something notable (e.g., a photo flagged visible rot → an assumption about concealed-damage handling gets suggested, not silently added).
- **Output:** a proposal draft in the exact same shape `Proposal` already persists (`scopeOfWork`, `assumptions`, `exclusions`, `timeline`, `paymentScheduleJson`) — AI only changes how those fields get their first draft value, never the lifecycle around them.
- **Review gate:** unchanged — a `Proposal` still moves `draft → sent → viewed → accepted/rejected` exactly as today; AI only assists at the `draft` authoring step.

### 3.9 Contract

No new AI surface at this stage beyond what proposal drafting already feeds it (terms text can draw on the same retrieval context — e.g., a scope with a permit noted in §3.3 can prompt a permit-responsibility clause). Signature capture, immutability-once-signed, and creation-only-from-an-accepted-proposal all remain exactly as built.

### 3.10 Invoice

- **New AI surface:** a **progress-billing recommendation** — given the accepted proposal's payment schedule and (once change orders/closeout exist) actual job-completion signals, suggest a `percentComplete` for a progress invoice rather than requiring the estimator to compute it manually. Advisory only; the numeric invoice amount is always the deterministic percent-of-estimate calculation already implemented, never a model-generated dollar figure.

### 3.11 Change Orders

- **New AI surface:** a **scope-drift detector**. When new site photos, voice notes, or field updates are attached to a project that already has an active estimate/proposal, compare the new material against the original Scope of Work retrieval context (§3.4) and flag material deltas ("original scope did not mention deck stairs; the latest site photo shows a stair structure") as a *candidate* change order, never an automatically created one. This directly extends the existing draft-editable change-order workflow — the AI's output is a pre-filled draft change order description + suggested line items, entering the exact same draft → line-item-edit → approve lifecycle that already exists.

### 3.12 Closeout

This is new: no entity or module exists for it today. It is the pipeline's final stage and the feedback point that makes the whole system learn.

- **Input:** a completed project — final invoice paid, contract fulfilled, any change orders resolved.
- **Processing:** an AI pass assembles a closeout package (final scope-vs-actual summary, punch-list-style outstanding-items check drawn from any unresolved follow-up questions or flagged scope-drift items across the project's lifetime, a warranty/documentation checklist appropriate to the trade) and — critically — writes a structured **estimate-accuracy record**: predicted cost/price vs. actual invoiced total, which suggestions were accepted/edited/rejected at each stage, and final realized margin. This record is what §5's retrieval index and §6's confidence calibration are trained/tuned against for future jobs of the same trade.
- **Output:** a closeout summary document (customer-facing) + an internal accuracy record (not customer-facing, feeds retrieval/confidence).
- **Review gate:** the closeout summary is reviewed and released like any other customer-facing document; the internal accuracy record is written automatically once a project reaches a terminal state (paid invoice, no open change orders) — it's telemetry, not a decision, so it doesn't need a human gate, but it must be visible/auditable (§8).
- **Persistence implication (conceptual, not specified here):** a new project-closeout entity and a new per-suggestion accuracy log are needed. Left to implementation.

---

## 4. Why retrieval, not fine-tuning

Fine-tuning a model per organization is rejected as a strategy: it doesn't compose with multi-tenancy (one fine-tuned model per org is an operational and cost non-starter at this product's scale), it can't be kept current as an org's cost book changes daily (material price updates already flow through `MaterialPriceAudit` — a fine-tuned model would go stale the moment a price changes), and it produces no provenance ("why did it suggest this" is unanswerable from a fine-tuned weight delta, but is directly answerable from "here are the three retrieved documents it was shown"). Retrieval-augmented generation, scoped per-org at query time, is the only approach compatible with this system's existing multi-tenant, audit-everything design.

---

## 5. Knowledge Engine and RAG strategy

### 5.1 What counts as "knowledge"

Four distinct corpora, each with different freshness and retrieval characteristics:

1. **Cost book knowledge** — `CostItem` (name, description, unit of measure, division/category/subcategory), `Assembly` (name, description, composition), `Material` (name, unit cost, supplier). This is the org's own priceable inventory. High freshness sensitivity: a `MaterialPriceAudit` write should be able to invalidate any cached retrieval result touching that material.
2. **Historical project knowledge** — past `Estimate`/`Proposal`/`ChangeOrder`/closeout records for the org, especially ones with a closeout accuracy record (§3.12). This is "how have we actually scoped and priced jobs like this before," and it's the corpus that makes suggestions organization-specific rather than generic.
3. **Trade reference knowledge** — non-priced, non-org-specific-but-org-curated notes: local permit thresholds, code-minimum reminders, typical production-rate ranges, standard payment-schedule structures. This is closer to a knowledge base article than a cost record — it doesn't come from the cost book, it comes from what estimators have documented as "things worth remembering" for a trade. Unlike the other three corpora, this one is a reasonable candidate for a curated, shared starting set (e.g., "deck guard-rail height code minimums are commonly 36in") an org can extend — but any shared baseline content must be clearly provenanced as non-org-specific so it's never confused with the org's own priced data.
4. **Site-specific knowledge** — the current project's own photos, voice transcripts, and scope text (§3.1–§3.3). This is retrieval-adjacent but scoped to a single job, not the org's whole history; it's really "context," not "corpus," and doesn't need a persistent index — it's assembled fresh per request from the current project's records.

### 5.2 Tenancy: the hard constraint

Every retrieval index over corpora 1 and 2 **must** be partitioned by `org_id` with the same non-negotiability as the existing RLS policies. Concretely, this means:

- Vector/embedding storage is not just filtered by `org_id` at query time as an optimization — it is a hard, defense-in-depth-matching boundary. If the retrieval store is a separate system from Postgres (a dedicated vector database, or `pgvector` inside the same Postgres instance), it must enforce org partitioning at least as strictly as forced RLS does for every other tenant table, whether that's a metadata filter enforced at the query layer, per-org index/collection isolation, or (if colocated in Postgres) the exact same forced-RLS treatment every other tenant table already has.
- Corpus 3 (trade reference knowledge) is the one exception where cross-org shared content is architecturally sound — but it must be a visibly separate, clearly-labeled index, never merged into the same retrieval call as an org's private cost/history data in a way that could blur provenance in the output.
- A retrieval bug that leaks org A's historical pricing into org B's suggestions is a tenancy breach of the same severity as an RLS bypass, and should be tested with the same rigor the existing `tests/rls.integration.ts` live cross-tenant suite already applies to database access.

### 5.3 Retrieval flow

```
Scope of Work (finalized, §3.3)
        │
        ▼
 Query construction
   - trade/category (from deterministic classifier — always present)
   - key terms extracted from scope narrative
   - extracted measurements (as retrieval filters, not just payload)
        │
        ▼
 Parallel multi-source retrieval (all queries carry org_id as a hard filter)
   ┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
   │ Cost item search │ Assembly search │ Historical       │ Trade reference │
   │ (hybrid: keyword │ (hybrid: keyword│ estimate search  │ search (shared, │
   │ + embedding over │ + embedding over│ (embedding over  │ separately      │
   │ name/description)│ name/description│ scope narrative +│ labeled index)  │
   │                  │ + composed item │ closeout accuracy│                 │
   │                  │ text)           │ records)         │                 │
   └────────┬─────────┴────────┬────────┴────────┬─────────┴────────┬────────┘
            │                  │                  │                  │
            ▼                  ▼                  ▼                  ▼
                     Re-ranking (per source, then cross-source)
                - trade/category match boost
                - recency boost for historical estimates (closeout-verified > unverified)
                - isTemplate boost for assemblies (prefer curated templates over one-off
                  assemblies built for an unrelated past job)
                - term-overlap explainability tag attached to every surviving candidate
                        │
                        ▼
              Context assembly (bundle, §3.4 output)
              - capped candidate count per source (avoid context-window bloat)
              - every candidate retains its score + reason, not just its content
                        │
                        ▼
              Assembly Matching (§3.5, §5.4) / Proposal drafting (§3.8) consume the bundle
```

- **Hybrid retrieval, not embedding-only.** Keyword/exact-match search already exists and works today (`CostDatabaseService.search`, `AssembliesDatabaseService.search`) for cases like an estimator typing an exact cost-item code. Embedding-based semantic search is additive — it catches paraphrase and cross-trade-vocabulary matches keyword search misses (e.g., scope says "resheet the roof," a cost item is named "roof decking replacement") — not a replacement for keyword precision.
- **Freshness.** Corpus 1 (cost book) must reflect the *current* price the moment a `MaterialPriceAudit` or cost-item edit happens — retrieval must never surface a stale unit cost that then gets carried into a suggested line item at the wrong price. Corpus 2 (historical estimates) is inherently append-only and doesn't need invalidation, only steady ingestion of new closeout accuracy records over time.
- **Explainability is not optional.** Every retrieved candidate must carry a human-readable reason it matched, surfaced in the eventual review UI, not just to the model. "Matched because: same trade (Deck), similar linear footage (280ft vs. this job's 310ft), used successfully on 3 prior jobs" is what makes a suggestion something an estimator can quickly evaluate rather than a black box they either blindly trust or ignore.

### 5.4 Assembly matching, in detail

Two-stage, deliberately not a single retrieval-then-done step:

1. **Candidate retrieval** (§5.3) produces a ranked shortlist of assemblies and standalone cost items — cast a reasonably wide net here, precision comes in stage 2.
2. **Structured selection and quantity inference.** An LLM pass, given the shortlist plus the scope narrative and any extracted measurements, performs three things per candidate: (a) accept/reject as relevant to this specific job, (b) infer a quantity grounded in extracted measurements where present, or explicitly flagged as an assumption when the model has to infer a reasonable default, (c) for accepted `Assembly` candidates that are `isTemplate = true`, prefer them over similarly-scoring one-off assemblies from unrelated past jobs, since templates are the org's own curated "this is the right starting composition" signal.

Fallback behavior is explicit, not an error path: if no assembly clears an acceptance threshold, the system falls back to individual cost-item suggestions (still going through the same accept/edit/reject review list) rather than forcing a low-confidence assembly match or producing no suggestion at all. A job with no good assembly match is common (novel scope) and should degrade gracefully to "here are relevant individual cost items," which is exactly what a human estimator does manually today.

---

## 6. Confidence scoring

Confidence is deliberately **multi-layered and never collapsed into one number until the point of a review-gate decision.** Four distinct confidence signals feed the pipeline, and they stay legible as separate signals because they fail independently and a reviewer needs to know *which one* is low:

1. **Scope completeness confidence** — the existing deterministic 0–100 score from `calculateConfidence`, unchanged. This answers "do we have enough information to estimate this job at all."
2. **Retrieval confidence** — derived from the score distribution of retrieved candidates (§5.3): a single dominant match vs. several weak, similarly-scored candidates are different situations even at the same top score. A peaky distribution (one strong match, others far behind) is high retrieval confidence; a flat distribution (many similarly-weak matches) is low, and should be surfaced as "several possible matches, none clearly best" rather than silently picking the top-scored one.
3. **Assembly/cost-item match confidence** — per-suggestion, from the structured-selection pass (§5.4): how confident the model is that this specific assembly fits this specific job, separate from how confident retrieval was that the assembly was even relevant.
4. **Historical accuracy confidence** — a calibration signal, not a per-suggestion score: for a given trade/suggestion-type, what has this org's actual accept/edit/reject rate been historically (from the closeout accuracy records, §3.12)? A suggestion type with a 90% historical accept rate for Deck jobs earns more trust in its own confidence claims than a suggestion type that's new or has a track record of frequent edits. This is the mechanism by which the system's stated confidence gets checked against reality over time, and is the basis for any future move toward tighter automation (§2, progressive disclosure of autonomy).

**Gating:** each review gate in the pipeline (§3) consumes these signals to decide *how* to present a suggestion, not whether to show it — suggestions are always shown, never silently withheld, but a low-confidence suggestion should be visually distinct (e.g., "assumed, not extracted" quantity tags in §3.5) and a low scope-completeness score should block progression past §3.3 until follow-up questions are resolved, exactly as the deterministic system already gates today.

---

## 7. Review workflow

The review workflow is the same pattern repeated at every stage, because the pipeline is designed around one invariant: **AI produces drafts; humans produce commitments.**

```
AI-generated candidate/suggestion
        │
        ▼
  Presented with: content, confidence signal(s), match/retrieval reason,
                  and (where applicable) an "assumed vs. extracted" provenance tag
        │
        ▼
  Human action: Accept  │  Edit  │  Reject
        │                   │        │
        ▼                   ▼        ▼
  Committed via the      Committed  Discarded,
  existing write path    with the   logged as a
  (line-item add,        edited     rejection —
  proposal field save,   value      this is the
  change-order draft,                signal that
  etc.) — never a                    improves
  path the AI writes                 future
  to directly                        suggestions
        │
        ▼
  Logged to a suggestion/decision record: stage, input, suggested output,
  confidence at time of suggestion, human action taken, final committed value
  if different from the suggestion, timestamp, acting user
```

This generalizes the accept/edit/reject line-item review already specified for AI Estimate Assist in the existing completion plan to every AI-touched stage in this pipeline (scope conflict resolution, assembly matching, proposal drafting, margin suggestions, change-order drift detection, closeout summaries). The decision log is what makes §6's historical accuracy confidence and any future prompt/model iteration possible — it is explicitly the same "log every suggestion alongside the estimator's decision" mechanism the existing plan already calls for, just applied pipeline-wide rather than to line items alone.

**Escalation path for low confidence:** rather than presenting a low-confidence suggestion as if it were equally trustworthy, the system routes it through the existing follow-up-question mechanism (§3.3) — a low-confidence assembly match, for instance, can surface as "we found a possible match but aren't confident about X — can you confirm?" rather than a flat suggestion row. This keeps the review burden proportional to actual uncertainty instead of putting equal friction on every suggestion regardless of confidence.

---

## 8. Auditability

Every AI-touched artifact in this pipeline must be traceable back to: what was retrieved, what the model was shown, what it produced, what confidence it claimed, and what a human ultimately decided. This is not a new principle for this codebase — it's the same standard already applied to membership changes (`organization_membership_audits`) and material pricing (`material_price_audits`). The suggestion/decision log in §7 is this pipeline's equivalent audit trail, and should be held to the same bar: admin-readable, append-only, and reviewable independent of re-running the model.

---

## 9. Future AI agents

Framed as an **orchestrator + specialist agents** model rather than one monolithic prompt: a lightweight orchestrator tracks pipeline state per project (which stage is active, what's pending review) and invokes narrow, single-responsibility agents for each stage. This mirrors the pipeline's own stage boundaries and keeps each agent's context small, its failure modes isolated, and its output independently testable — a change to how Proposal drafting works shouldn't risk regressing Assembly Matching.

| Agent | Responsibility | Extends |
|---|---|---|
| **Scope Intake Agent** | Multimodal synthesis of photos + voice + typed text into a reconciled scope narrative; conflict flagging | `modules/project-intake/` (deterministic tier retained as first pass) |
| **Knowledge Retrieval Agent** | Executes the hybrid multi-source retrieval in §5.3, returns a scored, explained bundle | New — sits in front of `cost-database`/`assemblies-database` search |
| **Assembly Matching Agent** | Structured selection + quantity inference over the retrieval bundle (§5.4) | New — feeds the existing `POST /api/v1/estimates/:id/line-items` path |
| **Pricing/Margin Advisor Agent** | Suggests overhead/profit or target margin from historical won/lost performance for similar scopes | New — advisory input to `modules/estimate-engine/` |
| **Proposal Writing Agent** | Personalizes scope-of-work/assumptions/exclusions prose using retrieved job-specific context | `modules/project-intake/proposalDraft.ts` (deterministic templates retained as fallback) |
| **Change Order Drift Agent** | Detects material scope deltas from new site input against the original scope's retrieval context; drafts a candidate change order | New — feeds the existing draft change-order workflow |
| **Progress Billing Agent** | Recommends `percentComplete` for a progress invoice from job-completion signals | New — advisory input to `modules/invoices/` |
| **Closeout Agent** | Assembles the closeout summary and writes the estimate-accuracy record that trains §6's historical confidence | New — the pipeline's terminal stage |
| **Supplier Price Reconciliation Agent** | LLM-assisted anomaly detection on incoming supplier price feeds (e.g., "this proposed price is a 340% jump — flag for extra scrutiny") ahead of the existing human-approval queue | `modules/supplier-integration/` (deterministic queue/approval mechanism retained unchanged) |

None of these agents are permitted to bypass the review gates in §3/§7 — "agent" here means "a narrow, composable unit of AI work with its own tools and context," not "an autonomous actor with write access." The orchestrator's job is sequencing and state tracking, not authority to commit on a human's behalf.

---

## 10. Model and cost strategy (architecture-level, not implementation)

- **Route by task complexity, not one model for everything.** Deterministic-tier work (trade classification, missing-field checks, arithmetic) stays exactly as cheap as it is today — zero model calls. Cheap/fast model tiers are appropriate for structured extraction and re-ranking (§3.2 extraction, §5.3 re-ranking). Larger/more capable model tiers are reserved for synthesis tasks that need genuine reasoning and natural prose: scope narrative reconciliation (§3.3), proposal drafting (§3.8), closeout summarization (§3.12).
- **Structured output, not free text, for anything that feeds a committed record.** Any model output that will become a line item, a suggested field value, or a confidence score must be constrained to a defined shape the review UI can render deterministically — never parsed out of free-form prose. (The existing completion plan already calls for exactly this via tool-calling/structured-output schemas; this document extends the same requirement to every stage, not just line-item suggestions.)
- **Cost is bounded by the review-gate design itself.** Because nothing auto-commits, there's no risk of runaway agentic loops re-invoking themselves against their own output — every AI stage produces one bounded suggestion set and stops, waiting on a human action to advance the pipeline.

---

## 11. Rollout phasing

Sequenced so each phase is independently shippable and de-risks the next, and so the historical-accuracy signal (§6) has real data to work from before later phases lean on it:

1. **Phase A — Retrieval-only assist.** Ship Knowledge Retrieval (§5) and Assembly Matching (§3.5/§5.4) against the existing AI Estimate Assist scope already planned in `docs/frontend-platform-completion-plan.md` §5. This is the minimum viable slice: scope text in, ranked suggestions out, accept/edit/reject, logged. No photos/voice yet, no proposal/invoice/change-order agents yet.
2. **Phase B — Multimodal intake.** Add Photos (§3.1) and Voice (§3.2) processing feeding the Scope Intake Agent, building on `SiteVisit`'s already-present transcript/measurement slots.
3. **Phase C — Downstream document agents.** Proposal Writing Agent, Pricing/Margin Advisor, Progress Billing Agent — lower-risk since these produce editable drafts of documents whose lifecycle machinery is already fully built.
4. **Phase D — Change Order Drift and Closeout.** These depend on having enough completed Phase A/B/C history to be useful (drift detection needs an original scope's retrieval context to compare against; closeout accuracy records need real accept/edit/reject history to be meaningful). This phase is also what unlocks tighter historical-accuracy-informed confidence (§6) for everything upstream.
5. **Phase E — Progressive autonomy review.** Only after Phase D has produced enough decision-log data (§7/§8) to evaluate real accept rates per suggestion type, revisit whether any individual, consistently-high-accuracy suggestion type earns reduced review friction. This is a deliberate, data-gated decision point, not a default trajectory — the system does not get more autonomous over time by default.

---

## 12. Open questions / risks

- **Shared trade-reference corpus governance (§5.1, corpus 3).** Who curates it, how is it kept from silently becoming a de facto "generic AI pricing" source in spirit even if not in literal dollar figures — needs a policy decision, not just an architecture decision.
- **Vector/embedding infrastructure choice** (dedicated vector database vs. `pgvector` colocated with the existing forced-RLS Postgres) has real tenancy-enforcement tradeoffs (§5.2) that should be resolved before Phase A ships, since it's the harder of the two to migrate away from later.
- **Photo PII/sensitivity.** Site photos may capture more than the job (people, license plates, interior of an occupied home). Retention and redaction policy is unaddressed here and needs its own review before Phase B.
- **Cold-start orgs.** A brand-new org has no historical estimates and no closeout accuracy records — Phase A's retrieval bundle for corpus 2 (§5.1) will be empty for every new signup. The architecture degrades gracefully (falls back to corpus 1 + corpus 3 + deterministic tier), but this should be explicitly tested, not just assumed to work.
- **Suggestion fatigue.** If every stage always surfaces a suggestion regardless of confidence (§7's stated design), there's a real risk of estimators learning to reflexively accept without reading once trust is established. The confidence-proportional friction in §7 is the mitigation, but its effectiveness is an empirical question for post-Phase-A review, not something this document can settle in advance.
