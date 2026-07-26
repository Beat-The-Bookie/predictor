// Initialize Supabase client
const supabaseUrl = 'https://mqmicljcchdzbfjfnxbx.supabase.co';
const supabaseAnonKey = 'sb_publishable_ctiZ2Z5jmQ-vfF0XM-QHsw_tjuo1uBP';
const supaclient = supabase.createClient(supabaseUrl, supabaseAnonKey);

// DOM element for status
const statusEl = document.getElementById('status');

// delay function
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main logic
async function handleConfirmation() {
  await delay(2000); // slight delay to let Supabase hydrate session

  const { data: sessionData, error: sessionError } = await supaclient.auth.getSession();

  if (sessionError || !sessionData?.session) {
    statusEl.textContent = 'Could not confirm email yet. Please wait a moment and try again or log in manually.';
    return;
  }

  const user = sessionData.session.user;
  const id = user.id;
  const uname = user.user_metadata.username;

  statusEl.textContent = 'Email confirmed! Setting up your account...';

  statusEl.textContent = "Account set-up. Click the button below to return to Beat the Bookie"
  const alertBox = document.getElementById('confirmationAlert');
  alertBox.classList.remove('alert-warning');
  alertBox.classList.add('alert-success');
  alertBox.innerHTML = '✅ Your email has been confirmed and your account is ready!';
  redirectBtn.disabled = false;
}

// return back to the main predictions page
async function returnHome() {
  statusEl.textContent = 'Redirecting...';
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1000);
}

// Start when DOM is loaded
window.addEventListener('DOMContentLoaded', handleConfirmation);