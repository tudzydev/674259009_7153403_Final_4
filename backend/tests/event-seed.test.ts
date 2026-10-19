import { expect, test } from "bun:test";
import { initialEvents } from "../src/seeds/events";

test("sample events contain valid data and both statuses in all three categories", () => {
  expect(initialEvents.length).toBeGreaterThanOrEqual(10);
  expect(new Set(initialEvents.map((event) => event.title)).size).toBe(initialEvents.length);
  for (const category of ["อบรม", "สัมมนา", "จิตอาสา"]) {
    const events = initialEvents.filter((event) => event.category === category);
    expect(events.length).toBe(4);
    expect(events.filter((event) => event.status)).toHaveLength(2);
    expect(events.filter((event) => !event.status)).toHaveLength(2);
  }
  for (const event of initialEvents) {
    expect(event.title.trim().length).toBeGreaterThan(0);
    expect(event.organizer.trim().length).toBeGreaterThan(0);
    expect(event.description.trim().length).toBeGreaterThan(0);
    expect(new Date(`${event.eventDate}T00:00:00.000Z`).toISOString().slice(0, 10)).toBe(event.eventDate);
  }
});
