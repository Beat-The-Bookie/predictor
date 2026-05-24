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
let deadline_passed = false;
let isGuestViewingBookie = false;
let changes_made = false;

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
    // Logged in user
    currentUserId = session.user.id;
  } else {
    // Guest viewing The Bookie predictions
    isGuestViewingBookie = true;

    const { data: bookieUser, error } = await supaclient
      .from("leaderboard")
      .select("user_id")
      .eq("username", "The Bookie")
      .single();

    if (error || !bookieUser) {
      console.error("Could not find The Bookie user:", error);
      return;
    }

    currentUserId = bookieUser.user_id;
  }

  // Check if deadline has passed
  deadline_passed = isDeadlinePassed();

  loadHeader(`${league.name}`);

  const h1 = document.getElementById("league-title");
  if (h1) {
    h1.textContent = league.name;
  }

  const guestMessage = document.getElementById("guest-message");

  if (isGuestViewingBookie && guestMessage) {
    guestMessage.innerHTML = `
      <div class="alert alert-warning text-center mb-4" role="alert">
        <strong>You are viewing The Bookie's predictions.</strong><br>
        Sign up or log in to create and save your own league predictions.
      </div>
    `;
  } else if (!deadline_passed && !isGuestViewingBookie && guestMessage) {
    guestMessage.innerHTML = `
      <div class="alert alert-info text-center mb-2" role="alert">
        <strong>Drag the teams to change your predictions.</strong><br>
        Don't forget to save your changes!
      </div>
    `;
  }

  // Setup buttons and disable if deadline passed or guest viewing The Bookie
  const saveBtn = document.getElementById("save-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  const disableEditing = deadline_passed || isGuestViewingBookie;

  if (disableEditing) {
    saveBtn.disabled = true;
    cancelBtn.disabled = true;

    if (deadline_passed) {
      saveBtn.title = "Predictions are locked after the deadline.";
      cancelBtn.title = "Predictions are locked after the deadline.";
    } else if (isGuestViewingBookie) {
      saveBtn.title = "Login to create and save your own predictions.";
      cancelBtn.title = "Login to create and save your own predictions.";
    }
  }

  document.getElementById("save-btn").onclick =
    () => save_changes(league.code);

  document.getElementById("cancel-btn").onclick =
    () => reset_changes(league.code);

  updateUnsavedMessage();

  await loadPredictions(league.code);
  await loadStandings(league.code);

  // Warn user before leaving page with unsaved changes
  window.addEventListener("beforeunload", (event) => {
    if (changes_made) {
      event.preventDefault();
      event.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      return event.returnValue;
    }
  });
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
    const draggableClass = !deadline_passed && !isGuestViewingBookie ? "draggable-item draggable-enabled" : "draggable-item";
    html += `
      <tr>
        <td class="non-draggable">${i + 1}</td>
        <td class="${draggableClass}">${data[0][key]}</td>
      </tr>`;
  });

  html += `</tbody></table></div>`;
  document.getElementById("pred-table").innerHTML = html;

  if (!deadline_passed && !isGuestViewingBookie) {
    new Sortable(document.getElementById("pred-body"), {
      animation: 150,
      handle: ".draggable-item",
      onEnd: () => {
        updatePositions(document.getElementById("pred-body"));
        changes_made = true;
        updateUnsavedMessage();
      }
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

  if (deadline_passed || isGuestViewingBookie) {
    alert("You must be logged in to save changes.");
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
  changes_made = false;
  updateUnsavedMessage();
}

async function reset_changes(league) {

  if (deadline_passed || isGuestViewingBookie) {
    alert("You must be logged in to discard changes.");
    return;
  }

  if (!currentUserId) return;

  const confirmReset = confirm("Discard unsaved changes?");
  if (!confirmReset) return;

  await loadPredictions(league);
  changes_made = false;
  updateUnsavedMessage();
}

// Function to show/hide unsaved changes message
function updateUnsavedMessage() {
  const messageDiv = document.getElementById("unsaved-message");
  if (messageDiv) {
    if (changes_made) {
      messageDiv.innerHTML = `
        <div class="alert alert-danger text-center" role="alert">
          <strong>Unsaved changes!</strong> Remember to save your changes.
        </div>
      `;
    } else {
      messageDiv.innerHTML = "";
    }
  }
}

// Function to update the position numbers in the first column
function updatePositions(tableBody) {
  const rows = tableBody.querySelectorAll('tr');
  rows.forEach((row, index) => {
    const positionCell = row.querySelector('td:first-child');
    positionCell.textContent = index + 1; // Update position
  });
}
