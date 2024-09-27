document.addEventListener('DOMContentLoaded', () => {
  // reg_pcode = document.getElementById("reg-pcode")
  // reg_pcode.textContent = "Hello"
  });

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

  for ((uname) in (data)) {
    regs_unames.push(data[uname].username)
  }
  let found = regs_unames.indexOf(document.getElementById('reg-uname').value)
  if (found == -1) {
    console.log("REG")
    const { data, error } = await supaclient
    .from('credentials')
    .insert([
    { username: (document.getElementById('reg-uname').value), passcode: createPasscode() },
    ])
    .select()
  } else {
    document.getElementById("reg-pcode").textContent = ("Unsuccessful. Username already in use.")
  }
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

function hide_stuff() {
  document.getElementById('login-page').classList.add('d-none');
  // document.getElementById('reg-form').classList.add('d-none');
}