"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { apiFetch, ApiClientError, Estimate } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { FormActionState } from "./customers";

const MAX_PROJECT_PHOTOS = 4;
const MAX_STANDARD_UPLOAD_BYTES = 6 * 1024 * 1024;

export async function createProjectAction(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  const token = await getSessionToken();
  const name = String(formData.get("name") ?? "").trim();
  const customerId = String(formData.get("customerId") ?? "").trim();
  const jobType = String(formData.get("jobType") ?? "").trim();
  const siteAddress = String(formData.get("siteAddress") ?? "").trim();
  const simpleScope = String(formData.get("simpleScope") ?? "").trim();

  if (!name) return { error: "Project name is required." };

  try {
    await apiFetch("/api/v1/projects", {
      method: "POST",
      token: token ?? undefined,
      body: JSON.stringify({
        name,
        customerId: customerId || undefined,
        jobType: jobType || undefined,
        siteAddress: siteAddress || undefined,
        simpleScope: simpleScope || undefined,
      }),
    });
  } catch (err) {
    return { error: err instanceof ApiClientError ? err.message : "Something went wrong." };
  }

  revalidatePath("/projects");
  redirect("/projects");
}

export async function updateProjectAction(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  const token = await getSessionToken();
  const id = String(formData.get("projectId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const jobType = String(formData.get("jobType") ?? "").trim();
  const siteAddress = String(formData.get("siteAddress") ?? "").trim();
  const simpleScope = String(formData.get("simpleScope") ?? "").trim();

  if (!name) return { error: "Project name is required." };

  try {
    await apiFetch(`/api/v1/projects/${id}`, {
      method: "PATCH",
      token: token ?? undefined,
      body: JSON.stringify({
        name,
        jobType: jobType || undefined,
        siteAddress: siteAddress || undefined,
        simpleScope: simpleScope || undefined,
      }),
    });
  } catch (err) {
    return { error: err instanceof ApiClientError ? err.message : "Something went wrong." };
  }

  revalidatePath(`/projects/${id}`);
  redirect(`/projects/${id}`);
}

export async function updateProjectStatusAction(formData: FormData): Promise<void> {
  const token = await getSessionToken();
  const id = String(formData.get("projectId") ?? "");
  const status = String(formData.get("status") ?? "");

  await apiFetch(`/api/v1/projects/${id}/status`, {
    method: "PATCH",
    token: token ?? undefined,
    body: JSON.stringify({ status }),
  });

  revalidatePath(`/projects/${id}`);
  redirect(`/projects/${id}`);
}

export async function createEstimateAction(formData: FormData): Promise<void> {
  const token = await getSessionToken();
  const projectId = String(formData.get("projectId") ?? "");

  const estimate = await apiFetch<Estimate>("/api/v1/estimates", {
    method: "POST",
    token: token ?? undefined,
    body: JSON.stringify({ projectId }),
  });

  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}/estimates/${estimate.id}`);
}

export async function createSiteVisitAction(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  const token = await getSessionToken();
  const projectId = String(formData.get("projectId") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  const transcript = String(formData.get("transcript") ?? "").trim();
  const squareFeet = String(formData.get("squareFeet") ?? "").trim();
  const linearFeet = String(formData.get("linearFeet") ?? "").trim();
  const fixtureCount = String(formData.get("fixtureCount") ?? "").trim();

  const measurementsJson: Record<string, unknown> = {};
  if (squareFeet) measurementsJson.squareFeet = Number(squareFeet);
  if (linearFeet) measurementsJson.linearFeet = Number(linearFeet);
  if (fixtureCount) measurementsJson.fixtureCount = Number(fixtureCount);

  const photoFiles = formData
    .getAll("photos")
    .filter((entry): entry is File => entry instanceof File)
    .filter((file) => file.size > 0);

  if (photoFiles.length > MAX_PROJECT_PHOTOS) {
    return { error: `Upload up to ${MAX_PROJECT_PHOTOS} project photos per intake save.` };
  }

  for (const file of photoFiles) {
    if (!file.type.startsWith("image/")) {
      return { error: "Project photo uploads must be image files." };
    }
    if (file.size > MAX_STANDARD_UPLOAD_BYTES) {
      return { error: `Each photo must be 6MB or smaller for this MVP upload flow.` };
    }
  }

  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "project-files";
  const uploadedEntries: Array<{ path: string; fileName: string }> = [];

  try {
    await apiFetch(`/api/v1/projects/${projectId}/site-visits`, {
      method: "POST",
      token: token ?? undefined,
      body: JSON.stringify({
        notes: notes || undefined,
        transcript: transcript || undefined,
        measurementsJson: Object.keys(measurementsJson).length ? measurementsJson : undefined,
      }),
    });

    if (photoFiles.length > 0) {
      const supabase = await createSupabaseClient();

      for (const file of photoFiles) {
        const filePath = buildProjectFilePath(projectId, file.name);
        const fileBuffer = await file.arrayBuffer();
        const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, fileBuffer, {
          contentType: file.type || undefined,
          upsert: false,
        });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        uploadedEntries.push({ path: filePath, fileName: file.name });
      }
    }

    for (const entry of uploadedEntries) {
      const fileUrl = buildStorageObjectUrl(bucket, entry.path, isPublicStorageBucket());
      await apiFetch(`/api/v1/projects/${projectId}/files`, {
        method: "POST",
        token: token ?? undefined,
        body: JSON.stringify({
          fileType: "photo",
          fileUrl,
          fileName: entry.fileName,
          storagePath: entry.path,
        }),
      });
    }
  } catch (err) {
    if (uploadedEntries.length > 0) {
      const supabase = await createSupabaseClient();
      await supabase.storage.from(bucket).remove(uploadedEntries.map((entry) => entry.path));
    }
    return { error: err instanceof ApiClientError ? err.message : "Something went wrong." };
  }

  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}/intake`);
}

export async function deleteProjectFileAction(formData: FormData): Promise<void> {
  const token = await getSessionToken();
  const projectId = String(formData.get("projectId") ?? "");
  const fileId = String(formData.get("fileId") ?? "");
  const storagePath = String(formData.get("storagePath") ?? "").trim();
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "project-files";

  if (storagePath) {
    const supabase = await createSupabaseClient();
    await supabase.storage.from(bucket).remove([storagePath]);
  }

  await apiFetch(`/api/v1/projects/${projectId}/files/${fileId}`, {
    method: "DELETE",
    token: token ?? undefined,
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/intake`);
  redirect(`/projects/${projectId}/intake`);
}

function buildProjectFilePath(projectId: string, fileName: string) {
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `${projectId}/${crypto.randomUUID()}-${sanitizedName}`;
}

function buildStorageObjectUrl(bucket: string, path: string, isPublicBucket: boolean) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }

  const objectAccessSegment = isPublicBucket ? "public" : "authenticated";
  return `${supabaseUrl}/storage/v1/object/${objectAccessSegment}/${bucket}/${path}`;
}

function isPublicStorageBucket() {
  return (process.env.SUPABASE_STORAGE_BUCKET_PUBLIC ?? "true").toLowerCase() === "true";
}
