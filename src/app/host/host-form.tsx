"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createOrUpdateSupper, type ActionState } from "@/lib/actions/suppers";
import { btnPrimary, btnGhost, btnText } from "@/components/form-styles";
import { CUISINE_SUGGESTIONS, getUpcomingSundays, formatDate } from "@/lib/utils";

const TIME_OPTIONS = ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"];
const GUEST_OPTIONS = [2, 4, 6, 8, 10, 12];

type ExistingSupper = {
  id: string;
  location: string;
  date: string;
  time: string;
  guestTotal: number;
  visibility: string;
  cuisine: string;
  description: string;
  recurring: boolean;
};

export function HostForm({ existingSupper }: { existingSupper: ExistingSupper | null }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createOrUpdateSupper, null);

  const hasPublished = !!existingSupper;
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(hasPublished ? 5 : 1);
  const [justEdited, setJustEdited] = useState(false);
  // Snapshot "already had a table" once, so it doesn't flip mid-submission
  // when the server action's revalidatePath("/host") refreshes existingSupper.
  const [everPublished, setEverPublished] = useState(hasPublished);

  const sundayOptions = (() => {
    const opts = getUpcomingSundays(6);
    if (existingSupper && !opts.some((o) => o.iso === existingSupper.date)) {
      opts.unshift({ iso: existingSupper.date, label: formatDate(existingSupper.date) });
    }
    return opts;
  })();

  const [location, setLocation] = useState(existingSupper?.location ?? "");
  const [sundayIdx, setSundayIdx] = useState(() => {
    const i = existingSupper ? sundayOptions.findIndex((o) => o.iso === existingSupper.date) : 0;
    return i < 0 ? 0 : i;
  });
  const [recurring, setRecurring] = useState(existingSupper?.recurring ?? false);
  const [time, setTime] = useState(existingSupper?.time ?? "18:00");
  const [guestCount, setGuestCount] = useState(existingSupper?.guestTotal ?? 6);
  const [visibility, setVisibility] = useState(existingSupper?.visibility ?? "public");
  const [cuisine, setCuisine] = useState(existingSupper?.cuisine ?? "");
  const [customCuisines, setCustomCuisines] = useState<string[]>(
    existingSupper?.cuisine && !CUISINE_SUGGESTIONS.includes(existingSupper.cuisine) ? [existingSupper.cuisine] : []
  );
  const [isAddingCuisine, setIsAddingCuisine] = useState(false);
  const [newCuisineText, setNewCuisineText] = useState("");
  const [description, setDescription] = useState(existingSupper?.description ?? "");

  // When the server action succeeds, move to the success screen. Adjusted
  // during render (React's sanctioned pattern for deriving state from a
  // changed value) rather than in a useEffect, to avoid an extra render pass.
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state?.success) {
      setJustEdited(everPublished);
      setEverPublished(true);
      setStep(5);
    }
  }

  const cuisineOptions = [...CUISINE_SUGGESTIONS, ...customCuisines];
  const selectedDate = sundayOptions[sundayIdx]?.iso ?? sundayOptions[0].iso;

  function chipClass(active: boolean) {
    return active ? "chip active" : "chip";
  }

  if (step === 5) {
    return (
      <div className="max-w-xl mx-auto px-5 py-14 text-center">
        <div className="text-6xl mb-3">🎉</div>
        <h1 className="text-4xl">{justEdited ? "Your table is updated!" : "Your table is open!"}</h1>
        <p className="text-muted font-bold mt-3">
          {justEdited
            ? "Your changes are live — guests booked in will still keep their seats."
            : "Neighbours can now find your Sunday supper and book a seat."}
        </p>

        <div className="card p-8 mt-7 text-left flex flex-col gap-3.5">
          <Row label="When" value={`${recurring ? "Every Sunday (from " + formatDate(selectedDate) + ")" : formatDate(selectedDate)} · ${time}`} />
          <Row label="Where" value={location} />
          <Row label="Guests" value={`Up to ${guestCount} people`} />
          <Row
            label="Table"
            value={visibility === "public" ? "🌍 Public — open to new neighbours" : "🔒 Private — invite link only"}
            noBorder
          />
        </div>

        {recurring && (
          <p className="text-sm text-rust-dark font-bold mt-3.5">
            🔁 This table repeats every Sunday. Turn it off anytime by editing your table.
          </p>
        )}

        <div className="flex gap-2.5 justify-center mt-7">
          <button className={btnGhost} onClick={() => setStep(1)}>
            ✏️ Edit your table
          </button>
          <Link href="/suppers" className={btnPrimary}>
            Back to Sundays
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-5 pt-5 pb-24">
      <h1 className="text-center text-4xl mb-1.5">{hasPublished ? "Edit your table" : "Host a Supper"}</h1>
      <p className="text-center text-muted font-bold mb-7">
        {hasPublished ? "Make changes below, then save to update your table." : "I&apos;m cooking Sunday. Come meet me at the table."}
      </p>

      <div className="flex gap-2 mb-7">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className={`h-1.5 flex-1 rounded-full ${n <= step ? "bg-rust" : "bg-border-soft"}`} />
        ))}
      </div>

      <form action={formAction}>
        <input type="hidden" name="supperId" value={existingSupper?.id ?? ""} />
        <input type="hidden" name="location" value={location} />
        <input type="hidden" name="date" value={selectedDate} />
        <input type="hidden" name="time" value={time} />
        <input type="hidden" name="guestTotal" value={guestCount} />
        <input type="hidden" name="visibility" value={visibility} />
        <input type="hidden" name="cuisine" value={cuisine} />
        <input type="hidden" name="description" value={description} />
        {recurring && <input type="hidden" name="recurring" value="on" />}

        {step === 1 && (
          <div className="card p-8">
            <span className="text-xs font-extrabold uppercase tracking-wide text-rust-dark mb-3 block">Step 1 of 4 · Where</span>
            <h2 className="text-2xl mb-5">Where are you cooking?</h2>

            <div className="bg-amber/40 bg-[#FBEFE6] rounded-2xl px-4 py-3.5 mb-5 text-[13px] text-rust-dark font-bold leading-relaxed">
              📱 Guests will need a way to reach you. Make sure your{" "}
              <Link href="/profile" className="underline">
                profile
              </Link>{" "}
              has a public phone number or an email address before you open your table.
            </div>

            <input
              className="w-full box-border border-2 border-border-soft rounded-2xl px-4 py-3.5 text-base bg-card text-ink outline-none focus:border-rust"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Street name, neighbourhood"
            />

            <div className="flex justify-end mt-6">
              <button
                type="button"
                className={btnPrimary}
                disabled={location.trim().length === 0}
                onClick={() => setStep(2)}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card p-8">
            <span className="text-xs font-extrabold uppercase tracking-wide text-rust-dark mb-3 block">Step 2 of 4 · When</span>
            <h2 className="text-2xl mb-5">When&apos;s your table open?</h2>

            <div
              className={`flex items-center justify-between gap-4 mb-5.5 p-5 rounded-2xl border-[3px] cursor-pointer ${
                recurring ? "border-rust bg-[#FBEFE6]" : "border-border-soft"
              }`}
              onClick={() => setRecurring((r) => !r)}
            >
              <div>
                <div className="font-extrabold">🔁 Host every Sunday</div>
                <div className="text-[13px] text-muted mt-0.5">Keep a standing table open every week — no need to set it up again.</div>
              </div>
              <div className={`w-[46px] h-[26px] rounded-full shrink-0 p-[3px] box-border ${recurring ? "bg-rust" : "bg-border-soft"}`}>
                <div className={`w-5 h-5 rounded-full bg-card transition-all ${recurring ? "ml-5" : "ml-0"}`} />
              </div>
            </div>

            <div className="text-[13px] font-extrabold text-muted uppercase tracking-wide mb-2.5">{recurring ? "First Sunday" : "Sunday"}</div>
            <div className="flex gap-2.5 flex-wrap mb-6">
              {sundayOptions.map((o, i) => (
                <button key={o.iso} type="button" className={chipClass(i === sundayIdx)} onClick={() => setSundayIdx(i)}>
                  {o.label}
                </button>
              ))}
            </div>

            <div className="text-[13px] font-extrabold text-muted uppercase tracking-wide mb-2.5">Time</div>
            <div className="flex gap-2.5 flex-wrap">
              {TIME_OPTIONS.map((t) => (
                <button key={t} type="button" className={chipClass(t === time)} onClick={() => setTime(t)}>
                  {t}
                </button>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <button type="button" className={btnText} onClick={() => setStep(1)}>
                ← Back
              </button>
              <button type="button" className={btnPrimary} onClick={() => setStep(3)}>
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card p-8">
            <span className="text-xs font-extrabold uppercase tracking-wide text-rust-dark mb-3 block">Step 3 of 4 · Who</span>
            <h2 className="text-2xl mb-5">How many can you seat?</h2>

            <div className="flex gap-2.5 flex-wrap mb-7">
              {GUEST_OPTIONS.map((g) => (
                <button key={g} type="button" className={chipClass(g === guestCount)} onClick={() => setGuestCount(g)}>
                  {g} people
                </button>
              ))}
            </div>

            <div className="text-[13px] font-extrabold text-muted uppercase tracking-wide mb-2.5">Who can come?</div>
            <div className="flex gap-3.5">
              <div
                className={`flex-1 border-[3px] rounded-2xl p-5 cursor-pointer ${visibility === "public" ? "border-rust bg-[#FBEFE6]" : "border-border-soft"}`}
                onClick={() => setVisibility("public")}
              >
                <div className="text-2xl mb-1.5">🌍</div>
                <div className="font-extrabold mb-1">Public</div>
                <div className="text-[13px] text-muted">Meet new neighbours — anyone nearby can find your table.</div>
              </div>
              <div
                className={`flex-1 border-[3px] rounded-2xl p-5 cursor-pointer ${visibility === "private" ? "border-rust bg-[#FBEFE6]" : "border-border-soft"}`}
                onClick={() => setVisibility("private")}
              >
                <div className="text-2xl mb-1.5">🔒</div>
                <div className="font-extrabold mb-1">Private</div>
                <div className="text-[13px] text-muted">Only people you send the link to can see it.</div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button type="button" className={btnText} onClick={() => setStep(2)}>
                ← Back
              </button>
              <button type="button" className={btnPrimary} onClick={() => setStep(4)}>
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="card p-8">
            <span className="text-xs font-extrabold uppercase tracking-wide text-rust-dark mb-3 block">Step 4 of 4 · What (optional)</span>
            <h2 className="text-2xl mb-1.5">What are you cooking?</h2>
            <p className="text-sm text-muted mb-5">Totally optional — skip it and keep it a surprise.</p>

            <div className="flex gap-2.5 flex-wrap items-center mb-5">
              {cuisineOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={chipClass(c === cuisine)}
                  onClick={() => setCuisine((prev) => (prev === c ? "" : c))}
                >
                  {c}
                </button>
              ))}
              {isAddingCuisine ? (
                <input
                  autoFocus
                  className="w-[170px] px-4 py-2.5 rounded-full border-2 border-border-soft text-sm"
                  value={newCuisineText}
                  onChange={(e) => setNewCuisineText(e.target.value)}
                  onBlur={() => {
                    if (!newCuisineText.trim()) setIsAddingCuisine(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = newCuisineText.trim();
                      if (val) {
                        setCustomCuisines((prev) => (prev.includes(val) ? prev : [...prev, val]));
                        setCuisine(val);
                      }
                      setIsAddingCuisine(false);
                      setNewCuisineText("");
                    } else if (e.key === "Escape") {
                      setIsAddingCuisine(false);
                      setNewCuisineText("");
                    }
                  }}
                  placeholder="Type & press Enter"
                />
              ) : (
                <button type="button" className="chip" onClick={() => setIsAddingCuisine(true)}>
                  + Add
                </button>
              )}
            </div>

            <span className="text-xs font-extrabold uppercase tracking-wide text-rust-dark mb-2 block">A note for your guests</span>
            <textarea
              className="w-full box-border border-2 border-border-soft rounded-2xl px-4 py-3.5 text-base bg-card text-ink outline-none focus:border-rust"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell guests a little about tonight, or leave it a surprise..."
            />

            {state?.error && <p className="text-sm font-bold text-rust-dark mt-3">{state.error}</p>}

            <div className="flex justify-between mt-6">
              <button type="button" className={btnText} onClick={() => setStep(3)}>
                ← Back
              </button>
              <div className="flex gap-2.5">
                {!hasPublished && (
                  <button type="submit" className={btnGhost} disabled={pending}>
                    Skip
                  </button>
                )}
                <button type="submit" className={btnPrimary} disabled={pending}>
                  {pending ? "Saving…" : hasPublished ? "Save changes" : "Open my table"}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

function Row({ label, value, noBorder }: { label: string; value: string; noBorder?: boolean }) {
  return (
    <div className={`flex justify-between ${noBorder ? "" : "border-b-2 border-dashed border-border pb-3"}`}>
      <span className="font-bold text-muted">{label}</span>
      <span className="font-extrabold">{value}</span>
    </div>
  );
}
