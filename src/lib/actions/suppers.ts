"use server";

import { db } from "@/lib/db";
import { suppers, bookings } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createId } from "@/lib/id";
import { toListJson, DIETARY_OPTIONS, ALLERGY_OPTIONS } from "@/lib/utils";

export type ActionState = { error?: string; success?: string } | null;

export async function createOrUpdateSupper(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supperId = String(formData.get("supperId") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const date = String(formData.get("date") || "").trim();
  const time = String(formData.get("time") || "18:00").trim();
  const guestTotal = Math.max(1, Math.min(20, parseInt(String(formData.get("guestTotal") || "6"), 10) || 6));
  const visibility = formData.get("visibility") === "private" ? "private" : "public";
  const cuisine = String(formData.get("cuisine") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const recurring = formData.get("recurring") === "on";

  if (!location || !date) {
    return { error: "Location and date are required." };
  }

  if (supperId) {
    const existing = await db.query.suppers.findFirst({ where: eq(suppers.id, supperId) });
    if (!existing || existing.hostId !== user.id) {
      return { error: "You can only edit your own table." };
    }
    await db
      .update(suppers)
      .set({ location, date, time, guestTotal, visibility, cuisine, description, recurring, updatedAt: new Date().toISOString() })
      .where(eq(suppers.id, supperId));
  } else {
    await db.insert(suppers).values({
      id: createId(),
      hostId: user.id,
      location,
      date,
      time,
      guestTotal,
      visibility,
      cuisine,
      description,
      recurring,
    });
  }

  revalidatePath("/host");
  revalidatePath("/suppers");
  revalidatePath("/profile");
  return { success: supperId ? "Table updated." : "Table is open!" };
}

export async function cancelSupper(supperId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const existing = await db.query.suppers.findFirst({ where: eq(suppers.id, supperId) });
  if (!existing || existing.hostId !== user.id) return;
  await db.delete(suppers).where(eq(suppers.id, supperId));
  revalidatePath("/host");
  revalidatePath("/suppers");
  revalidatePath("/profile");
}

export async function bookSupper(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supperId = String(formData.get("supperId") || "").trim();
  const note = String(formData.get("note") || "").trim();
  const dietaries = DIETARY_OPTIONS.filter((d) => formData.get(`dietary_${d}`));
  const allergies = ALLERGY_OPTIONS.filter((a) => formData.get(`allergy_${a}`));

  const supper = await db.query.suppers.findFirst({ where: eq(suppers.id, supperId) });
  if (!supper) return { error: "That supper no longer exists." };
  if (supper.hostId === user.id) return { error: "You can't book your own table." };

  const existing = await db.query.bookings.findFirst({
    where: and(eq(bookings.supperId, supperId), eq(bookings.guestId, user.id)),
  });
  if (existing) return { error: "You've already got a spot here." };

  const status = supper.visibility === "public" ? "booked" : "requested";
  const paymentDescription = `${user.name} · ${supper.date}`;

  await db.insert(bookings).values({
    id: createId(),
    supperId,
    guestId: user.id,
    status,
    paymentStatus: status === "booked" ? "unpaid" : null,
    paymentDescription,
    dietaries: toListJson(dietaries),
    allergies: toListJson(allergies),
    note,
  });

  revalidatePath("/suppers");
  revalidatePath("/profile");
  return { success: status === "booked" ? "You're confirmed." : "Request sent." };
}

export async function cancelBooking(bookingId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const existing = await db.query.bookings.findFirst({ where: eq(bookings.id, bookingId) });
  if (!existing || existing.guestId !== user.id) return;
  await db.delete(bookings).where(eq(bookings.id, bookingId));
  revalidatePath("/suppers");
  revalidatePath("/profile");
}

export async function markPaid(bookingId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const existing = await db.query.bookings.findFirst({ where: eq(bookings.id, bookingId) });
  if (!existing || existing.guestId !== user.id) return;
  await db.update(bookings).set({ paymentStatus: "awaiting_verification", updatedAt: new Date().toISOString() }).where(eq(bookings.id, bookingId));
  revalidatePath("/suppers");
  revalidatePath("/profile");
}

export async function confirmPaymentReceived(bookingId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const existing = await db.query.bookings.findFirst({ where: eq(bookings.id, bookingId) });
  if (!existing) return;
  const supper = await db.query.suppers.findFirst({ where: eq(suppers.id, existing.supperId) });
  if (!supper || supper.hostId !== user.id) return;
  await db.update(bookings).set({ paymentStatus: "paid", updatedAt: new Date().toISOString() }).where(eq(bookings.id, bookingId));
  revalidatePath("/host");
  revalidatePath("/profile");
}
