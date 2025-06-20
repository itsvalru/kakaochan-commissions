export type PathDefiner = {
  name: string;
  price?: number; // Optional – not all need pricing
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
  subtype?: PathDefiner; // Optional

  base_price: number;

  // Always-required
  usage_type: "personal" | "commercial" | "content";
  allow_streaming: boolean;
  references: string[];
  extra_info: string;

  // Character logic
 character_count: number;            // e.g., 1–5
 extra_character_price: number;      // price per extra char (same as price_per_extra from offer)
 max_character_count?: number;       // optionally store the max for validation/client use

  // Dynamic optional fields
  comm_specific_inputs?: CommissionCustomField[];
  addons?: CommissionCustomField[];

  // Final pricing state
  total_price: number;
  is_submitted: boolean;
};

export type CommissionOffer = {
  category: PathDefiner;
  type: PathDefiner;
  subtype?: PathDefiner;

  base_price: number;
  description?: string;

  // Optional logic for how many characters are free and what extras cost
  character_count?: {
    max: number;
    price_per_extra: number;
  };

  // Optional commission-specific inputs (species, nails, etc.)
  comm_specific_inputs?: CommissionCustomField[];

  // Optional addons (toggles, outfits, etc.)
  addons?: CommissionCustomField[];
};