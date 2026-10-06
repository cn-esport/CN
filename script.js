// Navigation & Views Switcher
const navItems = document.querySelectorAll('.nav-item');
const drawerLinks = document.querySelectorAll('.drawer-link');
const views = document.querySelectorAll('.view-section');

const menuBtn = document.getElementById('menu-btn');
const sideDrawer = document.getElementById('side-drawer');
const sideDrawerBackdrop = document.getElementById('side-drawer-backdrop');
const closeDrawerBtn = document.getElementById('close-drawer-btn');

function switchTab(targetId) {
    views.forEach(view => view.classList.remove('active'));
    const targetView = document.getElementById(targetId);
    if (targetView) {
        targetView.classList.add('active');
    }

    navItems.forEach(nav => {
        if (nav.getAttribute('data-target') === targetId) {
            nav.classList.add('active');
        } else {
            nav.classList.remove('active');
        }
    });

    drawerLinks.forEach(link => {
        if (link.getAttribute('data-target') === targetId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

navItems.forEach(item => {
    item.addEventListener('click', () => switchTab(item.getAttribute('data-target')));
});

drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
        switchTab(link.getAttribute('data-target'));
        closeDrawer();
    });
});

function openDrawer() {
    sideDrawer.classList.add('active');
    sideDrawerBackdrop.classList.add('active');
}

function closeDrawer() {
    sideDrawer.classList.remove('active');
    sideDrawerBackdrop.classList.remove('active');
}

if (menuBtn) menuBtn.addEventListener('click', openDrawer);
if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
if (sideDrawerBackdrop) sideDrawerBackdrop.addEventListener('click', closeDrawer);

// APP STATE
let rawTeams = JSON.parse(localStorage.getItem('ccnn_teams')) || [];
let matches = JSON.parse(localStorage.getItem('ccnn_matches')) || [];
let leagueConfig = JSON.parse(localStorage.getItem('ccnn_config')) || {
    maxTeams: 8,
    qualSpots: 4,
    matchesPerTeam: 14
};

let teams = rawTeams.map(t => ({
    name: t.name || 'Team'
}));

// DOM Elements: League
const standingsBody = document.getElementById('standings-body');
const standingsTable = document.querySelector('.standings-table');
const noTeamsMsg = document.getElementById('no-teams-msg');
const leagueLegendsContainer = document.getElementById('league-legends-container');

// DOM Elements: Matches
const matchesList = document.getElementById('matches-list');
const noMatchesMsg = document.getElementById('no-matches-msg');
const openModalBtn = document.getElementById('open-match-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const matchModal = document.getElementById('match-modal');
const createMatchForm = document.getElementById('create-match-form');
const homeTeamSelect = document.getElementById('home-team-select');
const awayTeamSelect = document.getElementById('away-team-select');

// DOM Elements: Score Modal
const scoreModal = document.getElementById('score-modal');
const closeScoreModalBtn = document.getElementById('close-score-modal-btn');
const enterScoreForm = document.getElementById('enter-score-form');
const scoreMatchIndexInput = document.getElementById('score-match-index');
const scoreHomeLabel = document.getElementById('score-home-label');
const scoreAwayLabel = document.getElementById('score-away-label');
const homeScoreInput = document.getElementById('home-score-input');
const awayScoreInput = document.getElementById('away-score-input');

// DOM Elements: Commissioner Dashboard
const addTeamForm = document.getElementById('add-team-form');
const teamNameInput = document.getElementById('team-name-input');
const teamList = document.getElementById('team-list');
const teamCount = document.getElementById('team-count');
const teamMaxDisplay = document.getElementById('team-max-display');
const maxTeamsSelect = document.getElementById('max-teams-select');
const qualZoneSelect = document.getElementById('qual-zone-select');
const matchesPerTeamInput = document.getElementById('matches-per-team-input');
const seasonProgressFill = document.getElementById('season-progress-fill');
const seasonProgressPct = document.getElementById('season-progress-pct');
const progressPlayedCount = document.getElementById('progress-played-count');
const progressTargetCount = document.getElementById('progress-target-count');
const endSeasonBtn = document.getElementById('end-season-btn');
const deleteEverythingBtn = document.getElementById('delete-everything-btn');

// Calculate Standings & Form History
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
        pts: 0,
        form: [] // stores 'W', 'D', 'L'
    }));

    // Evaluate matches chronologically (reversed because new matches unshift to top)
    const chronologicalMatches = [...matches].reverse();

    chronologicalMatches.forEach(m => {
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
                    home.form.push('W');
                    away.l += 1;
                    away.form.push('L');
                } else if (m.homeScore < m.awayScore) {
                    away.w += 1;
                    away.pts += 3;
                    away.form.push('W');
                    home.l += 1;
                    home.form.push('L');
                } else {
                    home.d += 1;
                    home.pts += 1;
                    home.form.push('D');
                    away.d += 1;
                    away.pts += 1;
                    away.form.push('D');
                }

                home.gd = home.gf - home.ga;
                away.gd = away.gf - away.ga;
            }
        }
    });

    return tableData;
}

