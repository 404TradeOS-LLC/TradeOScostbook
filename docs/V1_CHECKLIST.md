# TradeOS v1.0 Checklist

Every feature that exists in the codebase, or is called for in `docs/TradeOS-Engineering-Playbook.md` /
`docs/tradeos-mvp-foundation-plan.md`, categorized against a v1.0 public launch of the narrow
`Customer → Project → Site Visit → AI Intake → Proposal` flow the Playbook defines as the mission.

Legend: ✅ built & verified · 🟡 built, unverified/partial · ⛔ not built

- **Required** — v1.0 cannot ship without this. Either it's on the Playbook's critical path, or it's a
  baseline expectation (auth works, a "Send" button actually sends something, data isn't lost).
- **Nice to have** — makes v1.0 noticeably better, but a contractor can complete the core workflow without it.
- **Future** — explicitly out of scope for v1.0 per the Playbook/completion plan; revisit post-launch.
- **Experimental** — exists in the code, further ahead than the current product scope, or unproven — ship
  dark/internal-only, don't market it in v1.0.

---

## Required

| Feature | State | Notes |
|---|---|---|
| Email/password signup & login | ✅ | `POST /api/v1/auth/signup`/`/login`, in-house scrypt hashing, JWT session. |
| Org-scoped multi-tenant data isolation | ✅ | Forced Postgres RLS, live-tested via `npm run test:integration`. |
| Customer CRUD | ✅ | List/create/edit/soft-delete, web UI + API. |
| Project CRUD + status lifecycle | ✅ | List/create/edit/status-change, web UI + API. |
| Site visit intake (notes, measurements, photos) | ✅ | `site_visits` + `project_files`, Supabase Storage-backed uploads. |
| AI Intake Brain (trade classification, follow-up questions, missing-info, confidence score) | ✅ | Deterministic rules engine (`modules/project-intake/`) — no LLM call yet, see Experimental/Future. |
| Proposal draft generation from project + intake context | ✅ | `modules/proposals` + `modules/project-intake/proposalDraft.ts`. |
| Proposal PDF preview/download | ✅ | `pdfkit`-rendered, verified to start with `%PDF` magic bytes. |
| **Proposal "Send" actually delivers the proposal to the customer** | ⛔ | `ProposalsService.send()` only flips `status: 'sent'` in the database. There is no outbound email/SMS and no customer-facing link — today "sending" a proposal means the contractor still has to hand the PDF to the customer themselves. **This is the single biggest gap between what the UI implies and what the system does.** |
| Customer-facing accept/reject path | ⛔ | `accept`/`reject` are internal, authenticated org-member actions with no customer-visible token/link. A customer cannot view or respond to a proposal without the contractor doing it on their behalf. |
| Password reset / forgot-password | ⛔ | No route or UI exists. A locked-out user has no self-service recovery path. |
| Production deployment, verified live | 🟡 | `app/vercel.json` (`framework: express`) and a Vercel entrypoint commit exist; a production Supabase database with migrations applied and the `tradeos_app` role provisioned was confirmed live in an earlier session. Whether the Express API itself is currently *serving* production traffic was not re-verified in this pass — confirm before launch. |
| Production migration rollout automation | ✅ | `scripts/deploy-migrations.sh`, wired into `.github/workflows/deploy-migrations.yml`. |
| `production` GitHub Environment approval gate | ⛔ | Required-reviewer protection would not enable via API even on GitHub Pro; the environment currently has no approval checkpoint before a migration runs against production. |
| Backend test suite green | ✅ | 249/249 unit tests, 33 suites, re-confirmed this session. |
| Frontend build green | ✅ | `web` builds and lints clean, re-confirmed this session. |
| Basic error responses (no raw 500s for common failures) | ✅ | Centralized Prisma error mapper (P2002/P2003/P2025 → 4xx). |
| Rate limiting on public auth endpoints | ✅ | `authRateLimit` on signup/login, separate limiter + optional IP allowlist on platform provisioning. |
| Terms of Service / Privacy Policy | ⛔ | No legal pages exist anywhere in `web/`. Required before taking real customer/contractor data in production. |
| Basic uptime/error monitoring | ⛔ | No Sentry/Datadog/equivalent wired into either `app/` or `web/`. No alerting if the API goes down or starts erroring. |
| Backup/restore story for the production database | 🟡 | Supabase provides automatic backups at the platform level; no TradeOS-specific restore drill or documented RPO/RTO exists. |

## Nice to have

| Feature | State | Notes |
|---|---|---|
| Estimate Builder (line-item editor, cost/assembly picker, markup/margin panel) | ✅ | Fully built; useful once a proposal needs to become a detailed, priced estimate — Playbook treats this as "later," not gating v1. |
| Assembly templates ("common templates") | ✅ | `isTemplate` flag, one seeded example. More templates (deck, bathroom, kitchen) would help first-run experience. |
| Invoices (full & progress billing) | ✅ | Built, tested, RLS-verified — ahead of the current narrowed MVP scope but ready if needed at launch. |
| Contracts with in-house signature capture | ✅ | Typed name + drawn signature + IP/timestamp. Works, but is not a legally-robust e-sign product (see Future). |
| Change Orders | ✅ | Full draft/edit/approve workflow — not part of the Playbook's core flow but doesn't hurt to have available. |
| Admin ops UI (`/admin`, `/admin/pricing-history`, `/admin/member-history`) | ✅ | Internal-only, useful for support/debugging in production, not customer-facing. |
| Photo delete/replace for intake | ✅ | Delete exists with storage cleanup; replace/edit-in-place does not. |
| Onboarding wizard (company profile, region, default overhead/profit, starter cost book seed) | ⛔ | Spec'd in the wireframe doc, never built. A new signup lands in an empty org with an empty cost book. |
| In-product empty-state guidance / help text | 🟡 | Some empty states exist (e.g. "No customers yet"); no systematic onboarding-checklist treatment. |
| More seeded assembly templates | ⛔ | Only one exists ("Residential Driveway Base Package"). |

## Future (explicitly out of scope for v1.0)

| Feature | State | Notes |
|---|---|---|
| LLM-backed AI intake (replacing the deterministic heuristics) | ⛔ | Playbook's own stated "next pass"; no OpenAI/Anthropic/Vercel AI SDK integration exists in the codebase today. |
| Scheduling/calendar (crew/job scheduling) | ⛔ | Not in any spec; explicitly deferred. |
| Payment processing (Stripe or similar) | ⛔ | Invoices exist as billing documents; nothing collects payment. |
| Reporting & Analytics module | ⛔ | Module 12 in the original spec, explicitly deferred at that time too. |
| Native mobile app | ⛔ | Responsive web only, by design — "start responsive-web first." |
| Third-party e-signature (DocuSign/HelloSign-class) | ⛔ | Current signature capture is in-house and not legally equivalent to a certified e-sign vendor. |
| Live supplier price-feed ingestion | ⛔ | Queue/review/CRUD/scheduler plumbing is fully built and tested; `SupplierFeedFetcher` itself is a stub with no real feed connected. |
| Multi-language support | ⛔ | English only. |
| Broader CRM (lead pipeline, follow-up tasks, communication log) | ⛔ | Beyond the current minimal Customer/Project records. |
| Infrastructure-level network controls around provisioning (security groups/ALB rules) | ⛔ | Only an app-level optional IP allowlist exists; real network-layer controls need a settled deployment target first. |

## Experimental (built, but ahead of / outside current product scope — don't market in v1.0)

| Feature | State | Notes |
|---|---|---|
| Supplier integration queue + CRUD | ✅ but unused | Fully built and RLS-tested, but there's no real supplier feed and no UI surfacing it in `web/` yet. Leave as an API-only capability for now. |
| Full estimate/invoice/change-order machinery as a parallel "detailed cost book SaaS" | ✅ but scope-diverged | This was the original product direction before the Playbook narrowed the MVP to the intake→proposal flow. It's real, tested, and RLS-verified — but it's a second product surface layered under the current narrower vision. Decide deliberately whether v1.0 markets "AI proposal assistant" only, or both that and the full cost-book/estimating system, rather than shipping both silently and letting positioning drift. |
| Membership audit trail / material price audit admin UI | ✅ but internal-only | Solid ops tooling; not something a v1.0 customer ever sees, and shouldn't be — keep it behind ops-only access. |

---

## Open reconciliation flag for the release manager

Two product visions currently coexist in this repo:

1. **The original plan** (`docs/TradeOS-CostBook-Architecture.docx`, `docs/frontend-platform-completion-plan.md`): a full trade-contractor cost-book SaaS — Cost/Labor/Material/Equipment/Assemblies databases, detailed Estimate Engine, Proposals, Invoices, Contracts, Change Orders, Supplier Integration.
2. **The current, more recent plan** (`docs/TradeOS-Engineering-Playbook.md`, `docs/tradeos-mvp-foundation-plan.md`, both dated after the first): a narrow AI-assisted preconstruction assistant — `Customer → Project → Site Visit → AI Intake → Proposal → PDF`, with the detailed cost-book/estimate machinery explicitly deferred to "convert it into a detailed estimate later."

Both are fully built in the same codebase today. Before finalizing the v1.0 launch narrative, decide (and state in the launch plan) whether v1.0 ships as the narrow AI-intake product with the cost-book system as a hidden "power user" layer, or as the full combined platform. This checklist treats the Playbook's narrow flow as the v1.0 critical path since it's the most recent stated direction, and everything else as Nice-to-have/Experimental — but this is a product decision, not a purely technical one.
