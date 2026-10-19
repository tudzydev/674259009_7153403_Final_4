
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type ApiResponse<T> = {
  data: T;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export async function apiFetch<T>(
  )
}