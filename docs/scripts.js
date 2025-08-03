document.addEventListener("DOMContentLoaded", async () => {
  const deadline = new Date('2025-08-08T18:00:00')
  deadline_passed = new Date() > deadline
  if (deadline_passed == true) {
    disable_boxes()
  }
  await restoreSession()
})

const supaclient = supabase.createClient('https://pssnuzrmazyxouoqsfhg.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzc251enJtYXp5eG91b3FzZmhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExOTMyMjQsImV4cCI6MjA2Njc2OTIyNH0.4Vj8_1Yr6yc0KZadbdknBv548dr3_WXYfGmerswF3XY')
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
  const {
    data: { session },
    error,
  } = await supaclient.auth.getSession();

  if (error) {
    console.error("Error restoring session:", error.message);
    return;
  }

  if (session && session.user) {
    current_user = session.user
    user = session.user.id;
    document.getElementById("viewing").textContent = current_user.user_metadata.username;
    document.getElementById('login-page').classList.add('d-none');
    
    const referral_link = `https://beat-the-bookie.github.io/predictor/?ref=${encodeURIComponent(current_user.user_metadata.referral_code)}`
    document.getElementById("referral-link").value = referral_link

    if (!deadline_passed) {
      document.getElementById('main-page-pre').classList.remove('d-none');
      retrieve_info();
    } else {
      document.getElementById('main-page-post').classList.remove('d-none');
      renderScoresTable();
      add_locked_preds();
    }
  } else {
    // No active session — show login page
    document.getElementById('login-page').classList.remove('d-none');
  }
}

async function logout() {
  // Check if the user would like to logout, to prevent misclicks
  if (confirm("Are you sure you would like to log out?")) {

    try {
      await supaclient.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
    // Clear stored user, reset screen to login
    localStorage.removeItem("loggedInUser")
    document.getElementById('login-page').classList.remove('d-none');
    document.getElementById('main-page-pre').classList.add('d-none');
    document.getElementById('main-page-post').classList.add('d-none');
    location.reload()
  }
}

function copyReferral() {
  const input = document.getElementById("referral-link");
  input.select();
  input.setSelectionRange(0, 99999); // For mobile
  navigator.clipboard.writeText(input.value)
    .then(() => alert("Referral link copied!"))
    .catch(() => alert("Failed to copy link."));
}

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('pword').value;

  const { data, error } = await supaclient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert("Login failed: " + error.message);
    document.getElementById('pword').value = "";
    return;
  }

  current_user = data.user;
  user = current_user.id

  if (!current_user.confirmed_at && !current_user.email_confirmed_at) {
    alert("Please confirm your email before logging in.");
    return;
  }

  document.getElementById("viewing").textContent = current_user.email;

  // Show appropriate UI
  document.getElementById('login-page').classList.add('d-none');

  const referral_link = `https://beat-the-bookie.github.io/predictor/?ref=${encodeURIComponent(current_user.user_metadata.referral_code)}`
  document.getElementById("referral-link").value = referral_link

  if (deadline_passed == false) {
    document.getElementById('main-page-pre').classList.remove('d-none');
    retrieve_info();
  } else {
    document.getElementById('main-page-post').classList.remove('d-none');
    renderScoresTable();
    add_locked_preds();
  }
}

