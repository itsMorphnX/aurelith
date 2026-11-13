// Grimbound site: shared page behaviour (menu, gallery, lightbox, news, download links). No libraries.
(function () {
  "use strict";
  const cfg = window.AURELITH_CONFIG || {};

  // ---- phone menu
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  if (header && toggle) {
    toggle.addEventListener("click", () => {
      const open = header.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  if (header) {
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ---- download links: straight to the latest GitHub release once the owner is set
  window.aurelithLauncherUrl = function () {
    if (!cfg.GITHUB_OWNER) return "";
    return `https://github.com/${cfg.GITHUB_OWNER}/${cfg.GITHUB_REPO}/releases/latest/download/${cfg.LAUNCHER_ASSET}`;
  };

  // ---- Discord buttons (hidden until config.js has the invite)
  document.querySelectorAll(".js-discord").forEach((a) => { if (cfg.DISCORD_INVITE) { a.href = cfg.DISCORD_INVITE; a.hidden = false; } });
  document.querySelectorAll(".js-discord-soon").forEach((p) => { p.hidden = !!cfg.DISCORD_INVITE; });

  // ---- trailer: the poster until config.js names a video
  const tbox = document.getElementById("trailer-box");
  if (tbox) {
    const poster = tbox.querySelector(".trailer-poster");
    if (cfg.TRAILER_POSTER) poster.src = cfg.TRAILER_POSTER;
    const play = tbox.querySelector(".trailer-play");
    const badge = tbox.querySelector(".trailer-badge");
    const v = cfg.TRAILER_VIDEO || "";
    if (v) badge.textContent = "Watch the gameplay trailer";
    else { play.setAttribute("aria-disabled", "true"); play.title = "The trailer is coming soon"; }
    play.addEventListener("click", () => {
      if (!v) return;
      const frame = tbox.querySelector(".trailer-frame");
      const yt = v.match(/(?:youtu\.be\/|v=)([\w-]{6,})/);
      frame.innerHTML = yt
        ? `<iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1" title="Grimbound gameplay trailer" allow="autoplay; fullscreen" allowfullscreen></iframe>`
        : `<video src="${v}" poster="${poster.src}" controls autoplay playsinline></video>`;
    });
  }

  // ---- gallery
  document.querySelectorAll(".gallery").forEach((g) => {
    const track = g.querySelector(".gallery-track");
    const step = () => (track.firstElementChild ? track.firstElementChild.getBoundingClientRect().width + 18 : 400);
    g.querySelector(".prev")?.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    g.querySelector(".next")?.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
  });
  const lb = document.querySelector(".lightbox");
  if (lb) {
    const close = () => lb.classList.remove("open");
    lb.querySelector("button").addEventListener("click", close);
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    document.querySelectorAll(".gallery-track figure").forEach((f) => {
      f.addEventListener("click", () => {
        const img = f.querySelector("img");
        lb.querySelector("img").src = img.dataset.full || img.src;
        lb.querySelector("p").textContent = f.querySelector("figcaption")?.textContent || "";
        lb.classList.add("open");
      });
    });
  }

  // ---- news and patch notes (data/news.js for file://, data/news.json when served)
  const list = document.getElementById("news-list");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function fmtDate(d) {
    const t = new Date(d + "T12:00:00");
    return isNaN(t) ? d : t.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }
  function renderNews(data) {
    if (!list) return;
    const items = (data && data.news) || [];
    if (!items.length) { list.innerHTML = '<p class="empty">No news yet.</p>'; return; }
    let shown = items.slice(0, 6);
    const patch = items.find((n) => n.type === "patch");
    if (patch && !shown.includes(patch)) shown = shown.slice(0, 5).concat([patch]);
    list.innerHTML = shown.map((n) => {
      const body = (n.body || []).map((b) => `<li>${esc(b)}</li>`).join("");
      const tag = n.type === "patch" ? `Patch notes${n.version ? " · v" + esc(n.version) : ""}` : n.type === "devlog" ? `Devlog${n.milestone ? " · " + esc(n.milestone) : ""}` : "News";
      return `<article class="news-card is-${n.type === "patch" ? "patch" : n.type === "devlog" ? "devlog" : "news"}">
        <span class="tag">${tag}</span><time datetime="${esc(n.date)}">${fmtDate(n.date)}</time>
        <h3>${esc(n.title)}</h3><p>${esc(n.summary || "")}</p>
        ${body ? `<details${n.type === "news" ? " open" : ""}><summary>${n.type === "patch" ? "What changed" : "Read more"}</summary><ul>${body}</ul></details>` : ""}
      </article>`;
    }).join("");
    const latest = items.find((n) => n.type === "patch" && n.version);
    document.querySelectorAll(".js-version").forEach((el) => { if (latest) el.textContent = "Preview " + latest.version; });
  }
  if (list) {
    renderNews(window.AURELITH_NEWS);
    if (location.protocol.startsWith("http")) {
      fetch("data/news.json", { cache: "no-cache" }).then((r) => (r.ok ? r.json() : null)).then((d) => d && renderNews(d)).catch(() => {});
    }
  }
})();
