// Navigation & Views Switcher
const navItems = document.querySelectorAll('.nav-item');
const drawerLinks = document.querySelectorAll('.drawer-link');
const views = document.querySelectorAll('.view-section');

// Side Drawer Elements
const menuBtn = document.getElementById('menu-btn');
const sideDrawer = document.getElementById('side-drawer');
const sideDrawerBackdrop = document.getElementById('side-drawer-backdrop');
const closeDrawerBtn = document.getElementById('close-drawer-btn');

function switchTab(targetId) {
    // Update view visibility
    views.forEach(view => view.classList.remove('active'));
    const targetView = document.getElementById(targetId);
    if (targetView) {
        targetView.classList.add('active');
    }

    // Update bottom nav active state
    navItems.forEach(nav => {
        if (nav.getAttribute('data-target') === targetId) {
            nav.classList.add('active');
        } else {
            nav.classList.remove('active');
        }
    });

    // Update side drawer links active state
    drawerLinks.forEach(link => {
        if (link.getAttribute('data-target') === targetId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Bottom nav clicks
navItems.forEach(item => {
    item.addEventListener('click', () => {
        const targetId = item.getAttribute('data-target');
        switchTab(targetId);
    });
});

// Drawer link clicks
drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
        const targetId = link.getAttribute('data-target');
        switchTab(targetId);
        closeDrawer();
    });
});

// Drawer Open / Close Handlers
function openDrawer() {
    sideDrawer.classList.add('active');
    sideDrawerBackdrop.classList.add('active');
}

function closeDrawer() {
    sideDrawer.classList.remove('active');
    sideDrawerBackdrop.classList.remove('active');
}

if (menuBtn) {
    menuBtn.addEventListener('click', openDrawer);
}

if (closeDrawerBtn) {
    closeDrawerBtn.addEventListener('click', closeDrawer);
}

if (sideDrawerBackdrop) {
    sideDrawerBackdrop.addEventListener('click', closeDrawer);
}

// Teams & Matches State
const MAX_TEAMS = 8;
let rawTeams = JSON.parse(localStorage.getItem('ccnn_teams')) || [];
let matches = JSON.parse(localStorage.getItem('ccnn_matches')) || [];

