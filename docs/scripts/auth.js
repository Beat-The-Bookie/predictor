function getSiteBaseUrl() {
  return window.location.href.replace(/\/[^/]*$/, "/");
}

function getRedirectUrl(page) {
  return `${getSiteBaseUrl()}${page}`;
}

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("pword").value;

  if (!email || !password) {
    alert("Please enter your email and password.");
    return;
  }

  const { data, error } = await supaclient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert("Login failed: " + error.message);
    document.getElementById("pword").value = "";
    return;
  }

  const user = data.user;

  if (!user.email_confirmed_at) {
    alert("Please confirm your email before logging in.");
    return;
  }

  window.location.href = "index.html";
}

async function register() {
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-pword").value;
  const username = document.getElementById("reg-uname").value.trim();

  if (!email || !password || !username) {
    alert("Please fill in all fields.");
    return;
  }

  const deadlineReminders = document.getElementById("reg-deadline-reminders").checked;
  const seasonOverview = document.getElementById("reg-season-overview").checked;

  const referralCode = Math.random().toString(36).substring(2, 10);

  const { data, error } = await supaclient.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        deadline_reminders: deadlineReminders,
        season_overview: seasonOverview,
        referral_code: referralCode,
      },
      emailRedirectTo: getRedirectUrl("confirm.html"),
    },
  });

  if (error) {
    alert("Registration failed: " + error.message);
    return;
  }

  alert(
    "Registration successful! Please check your inbox for the confirmation email from Supabase to confirm your account."
  );

  changeLoginTab("login");
}

async function sendPasswordReset() {
  const email = document.getElementById("resetEmail").value.trim();

  if (!email) {
    alert("Please enter your email address.");
    return;
  }

  const { error } = await supaclient.auth.resetPasswordForEmail(email, {
    redirectTo: getRedirectUrl("auth.html"),
  });

  if (error) {
    alert("Error sending reset email: " + error.message);
    return;
  }

  alert("Password reset email sent.");
}

function changeLoginTab(tab) {
  const loginTab = document.getElementById("login-tab");
  const registerTab = document.getElementById("register-tab");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  if (tab === "login") {
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
    loginForm.classList.add("show", "active");
    registerForm.classList.remove("show", "active");
  } else {
    registerTab.classList.add("active");
    loginTab.classList.remove("active");
    registerForm.classList.add("show", "active");
    loginForm.classList.remove("show", "active");
  }
}

function togglePassword(id, button) {
  const input = document.getElementById(id);
  if (input.type === "password") {
    input.type = "text";
    button.textContent = "Hide";
  } else {
    input.type = "password";
    button.textContent = "Show";
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
