import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type {
  Commission,
  CommissionOffer,
  CommissionOfferField,
  CommissionOfferAddon,
  CommissionMessage,
  User,
} from "./types/types";

const supabase = createClientComponentClient();

// Commission Offers
export async function getCommissionOffers(): Promise<CommissionOffer[]> {
  const { data, error } = await supabase
    .from("commission_offers")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getCommissionOfferFields(
  offerId: string
): Promise<CommissionOfferField[]> {
  const { data, error } = await supabase
    .from("commission_offer_fields")
    .select("*")
    .eq("offer_id", offerId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getCommissionOfferAddons(
  offerId: string
): Promise<CommissionOfferAddon[]> {
  const { data, error } = await supabase
    .from("commission_offer_addons")
    .select("*")
    .eq("offer_id", offerId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data || [];
}

// Commissions
export async function createCommission(
  commission: Omit<Commission, "id" | "created_at" | "updated_at">
): Promise<Commission> {
  console.log("supabase-client: Creating commission:", commission);

  const { data, error } = await supabase
    .from("commissions")
    .insert(commission)
    .select()
    .single();

  if (error) {
    console.error("supabase-client: Create commission error:", error);
    console.error("supabase-client: Error details:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }

  console.log("supabase-client: Commission created successfully:", data);
  return data;
}

export async function updateCommission(
  id: string,
  updates: Partial<Commission>
): Promise<Commission> {
  console.log("supabase-client: Updating commission:", id, updates);

  const { data, error } = await supabase
    .from("commissions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("supabase-client: Update commission error:", error);
    console.error("supabase-client: Error details:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }

  console.log("supabase-client: Commission updated successfully:", data);
  return data;
}

export async function getUserCommissions(): Promise<
  (Commission & { display_name?: string })[]
> {
  const { data, error } = await supabase
    .from("commissions")
    .select("*, users!user_id (display_name)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  // Map display_name to top-level for easier access
  return (data || []).map(
    (c: Commission & { users?: { display_name: string | null } }) => ({
      ...c,
      display_name: c.users?.display_name || undefined,
    })
  );
}

export async function getCommission(id: string): Promise<Commission> {
  const { data, error } = await supabase
    .from("commissions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Commission Messages
export async function getCommissionMessages(
  commissionId: string,
  options?: { limit?: number; before?: string }
): Promise<CommissionMessage[]> {
  const limit = options?.limit ?? 20;
  let query = supabase
    .from("commission_messages")
    .select("*")
    .eq("commission_id", commissionId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (options?.before) {
    query = query.lt("created_at", options.before);
  }

  const { data, error } = await query;
  if (error) throw error;
  // Reverse so messages are oldest-to-newest for display
  return (data || []).reverse();
}

export async function createCommissionMessage(
  message: Omit<CommissionMessage, "id" | "created_at">
): Promise<CommissionMessage> {
  const { data, error } = await supabase
    .from("commission_messages")
    .insert(message)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// User
export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function isUserAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.is_admin || false;
}
