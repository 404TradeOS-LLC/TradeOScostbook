## Backend Summary

## Required Backend Review

- [ ] Request authentication and organization membership checks verified.
- [ ] RLS expectations verified for each tenant-scoped read or write.
- [ ] Services accept `orgId` explicitly and do not depend on Express request objects.
- [ ] Controllers own HTTP concerns and Zod validation.
- [ ] Writes go through existing service-layer APIs.
- [ ] Prisma schema and migrations do not duplicate existing models.
- [ ] New RLS-protected tables include live integration coverage.
- [ ] Error handling uses existing `ApiError` and centralized middleware patterns.

## Documentation

- [ ] `docs/API_REFERENCE.md` updated when routes or contracts changed.
- [ ] Relevant module doc updated.
- [ ] `docs/CURRENT_STATE.md` updated when implementation status changed.
- [ ] `docs/RBAC_MATRIX.md` updated when permissions changed.
- [ ] `docs/WORKFLOW_LIFECYCLES.md` updated when states changed.
- [ ] No documentation update required, with explanation in the default PR body.

## Verification

- [ ] `npm run docs:check`
- [ ] `cd app && npm test`
- [ ] `cd app && npm run lint`
- [ ] `cd app && npm run build`
- [ ] `cd app && npm run test:integration`
