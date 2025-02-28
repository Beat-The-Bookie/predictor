document.addEventListener("DOMContentLoaded", async () => {
  deadline_passed = false
  if (deadline_passed == true) {
    disable_boxes()
  }
  await restoreSession()
})

const supaclient = supabase.createClient('https://srhywkedxssxlsjrholj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaHl3a2VkeHNzeGxzanJob2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzOTYxNjUsImV4cCI6MjA0MTk3MjE2NX0.lUZUAm20JIH3aoUxmyCAcr8l-A3_S3FpTaHuljrwm50')
let user = ""
const league_shorthands = ['prem', 'la_liga', 'champ', 'seriea', 'bundes', 'ligue1']

async function restoreSession() {
  old_user = localStorage.getItem("loggedInUser")
  if (old_user) {
    document.getElementById('login-page').classList.add('d-none');
    user = old_user
    if (!deadline_passed) {
      document.getElementById('main-page-pre').classList.remove('d-none');
      retrieve_info();
    } else {
      document.getElementById('main-page-post').classList.remove('d-none');
      add_locked_preds();
    }
  }
}

async function logout() {
  if (confirm("Are you sure you would like to log out?")) {
    localStorage.removeItem("loggedInUser"); // Clear stored user
    document.getElementById('login-page').classList.remove('d-none');
    document.getElementById('main-page-pre').classList.add('d-none');
    document.getElementById('main-page-post').classList.add('d-none');
  }
}

async function login() {
  try {
    user = document.getElementById('uname').value
    let { data , error } = await supaclient
      .from('credentials')
      .select('username, passcode')
      .eq('username', user)
    
    if (error) throw error

    if (data.length === 0) {
      alert("Username not recognised")
      document.getElementById('pword').value = ""
      document.getElementById('uname').value = ""

    } else {
      if (error) throw error

      if (document.getElementById('pword').value == data[0]['passcode']) {
        document.getElementById('login-page').classList.add('d-none');

        localStorage.setItem("loggedInUser", user)
        if (deadline_passed == false) {
          document.getElementById('main-page-pre').classList.remove('d-none');
          retrieve_info()
        } else {
          document.getElementById('main-page-post').classList.remove('d-none')
          add_locked_preds()     
        }

      } else {
        alert("Passcode is incorrect")
        document.getElementById('pword').value = ""
      }
    }
  } catch (error) {
    console.log(error)
  }
}

async function register() {
  let new_uname = document.getElementById('reg-uname').value
  let new_email = document.getElementById('reg-email').value

  let { data: reg_data , error: reg_error } = await supaclient
    .from('credentials')
    .select('username')
    .eq('username', new_uname)

  let { data: email_data , error: email_error } = await supaclient
    .from('credentials')
    .select('email')
    .eq('email', new_email)

  let uname_found = reg_data.length > 0
  let email_found = email_data.length > 0
  if (reg_error || email_error) throw error

  if (uname_found) {
    alert("Unsuccessful. Username already in use.")

  } else if (email_found) {
    alert("Unsuccessful. Email already in use.")

  } else {
    created_pcode = createPasscode()

    try {
      let { data, error } = await supaclient
      .from('credentials')
      .insert([{ username: new_uname, passcode: created_pcode, email: new_email }])
      .select()

      let serviceID = 'service_footpred';
      let templateID = 'template_cek6i8r';
    
      let templateParams = {
        to_name: new_uname,
        email: new_email,
        username: new_uname,
        passcode: created_pcode,
      };

      await emailjs.send(serviceID, templateID, templateParams);
      alert('Email sent successfully!');
    
    } catch (error) {
      console.log('Error:', error.message || JSON.stringify(error));
      alert('An error occurred while creating the account. Please try again.');
    }
    user_team_list()
  }
}

function createPasscode() {
  const characters = 'ABCDEFGHJKLMNPQRSTWXYZabcdefghjklmnpqrstwxyz23456789';
  return Array.from({length: 6}, () => characters[Math.floor(Math.random() * characters.length)]).join('');
}

function change_tab(tab) {
  document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
  document.getElementById(`${tab}-tab`).classList.add('active');
  document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('show', 'active'));
  const selectedTab = document.getElementById(tab);
  selectedTab.classList.add('show', 'active');

  // if (!deadline_passed) {
  //   retrieve_info();
  // } else {
  //   add_locked_preds();
  // }
}

