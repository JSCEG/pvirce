const STORAGE_KEY = "tanda-mundialista-v1";

const teams = [
  { code: "MEX", name: "México", flag: "🇲🇽", group: "A" },
  { code: "CAN", name: "Canadá", flag: "🇨🇦", group: "A" },
  { code: "USA", name: "Estados Unidos", flag: "🇺🇸", group: "B" },
  { code: "BRA", name: "Brasil", flag: "🇧🇷", group: "C" },
  { code: "ARG", name: "Argentina", flag: "🇦🇷", group: "C" },
  { code: "ESP", name: "España", flag: "🇪🇸", group: "D" },
  { code: "FRA", name: "Francia", flag: "🇫🇷", group: "D" },
  { code: "ENG", name: "Inglaterra", flag: "🇬🇧", group: "E" },
  { code: "GER", name: "Alemania", flag: "🇩🇪", group: "E" },
  { code: "JPN", name: "Japón", flag: "🇯🇵", group: "F" },
  { code: "MAR", name: "Marruecos", flag: "🇲🇦", group: "F" },
  { code: "SUI", name: "Suiza", flag: "🇨🇭", group: "G" }
];

const matches = [
  { id: "m1", date: "2026-06-11", time: "19:00", stage: "Grupos", venue: "Ciudad de México", home: "MEX", away: "CAN" },
  { id: "m2", date: "2026-06-12", time: "20:00", stage: "Grupos", venue: "Los Ángeles", home: "USA", away: "JPN" },
  { id: "m3", date: "2026-06-13", time: "15:00", stage: "Grupos", venue: "Nueva York/Nueva Jersey", home: "BRA", away: "MAR" },
  { id: "m4", date: "2026-06-14", time: "18:00", stage: "Grupos", venue: "Toronto", home: "ARG", away: "SUI" },
  { id: "m5", date: "2026-06-15", time: "14:00", stage: "Grupos", venue: "Guadalajara", home: "ESP", away: "FRA" },
  { id: "m6", date: "2026-06-16", time: "17:00", stage: "Grupos", venue: "Vancouver", home: "ENG", away: "GER" },
  { id: "m7", date: "2026-06-29", time: "19:00", stage: "Dieciseisavos", venue: "Dallas", home: "MEX", away: "JPN" },
  { id: "m8", date: "2026-07-19", time: "16:00", stage: "Final", venue: "Nueva York/Nueva Jersey", home: "BRA", away: "ARG" }
];

const defaultState = {
  settings: { name: "Tanda de la oficina", entryFee: 200 },
  participants: [],
  predictions: {},
  results: {}
};

let state = loadState();

