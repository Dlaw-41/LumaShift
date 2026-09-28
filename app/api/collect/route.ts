import { NextRequest, NextResponse } from "next/server";
import { insertRow } from "../../lib/lumashift-db";
import { syncSheet } from "../../lib/sheet-sync";

const text = (value: unknown, max = 255) => String(value ?? "").trim().slice(0, max);
const uuid = (value: unknown) => /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(text(value, 36)) ? text(value, 36) : crypto.randomUUID();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedEvents = new Set(["visit", "cta_click", "scene_reach", "survey_question"]);
const allowedScenes = new Set(["establish", "zoom", "living", "kitchen", "office", "bedroom", "nursery", "close"]);
const allowedQuestions = new Set(["use_room", "lighting_problem", "current_workaround", "home_and_fixture", "price_expectation", "conversation"]);

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  let data: Record<string, unknown>;
  try {
    data = contentType.includes("application/json") ? await request.json() : Object.fromEntries(await request.formData());
  } catch {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }
  const type = text(data.type, 20);
  const browserForm = !contentType.includes("application/json");
  const visitorId = uuid(data.visitor_id);
  const token = uuid(data.signup_token);
  const variant = ["A", "B", "C"].includes(text(data.headline_variant, 1)) ? text(data.headline_variant, 1) : "A";
  try {
    if (type === "signup") {
      const email = text(data.email, 254).toLowerCase();
      if (!emailPattern.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
      const row = {
        email, visitor_id: visitorId, signup_token: token, headline_variant: variant,
        utm_source: text(data.utm_source, 100), utm_medium: text(data.utm_medium, 100),
        utm_campaign: text(data.utm_campaign, 100), referrer: text(data.referrer || request.headers.get("referer"), 500),
        device_type: text(data.device_type, 20), cta_location: ["top", "bottom"].includes(text(data.cta_location)) ? text(data.cta_location) : "top",
      };
      await insertRow("early_access_signups", row);
      await syncSheet("Signups", row);
      if (browserForm) return NextResponse.redirect(new URL("/thank-you", request.url), 303);
      return NextResponse.json({ ok: true, signup_token: token });
    }
    if (type === "event") {
      const name = text(data.event_name, 40);
      if (!allowedEvents.has(name)) return NextResponse.json({ error: "Unknown event." }, { status: 400 });
      const scene = text(data.scene, 30);
      const question = text(data.question_id, 50);
      const row = {
        visitor_id: visitorId, event_name: name, headline_variant: variant,
        utm_source: text(data.utm_source, 100),
        cta_location: ["top", "sticky", "bottom"].includes(text(data.cta_location)) ? text(data.cta_location) : null,
        scene: allowedScenes.has(scene) ? scene : null,
        question_id: allowedQuestions.has(question) ? question : null,
        survey_action: ["answered", "skipped"].includes(text(data.survey_action)) ? text(data.survey_action) : null,
      };
      await insertRow("landing_events", row);
      await syncSheet("Events", row);
      return NextResponse.json({ ok: true });
    }
    if (type === "survey") {
      const answers = data.answers;
      if (!answers || typeof answers !== "object" || Array.isArray(answers)) return NextResponse.json({ error: "Invalid survey." }, { status: 400 });
      const clean: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(answers)) {
        if (allowedQuestions.has(key)) clean[key] = JSON.parse(JSON.stringify(value).slice(0, 2000));
      }
      const row = { signup_token: token, visitor_id: visitorId, answers: clean };
      await insertRow("post_signup_surveys", row);
      await syncSheet("Survey", row);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Unknown submission." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save right now.";
    if (type === "signup" && message.includes("(409)")) {
      if (browserForm) return NextResponse.redirect(new URL("/thank-you", request.url), 303);
      return NextResponse.json({ ok: true, signup_token: token });
    }
    console.error("LumaShift collection error", message);
    return NextResponse.json({ error: "We couldn’t save that. Please try again." }, { status: 503 });
  }
}