// Generate Last 5 Circles HTML
function generateFormCirclesHtml(formArray) {
    // Take the most recent 5 results
    const recent = formArray.slice(-5);
    let html = '<div class="form-circles-group">';

    // Render played circles
    recent.forEach(result => {
        if (result === 'W') {
            html += `
                <span class="form-circle form-win" title="Win">
                    <svg viewBox="0 0 12 12"><path d="M2.5 6.2L4.8 8.5L9.5 3.5" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </span>
            `;
        } else if (result === 'D') {
            html += `
                <span class="form-circle form-draw" title="Draw">
                    <svg viewBox="0 0 12 12"><line x1="3" y1="6" x2="9" y2="6" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/></svg>
                </span>
            `;
        } else if (result === 'L') {
            html += `
                <span class="form-circle form-loss" title="Loss">
                    <svg viewBox="0 0 12 12"><line x1="3.5" y1="3.5" x2="8.5" y2="8.5" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/><line x1="8.5" y1="3.5" x2="3.5" y2="8.5" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/></svg>
                </span>
            `;
        }
    });

    // Fill remaining unplayed slots with empty circle outlines up to 5 total
    const unplayedCount = Math.max(0, 5 - recent.length);
    for (let i = 0; i < unplayedCount; i++) {
        html += '<span class="form-circle form-empty" title="Not played"></span>';
    }

    html += '</div>';
    return html;
}

// Render Standings
function renderLeagueTable() {
    if (!standingsBody) return;
    standingsBody.innerHTML = '';

    if (teams.length === 0) {
        if (standingsTable) standingsTable.style.display = 'none';
        if (noTeamsMsg) noTeamsMsg.style.display = 'block';
        if (leagueLegendsContainer) leagueLegendsContainer.style.display = 'none';
        return;
    }

    if (standingsTable) standingsTable.style.display = 'table';
    if (noTeamsMsg) noTeamsMsg.style.display = 'none';
    if (leagueLegendsContainer) leagueLegendsContainer.style.display = 'flex';

    const tableData = calculateStandings();
    tableData.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);

    const qualSpots = Number(leagueConfig.qualSpots) || 4;

    tableData.forEach((team, index) => {
        const row = document.createElement('tr');
        if (index < qualSpots) {
            row.classList.add('top-qual');
        }

        const teamInitial = team.name ? team.name.charAt(0).toUpperCase() : 'T';
        const formHtml = generateFormCirclesHtml(team.form);

        // Exact column order: #, Club, MP, W, D, L, Pts, GF, GA, GD, Last 5
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
            <td>${team.gf}</td>
            <td>${team.ga}</td>
            <td>${team.gd}</td>
            <td class="col-form">${formHtml}</td>
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

            rightColumnHtml = `<span class="match-ft-tag">FT</span>`;
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

// Season Progress
function updateSeasonProgress() {
    const matchesPlayed = matches.filter(m => m.status === 'FT').length;
    const totalTeams = teams.length;
    const matchesPerTeam = Number(leagueConfig.matchesPerTeam) || 14;

    const totalScheduledTarget = totalTeams > 1 ? Math.floor((totalTeams * matchesPerTeam) / 2) : 0;

    let percentage = 0;
    if (totalScheduledTarget > 0) {
        percentage = Math.min(100, Math.round((matchesPlayed / totalScheduledTarget) * 100));
    }

    if (seasonProgressFill) seasonProgressFill.style.width = `${percentage}%`;
    if (seasonProgressPct) seasonProgressPct.textContent = `${percentage}%`;
    if (progressPlayedCount) progressPlayedCount.textContent = matchesPlayed;
    if (progressTargetCount) progressTargetCount.textContent = totalScheduledTarget;
}

// Commissioner Dashboard Render
function renderSettingsDashboard() {
    if (!teamList) return;
    teamList.innerHTML = '';

    const max = Number(leagueConfig.maxTeams) || 8;
    teamCount.textContent = teams.length;
    teamMaxDisplay.textContent = max;
    maxTeamsSelect.value = max;
    qualZoneSelect.value = leagueConfig.qualSpots || 4;
    matchesPerTeamInput.value = leagueConfig.matchesPerTeam || 14;

    teams.forEach((team, index) => {
        const li = document.createElement('li');
        li.className = 'team-list-item';
        li.innerHTML = `
            <div class="team-item-left">
                <span>${index + 1}.</span>
                <strong>${escapeHtml(team.name)}</strong>
            </div>
            <div class="team-item-actions">
                <button class="btn-item-action btn-edit" onclick="renameTeam(${index})">Rename</button>
                <button class="btn-item-action btn-del" onclick="deleteTeam(${index})">Delete</button>
            </div>
        `;
        teamList.appendChild(li);
    });

    updateSeasonProgress();
}

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

function saveAndRefresh() {
    localStorage.setItem('ccnn_teams', JSON.stringify(teams));
    localStorage.setItem('ccnn_matches', JSON.stringify(matches));
    localStorage.setItem('ccnn_config', JSON.stringify(leagueConfig));

    renderLeagueTable();
    renderMatches();
    renderSettingsDashboard();
    updateTeamSelects();
}

// Add Team
if (addTeamForm) {
    addTeamForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = teamNameInput.value.trim();
        if (!name) return;

        const max = Number(leagueConfig.maxTeams) || 8;
        if (teams.length >= max) {
            alert(`Maximum limit of ${max} teams reached. Increase capacity in settings if needed.`);
            return;
        }

        teams.push({ name: name });
        teamNameInput.value = '';
        saveAndRefresh();
    });
}

