import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "./session";
import { cache } from "react";

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;
  const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
  return user ?? null;
});
