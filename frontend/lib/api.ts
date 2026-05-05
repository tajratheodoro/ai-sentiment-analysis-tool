export type Sentiment = "Positive" | "Neutral" | "Negative";

export type Analysis = {
  id: number | null;
  feedback: string;
  sentiment: Sentiment;
};

export type Report = {
  total_feedbacks: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  positive_percentage: number;
};

function getApiBaseUrls() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return [process.env.NEXT_PUBLIC_API_URL, ""];
  }

  if (typeof window !== "undefined") {
    return ["", "http://127.0.0.1:8000"];
  }

  return ["http://127.0.0.1:8000"];
}

function getOfflineError() {
  return new Error("Sentiment API is offline. Start the FastAPI backend on http://127.0.0.1:8000 and try again.");
}

async function readJson<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  return response.json() as Promise<T>;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const hasBody = options?.body !== undefined;
  let lastNetworkError: unknown;
  const baseUrls = getApiBaseUrls();

  for (const [index, baseUrl] of baseUrls.entries()) {
    let response: Response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers: {
          ...(hasBody ? { "Content-Type": "application/json" } : {}),
          ...options?.headers,
        },
      });
    } catch {
      lastNetworkError = getOfflineError();
      continue;
    }

    if (!response.ok) {
      const data = await readJson<{ detail?: string }>(response);
      if (typeof data?.detail === "string") {
        throw new Error(data.detail);
      }

      lastNetworkError = getOfflineError();
      if (index < baseUrls.length - 1) continue;

      throw lastNetworkError;
    }

    const data = await readJson<T>(response);
    if (data !== null) return data;

    lastNetworkError = getOfflineError();
    if (index < baseUrls.length - 1) continue;
  }

  throw lastNetworkError ?? getOfflineError();
}

export function analyzeFeedback(feedback: string) {
  return request<Analysis>("/api/analyze", {
    method: "POST",
    body: JSON.stringify({ feedback }),
  });
}

export function getHistory() {
  return request<Analysis[]>("/api/history");
}

export function getReport() {
  return request<Report>("/api/report");
}

export function clearHistory() {
  return request<{ message: string }>("/api/history", { method: "DELETE" });
}