async function register() {
  const new_uname = document.getElementById('reg-uname').value.trim();
  const new_email = document.getElementById('reg-email').value.trim();
  const new_pword = document.getElementById('reg-pword').value;

  // Query only for matching username
  const { data: existingUser, error: testError } = await supaclient
    .from("leaderboard")
    .select("username")
    .eq("username", new_uname)
    .single(); // gets one row or null

  if (existingUser) {
    alert("Username is already taken. Please choose a different one.");
    return;
  }

  if (!new_uname || !new_email || !new_pword) {
    alert("Please fill in all fields.");
    return;
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(new_email)) {
    alert("Please enter a valid email address.");
    return;
  }

  // Password strength check (minimum length)
  if (new_pword.length < 8) {
    alert("Password must be at least 8 characters long.");
    return;
  }

  const usernameRegex = /^[a-zA-Z0-9_ ]{3,20}$/;
  if (!usernameRegex.test(new_uname)) {
    alert("Username must be 3–20 characters and contain only letters, numbers, or underscores.");
    return;
  }

  const user_referral_code = createPasscode(); // Assuming you define this elsewhere
  const params = new URLSearchParams(window.location.search);
  const referrer = params.get('ref');

  try {
    const { data, error } = await supaclient.auth.signUp({
      email: new_email,
      password: new_pword,
      options: {
        data: {
          username: new_uname,
          referral_code: user_referral_code,
          referred_code: referrer
        },
        emailRedirectTo: 'https://beat-the-bookie.github.io/predictor/confirm'
      }
    });

    if (error) throw error;

    alert("Registration successful! Please check your email to confirm your account.");
  } catch (error) {
    console.error("Signup error:", error);
    alert("Error creating account: " + error.message);
  }
}

function createPasscode() {
  // Uses random function to create a random passcode
  const characters = 'ABCDEFGHJKLMNPQRSTWXYZabcdefghjklmnpqrstwxyz23456789';
  return Array.from({length: 6}, () => characters[Math.floor(Math.random() * characters.length)]).join('');
}

function change_tab(tab) {
  // Closes every tab other than one that has been chosen
  document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
  document.getElementById(`${tab}-tab`).classList.add('active');
  document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('show', 'active'));
  const selectedTab = document.getElementById(tab);
  selectedTab.classList.add('show', 'active');
}

async function retrieve_info() {
  // Cycle through each league
  for (let league = 0; league < league_shorthands.length; league++) {

    // Collect the data from the db for all teams in the league
    let { data: teamsData } = await supaclient
      .from("default_predictions")
      .select('*')
      .eq('name', `${league_shorthands[league]}_all_teams`);

    let teams = teamsData[0];
    delete teams['name'];

    let { data: posData } = await supaclient
      .from("default_predictions")
      .select('*')
      .eq('name', `${league_shorthands[league]}_last_season_finishes`);

    let pos = posData[0];
    delete pos['name'];


    // Create a table outline to display the collected info
    let html_info = `<div class="row justify-content-center">
                       <div class="col">
                         <h1>Teams</h1>
                        </div>
                      </div>
                        <table class="table table-bordered border-primary">
                          <thead>
                            <tr>
                              <th scope="col">#</th>
                              <th scope="col">Team</th>
                              <th scope="col">Last Season</th>
                            </tr>
                          </thead>
                          <tbody>`

    // Cycle through each team and display the name and last finishing position
    for (let i = 1; i < (league_teams[league] + 1); i++) {
      html_info += `<tr>
                            <td scope="row">${i}</th>
                            <td>${teams[i.toString()]}</td>
                            <td>${pos[i.toString()]}</td>
                          </tr>`
    }

    // Complete table and display html in correct position
    html_info +=  `</tbody>
                    </table>`

    document.querySelector(`#${league_shorthands[league]}-table`).innerHTML = html_info
  }
  add_users()
  add_pred_table()
}

async function add_users() {
  // Collect all users from the leaderboard table
  let { data } = await supaclient.from('leaderboard').select('username')

  // Create outline for leaderboard table
  let html_info = `<div class="row justify-content-center">
                    <div class="col">
                      <h1>Players</h1>
                    </div>
                  </div>
                  <table class="table table-bordered border-primary">
                      <thead>
                        <tr>
                          <th scope="col">#</th>
                          <th scope="col">User</th>
                        </tr>
                      </thead>
                      <tbody>`

  // Cycles through each user and displays info
  for (let i = 0; i < (Object.keys(data).filter(key => !isNaN(key)).length); i++) {
    html_info += `<tr>
                          <td scope="row">${i+1}</th>
                          <td>${escapeHTML(data[i].username)}</td>
                        </tr>`
  }

  // Complete table and display html in correct position
  html_info +=  `</tbody>
                  </table>`

  document.querySelector(`#pre-leaderboard`).innerHTML = html_info
}

