const hero = document.querySelector('.hero');

function setLightingZone(clientX) {
  const rect = hero.getBoundingClientRect();
  const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  hero.dataset.zone = x < 0.34 ? 'left' : x > 0.66 ? 'right' : 'center';
}
hero.addEventListener('pointermove', (event) => setLightingZone(event.clientX));
hero.addEventListener('pointerleave', () => { hero.dataset.zone = 'center'; });
hero.addEventListener('touchstart', (event) => { if (event.touches[0]) setLightingZone(event.touches[0].clientX); }, { passive: true });
hero.dataset.zone = 'center';

const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
}), { threshold: 0.14, rootMargin: '0px 0px -40px' });
document.querySelectorAll('.reveal').forEach((element, index) => { element.style.transitionDelay = `${Math.min((index % 3) * 90, 180)}ms`; observer.observe(element); });

async function submitSurvey(payload) {
  const table = payload.branch === 'yes' ? 'light_sensitivity_yes_responses' : 'light_sensitivity_no_responses';
  const response = await fetch(`https://tuybiqvthzoguctujzmh.supabase.co/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      apikey: 'sb_publishable_27vGI5yravudmlJw8vhv-w_uMGLEVdY',
      Authorization: 'Bearer sb_publishable_27vGI5yravudmlJw8vhv-w_uMGLEVdY',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload.branch === 'yes' ? {
      bother_frequency: payload.botherFrequency, last_incident: payload.lastIncident || null,
      actions_taken: payload.actionsTaken, spending_details: payload.spendingDetails || null,
      work_environment: payload.workEnvironment, email: payload.email || null,
    } : {
      adjustment_details: payload.adjustmentDetails || null,
      work_environment: payload.workEnvironment, email: payload.email || null,
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result?.error || 'We couldn’t save that right now. Please try again.');
  return result;
}

const surveyHost = document.querySelector('#survey-cta');
const workOptions = ['Work from home', 'Office', 'Both'];
const actionOptions = ['Avoided the room', 'Closed blinds', 'Worn sunglasses indoors', 'Worn special glasses', 'Changed bulbs', 'Used a lamp instead', 'Complained to a landlord or employer', 'Nothing'];
const escapeHtml = (value) => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
function choiceGroup(name, options) { return `<div class="survey-options" role="radiogroup">${options.map((option) => `<label class="survey-option"><input type="radio" name="${name}" value="${escapeHtml(option)}" required><span>${escapeHtml(option)}</span></label>`).join('')}</div>`; }

function renderScreener() {
  surveyHost.innerHTML = `<div class="survey-topline"><p>Quick research survey <span>(about 2 minutes)</span></p><span>1 / 2</span></div><h3>Do you get migraines, or would you describe yourself as sensitive to bright or fluorescent lighting?</h3><div class="survey-choices survey-screener" role="group" aria-label="Lighting sensitivity"><button class="survey-choice" type="button" data-branch="yes">Yes</button><button class="survey-choice" type="button" data-branch="no">No</button></div>`;
  surveyHost.querySelectorAll('[data-branch]').forEach((button) => button.addEventListener('click', () => renderSurvey(button.dataset.branch)));
}

function renderSurvey(branch) {
  const fields = branch === 'yes' ? `<fieldset class="survey-field"><legend>About how often does overhead lighting bother you or trigger a migraine?</legend>${choiceGroup('bother_frequency', ['Never', 'Rarely', 'Monthly', 'Weekly', 'Daily'])}</fieldset><label class="survey-field">Tell me about the last time overhead lighting bothered you. What were you doing, where were you, what happened?<textarea name="last_incident" rows="4" placeholder="Your experience, if you’re comfortable sharing"></textarea></label><fieldset class="survey-field"><legend>What have you actually done about it?</legend><div class="survey-options survey-checkboxes">${actionOptions.map((option) => `<label class="survey-option"><input type="checkbox" name="actions_taken" value="${escapeHtml(option)}"><span>${escapeHtml(option)}</span></label>`).join('')}</div></fieldset><label class="survey-field">Have you ever spent money specifically to deal with light sensitivity? If yes, what did you buy and roughly how much did it cost?<textarea name="spending_details" rows="3" placeholder="Optional"></textarea></label>` : `<label class="survey-field">Have you ever adjusted lighting somewhere, home or work, to feel more comfortable? What did you do?<textarea name="adjustment_details" rows="4" placeholder="Your experience, if you’re comfortable sharing"></textarea></label>`;
  surveyHost.innerHTML = `<div class="survey-topline"><p>Quick research survey <span>(about 2 minutes)</span></p><button class="survey-back" type="button">Change answer</button></div><form class="lighting-survey-form">${fields}<fieldset class="survey-field"><legend>Do you work from home, in an office, or both?</legend>${choiceGroup('work_environment', workOptions)}</fieldset><label class="survey-field">Email, if you want to hear when this is available<input name="email" type="email" autocomplete="email" placeholder="you@email.com"></label><p class="survey-privacy">We’ll only use your email for LumaShift updates. Your survey responses are kept private.</p><div class="survey-submit-row"><button class="survey-submit" type="submit">Send my response <span aria-hidden="true">→</span></button><p class="survey-error" aria-live="polite"></p></div></form>`;
  surveyHost.querySelector('.survey-back').addEventListener('click', renderScreener);
  surveyHost.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault(); const form = event.currentTarget; if (!form.reportValidity()) return;
    const data = new FormData(form); const button = form.querySelector('button[type="submit"]'); const error = form.querySelector('.survey-error');
    button.disabled = true; button.textContent = 'Sending…'; error.textContent = '';
    try {
      await submitSurvey({ stage: 'lighting-survey', branch, email: data.get('email'), botherFrequency: data.get('bother_frequency'), lastIncident: data.get('last_incident'), actionsTaken: data.getAll('actions_taken'), spendingDetails: data.get('spending_details'), adjustmentDetails: data.get('adjustment_details'), workEnvironment: data.get('work_environment') });
      surveyHost.innerHTML = `<div class="survey-thanks" role="status"><span aria-hidden="true">✓</span><div><strong>Thank you for sharing.</strong><p>Your response has been received.</p></div></div>`;
    } catch (submitError) { button.disabled = false; button.innerHTML = 'Send my response <span aria-hidden="true">→</span>'; error.textContent = submitError.message; }
  });
}
renderScreener();
