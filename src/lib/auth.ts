import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "./types";

const createServerSupabaseClient = () =>
  createServerComponentClient<Database>({ cookies });

/**
 * Gets the current logged-in user (or null if not logged in)
 */
export async function getSessionUser() {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  return data.user ?? null;
}

/**
 * Checks if the logged-in user is an admin
 */
export async function isAdmin() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  return data?.is_admin ?? false;
}
