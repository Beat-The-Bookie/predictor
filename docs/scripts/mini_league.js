function getLeagueIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function loadMiniLeaguePage() {

  const leagueId = getLeagueIdFromURL();

  const { data: { session } } = await supaclient.auth.getSession();
  const user = session?.user?.id;
  const current_user = session?.user;

  if (!leagueId) {
    document.querySelector("#mini-league-container").innerHTML =
      "<p>Invalid league.</p>";
    return;
  }

  // Get league info
  const { data: league } = await supaclient
    .from("mini_leagues")
    .select("*")
    .eq("id", leagueId)
    .single();

  if (!league) {
    document.querySelector("#mini-league-container").innerHTML =
      "<p>League not found.</p>";
    return;
  }

  let html = "";

  const isAdmin = user === league.admin_user_id;

  if (isAdmin) {

    html += `
    <div class="row justify-content-center">
      <div class="col-auto">
        <h1>${league.name}</h1>
      </div>
    </div>

    <div class="row justify-content-between mb-3">

      <div class="col-auto">
        <button class="btn btn-primary"
        onclick="window.location.href='mini-leagues.html'">
        Back
        </button>
      </div>

      <div class="col-auto">
        <button class="btn btn-primary"
        data-bs-toggle="modal"
        data-bs-target="#modifyLeagueModal">
        Modify
        </button>
      </div>

      <div class="col-auto">
        <button class="btn btn-danger"
        onclick="deleteLeague('${league.id}')">
        Delete
        </button>
      </div>

    </div>

    <!-- Modify League Modal -->
    <div class="modal fade" id="modifyLeagueModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">

          <div class="modal-header">
            <h5 class="modal-title">Modify League</h5>
            <button class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">

            <div class="mb-3">
              <label class="form-label">League Name</label>
              <input type="text" class="form-control"
              value="${league.name}" disabled>
            </div>

            <div class="mb-3">
              <label class="form-label">Premier League Max Teams</label>
              <input type="number" class="form-control"
              id="modifyPremLimit" min="0" max="20"
              value="${league.prem_limit}">
            </div>

            <div class="mb-3">
              <label class="form-label">La Liga Max Teams</label>
              <input type="number" class="form-control"
              id="modifyLaligaLimit" min="0" max="20"
              value="${league.la_liga_limit}">
            </div>

            <div class="mb-3">
              <label class="form-label">Championship Max Teams</label>
              <input type="number" class="form-control"
              id="modifyChampLimit" min="0" max="24"
              value="${league.champ_limit}">
            </div>

            <div class="mb-3">
              <label class="form-label">Serie A Max Teams</label>
              <input type="number" class="form-control"
              id="modifySerieaLimit" min="0" max="20"
              value="${league.seriea_limit}">
            </div>

            <div class="mb-3">
              <label class="form-label">Bundesliga Max Teams</label>
              <input type="number" class="form-control"
              id="modifyBundesLimit" min="0" max="18"
              value="${league.bundes_limit}">
            </div>

            <div class="mb-3">
              <label class="form-label">Ligue 1 Max Teams</label>
              <input type="number" class="form-control"
              id="modifyLigue1Limit" min="0" max="18"
              value="${league.ligue1_limit}">
            </div>

          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary"
            data-bs-dismiss="modal">Close</button>

            <button class="btn btn-primary"
            onclick="modifyLeague('${league.id}')">
            Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
    `;

  } else {

    html += `
    <div class="row justify-content-between mb-3">

      <div class="col-auto">
        <button class="btn btn-primary"
        onclick="window.location.href='mini-leagues.html'">
        Back
        </button>
      </div>

      <div class="col-auto">
        <h3>${league.name}</h3>
      </div>

      <div class="col-auto">
        <button class="btn btn-danger"
        onclick="leaveLeague('${league.id}')">
        Leave
        </button>
      </div>

    </div>
    `;
  }

  // Get members
  const { data: users } = await supaclient
    .from("mini_league_members")
    .select("username")
    .eq("mini_league_id", league.id);

  html += `
  <table class="table table-bordered border-primary">
    <thead>
      <tr>
        <th>User</th>
      </tr>
    </thead>
    <tbody>
  `;

  users.forEach(u => {
    html += `
    <tr>
      <td>${u.username}</td>
    </tr>
    `;
  });

  html += `
    </tbody>
  </table>
  `;

  document.querySelector("#mini-league-container").innerHTML = html;

}

async function leaveLeague(leagueId) {

  if (!confirm("Are you sure you want to leave this league?")) {
    return;
  }

  const { data: { session } } = await supaclient.auth.getSession();
  const user = session?.user?.id;

  if (!user) {
    alert("You must be logged in.");
    return;
  }

  const { error } = await supaclient
    .from("mini_league_members")
    .delete()
    .eq("mini_league_id", leagueId)
    .eq("user_id", user);

  if (error) {
    console.error(error);
    alert("Failed to leave league.");
    return;
  }

  alert("You have left the league.");

  // Redirect back to league list
  window.location.href = "mini-leagues.html";

}

async function deleteLeague(leagueId) {

  if (!confirm("Are you sure you want to delete this league? This cannot be undone.")) {
    return;
  }

  const { error } = await supaclient
    .from("mini_leagues")
    .delete()
    .eq("id", leagueId);

  if (error) {
    console.error(error);
    alert("Failed to delete league.");
    return;
  }

  alert("League deleted.");

  // Return to league list
  window.location.href = "mini-leagues.html";
}

async function modifyLeague(leagueId) {

  const premLim = parseInt(document.getElementById("modifyPremLimit").value);
  const laLigaLim = parseInt(document.getElementById("modifyLaligaLimit").value);
  const champLim = parseInt(document.getElementById("modifyChampLimit").value);
  const serieaLim = parseInt(document.getElementById("modifySerieaLimit").value);
  const bundesLim = parseInt(document.getElementById("modifyBundesLimit").value);
  const ligue1Lim = parseInt(document.getElementById("modifyLigue1Limit").value);

  const errors = [];

  if (premLim > 20) errors.push("Premier League max is 20.");
  if (laLigaLim > 20) errors.push("La Liga max is 20.");
  if (champLim > 24) errors.push("Championship max is 24.");
  if (serieaLim > 20) errors.push("Serie A max is 20.");
  if (bundesLim > 18) errors.push("Bundesliga max is 18.");
  if (ligue1Lim > 18) errors.push("Ligue 1 max is 18.");

  if (errors.length > 0) {
    alert("Invalid input:\n" + errors.join("\n"));
    return;
  }

  const updateData = {
    prem_limit: premLim,
    la_liga_limit: laLigaLim,
    champ_limit: champLim,
    seriea_limit: serieaLim,
    bundes_limit: bundesLim,
    ligue1_limit: ligue1Lim
  };

  const { error } = await supaclient
    .from("mini_leagues")
    .update(updateData)
    .eq("id", leagueId);

  if (error) {
    console.error(error);
    alert("Failed to update league.");
    return;
  }

  alert("League settings updated.");

  // Close modal
  bootstrap.Modal.getInstance(
    document.getElementById("modifyLeagueModal")
  ).hide();

  // Reload page
  loadMiniLeaguePage();
}