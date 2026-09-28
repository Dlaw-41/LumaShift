import Image from "next/image";

const rooms = [
  { id: "living", label: "Living room", caption: "Light on the wall. Not your eyes.", detail: "A place to read, without overhead glare." },
  { id: "kitchen", label: "Kitchen", caption: "Make room for the evening.", detail: "Direct the light away from the counter." },
  { id: "office", label: "Home office", caption: "Keep your focus in view.", detail: "Shift light away from the screen." },
  { id: "bedroom", label: "Bedroom", caption: "Let the room settle.", detail: "Aim the light toward the wall." },
  { id: "nursery", label: "Kid’s room", caption: "A gentler place to pause.", detail: "Keep light away from the bed." },
];

function EmailForm({ location }: { location: "top" | "bottom" }) {
  return <form className="email-form" action="/api/collect" method="post" data-location={location}>
    <input type="hidden" name="type" value="signup" />
    {["headline_variant", "utm_source", "utm_medium", "utm_campaign", "referrer", "device_type", "visitor_id", "signup_token"].map(name => <input key={name} type="hidden" name={name} defaultValue={name === "headline_variant" ? "A" : ""} />)}
    <input type="hidden" name="cta_location" value={location} />
    <label className="sr-only" htmlFor={`email-${location}`}>Email address</label>
    <div className="email-row"><input id={`email-${location}`} name="email" type="email" placeholder="Email address" autoComplete="email" required /><button type="submit">Request early access <span aria-hidden="true">↗</span></button></div>
    <p className="privacy">We’ll use your email for LumaShift updates and to ask about your lighting. <span>[TEAM TO CONFIRM]</span></p>
    <p className="form-status" role="status" aria-live="polite" />
  </form>;
}

function HouseArt() {
  return <svg className="house-art" viewBox="0 0 1000 700" role="img" aria-label="Concept illustration of a house at dusk with one warm window">
    <defs><linearGradient id="night" x2="0" y2="1"><stop stopColor="#151b20"/><stop offset="1" stopColor="#38403d"/></linearGradient><linearGradient id="warmWindow"><stop stopColor="#cf985e"/><stop offset="1" stopColor="#f0c889"/></linearGradient></defs>
    <rect width="1000" height="700" fill="url(#night)" /><path d="M0 570Q230 540 430 575T1000 560V700H0Z" fill="#1c2422"/>
    <g className="house-model"><path d="M145 344L502 172L855 344L820 362L502 218L180 362Z" fill="#575a56" stroke="#929187" strokeWidth="3"/><path d="M180 362L502 218L820 362V580H180Z" fill="#4b514e" stroke="#8b8d82" strokeWidth="3"/><path d="M502 218V580" stroke="#8b8d82" strokeWidth="3"/><rect x="245" y="392" width="174" height="145" fill="#20282a" stroke="#a4a49a" strokeWidth="7"/><path d="M332 392V537" stroke="#a4a49a" strokeWidth="5"/><rect className="lit-window" x="580" y="392" width="176" height="145" fill="url(#warmWindow)" stroke="#d5c4a5" strokeWidth="8"/><path d="M668 392V537" stroke="#d6b782" strokeWidth="5"/><path d="M580 492Q660 467 756 488V537H580Z" fill="#896948" opacity=".7"/><rect x="453" y="437" width="93" height="143" fill="#222a29" stroke="#9b9c91" strokeWidth="5"/></g>
    <text x="34" y="668" className="art-label">CONCEPT ILLUSTRATION</text>
  </svg>;
}

