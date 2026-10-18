import { api } from "./api";
import type { Registration } from "../types/registration";

export async function createRegistration(event_id: number): Promise<{ message: string; data: Registration }> {
  return api("/registrations", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ event_id }),
  });
}

export async function myTickets(): Promise<{ message: string; data: Registration[] }> {
  return api("/registrations/my-tickets", { auth: true });
}

export async function getRegistration(id: string | number): Promise<{ message: string; data: Registration }> {
  return api(`/registrations/${id}`, { auth: true });
}

export async function uploadPaymentProof(id: string | number, file: File): Promise<{ message: string; data: unknown }> {
  const form = new FormData();
  form.append("payment_proof", file);
  return api(`/registrations/${id}/payment`, { method: "PATCH", auth: true, body: form });
}

export function cancelRegistration(id: string | number): Promise<{ message: string; data: unknown }> {
  return setRegistrationStatus(id, "cancelled");
}

export async function listEventRegistrations(eventId: string | number): Promise<{ message: string; data: Registration[] }> {
  return api(`/events/${eventId}/registrations`, { auth: true });
}

export async function setRegistrationStatus(
  id: string | number,
  status: "approved" | "cancelled",
): Promise<{ message: string; data: unknown }> {
  return api(`/registrations/${id}/status`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ status }),
  });
}
