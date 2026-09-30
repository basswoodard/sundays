"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { toListJson } from "@/lib/utils";
import { DIETARY_OPTIONS, ALLERGY_OPTIONS, PAYMENT_METHODS } from "@/lib/utils";

export type ActionState = { error?: string; success?: string } | null;

export async function updateProfile(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") || "").trim();
  const bio = String(formData.get("bio") || "").trim();
  const country = String(formData.get("country") || "").trim();
  const dob = String(formData.get("dob") || "").trim();
  const restaurantName = String(formData.get("restaurantName") || "").trim();
  const yearsExperience = String(formData.get("yearsExperience") || "").trim();
  const school = String(formData.get("school") || "").trim();
  const qualificationYear = String(formData.get("qualificationYear") || "").trim();

  const dietaries = DIETARY_OPTIONS.filter((d) => formData.get(`dietary_${d}`));
  const allergies = ALLERGY_OPTIONS.filter((a) => formData.get(`allergy_${a}`));

  const phone = String(formData.get("phone") || "").trim();
  const phoneVisible = formData.get("phoneVisible") === "on";
  const instagram = String(formData.get("instagram") || "").trim();
  const instagramVisible = formData.get("instagramVisible") === "on";

  let paymentMethod = String(formData.get("paymentMethod") || "Cash").trim();
  if (!PAYMENT_METHODS.includes(paymentMethod)) paymentMethod = "Cash";
  const paymentDetails = String(formData.get("paymentDetails") || "").trim();

  if (!name) {
    return { error: "Name is required." };
  }

  await db
    .update(users)
    .set({
      name,
      bio,
      country,
      dob,
      restaurantName,
      yearsExperience,
      school,
      qualificationYear,
      dietaries: toListJson(dietaries),
      allergies: toListJson(allergies),
      phone,
      phoneVisible,
      instagram,
      instagramVisible,
      paymentMethod,
      paymentDetails,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(users.id, user.id));

  revalidatePath("/profile");
  return { success: "Saved." };
}
