document.addEventListener("DOMContentLoaded", async () => {
  const deadline = new Date('2025-08-08T18:00:00')
  deadline_passed = false // new Date() > deadline
  if (deadline_passed == true) {
    disable_boxes()
  }
  await restoreSession()
})

const deadline = new Date('2025-08-08T18:00:00')
const supaclient = supabase.createClient('https://ovtvjcwvhbkjljhmqacy.supabase.co', 'sb_publishable_7JNqVD9EbOI42bFrFEdx1A_3_ThPzne')
const league_shorthands = ['prem', 'la_liga', 'champ', 'seriea', 'bundes', 'ligue1']
const league_teams = [20, 20, 24, 20, 18, 18]
user = ""
const leagueTeamCounts = {
  prem: 20,
  champ: 24,
  la_liga: 20,
  seriea: 20,
  bundes: 18,
  ligue1: 18
}
current_user = ""

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
  // } else {
  //   enableLoggedOutUI();
  }
}

function enableLoggedInUI(user) {
  // hideLoginButton();

  const referralInput = document.getElementById("referral-link");
  if (referralInput) {
    referralInput.value =
      `https://beat-the-bookie.github.io/predictor/?ref=${encodeURIComponent(
        user.user_metadata.referral_code
      )}`;
  }
}

async function logout() {
  if (!confirm("Are you sure you would like to log out?")) return;

  try {
    await supaclient.auth.signOut();
  } catch (error) {
    console.error("Error signing out:", error.message);
    alert("There was a problem logging out. Please try again.");
    return;
  }

  localStorage.removeItem("loggedInUser");

  window.location.href = "auth.html";
}

function copyReferral() {
  const input = document.getElementById("referral-link");
  input.select();
  input.setSelectionRange(0, 99999); // For mobile
  navigator.clipboard.writeText(input.value)
    .then(() => alert("Referral link copied!"))
    .catch(() => alert("Failed to copy link."));
}

function createPasscode() {
  // Uses random function to create a random passcode
  const characters = 'ABCDEFGHJKLMNPQRSTWXYZabcdefghjklmnpqrstwxyz23456789';
  return Array.from({length: 6}, () => characters[Math.floor(Math.random() * characters.length)]).join('');
}

async function league_standings(league, sort="total_score") {

  // Collect all info needed for a league leaderboard
  let {data} = await supaclient.from("mini_leagues").select("id").eq("name", league)
  let {data: users} = await supaclient.from("mini_league_members").select("username, total_score, prem, la_liga, champ, seriea, bundes, ligue1, user_id").eq("mini_league_id", data[0]['id']).order(sort, { ascending: false });

  // Create outline for mini-league leaderboard
  new_html = `<div class="row align-items-center" mb-3">
                <div class="col-4 text-start">
                  <button class="btn btn-primary" onclick="mini_leagues(true)">Back</button>
                </div>
                <div class="col-4 text-center">
                  <h1>${league}</h1>
                </div> 
                <div class="col-4 text-end d-flex justify-content-end align-items-center">
                  <label for="sort-league-select" class="form-label me-2 mb-0">Sort By:</label>
                  <select class="form-select" id="sort-league-select" style="width: auto;" onchange="league_standings('${league}', this.value)">
                    <option value="total_score" ${sort === 'total_score' ? 'selected' : ''}>Total</option>
                    <option value="prem" ${sort === 'prem' ? 'selected' : ''}>Premier League</option>
                    <option value="la_liga" ${sort === 'la_liga' ? 'selected' : ''}>La Liga</option>
                    <option value="champ" ${sort === 'champ' ? 'selected' : ''}>Championship</option>
                    <option value="seriea" ${sort === 'seriea' ? 'selected' : ''}>Serie A</option>
                    <option value="bundes" ${sort === 'bundes' ? 'selected' : ''}>Bundesliga</option>
                    <option value="ligue1" ${sort === 'ligue1' ? 'selected' : ''}>Ligue 1</option>
                  </select>
                </div>
              </div>
              <table class="table table-bordered border-primary">
                  <thead>
                      <tr>
                          <th>Place</th>
                          <th>User</th>
                          <th>Prem</th>
                          <th>Championship</th>
                          <th>La Liga</th>
                          <th>Serie A</th>
                          <th>Bundesliga</th>
                          <th>Ligue 1</th>
                          <th>Total</th>
                      </tr>
                  </thead>
                  <tbody id="miniLeagueStandings">`

  // Display data for each user in the correct order
  place = 1
  users.forEach(user => {
      let row = ` <tr>
                    <td>${place}</td>
                    <td><button class="btn btn-link" onclick="add_locked_preds('${user['username']}', '${user['user_id']}')">${user['username']}</td>
                    <td>${user['prem']}</td>
                    <td>${user['champ']}</td>
                    <td>${user['la_liga']}</td>
                    <td>${user['seriea']}</td>
                    <td>${user['bundes']}</td>
                    <td>${user['ligue1']}</td>
                    <td>${user['total_score']}</td>
                  </tr>`;
      new_html += row;
      place += 1
  });

  new_html += `</tbody>
  </table>`

  // Complete table and display html in correct position
  let postLeagues = document.querySelector("#post-leagues");

  postLeagues.innerHTML = "";
  postLeagues.innerHTML = new_html;
}