// Rename Team
window.renameTeam = function(index) {
    const currentName = teams[index].name;
    const newName = prompt('Enter new team name:', currentName);
    if (newName && newName.trim() && newName.trim() !== currentName) {
        const cleanName = newName.trim();
        matches.forEach(m => {
            if (m.home === currentName) m.home = cleanName;
            if (m.away === currentName) m.away = cleanName;
        });
        teams[index].name = cleanName;
        saveAndRefresh();
    }
};

// Delete Team
window.deleteTeam = function(index) {
    const target = teams[index].name;
    if (confirm(`Delete team "${target}"? All their matches will also be removed.`)) {
        teams.splice(index, 1);
        matches = matches.filter(m => m.home !== target && m.away !== target);
        saveAndRefresh();
    }
};

// Config changes
if (maxTeamsSelect) {
    maxTeamsSelect.addEventListener('change', (e) => {
        const newMax = parseInt(e.target.value, 10);
        if (teams.length > newMax) {
            alert(`You currently have ${teams.length} teams. Please delete teams down to ${newMax} before reducing capacity.`);
            maxTeamsSelect.value = leagueConfig.maxTeams;
            return;
        }
        leagueConfig.maxTeams = newMax;
        saveAndRefresh();
    });
}

if (qualZoneSelect) {
    qualZoneSelect.addEventListener('change', (e) => {
        leagueConfig.qualSpots = parseInt(e.target.value, 10);
        saveAndRefresh();
    });
}

if (matchesPerTeamInput) {
    matchesPerTeamInput.addEventListener('change', (e) => {
        const val = parseInt(e.target.value, 10);
        if (val >= 1 && val <= 100) {
            leagueConfig.matchesPerTeam = val;
            saveAndRefresh();
        }
    });
}

// Reset Season
if (endSeasonBtn) {
    endSeasonBtn.addEventListener('click', () => {
        const confirmed = confirm(
            'Are you sure you want to End the Season?\n\n' +
            'This will clear all match results and reset points to 0. Your team names will be preserved.'
        );
        if (confirmed) {
            matches = [];
            saveAndRefresh();
            alert('Season has ended. Match data and standings have been reset.');
        }
    });
}

// Delete Everything
if (deleteEverythingBtn) {
    deleteEverythingBtn.addEventListener('click', () => {
        const confirmed = confirm(
            '⚠️ WARNING: Delete Everything?\n\n' +
            'This will permanently delete all teams, matches, scores, and commissioner settings.'
        );
        if (confirmed) {
            localStorage.removeItem('ccnn_teams');
            localStorage.removeItem('ccnn_matches');
            localStorage.removeItem('ccnn_config');

            teams = [];
            matches = [];
            leagueConfig = { maxTeams: 8, qualSpots: 4, matchesPerTeam: 14 };

            saveAndRefresh();
            alert('All data has been cleared.');
        }
    });
}

// Match Scheduling Modal
if (openModalBtn) {
    openModalBtn.addEventListener('click', () => {
        if (teams.length < 2) {
            alert('You need at least 2 teams to schedule a match.');
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

// Score Input Modal
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
