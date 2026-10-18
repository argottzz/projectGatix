export type RegistrationStatus = "pending" | "approved" | "cancelled";

export interface Registration {
  id: number;
  event_id: number;
  user_id: number;
  status: RegistrationStatus;
  payment_proof_url: string | null;
  payment_proof_public_id: string | null;
  created_at?: string;
  updated_at?: string;
  title?: string;
  date?: string;
  location?: string;
  banner_url?: string | null;
  price?: number | string;
  user_name?: string;
  user_email?: string;
}
