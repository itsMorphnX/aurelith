// Suggestions & Bugs form. Sends JSON to REPORT_ENDPOINT (config.js: the Cloudflare Worker in
// web/report-worker/, which posts it to the Discord channel). With no endpoint set, or when sending fails,
// the report is kept in this browser and can be saved as a file.
(function () {
  "use strict";
  const cfg = window.AURELITH_CONFIG || {};
  const form = document.getElementById("report-form");
  const status = document.getElementById("report-status");
  const savedEl = document.getElementById("saved-reports");
  if (!form) return;
  const KEY = "aurelith.reports";

  const params = new URLSearchParams(location.search);
  if (params.get("type")) { const r = form.querySelector(`input[name="type"][value="${params.get("type")}"]`); if (r) r.checked = true; }
  if (params.get("version")) form.version.value = params.get("version").slice(0, 40);

  const steps = form.querySelector(".for-bug");
  const syncType = () => { steps.style.display = form.type.value === "suggestion" ? "none" : ""; };
  form.addEventListener("change", syncType);
  syncType();

  function say(cls, html) { status.className = "status show " + cls; status.innerHTML = html; }
  function loadSaved() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } }
  function keep(rep) {
    const list = loadSaved(); list.push(rep);
    try { localStorage.setItem(KEY, JSON.stringify(list.slice(-50))); return true; } catch (e) { return false; }
  }
  function download(obj, name) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
  }
  function showSaved() {
    const list = loadSaved();
    if (!list.length) { savedEl.innerHTML = ""; return; }
    savedEl.innerHTML = `<p style="margin-top:16px"><b>${list.length}</b> report${list.length > 1 ? "s" : ""} waiting in this browser.
      <a href="#" id="dl-saved">Save them as a file</a></p>`;
    document.getElementById("dl-saved").addEventListener("click", (e) => { e.preventDefault(); download(list, "aurelith-reports.json"); });
  }
  showSaved();

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    if (form.website.value) return;                       // a bot filled the hidden field
    const title = form.title.value.trim(), details = form.details.value.trim();
    if (title.length < 3 || details.length < 5) { say("err", "Please write a title and a few words about it."); return; }
    const rep = {
      type: form.type.value, title, details, steps: form.type.value === "suggestion" ? "" : form.steps.value.trim(),
      version: form.version.value.trim(), name: form.name.value.trim(), source: "website",
      page: location.href.split("#")[0], agent: navigator.userAgent.slice(0, 200), created: new Date().toISOString(),
    };
    const btn = form.querySelector("button[type=submit]");
    if (!cfg.REPORT_ENDPOINT) {
      keep(rep);
      say("warn", "Reporting isn't connected yet, so your report is saved in this browser for now. You can <a href='#' id='dl-one'>save it as a file</a> and send it to the team.");
      document.getElementById("dl-one").addEventListener("click", (e) => { e.preventDefault(); download(rep, "aurelith-report.json"); });
      showSaved();
      return;
    }
    btn.disabled = true; btn.textContent = "Sending...";
    try {
      const r = await fetch(cfg.REPORT_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rep) });
      if (r.status === 429) throw new Error("Too many reports from here in a short time. Please wait a few minutes.");
      if (!r.ok) throw new Error("The report service answered " + r.status + ".");
      say("ok", "Thank you! Your report reached the team.");
      form.reset(); syncType();
    } catch (e) {
      keep(rep); showSaved();
      say("err", "Couldn't send it: " + (e.message || "no connection") + " It is saved in this browser so nothing is lost.");
    } finally {
      btn.disabled = false; btn.textContent = "Send the report";
    }
  });
})();
