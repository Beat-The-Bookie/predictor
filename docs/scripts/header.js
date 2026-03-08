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
  `;

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
      <button class="btn btn-outline-light btn-sm" onclick="logout()">
        Logout
      </button>
    `;
  } else {
    container.innerHTML = `
      <a href="auth.html" class="btn btn-outline-light btn-sm">
        Login
      </a>
    `;
  }
}