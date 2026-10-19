import type { Event } from "@/types/event";

/** Format in Thailand's time zone by default on both server and browser. */
export function formatEventDate(
  date: string,
  locale = "th-TH",
  options: Intl.DateTimeFormatOptions = {},
): string {
  const parsed = new Date(date);
  if (!Number.isFinite(parsed.getTime())) return "ไม่ระบุวันที่";

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Bangkok",
    ...options,
  }).format(parsed);
}

/** Return a sorted copy; invalid dates always appear last. */
export function sortEventsByDate(
  events: readonly Event[],
  order: "asc" | "desc" = "asc",
): Event[] {
  return [...events].sort((a, b) => {
    const first = Date.parse(a.eventDate);
    const second = Date.parse(b.eventDate);
    if (!Number.isFinite(first)) return Number.isFinite(second) ? 1 : 0;
    if (!Number.isFinite(second)) return -1;
    return order === "asc" ? first - second : second - first;
  });
}

export function filterEvents(events: readonly Event[], query: string): Event[] {
  const search = query.trim().toLowerCase();
  return events.filter((event) =>
    [event.title].some((value) => value.toLowerCase().includes(search)),
  );
}