const els = {
  tabs: document.querySelectorAll(".tab"),
  views: document.querySelectorAll(".view"),
  poolName: document.getElementById("poolName"),
  participantCount: document.getElementById("participantCount"),
  totalPot: document.getElementById("totalPot"),
  pendingPredictions: document.getElementById("pendingPredictions"),
  leaderboard: document.getElementById("leaderboard"),
  teamGrid: document.getElementById("teamGrid"),
  matchList: document.getElementById("matchList"),
  stageFilter: document.getElementById("stageFilter"),
  participantForm: document.getElementById("participantForm"),
  participantName: document.getElementById("participantName"),
  participantEmail: document.getElementById("participantEmail"),
  predictionForm: document.getElementById("predictionForm"),
  predictionUser: document.getElementById("predictionUser"),
  predictionMatch: document.getElementById("predictionMatch"),
  predictionHome: document.getElementById("predictionHome"),
  predictionAway: document.getElementById("predictionAway"),
  settingsForm: document.getElementById("settingsForm"),
  settingsName: document.getElementById("settingsName"),
  entryFee: document.getElementById("entryFee"),
  resultForm: document.getElementById("resultForm"),
  resultMatch: document.getElementById("resultMatch"),
  resultHome: document.getElementById("resultHome"),
  resultAway: document.getElementById("resultAway"),
  notifyButton: document.getElementById("notifyButton"),
  seedButton: document.getElementById("seedButton"),
  toast: document.getElementById("toast")
};

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(defaultState);

  try {
    return { ...structuredClone(defaultState), ...JSON.parse(raw) };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function team(code) {
  return teams.find((item) => item.code === code) || { code, name: code, flag: "🏳️", group: "-" };
}

function matchLabel(match) {
  const home = team(match.home);
  const away = team(match.away);
  return `${match.date} · ${home.flag} ${home.name} vs ${away.flag} ${away.name}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(value);
}

function scorePrediction(prediction, result) {
  if (!prediction || !result) return 0;

  const predictedDiff = prediction.home - prediction.away;
  const actualDiff = result.home - result.away;
  if (prediction.home === result.home && prediction.away === result.away) return 5;
  if (Math.sign(predictedDiff) === Math.sign(actualDiff)) return 3;
  if (predictedDiff === actualDiff) return 1;
  return 0;
}

function participantPoints(participantId) {
  return matches.reduce((points, match) => {
    const prediction = state.predictions[participantId]?.[match.id];
    return points + scorePrediction(prediction, state.results[match.id]);
  }, 0);
}

function pendingPredictionCount() {
  return state.participants.reduce((total, participant) => {
    const userPredictions = state.predictions[participant.id] || {};
    return total + matches.filter((match) => !userPredictions[match.id]).length;
  }, 0);
}

function renderSummary() {
  els.poolName.textContent = state.settings.name;
  els.participantCount.textContent = state.participants.length;
  els.totalPot.textContent = formatCurrency(state.participants.length * Number(state.settings.entryFee || 0));
  els.pendingPredictions.textContent = pendingPredictionCount();
  els.settingsName.value = state.settings.name;
  els.entryFee.value = state.settings.entryFee;
}

function renderTeams() {
  els.teamGrid.innerHTML = teams.map((item) => `
    <article class="team-card">
      <span class="flag" aria-hidden="true">${item.flag}</span>
      <div>
        <strong>${item.name}</strong>
        <small>Grupo ${item.group} · ${item.code}</small>
      </div>
    </article>
  `).join("");
}

function renderLeaderboard() {
  const ranked = state.participants
    .map((participant) => ({ ...participant, points: participantPoints(participant.id) }))
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));

  if (!ranked.length) {
    els.leaderboard.innerHTML = `<article class="rank-card"><div class="rank">1</div><div><strong>Sin participantes</strong><small>Registra usuarios o carga la demo.</small></div><span class="points">0 pts</span></article>`;
    return;
  }

  els.leaderboard.innerHTML = ranked.map((participant, index) => `
    <article class="rank-card">
      <div class="rank">${index + 1}</div>
      <div>
        <strong>${participant.name}</strong>
        <small>${participant.email}</small>
      </div>
      <span class="points">${participant.points} pts</span>
    </article>
  `).join("");
}

function renderSelects() {
  const userOptions = state.participants.length
    ? state.participants.map((participant) => `<option value="${participant.id}">${participant.name}</option>`).join("")
    : `<option value="">Registra un participante</option>`;

  const matchOptions = matches.map((match) => `<option value="${match.id}">${matchLabel(match)}</option>`).join("");
  els.predictionUser.innerHTML = userOptions;
  els.predictionMatch.innerHTML = matchOptions;
  els.resultMatch.innerHTML = matchOptions;
}

function renderMatches() {
  const filter = els.stageFilter.value;
  const filtered = matches.filter((match) => filter === "all" || match.stage === filter);

  els.matchList.innerHTML = filtered.map((match) => {
    const home = team(match.home);
    const away = team(match.away);
    const result = state.results[match.id];
    const score = result ? `${result.home} - ${result.away}` : "Pend.";

    return `
      <article class="match-card">
        <div class="match-main">
          <strong>${match.stage}</strong>
          <small>${match.date} · ${match.time} · ${match.venue}</small>
        </div>
        <div class="match-teams">
          <span>${home.flag} ${home.name}</span>
          <b class="score-badge">${score}</b>
          <span>${away.name} ${away.flag}</span>
        </div>
      </article>
    `;
  }).join("");
}

function render() {
  renderSummary();
  renderTeams();
  renderLeaderboard();
  renderSelects();
  renderMatches();
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.setTimeout(() => els.toast.classList.remove("show"), 2600);
}

function notify(message) {
  showToast(message);
  if (Notification.permission === "granted") {
    new Notification("Tanda Mundialista", { body: message });
  }
}

els.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    els.tabs.forEach((item) => item.classList.toggle("active", item === tab));
    els.views.forEach((view) => view.classList.toggle("active", view.id === tab.dataset.view));
  });
});

els.participantForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const participant = {
    id: crypto.randomUUID(),
    name: els.participantName.value.trim(),
    email: els.participantEmail.value.trim().toLowerCase()
  };

  if (state.participants.some((item) => item.email === participant.email)) {
    showToast("Ese correo ya está registrado.");
    return;
  }

  state.participants.push(participant);
  saveState();
  event.target.reset();
  render();
  notify(`${participant.name} quedó registrado en la tanda.`);
});

els.predictionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const participantId = els.predictionUser.value;
  const matchId = els.predictionMatch.value;
  if (!participantId || !matchId) return;

  state.predictions[participantId] = state.predictions[participantId] || {};
  state.predictions[participantId][matchId] = {
    home: Number(els.predictionHome.value),
    away: Number(els.predictionAway.value)
  };

  saveState();
  render();
  notify("Pronóstico guardado.");
});

els.settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.settings.name = els.settingsName.value.trim();
  state.settings.entryFee = Number(els.entryFee.value);
  saveState();
  render();
  notify("Configuración actualizada.");
});

els.resultForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const matchId = els.resultMatch.value;
  state.results[matchId] = {
    home: Number(els.resultHome.value),
    away: Number(els.resultAway.value)
  };

  saveState();
  render();
  notify("Resultado actualizado y tabla recalculada.");
});

els.stageFilter.addEventListener("change", renderMatches);

els.notifyButton.addEventListener("click", async () => {
  if (!("Notification" in window)) {
    showToast("Este navegador no soporta notificaciones.");
    return;
  }

  const permission = await Notification.requestPermission();
  showToast(permission === "granted" ? "Notificaciones activadas." : "Notificaciones no activadas.");
});

els.seedButton.addEventListener("click", () => {
  state.participants = [
    { id: "u1", name: "Ana", email: "ana@oficina.gob.mx" },
    { id: "u2", name: "Luis", email: "luis@oficina.gob.mx" },
    { id: "u3", name: "Mariana", email: "mariana@oficina.gob.mx" }
  ];
  state.predictions = {
    u1: { m1: { home: 2, away: 1 }, m2: { home: 1, away: 1 }, m3: { home: 3, away: 1 } },
    u2: { m1: { home: 1, away: 0 }, m2: { home: 2, away: 0 }, m3: { home: 2, away: 2 } },
    u3: { m1: { home: 0, away: 1 }, m2: { home: 1, away: 2 }, m3: { home: 4, away: 1 } }
  };
  state.results = { m1: { home: 2, away: 1 }, m2: { home: 1, away: 1 } };
  saveState();
  render();
  notify("Datos demo cargados.");
});

render();
