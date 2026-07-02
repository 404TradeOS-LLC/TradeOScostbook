"use server";

import { redirect } from "next/navigation";
import { apiFetch, ApiClientError } from "@/lib/api";
import { clearSessionCookie } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = { error?: string } | undefined;

export async function signupAction(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const organizationName = String(formData.get("organizationName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();

  if (!organizationName || !email || !password) {
    return { error: "Company name, email, and password are required." };
  }

  const supabase = await createClient();
  const { error: signupError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || undefined,
      },
    },
  });

  if (signupError) return { error: signupError.message };

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { error: "Supabase signup succeeded, but no session was created. Check your email confirmation settings." };
  }

  try {
    await apiFetch("/api/v1/auth/bootstrap", {
      method: "POST",
      token: session.access_token,
      body: JSON.stringify({
        organizationName,
        fullName: fullName || undefined,
      }),
    });
  } catch (err) {
    return { error: err instanceof ApiClientError ? err.message : "Unable to finish account setup." };
  }

  redirect("/dashboard");
}

export async function loginAction(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}
