document.addEventListener('DOMContentLoaded', () => {
  const user = ""
});

async function login() {
  let supaclient = supabase.createClient('https://srhywkedxssxlsjrholj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaHl3a2VkeHNzeGxzanJob2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzOTYxNjUsImV4cCI6MjA0MTk3MjE2NX0.lUZUAm20JIH3aoUxmyCAcr8l-A3_S3FpTaHuljrwm50')
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
      document.getElementById('login-fail').textContent = ("Username not recognised")
      document.getElementById('pword').value = ""
      document.getElementById('uname').value = ""

      // Deactivate textboxes while things are happening, loading sign?
    } else {
      let {data, error} = await supaclient.from('credentials').select('passcode')

      if (error) throw error
      req_pword = data[(found)].passcode

      if (document.getElementById('pword').value == req_pword) {
        document.getElementById('login-page').classList.add('d-none');
        document.getElementById('main-page-pre').classList.remove('d-none');
        // document.getElementById('main-page-post').classList.remove('d-none')
        retrieve_prem_info()
        add_pred_table(document.getElementById('uname').value)
        // add_locked_preds(document.getElementById('uname').value)
        // add_prem_table()

      } else {
        document.getElementById('login-fail').textContent = ("Passcode is incorrect")
        document.getElementById('pword').value = ""
      }
    }
  } catch (error) {
    console.log(error)
  }
}

async function register() {
  let supaclient = supabase.createClient('https://srhywkedxssxlsjrholj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaHl3a2VkeHNzeGxzanJob2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzOTYxNjUsImV4cCI6MjA0MTk3MjE2NX0.lUZUAm20JIH3aoUxmyCAcr8l-A3_S3FpTaHuljrwm50')
  let { data , error } = await supaclient.from('credentials').select('username')
  if (error) throw error
  regs_unames = []

  for (uname in data) {
    regs_unames.push(data[uname].username)
  }

  let found = regs_unames.indexOf(document.getElementById('reg-uname').value)

  if (found == -1) {
    const { data, error } = await supaclient
    .from('credentials')
    .insert([
    { username: (document.getElementById('reg-uname').value), passcode: createPasscode() },
    ])
    .select()
  } else {
    document.getElementById("reg-pcode").textContent = ("Unsuccessful. Username already in use.")
  }
  user_team_list(document.getElementById('reg-uname').value)
}

function createPasscode() {
  const characters = 'ABCDEFGHJKLMNPQRSTWXYZabcdefghjklmnpqrstwxyz123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }
  document.getElementById("reg-pcode").textContent = ("Account registered successfully. Your passcode is " + randomString)
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
  let supaclient = supabase.createClient('https://srhywkedxssxlsjrholj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaHl3a2VkeHNzeGxzanJob2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzOTYxNjUsImV4cCI6MjA0MTk3MjE2NX0.lUZUAm20JIH3aoUxmyCAcr8l-A3_S3FpTaHuljrwm50')

  let { data , error } = await supaclient.from('Predictions').select('*').eq('username','all_teams_prem')

  delete data[0].username

  let {d, e} = await supaclient
  .from('Predictions')
  .insert([{'username':uname}])

  const { da, err } = await supaclient
  .from('Predictions')
  .update(data)
  .eq('username', uname)
  .select()
}

async function retrieve_prem_info() {
  let supaclient = supabase.createClient('https://srhywkedxssxlsjrholj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaHl3a2VkeHNzeGxzanJob2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzOTYxNjUsImV4cCI6MjA0MTk3MjE2NX0.lUZUAm20JIH3aoUxmyCAcr8l-A3_S3FpTaHuljrwm50')

  let { data , error } = await supaclient.from('Predictions').select('*').or('username.eq.all_teams_prem_last_finish,username.eq.all_teams_prem')
  let teams = data[0]
  let pos = data[1]
  delete teams['username']
  delete pos['username']

  let html_prem_info = `            <div class="row justify-content-center">
              <div class="col">
                <h3>Premier League Teams</h3>
              </div>
            </div>
            <table class="table table-bordered border-primary">
                          <thead>
                            <tr>
                              <th scope="col">#</th>
                              <th scope="col">Team</th>
                              <th scope="col">Last Season</th>
                              <th scope="col">Odds</th>
                            </tr>
                          </thead>
                          <tbody class="table-group-divider">`

  for (let i = 1; i < 21; i++) {
    html_prem_info += `<tr>
                          <th scope="row">${i}</th>
                          <td>${teams[i.toString()]}</td>
                          <td>${pos[i.toString()]}</td>
                          <td>N/A</td>
                        </tr>
                          `
  }
  html_prem_info += `</tbody>
  </thead>
  </table>`

  document.querySelector('#prem-table').innerHTML = html_prem_info
}

