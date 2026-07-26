async function loadProfileSettings() {
  try {
    const {
      data: { session },
    } = await supaclient.auth.getSession();

    if (!session?.user) {
      window.location.href = "auth.html";
      return;
    }

    const user = session.user;

    // Display account information
    document.getElementById("username-display").textContent =
      user.user_metadata?.username || "-";
    document.getElementById("email-display").textContent = user.email || "-";

    // Fetch user preferences from public.user_permissions table
    const { data: permissions, error } = await supaclient
      .from("user_permissions")
      .select("deadline_reminders, season_overview")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user permissions:", error);
      // If no record exists yet, show unchecked boxes (user just signed up)
      document.getElementById("setting-deadline-reminders").checked = false;
      document.getElementById("setting-season-overview").checked = false;
      return;
    }

    // Set checkbox values from database
    if (permissions) {
      document.getElementById("setting-deadline-reminders").checked =
        permissions.deadline_reminders || false;
      document.getElementById("setting-season-overview").checked =
        permissions.season_overview || false;
    }
  } catch (error) {
    console.error("Error loading profile settings:", error);
    alert("Error loading your preferences. Please try again.");
  }
}

async function updateEmailPreferences() {
  try {
    const {
      data: { session },
    } = await supaclient.auth.getSession();

    if (!session?.user) {
      alert("You must be logged in to update preferences.");
      return;
    }

    const deadlineReminders = document.getElementById(
      "setting-deadline-reminders"
    ).checked;
    const seasonOverview = document.getElementById(
      "setting-season-overview"
    ).checked;

    const userId = session.user.id;

    // Update user preferences in public.user_permissions table
    const { data, error } = await supaclient
      .from("user_permissions")
      .update({
        deadline_reminders: deadlineReminders,
        season_overview: seasonOverview,
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating preferences:", error);
      alert("Error updating preferences: " + error.message);
      return;
    }

    alert("Preferences updated successfully!");
  } catch (error) {
    console.error("Error in updateEmailPreferences:", error);
    alert("Error updating preferences. Please try again.");
  }
}

async function logout() {
  const { error } = await supaclient.auth.signOut();

  if (error) {
    alert("Error logging out: " + error.message);
    return;
  }

  window.location.href = "auth.html";
}
