document.addEventListener('DOMContentLoaded', () => {
  // After deadline
  // document.getElementById('reg-uname').disabled = true
  // document.getElementById('reg-email').disabled = true
  // document.getElementById('reg-btn').disabled = true
});

const supaclient = supabase.createClient('https://srhywkedxssxlsjrholj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaHl3a2VkeHNzeGxzanJob2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzOTYxNjUsImV4cCI6MjA0MTk3MjE2NX0.lUZUAm20JIH3aoUxmyCAcr8l-A3_S3FpTaHuljrwm50')
let user = ""
const league_shorthands = ['prem', 'la_liga', 'champ', 'seriea', 'bundes', 'ligue1']

async function login() {
  try {
    user = document.getElementById('uname').value

    let { data , error } = await supaclient.from('credentials').select('username')

    if (error) throw error
    regs_unames = []

    for ((uname) in (data)) {
      regs_unames.push(data[uname].username)
    }
    let found = regs_unames.indexOf(document.getElementById('uname').value)

    if (found == -1) {
      alert("Username not recognised")
      document.getElementById('pword').value = ""
      document.getElementById('uname').value = ""

      // Deactivate textboxes while things are happening, loading sign?
    } else {
      let {data, error} = await supaclient.from('credentials').select('passcode')

      if (error) throw error
      req_pword = data[found].passcode

      if (document.getElementById('pword').value == req_pword) {
        // A function needs to be added here once the deadline is decided
        document.getElementById('login-page').classList.add('d-none');

        // Stuff to do before deadline
        document.getElementById('main-page-pre').classList.remove('d-none');
        retrieve_info()
        add_pred_table(document.getElementById('uname').value)

        // Stuff to do after deadline
        // document.getElementById('main-page-post').classList.remove('d-none')
        // add_locked_preds(document.getElementById('uname').value)
        // add_prem_table()
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
  let { data , error } = await supaclient.from('credentials').select('username, email')
  const unames = data.map(item => item.username);
  const emails = data.map(item => item.email);
  if (error) throw error
  regs_unames = []
  regs_emails = []

  for (uname in unames) {
    regs_unames.push(unames[uname])
  }

  for (email in emails) {
    regs_emails.push(emails[email])
  }

  let found = regs_unames.indexOf(document.getElementById('reg-uname').value)
  let efound = regs_emails.indexOf(document.getElementById('reg-email').value)

  if ((found == -1) && (efound == -1)) {
    created_pcode = createPasscode()
    let { data, error } = await supaclient
    .from('credentials')
    .insert([
    { username: (document.getElementById('reg-uname').value), passcode: created_pcode, email: document.getElementById('reg-email').value },
    ])
    .select()

    let serviceID = 'service_footpred';
    let templateID = 'template_cek6i8r';
  
    let templateParams = {
      to_name: document.getElementById('reg-uname').value,
      email: document.getElementById('reg-email').value,
      username: document.getElementById('reg-uname').value,
      passcode: created_pcode,
    };

    try {
        // Send email
        const response = await emailjs.send(serviceID, templateID, templateParams);
        alert('Email sent successfully!');
    } catch (error) {
        console.log('Failed to send email. Error: ' + JSON.stringify(error));
    }
    user_team_list(document.getElementById('reg-uname').value)

  } else if (found != -1){
    alert("Unsuccessful. Username already in use.")
  } else {
    alert("Unsuccessful. Email already in use.")
  }
}

function createPasscode() {
  const characters = 'ABCDEFGHJKLMNPQRSTWXYZabcdefghjklmnpqrstwxyz123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }
  return randomString;
}

function change_tab(tab) {
  navs = document.getElementsByClassName('nav-link')
  for (let nav = 0; nav < navs.length; nav++) {
    navs[nav].classList = ('nav-link')
  }
  document.getElementById(tab+'-tab').classList.add('active')

  tabs = document.getElementsByClassName('tab-pane')
  for (let tab = 0; tab < tabs.length; tab++) {
    tabs[tab].classList = ('tab-pane')
  }

  document.getElementById(tab).classList.add('show')
  document.getElementById(tab).classList.add('active')
}

// When the user has registered, team list to be created
async function user_team_list(uname) {
  for (let league = 0; league < league_shorthands.length; league++) {

    let { data , error } = await supaclient.from(`${league_shorthands[league]}_preds`).select('*').eq('username','all_teams')
    delete data[0].username

    let {d, e} = await supaclient
    .from(`${league_shorthands[league]}_preds`)
    .insert([{'username':uname}])

    let { da, er } = await supaclient
    .from(`${league_shorthands[league]}_preds`)
    .update(data)
    .eq('username', uname)
    .select()

    let {dat, error3} = await supaclient
    .from(`${league_shorthands[league]}_scores`)
    .insert([{'username': uname}])

    // Prepare the update object with columns from 1 to 20 set to 0
    const updateData = {};
    for (let i = 1; i <= (Object.keys(data[0]).filter(key => !isNaN(key)).length); i++) {
        updateData[i] = 0; // Setting each column to 0
    }

    let {data2, error2} = await supaclient
    .from(`${league_shorthands[league]}_scores`)
    .update(updateData)
    .eq('username', uname)
    .select()
  }
  let {data4, error4} = await supaclient
  .from('leaderboard')
  .insert([{'username': uname}])
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
}

async function add_users() {
  let { data , error } = await supaclient.from('leaderboard').select('username')
  let html_info = `<table class="table table-bordered border-primary">
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

async function add_pred_table(uname) {
  for (let league = 0; league < league_shorthands.length; league++) {
    let { data , error } = await supaclient.from(`${league_shorthands[league]}_preds`).select('*').eq('username', uname)
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

async function add_locked_preds(uname) {
  for (let league = 0; league < league_shorthands.length; league++) {

    let { data , error } = await supaclient.from(`${league_shorthands[league]}_preds`).select('*').eq('username', uname)
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
}

async function add_leaderboard() {
  let { data , error } = await supaclient.from('leaderboard').select('*').order('total', { ascending: false });
  console.log("DATA", data)
  let html_info = `<table class="table table-bordered border-primary">
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