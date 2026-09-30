"use client";

import { useActionState } from "react";
import { signup, type ActionState } from "@/lib/actions/auth";
import { inputClass, labelClass, btnPrimary } from "@/components/form-styles";

export function SignupForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(signup, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className={labelClass} htmlFor="name">Name</label>
        <input className={inputClass} id="name" name="name" placeholder="Your name" required />
      </div>
      <div>
        <label className={labelClass} htmlFor="email">Email</label>
        <input className={inputClass} id="email" name="email" type="email" placeholder="you@example.com" required />
      </div>
      <div>
        <label className={labelClass} htmlFor="password">Password</label>
        <input className={inputClass} id="password" name="password" type="password" placeholder="At least 8 characters" required minLength={8} />
      </div>
      {state?.error && <p className="text-sm font-bold text-rust-dark">{state.error}</p>}
      <button className={btnPrimary} disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
