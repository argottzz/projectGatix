const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("gatix_token");
}

export function setToken(token: string): void {
  localStorage.setItem("gatix_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("gatix_token");
}

interface ApiOptions extends RequestInit {
  auth?: boolean;
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { auth, headers: rawHeaders, ...init } = options;
  const headers = new Headers(rawHeaders);
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (!isFormData && init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const message =
      (data as { message?: string })?.message ?? `Request gagal (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}
