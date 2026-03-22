/**
 * Shared API utility for SyntaxSpace
 * Centralises base URL and auth header injection so all fetch calls
 * work correctly both locally (Vite dev server) and in production (S3 → EC2).
 */

// -------------------------------------------------------------------
// Backend base URL
// In development  → read from .env.development  (VITE_API_URL=http://localhost:8000)
// In production   → read from .env.production   (VITE_API_URL=http://16.171.197.228:8000)
// Hard fallback keeps it working if the env file is missing.
// -------------------------------------------------------------------
export const BACKEND: string =
  import.meta.env.VITE_API_URL ?? "https://syntaxspace.onrender.com";

// -------------------------------------------------------------------
// Auth headers
// -------------------------------------------------------------------
export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// -------------------------------------------------------------------
// apiFetch — drop-in replacement for fetch()
//
//  • Relative paths (e.g. "/check-auth") are prepended with BACKEND.
//  • Absolute URLs (e.g. "http://...") are used as-is.
//  • Authorization header is injected automatically.
//  • Content-Type: application/json is added for JSON body requests.
//  • FormData bodies: Content-Type is NOT set (browser handles multipart boundary).
// -------------------------------------------------------------------
export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = path.startsWith("http") ? path : `${BACKEND}${path}`;

  const isFormData = options.body instanceof FormData;
  const hasJsonBody =
    !isFormData &&
    options.body !== undefined &&
    options.method &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(options.method.toUpperCase());

  const headers: Record<string, string> = {
    ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
    ...getAuthHeaders(),
    ...(options.headers as Record<string, string> | undefined),
  };

  return fetch(url, { ...options, headers });
}
