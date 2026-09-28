// Survey questions, options, and order: edit this object to change the survey.
const SURVEY = { questions: [
  {id:"use_room",title:"Where would you use LumaShift first?",type:"multi",options:["Bedroom","Kid’s room or nursery","Living room","Kitchen","Home office","Bathroom","Other"]},
  {id:"lighting_problem",title:"What bothers you most about overhead lighting?",type:"single",options:["Glare or brightness in my eyes","Headaches or eye strain","It disturbs sleep or someone resting","Harsh or unflattering mood","I can’t aim or adjust where it goes","Nothing, I’m just curious","Other"],other:true},
  {id:"current_workaround",title:"What do you do about it today?",type:"multi",options:["Use lamps instead","Dimmers or dimmable bulbs","Different bulbs","Covers or diffusers","Avoid the light","Nothing","Other"],other:true},
  {id:"home_and_fixture",title:"Tell us about your home.",type:"two",groups:[{title:"Do you own or rent?",options:["Own","Rent","Other"]},{title:"What kind of ceiling light is in that room?",options:["Recessed can","Flush or semi-flush mount","Ceiling fan light","Pendant or bulb socket","Not sure"]}]},
  {id:"price_expectation",title:"What would you expect to pay for one?",type:"single",options:["Under $30","$30 to $59","$60 to $79","$80 to $99","$100 to $149","$150 or more","Not sure"]},
  {id:"conversation",title:"Open to a 10-minute conversation?",type:"single",options:["Yes","No"],contact:true}
] };
const HEADLINES={A:["Light, exactly where you want it.","Aim overhead light away from your eyes and toward the places you want to see."],B:["A home lit for you, not at you.","Redirect overhead light toward the wall, away from your eyes."],C:["Light, engineered.","A segmented overhead light you can aim, customize, save, and reset."]};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],clamp=x=>Math.max(0,Math.min(1,x));
const api=(body,keepalive=false)=>fetch("/api/collect",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),keepalive});
const visitorId=(()=>{try{let id=localStorage.getItem("lumashift-visitor");if(!id){id=crypto.randomUUID();localStorage.setItem("lumashift-visitor",id)}return id}catch{return crypto.randomUUID()}})();
const variant=["A","B","C"][parseInt(visitorId.replaceAll("-","").slice(0,8),16)%3];
const params=new URLSearchParams(location.search),source=(params.get("utm_source")||"direct").slice(0,100);
const common=()=>({visitor_id:visitorId,headline_variant:variant,utm_source:source});
const track=(event_name,extra={})=>api({type:"event",event_name,...common(),...extra},true).catch(()=>{});
$("#headline").textContent=HEADLINES[variant][0];$("#subheadline").textContent=HEADLINES[variant][1];
$$(".email-form").forEach(form=>{
  form.querySelector("button").addEventListener("click",()=>track("cta_click",{cta_location:form.dataset.location}));
  const values={headline_variant:variant,visitor_id:visitorId,utm_source:source,utm_medium:params.get("utm_medium")||"",utm_campaign:params.get("utm_campaign")||"",referrer:document.referrer,device_type:matchMedia("(max-width:760px)").matches?"mobile":"desktop",signup_token:crypto.randomUUID()};
  Object.entries(values).forEach(([key,value])=>{const input=form.elements.namedItem(key);if(input)input.value=String(value).slice(0,500)});
  form.addEventListener("submit",async event=>{
    event.preventDefault();const button=form.querySelector("button"),status=form.querySelector(".form-status");button.disabled=true;status.textContent="Saving your place…";
    const payload=Object.fromEntries(new FormData(form));
    try{const response=await api(payload),result=await response.json();if(!response.ok)throw Error(result.error||"Please try again.");status.textContent="You’re on the list.";form.reset();showSurvey(result.signup_token||payload.signup_token)}
    catch(error){status.textContent=error.message||"Please try again."}finally{button.disabled=false}
  });
});
$(".header-cta").addEventListener("click",()=>track("cta_click",{cta_location:"sticky"}));
track("visit");
const scenes=$$("[data-scene]"),stage=$(".visual-stage"),roomLayer=$(".room-layer");let ticking=false;
function renderTour(){ticking=false;
  const vh=innerHeight,p=clamp(-scenes[1].getBoundingClientRect().top/vh);
  stage.style.setProperty("--house-scale",String(1+5.4*p));
  stage.style.setProperty("--house-opacity",String(1-clamp((p-.71)/.29)));
  stage.style.setProperty("--room-opacity",String(clamp((p-.67)/.33)));
  const active=scenes.find((node,i)=>i>=2&&i<=6&&node.getBoundingClientRect().top<=vh*.5&&node.getBoundingClientRect().bottom>vh*.5);
  if(active){roomLayer.dataset.room=active.dataset.scene;const rect=active.getBoundingClientRect(),v=clamp((vh*.5-rect.top)/rect.height);stage.style.setProperty("--house-opacity","0");stage.style.setProperty("--room-opacity","1");stage.style.setProperty("--wall-glow",String(.15+.78*v));stage.style.setProperty("--person-glow",String(.75*(1-v)));stage.style.setProperty("--beam-angle",`${-27*v}deg`)}
  const close=scenes[7].getBoundingClientRect();
  if(close.top<vh*.5){const v=clamp((vh*.5-close.top)/(vh*.75));stage.style.setProperty("--house-scale",String(6.4-5.4*v));stage.style.setProperty("--house-opacity",String(v));stage.style.setProperty("--room-opacity",String(1-v));stage.style.setProperty("--house-night",String(1-.25*v))}
}
addEventListener("scroll",()=>{if(!ticking){ticking=true;requestAnimationFrame(renderTour)}},{passive:true});addEventListener("resize",renderTour);renderTour();
const seen=new Set(),observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){const scene=entry.target.dataset.scene;if(!seen.has(scene)){seen.add(scene);track("scene_reach",{scene})}}}),{threshold:.35});scenes.forEach(node=>observer.observe(node));
const dialog=$("#survey-dialog"),card=$("#survey-card");let questionIndex=0,signupToken=null;const answers={};
function options(values,type,name){const wrap=document.createElement("div");wrap.className="survey-options";values.forEach(value=>{const label=document.createElement("label"),input=document.createElement("input");input.type=type==="multi"?"checkbox":"radio";input.name=name;input.value=value;label.append(input,document.createTextNode(value));wrap.append(label)});return wrap}
function field(placeholder,cls){const input=document.createElement("input");input.type="text";input.className=cls;input.placeholder=placeholder;input.maxLength=150;return input}
function renderQuestion(){const q=SURVEY.questions[questionIndex];card.replaceChildren();const title=document.createElement("h3");title.className="survey-question";title.textContent=q.title;card.append(title);
  if(q.type==="two")q.groups.forEach((group,i)=>{const subtitle=document.createElement("p");subtitle.textContent=group.title;card.append(subtitle,options(group.options,"single",`${q.id}-${i}`))});
  else card.append(options(q.options,q.type,q.id));
  if(q.other)card.append(field("Other (optional)","survey-other"));
  if(q.contact){const extras=document.createElement("div");extras.className="contact-fields";extras.append(field("First name (optional)","survey-free"),field("Preferred contact method (optional)","survey-free"));extras.hidden=true;card.append(extras);card.addEventListener("change",()=>{extras.hidden=card.querySelector(`input[name="${q.id}"]:checked`)?.value!=="Yes"},{once:false})}
  $(".survey-progress span").style.width=`${questionIndex/SURVEY.questions.length*100}%`;
  $(".survey-count").textContent=`${questionIndex+1} of ${SURVEY.questions.length}`;
  $("#survey-next").firstChild.textContent=questionIndex===SURVEY.questions.length-1?"Finish ":"Continue ";
}
function capture(skip=false){const q=SURVEY.questions[questionIndex];let value=null;if(!skip){
  if(q.type==="two")value=q.groups.map((_,i)=>card.querySelector(`input[name="${q.id}-${i}"]:checked`)?.value||null);
  else if(q.type==="multi")value=[...card.querySelectorAll(`input[name="${q.id}"]:checked`)].map(input=>input.value);
  else value=card.querySelector(`input[name="${q.id}"]:checked`)?.value||null;
  if(q.other&&card.querySelector(".survey-other")?.value)value={selection:value,other:card.querySelector(".survey-other").value.slice(0,150)};
  if(q.contact&&value==="Yes")value={selection:"Yes",first_name:card.querySelectorAll(".survey-free")[0].value.slice(0,80),preferred_contact_method:card.querySelectorAll(".survey-free")[1].value.slice(0,150)}
}answers[q.id]=value;track("survey_question",{question_id:q.id,survey_action:skip?"skipped":"answered"});questionIndex++;if(questionIndex<SURVEY.questions.length)renderQuestion();else finishSurvey()}
async function finishSurvey(){card.replaceChildren();$(".survey-progress span").style.width="100%";$(".survey-actions").hidden=true;const done=document.createElement("p");done.className="survey-question";done.textContent="Thank you for sharing.";card.append(done);try{const response=await api({type:"survey",signup_token:signupToken,visitor_id:visitorId,answers});if(!response.ok)throw Error()}catch{done.textContent="Your email is on the list. We couldn’t save the survey answers."}}
function showSurvey(token){signupToken=token;questionIndex=0;Object.keys(answers).forEach(key=>delete answers[key]);$(".survey-actions").hidden=false;renderQuestion();dialog.showModal()}
$("#survey-skip").addEventListener("click",()=>capture(true));$("#survey-next").addEventListener("click",()=>capture());$(".survey-close").addEventListener("click",()=>dialog.close());