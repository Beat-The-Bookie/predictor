// Supabase client
const supaclient = supabase.createClient('https://ovtvjcwvhbkjljhmqacy.supabase.co', 'sb_publishable_7JNqVD9EbOI42bFrFEdx1A_3_ThPzne');

// Global user state
let user = "";
let current_user = "";

// League configuration
const league_shorthands = ['prem', 'la_liga', 'champ', 'seriea', 'bundes', 'ligue1'];
const league_teams = [20, 20, 24, 20, 18, 18];
const leagueTeamCounts = {
  prem: 20,
  champ: 24,
  la_liga: 20,
  seriea: 20,
  bundes: 18,
  ligue1: 18
};

// Deadline configuration (August 1st, 2026, 20:00)
const PREDICTION_DEADLINE = new Date("2026-08-01T20:00:00").getTime();
const DEFAULT_DEADLINE_TEXT = `Deadline: ${new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
}).format(new Date(PREDICTION_DEADLINE))}`;
const DEFAULT_DEADLINE_PAST = Date.now() > PREDICTION_DEADLINE;
window.PAGE_DEADLINE_TEXT = window.PAGE_DEADLINE_TEXT ?? DEFAULT_DEADLINE_TEXT;
window.PAGE_DEADLINE_IS_PAST = window.PAGE_DEADLINE_IS_PAST ?? DEFAULT_DEADLINE_PAST;

function isDeadlinePassed() {
  return Date.now() > PREDICTION_DEADLINE;
}

function setHeaderDeadline(deadlineText, isPast) {
  const render = () => {
    const container = document.getElementById("page-deadline-container");
    if (!container) {
      setTimeout(render, 50);
      return;
    }

    if (!deadlineText) {
      container.innerHTML = "";
      return;
    }

    const badgeClass = isPast ? "bg-danger text-white" : "text-white";
    const badgeStyle = isPast
      ? "display:inline-flex; align-items:center; height:2rem; padding:0 0.75rem; font-size:0.8rem;"
      : "display:inline-flex; align-items:center; height:2rem; padding:0 0.75rem; font-size:0.8rem; background-color:#28a745; color:#ffffff;";
    container.innerHTML = `
      <div class="badge ${badgeClass} text-nowrap" style="${badgeStyle}">
        ${escapeHTML(deadlineText)}
      </div>
    `;
  };

  render();
}

// Session management
async function restoreSession() {
  const { data: { session }, error } = await supaclient.auth.getSession();

  if (error) {
    console.error(error);
    return;
  }

  if (session?.user) {
    current_user = session.user;
    user = session.user.id;

    enableLoggedInUI(session.user);
  }
}

function enableLoggedInUI(userObj) {
  const referralInput = document.getElementById("referral-link");
  if (referralInput) {
    referralInput.value = `
      https://beat-the-bookie.github.io/predictor/?ref=${encodeURIComponent(
        userObj.user_metadata.referral_code
      )}`;
  }
}

// Utility functions
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function copyReferral() {
  const input = document.getElementById("referral-link");
  input.select();
  input.setSelectionRange(0, 99999); // For mobile
  navigator.clipboard.writeText(input.value)
    .then(() => alert("Referral link copied!"))
    .catch(() => alert("Failed to copy link."));
}

function loadHeader(titleText = null) {
  fetch("components/header.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("header-placeholder").innerHTML = html;

      if (titleText) {
        const title = document.getElementById("page-title");
        if (title) title.textContent = titleText;
      }

      buildNav();
      setupAuthButton();
      setHeaderDeadline(window.PAGE_DEADLINE_TEXT, window.PAGE_DEADLINE_IS_PAST);
    })
    .catch(err => console.error("Header load failed:", err));
}

function buildNav() {
  const nav = document.getElementById("nav-links");
  if (!nav) return;

  nav.innerHTML = `
    <li class="nav-item">
      <a class="nav-link" href="index.html">Welcome</a>
    </li>
  `

  if (typeof LEAGUES === "object") {
    Object.entries(LEAGUES).forEach(([key, league]) => {
      nav.innerHTML += `
        <li class="nav-item">
          <a class="nav-link" href="league.html?league=${key}">
            ${league.name}
          </a>
        </li>
      `;
    });
  }

  nav.innerHTML += `
    <li class="nav-item">
      <a class="nav-link" href="leaderboard.html">Leaderboard</a>
    </li>
    <li class="nav-item">
      <A class="nav-link" href="mini-leagues.html">Mini Leagues</a>
    </li>
    <li class="nav-item">
      <a class="nav-link" href="about.html">About</a>
    </li>
  `;
}

async function setupAuthButton() {
  const container = document.getElementById("auth-button-container");
  if (!container) return;

  const { data: { session } } = await supaclient.auth.getSession();

  if (session?.user) {
    container.innerHTML = `
      <button class="btn btn-sm" style="background-color:#28a745; border-color:#28a745; color:#ffffff; font-weight:700;" onclick="logout()">
        Logout
      </button>
    `;
  } else {
    container.innerHTML = `
      <a href="auth.html" class="btn btn-danger btn-sm" style="font-weight:700;">
        Login
      </a>
    `;
  }
}

async function logout() {
  try {
    const { error } = await supaclient.auth.signOut();
    localStorage.removeItem("supabase.auth.token");
    sessionStorage.removeItem("supabase.auth.token");
    localStorage.removeItem("supabase.auth.refresh_token");
    sessionStorage.removeItem("supabase.auth.refresh_token");
    localStorage.removeItem("supabase.auth.session");
    sessionStorage.removeItem("supabase.auth.session");
    localStorage.removeItem("supabase.auth.persistSession");

    if (error) {
      console.error("Logout failed:", error);
    }
  } catch (err) {
    console.error("Logout exception:", err);
  } finally {
    window.location.href = "index.html";
  }
}
