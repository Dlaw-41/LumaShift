// Optional Google Sheet mirror. Supabase is the durable source if this is unavailable.
export async function syncSheet(kind: "Signups" | "Survey" | "Events", row: Record<string, unknown>) {
  const url = process.env.LUMASHIFT_SHEET_WEBHOOK;
  const secret = process.env.LUMASHIFT_SHEET_SECRET;
  if (!url || !secret) return;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ kind, secret, row }),
      signal: AbortSignal.timeout(3500),
      cache: "no-store",
    });
    if (!response.ok || !(await response.text()).includes('"ok":true')) throw new Error("Sheet mirror rejected the row.");
  } catch (error) {
    console.error("LumaShift Sheet sync failed", error);
  }
}