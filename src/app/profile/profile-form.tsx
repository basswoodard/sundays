"use client";

import { useActionState } from "react";
import { updateProfile, type ActionState } from "@/lib/actions/profile";
import { inputClass, labelClass, btnPrimary } from "@/components/form-styles";
import { DIETARY_OPTIONS, ALLERGY_OPTIONS, PAYMENT_METHODS } from "@/lib/utils";
import type { InferSelectModel } from "drizzle-orm";
import type { users } from "@/lib/db/schema";

type User = InferSelectModel<typeof users>;

export function ProfileForm({ user, dietaries, allergies }: { user: User; dietaries: string[]; allergies: string[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updateProfile, null);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <label className={labelClass} htmlFor="name">Name</label>
        <input className={inputClass} id="name" name="name" defaultValue={user.name} required />
      </div>

      <div>
        <label className={labelClass} htmlFor="bio">Bio</label>
        <textarea className={inputClass} id="bio" name="bio" rows={3} defaultValue={user.bio} placeholder="Tell your neighbours a little about yourself..." />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className={labelClass} htmlFor="country">Country</label>
          <input className={inputClass} id="country" name="country" defaultValue={user.country} placeholder="e.g. Denmark" />
        </div>
        <div className="flex-1">
          <label className={labelClass} htmlFor="dob">Date of birth</label>
          <input className={inputClass} id="dob" name="dob" type="date" defaultValue={user.dob} />
        </div>
      </div>

      <div className="border-t-2 border-dashed border-border pt-4">
        <span className={labelClass}>Contact & payment</span>

        <div className="mb-4">
          <span className="text-[13px] font-bold text-muted mb-1.5 block">Mobile number</span>
          <div className="flex gap-2.5 items-center">
            <input className={`${inputClass} flex-1`} name="phone" defaultValue={user.phone} placeholder="e.g. +45 12 34 56 78" />
            <label className="flex items-center gap-2 text-xs font-bold whitespace-nowrap">
              <input type="checkbox" name="phoneVisible" defaultChecked={user.phoneVisible} /> Public
            </label>
          </div>
          <p className="text-xs text-muted mt-1.5">Used for MobilePay and so guests can reach you.</p>
        </div>

        <div className="mb-4">
          <span className="text-[13px] font-bold text-muted mb-1.5 block">Instagram handle</span>
          <div className="flex gap-2.5 items-center">
            <input className={`${inputClass} flex-1`} name="instagram" defaultValue={user.instagram} placeholder="@yourusername" />
            <label className="flex items-center gap-2 text-xs font-bold whitespace-nowrap">
              <input type="checkbox" name="instagramVisible" defaultChecked={user.instagramVisible} /> Public
            </label>
          </div>
        </div>

        <div>
          <span className="text-[13px] font-bold text-muted mb-1.5 block">Preferred payment method</span>
          <div className="flex gap-2 flex-wrap mb-2">
            {PAYMENT_METHODS.map((m) => (
              <label key={m} className="chip has-[:checked]:chip-active">
                <input type="radio" name="paymentMethod" value={m} defaultChecked={user.paymentMethod === m} className="hidden" />
                {m === "Cash" ? "💵" : m === "MobilePay" ? "📱" : "💳"} {m}
              </label>
            ))}
          </div>
          <input className={inputClass} name="paymentDetails" defaultValue={user.paymentDetails} placeholder="Handle / number for guests to pay to" />
        </div>
      </div>

      <div className="border-t-2 border-dashed border-border pt-4">
        <span className={labelClass}>Dietary requirements</span>
        <div className="flex gap-2 flex-wrap mb-4">
          {DIETARY_OPTIONS.map((d) => (
            <label key={d} className="chip has-[:checked]:chip-active">
              <input type="checkbox" name={`dietary_${d}`} defaultChecked={dietaries.includes(d)} className="hidden" />
              {d}
            </label>
          ))}
        </div>
        <span className={labelClass}>Allergies</span>
        <div className="flex gap-2 flex-wrap">
          {ALLERGY_OPTIONS.map((a) => (
            <label key={a} className="chip has-[:checked]:chip-active">
              <input type="checkbox" name={`allergy_${a}`} defaultChecked={allergies.includes(a)} className="hidden" />
              {a}
            </label>
          ))}
        </div>
      </div>

      <div className="border-t-2 border-dashed border-border pt-4">
        <span className={labelClass}>Cooking credentials (optional)</span>
        <div className="flex gap-4 mb-3">
          <div className="flex-1">
            <span className="text-[13px] font-bold text-muted mb-1.5 block">Restaurant name</span>
            <input className={inputClass} name="restaurantName" defaultValue={user.restaurantName} placeholder="e.g. Relæ" />
          </div>
          <div className="flex-1">
            <span className="text-[13px] font-bold text-muted mb-1.5 block">Years of experience</span>
            <input className={inputClass} name="yearsExperience" type="number" min={0} defaultValue={user.yearsExperience} />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <span className="text-[13px] font-bold text-muted mb-1.5 block">Cooking school</span>
            <input className={inputClass} name="school" defaultValue={user.school} />
          </div>
          <div className="flex-1">
            <span className="text-[13px] font-bold text-muted mb-1.5 block">Qualification year</span>
            <input className={inputClass} name="qualificationYear" defaultValue={user.qualificationYear} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        <button className={btnPrimary} disabled={pending}>{pending ? "Saving…" : "Save changes"}</button>
        {state?.success && <span className="text-sm font-extrabold text-sage">✓ {state.success}</span>}
        {state?.error && <span className="text-sm font-bold text-rust-dark">{state.error}</span>}
      </div>
    </form>
  );
}
