const MINI_LEAGUES_DEADLINE_TEXT = `Deadline: ${new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
}).format(new Date(PREDICTION_DEADLINE))}`;
const MINI_LEAGUES_DEADLINE_PAST = isDeadlinePassed();
window.PAGE_DEADLINE_TEXT = MINI_LEAGUES_DEADLINE_TEXT;
window.PAGE_DEADLINE_IS_PAST = MINI_LEAGUES_DEADLINE_PAST;

async function loadMiniLeagues() {
  const { data: { session } } = await supaclient.auth.getSession();
  const user = session?.user?.id;
  const current_user = session?.user;

  if (!user) {
    document.querySelector("#mini-leagues-container").innerHTML =
      "<p>Please log in to view your leagues.</p>";
    return;
  }

  // Get leagues user belongs to
  const { data: memberships } = await supaclient
    .from("mini_league_members")
    .select("mini_league_id")
    .eq("user_id", user);

  const leagueIDs = memberships ? memberships.map(m => m.mini_league_id) : [];

  let leagues = [];
  if (leagueIDs.length > 0) {
    const { data } = await supaclient
      .from("mini_leagues")
      .select("name, admin_username, prem_limit, champ_limit, la_liga_limit, seriea_limit, bundes_limit, ligue1_limit, id, join_code")
      .in("id", leagueIDs);

    leagues = data;
  }

  // Header and action buttons
  let html = `
  <div class="row mb-1">
    <div class="col-12">
      <h1 class="page-title">Mini Leagues</h1>
    </div>
  </div>

  <div class="row justify-content-between align-items-center mb-2">
    <div class="col-auto">
      <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createLeagueModal">
        Create League
      </button>
    </div>

    <div class="col-auto">
      <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#joinLeagueModal">
        Join League
      </button>
    </div>
  </div>
  `;

  // --- Desktop table version ---
  html += `
  <div class="table-responsive d-none d-md-block">
    <table class="table table-bordered border-primary table-sm">
      <thead>
        <tr>
          <th>League Name</th>
          <th>Admin</th>
          <th>Prem Limit</th>
          <th>Champ Limit</th>
          <th>La Liga Limit</th>
          <th>Serie A Limit</th>
          <th>Bundesliga Limit</th>
          <th>Ligue 1 Limit</th>
          <th>Join Code</th>
        </tr>
      </thead>
      <tbody>
  `;

  leagues.forEach(league => {
    html += `
      <tr>
        <td>
          <button class="btn btn-link"
            onclick="window.location.href='mini-league.html?id=${league.id}'">
            ${escapeHTML(league.name)}
          </button>
        </td>
        <td>${league.admin_username}</td>
        <td>${league.prem_limit}</td>
        <td>${league.champ_limit}</td>
        <td>${league.la_liga_limit}</td>
        <td>${league.seriea_limit}</td>
        <td>${league.bundes_limit}</td>
        <td>${league.ligue1_limit}</td>
        <td>${league.join_code}</td>
      </tr>
    `;
  });

  html += `</tbody></table></div>`;

  // --- Mobile card version ---
  html += `<div class="d-block d-md-none">`;

  leagues.forEach(league => {
    html += `
      <div class="card mb-3">
        <div class="card-body">
          <h5 class="card-title">${escapeHTML(league.name)}</h5>
          <p class="card-text mb-1"><strong>Admin:</strong> ${league.admin_username}</p>
          <p class="card-text mb-1"><strong>Prem Limit:</strong> ${league.prem_limit}</p>
          <p class="card-text mb-1"><strong>Champ Limit:</strong> ${league.champ_limit}</p>
          <p class="card-text mb-1"><strong>La Liga Limit:</strong> ${league.la_liga_limit}</p>
          <p class="card-text mb-1"><strong>Serie A Limit:</strong> ${league.seriea_limit}</p>
          <p class="card-text mb-1"><strong>Bundesliga Limit:</strong> ${league.bundes_limit}</p>
          <p class="card-text mb-1"><strong>Ligue 1 Limit:</strong> ${league.ligue1_limit}</p>
          <p class="card-text mb-1"><strong>Join Code:</strong> ${league.join_code}</p>
          <button class="btn btn-link p-0" onclick="window.location.href='mini-league.html?id=${league.id}'">
            View League
          </button>
        </div>
      </div>
    `;
  });

  html += `</div>`; // close mobile container

  // Add Join/Create League modals (same as before)
  html += generateJoinCreateModals();

  document.querySelector("#mini-leagues-container").innerHTML = html;

  const formattedDeadline = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(PREDICTION_DEADLINE));

  setHeaderDeadline(`Deadline: ${formattedDeadline}`, isDeadlinePassed());
}

