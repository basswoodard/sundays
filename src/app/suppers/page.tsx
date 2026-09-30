import { getCurrentUser } from "@/lib/auth/current-user";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { suppers, bookings, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { formatDate, toIsoDate } from "@/lib/utils";
import { SupperList, type SupperCardData } from "./supper-list";

export default async function SuppersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const today = toIsoDate(new Date());

  const openSuppers = await db
    .select({
      id: suppers.id,
      hostId: suppers.hostId,
      hostName: users.name,
      location: suppers.location,
      date: suppers.date,
      time: suppers.time,
      guestTotal: suppers.guestTotal,
      cuisine: suppers.cuisine,
      description: suppers.description,
      visibility: suppers.visibility,
    })
    .from(suppers)
    .innerJoin(users, eq(suppers.hostId, users.id))
    .where(eq(suppers.visibility, "public"))
    .orderBy(suppers.date);

  const upcoming = openSuppers.filter((s) => s.date >= today);

  const allBookings = await db.select().from(bookings);
  const bookingsBySupper = new Map<string, typeof allBookings>();
  for (const b of allBookings) {
    const list = bookingsBySupper.get(b.supperId) ?? [];
    list.push(b);
    bookingsBySupper.set(b.supperId, list);
  }

  const cards: SupperCardData[] = upcoming.map((s) => {
    const supperBookings = bookingsBySupper.get(s.id) ?? [];
    const seatsTaken = supperBookings.filter((b) => b.status === "booked").length;
    const mine = supperBookings.find((b) => b.guestId === user.id) ?? null;

    return {
      id: s.id,
      isMine: s.hostId === user.id,
      hostName: s.hostName,
      location: s.location,
      date: s.date,
      dateLabel: formatDate(s.date),
      time: s.time,
      guestTotal: s.guestTotal,
      seatsTaken,
      cuisine: s.cuisine,
      description: s.description,
      visibility: s.visibility,
      myBooking: mine ? { id: mine.id, status: mine.status, paymentStatus: mine.paymentStatus } : null,
    };
  });

  return (
    <div className="max-w-2xl mx-auto w-full px-5 py-10">
      <div className="mb-7">
        <h1 className="font-serif text-3xl text-ink mb-1">Find a supper</h1>
        <p className="text-muted text-sm">Home-cooked Sunday suppers near you, hosted by your neighbours.</p>
      </div>

      {cards.length === 0 ? (
        <p className="text-sm text-muted">No open tables yet — check back soon, or open your own from Host a Supper.</p>
      ) : (
        <SupperList suppers={cards} />
      )}
    </div>
  );
}
