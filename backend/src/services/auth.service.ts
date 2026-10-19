import bcrypt from "bcryptjs";
import pool from "../db/index.ts";
import { signToken } from "../utils/auth.ts";
import type {
  LoginInput,
  RegisterInput,
} from "../validations/auth.validation.ts";

export interface AuthUserRecord {
  id: number;
  name: string;
  email: string;
  role: "user" | "organizer";
}

export interface AuthResult {
  user: AuthUserRecord;
  token: string;
}

export async function findUserByEmail(email: string): Promise<any | null> {
  const [rows]: any = await pool.query(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email],
  );

  return rows[0] ?? null;
}

export async function findUserById(
  id: number,
): Promise<AuthUserRecord | null> {
  const [rows]: any = await pool.query(
    "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
    [id],
  );

  return rows[0] ?? null;
}

export async function registerUser(
  input: RegisterInput,
): Promise<AuthResult | null> {
  const existing = await findUserByEmail(input.email);

  if (existing) {
    return null;
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const [result]: any = await pool.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')",
    [input.name, input.email, hashedPassword],
  );

  const user: AuthUserRecord = {
    id: result.insertId,
    name: input.name,
    email: input.email,
    role: "user",
  };

  return { user, token: signToken(user) };
}

export async function loginUser(
  input: LoginInput,
): Promise<AuthResult | null> {
  const record = await findUserByEmail(input.email);

  if (!record) {
    return null;
  }

  const isMatch = await bcrypt.compare(input.password, record.password);

  if (!isMatch) {
    return null;
  }

  const user: AuthUserRecord = {
    id: record.id,
    name: record.name,
    email: record.email,
    role: record.role,
  };

  return { user, token: signToken(user) };
}

export async function updateUserName(
  id: number,
  name: string,
): Promise<AuthUserRecord | null> {
  const [result]: any = await pool.query(
    "UPDATE users SET name = ? WHERE id = ?",
    [name, id],
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return findUserById(id);
}

export async function updateUserRole(
  id: number,
  role: AuthUserRecord["role"],
): Promise<AuthUserRecord | null> {
  await pool.query("UPDATE users SET role = ? WHERE id = ?", [role, id]);

  return findUserById(id);
}
