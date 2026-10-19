import { EVENT_CATEGORIES, type Event, type EventInput } from "@/types/event";
export type { EventInput } from "@/types/event";
export type EventValidationErrors = Partial<Record<keyof EventInput, string>>;
export type EventValidationResult =
  | { success: true; data: EventInput }
  | { success: false; errors: EventValidationErrors };

export function isEventDate(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    value.startsWith("0000")
  )
    return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export function validateEvent(input: unknown): EventValidationResult {
  const source: Record<string, unknown> =
    typeof input === "object" && input !== null && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};
  const errors: EventValidationErrors = {};
  const text = (
    field: "title" | "organizer" | "description",
    label: string,
    max: number,
  ) => {
    const value = typeof source[field] === "string" ? source[field].trim() : "";
    if (!value) errors[field] = `กรุณาระบุ${label}`;
    else if (value.length > max)
      errors[field] =
        `${label}ต้องไม่เกิน ${max.toLocaleString("th-TH")} ตัวอักษร`;
    return value;
  };
  const title = text("title", "ชื่อกิจกรรม", 150);
  const organizer = text("organizer", "ผู้จัดกิจกรรม", 100);
  const description = text("description", "รายละเอียดกิจกรรม", 2000);
  if (!EVENT_CATEGORIES.some((category) => category === source.category))
    errors.category = "กรุณาเลือกหมวดหมู่กิจกรรม";
  if (!isEventDate(source.eventDate))
    errors.eventDate = "กรุณาระบุวันที่ที่มีอยู่จริงในรูปแบบ YYYY-MM-DD";
  if (typeof source.status !== "boolean")
    errors.status = "กรุณาระบุสถานะกิจกรรม";
  if (Object.keys(errors).length) return { success: false, errors };
  return {
    success: true,
    data: {
      title,
      organizer,
      description,
      category: source.category as EventInput["category"],
      eventDate: source.eventDate as string,
      status: source.status as boolean,
    },
  };
}

export function isEvent(value: unknown): value is Event {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;
  const record = value as Record<string, unknown>;
  return (
    Number.isSafeInteger(record.id) &&
    (record.id as number) > 0 &&
    validateEvent(record).success &&
    [record.createdAt, record.updatedAt].every(
      (date) =>
        date === undefined ||
        (typeof date === "string" && Number.isFinite(Date.parse(date))),
    )
  );
}
