# Post-Copy Checklist

After running the `rsync` command, perform the following verifications to ensure the Knowledge Engine migrated successfully without contaminating the main repository.

## Verification Steps

- [ ] **Directory exists**: Verify `packages/knowledge-engine/` exists in the TradeOS monorepo.
- [ ] **No node_modules**: Run `find packages/knowledge-engine -name "node_modules"` and confirm it returns nothing.
- [ ] **No hidden git logic**: Run `find packages/knowledge-engine -name ".git"` and confirm it returns nothing.
- [ ] **Legacy apps archived**: Verify that `packages/knowledge-engine/legacy-archive` contains the old SwiftUI apps and UI Studio, ensuring they are not running as active packages.
- [ ] **Data integrity**: Check that `packages/knowledge-engine/knowledge/` contains populated JSON files representing your cost items and assemblies.
- [ ] **No root pollution**: Verify that `packages/knowledge-engine/` is completely contained within its package folder and has not spilled files into the monorepo root.

## Completion
If all checks pass, your code transfer is complete. You may now proceed with the [INTEGRATION_PLAN.md](./INTEGRATION_PLAN.md) to carefully wire this engine into TradeOS.
