import { getCurrentUser } from "@/lib/auth/current-user";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { suppers, bookings, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { parseList, formatDate, calcAge } from "@/lib/utils";
import { cancelSupper, cancelBooking, markPaid, confirmPaymentReceived } from "@/lib/actions/suppers";
import { ProfileForm } from "./profile-form";
import { btnGhostSmall } from "@/components/form-styles";

const PAYMENT_LABEL: Record<string, { label: string; color: string }> = {
  unpaid: { label: "💳 Payment due", color: "text-rust-dark" },
  awaiting_verification: { label: "⏳ Awaiting your confirmation", color: "text-muted" },
  paid: { label: "✅ Paid", color: "text-sage" },
};

const GUEST_PAYMENT_LABEL: Record<string, { label: string; color: string }> = {
  unpaid: { label: "💳 Payment due", color: "text-rust-dark" },
  awaiting_verification: { label: "⏳ Awaiting cook's confirmation of payment", color: "text-muted" },
  paid: { label: "✅ Paid", color: "text-sage" },
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const dietaries = parseList(user.dietaries);
  const allergies = parseList(user.allergies);

  // --- Hosting: my tables, each with its guests ---
  const hostingSuppers = await db
    .select()
    .from(suppers)
    .where(eq(suppers.hostId, user.id))
    .orderBy(desc(suppers.date));

  const hostingWithGuests = await Promise.all(
    hostingSuppers.map(async (supper) => {
      const guests = await db
        .select({
          bookingId: bookings.id,
          status: bookings.status,
          paymentStatus: bookings.paymentStatus,
          dietaries: bookings.dietaries,
          allergies: bookings.allergies,
          note: bookings.note,
          guestId: users.id,
          guestName: users.name,
          guestCountry: users.country,
          guestDob: users.dob,
        })
        .from(bookings)
        .innerJoin(users, eq(bookings.guestId, users.id))
        .where(eq(bookings.supperId, supper.id));
      return { supper, guests };
    })
  );

  // --- Attending: suppers I've booked, with host info ---
  const host = alias(users, "host");
  const attending = await db
    .select({
      bookingId: bookings.id,
      status: bookings.status,
      paymentStatus: bookings.paymentStatus,
      paymentDescription: bookings.paymentDescription,
      supperId: suppers.id,
      date: suppers.date,
      time: suppers.time,
      location: suppers.location,
      hostName: host.name,
    })
    .from(bookings)
    .innerJoin(suppers, eq(bookings.supperId, suppers.id))
    .innerJoin(host, eq(suppers.hostId, host.id))
    .where(eq(bookings.guestId, user.id))
    .orderBy(desc(suppers.date));

  return (
    <div className="max-w-2xl mx-auto w-full px-5 py-10 flex flex-col gap-10">
      <div>
        <h1 className="font-serif text-3xl text-ink mb-1">Your profile</h1>
        <p className="text-muted text-sm">This is what other Sundays neighbours can see about you.</p>
      </div>

      <ProfileForm user={user} dietaries={dietaries} allergies={allergies} />

      <section className="border-t-2 border-dashed border-border pt-6">
        <h2 className="font-serif text-2xl text-ink mb-4">Hosting</h2>
        {hostingWithGuests.length === 0 && (
          <p className="text-sm text-muted">You&apos;re not hosting a table yet. Head to Host a Supper to open one up.</p>
        )}
        <div className="flex flex-col gap-5">
          {hostingWithGuests.map(({ supper, guests }) => (
            <div key={supper.id} className="card p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-extrabold text-ink">{formatDate(supper.date)} · {supper.time}</p>
                  <p className="text-sm text-muted">{supper.location}</p>
                </div>
                <form action={cancelSupper.bind(null, supper.id)}>
                  <button className={btnGhostSmall}>Cancel</button>
                </form>
              </div>

              {guests.length === 0 && <p className="text-sm text-muted">No one&apos;s booked in yet.</p>}

              <div className="flex flex-col gap-3">
                {guests.map((g) => {
                  const age = calcAge(g.guestDob);
                  const pay = g.paymentStatus ? PAYMENT_LABEL[g.paymentStatus] : null;
                  const gDietaries = parseList(g.dietaries);
                  const gAllergies = parseList(g.allergies);
                  return (
                    <div key={g.bookingId} className="border-t border-border-soft pt-3">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <a href={`/u/${g.guestId}`} className="font-bold text-ink hover:text-rust">
                          {g.guestName}
                          {g.guestCountry ? ` · ${g.guestCountry}` : ""}
                          {age !== null ? ` · ${age}` : ""}
                        </a>
                        <div className="flex items-center gap-2">
                          {pay && <span className={`text-xs font-bold ${pay.color}`}>{pay.label}</span>}
                          {g.paymentStatus === "awaiting_verification" && (
                            <form action={confirmPaymentReceived.bind(null, g.bookingId)}>
                              <button className={btnGhostSmall}>Mark as paid</button>
                            </form>
                          )}
                        </div>
                      </div>
                      {(gDietaries.length > 0 || gAllergies.length > 0) && (
                        <p className="text-xs text-muted mt-1">
                          {[...gDietaries, ...gAllergies.map((a) => `${a} allergy`)].join(" · ")}
                        </p>
                      )}
                      {g.note && <p className="text-xs text-muted mt-1">💬 {g.note}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t-2 border-dashed border-border pt-6">
        <h2 className="font-serif text-2xl text-ink mb-4">Attending</h2>
        {attending.length === 0 && (
          <p className="text-sm text-muted">You haven&apos;t booked a Sunday supper yet. Go find one!</p>
        )}
        <div className="flex flex-col gap-3">
          {attending.map((a) => {
            const pay = a.paymentStatus ? GUEST_PAYMENT_LABEL[a.paymentStatus] : null;
            return (
              <div key={a.bookingId} className="card p-5 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-extrabold text-ink">{a.hostName}&apos;s table · {formatDate(a.date)} · {a.time}</p>
                  <p className="text-sm text-muted">{a.location}</p>
                  <p className="text-xs text-muted mt-1">
                    {a.status === "requested" ? "⏳ Request pending" : "✅ Confirmed"}
                    {pay ? ` · ${pay.label}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {a.status === "booked" && a.paymentStatus === "unpaid" && (
                    <form action={markPaid.bind(null, a.bookingId)}>
                      <button className={btnGhostSmall}>I&apos;ve paid</button>
                    </form>
                  )}
                  <form action={cancelBooking.bind(null, a.bookingId)}>
                    <button className={btnGhostSmall}>Cancel</button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
