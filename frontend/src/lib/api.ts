import type { Event } from "@/tpyes/event";
import type { EventInput } from "@/lib/event-validation";

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
      "Cannot connect to the event server. Make sure the backend is running and try again.",
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
        : `Event request failed (${response.status}). Please try again.`;
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const eventApi = {
  async getAll(): Promise<Event[]> {
    const result = await request<ApiResponse<Event[]>>("/api/events");
    return result.data;
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
