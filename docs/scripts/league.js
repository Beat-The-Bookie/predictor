const LEAGUES = {
  prem: {
    name: "Premier League",
    code: "prem"
  },
  la_liga: {
    name: "La Liga",
    code: "la_liga"
  },
  champ: {
    name: "Championship",
    code: "champ"
  },
  seriea: {
    name: "Serie A",
    code: "seriea"
  },
  bundes: {
    name: "Bundesliga",
    code: "bundes"
  },
  ligue1: {
    name: "Ligue 1",
    code: "ligue1"
  }
};

let currentUserId = null;

function getLeagueFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("league");
}

async function initLeaguePage() {
  const leagueKey = getLeagueFromURL();
  const league = LEAGUES[leagueKey];

  if (!league) {
    window.location.href = "index.html";
    return;
  }

  const { data: { session } } = await supaclient.auth.getSession();

  if (session?.user) {
  currentUserId = session.user.id;
}
  // if (!session?.user) {
  //   disableLeagueEditing();
  // } else if (!deadline_passed) {
  //   enableLeagueEditing();
  // }

  loadHeader(`${league.name}`);

  const h1 = document.getElementById("league-title");
  if (h1) {
    h1.textContent = league.name;
  }

  document.getElementById("save-btn").onclick =
    () => save_changes(league.code);

  document.getElementById("cancel-btn").onclick =
    () => reset_changes(league.code);

  await loadPredictions(league.code);
  await loadStandings(league.code);
}

async function loadPredictions(league) {
  let { data } = await supaclient
    .from(`${league}_preds`)
    .select("*")
    .eq("user_id", currentUserId);
  delete data[0].user_id;

  let html = `
    <div class="table-responsive">
      <table class="table table-bordered border-primary">
        <thead>
          <tr>
            <th>Position</th>
            <th>Team</th>
          </tr>
        </thead>
        <tbody id="pred-body">
  `;

  Object.keys(data[0]).forEach((key, i) => {
    html += `
      <tr>
        <td class="non-draggable">${i + 1}</td>
        <td class="draggable-item">${data[0][key]}</td>
      </tr>`;
  });

  html += `</tbody></table></div>`;
  document.getElementById("pred-table").innerHTML = html;

  if (!deadline_passed) {
    new Sortable(document.getElementById("pred-body"), {
      animation: 150,
      handle: ".draggable-item",
      onEnd: () => updatePositions(document.getElementById("pred-body"))
    });
  }
}

async function loadStandings(league) {
  const { data: rows, error } = await supaclient
    .from("default_predictions")
    .select("*")
    .in("name", [
      `${league}_prev_standings`,
      `${league}_prev_points`,
      `${league}_prev_goal_difference`
    ]);

  if (error) {
    console.error(error);
    return;
  }

  const rowsByName = Object.fromEntries(
    rows.map(row => [row.name, row])
  );

  const standings = rowsByName[`${league}_prev_standings`];
  const points = rowsByName[`${league}_prev_points`];
  const gd = rowsByName[`${league}_prev_goal_difference`];

  // Remove `name` so it doesn't show up as a row
  const { name, ...standingsData } = standings;

  let html = `
    <table class="table table-bordered border-primary">
      <thead>
        <tr>
          <th>#</th>
          <th>Team</th>
          <th>GD</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
  `;

  Object.keys(standingsData)
    .filter(key => standingsData[key] != null)
    .forEach(key => {
      html += `
        <tr>
          <td>${key}</td>
          <td>${standings[key]}</td>
          <td>${gd[key]}</td>
          <td>${points[key]}</td>
        </tr>`;
    });


  html += `</tbody></table>`;
  document.getElementById("league-table").innerHTML = html;
}

async function save_changes(league) {

  if (deadline_passed) {
    alert("Predictions are locked.");
    return;
  }

  // Collect the new order of teams
  const newOrder = [];
  document.querySelectorAll("#pred-body .draggable-item").forEach(row => {
    newOrder.push(row.textContent.trim());
  });

  // Create column names (1,2,3,4...)
  const cols = [];
  for (let i = 1; i <= newOrder.length; i++) {
    cols.push(i.toString());
  }

  // Convert into object for Supabase
  const dataToUpdate = cols.reduce((acc, columnName, index) => {
    acc[columnName] = newOrder[index];
    return acc;
  }, {});

  const { error } = await supaclient
    .from(`${league}_preds`)
    .update(dataToUpdate)
    .eq("user_id", currentUserId);

  if (error) {
    console.error(error);
    alert("Error saving changes.");
    return;
  }

  alert("Changes saved successfully.");
}

async function reset_changes(league) {

  if (!currentUserId) return;

  const confirmReset = confirm("Discard unsaved changes?");
  if (!confirmReset) return;

  await loadPredictions(league);

}