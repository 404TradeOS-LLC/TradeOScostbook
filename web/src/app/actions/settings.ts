"use server";

import { getOrganizationSettings } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { buildStorageObjectUrl, isPublicStorageBucket } from "@/lib/storage";

const MAX_ASSET_UPLOAD_BYTES = 6 * 1024 * 1024;

export interface UploadSettingsAssetResult {
  url?: string;
  error?: string;
}

// Brand asset fields (logo/dark logo/icon/watermark) previously staged an
// ephemeral `URL.createObjectURL()` blob straight into the settings draft,
// which is only valid for the current tab/session and silently produces a
// dead image URL after PATCH /settings persists it and the page reloads.
// This uploads to the same Supabase Storage bucket project files already
// use, so the persisted URL is durable.
export async function uploadSettingsAssetAction(formData: FormData): Promise<UploadSettingsAssetResult> {
  const token = await getSessionToken();
  if (!token) return { error: "Not authenticated." };

  const file = formData.get("file");
  const assetKey = String(formData.get("assetKey") ?? "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Select a file to upload." };
  }
  if (!assetKey) {
    return { error: "Missing asset field." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "Brand assets must be image files." };
  }
  if (file.size > MAX_ASSET_UPLOAD_BYTES) {
    return { error: "Each brand asset must be 6MB or smaller." };
  }

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

    return { url: buildStorageObjectUrl(bucket, storagePath, isPublicStorageBucket()) };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Upload failed." };
  }
}

function buildBrandAssetPath(orgId: string, assetKey: string, fileName: string) {
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `${orgId}/branding/${assetKey}-${crypto.randomUUID()}-${sanitizedName}`;
}
