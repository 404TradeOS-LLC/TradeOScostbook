# Copy Instructions

Follow these exact steps to copy the Knowledge Engine into the main TradeOS repository.

**Do NOT integrate this directly into the backend or Prisma modules yet. This is purely a file transfer to get the code into the monorepo structure.**

## Step 1: Navigate to the source package
Open your terminal and navigate to the location of the packaged transfer folder.
```bash
cd "/Users/showb/TradeOS Costbook Editor/TRANSFER_TO_TRADEOS"
```

## Step 2: Ensure destination directory exists
Ensure the `packages/knowledge-engine` directory exists in the main TradeOS repo.
```bash
mkdir -p /Users/showb/TradeOScostbook/packages/knowledge-engine
```

## Step 3: Copy the payload
Run the following `rsync` command to safely copy the prepared `knowledge-engine` folder contents into the destination repo without missing hidden files.
```bash
rsync -av --progress ./knowledge-engine/ /Users/showb/TradeOScostbook/packages/knowledge-engine/
```

## Step 4: Add to Git
Navigate to your TradeOS repository, stage the new files, and commit.
```bash
cd /Users/showb/TradeOScostbook
git add packages/knowledge-engine/
git commit -m "chore(knowledge-engine): import legacy costbook data, scripts, and agent pipelines"
```

## Next Steps
Proceed to **[POST_COPY_CHECKLIST.md](./POST_COPY_CHECKLIST.md)** to verify the transfer.
