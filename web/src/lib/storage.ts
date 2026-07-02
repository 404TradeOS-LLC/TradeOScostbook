import "server-only";

import type { ProjectFile } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

export interface ProjectFileAsset extends ProjectFile {
  accessUrl: string;
  accessMode: "public" | "signed" | "legacy";
}

export async function resolveProjectFileAssets(projectFiles: ProjectFile[]): Promise<ProjectFileAsset[]> {
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "project-files";
  const isPublicBucket = (process.env.SUPABASE_STORAGE_BUCKET_PUBLIC ?? "true").toLowerCase() === "true";
  const supabase = await createClient();

  return Promise.all(
    projectFiles.map(async (file) => {
      if (!file.storagePath) {
        return {
          ...file,
          accessUrl: file.fileUrl,
          accessMode: "legacy" as const,
        };
      }

      if (isPublicBucket) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(file.storagePath);
        return {
          ...file,
          accessUrl: data.publicUrl,
          accessMode: "public" as const,
        };
      }

      const { data, error } = await supabase.storage.from(bucket).createSignedUrl(file.storagePath, 60 * 60);
      if (error || !data?.signedUrl) {
        return {
          ...file,
          accessUrl: file.fileUrl,
          accessMode: "legacy" as const,
        };
      }

      return {
        ...file,
        accessUrl: data.signedUrl,
        accessMode: "signed" as const,
      };
    })
  );
}
