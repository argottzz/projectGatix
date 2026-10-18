export interface EventItem {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  banner_url: string | null;
  price: number | string;
  quota: number;
  organizer_name?: string;
  organizer_email?: string;
  taken?: number;
  available_quota?: number;
}

export interface EventListResponse {
  message: string;
  data: EventItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