// When the user has registered, team list to be created
async function user_team_list() {
  for (let league = 0; league < league_shorthands.length; league++) {

    let { data , error } = await supaclient.from(`${league_shorthands[league]}_preds`).select('*').eq('username','all_teams')
    delete data[0].username

    let {d, e} = await supaclient
    .from(`${league_shorthands[league]}_preds`)
    .insert([{'username':user}])

    let { da, er } = await supaclient
    .from(`${league_shorthands[league]}_preds`)
    .update(data)
    .eq('username', user)
    .select()

    let {dat, error3} = await supaclient
    .from(`${league_shorthands[league]}_scores`)
    .insert([{'username': user}])

    // Prepare the update object with columns from 1 to 20 set to 0
    const updateData = {};
    for (let i = 1; i <= (Object.keys(data[0]).filter(key => !isNaN(key)).length); i++) {
        updateData[i] = 0; // Setting each column to 0
    }

    let {data2, error2} = await supaclient
    .from(`${league_shorthands[league]}_scores`)
    .update(updateData)
    .eq('username', user)
    .select()
  }
  let {data4, error4} = await supaclient
  .from('leaderboard')
  .insert([{'username': user}])
}

async function retrieve_info() {
  for (let league = 0; league < league_shorthands.length; league++) {

    let { data , error } = await supaclient.from(`${league_shorthands[league]}_preds`).select('*').or('username.eq.last_season_finishes,username.eq.all_teams')
    let teams = data[0]
    let pos = data[1]
    delete teams['username']
    delete pos['username']


    let html_info = `<div class="row justify-content-center">
                       <div class="col">
                         <h3>Teams</h3>
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



    for (let i = 1; i < (Object.keys(teams).filter(key => !isNaN(key)).length + 1); i++) {
      html_info += `<tr>
                            <td scope="row">${i}</th>
                            <td>${teams[i.toString()]}</td>
                            <td>${pos[i.toString()]}</td>
                          </tr>`
    }

    html_info +=  `</tbody>
                    </table>`

    document.querySelector(`#${league_shorthands[league]}-table`).innerHTML = html_info
  }
  add_users()
  add_pred_table()
}

async function add_users() {
  let { data , error } = await supaclient.from('leaderboard').select('username')
  let html_info = `<div class="row justify-content-center">
                    <div class="col">
                      <h3>Players</h3>
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

  for (let i = 0; i < (Object.keys(data).filter(key => !isNaN(key)).length); i++) {
    html_info += `<tr>
                          <td scope="row">${i+1}</th>
                          <td>${data[i].username}</td>
                        </tr>`
  }

  html_info +=  `</tbody>
                  </table>`

  document.querySelector(`#pre-leaderboard`).innerHTML = html_info
}

async function mini_leagues(post)  {
  let {data, error} = await supaclient.from('mini_league_members').select('mini_league_id').eq('username', user)
  new_html = ` <div class="row justify-content-between" style="margin-bottom:8px">
                  <div class="col-auto">
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
                            <input type="number" class="form-control" id="premLimit" min="0" value="20" required>
                          </div>
                          <div class="mb-3">
                            <label for="laligalimit" class="form-label">La Liga Max Teams</label>
                            <input type="number" class="form-control" id="laligaLimit" min="0" value="20" required>
                          </div>
                          <div class="mb-3">
                            <label for="champLimit" class="form-label">Championship Max Teams</label>
                            <input type="number" class="form-control" id="champLimit" min="0" value="24" required>
                          </div>
                          <div class="mb-3">
                            <label for="serieaLimit" class="form-label">Serie A Max Teams</label>
                            <input type="number" class="form-control" id="serieaLimit" min="0" value="20" required>
                          </div>
                          <div class="mb-3">
                            <label for="bundesligaLimit" class="form-label">Bundesliga Max Teams</label>
                            <input type="number" class="form-control" id="bundesligaLimit" min="0" value="18" required>
                          </div>
                          <div class="mb-3">
                            <label for="ligue1Limit" class="form-label">Ligue 1 Max Teams</label>
                            <input type="number" class="form-control" id="ligue1Limit" min="0" value="18" required>
                          </div>
                        </div>
                        <div class="modal-footer">
                          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                          <button type="button" class="btn btn-primary" onclick="createLeague()">Create League</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-auto">
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
                  </div>
                </div>`

  // Get list of mini-league IDs
  let leagueIDs = data.map(item => item.mini_league_id);

  // if (leagueIDs.length == 0) {
  //   // If no mini-leagues
  //   document.getElementById("leagueTableBody").innerHTML = "<tr><td colspan='2'>Not in any leagues</td></tr>";
  //     return;
  // }
  
  // Fetch mini-league details
  let { data: leagues, error: leagueError } = await supaclient
  .from("mini_leagues")
  .select("name, admin_username, prem_limit, champ_limit, la_liga_limit, seriea_limit, bundes_limit, ligue1_limit, id")
  .in("id", leagueIDs);

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
                      </tr>
                  </thead>
                  <tbody id="leagueTableBody">`

  if (post == false) {
    leagues.forEach(league => {
        let row = ` <tr>
                      <td>
                          <button class="btn btn-link" onclick="league_entrants('${league.name}', '${league['id']}')">
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
                    </tr>`;
        new_html += row;
    });
  } else {
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
                  </tr>`
        new_html += row
    })
  }
  
  new_html += `</tbody>
  </table>`

  if (post == false) {
    document.querySelector(`#pre-leagues`).innerHTML = new_html
  } else {
    document.querySelector('#post-leagues').innerHTML = new_html
  }

  }

