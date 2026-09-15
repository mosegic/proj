export async function readJsonResponse<T extends Record<string, unknown> = Record<string, unknown>>(
  response: Response,
): Promise<T> {
  const text = await response.text();
  if (!text.trim()) {
    return {} as T;
  }

  try {
    const data: unknown = JSON.parse(text);
    return data && typeof data === "object" ? (data as T) : ({} as T);
  } catch {
    throw new Error(
      response.ok
        ? "The server returned an invalid response"
        : `Request failed (${response.status})`,
    );
  }
}

export function responseError(data: Record<string, unknown>, fallback: string) {
  return typeof data.error === "string" && data.error ? data.error : fallback;
}
