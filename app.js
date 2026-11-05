/* The Bulletin — board, matching, clash detection. */
const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeURL = v => {try{const u=new URL(v);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?u.href:''}catch{return ''}};
const dateOK = v => typeof v==='string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10)===v;
const localDate = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const readPref = (key,fallback) => {try{return localStorage.getItem(key)??fallback}catch{return fallback}};
const prefInterests = () => {try{const a=JSON.parse(readPref('bul.interests','["ai","hackathon","web"]'));return Array.isArray(a)?a.filter(t=>INTERESTS.includes(t)):['ai','hackathon','web']}catch{return ['ai','hackathon','web']}};
let ALL = [...EVENTS];

const state = {
  interests: new Set(prefInterests()),
  place: ["bengaluru","online","online-or-bengaluru"].includes(readPref("bul.place","")) ? readPref("bul.place","") : "bengaluru",
  q: "",
  filter: "all"
};

const FILTERS = [["all","everything"],["soon","next 30 days"],["online","online"],["in-person","in person"],["free","free only"]];
const fmt = iso => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const overlaps = (a, b) => !!(a.start && a.end && b.start && b.end) && a.start <= b.end && b.start <= a.end;

/* transparent, explainable matching — no black box */
function score(ev) {
  if (ev.committed) return { pts: 99, why: ["going"] };
  const hits = ev.tags.filter(t => state.interests.has(t));
  let pts = hits.length * 3;
  const why = hits.map(t => "#" + t);
  if (state.place === "online-or-bengaluru") { pts += 1; }
  else if (ev.city === state.place) { pts += 2; why.push(state.place); }
  else if (ev.city === "online") { pts += 1; why.push("online"); }
  if (ev.fee === "free") pts += 1;
  return { pts, why };
}

function clash(ev) {
  if (ev.committed) return null;
  if (!ev.start || !ev.end) return null; /* no dates, so no honest clash claim */
  const days = (new Date(ev.end) - new Date(ev.start)) / 864e5;
  if (ev.tba && days > 14) return null; /* window too broad to honestly claim a clash */
  const hit = MINE.find(m => overlaps(ev, m) && (ev.city === m.city || ev.city === "online"));
  if (!hit) return null;
  return (ev.tba ? "dates TBA, but the window covers " : "clashes with ") +
    hit.name.toLowerCase() + (ev.city === "online" ? " — online, so survivable" : "");
}

function renderChips() {
  $("#interest-chips").innerHTML = INTERESTS.map(t =>
    `<button class="chip ${state.interests.has(t) ? "on" : ""}" data-i="${t}">#${t}</button>`).join("");
  $("#place-chips").innerHTML = [["bengaluru","Bengaluru"],["online","Online"],["online-or-bengaluru","both"]]
    .map(([v, l]) => `<button class="chip ${state.place === v ? "on" : ""}" data-p="${v}">${l}</button>`).join("");
  $("#filter-chips").innerHTML = FILTERS.map(([v, l]) =>
    `<button class="chip ${state.filter === v ? "on" : ""}" data-f="${v}">${l}</button>`).join("");
  const n = state.interests.size;
  $("#profile-line").innerHTML = `matching on <b>${n} interest${n === 1 ? "" : "s"}</b> · showing <b>${state.place}</b> first`;
}

