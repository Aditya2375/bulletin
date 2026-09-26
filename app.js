/* The Bulletin — board, matching, clash detection. */
const $ = s => document.querySelector(s);
const ALL = [...EVENTS, ...MINE];

const state = {
  interests: new Set(JSON.parse(localStorage.getItem("bul.interests") || '["ai","hackathon","web"]')),
  place: localStorage.getItem("bul.place") || "bengaluru",
  q: "",
  filter: "all"
};

const FILTERS = [["all","everything"],["soon","next 30 days"],["online","online"],["in-person","in person"],["free","free only"],["going","you’re going"]];
const fmt = iso => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const overlaps = (a, b) => a.start <= b.end && b.start <= a.end;

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
  const now = "2026-09-27";
  const soonEnd = "2026-10-27";
  let list = ALL.map(ev => ({ ev, s: score(ev) }));
  const q = state.q.trim().toLowerCase();
  if (q) list = list.filter(({ ev }) => (ev.name + " " + ev.org + " " + ev.blurb + " " + ev.tags.join(" ")).toLowerCase().includes(q));
  list = list.filter(({ ev }) => {
    switch (state.filter) {
      case "soon": return !ev.tba && ev.start <= soonEnd;
      case "online": return ev.mode === "online";
      case "in-person": return ev.mode === "in-person" && ev.city === "bengaluru";
      case "free": return ev.fee === "free";
      case "going": return ev.committed;
      default: return true;
    }
  });
  list.sort((a, b) => b.s.pts - a.s.pts || a.ev.start.localeCompare(b.ev.start));
  $("#count").textContent = list.length + " listing" + (list.length === 1 ? "" : "s");
  $("#empty").hidden = list.length > 0;
  $("#board").innerHTML = list.map(({ ev, s }) => {
    const c = clash(ev);
    const dates = ev.tba
      ? `<span class="tba">dates TBA — ${ev.start.slice(0,4) === "2026" ? "expected in " + fmt(ev.start).split(" ")[1] : ""}</span>`
      : `${fmt(ev.start)}${ev.end !== ev.start ? " → " + fmt(ev.end) : ""}`;
    return `<article class="card ${ev.committed ? "mine" : ""}">
      <div class="src"><span>${ev.source.name}</span>${ev.committed ? '<span class="you">★ going</span>' : ""}</div>
      <h3>${ev.source.url ? `<a href="${ev.source.url}" target="_blank" rel="noopener">${ev.name}</a>` : ev.name}</h3>
      <div class="date">${dates}</div>
      <div class="meta"><span>${ev.mode}${ev.venue ? " · " + ev.venue : ev.city !== "online" ? " · " + ev.city : ""}</span><span>fee: ${ev.fee}</span>${ev.prize !== "—" ? `<span>${ev.prize}</span>` : ""}<span>reg: ${ev.deadline}</span></div>
      <p class="blurb">${ev.blurb}</p>
      <div class="tags">${ev.tags.map(t => `<span class="tag">#${t}</span>`).join("")}</div>
      <div class="why">why this: ${s.why.length ? s.why.join(" · ") : "low match — shown anyway"}</div>
      ${c ? `<div class="clash">⚠ ${c}</div>` : ""}
      ${ev.source.url ? `<a class="goto" href="${ev.source.url}" target="_blank" rel="noopener">Go to the listing ↗</a>` : ""}
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
  localStorage.setItem("bul.interests", JSON.stringify([...state.interests]));
  localStorage.setItem("bul.place", state.place);
}

document.addEventListener("click", e => {
  const t = e.target;
  if (t.dataset.i) { state.interests.has(t.dataset.i) ? state.interests.delete(t.dataset.i) : state.interests.add(t.dataset.i); save(); renderChips(); renderBoard(); }
  if (t.dataset.p) { state.place = t.dataset.p; save(); renderChips(); renderBoard(); }
  if (t.dataset.f) { state.filter = t.dataset.f; renderChips(); renderBoard(); }
});
let deb;
$("#q").addEventListener("input", e => { clearTimeout(deb); deb = setTimeout(() => { state.q = e.target.value; renderBoard(); renderOutlinks(); }, 160); });

$("#dateline").textContent = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
renderChips(); renderBoard(); renderOutlinks(); renderSources();