async function league_entrants(league, id) {
  console.log("ID1", id)
  let {data, error} = await supaclient.from("mini_leagues").select("id, admin_username").eq("name", league)
  if (user == data[0]['admin_username']) {
    button = `<button class="btn btn-primary" onclick="delete_league('${id}')">Delete League</button>`
  } else {
    button = `<button class="btn btn-primary" onclick="leave_league('${id}')">Leave League</button>`
}
  let {data: users, error: userError} = await supaclient.from("mini_league_members").select("username").eq("mini_league_id", data[0]['id'])
  new_html = `<div class="row justify-content-between" style="margin-bottom:8px">
                <div class="col-auto">
                  <button class="btn btn-primary" onclick="mini_leagues(false)">Back</button>
                </div>
                <div class="col-auto">
                  <h3>${league}</h3>
                </div> 
                <div class="col-auto">${button}</div>
              </div>`
  // Add limits for each league for each mini-league?
  new_html += `<table class="table table-bordered border-primary">
                  <thead>
                      <tr>
                          <th>User</th>
                      </tr>
                  </thead>
                  <tbody id="miniLeagueUsers">`

  users.forEach(user => {
      let row = ` <tr>
                    <td>${user['username']}</td>
                  </tr>`;
      new_html += row;
  });

  new_html += `</tbody>
  </table>`

  let preLeagues = document.querySelector("#pre-leagues");

  // Clear all content inside the #pre-leagues div (buttons, table, etc.)
  preLeagues.innerHTML = "";
  
  // Insert the new table
  preLeagues.innerHTML = new_html;
}

async function leave_league(id) {
  if (confirm("Are you sure you would like to leave this league?")) {
    let {error} = await supaclient
      .from("mini_league_members")
      .delete()
      .eq("mini_league_id", id)
      .eq("username", user)
    mini_leagues(false)
  }
}

