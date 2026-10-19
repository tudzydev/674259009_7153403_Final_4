import type { Event } from "@/tpyes/event";

export type EventInput = Pick<Event, "name" | "description" | "date" | "location">;
export type EventValidationErrors = Partial<Record<keyof EventInput, string>>;

export type EventValidationResult =
  | { success: true; data: EventInput }
  | { success: false; errors: EventValidationErrors };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Validate editable fields and trim surrounding whitespace. */
export function validateEvent(input: unknown): EventValidationResult {
  const source = isRecord(input) ? input : {};
  const errors: EventValidationErrors = {};
  const data: EventInput = { name: "", description: "", date: "", location: "" };

  for (const field of ["name", "description", "date", "location"] as const) {
    const value = source[field];
    if (typeof value !== "string" || !value.trim()) {
      errors[field] = `${field[0].toUpperCase()}${field.slice(1)} is required.`;
    } else {
      data[field] = value.trim();
    }
  }

  if (!errors.date && !Number.isFinite(Date.parse(data.date))) {
    errors.date = "Enter a valid event date.";
  }

  return Object.keys(errors).length > 0
    ? { success: false, errors }
    : { success: true, data };
}

/** Check a complete event received from an external source. */
export function isEvent(value: unknown): value is Event {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    Number.isSafeInteger(value.id) &&
    validateEvent(value).success &&
    typeof value.createdAt === "string" &&
    Number.isFinite(Date.parse(value.createdAt)) &&
    typeof value.updatedAt === "string" &&
    Number.isFinite(Date.parse(value.updatedAt))
  );
}
