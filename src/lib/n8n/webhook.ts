export async function sendWebhookWithRetry(
  url: string,
  payload: Record<string, unknown>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<unknown> {
  let lastErr: Error | null = null;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Webhook HTTP ${res.status}`);
      return await res.json().catch(() => ({}));
    } catch (e) {
      lastErr = e as Error;
      await new Promise((r) => setTimeout(r, initialDelay * Math.pow(2, i)));
    }
  }
  throw new Error(lastErr?.message || "Webhook échec inconnu");
}
