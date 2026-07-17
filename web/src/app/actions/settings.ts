"use server";

import { getOrganizationSettings } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { buildStorageObjectUrl, isPublicStorageBucket } from "@/lib/storage";
import { validateSettingsAssetUpload } from "@/lib/settingsAssetUpload";

export interface UploadSettingsAssetResult {
  url?: string;
  error?: string;
}

// Brand asset fields (logo/dark logo/icon/watermark) previously staged an
// ephemeral `URL.createObjectURL()` blob straight into the settings draft,
// which is only valid for the current tab/session and silently produces a
// dead image URL after PATCH /settings persists it and the page reloads.
// This uploads to the same Supabase Storage bucket project files already
// use and returns a public storage URL.
//
// Settings asset uploads currently require a public storage bucket: a
// private bucket only yields a non-signed /authenticated/ object URL, which
// won't render through a plain <img src="..."> after reload. Real signed-URL
// support for private buckets is future architecture work, not implemented
// here (see validateSettingsAssetUpload in @/lib/settingsAssetUpload).
export async function uploadSettingsAssetAction(formData: FormData): Promise<UploadSettingsAssetResult> {
  const token = await getSessionToken();
  if (!token) return { error: "Not authenticated." };

  const file = formData.get("file");
  const assetKey = String(formData.get("assetKey") ?? "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Select a file to upload." };
  }

  const validationError = validateSettingsAssetUpload({
    assetKey,
    file: { size: file.size, type: file.type },
    isPublicBucket: isPublicStorageBucket(),
  });
  if (validationError) return { error: validationError };

  try {
    const { orgId } = await getOrganizationSettings(token);
    const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "project-files";
    const storagePath = buildBrandAssetPath(orgId, assetKey, file.name);

    const supabase = await createSupabaseClient();
    const fileBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, fileBuffer, {
      contentType: file.type || undefined,
      upsert: true,
    });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    // validateSettingsAssetUpload already required a public bucket above, so
    // this always resolves to a public object URL, never an /authenticated/ one.
    return { url: buildStorageObjectUrl(bucket, storagePath, true) };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Upload failed." };
  }
}

function buildBrandAssetPath(orgId: string, assetKey: string, fileName: string) {
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `${orgId}/branding/${assetKey}-${crypto.randomUUID()}-${sanitizedName}`;
}
