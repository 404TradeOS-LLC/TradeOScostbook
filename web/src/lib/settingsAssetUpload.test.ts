import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { isAllowedSettingsAssetKey, validateSettingsAssetUpload } from "./settingsAssetUpload.ts";

const validFile = { size: 1024, type: "image/png" };

test("rejects an unknown assetKey", () => {
  assert.equal(isAllowedSettingsAssetKey("brandLogoUrl"), false);
  assert.equal(isAllowedSettingsAssetKey("../etc/passwd"), false);
  assert.equal(isAllowedSettingsAssetKey(""), false);

  const error = validateSettingsAssetUpload({
    assetKey: "somethingElse",
    file: validFile,
    isPublicBucket: true,
  });
  assert.equal(error, "Unsupported asset field.");
});

test("accepts each of the four real settings asset keys", () => {
  for (const key of ["logoUrl", "darkLogoUrl", "iconUrl", "watermarkUrl"]) {
    assert.equal(isAllowedSettingsAssetKey(key), true);
    const error = validateSettingsAssetUpload({
      assetKey: key,
      file: validFile,
      isPublicBucket: true,
    });
    assert.equal(error, null);
  }
});

test("rejects uploads when the storage bucket is configured private", () => {
  const error = validateSettingsAssetUpload({
    assetKey: "logoUrl",
    file: validFile,
    isPublicBucket: false,
  });
  assert.equal(error, "Brand asset uploads currently require a public storage bucket.");
});

test("allows the successful public-bucket upload path", () => {
  const error = validateSettingsAssetUpload({
    assetKey: "watermarkUrl",
    file: validFile,
    isPublicBucket: true,
  });
  assert.equal(error, null);
});

test("still rejects non-image files and oversized files ahead of the bucket check", () => {
  assert.equal(
    validateSettingsAssetUpload({
      assetKey: "logoUrl",
      file: { size: 1024, type: "application/pdf" },
      isPublicBucket: true,
    }),
    "Brand assets must be image files."
  );

  assert.equal(
    validateSettingsAssetUpload({
      assetKey: "logoUrl",
      file: { size: 7 * 1024 * 1024, type: "image/png" },
      isPublicBucket: true,
    }),
    "Each brand asset must be 6MB or smaller."
  );
});

test("no regression to existing project document storage behavior", () => {
  // actions/projects.ts is out of scope for this fix and must keep resolving
  // its object URL from the bucket's actual public/private state, not a
  // hardcoded value — proving the private-bucket-required guard added to
  // uploadSettingsAssetAction was not also applied to project documents.
  const here = path.dirname(fileURLToPath(import.meta.url));
  const projectsActionsPath = path.join(here, "..", "app", "actions", "projects.ts");
  const source = fs.readFileSync(projectsActionsPath, "utf8");

  const callSites = source.match(/buildStorageObjectUrl\([^)]*\)/g) ?? [];
  assert.equal(callSites.length, 2);
  for (const call of callSites) {
    assert.match(call, /isPublicStorageBucket\(\)/);
  }
});
