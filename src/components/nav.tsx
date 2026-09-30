import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { logout } from "@/lib/actions/auth";

export async function Nav() {
  const user = await getCurrentUser();

  return (
    <div className="w-full max-w-[1120px] mx-auto px-6 pt-7 flex items-center justify-between">
      <Link href={user ? "/suppers" : "/"} className="font-hand text-4xl font-bold text-rust">
        sundays
      </Link>
      <div className="flex items-center gap-3.5">
        {user ? (
          <>
            <Link href="/profile" className="text-sm font-extrabold text-ink hover:text-rust-dark">
              My profile
            </Link>
            <Link
              href="/suppers"
              className="px-5 py-2.5 rounded-full border-2 border-ink text-sm font-extrabold hover:bg-ink hover:text-cream transition-colors"
            >
              Find a supper
            </Link>
            <Link
              href="/host"
              className="px-5 py-2.5 rounded-full border-2 border-ink text-sm font-extrabold hover:bg-ink hover:text-cream transition-colors"
            >
              Host a Supper
            </Link>
            <form action={logout}>
              <button className="text-sm font-extrabold text-muted hover:text-rust-dark">Log out</button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm font-extrabold text-ink hover:text-rust-dark">
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 rounded-full bg-rust text-cream text-sm font-extrabold hover:bg-rust-dark transition-colors"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
