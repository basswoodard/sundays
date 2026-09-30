"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createSession, destroySession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { createId } from "@/lib/id";

export type ActionState = { error?: string } | null;

export async function signup(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const name = String(formData.get("name") || "").trim();

  if (!email || !password || !name) {
    return { error: "Name, email and password are all required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = createId();

  await db.insert(users).values({
    id,
    email,
    passwordHash,
    name,
  });

  await createSession({ userId: id, email });
  redirect("/profile");
}

export async function login(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) {
    return { error: "Invalid email or password." };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password." };
  }

  await createSession({ userId: user.id, email: user.email });
  redirect("/suppers");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
