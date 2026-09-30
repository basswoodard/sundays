"use client";

import { useActionState, useEffect, useState } from "react";
import { bookSupper, type ActionState } from "@/lib/actions/suppers";
import { btnPrimary, btnGhostSmall } from "@/components/form-styles";
import { DIETARY_OPTIONS, ALLERGY_OPTIONS } from "@/lib/utils";

export type BookingTarget = {
  supperId: string;
  hostName: string;
  time: string;
  dateLabel: string;
  actionWord: string;
  confirmLabel: string;
};

export function BookingModal({ target, onClose }: { target: BookingTarget; onClose: () => void }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(bookSupper, null);
  const [dietaries, setDietaries] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (state?.success) {
      const t = setTimeout(onClose, 1100);
      return () => clearTimeout(t);
    }
  }, [state, onClose]);

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center p-5 z-50" onClick={onClose}>
      <div className="card p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        {state?.success ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">🎉</div>
            <p className="font-extrabold text-lg">{state.success}</p>
          </div>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="supperId" value={target.supperId} />
            <div>
              <h2 className="text-2xl">{target.hostName}&apos;s table</h2>
              <p className="text-sm text-muted font-bold">
                {target.dateLabel} · {target.time}
              </p>
            </div>

            <div>
              <span className="text-xs font-extrabold uppercase tracking-wide text-rust-dark mb-2 block">Dietary requirements</span>
              <div className="flex gap-2 flex-wrap">
                {DIETARY_OPTIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={dietaries.includes(d) ? "chip active" : "chip"}
                    onClick={() => toggle(dietaries, setDietaries, d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
              {DIETARY_OPTIONS.filter((d) => dietaries.includes(d)).map((d) => (
                <input key={d} type="hidden" name={`dietary_${d}`} value="on" />
              ))}
            </div>

            <div>
              <span className="text-xs font-extrabold uppercase tracking-wide text-rust-dark mb-2 block">Allergies</span>
              <div className="flex gap-2 flex-wrap">
                {ALLERGY_OPTIONS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    className={allergies.includes(a) ? "chip active" : "chip"}
                    onClick={() => toggle(allergies, setAllergies, a)}
                  >
                    {a}
                  </button>
                ))}
              </div>
              {ALLERGY_OPTIONS.filter((a) => allergies.includes(a)).map((a) => (
                <input key={a} type="hidden" name={`allergy_${a}`} value="on" />
              ))}
            </div>

            <div>
              <span className="text-xs font-extrabold uppercase tracking-wide text-rust-dark mb-2 block">A note for your host (optional)</span>
              <textarea
                className="w-full box-border border-2 border-border-soft rounded-2xl px-4 py-3 text-[15px] bg-card text-ink outline-none focus:border-rust"
                name="note"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Anything your host should know?"
              />
            </div>

            {state?.error && <p className="text-sm font-bold text-rust-dark">{state.error}</p>}

            <div className="flex justify-between items-center mt-1">
              <button type="button" className={btnGhostSmall} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className={btnPrimary} disabled={pending}>
                {pending ? "Sending…" : target.confirmLabel}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
