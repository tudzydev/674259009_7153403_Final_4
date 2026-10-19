import type { Event, EventInput, EventFilters } from "@/types/event";
import { filterEvents } from "@/lib/event-utils";
import { isEvent } from "@/lib/event-validation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type ApiResponse<T> = {
  data: T;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL.replace(/\/+$/, "")}${path}`, {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์กิจกรรมได้ กรุณาตรวจสอบว่า backend กำลังทำงาน",
    );
  }

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message =
      body &&
      typeof body === "object" &&
      "message" in body &&
      typeof body.message === "string"
        ? body.message
        : `ดำเนินการไม่สำเร็จ (${response.status}) กรุณาลองอีกครั้ง`;
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const eventApi = {
  async getAll(
    filters: EventFilters = {},
    signal?: AbortSignal,
  ): Promise<Event[]> {
    const query = new URLSearchParams();
    if (filters.search?.trim()) query.set("search", filters.search.trim());
    if (filters.category) query.set("category", filters.category);
    const result = await request<ApiResponse<unknown>>(
      `/api/events${query.size ? `?${query}` : ""}`,
      { signal },
    );
    if (!Array.isArray(result.data) || !result.data.every(isEvent)) {
      throw new ApiError("รูปแบบข้อมูลกิจกรรมจากเซิร์ฟเวอร์ไม่ถูกต้อง");
    }
    // The current backend ignores query parameters; keep this compatibility
    // filter until server-side filtering is available. Always send both filters.
    return filterEvents(result.data, filters.search ?? "").filter(
      (event) => !filters.category || event.category === filters.category,
    );
  },

  async getById(id: number): Promise<Event> {
    const result = await request<ApiResponse<Event>>(`/api/events/${id}`);
    return result.data;
  },

  async create(data: EventInput): Promise<Event> {
    const result = await request<ApiResponse<Event>>("/api/events", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return result.data;
  },

  async update(id: number, data: EventInput): Promise<Event> {
    const result = await request<ApiResponse<Event>>(`/api/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return result.data;
  },

  async delete(id: number): Promise<void> {
    await request<{ message: string }>(`/api/events/${id}`, {
      method: "DELETE",
    });
  },
};