function RoomArt() {
  return <svg className="room-art" viewBox="0 0 960 620" role="img" aria-label="Concept illustration of a segmented ceiling fixture redirecting light toward a wall">
    <defs><linearGradient id="wall"><stop stopColor="#777b76"/><stop offset="1" stopColor="#343b39"/></linearGradient><radialGradient id="light"><stop stopColor="#f5cd8b" stopOpacity=".95"/><stop offset="1" stopColor="#e3ad66" stopOpacity="0"/></radialGradient></defs>
    <rect width="960" height="620" fill="url(#wall)"/><path d="M0 0L213 100V550L0 620Z" fill="#424b47"/><path d="M0 0H960L776 100H213Z" fill="#2b3434"/><path d="M213 100V550H776V100M213 550L0 620H960L776 550" fill="none" stroke="#c2beb0" strokeOpacity=".35" strokeWidth="3"/>
    <ellipse className="wall-glow" cx="250" cy="289" rx="230" ry="260" fill="url(#light)"/><ellipse className="person-glow" cx="676" cy="396" rx="205" ry="210" fill="url(#light)"/><path className="light-beam" d="M480 145L321 490Q160 340 208 171Z" fill="#f4c98a" opacity=".19"/>
    <g className="fixture"><ellipse cx="480" cy="95" rx="62" ry="13" fill="#d2ccbc"/><path d="M418 95L428 137Q480 160 532 137L542 95" fill="#d8d2c6" stroke="#8d877c" strokeWidth="2"/><path d="M430 103L433 138M441 106L443 144M452 108L453 148M463 109L463 150M474 110V151M485 110V151M496 109L496 150M507 108L506 147M518 106L516 143M530 103L526 138" stroke="#8d897f" strokeWidth="2"/><ellipse cx="480" cy="141" rx="52" ry="18" fill="#aa854a" stroke="#ddc18c" strokeWidth="3"/><ellipse cx="480" cy="142" rx="39" ry="12" fill="#dca647"/><path d="M480 131v22M449 136l62 13M449 149l62-13" stroke="#7e6645" strokeWidth="2"/></g>
    <g className="living-furniture"><path d="M350 477Q351 425 413 424H688Q733 425 733 482V546H350Z" fill="#262e2d" stroke="#ada99e" strokeWidth="3"/><path d="M370 475H713" stroke="#929189" strokeWidth="2"/></g>
    <g className="kitchen-furniture"><path d="M328 458H743V553H328Z" fill="#2a302f" stroke="#aca99f" strokeWidth="3"/><path d="M310 449H758" stroke="#d8cdb8" strokeWidth="12"/></g>
    <g className="office-furniture"><path d="M340 454H730" stroke="#c4baaa" strokeWidth="11"/><path d="M377 463V551M695 463V551" stroke="#a4a298" strokeWidth="5"/><rect x="539" y="333" width="126" height="91" rx="4" fill="#20282a" stroke="#bbb8ad" strokeWidth="5"/></g>
    <g className="bedroom-furniture"><path d="M314 457Q324 432 369 432H729V553H314Z" fill="#303937" stroke="#bfb8a8" strokeWidth="3"/><path d="M382 438H703V500H382Z" fill="#858b82"/></g>
    <g className="nursery-furniture"><path d="M386 439H690V525H386Z" fill="none" stroke="#c9c1ae" strokeWidth="8"/><path d="M417 440V524M455 440V524M493 440V524M531 440V524M569 440V524M607 440V524M645 440V524" stroke="#c9c1ae" strokeWidth="5"/></g>
    <g className="person"><circle cx="748" cy="395" r="26" fill="#323b39"/><path d="M719 429Q748 412 777 429L796 545H704Z" fill="#363f3d" stroke="#a09c90" strokeWidth="3"/></g><text x="29" y="596" className="art-label">CONCEPT ILLUSTRATION</text>
  </svg>;
}

export default function Home() {
  return <main id="top">
    <header className="site-header"><a href="#top" className="wordmark">LumaShift<span>.</span></a><span className="header-descriptor">LIGHT, RECONSIDERED</span><a href="#early-access" className="header-cta" data-cta="sticky">Request early access <span aria-hidden="true">↗</span></a></header>
    <div className="tour" id="tour"><div className="visual-stage" aria-hidden="true"><div className="house-layer"><HouseArt /></div><div className="room-layer" data-room="living"><RoomArt /></div><div className="stage-vignette" /></div>
      <section className="beat beat-hero" data-scene="establish" aria-label="House at dusk"><div className="hero-content"><p className="eyebrow">A NEW DIRECTION FOR OVERHEAD LIGHT</p><h1 id="headline">Light, exactly where you want it.</h1><p id="subheadline" className="subhead">Aim overhead light away from your eyes and toward the places you want to see.</p><EmailForm location="top" /><p className="scroll-cue">SCROLL TO EXPLORE <span aria-hidden="true">↓</span></p></div></section>
      <section className="beat beat-zoom" data-scene="zoom" aria-label="A continuous push toward the warm window"><div className="scene-copy"><p className="scene-index">01 / THE APPROACH</p><h2>Come closer to the light.</h2></div><div className="reduced-frame"><HouseArt /></div></section>
      {rooms.map((r,i)=><section key={r.id} className="beat beat-room" data-scene={r.id} aria-label={`${r.label}: ${r.detail}`}><div className="scene-copy"><p className="scene-index">0{i+2} / {r.label.toUpperCase()}</p><h2>{r.caption}</h2><p className="scene-detail">{r.detail}</p></div><div className={`reduced-frame reduced-${r.id}`}><RoomArt /></div></section>)}
      <section className="beat beat-close" data-scene="close" aria-label="LumaShift prototype and early access"><div className="close-panel"><p className="eyebrow">A MORE CONSIDERED WAY TO LIGHT A ROOM</p><h2>Make light feel at home.</h2><p className="close-copy">A segmented overhead light you can redirect, customize, save, and reset.</p><div className="prototype-shot"><Image src="/assets/lumashift-prototype.jpg" alt="LumaShift prototype installed on a ceiling, showing its amber segmented underside and ribbed body" width={646} height={1000} sizes="(max-width: 760px) 90vw, 440px" /><span>ACTUAL PROTOTYPE</span></div><div id="early-access"><EmailForm location="bottom" /></div></div></section>
    </div><footer>© LumaShift <span>Light, reconsidered.</span></footer>
    <dialog id="survey-dialog" className="survey-dialog" aria-labelledby="survey-title"><div className="survey-shell"><button type="button" className="survey-close" aria-label="Close survey">×</button><p className="eyebrow">THANK YOU</p><h2 id="survey-title">You’re on the list.</h2><p className="survey-intro">If you have a moment, tell us a little about the light in your home. Every answer is optional.</p><div className="survey-progress" aria-label="Survey progress"><span /></div><div id="survey-card" /><div className="survey-actions"><button type="button" id="survey-skip">Skip</button><button type="button" id="survey-next">Continue <span aria-hidden="true">↗</span></button></div><p className="survey-count" /></div></dialog>
    <script src="/app.js?v=2" defer />
  </main>;
}