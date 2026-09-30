import { getCurrentUser } from "@/lib/auth/current-user";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { suppers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { HostForm } from "./host-form";

export default async function HostPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const existingSupper = (await db.query.suppers.findFirst({ where: eq(suppers.hostId, user.id) })) ?? null;

  return (
    <HostForm
      existingSupper={
        existingSupper
          ? {
              id: existingSupper.id,
              location: existingSupper.location,
              date: existingSupper.date,
              time: existingSupper.time,
              guestTotal: existingSupper.guestTotal,
              visibility: existingSupper.visibility,
              cuisine: existingSupper.cuisine,
              description: existingSupper.description,
              recurring: existingSupper.recurring,
            }
          : null
      }
    />
  );
}
