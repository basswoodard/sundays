import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/suppers");

  return (
    <div className="max-w-[420px] mx-auto px-6 py-16 w-full">
      <h1 className="text-4xl text-center mb-2">Welcome back</h1>
      <p className="text-center text-muted font-semibold mb-8">Sunday. Supper.</p>
      <div className="card p-7">
        <LoginForm />
      </div>
      <p className="text-center text-sm text-muted font-semibold mt-6">
        New here? <Link href="/signup" className="text-rust font-extrabold">Create an account</Link>
      </p>
    </div>
  );
}