async function mini_leagues(post)  {
  // Collect all mini-leagues that a user has joined
  let {data} = await supaclient.from('mini_league_members').select('mini_league_id').eq('user_id', user)

  // Create modals to create a new mini-league, and join an existing one
  new_html = ` <div class="row justify-content-between" style="margin-bottom:8px">`
  if (!post) new_html += `<div class="col-auto">
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createLeagueModal">Create League</button>
                  </div>
                  <div class="modal fade" id="createLeagueModal" tabindex="-1" aria-labelledby="createLeagueModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                      <div class="modal-content">
                        <div class="modal-header">
                          <h5 class="modal-title" id="createLeagueModalLabel">Create a League</h5>
                          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                          <div class="mb-3">
                            <label for="leagueName" class="form-label">League Name</label>
                            <input type="text" class="form-control" id="leagueName" required>
                          </div>
                          <div class="mb-3">
                            <label for="premLimit" class="form-label">Premier League Max Teams</label>
                            <input type="number" class="form-control" id="premLimit" min="0" max="20" value="20" required>
                          </div>
                          <div class="mb-3">
                            <label for="laligalimit" class="form-label">La Liga Max Teams</label>
                            <input type="number" class="form-control" id="laligaLimit" min="0" max="20" value="20" required>
                          </div>
                          <div class="mb-3">
                            <label for="champLimit" class="form-label">Championship Max Teams</label>
                            <input type="number" class="form-control" id="champLimit" min="0" max="24" value="24" required>
                          </div>
                          <div class="mb-3">
                            <label for="serieaLimit" class="form-label">Serie A Max Teams</label>
                            <input type="number" class="form-control" id="serieaLimit" min="0" max="20" value="20" required>
                          </div>
                          <div class="mb-3">
                            <label for="bundesligaLimit" class="form-label">Bundesliga Max Teams</label>
                            <input type="number" class="form-control" id="bundesligaLimit" min="0" max="18" value="18" required>
                          </div>
                          <div class="mb-3">
                            <label for="ligue1Limit" class="form-label">Ligue 1 Max Teams</label>
                            <input type="number" class="form-control" id="ligue1Limit" min="0" max="18" value="18" required>
                          </div>
                        </div>
                        <div class="modal-footer">
                          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                          <button type="button" class="btn btn-primary" onclick="createLeague()">Create League</button>
                        </div>
                      </div>
                    </div>
                  </div>`
        new_html += `<div class="col-auto mx-auto">
                    <h1>Your Leagues</h1>
                  </div>`

        if (!post) new_html += `<div class="col-auto">
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#joinLeagueModal">Join League</button>
                  </div>
                  <div class="modal fade" id="joinLeagueModal" tabindex="-1" aria-labelledby="joinLeagueModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                      <div class="modal-content">
                        <div class="modal-header">
                          <h5 class="modal-title" id="joinLeagueModalLabel">Join a League</h5>
                          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                          <div class="mb-3">
                            <label for="leagueName" class="form-label">League Join Code</label>
                            <input type="text" class="form-control" id="leagueJoinCode" required>
                          </div>
                        </div>
                        <div class="modal-footer">
                          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                          <button type="button" class="btn btn-primary" onclick="joinLeague()">Join League</button>
                        </div>
                      </div>
                    </div>
                  </div>`
                  new_html += `</div>`

  // Get list of mini-league IDs
  let leagueIDs = data.map(item => item.mini_league_id);
  
  // Fetch mini-league details
  let { data: leagues } = await supaclient
  .from("mini_leagues")
  .select("name, admin_username, prem_limit, champ_limit, la_liga_limit, seriea_limit, bundes_limit, ligue1_limit, id, join_code")
  .in("id", leagueIDs);

  // Create outline of table to display mini-leagues and info
  new_html += `<table class="table table-bordered border-primary">
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
                  <tbody id="leagueTableBody">`

  // Check if the deadline has passed
  // The difference is the onclick function
  if (post == false) {
    // Cycle through each mini-league, and display the relevant info
    leagues.forEach(league => {
        let row = ` <tr>
                      <td>
                          <button class="btn btn-link" onclick="league_entrants('${league.name}', '${league['id']}', '${league.prem_limit}', '${league.la_liga_limit}', '${league.champ_limit}', '${league.seriea_limit}', '${league.bundes_limit}', '${league.ligue1_limit}')">
                              ${escapeHTML(league.name)}
                          </button>
                      </td>
                      <td>${league.admin_username}</td>
                      <td>${league.prem_limit}</td>
                      <td>${league.la_liga_limit}</td>
                      <td>${league.champ_limit}</td>
                      <td>${league.seriea_limit}</td>
                      <td>${league.bundes_limit}</td>
                      <td>${league.ligue1_limit}</td>
                      <td>${league.join_code}</td>
                    </tr>`;
        new_html += row;
    });
  } else {
    // Cycle through each mini-league, and display the relevant info
    leagues.forEach(league => {
      let row = ` <tr>
                    <td>
                      <button class="btn btn-link" onclick="league_standings('${league.name}')">
                        ${league.name}
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
                  </tr>`
        new_html += row
    })
  }
  
  // Complete table and display html in correct position
  new_html += `</tbody>
  </table>`

  if (post == false) {
    document.querySelector(`#pre-leagues`).innerHTML = new_html
  } else {
    document.querySelector('#post-leagues').innerHTML = new_html
  }
}

