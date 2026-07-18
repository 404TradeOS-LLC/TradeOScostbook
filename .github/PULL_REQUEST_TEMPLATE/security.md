## Security Summary

## Required Security Review

- [ ] Threat model or abuse case described.
- [ ] Auth, membership, authorization, and RLS impact reviewed.
- [ ] Secrets and environment variables are not exposed.
- [ ] Input validation and output encoding reviewed.
- [ ] Database writes remain service-layer mediated.
- [ ] Logging avoids secrets and sensitive customer data.
- [ ] Migration, destructive-action, and data-loss risks reviewed.
- [ ] Tests or reproduction steps demonstrate the fix or hardening.

## Verification

- [ ] `npm run docs:check`
- [ ] `cd app && npm test`
- [ ] `cd app && npm run lint`
- [ ] `cd app && npm run build`
- [ ] `cd app && npm run test:integration`
