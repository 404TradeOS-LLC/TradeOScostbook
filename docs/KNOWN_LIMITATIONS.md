# TradeOS v1.0 Known Limitations

A candid list of what TradeOS v1.0 does not do, for support/sales/onboarding to set correct expectations with
users — and for engineering to track against as the real backlog. See `docs/V1_CHECKLIST.md` for the full
feature-by-feature categorization and `docs/LAUNCH_PLAN.md` for which of these block launch.

## Proposal & communication

- **"Send" does not email or text the customer.** Marking a proposal or invoice "sent" updates its status in
  TradeOS; it does not deliver anything to the customer on its own. Until this is closed (tracked as Required
  in the launch plan), the contractor must still get the PDF to the customer themselves.
- **No customer self-service portal.** Customers cannot log in, view, or respond to a proposal/invoice
  directly. Accept/reject/view-status changes are performed by the contractor's team on the customer's behalf.
- **No SMS notifications.**

## Account & access

- **No password reset.** If a user forgets their password, there is currently no self-service recovery flow.
- **No multi-factor authentication.**
- **No delegated/customer roles** — every logged-in user is an org member with one of `owner`/`admin`/
  `estimator`/`viewer`; there's no lighter-weight guest/customer login.

## AI Intake

- **The "AI Intake Brain" is deterministic, not an LLM.** Trade classification, follow-up questions, missing-info
  detection, and confidence scoring are all rule-based heuristics today, not a language model call. This was the
  intentional first pass (see `docs/TradeOS-Engineering-Playbook.md`); an OpenAI/Anthropic-backed version is
  planned but not built. Expect the questions/suggestions to be less flexible than "real AI" framing might imply.

## Billing & payments

- **No payment collection.** Invoices are billing documents only — TradeOS does not process, hold, or reconcile
  payments. Contractors still collect payment through their existing method (check, Stripe elsewhere, etc.).
- **No accounting integration** (QuickBooks, Xero, etc.).

## Contracts & signatures

- **In-house signature capture only** (typed name + drawn signature + IP/timestamp) — this is not a certified,
  legally-equivalent e-signature product like DocuSign or HelloSign. Confirm with legal counsel whether this
  meets the bar needed for binding contracts in your target jurisdictions before relying on it for anything
  legally significant.

## Suppliers & pricing

- **No live supplier price feeds.** The queue/review/approval workflow for supplier-submitted price changes is
  fully built, but nothing currently feeds it real data — there is no connected supplier API. Material price
  updates today are manual.

## Scheduling, reporting, and other modules

- **No scheduling or crew/job calendar.**
- **No reporting/analytics dashboards** beyond the internal admin ops pages (which are not customer-facing).
- **No native mobile app.** TradeOS v1.0 is a responsive web app; it works in a mobile browser but is not an
  installable iOS/Android app.
- **English only** — no localization/multi-language support.
- **No broader CRM features** — no lead pipeline, task/follow-up reminders, or communication log beyond the
  Customer/Project records themselves.

## Operational

- **Production monitoring/alerting is not yet in place** — if the API goes down or starts erroring, there is no
  automated alert; this is tracked as a launch blocker in `docs/LAUNCH_PLAN.md`, not a permanent limitation.
- **The `production` GitHub Environment has no required-reviewer approval gate** on migration deploys — a
  `workflow_dispatch` run executes immediately once triggered. Treat production migration runs as a manual,
  careful action until this is resolved.
- **No documented disaster-recovery drill.** Supabase provides platform-level backups, but TradeOS has not
  exercised or timed an actual restore.

## Scope note

TradeOS also contains a substantial, fully-built, and independently-tested cost-book/estimating system
(detailed Estimate Engine, Change Orders, full Invoice/Contract lifecycle, Supplier CRUD) from an earlier,
broader product direction. Depending on the launch narrative decided in `docs/LAUNCH_PLAN.md` Phase 0, some of
this may be intentionally de-emphasized or hidden in v1.0 rather than "missing" — check the current onboarding
flow/nav to see what's actually surfaced to a given user before assuming a feature listed as built here is
visible to customers.
