# LumaShift landing launch notes

## 1. Diagnosis of the prior page

The prior page placed a static site inside an iframe. Its abstract room shapes did not make the segmented ceiling fixture immediately clear, the headline and form depended on JavaScript, and the email endpoint was a literal placeholder. No signup could be saved. The new page uses actual page markup, a labeled concept tour, a photo of the prototype, and a server form endpoint.

## 2. Headline variants

| Variant | Headline | Subheadline | Emotion |
| --- | --- | --- | --- |
| A, control | Light, exactly where you want it. | Aim overhead light away from your eyes and toward the places you want to see. | Agency and precision. |
| B, comfort | A home lit for you, not at you. | Redirect overhead light toward the wall, away from your eyes. | Relief and calm. |
| C, craft | Light, engineered. | A segmented overhead light you can aim, customize, save, and reset. | Confidence in considered design. |

Visitors receive a stable variant from a browser visitor ID. With JavaScript disabled, variant A is visible and the form still posts.

## 3. Sequence storyboard

1. **House at dusk.** One warm window. Headline, subheadline, and email form over the establishing view. The image remains steady while the visitor reads.
2. **Window zoom.** “Come closer to the light.” Scroll position continuously scales the house around its warm window; the window fills the view, then crossfades into the interior. This is the signature no-cut move.
3. **Living room.** “Light on the wall. Not your eyes.” First close look at the segmented ceiling fixture. Light shifts from the reader toward the wall through the scene.
4. **Kitchen.** “Make room for the evening.” The same fixture redirects light away from the counter.
5. **Home office.** “Keep your focus in view.” Light travels away from the screen and eyes.
6. **Bedroom.** “Let the room settle.” Wall-directed light makes a quieter composition.
7. **Kid’s room.** “A gentler place to pause.” The fixture sends light away from the bed.
8. **Close.** “Make light feel at home.” The actual prototype photo sits beside the same email form.

The illustrations are explicitly labeled *Concept illustration*. Scroll animation uses a small requestAnimationFrame handler because it ties the window zoom and beam movement directly to scroll without an animation dependency. Reduced-motion users get a static stacked sequence.

## 4. Page code

The complete page is in `app/page.tsx`, `app/globals.css`, and `public/app.js`. The form endpoint is `app/api/collect/route.ts`. Supabase schema is `supabase/20260928_landing_capture.sql`; this migration has been applied only to LumaShift project `tuybiqvthzoguctujzmh`.

## 5. Form, survey, and Google Sheet

The form now writes directly to LumaShift Supabase. The public publishable key is limited by RLS to inserts. A signup saves email, visitor ID, assigned variant, UTM source/medium/campaign, referrer, device type, and CTA location. The same form appears at the beginning and end. When JavaScript is unavailable, the server redirects a successful signup to `/thank-you`.

After signup, the visitor sees an optional six-card survey. Questions, options, and order live in the `SURVEY` object at the top of `public/app.js`. Each card has Skip. Survey answers are saved to `post_signup_surveys`; question events include an answered/skipped outcome in `landing_events`.

The supplied [LumaShift Survey Responses Sheet](https://docs.google.com/spreadsheets/d/11wq2GAgAA2YAX1QnMNdTusN9KI60vdKefr-RwoTWxmM/edit) now has four new tabs: **Landing signups**, **Landing survey**, **Landing events**, and **Landing metrics**. Existing tabs were not changed. To activate automatic mirroring:

1. In that exact Sheet, open **Extensions → Apps Script**. Replace the editor contents with all of `scripts/lumashift-sheet-sync.gs` and save as **LumaShift landing sync**.
2. In Apps Script **Project Settings → Script properties**, add `SHARED_SECRET` with a unique random value of at least 32 characters. Keep it private.
3. Choose **Deploy → New deployment → Web app**. Set **Execute as: Me** and **Who has access: Anyone**. Authorize the script to write this Sheet and copy the Web app URL ending in `/exec`.
4. In the **LumaShift Vercel project only**, add Production environment variables `LUMASHIFT_SHEET_WEBHOOK` (the copied `/exec` URL) and `LUMASHIFT_SHEET_SECRET` (the exact Script Property value). Redeploy the latest LumaShift commit.
5. Use a test email you control in the live form, complete or skip all six survey cards, then check that the test email appears in **Landing signups**, survey answers in **Landing survey**, and visit/scene/CTA events in **Landing events**. Confirm the email and its assigned variant also appear in Supabase `early_access_signups`. Remove the test records after verification so they do not affect conversion reporting.

The Apps Script flattens nested survey answers and automatically adds a new column whenever a new answer key appears. When adding a question, give it a stable `id` in the `SURVEY` config and add that ID to `allowedQuestions` in `app/api/collect/route.ts`. Its column appears automatically on the first new response. Keep IDs unchanged after data collection starts.

## 6. Measurement

The lightest measurement for this Next/Vercel page is the existing first-party `landing_events` insert path; no third-party analytics script is needed. A local visitor ID measures unique visitors among JavaScript-enabled visitors. `visit`, `cta_click` with top/sticky/bottom location, `scene_reach` for every scene including the window zoom, and `survey_question` completion events are captured. Compare signups to unique visitors by variant and source. The **Landing metrics** tab contains these formulas and will populate when the Sheet webhook is active.

Variant unique visitors (in `Landing metrics!B2`, fill through B4):

```gs
=IFERROR(ROWS(UNIQUE(FILTER('Landing events'!$A$2:$A,'Landing events'!$B$2:$B="visit",'Landing events'!$C$2:$C=A2))),0)
```

Variant signups (C2) and conversion (D2):

```gs
=COUNTIF('Landing signups'!$D$2:$D,A2)
=IFERROR(C2/B2,0)
```

Source unique visitors (G2), signups (H2), and conversion (I2), with source name in F2:

```gs
=IF(F2="","",IFERROR(ROWS(UNIQUE(FILTER('Landing events'!$A$2:$A,'Landing events'!$B$2:$B="visit",'Landing events'!$D$2:$D=F2))),0))
=IF(F2="","",COUNTIF('Landing signups'!$E$2:$E,F2))
=IFERROR(H2/G2,0)
```

For CTA clicks, filter **Landing events** to `event_name=cta_click` and group by `cta_location`. For scene reach, filter `event_name=scene_reach` and group by `scene`. For survey completion, filter `event_name=survey_question` and group by `question_id` and `survey_action`; this separates answered from skipped cards. The zoom row shows how many visitors reached the signature moment. With little traffic, A/B differences are directional only. Roughly 1,500 visitors **per variant** are needed to distinguish 3% from 5% conversion with conventional 95% confidence and 80% power; a 3%-versus-4% difference needs several thousand per variant. With three variants, plan for materially more total traffic.

## 7. Placeholders and confirmations

- **[TEAM TO CONFIRM]** privacy sentence, including permission to email for updates and ask for a short lighting conversation. Obtain the team's approved wording and privacy policy before broad promotion.
- **[PLACEHOLDER: Google Apps Script Web app URL]** becomes `LUMASHIFT_SHEET_WEBHOOK` after the Sheet owner deploys the script.
- **[PLACEHOLDER: shared Sheet secret]** becomes `LUMASHIFT_SHEET_SECRET` in Vercel and `SHARED_SECRET` in Apps Script.
- Unconfirmed product facts remain intentionally absent: installation method, fixture compatibility, brightness, selling price, launch date, dimming, color changing, and app connectivity.