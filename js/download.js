// Download page: points the button at the latest GitHub release once config.js names the owner.
(function () {
  "use strict";
  const btn = document.getElementById("dl-button");
  const small = document.getElementById("dl-small");
  const note = document.getElementById("dl-note");
  if (!btn) return;
  const url = window.aurelithLauncherUrl ? window.aurelithLauncherUrl() : "";
  const news = (window.AURELITH_NEWS && window.AURELITH_NEWS.news) || [];
  const latest = news.find((n) => n.type === "patch" && n.version);
  if (url) {
    btn.href = url;
    btn.removeAttribute("aria-disabled");
    small.textContent = "Windows 64-bit" + (latest ? " · latest game " + latest.version : "");
    const cfg = window.AURELITH_CONFIG;
    note.innerHTML = `All versions and checksums: <a href="https://github.com/${cfg.GITHUB_OWNER}/${cfg.GITHUB_REPO}/releases">GitHub releases</a>.`;
  } else {
    btn.addEventListener("click", (e) => e.preventDefault());
    note.textContent = "The first public build is being bound. Check back soon.";
  }
})();