// Move the join/create modals into a helper function for clarity
function generateJoinCreateModals() {
  return `
  <!-- JOIN LEAGUE MODAL -->
  <div class="modal fade" id="joinLeagueModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Join a League</h5>
          <button class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <label class="form-label">League Join Code</label>
          <input type="text" class="form-control" id="leagueJoinCode">
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button class="btn btn-primary" onclick="joinLeague()">Join League</button>
        </div>
      </div>
    </div>
  </div>

  <!-- CREATE LEAGUE MODAL -->
  <div class="modal fade" id="createLeagueModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Create League</h5>
          <button class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">League Name</label>
            <input type="text" class="form-control" id="leagueName">
          </div>
          <div class="mb-2"><label>Premier League Limit</label><input type="number" id="premLimit" class="form-control" value="20"></div>
          <div class="mb-2"><label>Championship Limit</label><input type="number" id="champLimit" class="form-control" value="24"></div>
          <div class="mb-2"><label>La Liga Limit</label><input type="number" id="laligaLimit" class="form-control" value="20"></div>
          <div class="mb-2"><label>Serie A Limit</label><input type="number" id="serieaLimit" class="form-control" value="20"></div>
          <div class="mb-2"><label>Bundesliga Limit</label><input type="number" id="bundesligaLimit" class="form-control" value="18"></div>
          <div class="mb-2"><label>Ligue 1 Limit</label><input type="number" id="ligue1Limit" class="form-control" value="18"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button class="btn btn-primary" onclick="createLeague()">Create League</button>
        </div>
      </div>
    </div>
  </div>
  `;
}

async function joinLeague() {

  const { data: { session } } = await supaclient.auth.getSession();
  const user = session?.user?.id;
  const current_user = session?.user;

  let joinCode = document.getElementById("leagueJoinCode").value.trim();

  if (!joinCode) {
    alert("Please enter a join code.");
    return;
  }

  let { data: leagueData } = await supaclient
    .from("mini_leagues")
    .select("id")
    .eq("join_code", joinCode)
    .single();

  if (!leagueData) {
    alert("Invalid join code.");
    return;
  }

  let { error } = await supaclient
    .from("mini_league_members")
    .insert([{
      mini_league_id: leagueData.id,
      user_id: user,
      username: current_user.user_metadata.username
    }]);

  if (error) {
    alert("Failed to join league. You may already be a member.");
    return;
  }

  alert("Successfully joined the league!");

  bootstrap.Modal.getInstance(
    document.getElementById("joinLeagueModal")
  ).hide();

  loadMiniLeagues();
}



async function createLeague() {

  const { data: { session } } = await supaclient.auth.getSession();
  const user = session?.user?.id;
  const current_user = session?.user;

  let leagueName = document.getElementById("leagueName").value;

  let premLimit = document.getElementById("premLimit").value;
  let laligaLimit = document.getElementById("laligaLimit").value;
  let champLimit = document.getElementById("champLimit").value;
  let serieaLimit = document.getElementById("serieaLimit").value;
  let bundesligaLimit = document.getElementById("bundesligaLimit").value;
  let ligue1Limit = document.getElementById("ligue1Limit").value;

  if (!leagueName.trim()) {
    alert("Please enter a league name.");
    return;
  }

  const leagueNameRegex = /^[a-zA-Z0-9 _\-]{3,20}$/;

  if (!leagueNameRegex.test(leagueName)) {
    alert("League name must be 3–20 characters.");
    return;
  }

  const errors = [];

  if (premLimit < 0 || premLimit > 20) errors.push("Premier League max 20.");
  if (laligaLimit < 0 || laligaLimit > 20) errors.push("La Liga max 20.");
  if (champLimit < 0 || champLimit > 24) errors.push("Championship max 24.");
  if (serieaLimit < 0 || serieaLimit > 20) errors.push("Serie A max 20.");
  if (bundesligaLimit < 0 || bundesligaLimit > 18) errors.push("Bundesliga max 18.");
  if (ligue1Limit < 0 || ligue1Limit > 18) errors.push("Ligue 1 max 18.");

  if (errors.length > 0) {
    alert(errors.join("\n"));
    return;
  }

  let code = createPasscode();

  let newLeague = {
    name: leagueName,
    admin_user_id: user,
    admin_username: current_user.user_metadata.username,
    prem_limit: parseInt(premLimit),
    la_liga_limit: parseInt(laligaLimit),
    champ_limit: parseInt(champLimit),
    seriea_limit: parseInt(serieaLimit),
    bundes_limit: parseInt(bundesligaLimit),
    ligue1_limit: parseInt(ligue1Limit),
    join_code: code
  };

  let { data, error } = await supaclient
    .from("mini_leagues")
    .insert([newLeague])
    .select("id")
    .single();

  if (error) {
    alert("Failed to create league.");
    return;
  }

  await supaclient
    .from("mini_league_members")
    .insert([{
      mini_league_id: data.id,
      user_id: user,
      username: current_user.user_metadata.username
    }]);

  alert("League created! Join code: " + code);

  bootstrap.Modal.getInstance(
    document.getElementById("createLeagueModal")
  ).hide();

  loadMiniLeagues();
}



function createPasscode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}