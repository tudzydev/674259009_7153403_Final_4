import type { RequestHandler } from "express";
import { Op, type WhereOptions } from "sequelize";
import { Event } from "../models/eventModel";

type EventHandler = RequestHandler<{ id: string }, unknown, unknown>;

export type EventInput = {
  title: string;
  organizer: string;
  category: "อบรม" | "สัมมนา" | "จิตอาสา";
  eventDate: string;
  description: string;
  status?: boolean;
};

function isRequiredText(value: unknown, maxLength: number): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= maxLength
  );
}

function isEventDate(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    value.startsWith("0000")
  ) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export function isEventInput(data: unknown): data is EventInput {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return false;
  }

  return (
    "title" in data &&
    isRequiredText(data.title, 150) &&
    "organizer" in data &&
    isRequiredText(data.organizer, 100) &&
    "category" in data &&
    (data.category === "อบรม" ||
      data.category === "สัมมนา" ||
      data.category === "จิตอาสา") &&
    "eventDate" in data &&
    isEventDate(data.eventDate) &&
    "description" in data &&
    isRequiredText(data.description, 2000) &&
    (!("status" in data) ||
      data.status === undefined ||
      typeof data.status === "boolean")
  );
}

function parseEventId(value: string): number | undefined {
  if (!/^[1-9]\d*$/.test(value)) return undefined;
  const id = Number(value);
  return Number.isSafeInteger(id) && id <= 2147483647 ? id : undefined;
}

function eventValues(input: EventInput): EventInput {
  return {
    title: input.title,
    organizer: input.organizer,
    category: input.category,
    eventDate: input.eventDate,
    description: input.description,
    ...(input.status === undefined ? {} : { status: input.status }),
  };
}

export const getEvents: RequestHandler = async (req, res) => {
  const { search, category } = req.query;
  if (
    (search !== undefined && typeof search !== "string") ||
    (category !== undefined &&
      (typeof category !== "string" ||
        !["", "อบรม", "สัมมนา", "จิตอาสา"].includes(category)))
  ) {
    res.status(400).json({ error: "Invalid event filters" });
    return;
  }

  const where: { category?: string; [Op.or]?: WhereOptions[] } = {};
  if (typeof search === "string" && search.trim()) {
    // Treat SQL LIKE wildcards as literal characters in the user's search.
    const pattern = `%${search.trim().replace(/[\\%_]/g, "\\$&")}%`;
    where[Op.or] = [
      { title: { [Op.iLike]: pattern } },
      { organizer: { [Op.iLike]: pattern } },
    ];
  }
  if (typeof category === "string" && category) where.category = category;

  const events = await Event.findAll({
    where,
    order: [
      ["eventDate", "ASC"],
      ["id", "ASC"],
    ],
  });
  res.status(200).json({ data: events });
};

export const getEvent: EventHandler = async (req, res) => {
  const id = parseEventId(req.params.id);
  if (id === undefined) {
    res.status(400).json({ error: "Invalid event ID" });
    return;
  }
  const event = await Event.findByPk(id);
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.status(200).json({ data: event });
};

export const createEvent: RequestHandler<
  Record<string, never>,
  unknown,
  unknown
> = async (req, res) => {
  if (!isEventInput(req.body)) {
    res.status(400).json({ error: "Invalid event input" });
    return;
  }
  const event = await Event.create(eventValues(req.body));
  res.status(201).json({ data: event });
};

export const updateEvent: EventHandler = async (req, res) => {
  const id = parseEventId(req.params.id);
  if (id === undefined) {
    res.status(400).json({ error: "Invalid event ID" });
    return;
  }
  if (!isEventInput(req.body)) {
    res.status(400).json({ error: "Invalid event input" });
    return;
  }
  const event = await Event.findByPk(id);
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  await event.update(eventValues(req.body));
  res.status(200).json({ data: event });
};

export const deleteEvent: EventHandler = async (req, res) => {
  const id = parseEventId(req.params.id);
  if (id === undefined) {
    res.status(400).json({ error: "Invalid event ID" });
    return;
  }
  const deleted = await Event.destroy({ where: { id } });
  if (deleted === 0) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.status(200).json({ message: "Event deleted successfully" });
};
