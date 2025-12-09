// client/src/shared/api/httpClient.ts
export class ApiError extends Error {
    status: number;
    body: unknown;
  
    constructor(message: string, status: number, body: unknown) {
      super(message);
      this.name = "ApiError";
      this.status = status;
      this.body = body;
    }
  }
  
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
  
  /**
   * Build full URL from a path like "/me/memberships".
   */
  function buildUrl(path: string): string {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    const base = API_BASE_URL.replace(/\/+$/, "");
    const trimmedPath = path.replace(/^\/+/, "");
    return `${base}/${trimmedPath}`;
  }
  
  /**
   * Generic GET helper:
   * - T is the expected response type (we'll type it per endpoint)
   * - Throws ApiError on non-2xx responses
   */
  export async function apiGet<T>(
    path: string,
    init?: RequestInit,
  ): Promise<T> {
    const url = buildUrl(path);
  
    const response = await fetch(url, {
      method: "GET",
      credentials: "include", // for cookies later (refresh token, etc.)
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      ...init,
    });
  
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
  
    if (!response.ok) {
      throw new ApiError(
        data?.error || `GET ${path} failed with status ${response.status}`,
        response.status,
        data,
      );
    }
  
    return data as T;
  }
  