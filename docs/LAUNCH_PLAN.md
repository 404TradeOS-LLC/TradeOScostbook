# TradeOS v1.0 Launch Plan

Companion to `docs/V1_CHECKLIST.md` (what's required) and `docs/KNOWN_LIMITATIONS.md` (what to tell users).
This document is the recommended sequence to get from today's state to a real v1.0 launch.

## Where we actually are today

- Backend: 249/249 unit tests, 33 suites, green. Live Postgres RLS integration suite (`npm run test:integration`) green.
- Frontend: `web` builds and lints clean. 20 routes covering the full Customer → Project → Intake → Proposal →
  (Estimate/Invoice/Contract) flow.
- Database: forced RLS multi-tenancy, tracked Prisma migrations, automated rollout script, previously verified
  live against a real Supabase project.
- The single most important gap: **"Send" doesn't send anything.** Proposal and invoice "send" actions only
  flip a status flag — there is no outbound email/SMS, and no link a customer can click to view or respond.
  Every other launch decision is secondary to closing this, because it's the product's entire value proposition
  ("get a professional proposal in front of the customer fast").

## Recommended sequence

### Phase 0 — Decide the launch narrative (before any more building)

Resolve the open flag at the bottom of `docs/V1_CHECKLIST.md`: is v1.0 the narrow AI-intake-to-proposal product
(current Playbook direction), the full cost-book/estimating SaaS (original plan), or both — with one positioned
as the default flow and the other as an advanced/power-user layer? This changes what counts as "required" for
everything downstream, especially onboarding copy, pricing, and which nav items are visible by default.
**This is a product call, not an engineering one — make it explicitly rather than let scope drift.**

### Phase 1 — Close the "Required" gaps (1–2 weeks)

Do these in roughly this order, since later items depend on earlier ones being decided:

1. **Outbound delivery for proposals/invoices.** Pick one: transactional email (e.g. Postmark/Resend/SES) with
   a signed, time-limited customer view link, or — cheaper to ship first — generate the link and let the
   contractor share it manually (SMS/email/in-person) while the system still tracks "viewed" via the link visit.
   Either closes the gap; a bare status flag with no link does not.
2. **Customer-facing view/accept page.** A public (token-authenticated, not logged-in-org-member) route that
   renders the proposal PDF/summary and lets the customer accept/reject, marking `viewed`/`accepted`/`rejected`
   server-side. This is what actually makes "Send" meaningful.
3. **Password reset.** Minimum viable: emailed reset-token link, expiring, single-use.
4. **Confirm production deployment is real**, not just provisioned. Deploy `app/` and `web/` to their intended
   targets, hit `/health` and a real signup→login→customer→project→intake→proposal loop against production
   infrastructure, not the disposable local Postgres container.
5. **`production` GitHub Environment approval gate.** Get required-reviewer protection working (try the web UI
   directly, or check whether the repo needs to move to an Organization account — this failed via API on a
   personal-account repo even after upgrading to GitHub Pro). Until resolved, treat any `workflow_dispatch`
   trigger against production migrations as manual-and-careful, not "gated by CI."
6. **Terms of Service / Privacy Policy pages**, linked from signup.
7. **Basic monitoring**: at minimum, uptime checks on the deployed API and an error-tracking integration
   (Sentry or equivalent) so a production 500 doesn't go unnoticed until a customer complains.

### Phase 2 — Private beta (1–2 weeks, can overlap the tail of Phase 1)

Matches the Playbook's own stated plan: **run the core flow live with 2–3 real contractors from the target
trades** (deck/remodel/roofing are good first picks given the seeded data and the Playbook's own "16x20 treated
deck" example). Watch specifically for:

- Whether the AI Intake questions actually feel useful/relevant per trade, given it's deterministic
  heuristics today, not an LLM — this is the biggest UX-risk unknown, and it's cheap to learn early.
- Mobile/tablet usability during an actual on-site visit — this is the primary claimed use case
  ("leaves the customer's driveway with a proposal ~75% complete").
- Whether the manual-share fallback (if you chose the cheaper delivery option in Phase 1) is acceptable, or
  whether contractors expect the system to email the customer directly.

Use this phase to decide whether Phase 1's delivery mechanism needs to be upgraded before wider release.

### Phase 3 — v1.0 launch

Once Phase 1 items are closed and Phase 2 feedback is incorporated:

- Turn on public signup (remove any beta gating).
- Ship the onboarding wizard if Phase 2 showed a blank empty org/cost book is a real first-run problem —
  otherwise this can slip to a fast-follow.
- Announce with the narrative decided in Phase 0.

### Fast-follow (weeks immediately after launch, not blocking)

- Onboarding wizard (company profile, region, default overhead/profit, starter cost book seed) if not already
  pulled into Phase 3.
- Additional seeded assembly templates.
- Decide whether to expose Invoices/Contracts/Change Orders/Estimate Builder prominently or keep them as an
  opt-in "advanced" mode, per the Phase 0 decision.

### Explicitly not in the launch path

LLM-backed AI intake, payments, scheduling, reporting/analytics, native mobile, third-party e-signature, live
supplier feed ingestion, multi-language. See `docs/KNOWN_LIMITATIONS.md` for the customer-facing version of
this list and `docs/V1_CHECKLIST.md`'s Future section for the technical detail.

## Go/no-go criteria for Phase 3

Do not flip public signup on until all of the following are true:

- [ ] A real customer/prospect can receive a proposal without the contractor manually forwarding a PDF.
- [ ] A locked-out user can recover their account without contacting support.
- [ ] Production has been exercised end-to-end (signup → proposal) against the actual deployed infrastructure,
      not just local/disposable Postgres.
- [ ] Terms of Service / Privacy Policy are live and linked from signup.
- [ ] There is *some* alerting if the production API goes down or starts 500ing.
- [ ] The Phase 0 launch narrative is settled and reflected in the actual onboarding copy/nav.

## Rollback plan

- Database: migrations are additive and tracked via `prisma/migrations/`; a bad migration is rolled back by
  restoring the pre-migration Supabase backup, not by hand-editing forward — this app has no "down" migrations
  by convention (matches the existing `prisma migrate deploy`-only workflow).
- API/web: both deploy independently (separate Vercel projects per `docs/frontend-platform-completion-plan.md`
  §7) — a bad frontend deploy can be reverted without touching the API and vice versa.
- Feature flag the new "customer-facing view/accept" route if possible, so it can be disabled quickly if it
  becomes an abuse vector (unauthenticated-but-tokened public routes are the newest attack surface added for
  launch).
