import { api, clearToken, setToken } from "./api";
import type { AuthResponse, User } from "../types/auth";

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await api<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  setToken(res.token);
  return res;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await api<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(res.token);
  return res;
}

export async function me(): Promise<{ message: string; data: User }> {
  return api("/auth/me", { auth: true });
}

export async function updateProfile(name: string): Promise<{ message: string; data: User }> {
  return api("/auth/me", {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ name }),
  });
}

export async function becomeOrganizer(): Promise<AuthResponse> {
  const res = await api<AuthResponse>("/auth/become-organizer", {
    method: "POST",
    auth: true,
  });
  setToken(res.token);
  return res;
}

export function logout(): void {
  clearToken();
}