function renderBoard() {
  const now = localDate(new Date());
  const end=new Date();end.setDate(end.getDate()+30);const soonEnd=localDate(end);
  let list = ALL.map(ev => ({ ev, s: score(ev) }));
  const q = state.q.trim().toLowerCase();
  if (q) list = list.filter(({ ev }) => (ev.name + " " + ev.org + " " + ev.blurb + " " + ev.tags.join(" ")).toLowerCase().includes(q));
  list = list.filter(({ ev }) => {
    switch (state.filter) {
      case "soon": return !ev.tba && ev.start && (ev.end||ev.start)>=now && ev.start<=soonEnd;
      case "online": return ev.mode === "online";
      case "in-person": return ev.mode === "in-person" && ev.city === "bengaluru";
      case "free": return ev.fee === "free";
      case "going": return ev.committed;
      default: return true;
    }
  });
  list.sort((a, b) => b.s.pts - a.s.pts || (a.ev.start ? 0 : 1) - (b.ev.start ? 0 : 1) || (a.ev.start || "").localeCompare(b.ev.start || ""));
  $("#count").textContent = list.length + " listing" + (list.length === 1 ? "" : "s");
  $("#empty").hidden = list.length > 0;
  $("#board").innerHTML = list.map(({ ev: raw, s }) => {
    const c = esc(clash(raw)||'');
    const ev=Object.fromEntries(Object.entries(raw).map(([k,v])=>[k,typeof v==='string'?esc(v):v]));
    ev.source={name:esc(raw.source.name),url:esc(safeURL(raw.source.url))};ev.tags=raw.tags.map(esc);
    s={...s,why:s.why.map(esc)};
    const dates = ev.tba || !ev.start
      ? `<span class="tba">dates unconfirmed - check source</span>`
      : `${fmt(ev.start)}${ev.end && ev.end !== ev.start ? " → " + fmt(ev.end) : ""}`;
    return `<article class="card ${ev.committed ? "mine" : ""}">
      <div class="src"><span>${ev.source.name}</span>${ev.committed ? '<span class="you">★ going</span>' : ""}</div>
      <h3>${ev.source.url ? `<a href="${ev.source.url}" target="_blank" rel="noopener">${ev.name}</a>` : ev.name}</h3>
      <div class="date">${dates}${raw.end && raw.end < now ? " · PAST" : ""}</div><div class="mono">UNVERIFIED CACHED LISTING</div>
      <div class="meta"><span>${ev.mode}${ev.venue ? " · " + ev.venue : ev.city !== "online" ? " · " + ev.city : ""}</span><span>fee: ${ev.fee}</span>${ev.prize !== "—" ? `<span>${ev.prize}</span>` : ""}${ev.deadline && ev.deadline !== "null" ? `<span>reg: ${ev.deadline}</span>` : ""}</div>
      <p class="blurb">${ev.blurb}</p>
      <div class="tags">${ev.tags.map(t => `<span class="tag">#${t}</span>`).join("")}</div>
      <div class="why">why this: ${s.why.length ? s.why.join(" · ") : "low match — shown anyway"}</div>
      ${c ? `<div class="clash">⚠ ${c}</div>` : ""}
      <div class="cardbtns">${ev.source.url ? `<a class="goto" href="${ev.source.url}" target="_blank" rel="noopener">Go to the listing ↗</a>` : ""}<button class="goto track" type="button" data-track="${ev.id}">+ track this</button></div>
    </article>`;
  }).join("");
}

function renderOutlinks() {
  const q = encodeURIComponent(state.q.trim() || "hackathon bengaluru");
  $("#outlinks").innerHTML = "same search elsewhere: " + [
    ["Luma", `https://lu.ma/discover?q=${q}`],
    ["Unstop", `https://unstop.com/hackathons?search=${q}`],
    ["Devpost", `https://devpost.com/hackathons?search=${q}`],
    ["Eventbrite", `https://www.eventbrite.com/d/india--bengaluru/${state.q.trim() ? q : "hackathon"}/`]
  ].map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener">${n} ↗</a>`).join(" ");
}

function renderSources() {
  $("#sources").innerHTML = SOURCES.map(s => `<div class="source">
    <h4><a href="${s.url}" target="_blank" rel="noopener">${s.name} ↗</a><span class="st ${s.status}">${s.status === "seeded" ? "seeded" : "needs key"}</span></h4>
    <p>${s.needs}</p></div>`).join("");
}

function save() {
  try{localStorage.setItem("bul.interests", JSON.stringify([...state.interests]));localStorage.setItem("bul.place",state.place)}catch{$("#pref-status").textContent="Preferences exist in this tab only; browser saving failed."}
}

document.addEventListener("click", e => {
  const t = e.target;
  if (t.dataset.i) { state.interests.has(t.dataset.i) ? state.interests.delete(t.dataset.i) : state.interests.add(t.dataset.i); save(); renderChips(); renderBoard(); }
  if (t.dataset.p) { state.place = t.dataset.p; save(); renderChips(); renderBoard(); }
  if (t.dataset.track) { const ev = ALL.find(x => String(x.id) === t.dataset.track); if (ev && window.bulletinTrack) window.bulletinTrack(ev.name, ev.tba ? "" : ev.start, ev.source.url); }
  if (t.dataset.f) { state.filter = t.dataset.f; renderChips(); renderBoard(); }
});
let deb;
$("#q").addEventListener("input", e => { clearTimeout(deb); deb = setTimeout(() => { state.q = e.target.value; renderBoard(); renderOutlinks(); }, 160); });

/* ————— live wire database (Supabase) with baked seed as offline fallback ————— */
const SB_URL = "https://iljapbrjcxhtymtkiuea.supabase.co";
const SB_KEY = "sb_publishable_bKtD9c5Q0GzMFNOZQ58z8A_WCIxbRt8";
let liveState = "loading", feedBusy = false, feedError = "", lastFeedRead = "";

function rowToEvent(r) {
  const text=(v,n)=>typeof v==='string'?v.slice(0,n):'';
  if(!r||typeof r!=='object'||!text(r.name,300)||!safeURL(r.source_url)||!['online','in-person','hybrid'].includes(r.mode))return null;
  const start=dateOK(r.start_date)?r.start_date:null,end=dateOK(r.end_date)?r.end_date:start;
  return {id:text(String(r.id??''),100).replace(/[^a-zA-Z0-9_-]/g,''),name:text(r.name,300),org:text(r.org,300),start,end:end&&start&&end<start?start:end,tba:!!r.tba||!start,mode:r.mode,city:text(r.city,100),venue:text(r.venue,200),tags:Array.isArray(r.tags)?r.tags.filter(t=>typeof t==='string').slice(0,12).map(t=>t.slice(0,40)):[],fee:text(r.fee,100),prize:text(r.prize,300),deadline:text(r.deadline,100),source:{name:text(r.source_name,100),url:safeURL(r.source_url)},blurb:text(r.blurb,1500)};
}
async function request(url,options={}){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);try{const r=await fetch(url,{...options,signal:controller.signal});if(!r.ok)throw Error('HTTP '+r.status);const text=await r.text();if(text.length>1500000)throw Error('Response too large');return text?JSON.parse(text):null}finally{clearTimeout(timer)}}
function renderDatapill() {
  const live = liveState === "live";
  $("#datapill").textContent = feedBusy ? (live ? "· refreshing database listings" : "· loading database listings") : live ? "· database listings, not source-verified" : "· offline seed, not current listings";
  const source = live ? `${ALL.length} database listings loaded at ${lastFeedRead}. This is the time of this database read, not when organizers last verified the events.` : `Showing ${EVENTS.length} offline seed listings, last marked checked on 27 Sept 2026. These are not current listings.`;
  $("#feed-status").textContent = feedBusy ? (live ? "Refreshing listings. The last successful database read remains visible." : "Loading the event database. The offline seed remains visible until it responds.") : source + (feedError ? ` Latest refresh failed: ${feedError} Use Retry database to try again.` : "");
  $("#feed-retry").disabled = feedBusy;
  $("#feed-retry").textContent = feedBusy ? "Loading listings..." : feedError || !live ? "Retry database" : "Refresh listings";
}
function feedFailure(e) {
  if (e && e.name === "AbortError") return "the request timed out after 15 seconds.";
  if (e && /^HTTP \d{3}$/.test(e.message)) return `the database returned ${e.message}.`;
  if (e && e.message === "Response too large") return "the database response exceeded the safe size limit.";
  if (e && e.message === "Invalid event list") return "the database returned an invalid event list.";
  if (e instanceof SyntaxError) return "the database response could not be read as JSON.";
  return "the network request did not complete. Your connection or the database may be unavailable.";
}
async function loadLive() {
  if (feedBusy) return;
  feedBusy = true;
  renderDatapill();
  try {
    const rows = await request(SB_URL+"/rest/v1/events?select=*&limit=100",{headers:{apikey:SB_KEY}});
    if (!Array.isArray(rows)) throw Error("Invalid event list");
    const clean = rows.slice(0,100).map(rowToEvent).filter(Boolean);
    if (rows.length && !clean.length) throw Error("Invalid event list");
    ALL = clean;
    liveState = "live";
    lastFeedRead = new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
    feedError = "";
  } catch (e) {
    feedError = feedFailure(e);
    if (liveState !== "live") liveState = "seed";
  } finally {
    feedBusy = false;
    window.bulletinLoaded = true;
    renderDatapill();
    renderBoard();
  }
}
$("#feed-retry").addEventListener("click",loadLive);

let submitting=false;
$("#suggest-form").addEventListener("submit",async e=>{
 e.preventDefault();if(submitting)return;const st=$("#suggest-status"),button=e.target.querySelector('[type=submit]');
 const body={name:$("#sg-name").value.trim(),url:safeURL($("#sg-url").value.trim()),city:$("#sg-city").value.trim()||null,start_date:$("#sg-date").value||null,note:$("#sg-note").value.trim()||null};
 if(body.name.length<2||body.name.length>300||!body.url||(body.start_date&&!dateOK(body.start_date))){st.textContent='Check the name, date and HTTP(S) listing URL.';return}
 submitting=true;button.disabled=true;st.textContent='Sending once...';
 try{await request(SB_URL+'/rest/v1/submissions',{method:'POST',headers:{apikey:SB_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(body)});st.textContent='Server accepted the suggestion for review.';e.target.reset()}
 catch{st.textContent='Delivery unconfirmed. It may have reached the queue; do not resend automatically.'}
 finally{submitting=false;button.disabled=false}
});
$("#dateline").textContent = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
renderChips(); renderBoard(); renderOutlinks(); renderSources(); renderDatapill();
loadLive();

setInterval(()=>{renderBoard();$("#dateline").textContent=new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})},60000);
