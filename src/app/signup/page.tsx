import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { SignupForm } from "./signup-form";

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/suppers");

  return (
    <div className="max-w-[420px] mx-auto px-6 py-16 w-full">
      <h1 className="text-4xl text-center mb-2">Join Sundays</h1>
      <p className="text-center text-muted font-semibold mb-8">Find or host a home-cooked Sunday supper.</p>
      <div className="card p-7">
        <SignupForm />
      </div>
      <p className="text-center text-sm text-muted font-semibold mt-6">
        Already have an account? <Link href="/login" className="text-rust font-extrabold">Log in</Link>
      </p>
    </div>
  );
}
