document.addEventListener('DOMContentLoaded', () => {
    console.log('JavaScript is working!');
});

async function check_db() {
    let supaclient = supabase.createClient('https://srhywkedxssxlsjrholj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaHl3a2VkeHNzeGxzanJob2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzOTYxNjUsImV4cCI6MjA0MTk3MjE2NX0.lUZUAm20JIH3aoUxmyCAcr8l-A3_S3FpTaHuljrwm50')
    supaclient
    .from('credentials')
    .select('*')
    .then(({ data, error }) => {
      if (error) {
        console.error('Error fetching credentials:', error.message);
      } else {
        console.log('Credentials:', data);
      }
    });
}

async function fetchCredentials() {
    let supaclient = supabase.createClient('https://srhywkedxssxlsjrholj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaHl3a2VkeHNzeGxzanJob2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzOTYxNjUsImV4cCI6MjA0MTk3MjE2NX0.lUZUAm20JIH3aoUxmyCAcr8l-A3_S3FpTaHuljrwm50')
try {
    const { data, error } = await supaclient.from('credentials').select('*');
    if (error) throw error;
    console.log(data);
} catch (error) {
    console.error(error);
}
}


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
    console.log('found', found)
    if (found == -1) {
      // Message saying username not found
      // Deactivate textboxes while things are happening, loading sign?
    } else {
      console.log("pword", document.getElementById('pword').value)
      let {data, error} = await supaclient.from('credentials').select('passcode')
      if (error) throw error
      console.log('all data', data)
      console.log('pword data', (data[found]))
      req_pword = data[(found)].passcode
      console.log('Req_pword', req_pword)
      if (document.getElementById('pword').value == req_pword) {
        console.log("SUCCESS!")
      } else {
        console.log("FAIL")
      }
    }
    } catch (error) {
    console.log(error)
  }
}




// fetchCredentials()
check_db()