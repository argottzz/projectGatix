import { api } from "./api";
import type { EventItem, EventListResponse } from "../types/event";

export interface EventQuery {
  search?: string;
  location?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: "date" | "price";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export async function listEvents(query: EventQuery = {}): Promise<EventListResponse> {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== "") params.set(k, String(v));
  }
  const qs = params.toString();
  return api(`/events${qs ? `?${qs}` : ""}`);
}

export async function getEvent(id: string | number): Promise<{ message: string; data: EventItem }> {
  return api(`/events/${id}`);
}

export async function createEvent(form: FormData): Promise<{ message: string; data: EventItem }> {
  return api("/events", { method: "POST", auth: true, body: form });
}

export async function updateEvent(id: string | number, form: FormData): Promise<{ message: string; data: unknown }> {
  return api(`/events/${id}`, { method: "PATCH", auth: true, body: form });
}

export async function deleteEvent(id: string | number): Promise<{ message: string }> {
  return api(`/events/${id}`, { method: "DELETE", auth: true });
}
