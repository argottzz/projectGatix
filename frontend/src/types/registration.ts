export type RegistrationStatus = "pending" | "approved" | "cancelled";

export interface Registration {
  id: number;
  event_id: number;
  user_id: number;
  status: RegistrationStatus;
  payment_proof_url: string | null;
  title?: string;
  date?: string;
  location?: string;
  banner_url?: string | null;
  price?: number | string;
  user_name?: string;
  user_email?: string;
}
