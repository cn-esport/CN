// Navigation Switcher
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view-section');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(nav => nav.classList.remove('active'));
        views.forEach(view => view.classList.remove('active'));

        item.classList.add('active');
        const targetId = item.getAttribute('data-target');
        const targetView = document.getElementById(targetId);
        if (targetView) {
            targetView.classList.add('active');
        }
    });
});

// Teams & Matches State
const MAX_TEAMS = 8;
let rawTeams = JSON.parse(localStorage.getItem('ccnn_teams')) || [];
let matches = JSON.parse(localStorage.getItem('ccnn_matches')) || [];

let teams = rawTeams.map(t => ({
    name: t.name || 'Team',
    mp: Number(t.mp) || 0,
    w: Number(t.w) || 0,
    d: Number(t.d) || 0,
    l: Number(t.l) || 0,
    gd: Number(t.gd) || 0,
    pts: Number(t.pts) || 0,
    gf: Number(t.gf) || 0,
    ga: Number(t.ga) || 0
}));

// DOM Elements
const standingsBody = document.getElementById('standings-body');
const standingsTable = document.querySelector('.standings-table');
const noTeamsMsg = document.getElementById('no-teams-msg');
const addTeamForm = document.getElementById('add-team-form');
const teamNameInput = document.getElementById('team-name-input');
const teamList = document.getElementById('team-list');
const teamCount = document.getElementById('team-count');

const matchesList = document.getElementById('matches-list');
const noMatchesMsg = document.getElementById('no-matches-msg');
const openModalBtn = document.getElementById('open-match-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const matchModal = document.getElementById('match-modal');
const createMatchForm = document.getElementById('create-match-form');
const homeTeamSelect = document.getElementById('home-team-select');
const awayTeamSelect = document.getElementById('away-team-select');

// Standings Render
function renderLeagueTable() {
    if (!standingsBody) return;
    standingsBody.innerHTML = '';

    if (teams.length === 0) {
        if (standingsTable) standingsTable.style.display = 'none';
        if (noTeamsMsg) noTeamsMsg.style.display = 'block';
        return;
    }

    if (standingsTable) standingsTable.style.display = 'table';
    if (noTeamsMsg) noTeamsMsg.style.display = 'none';

    teams.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);

    teams.forEach((team, index) => {
        const row = document.createElement('tr');
        if (index < 4) row.classList.add('top-four');

        row.innerHTML = `
            <td class="col-pos">${index + 1}</td>
            <td class="col-team">${escapeHtml(team.name)}</td>
            <td>${team.mp}</td>
            <td>${team.w}</td>
            <td>${team.d}</td>
            <td>${team.l}</td>
            <td>${team.gd}</td>
            <td class="col-pts">${team.pts}</td>
            <td>${team.gf}</td>
            <td>${team.ga}</td>
        `;
        standingsBody.appendChild(row);
    });
}

// Matches Render
function renderMatches() {
    if (!matchesList) return;
    matchesList.innerHTML = '';

    if (matches.length === 0) {
        if (noMatchesMsg) noMatchesMsg.style.display = 'block';
        return;
    }
    if (noMatchesMsg) noMatchesMsg.style.display = 'none';

    matches.forEach((match, index) => {
        const homeInitial = match.home ? match.home.charAt(0).toUpperCase() : 'H';
        const awayInitial = match.away ? match.away.charAt(0).toUpperCase() : 'A';

        const card = document.createElement('div');
        card.className = 'match-card';
        card.innerHTML = `
            <div class="match-teams">
                <div class="team-row">
                    <span class="team-badge-circle">${escapeHtml(homeInitial)}</span>
                    <span class="team-name">${escapeHtml(match.home)}</span>
                </div>
                <div class="team-row">
                    <span class="team-badge-circle">${escapeHtml(awayInitial)}</span>
                    <span class="team-name">${escapeHtml(match.away)}</span>
                </div>
            </div>
            <div class="match-divider"></div>
            <div class="match-action-col">
                <span class="match-vs-tag">VS</span>
                <button class="btn-delete-match" onclick="deleteMatch(${index})">Remove</button>
            </div>
        `;
        matchesList.appendChild(card);
    });
}

// Modal Team Options
function updateTeamSelects() {
    if (!homeTeamSelect || !awayTeamSelect) return;
    homeTeamSelect.innerHTML = '<option value="" disabled selected>Select Home Team</option>';
    awayTeamSelect.innerHTML = '<option value="" disabled selected>Select Away Team</option>';

    teams.forEach(team => {
        const opt1 = document.createElement('option');
        opt1.value = team.name;
        opt1.textContent = team.name;
        homeTeamSelect.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = team.name;
        opt2.textContent = team.name;
        awayTeamSelect.appendChild(opt2);
    });
}

// Settings Render
function renderSettingsList() {
    if (!teamList || !teamCount) return;
    teamList.innerHTML = '';
    teamCount.textContent = teams.length;

    teams.forEach((team, index) => {
        const li = document.createElement('li');
        li.className = 'team-list-item';
        li.innerHTML = `
            <span>${index + 1}. ${escapeHtml(team.name)}</span>
            <button class="btn-del" onclick="deleteTeam(${index})">Remove</button>
        `;
        teamList.appendChild(li);
    });
}

function saveAndRefresh() {
    localStorage.setItem('ccnn_teams', JSON.stringify(teams));
    localStorage.setItem('ccnn_matches', JSON.stringify(matches));
    renderLeagueTable();
    renderMatches();
    renderSettingsList();
    updateTeamSelects();
}

// Add Team
if (addTeamForm) {
    addTeamForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = teamNameInput.value.trim();
        if (!name) return;

        if (teams.length >= MAX_TEAMS) {
            alert('Maximum of 8 teams reached.');
            return;
        }

        teams.push({ name: name, mp: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0, gf: 0, ga: 0 });
        teamNameInput.value = '';
        saveAndRefresh();
    });
}

window.deleteTeam = function(index) {
    const deleted = teams.splice(index, 1)[0];
    matches = matches.filter(m => m.home !== deleted.name && m.away !== deleted.name);
    saveAndRefresh();
};

// Modal Open / Close
if (openModalBtn) {
    openModalBtn.addEventListener('click', () => {
        if (teams.length < 2) {
            alert('You need at least 2 teams in Settings to schedule a match.');
            return;
        }
        matchModal.classList.add('active');
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        matchModal.classList.remove('active');
    });
}

// Create Match
if (createMatchForm) {
    createMatchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const home = homeTeamSelect.value;
        const away = awayTeamSelect.value;

        if (!home || !away) return;
        if (home === away) {
            alert('Please select two different teams.');
            return;
        }

        matches.push({ home: home, away: away });
        matchModal.classList.remove('active');
        createMatchForm.reset();
        saveAndRefresh();
    });
}

window.deleteMatch = function(index) {
    matches.splice(index, 1);
    saveAndRefresh();
};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initial Run
saveAndRefresh();
