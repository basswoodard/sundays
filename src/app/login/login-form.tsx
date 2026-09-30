"use client";

import { useActionState } from "react";
import { login, type ActionState } from "@/lib/actions/auth";
import { inputClass, labelClass, btnPrimary } from "@/components/form-styles";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(login, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className={labelClass} htmlFor="email">Email</label>
        <input className={inputClass} id="email" name="email" type="email" placeholder="you@example.com" required />
      </div>
      <div>
        <label className={labelClass} htmlFor="password">Password</label>
        <input className={inputClass} id="password" name="password" type="password" placeholder="Your password" required />
      </div>
      {state?.error && <p className="text-sm font-bold text-rust-dark">{state.error}</p>}
      <button className={btnPrimary} disabled={pending}>
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
