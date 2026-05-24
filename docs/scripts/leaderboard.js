document.addEventListener("DOMContentLoaded", async () => {
  await restoreSession();
  renderLeaderboard();
});

async function renderLeaderboard(sortBy = "total") {
  let { data, error } = await supaclient
    .from("leaderboard")
    .select("*")
    .order(sortBy, { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  // Sort dropdown
  let html = `
    <div class="row justify-content-between align-items-center mb-3">
      <div class="col-12 col-md-auto mb-2 mb-md-0">
        <h1 style="font-weight: bold;">The Leaderboard</h1>
      </div>
      <div class="col-12 col-md-auto d-flex align-items-center">
        <label class="form-label me-2 mb-0">Sort By:</label>
        <select class="form-select" style="width:auto" onchange="renderLeaderboard(this.value)">
          <option value="total" ${sortBy === "total" ? "selected" : ""}>Total</option>
          <option value="prem" ${sortBy === "prem" ? "selected" : ""}>Premier League</option>
          <option value="la_liga" ${sortBy === "la_liga" ? "selected" : ""}>La Liga</option>
          <option value="champ" ${sortBy === "champ" ? "selected" : ""}>Championship</option>
          <option value="seriea" ${sortBy === "seriea" ? "selected" : ""}>Serie A</option>
          <option value="bundes" ${sortBy === "bundes" ? "selected" : ""}>Bundesliga</option>
          <option value="ligue1" ${sortBy === "ligue1" ? "selected" : ""}>Ligue 1</option>
        </select>
      </div>
    </div>
  `;

  // --- Desktop table version ---
  html += `
    <div class="table-responsive d-none d-md-block">
      <table class="table table-bordered border-primary table-sm">
        <thead>
          <tr>
            <th>#</th>
            <th>User</th>
            <th>Prem</th>
            <th>La Liga</th>
            <th>Champ</th>
            <th>Serie A</th>
            <th>Bundes</th>
            <th>Ligue 1</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
  `;

  data.forEach((row, index) => {
    html += `
      <tr>
        <td>${index + 1}</td>
        <td>
          <button class="btn btn-link p-0"
            onclick="viewUserPredictions('${row.username}', '${row.user_id}')">
            ${escapeHTML(row.username)}
          </button>
        </td>
        <td>${row.prem}</td>
        <td>${row.la_liga}</td>
        <td>${row.champ}</td>
        <td>${row.seriea}</td>
        <td>${row.bundes}</td>
        <td>${row.ligue1}</td>
        <td>${row.total}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  html += `<div class="d-block d-md-none">`;

  data.forEach((row, index) => {
    html += `
      <div class="card mb-3">
        <div class="card-body">
          <h5 class="card-title">${index + 1}. ${escapeHTML(row.username)}</h5>
          <p class="card-text mb-1">Premier League: ${row.prem}</p>
          <p class="card-text mb-1">La Liga: ${row.la_liga}</p>
          <p class="card-text mb-1">Championship: ${row.champ}</p>
          <p class="card-text mb-1">Serie A: ${row.seriea}</p>
          <p class="card-text mb-1">Bundesliga: ${row.bundes}</p>
          <p class="card-text mb-1">Ligue 1: ${row.ligue1}</p>
          <p class="card-text fw-bold">Total: ${row.total}</p>
          <button class="btn btn-link p-0" onclick="viewUserPredictions('${row.username}', '${row.user_id}')">
            View Predictions
          </button>
        </div>
      </div>
    `;
  });

  html += `</div>`;

  document.getElementById("leaderboard-container").innerHTML = html;
}