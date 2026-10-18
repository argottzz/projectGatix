export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "organizer";
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: User;
  token: string;
}
