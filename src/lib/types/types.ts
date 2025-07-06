// Database types matching Supabase schema
export type User = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
};

export type CommissionOffer = {
  id: string;
  category_name: string;
  type_name: string;
  subtype_name: string | null;
  base_price: number;
  description: string | null;
  character_count_max: number | null;
  character_count_price_per_extra: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CommissionOfferField = {
  id: string;
  offer_id: string;
  field_type: "input" | "boolean" | "list";
  field_name: string;
  field_price: number | null;
  is_required: boolean;
  sort_order: number;
  created_at: string;
};

export type CommissionOfferAddon = {
  id: string;
  offer_id: string;
  addon_name: string;
  addon_type: "input" | "boolean" | "list";
  addon_price: number | null;
  sort_order: number;
  created_at: string;
};

export type CommissionStatus =
  | "draft"
  | "submitted"
  | "waitlist"
  | "payment"
  | "wip"
  | "finished";

export type Commission = {
  id: string;
  user_id: string;
  offer_id: string | null;

  // Commission details
  category_name: string;
  type_name: string;
  subtype_name: string | null;
  base_price?: number;
  final_price: number | null; // Set by KakaoChan after review

  // Commission configuration
  character_count: number;
  extra_character_price: number;
  usage_type: "personal" | "commercial" | "content";
  allow_streaming: boolean;

  // Commission data
  comm_specific_data: Record<string, boolean | string | string[]> | null; // Store field values
  addons_data: Record<string, boolean | string | string[]> | null; // Store addon selections
  reference_urls: string[]; // Store reference URLs
  extra_info: string | null;

  // Status and workflow
  status: CommissionStatus;
  total_price?: number;

  // Timestamps
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
  payment_received_at: string | null;
  completed_at: string | null;
  waitlisted_at: string | null;
  payment_requested_at: string | null;
  work_started_at: string | null;
  form_snapshot?: CommissionDraft;
};

export type CommissionMessage = {
  id: string;
  commission_id: string;
  user_id: string;
  message_type: "text" | "image" | "file" | "status_update";
  content: string | null;
  file_url: string | null;
  created_at: string;
};

// Form types (for the commission form)
export type PathDefiner = {
  name: string;
  price?: number;
  description?: string;
};

export type CommissionInputType = "boolean" | "list" | "input";

export type CommissionCustomField = {
  name: string;
  type: CommissionInputType;
  value: boolean | string | string[];
  price?: number;
};

export type CommissionDraft = {
  id: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;

  // Main path: defines the offer structure
  category: PathDefiner;
  type: PathDefiner;
  subtype?: PathDefiner;

  base_price: number;

  // Always-required
  usage_type: "personal" | "commercial" | "content";
  allow_streaming: boolean;
  references: string[];
  extra_info: string;

  // Character logic
  character_count: number;
  extra_character_price: number;
  max_character_count?: number;

  // Dynamic optional fields
  comm_specific_inputs?: CommissionCustomField[];
  addons?: CommissionCustomField[];

  // Final pricing state
  total_price: number;
  is_submitted: boolean;
};
