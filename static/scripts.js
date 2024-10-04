document.addEventListener('DOMContentLoaded', () => {
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
        document.getElementById('main-page').classList.remove('d-none');
        retrive_prem_info()
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

async function retrive_prem_info() {
  let supaclient = supabase.createClient('https://srhywkedxssxlsjrholj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaHl3a2VkeHNzeGxzanJob2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzOTYxNjUsImV4cCI6MjA0MTk3MjE2NX0.lUZUAm20JIH3aoUxmyCAcr8l-A3_S3FpTaHuljrwm50')

  let { data , error } = await supaclient.from('Predictions').select('*').eq('username','all_teams_prem')

  let html_prem_info = `<table class="table table-bordered border-primary">
                          <thead>
                            <tr>
                              <th scope="col">#</th>
                              <th scope="col">Team</th>
                              <th scope="col">Last Season</th>
                              <th scope="col">Odds to Win</th>
                            </tr>
                          </thead>
                            <tbody class="table-group-divider">
                              <tr>
                                <th scope="row">1</th>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                              </tr>
                              <tr>
                                <th scope="row">2</th>
                                <td>Jacob</td>
                                <td>Thornton</td>
                                <td>@fat</td>
                              </tr>
                              <tr>
                                <th scope="row">3</th>
                                <td colspan="2">Larry the Bird</td>
                                <td>@twitter</td>
                              </tr>
                            </tbody>
                            </table>`









  // html_prem_info += `</table>`
  document.querySelector('#prem-table').innerHTML = html_prem_info

}
