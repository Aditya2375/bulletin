/* My tracker — a private, per-browser list of events you are chasing.
   Stored in localStorage on this device only. Nothing is sent anywhere. */
(function () {
  const KEY = "bul.tracker.v1";
  const STATUSES = [
    ["interested", "interested"], ["registered", "registered"], ["team", "team formed"],
    ["pending", "shortlist pending"], ["shortlisted", "shortlisted"], ["submitted", "submitted"],
    ["waitlist", "waitlisted"], ["out", "not selected"], ["done", "done"], ["skipped", "skipped"]
  ];
  const CLOSED = new Set(["out", "done", "skipped"]);
  const $ = s => document.querySelector(s);
  const label = v => (STATUSES.find(s => s[0] === v) || [0, v])[1];
  const clean = (v, n) => String(v == null ? "" : v).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
  const isDate = v => /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(new Date(v + "T00:00:00"));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const today = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
  const days = iso => Math.round((new Date(iso + "T00:00:00") - today()) / 864e5);

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (!Array.isArray(raw)) return [];
      return raw.filter(r => r && typeof r === "object" && clean(r.name, 120)).map(r => ({
        id: clean(r.id, 40) || String(Date.now() + Math.random()),
        name: clean(r.name, 120),
        status: STATUSES.some(s => s[0] === r.status) ? r.status : "interested",
        date: isDate(r.date) ? r.date : "",
        deadline: isDate(r.deadline) ? r.deadline : "",
        team: clean(r.team, 80),
        link: /^https?:\/\//i.test(r.link || "") ? clean(r.link, 600) : "",
        note: clean(r.note, 200)
      }));
    } catch (e) { return []; }
  }
  let items = load();
  let editing = null;
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(items)); $("#tr-warn").hidden = true; }
    catch (e) { $("#tr-warn").hidden = false; }
  }

  function when(iso, word) {
    if (!iso) return "";
    const d = days(iso);
    const nice = new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    let rel = d === 0 ? "today" : d === 1 ? "tomorrow" : d > 1 ? "in " + d + " days" : Math.abs(d) + (d === -1 ? " day ago" : " days ago");
    const cls = d < 0 ? "past" : d <= 2 ? "hot" : d <= 7 ? "warm" : "";
    return `<span class="tr-when ${cls}"><b>${word}</b> ${nice} · ${rel}</span>`;
  }
  function nextKey(it) {
    if (CLOSED.has(it.status)) return "9" + it.name;
    const ds = [it.deadline, it.date].filter(d => d && days(d) >= 0).sort();
    return (ds[0] ? "0" + ds[0] : "5") + it.name;
  }

  function render() {
    const box = $("#tr-list");
    const open = items.filter(i => !CLOSED.has(i.status)).length;
    $("#tr-count").textContent = items.length ? open + " active · " + items.length + " total" : "";
    $("#tr-tools").hidden = !items.length;
    if (!items.length) {
      box.innerHTML = `<div class="tr-empty">Nothing tracked yet. Add an event above, or press “track this” on any card in the board.</div>`;
      return;
    }
    const sorted = items.slice().sort((a, b) => nextKey(a).localeCompare(nextKey(b)));
    box.innerHTML = sorted.map(it => `<article class="tr-item ${CLOSED.has(it.status) ? "closed" : ""}" data-id="${esc(it.id)}">
      <div class="tr-main">
        <h3>${it.link ? `<a href="${esc(it.link)}" target="_blank" rel="noopener noreferrer">${esc(it.name)}</a>` : esc(it.name)}</h3>
        <div class="tr-dates">${when(it.deadline, "deadline")}${when(it.date, "event")}${!it.deadline && !it.date ? '<span class="tr-when">no dates set</span>' : ""}</div>
        ${it.team ? `<div class="tr-team mono">team code <code>${esc(it.team)}</code> <button class="tr-mini" data-act="copy" type="button">copy</button></div>` : ""}
        ${it.note ? `<p class="tr-note">${esc(it.note)}</p>` : ""}
      </div>
      <div class="tr-side">
        <select class="tr-status s-${esc(it.status)}" data-act="status" aria-label="status of ${esc(it.name)}">${STATUSES.map(([v, l]) => `<option value="${v}" ${v === it.status ? "selected" : ""}>${l}</option>`).join("")}</select>
        <div class="tr-actions"><button class="tr-mini" data-act="edit" type="button">edit</button><button class="tr-mini danger" data-act="del" type="button">remove</button></div>
      </div>
    </article>`).join("");
  }

  const form = $("#tr-form");
  function fill(it) {
    $("#tr-name").value = it ? it.name : "";
    $("#tr-status").value = it ? it.status : "interested";
    $("#tr-date").value = it ? it.date : "";
    $("#tr-deadline").value = it ? it.deadline : "";
    $("#tr-team").value = it ? it.team : "";
    $("#tr-link").value = it ? it.link : "";
    $("#tr-note").value = it ? it.note : "";
    $("#tr-submit").textContent = it ? "save changes" : "add to tracker";
    $("#tr-cancel").hidden = !it;
  }
  $("#tr-status").innerHTML = STATUSES.map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
  fill(null);

  form.addEventListener("submit", e => {
    e.preventDefault();
    const rec = {
      name: clean($("#tr-name").value, 120),
      status: $("#tr-status").value,
      date: isDate($("#tr-date").value) ? $("#tr-date").value : "",
      deadline: isDate($("#tr-deadline").value) ? $("#tr-deadline").value : "",
      team: clean($("#tr-team").value, 80),
      link: /^https?:\/\//i.test($("#tr-link").value.trim()) ? clean($("#tr-link").value, 600) : "",
      note: clean($("#tr-note").value, 200)
    };
    if (!rec.name) return;
    if ($("#tr-link").value.trim() && !rec.link) { $("#tr-link").setCustomValidity("Start the link with https://"); $("#tr-link").reportValidity(); return; }
    if (editing) { const i = items.findIndex(x => x.id === editing); if (i > -1) items[i] = { id: editing, ...rec }; }
    else items.push({ id: "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ...rec });
    editing = null; persist(); fill(null); render();
  });
  $("#tr-link").addEventListener("input", e => e.target.setCustomValidity(""));
  $("#tr-cancel").addEventListener("click", () => { editing = null; fill(null); });

  $("#tr-list").addEventListener("click", e => {
    const b = e.target.closest("button[data-act]"); if (!b) return;
    const el = b.closest(".tr-item"); const it = items.find(x => x.id === el.dataset.id); if (!it) return;
    if (b.dataset.act === "edit") { editing = it.id; fill(it); form.scrollIntoView({ behavior: "smooth", block: "center" }); $("#tr-name").focus(); }
    if (b.dataset.act === "del") {
      if (b.dataset.sure) { items = items.filter(x => x.id !== it.id); if (editing === it.id) { editing = null; fill(null); } persist(); render(); }
      else { b.dataset.sure = "1"; b.textContent = "sure?"; setTimeout(() => { if (b.isConnected) { delete b.dataset.sure; b.textContent = "remove"; } }, 3000); }
    }
    if (b.dataset.act === "copy") {
      const done = () => { b.textContent = "copied"; setTimeout(() => { if (b.isConnected) b.textContent = "copy"; }, 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(it.team).then(done, () => {});
    }
  });
  $("#tr-list").addEventListener("change", e => {
    if (e.target.dataset.act !== "status") return;
    const it = items.find(x => x.id === e.target.closest(".tr-item").dataset.id); if (!it) return;
    it.status = e.target.value; persist(); render();
  });

  $("#tr-export").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "my-tracker.json";
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
  $("#tr-clear").addEventListener("click", e => {
    const b = e.currentTarget;
    if (b.dataset.sure) { items = []; editing = null; fill(null); persist(); render(); delete b.dataset.sure; b.textContent = "clear all"; }
    else { b.dataset.sure = "1"; b.textContent = "really clear all?"; setTimeout(() => { delete b.dataset.sure; b.textContent = "clear all"; }, 3000); }
  });

  /* "track this" from a board card */
  window.bulletinTrack = function (name, start, url) {
    editing = null;
    fill({ name: clean(name, 120), status: "interested", date: isDate(start) ? start : "", deadline: "", team: "", link: /^https?:\/\//i.test(url || "") ? url : "", note: "" });
    $("#tracker").scrollIntoView({ behavior: "smooth", block: "start" });
    $("#tr-name").focus();
  };
  render();
})();
