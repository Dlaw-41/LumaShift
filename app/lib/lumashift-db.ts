// Public key only. Supabase RLS permits anonymous INSERT and forbids reads.
const projectUrl = "https://tuybiqvthzoguctujzmh.supabase.co";
const publishableKey = "sb_publishable_27vGI5yravudmlJw8vhv-w_uMGLEVdY";

export async function insertRow(table: "early_access_signups" | "landing_events" | "post_signup_surveys", row: Record<string, unknown>) {
  const response = await fetch(`${projectUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "apikey": publishableKey,
      "Authorization": `Bearer ${publishableKey}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal",
    },
    body: JSON.stringify(row),
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`LumaShift database insert failed (${response.status}): ${detail.slice(0, 160)}`);
  }
}