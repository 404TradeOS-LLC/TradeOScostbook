// Pure validation helpers for uploadSettingsAssetAction (web/src/app/actions/settings.ts).
// Deliberately framework-free (no "server-only", no Next/Supabase imports) so this module
// can be unit tested directly with node:test, without a Next.js request context.

export const ALLOWED_SETTINGS_ASSET_KEYS = ["logoUrl", "darkLogoUrl", "iconUrl", "watermarkUrl"] as const;

export type SettingsAssetKey = (typeof ALLOWED_SETTINGS_ASSET_KEYS)[number];

const ALLOWED_SETTINGS_ASSET_KEY_SET: ReadonlySet<string> = new Set(ALLOWED_SETTINGS_ASSET_KEYS);

export function isAllowedSettingsAssetKey(key: string): key is SettingsAssetKey {
  return ALLOWED_SETTINGS_ASSET_KEY_SET.has(key);
}

export const MAX_SETTINGS_ASSET_UPLOAD_BYTES = 6 * 1024 * 1024;

export interface SettingsAssetUploadCandidate {
  size: number;
  type: string;
}

export interface ValidateSettingsAssetUploadParams {
  assetKey: string;
  file: SettingsAssetUploadCandidate;
  isPublicBucket: boolean;
}

// Returns an error message, or null when the upload may proceed.
export function validateSettingsAssetUpload({
  assetKey,
  file,
  isPublicBucket,
}: ValidateSettingsAssetUploadParams): string | null {
  if (!assetKey) return "Missing asset field.";
  if (!isAllowedSettingsAssetKey(assetKey)) return "Unsupported asset field.";
  if (!file.type.startsWith("image/")) return "Brand assets must be image files.";
  if (file.size > MAX_SETTINGS_ASSET_UPLOAD_BYTES) return "Each brand asset must be 6MB or smaller.";
  // Private-bucket support (real signed URLs) is future architecture work; for now
  // settings asset uploads require a public bucket so the persisted URL is always
  // directly renderable, never a non-signed /authenticated/ object URL.
  if (!isPublicBucket) return "Brand asset uploads currently require a public storage bucket.";
  return null;
}
