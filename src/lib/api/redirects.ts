export type RedirectEntry = {
  from: string;
  to: string;
  statusCode: number;
};

const CMS =
  typeof window === "undefined"
    ? (process.env.CMS_URL ?? "http://localhost:3000")
    : (process.env.NEXT_PUBLIC_CMS_URL ?? "");

export async function getRedirects(
  options: { timeoutMs?: number } = {},
): Promise<RedirectEntry[]> {
  const timeoutMs = options.timeoutMs ?? 1000;
  let signal: AbortSignal | undefined;
  if (
    typeof AbortSignal !== "undefined" &&
    typeof AbortSignal.timeout === "function"
  ) {
    signal = AbortSignal.timeout(timeoutMs);
  }

  const res = await fetch(`${CMS}/api/v1/redirects`, {
    next: { revalidate: 60, tags: ["redirects"] },
    signal,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch redirects: ${res.status}`);
  }

  const json = await res.json();
  if (!json || json.success !== true || !Array.isArray(json.data)) {
    throw new Error("Invalid redirects response");
  }

  return json.data as RedirectEntry[];
}