// Function to update the position numbers in the first column
function updatePositions(tableBody) {
  const rows = tableBody.querySelectorAll('tr');
  rows.forEach((row, index) => {
      const positionCell = row.querySelector('td:first-child');
      positionCell.textContent = index + 1; // Update position
  });
}

async function add_locked_preds(player = user, user_id = user) {
  // Update the status
  if (player == user) {
      document.getElementById("viewing").textContent = current_user.user_metadata.username
  } else {
      document.getElementById("viewing").textContent = player
  }
  change_tab('post-nav-home')

  // Cycle through the leagues
  for (let league = 0; league < league_shorthands.length; league++) {
    let scores = ""
    // Collect the user's predictions and scores
    let { data } = await supaclient.from(`${league_shorthands[league]}_preds`).select('*').eq('user_id', user)

    scores = await fetch_scores(league_shorthands[league], user)

    delete data[0]['user_id']
    delete scores['user_id']

    pred_label = user.endsWith("s") ? `${current_user.user_metadata.username}'` : `${current_user.user_metadata.username}'s`;

    html_pred =  `<div class="row justify-content-center">
                    <div class="col">
                      <h1>${pred_label} Predictions</h1>
                    </div>
                  </div>
                  <table id="locked-pred" class="table table-bordered border-primary">
                    <thead>
                      <tr>
                        <th>Position</th>
                        <th>Team</th>
                        <th>Points</th>
                      </tr>
                    </thead>
                    <tbody id="table-body-locked-pred">`

    // Cycle through the teams and create a row in the table for each
    for (let i = 1; i < league_teams[league] + 1; i++) {
      html_pred += `<tr>
                      <td>${i}</td>
                      <td>${data[0][i.toString()]}</td>
                      <td>${scores[i.toString()]}</td> 
                    </tr>`
    }

    // Complete table and display html in correct position
    html_pred += `</tbody>
                </table>`

    document.querySelector(`#${league_shorthands[league]}-pred-locked`).innerHTML = html_pred
  }

  if (player == user) {
    const leftHeader = document.getElementById("left-header-content")
    leftHeader.innerHTML = `<img src="logo.jpg" alt="Logo" width="100px" height="100px" />`
    document.getElementById('post-nav-home-tab').style.display = ''
    document.getElementById('post-nav-about-tab').style.display = ''
    add_prem_table()
  } else {
    const leftHeader = document.getElementById("left-header-content");
    leftHeader.innerHTML = `
      <button id="homeBtn"
              class="d-flex align-items-center justify-content-center p-0"
              onclick="add_locked_preds()"
              style="width: 100px; height: 100px; background-color: #FC8A06;">
        <i class="bi bi-house-door-fill" style="font-size: 2.5rem; color: #0d6efd;"></i>
      </button>
    `
    document.getElementById('post-nav-home-tab').style.display = 'none'
    document.getElementById('post-nav-about-tab').style.display = 'none'
    change_tab('post-nav-prem')
    other_preds(player, user_id)
  }

  add_leaderboard()
  mini_leagues(true)
}

async function other_preds(player, user_id = null) {
  
  // Cycle through the leagues
  for (let league = 0; league < league_shorthands.length; league++) {

    // Collect other user id
    let {data: user} = await supaclient.from("leaderboard").select("user_id").eq('username', player)

    let scores = ""
    // Collect the user's predictions and scores
    let { data } = await supaclient.from(`${league_shorthands[league]}_preds`).select('*').eq('user_id', user[0].user_id)
    if (player == user) {
      scores = await fetch_scores(league_shorthands[league], user)
    } else {
      scores = await fetch_scores(league_shorthands[league], user_id)
    }
    delete data[0]['username']
    delete scores['username']

    let possessive = player.endsWith("s") ? `${player}'` : `${player}'s`;

    html_pred =  `<div class="row justify-content-center">
                    <div class="col">
                      <h1>${possessive} Predictions</h1>
                    </div>
                  </div>
                  <table id="locked-pred" class="table table-bordered border-primary">
                    <thead>
                      <tr>
                        <th>Position</th>
                        <th>Team</th>
                        <th>Points</th>
                      </tr>
                    </thead>
                    <tbody id="table-body-locked-pred">`

    // Cycle through the teams and create a row in the table for each
    for (let i = 1; i < (Object.keys(data[0]).filter(key => !isNaN(key)).length + 1); i++) {
      html_pred += `<tr>
                      <td>${i}</td>
                      <td>${data[0][i.toString()]}</td>
                      <td>${scores[i.toString()]}</td> 
                    </tr>`
    }

    // Complete table and display html in correct position
    html_pred += `</tbody>
                </table>`
    document.querySelector(`#${league_shorthands[league]}-standings`).innerHTML = html_pred
  }
}

