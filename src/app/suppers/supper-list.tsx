"use client";

import { useState } from "react";
import Link from "next/link";
import { cancelBooking, markPaid } from "@/lib/actions/suppers";
import { btnGhostSmall, btnPrimary } from "@/components/form-styles";
import { BookingModal, type BookingTarget } from "./booking-modal";

export type SupperCardData = {
  id: string;
  isMine: boolean;
  hostName: string;
  location: string;
  date: string;
  dateLabel: string;
  time: string;
  guestTotal: number;
  seatsTaken: number;
  cuisine: string;
  description: string;
  visibility: string;
  myBooking: { id: string; status: string; paymentStatus: string | null } | null;
};

const PAYMENT_LABEL: Record<string, { label: string; color: string }> = {
  unpaid: { label: "💳 Payment due", color: "text-rust-dark" },
  awaiting_verification: { label: "⏳ Awaiting cook's confirmation", color: "text-muted" },
  paid: { label: "✅ Paid", color: "text-sage" },
};

export function SupperList({ suppers }: { suppers: SupperCardData[] }) {
  const [target, setTarget] = useState<BookingTarget | null>(null);

  return (
    <>
      <div className="flex flex-col gap-4">
        {suppers.map((s) => {
          const seatsLeft = s.guestTotal - s.seatsTaken;
          const isFull = seatsLeft <= 0 && !s.myBooking;
          const isMine = s.isMine;
          const pay = s.myBooking?.paymentStatus ? PAYMENT_LABEL[s.myBooking.paymentStatus] : null;

          return (
            <div key={s.id} className="card p-6 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="font-extrabold text-lg text-ink">{s.hostName}&apos;s table</p>
                <p className="text-sm text-muted">
                  {s.dateLabel} · {s.time} · {s.location}
                </p>
                {s.cuisine && <p className="text-sm text-muted mt-1">🍽️ {s.cuisine}</p>}
                {s.description && <p className="text-sm text-muted mt-1">{s.description}</p>}
                <p className="text-xs font-bold text-muted mt-2">
                  {s.myBooking ? "" : isFull ? "Table full" : `${seatsLeft} seat${seatsLeft === 1 ? "" : "s"} left`}
                  {s.visibility === "public" ? " · 🌍 Open" : " · 🔒 Request to join"}
                </p>
                {s.myBooking && (
                  <p className="text-xs font-bold mt-1">
                    {s.myBooking.status === "requested" ? (
                      <span className="text-rust-dark">⏳ Request pending</span>
                    ) : (
                      <span className="text-sage">✅ Confirmed</span>
                    )}
                    {pay && <span className={`ml-2 ${pay.color}`}>{pay.label}</span>}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isMine ? (
                  <Link href="/host" className={btnGhostSmall}>
                    This is your table
                  </Link>
                ) : s.myBooking ? (
                  <>
                    {s.myBooking.status === "booked" && s.myBooking.paymentStatus === "unpaid" && (
                      <form action={markPaid.bind(null, s.myBooking.id)}>
                        <button className={btnGhostSmall}>I&apos;ve paid</button>
                      </form>
                    )}
                    <form action={cancelBooking.bind(null, s.myBooking.id)}>
                      <button className={btnGhostSmall}>Cancel</button>
                    </form>
                  </>
                ) : isFull ? (
                  <span className="text-sm font-bold text-muted">Full</span>
                ) : (
                  <button
                    className={btnPrimary}
                    onClick={() =>
                      setTarget({
                        supperId: s.id,
                        hostName: s.hostName,
                        time: s.time,
                        dateLabel: s.dateLabel,
                        actionWord: s.visibility === "public" ? "book a seat" : "request to join",
                        confirmLabel: s.visibility === "public" ? "Confirm booking" : "Send request",
                      })
                    }
                  >
                    {s.visibility === "public" ? "Book a seat" : "Request to join"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {target && <BookingModal target={target} onClose={() => setTarget(null)} />}
    </>
  );
}
