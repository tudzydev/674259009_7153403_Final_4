export const EVENT_CATEGORIES = ["อบรม", "สัมมนา", "จิตอาสา"] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export interface Event {
  id: number;
  title: string;
  organizer: string;
  category: EventCategory;
  eventDate: string;
  description: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type EventInput = Omit<Event, "id" | "createdAt" | "updatedAt">;
export type EventFilters = { search?: string; category?: EventCategory };
