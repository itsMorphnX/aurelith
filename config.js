// Aurelith website settings. Edit these when the site goes live (see web/README.md).
//
// REPORT_ENDPOINT: the URL of the Cloudflare Worker that forwards reports to Discord
//   (web/report-worker/README.md). Leave it "" and the Suggestions & Bugs form saves reports in the
//   visitor's browser instead and says reporting is not connected yet.
// GITHUB_OWNER / GITHUB_REPO: where the releases live. The Download button points at
//   https://github.com/<owner>/<repo>/releases/latest/download/<LAUNCHER_ASSET>
const REPORT_ENDPOINT = "";
const GITHUB_OWNER = "itsMorphnX";
const GITHUB_REPO = "aurelith";
const LAUNCHER_ASSET = "AurelithLauncher.zip";
// DISCORD_INVITE: the server's invite link (e.g. "https://discord.gg/abc123"). Empty = the Join buttons hide.
const DISCORD_INVITE = "";
// TRAILER_VIDEO: the gameplay trailer, a video file next to the site (e.g. "media/trailer.webm" or ".mp4") or a
//   YouTube link. Empty = the poster shows with "coming soon". TRAILER_POSTER: the still shown before it plays.
const TRAILER_VIDEO = "";
const TRAILER_POSTER = "img/trailer_poster.jpg";

window.AURELITH_CONFIG = { REPORT_ENDPOINT, GITHUB_OWNER, GITHUB_REPO, LAUNCHER_ASSET, DISCORD_INVITE, TRAILER_VIDEO, TRAILER_POSTER };