async function league_entrants(league, id, prem, la_liga, champ, seriea, bundes, ligue1) {

  // Check if the user is the admin of the mini-league, change button depending on such
  let { data } = await supaclient.from("mini_leagues").select("id, admin_username, admin_user_id").eq("name", league)
  if (user == data[0]['admin_user_id']) {
    button = `<button class="btn btn-primary" onclick="delete_league('${id}')">Delete</button>`
    // Create outline for mini-league member table
    new_html = `<div class="row justify-content-center">
                <div class="col-auto">
                  <h1>${league}</h1>
                </div>  
              </div>  
              <div class="row justify-content-between" style="margin-bottom:8px">
                <div class="col-2 d-flex justify-content-start">
                  <button class="btn btn-primary" onclick="mini_leagues(false)">Back</button>
                </div>
                <div class="col-2 d-flex justify-content-center">
                  <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modifyLeagueModal">Modify</button>
                </div>
                <div class="modal fade" id="modifyLeagueModal" tabindex="-1" aria-labelledby="modifyLeagueModalLabel" aria-hidden="true">
                  <div class="modal-dialog">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title" id="modifyLeagueModalLabel">Modify League</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div class="modal-body">
                        <div class="mb-3">
                          <label for="leagueName" class="form-label">League Name</label>
                          <input type="text" class="form-control" id="leagueName" value="${league}" disabled>
                        </div>
                        <div class="mb-3">
                          <label for="premLimit" class="form-label">Premier League Max Teams</label>
                          <input type="number" class="form-control" id="modifyPremLimit" min="0" max="20" value="${prem}" required>
                        </div>
                        <div class="mb-3">
                          <label for="laligalimit" class="form-label">La Liga Max Teams</label>
                          <input type="number" class="form-control" id="modifyLaligaLimit" min="0" max="20" value="${la_liga}" required>
                        </div>
                        <div class="mb-3">
                          <label for="champLimit" class="form-label">Championship Max Teams</label>
                          <input type="number" class="form-control" id="modifyChampLimit" min="0" max="24" value="${champ}" required>
                        </div>
                        <div class="mb-3">
                          <label for="serieaLimit" class="form-label">Serie A Max Teams</label>
                          <input type="number" class="form-control" id="modifySerieaLimit" min="0" max="20" value="${seriea}" required>
                        </div>
                        <div class="mb-3">
                          <label for="bundesligaLimit" class="form-label">Bundesliga Max Teams</label>
                          <input type="number" class="form-control" id="modifyBundesLimit" min="0" max="18" value="${bundes}" required>
                        </div>
                        <div class="mb-3">
                          <label for="ligue1Limit" class="form-label">Ligue 1 Max Teams</label>
                          <input type="number" class="form-control" id="modifyLigue1Limit" min="0" max="18" value="${ligue1}" required>
                        </div>
                      </div>
                      <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="modifyLeague('${id}')">Save Changes</button>
                      </div>
                    </div>
                  </div>
                </div>
              <div class="col-2 d-flex justify-content-end">
                ${button}
              </div>`
  } else {
    button = `<button class="btn btn-primary" onclick="leave_league('${id}')">Leave</button>`
    new_html = `<div class="row justify-content-between" style="margin-bottom:8px">
                <div class="col-auto">
                  <button class="btn btn-primary" onclick="mini_leagues(false)">Back</button>
                </div>
                <div class="col-auto">
                  <h3>${league}</h3>
                </div> 
                <div class="col-auto">${button}</div>
                </div>`
  }

  // Collect all members of a mini-league
  let { data: users} = await supaclient.from("mini_league_members").select("user_id, username").eq("mini_league_id", data[0]['id'])



              new_html += `</div>
              <table class="table table-bordered border-primary">
                <thead>
                    <tr>
                        <th>User</th>
                    </tr>
                </thead>
                <tbody id="miniLeagueUsers">`

  // Insert each user into a row
  users.forEach(user => {
      let row = ` <tr>
                    <td>${user['username']}</td>
                  </tr>`;
      new_html += row;
  });

  // Complete table and display html in correct position
  new_html += `</tbody>
  </table>`

  let preLeagues = document.querySelector("#pre-leagues");

  preLeagues.innerHTML = "";
  preLeagues.innerHTML = new_html;
}

