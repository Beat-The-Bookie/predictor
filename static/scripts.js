// document.addEventListener('DOMContentLoaded', () => {
//     console.log('JavaScript is working!');
// });

async function login() {
  let supaclient = supabase.createClient('https://srhywkedxssxlsjrholj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaHl3a2VkeHNzeGxzanJob2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzOTYxNjUsImV4cCI6MjA0MTk3MjE2NX0.lUZUAm20JIH3aoUxmyCAcr8l-A3_S3FpTaHuljrwm50')

  try {
    let { data , error } = await supaclient.from('credentials').select('username')

    if (error) throw error
    regs_unames = []

    for ((uname) in (data)) {
      regs_unames.push(data[uname].username)
    }
    let found = regs_unames.indexOf(document.getElementById('uname').value)

    if (found == -1) {
      // Message saying username not found
      // Deactivate textboxes while things are happening, loading sign?
    } else {
      let {data, error} = await supaclient.from('credentials').select('passcode')

      if (error) throw error
      req_pword = data[(found)].passcode

      if (document.getElementById('pword').value == req_pword) {
        // Log in
        console.log("LOGGED IN")
        hide_stuff()
      } else {
        console.log("FAIL")
        // Empty pword textbox, error message
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

  for ((uname) in (data)) {
    regs_unames.push(data[uname].username)
  }
  let found = regs_unames.indexOf(document.getElementById('reg-uname').value)
  if (found == -1) {
    console.log("REG")
    // passcode = assign_passcode()
    // Register


  const { data, error } = await supaclient
  .from('credentials')
  .insert([
    { username: (document.getElementById('reg-uname').value), passcode: createPasscode() },
  ])
  .select()
  } else {
    console.log("NAH")
    // Already in use
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

function hide_stuff() {
  document.querySelector('#login-form').classList.add('d-none');
  document.getElementById('reg-form').classList.add('d-none');
}