async function add_leaderboard(sortBy = 'total') {
  // Collect the leaderboard, sorted by the requested column
  let { data } = await supaclient.from('leaderboard').select('*').order(sortBy, { ascending: false });
  let html_info = ` <div class="row justify-content-between align-items-center mb-3">
                      <div class="col-auto">
                        <h1>The Leaderboard</h1>
                      </div>
                      <div class="col-auto d-flex align-items-center ms-auto">
                        <label for="sort-select" class="form-label me-2 mb-0">Sort By:</label>
                        <select class="form-select" id="sort-select" style="width: auto;" onchange="add_leaderboard(this.value)">
                          <option value="total" ${sortBy === 'total' ? 'selected' : ''}>Total</option>
                          <option value="prem" ${sortBy === 'prem' ? 'selected' : ''}>Premier League</option>
                          <option value="la_liga" ${sortBy === 'la_liga' ? 'selected' : ''}>La Liga</option>
                          <option value="champ" ${sortBy === 'champ' ? 'selected' : ''}>Championship</option>
                          <option value="seriea" ${sortBy === 'seriea' ? 'selected' : ''}>Serie A</option>
                          <option value="bundes" ${sortBy === 'bundes' ? 'selected' : ''}>Bundesliga</option>
                          <option value="ligue1" ${sortBy === 'ligue1' ? 'selected' : ''}>Ligue 1</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <table class="table table-bordered border-primary">
                      <thead>
                        <tr>
                          <th scope="col">#</th>
                          <th scope="col">User</th>
                          <th scope="col"><button class="btn btn-link" onclick="add_leaderboard('prem')">Premier League</th>
                          <th scope="col"><button class="btn btn-link" onclick="add_leaderboard('la_liga')">La Liga</th>
                          <th scope="col"><button class="btn btn-link" onclick="add_leaderboard('champ')">Championship</button></th>
                          <th scope="col"><button class="btn btn-link" onclick="add_leaderboard('seriea')">Serie A</th>
                          <th scope="col"><button class="btn btn-link" onclick="add_leaderboard('bundes')">Bundesliga</th>
                          <th scope="col"><button class="btn btn-link" onclick="add_leaderboard('ligue1')">Ligue 1</th>
                          <th scope="col"><button class="btn btn-link" onclick="add_leaderboard('total')">Total</th>
                        </tr>
                      </thead>
                      <tbody>`

  // Cycle through the users, displaying scores for each league
  for (let i = 0; i < (Object.keys(data).filter(key => !isNaN(key)).length); i++) {
    html_info += `<tr>
                    <td scope="row">${i+1}</td>
                    <td><button class="btn btn-link" onclick="add_locked_preds('${data[i].username}', '${data[i].user_id}')">${data[i].username}</td>
                    <td>${data[i].prem}</td>
                    <td>${data[i].la_liga}</td>                          
                    <td>${data[i].champ}</td>
                    <td>${data[i].seriea}</td>                          
                    <td>${data[i].bundes}</td>
                    <td>${data[i].ligue1}</td>
                    <td>${data[i].total}</td>                 
                  </tr>`
  }

  // Complete table and display html in correct position
  html_info +=  `</tbody>
                  </table>`

  document.querySelector(`#post-leaderboard`).innerHTML = html_info
}