async function leave_league(id) {
  // Remove the relevant row from supabase when a user would like to leave a league
  if (confirm("Are you sure you would like to leave this league?")) {
    await supaclient
      .from("mini_league_members")
      .delete()
      .eq("mini_league_id", id)
      .eq("user_id", user)
    mini_leagues(false)
  }
}

async function delete_league(id) {
  // Remove the relevant row from supabase when a user would like to delete their league
  if (confirm("Are you sure you would like to delete this league?")) {
    await supaclient
      .from("mini_leagues")
      .delete()
      .eq("id", id)
    mini_leagues(false)
  }
}

async function league_standings(league, sort="total_score") {
  console.log("LEAGUE", league)
  console.log("SORT", sort)
  // Collect all info needed for a league leaderboard
  let {data} = await supaclient.from("mini_leagues").select("id").eq("name", league)
  let {data: users} = await supaclient.from("mini_league_members").select("username, total_score, prem, la_liga, champ, seriea, bundes, ligue1").eq("mini_league_id", data[0]['id']).order(sort, { ascending: false });

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
                    <td><button class="btn btn-link" onclick="add_locked_preds('${user['username']}')">${user['username']}</td>
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

async function joinLeague() {
  // Get the input values
  let joinCode = document.getElementById("leagueJoinCode").value.trim();
  
  // Validate input
  if (!joinCode) {
      alert("Please enter a join code.");
      return;
  }

  // Check the join code is relevant for a league
  let { data: leagueData, count: c1} = await supaclient
      .from("mini_leagues")
      .select("id", { count: "exact" })
      .eq("join_code", joinCode);

  // Return an error if join code is invalid
  if (c1 == 0) {
      alert("Invalid join code. Please try again.");
      return;
  }

  // Check if the user is already a member
  await supaclient
    .from("mini_league_members")
    .select("mini_league_id", { count: "exact" })
    .eq("mini_league_id", leagueData[0].id)
    .eq("user_id", user);

  // Insert user into mini_league_members
  let { error: insertError } = await supaclient
      .from("mini_league_members")
      .insert([{ mini_league_id: leagueData[0].id, user_id: user, username: current_user.user_metadata.username}]);

  // Alert user if there was an error in joining the league
  if (insertError) {
      alert("Failed to join league. You may already be a member.");
      return;
  }

  alert("Successfully joined the league!");

  // Close the modal
  let modal = bootstrap.Modal.getInstance(document.getElementById("joinLeagueModal"));
  modal.hide();

  // Refresh the league list
  mini_leagues(false);
}

async function add_pred_table() {
  // Cycles through the leagues, retrieves current predictions
  for (let league = 0; league < league_shorthands.length; league++) {
    let { data, error } = await supaclient.from(`${league_shorthands[league]}_preds`).select('*').eq('user_id', user)
    delete data[0]['user_id']
    // Create outline for user predictions table
    html_pred =  `<div class="row justify-content-center">
                    <div class="col">
                      <h1>Your Predictions</h1>
                    </div>
                  </div>
                  <table id="sortableTable" class="table table-bordered border-primary">
                    <thead>
                      <tr>
                        <th>Position</th>
                        <th>Team</th>
                      </tr>
                    </thead>
                  <tbody id="${league_shorthands[league]}-table-body">`

    // Create table row for each team in the league
    for (let i = 1; i< (Object.keys(data[0]).filter(key => !isNaN(key)).length + 1); i++) {
      html_pred += `<tr>
                      <td class="non-draggable">${i}</td>
                      <td class="draggable-item">${data[0][i.toString()]}</td>
                    </tr>`
    }

    // Complete table and display html in correct position
    html_pred += `</tbody>
                </table>`

    document.querySelector(`#${league_shorthands[league]}-pred-table`).innerHTML = html_pred
    let tableBody = document.getElementById(`${league_shorthands[league]}-table-body`);

    // Create the sortable table for the user's predictions
    new Sortable (tableBody, {
      animation: 150,
      ghostClass: 'blue-background-class',
      handle: '.draggable-item',
      draggable: 'tr',
      onEnd: function (evt) {
        updatePositions(tableBody);
      }
    })
  }
  mini_leagues(false)
}

async function createLeague() {
  // Get values from input fields
  let leagueName = document.getElementById("leagueName").value;
  let premLimit = document.getElementById("premLimit").value;
  let laligaLimit = document.getElementById("laligaLimit").value;
  let champLimit = document.getElementById("champLimit").value;
  let serieaLimit = document.getElementById("serieaLimit").value;
  let bundesligaLimit = document.getElementById("bundesligaLimit").value;
  let ligue1Limit = document.getElementById("ligue1Limit").value;

  // Validate input
  if (!leagueName.trim()) {
      alert("Please enter a league name.");
      return;
  }

  const leagueNameRegex = /^[a-zA-Z0-9 _\-]{3,20}$/;
  if (!leagueNameRegex.test(leagueName)) {
    alert("League name must be 3–20 characters and only include letters, numbers, spaces, dashes, or underscores.");
    return;
  }

  // Validate team limits
  const errors = [];

  if (premLimit < 0 || premLimit > 20) errors.push("Premier League max is 20.");
  if (laligaLimit < 0 || laligaLimit > 20) errors.push("La Liga max is 20.");
  if (champLimit < 0 || champLimit > 24) errors.push("Championship max is 24.");
  if (serieaLimit < 0 || serieaLimit > 20) errors.push("Serie A max is 20.");
  if (bundesligaLimit < 0 || bundesligaLimit > 18) errors.push("Bundesliga max is 18.");
  if (ligue1Limit < 0 || ligue1Limit > 18) errors.push("Ligue 1 max is 18.");

  if (errors.length > 0) {
    alert("Invalid input:\n" + errors.join("\n"));
    return;
  }

  // Create a league join code
  code = createPasscode()

  // Prepare data object for Supabase
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
      join_code: code,
  };

  // Insert into Supabase
  let { data, error} = await supaclient.from("mini_leagues").insert([newLeague]).select("id").single();;
  let leagueId = data.id; // Get the newly created league's ID

  // Insert admin as a member of the league
  let { error: memberError } = await supaclient.from("mini_league_members").insert([
      { mini_league_id: leagueId, user_id: user, username: current_user.user_metadata.username }
  ]);

  // Error if the league is created, but the admin not added
  if (memberError) {
      console.error("Error adding admin to members:", memberError);
      alert("League created, but failed to add admin as a member.");
      return;
  }

  // Error in creating the league
  if (error) {
      console.error("Error creating league:", error);
      alert("Failed to create league. Please try again.");
  } else {
      alert("League created successfully! The join code is: " + code);
      
      // Close the modal
      let modal = bootstrap.Modal.getInstance(document.getElementById("createLeagueModal"));
      modal.hide();

      // Optionally, refresh the league list
      mini_leagues(false);
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

// Functionality behind the save changes button
async function save_changes(league) {
  // Collect the new order of teams
  var newOrder = [];
  document.querySelectorAll(`#${league}-table-body .draggable-item`).forEach(function(row) {
    newOrder.push(row.textContent);
  });

  // Create the columns for the supabase upload 
  cols = []
  for (let i = 1; i < (newOrder.length + 1); i++) {
    cols.push(i.toString())
  }

  // Zip the teams and columns together
  const dataToUpdate = cols.reduce((acc, columnName, index) => {
    acc[columnName] = newOrder[index]; // Assign value from the values list
    return acc; // Return the accumulator object
  }, {});

  // Update the new order to Supabase
  await supaclient
  .from(`${league}_preds`)
  .update(dataToUpdate)
  .eq('user_id', user);

  alert("Changes saved successfully.")
}

async function reset_changes(league) {
  // Collect the old league predictions from Supabase for one specific league
  let { data } = await supaclient.from(`${league}_preds`).select('*').eq('user_id', user)
  delete data[0]['user_id']
  html_pred =  `<div class="row justify-content-center">
                  <div class="col">
                    <h1>Your Predictions</h1>
                  </div>
                </div>
                <table id="sortableTable" class="table table-bordered border-primary">
                  <thead>
                    <tr>
                      <th>Position</th>
                      <th>Team</th>
                    </tr>
                  </thead>
                <tbody id="${league}-table-body">`

  // Cycle through the teams and create a row in the table for each
  for (let i = 1; i < (Object.keys(data[0]).filter(key => !isNaN(key)).length + 1); i++) {
    html_pred += `<tr>
                    <td>${i}</td>
                    <td class="draggable-item">${data[0][i.toString()]}</td>
                  </tr>`
  }

  // Complete table and display html in correct position
  html_pred += `</tbody>
              </table>`

  document.querySelector(`#${league}-pred-table`).innerHTML = html_pred
  let tableBody = document.getElementById(`${league}-table-body`);

  // Create the sortable table for the user's predictions
  new Sortable (tableBody, {
    animation: 150,
    ghostClass: 'blue-background-class',
    handle: '.draggable-item',
    draggable: 'tr',
    onEnd: function (evt) {
      updatePositions(tableBody); // Update positions after dragging
    }
  })
}

async function add_locked_preds(player = user, user_id = null) {

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
    if (player == user) {
      scores = await fetch_scores(league_shorthands[league], user)
    } else {
      scores = await fetch_scores(league_shorthands[league], user_id)
    }

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
    document.getElementById('homeBtn').classList.add('d-none');
    add_prem_table()
  } else {
    document.getElementById('homeBtn').classList.remove('d-none');
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

async function modifyLeague(id) {
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

  const update_data = {
    prem_limit: premLim,
    la_liga_limit: laLigaLim,
    champ_limit: champLim,
    seriea_limit: serieaLim,
    bundes_limit: bundesLim,
    ligue1_limit: ligue1Lim,
  };

  const { error } = await supaclient
    .from("mini_leagues")
    .update(update_data)
    .eq("id", id);

  if (error) {
    alert("Failed to update league: " + error.message);
  } else {
    alert("Settings updated successfully");
  }
}