let teams = rawTeams.map(t => ({
    name: t.name || 'Team'
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

// Score Modal Elements
const scoreModal = document.getElementById('score-modal');
const closeScoreModalBtn = document.getElementById('close-score-modal-btn');
const enterScoreForm = document.getElementById('enter-score-form');
const scoreMatchIndexInput = document.getElementById('score-match-index');
const scoreHomeLabel = document.getElementById('score-home-label');
const scoreAwayLabel = document.getElementById('score-away-label');
const homeScoreInput = document.getElementById('home-score-input');
const awayScoreInput = document.getElementById('away-score-input');

// Standings Calculator
function calculateStandings() {
    const tableData = teams.map(team => ({
        name: team.name,
        mp: 0,
        w: 0,
        d: 0,
        l: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        pts: 0
    }));

    matches.forEach(m => {
        if (m.status === 'FT') {
            const home = tableData.find(t => t.name === m.home);
            const away = tableData.find(t => t.name === m.away);

            if (home && away) {
                home.mp += 1;
                away.mp += 1;
                home.gf += m.homeScore;
                home.ga += m.awayScore;
                away.gf += m.awayScore;
                away.ga += m.homeScore;

                if (m.homeScore > m.awayScore) {
                    home.w += 1;
                    home.pts += 3;
                    away.l += 1;
                } else if (m.homeScore < m.awayScore) {
                    away.w += 1;
                    away.pts += 3;
                    home.l += 1;
                } else {
                    home.d += 1;
                    home.pts += 1;
                    away.d += 1;
                    away.pts += 1;
                }

                home.gd = home.gf - home.ga;
                away.gd = away.gf - away.ga;
            }
        }
    });

    return tableData;
}

// Standings Render with Logo and GD at end
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

    const tableData = calculateStandings();
    tableData.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);

    tableData.forEach((team, index) => {
        const row = document.createElement('tr');
        if (index < 4) row.classList.add('top-four');
        const teamInitial = team.name ? team.name.charAt(0).toUpperCase() : 'T';

        row.innerHTML = `
            <td class="col-pos">${index + 1}</td>
            <td class="col-team">
                <div class="table-team-cell">
                    <span class="table-team-logo">${escapeHtml(teamInitial)}</span>
                    <span>${escapeHtml(team.name)}</span>
                </div>
            </td>
            <td>${team.mp}</td>
            <td>${team.w}</td>
            <td>${team.d}</td>
            <td>${team.l}</td>
            <td class="col-pts">${team.pts}</td>
            <td class="col-gd">${team.gd}</td>
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
        const isFinished = match.status === 'FT';

        let homeScoreHtml = '';
        let awayScoreHtml = '';
        let rightColumnHtml = '';

        if (isFinished) {
            const homeWon = match.homeScore > match.awayScore;
            const awayWon = match.awayScore > match.homeScore;

            homeScoreHtml = `
                <div class="team-score-slot">
                    <span>${match.homeScore}</span>
                    ${homeWon ? '<span class="winner-arrow">&#9664;</span>' : ''}
                </div>
            `;
            awayScoreHtml = `
                <div class="team-score-slot">
                    <span>${match.awayScore}</span>
                    ${awayWon ? '<span class="winner-arrow">&#9664;</span>' : ''}
                </div>
            `;

            rightColumnHtml = `
                <span class="match-ft-tag">FT</span>
            `;
        } else {
            rightColumnHtml = `
                <span class="match-vs-tag">VS</span>
                <span class="click-hint">Add Score</span>
            `;
        }

        const card = document.createElement('div');
        card.className = 'match-card';
        card.innerHTML = `
            <div class="match-teams">
                <div class="team-row">
                    <div class="team-info">
                        <span class="team-badge-circle">${escapeHtml(homeInitial)}</span>
                        <span class="team-name">${escapeHtml(match.home)}</span>
                    </div>
                    ${homeScoreHtml}
                </div>
                <div class="team-row">
                    <div class="team-info">
                        <span class="team-badge-circle">${escapeHtml(awayInitial)}</span>
                        <span class="team-name">${escapeHtml(match.away)}</span>
                    </div>
                    ${awayScoreHtml}
                </div>
            </div>
            <div class="match-divider"></div>
            <div class="match-action-col" onclick="openScoreModal(${index})">
                ${rightColumnHtml}
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

        teams.push({ name: name });
        teamNameInput.value = '';
        saveAndRefresh();
    });
}

window.deleteTeam = function(index) {
    const deleted = teams.splice(index, 1)[0];
    matches = matches.filter(m => m.home !== deleted.name && m.away !== deleted.name);
    saveAndRefresh();
};

// Add Match Modal Open / Close
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

// Create Match (adds new matches to top using unshift)
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

        matches.unshift({
            home: home,
            away: away,
            status: 'SCHEDULED',
            homeScore: 0,
            awayScore: 0
        });

        matchModal.classList.remove('active');
        createMatchForm.reset();
        saveAndRefresh();
    });
}

// Open Score Modal
window.openScoreModal = function(index) {
    const match = matches[index];
    if (!match) return;

    scoreMatchIndexInput.value = index;
    scoreHomeLabel.textContent = match.home;
    scoreAwayLabel.textContent = match.away;
    homeScoreInput.value = match.status === 'FT' ? match.homeScore : '';
    awayScoreInput.value = match.status === 'FT' ? match.awayScore : '';

    scoreModal.classList.add('active');
};

if (closeScoreModalBtn) {
    closeScoreModalBtn.addEventListener('click', () => {
        scoreModal.classList.remove('active');
    });
}

// Submit Score & Recalculate
if (enterScoreForm) {
    enterScoreForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const index = parseInt(scoreMatchIndexInput.value, 10);
        const homeScore = parseInt(homeScoreInput.value, 10);
        const awayScore = parseInt(awayScoreInput.value, 10);

        if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
            alert('Please enter valid scores.');
            return;
        }

        matches[index].homeScore = homeScore;
        matches[index].awayScore = awayScore;
        matches[index].status = 'FT';

        scoreModal.classList.remove('active');
        saveAndRefresh();
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initial Run
saveAndRefresh();
