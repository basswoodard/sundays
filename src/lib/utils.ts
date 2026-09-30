export function parseList(json: string): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function toListJson(values: string[]): string {
  return JSON.stringify(values.filter(Boolean));
}

export const DIETARY_OPTIONS = ["Vegetarian", "Vegan", "Pescatarian", "Halal", "Kosher", "Gluten-free", "Dairy-free"];
export const ALLERGY_OPTIONS = ["Peanuts", "Tree nuts", "Shellfish", "Eggs", "Dairy", "Soy", "Gluten", "Sesame"];
export const CUISINE_SUGGESTIONS = ["Danish", "Italian", "Indian", "Mexican", "Middle Eastern", "Thai", "Vegetarian", "Surprise"];
export const PAYMENT_METHODS = ["MobilePay", "Revolut", "Wise", "Cash"];

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
}

export function calcAge(dob: string): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const diffMs = Date.now() - d.getTime();
  return Math.floor(diffMs / (365.25 * 24 * 3600 * 1000));
}

const DAY_MS = 24 * 3600 * 1000;

export function toIsoDate(d: Date): string {
  // Use local date components, not toISOString(), which would shift the
  // date backward for any timezone ahead of UTC.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Returns the next `count` upcoming Sundays as { iso, label }, starting from today (inclusive) if today is a Sunday. */
export function getUpcomingSundays(count: number): { iso: string; label: string }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntilSunday = (7 - today.getDay()) % 7; // 0 if today is Sunday
  const first = new Date(today.getTime() + daysUntilSunday * DAY_MS);

  const out: { iso: string; label: string }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(first.getTime() + i * 7 * DAY_MS);
    const iso = toIsoDate(d);
    const label =
      i === 0
        ? `This Sunday · ${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
        : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    out.push({ iso, label });
  }
  return out;
}