async function league_standings(league) {
  let {data, error} = await supaclient.from("mini_leagues").select("id").eq("name", league)
  let {data: users, error: userError} = await supaclient.from("mini_league_members").select("username, score_per_league, total_score").eq("mini_league_id", data[0]['id']).order("score_per_league", { ascending: false });
  console.log("DATA", users[0]['score_per_league'])
  new_html = `<div class="row justify-content-between" style="margin-bottom:8px">
                <div class="col-auto">
                  <button class="btn btn-primary" onclick="mini_leagues(true)">Back</button>
                </div>
                <div class="col-auto">
                  <h3>${league}</h3>
                </div> 
                <div class="col-auto"></div>
              </div>`
  new_html += `<table class="table table-bordered border-primary">
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

  place = 1
  users.forEach(user => {
      let row = ` <tr>
                    <td>${place}</td>
                    <td>${user['username']}</td>
                    <td>${user['score_per_league']['prem']}</td>
                    <td>${user['score_per_league']['champ']}</td>
                    <td>${user['score_per_league']['la_liga']}</td>
                    <td>${user['score_per_league']['seriea']}</td>
                    <td>${user['score_per_league']['bundes']}</td>
                    <td>${user['score_per_league']['ligue1']}</td>
                    <td>${user['total_score']}</td>
                  </tr>`;
      new_html += row;
      place += 1
  });

  new_html += `</tbody>
  </table>`

  let postLeagues = document.querySelector("#post-leagues");

  // Clear all content inside the #pre-leagues div (buttons, table, etc.)
  postLeagues.innerHTML = "";
  
  // Insert the new table
  postLeagues.innerHTML = new_html;
}

async function joinLeague() {
  // Get the input values
  let joinCode = document.getElementById("leagueJoinCode").value.trim();
  let username = user; // Current user's username (from hidden input)

  // Validate input
  if (!joinCode) {
      alert("Please enter a join code.");
      return;
  }

  let { data: leagueData, count: c1, error: leagueError } = await supaclient
      .from("mini_leagues")
      .select("id", { count: "exact" })
      .eq("join_code", joinCode);

  if (c1 == 0) {
      alert("Invalid join code. Please try again.");
      return;
  }

  // Step 2: Check if the user is already a member
  let { data: existingMember, count: c2, error: memberError } = await supaclient
      .from("mini_league_members")
      .select("id", { count: "exact" })
      .eq("mini_league_id", leagueData[0].id)
      .eq("username", username);

  // Step 3: Insert user into mini_league_members
  let { error: insertError } = await supaclient
      .from("mini_league_members")
      .insert([{ mini_league_id: leagueData[0].id, username: username }]);

  if (insertError) {
      alert("Failed to join league. You may already be a member.");
      console.log(insertError)
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
  for (let league = 0; league < league_shorthands.length; league++) {
    let { data , error } = await supaclient.from(`${league_shorthands[league]}_preds`).select('*').eq('username', user)
    delete data[0]['username']
    html_pred =  `<div class="row justify-content-center">
                    <div class="col">
                      <h3>Your Predictions</h3>
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

    for (let i = 1; i< (Object.keys(data[0]).filter(key => !isNaN(key)).length + 1); i++) {
      html_pred += `<tr>
                      <td>${i}</td>
                      <td class="draggable-item">${data[0][i.toString()]}</td>
                    </tr>`
    }

    html_pred += `</tbody>
                </table>`

    document.querySelector(`#${league_shorthands[league]}-pred-table`).innerHTML = html_pred
    let tableBody = document.getElementById(`${league_shorthands[league]}-table-body`);

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
  let adminUsername = user; // Assuming "admin" field holds username

  // Validate input
  if (!leagueName.trim()) {
      alert("Please enter a league name.");
      return;
  }

  // Prepare data object for Supabase
  let newLeague = {
      name: leagueName,
      admin_username: adminUsername,
      prem_limit: parseInt(premLimit),
      la_liga_limit: parseInt(laligaLimit),
      champ_limit: parseInt(champLimit),
      seriea_limit: parseInt(serieaLimit),
      bundes_limit: parseInt(bundesligaLimit),
      ligue1_limit: parseInt(ligue1Limit),
      join_code: createPasscode(),
  };

  // Insert into Supabase
  let { data, error} = await supaclient.from("mini_leagues").insert([newLeague]).select("id").single();;

  let leagueId = data.id; // Get the newly created league's ID

  // Insert admin as a member of the league
  let { error: memberError } = await supaclient.from("mini_league_members").insert([
      { mini_league_id: leagueId, username: adminUsername }
  ]);

  if (memberError) {
      console.error("Error adding admin to members:", memberError);
      alert("League created, but failed to add admin as a member.");
      return;
  }

  if (error) {
      console.error("Error creating league:", error);
      alert("Failed to create league. Please try again.");
  } else {
      alert("League created successfully!");
      
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

async function save_changes(league) {
  var newOrder = [];
      document.querySelectorAll(`#${league}-table-body .draggable-item`).forEach(function(row) {
        newOrder.push(row.textContent);
      });

  cols = []
  for (let i = 1; i < (newOrder.length + 1); i++) {
    cols.push(i.toString())
  }

  const dataToUpdate = cols.reduce((acc, columnName, index) => {
    acc[columnName] = newOrder[index]; // Assign value from the values list
    return acc; // Return the accumulator object
  }, {});

  let { data, error } = await supaclient
  .from(`${league}_preds`) // Replace with your actual table name
  .update(dataToUpdate)
  .eq('username', document.getElementById('uname').value); // Match the row to update by username

  alert("Changes saved successfully.")
}

async function reset_changes(league) {
  let { data , error } = await supaclient.from(`${league}_preds`).select('*').eq('username', user)
  delete data[0]['username']
  html_pred =  `<div class="row justify-content-center">
                  <div class="col">
                    <h3>Your Predictions</h3>
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

  for (let i = 1; i < (Object.keys(data[0]).filter(key => !isNaN(key)).length + 1); i++) {
    html_pred += `<tr>
                    <td>${i}</td>
                    <td class="draggable-item">${data[0][i.toString()]}</td>
                  </tr>`
  }

  html_pred += `</tbody>
              </table>`

  document.querySelector(`#${league}-pred-table`).innerHTML = html_pred
  let tableBody = document.getElementById(`${league}-table-body`);

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

async function add_locked_preds() {
  for (let league = 0; league < league_shorthands.length; league++) {

    let { data , error } = await supaclient.from(`${league_shorthands[league]}_preds`).select('*').eq('username', user)
    let scores = await fetch_scores(league_shorthands[league])
    delete data[0]['username']
    delete scores['username']

    html_pred =  `<div class="row justify-content-center">
                    <div class="col">
                      <h3>Your Predictions</h3>
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

    for (let i = 1; i < (Object.keys(data[0]).filter(key => !isNaN(key)).length + 1); i++) {
      html_pred += `<tr>
                      <td>${i}</td>
                      <td>${data[0][i.toString()]}</td>
                      <td>${scores[i.toString()]}</td> 
                    </tr>`
    }
    html_pred += `</tbody>
                </table>`

    document.querySelector(`#${league_shorthands[league]}-pred-locked`).innerHTML = html_pred
    add_leaderboard()
  }
  add_prem_table()
  mini_leagues(true)
}

async function add_leaderboard() {
  let { data , error } = await supaclient.from('leaderboard').select('*').order('total', { ascending: false });
  let html_info = `<div class="row justify-content-center">
                    <div class="col">
                      <h3>The Leaderboard</h3>
                    </div>
                  </div>
                  <table class="table table-bordered border-primary">
                      <thead>
                        <tr>
                          <th scope="col">#</th>
                          <th scope="col">User</th>
                          <th scope="col">Premier League</th>
                          <th scope="col">La Liga</th>
                          <th scope="col">Championship</th>
                          <th scope="col">Serie A</th>
                          <th scope="col">Bundesliga</th>
                          <th scope="col">Ligue 1</th>
                          <th scope="col">Total</th>
                        </tr>
                      </thead>
                      <tbody>`

  for (let i = 0; i < (Object.keys(data).filter(key => !isNaN(key)).length); i++) {
    html_info += `<tr>
                          <td scope="row">${i+1}</th>
                          <td>${data[i].username}</td>
                          <td>${data[i].prem}</td>
                          <td>${data[i].la_liga}</td>
                          <td>${data[i].champ}</td>
                          <td>${data[i].seriea}</td>
                          <td>${data[i].bundes}</td>
                          <td>${data[i].ligue1}</td>
                          <td>${data[i].total}</td>
                        </tr>`
  }

  html_info +=  `</tbody>
                  </table>`

  document.querySelector(`#post-leaderboard`).innerHTML = html_info
}

async function add_prem_table() {
  for (let league = 0; league < league_shorthands.length; league++) {
    let { data , error } = await supaclient.from(`${league_shorthands[league]}_preds`).select('*').or('username.eq.standings, username.eq.points, username.eq.games_played, username.eq.goal_difference')
    for (let dat = 0; dat < 4; dat++) {
      delete data[dat]['username']
    }
    html_pred =  `<div class="row justify-content-center">
                    <div class="col">
                      <h3>Current Standings</h3>
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

    if (league != 5) {
      for (let i = 1; i < (Object.keys(data[0]).filter(key => !isNaN(key)).length + 1); i++) {
        html_pred += `<tr>
                        <td>${i}</td>
                        <td>${data[0][i.toString()]}</td>
                        <td>${data[2][i.toString()]}</td>
                        <td>${data[3][i.toString()]}</td>
                        <td>${data[1][i.toString()]}</td>
                      </tr>`
      }
    } else {
      for (let i = 1; i < (Object.keys(data[0]).filter(key => !isNaN(key)).length + 1); i++) {
        html_pred += `<tr>
                        <td>${i}</td>
                        <td>${data[1][i.toString()]}</td>
                        <td>${data[3][i.toString()]}</td>
                        <td>${data[0][i.toString()]}</td>
                        <td>${data[2][i.toString()]}</td>
                      </tr>`
    }
  }
  html_pred += `</tbody>
              </table>`

  document.querySelector(`#${league_shorthands[league]}-standings`).innerHTML = html_pred
}
}
async function fetch_scores(shorthand) {
  let {data, error}  = await supaclient.from(`${shorthand}_scores`).select('*').eq('username', user)
  return data[0]
}

function forgot_passcode() {
  alert('Email footpredhelp@gmail.com')
}

function disable_boxes() {
  document.getElementById('reg-uname').disabled = true
  document.getElementById('reg-email').disabled = true
  document.getElementById('reg-btn').disabled = true
}