async function add_prem_table() {
  // Cycle through the leagues
  for (let league = 0; league < league_shorthands.length; league++) {
    // Collect the standings and other info
    let { data } = await supaclient
      .from("default_predictions")
      .select("*")
      .in("name", [`${league_shorthands[league]}_standings`, `${league_shorthands[league]}_points`, `${league_shorthands[league]}_games_played`, `${league_shorthands[league]}_goal_difference`]);

    // Turn array into object with keys from the `name` field
    let dataByName = {};
    data.forEach(row => {
      dataByName[row.name] = row;
    });

    html_pred =  `<div class="row justify-content-center">
                    <div class="col">
                      <h1>Current Standings</h1>
                    </div>
                  </div>
                  <table id="current-prem" class="table table-bordered border-primary">
                    <thead>
                      <tr>
                        <th>Position</th>
                        <th>Team</th>
                        <th>Played</th>
                        <th>Goal Diff</th>
                        <th>Points</th>
                      </tr>
                    </thead>
                    <tbody id="table-current-pred">`

    // Cycle through the teams, creating a row for each
    for (let i = 1; i <= league_teams[league]; i++) {
      const key = i.toString()
      html_pred += `<tr>
                      <td>${i}</td>
                      <td>${dataByName[`${league_shorthands[league]}_standings`][key]}</td>
                      <td>${dataByName[`${league_shorthands[league]}_games_played`][key]}</td>
                      <td>${dataByName[`${league_shorthands[league]}_goal_difference`][key]}</td>
                      <td>${dataByName[`${league_shorthands[league]}_points`][key]}</td>
                    </tr>`;
    }

    // Complete table and display html in correct position
    html_pred += `</tbody>
                </table>`

    document.querySelector(`#${league_shorthands[league]}-standings`).innerHTML = html_pred
  }
}

async function fetch_scores(league, player) {
  // Collect the user's scores from one league
  let {data, error}  = await supaclient.from(`${league}_scores`).select('*').eq('user_id', player)
  return data[0]
}

async function other_scores(uname, shorthand) {
  // Collect another user's scores - not in use
  let {data}  = await supaclient.from(`${shorthand}_scores`).select('*').eq('user_id', user)
  return data[0]
}

async function sendPasswordReset() {
  const email = document.getElementById("resetEmail").value;

  if (!email) {
    alert("Please enter your email address.");
    return;
  }

  const { error } = await supaclient.auth.resetPasswordForEmail(email, {
    redirectTo: "https://beat-the-bookie.github.io/predictor/reset"
  });

  if (error) {
    alert("Error: " + error.message);
  } else {
    alert("Password reset email sent! Please check your inbox.");
    const modalEl = bootstrap.Modal.getInstance(document.getElementById('resetPasswordModal'));
    modalEl.hide();
  }
}

function disable_boxes() {
  // Disable the register boxes after the deadline
  document.getElementById('reg-uname').disabled = true
  document.getElementById('reg-email').disabled = true
  document.getElementById('reg-pword').disabled = true
  document.getElementById('show-pword').disabled = true
  document.getElementById('reg-btn').disabled = true
}

async function renderScoresTable() {

  let { data } = await supaclient.from('leaderboard').select('*').eq('user_id', user)
  scores = data[0]

  html_text = `<table class="table table-bordered border-primary">
                  <thead>
                    <tr>
                      <th>Premier League</th>
                      <th>La Liga</th>
                      <th>Championship</th>
                      <th>Serie A</th>
                      <th>Bundesliga</th>
                      <th>Ligue 1</th>
                      <th>Total</th>
                    </tr>
                    <tr>
                      <td>${scores.prem}</td>
                      <td>${scores.la_liga}</td>
                      <td>${scores.champ}</td>
                      <td>${scores.seriea}</td>
                      <td>${scores.bundes}</td>
                      <td>${scores.ligue1}</td>
                      <td>${scores.total}</td>
                    </tr>
                  <thead>
                </table>`
  document.getElementById("current-scores").innerHTML = html_text
}

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);
  if (input.type === "password") {
    input.type = "text";
    button.textContent = "Hide";
  } else {
    input.type = "password";
    button.textContent = "Show";
  }
}

function changeLoginTab(tab) {
  // Tab button elements
  const loginTabBtn = document.getElementById('login-tab');
  const registerTabBtn = document.getElementById('register-tab');

  // Tab content elements
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (tab === 'login') {
    loginTabBtn.classList.add('active');
    registerTabBtn.classList.remove('active');

    loginForm.classList.add('show', 'active');
    loginForm.classList.remove('fade');
    registerForm.classList.remove('show', 'active');
    registerForm.classList.add('fade');
  } else if (tab === 'register') {
    registerTabBtn.classList.add('active');
    loginTabBtn.classList.remove('active');

    registerForm.classList.add('show', 'active');
    registerForm.classList.remove('fade');
    loginForm.classList.remove('show', 'active');
    loginForm.classList.add('fade');
  }
}

function check_deadline() {
  deadline_passed = false // new Date() > deadline
  if (deadline_passed) {
    alert("The deadline has passed. Your changes were not saved.")
    location.reload()
    return true
  }
  return false
}