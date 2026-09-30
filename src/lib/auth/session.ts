import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "sundays_session";
const secretKey = process.env.SESSION_SECRET || "dev-secret-change-in-production-please-32chars-min";
const encodedKey = new TextEncoder().encode(secretKey);

export type SessionPayload = {
  userId: string;
  email: string;
};

export async function createSession(payload: SessionPayload) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(encodedKey);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
    return { userId: payload.userId as string, email: payload.email as string };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
