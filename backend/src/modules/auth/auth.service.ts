import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../../lib/db";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";

export async function register(email: string, password: string, name?: string) {
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, "Email already registered");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: { email, passwordHash, name },
  });

  return { user: toSafeUser(user), token: signToken(user.id) };
}

export async function login(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(401, "Invalid credentials");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new ApiError(401, "Invalid credentials");

  return { user: toSafeUser(user), token: signToken(user.id) };
}

function signToken(userId: string) {
  return jwt.sign({ userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

function toSafeUser(user: { id: string; email: string; name: string | null }) {
  return { id: user.id, email: user.email, name: user.name };
}