async function add_pred_table(uname) {
  let supaclient = supabase.createClient('https://srhywkedxssxlsjrholj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaHl3a2VkeHNzeGxzanJob2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzOTYxNjUsImV4cCI6MjA0MTk3MjE2NX0.lUZUAm20JIH3aoUxmyCAcr8l-A3_S3FpTaHuljrwm50')
  let { data , error } = await supaclient.from('Predictions').select('*').eq('username', uname)
  delete data[0]['username']
  html_pred = `<div class="row justify-content-center">
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
  <tbody id="table-body">`
  for (let i = 1; i< 21; i++) {
  //   html_pred += `<span>${i}</span>
  //                 <div data-id=${i} class="list-group-item">${data[0][i.toString()]}</div>`
      html_pred += `<tr>
                      <td>${i}</td>
                      <td class="draggable-item">${data[0][i.toString()]}</td>
                    </tr>`
  }

  html_pred += `</tbody>
              </table>`

  document.querySelector('#pred-table').innerHTML = html_pred
  var tableBody = document.getElementById('table-body');

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

// Function to update the position numbers in the first column
function updatePositions(tableBody) {
  const rows = tableBody.querySelectorAll('tr');
  rows.forEach((row, index) => {
      const positionCell = row.querySelector('td:first-child');
      positionCell.textContent = index + 1; // Update position
  });
}


async function check_new_order() {
  var newOrder = [];
      document.querySelectorAll('#table-body .draggable-item').forEach(function(row) {
        newOrder.push(row.textContent);
      });

  let supaclient = supabase.createClient('https://srhywkedxssxlsjrholj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaHl3a2VkeHNzeGxzanJob2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzOTYxNjUsImV4cCI6MjA0MTk3MjE2NX0.lUZUAm20JIH3aoUxmyCAcr8l-A3_S3FpTaHuljrwm50')


  // newOrder is the teams
  cols = []
  for (let i=1; i<21; i++) {
    cols.push(i.toString())
  }

  const dataToUpdate = cols.reduce((acc, columnName, index) => {
    acc[columnName] = newOrder[index]; // Assign value from the values list
    return acc; // Return the accumulator object
  }, {});

  const { data, error } = await supaclient
  .from('Predictions') // Replace with your actual table name
  .update(dataToUpdate)
  .eq('username', document.getElementById('uname').value); // Match the row to update by username
}

// Need a button for save changes, and a button for cancel changes.
function save_changes() {
  let supaclient = supabase.createClient('https://srhywkedxssxlsjrholj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaHl3a2VkeHNzeGxzanJob2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzOTYxNjUsImV4cCI6MjA0MTk3MjE2NX0.lUZUAm20JIH3aoUxmyCAcr8l-A3_S3FpTaHuljrwm50')
}

function reset_changes() {
  add_pred_table(user)
}

async function add_locked_preds(uname) {
  let supaclient = supabase.createClient('https://srhywkedxssxlsjrholj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaHl3a2VkeHNzeGxzanJob2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzOTYxNjUsImV4cCI6MjA0MTk3MjE2NX0.lUZUAm20JIH3aoUxmyCAcr8l-A3_S3FpTaHuljrwm50')
  let { data , error } = await supaclient.from('Predictions').select('*').eq('username', uname)
  let scores = await fetch_scores()
  console.log("SCORES", scores)
  // fetch_scores().then(result => {
  //   scores = result
  // })
  // console.log("SCORES", scores)
  // console.log("DATA", data[0])
  delete data[0]['username']
  html_pred = `<div class="row justify-content-center">
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
  for (let i = 1; i< 21; i++) {
      html_pred += `<tr>
                      <td>${i}</td>
                      <td>${data[0][i.toString()]}</td>
                      <td>${scores[i.toString()]}</td> 
                    </tr>`
  }
  html_pred += `</tbody>
              </table>`

  document.querySelector('#locked-pred-table').innerHTML = html_pred
}

async function add_prem_table() {
  let supaclient = supabase.createClient('https://srhywkedxssxlsjrholj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaHl3a2VkeHNzeGxzanJob2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzOTYxNjUsImV4cCI6MjA0MTk3MjE2NX0.lUZUAm20JIH3aoUxmyCAcr8l-A3_S3FpTaHuljrwm50')
  let { data , error } = await supaclient.from('Predictions').select('*').eq('username', 'current_standings_prem')
  delete data[0]['username']
  html_pred = `<div class="row justify-content-center">
              <div class="col">
                <h3>Current Standings</h3>
              </div>
            </div>
            <table id="current-prem" class="table table-bordered border-primary">
  <thead>
    <tr>
      <th>Position</th>
      <th>Team</th>
    </tr>
  </thead>
  <tbody id="table-current-pred">`
  for (let i = 1; i< 21; i++) {
      html_pred += `<tr>
                      <td>${i}</td>
                      <td>${data[0][i.toString()]}</td> 
                    </tr>`
  }
  html_pred += `</tbody>
              </table>`

  document.querySelector('#current-prem-table').innerHTML = html_pred
}

async function fetch_scores() {
  let supaclient = supabase.createClient('https://srhywkedxssxlsjrholj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaHl3a2VkeHNzeGxzanJob2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzOTYxNjUsImV4cCI6MjA0MTk3MjE2NX0.lUZUAm20JIH3aoUxmyCAcr8l-A3_S3FpTaHuljrwm50')
  let {data, error}  = await supaclient.from('scores').select('*').eq('username', user)
  console.log(data[0])
  // delete data[0]['username']
  return data[0]
}