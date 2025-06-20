export type User = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
};

export type CommissionStatus =
  | "pending_review"
  | "awaiting_payment"
  | "in_progress"
  | "delivered"
  | "closed";

export type Commission = {
  id: string;
  user_id: string;
  category: string;
  subcategory: string | null;
  price_estimate: number | null;
  description: string | null;
  anonymous: boolean;
  status: CommissionStatus;
  paid: boolean;
  payment_url: string | null;
  delivery_confirmed: boolean;
  created_at: string;
  accepted_at: string | null;
};

export type CommissionMessage = {
  id: string;
  commission_id: string;
  sender_id: string;
  content: string | null;
  file_url: string | null;
  created_at: string;
};

export type FileType = "reference" | "wip" | "delivery";

export type CommissionFile = {
  id: string;
  commission_id: string;
  type: FileType;
  url: string;
  filename: string | null;
  created_at: string;
};


export type UsageType = 'personal' | 'commercial' | 'content';

export interface Step6UsageData {
  usage: UsageType;
  allowStreaming: boolean;
}

export interface Step8ExtraInfoData {
  extraInfo: string;
}