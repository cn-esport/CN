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
let uclTeams = JSON.parse(localStorage.getItem('ccnn_ucl_teams')) || [];
let matches = JSON.parse(localStorage.getItem('ccnn_matches')) || [];
let managers = JSON.parse(localStorage.getItem('ccnn_managers')) || {};
let playStyles = JSON.parse(localStorage.getItem('ccnn_playstyles')) || {};
let leagueConfig = JSON.parse(localStorage.getItem('ccnn_config')) || {
    maxTeams: 8,
    qualSpots: 4,
    matchesPerTeam: 14,
    darkMode: false
};

let teams = rawTeams.map(t => ({
    name: t.name || 'Team',
    logo: t.logo || ''
}));

// Dark Mode Toggle
const darkModeToggle = document.getElementById('dark-mode-toggle');
function applyTheme(isDark) {
    if (isDark) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    if (darkModeToggle) darkModeToggle.checked = isDark;
}
applyTheme(leagueConfig.darkMode);

if (darkModeToggle) {
    darkModeToggle.addEventListener('change', (e) => {
        leagueConfig.darkMode = e.target.checked;
        applyTheme(leagueConfig.darkMode);
        saveAndRefresh();
    });
}

// DOM Elements: League
const standingsBody = document.getElementById('standings-body');
const standingsTable = document.querySelector('#league-view .standings-table');
const noTeamsMsg = document.getElementById('no-teams-msg');
const leagueLegendsContainer = document.getElementById('league-legends-container');

// DOM Elements: UCL
const uclStandingsBody = document.getElementById('ucl-standings-body');
const uclStandingsTable = document.querySelector('#ucl-view .standings-table');
const noUclTeamsMsg = document.getElementById('no-ucl-teams-msg');

// DOM Elements: Matches
const matchesList = document.getElementById('matches-list');
const noMatchesMsg = document.getElementById('no-matches-msg');
const openModalBtn = document.getElementById('open-match-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const matchModal = document.getElementById('match-modal');
const createMatchForm = document.getElementById('create-match-form');
const matchTypeSelect = document.getElementById('match-type-select');
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

// DOM Elements: Managers
const managersList = document.getElementById('managers-list');
const noManagersMsg = document.getElementById('no-managers-msg');

// DOM Elements: Commissioner Dashboard
const addTeamForm = document.getElementById('add-team-form');
const teamNameInput = document.getElementById('team-name-input');
const teamLogoUrlInput = document.getElementById('team-logo-url-input');
const teamLogoFileInput = document.getElementById('team-logo-file-input');
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

// Logo Rendering Helper
function getTeamLogoHtml(teamName, customLogo = '') {
    const cleanName = teamName || 'Team';
    const initial = cleanName.charAt(0).toUpperCase();

    // Find saved team logo if customLogo not passed
    if (!customLogo) {
        const found = teams.find(t => t.name === cleanName) || uclTeams.find(u => u.name === cleanName);
        if (found && found.logo) {
            customLogo = found.logo;
        }
    }

    if (customLogo) {
        return `<img src="${customLogo}" alt="${escapeHtml(cleanName)}" class="table-team-logo" onerror="this.outerHTML='<span class=\\'table-team-logo\\'>${escapeHtml(initial)}</span>'">`;
    }
    return `<span class="table-team-logo">${escapeHtml(initial)}</span>`;
}

function getCardBadgeHtml(teamName) {
    const cleanName = teamName || 'Team';
    const initial = cleanName.charAt(0).toUpperCase();
    const found = teams.find(t => t.name === cleanName) || uclTeams.find(u => u.name === cleanName);

    if (found && found.logo) {
        return `<img src="${found.logo}" alt="${escapeHtml(cleanName)}" class="team-badge-circle" onerror="this.outerHTML='<span class=\\'team-badge-circle\\'>${escapeHtml(initial)}</span>'">`;
    }
    return `<span class="team-badge-circle">${escapeHtml(initial)}</span>`;
}

// Standings Calculator for 'League' or 'UCL'
function calculateTableStats(teamArray, tournamentType) {
    const tableData = teamArray.map(team => ({
        name: team.name,
        logo: team.logo || '',
        mp: 0,
        w: 0,
        d: 0,
        l: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        pts: 0,
        form: []
    }));

    const chronologicalMatches = [...matches].reverse().filter(m => (m.type || 'League') === tournamentType);

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

    tableData.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
    return tableData;
}

// Generate Last 5 Form Circles HTML
function generateFormCirclesHtml(formArray) {
    const recent = formArray.slice(-5);
    let html = '<div class="form-circles-group">';

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

    const unplayedCount = Math.max(0, 5 - recent.length);
    for (let i = 0; i < unplayedCount; i++) {
        html += '<span class="form-circle form-empty" title="Not played"></span>';
    }

    html += '</div>';
    return html;
}

// Render League Standings (With Last 5 Column)
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

    const tableData = calculateTableStats(teams, 'League');
    const qualSpots = Number(leagueConfig.qualSpots) || 4;

    tableData.forEach((team, index) => {
        const row = document.createElement('tr');
        if (index < qualSpots) {
            row.classList.add('top-qual');
        }

        const logoHtml = getTeamLogoHtml(team.name, team.logo);
        const formHtml = generateFormCirclesHtml(team.form);

        row.innerHTML = `
            <td class="col-pos">${index + 1}</td>
            <td class="col-team">
                <div class="table-team-cell">
                    ${logoHtml}
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

// Render UCL Standings (NO Last 5 Column)
function renderUclTable() {
    if (!uclStandingsBody) return;
    uclStandingsBody.innerHTML = '';

    if (uclTeams.length === 0) {
        if (uclStandingsTable) uclStandingsTable.style.display = 'none';
        if (noUclTeamsMsg) noUclTeamsMsg.style.display = 'block';
        return;
    }

    if (uclStandingsTable) uclStandingsTable.style.display = 'table';
    if (noUclTeamsMsg) noUclTeamsMsg.style.display = 'none';

    const tableData = calculateTableStats(uclTeams, 'UCL');

    tableData.forEach((team, index) => {
        const row = document.createElement('tr');
        const logoHtml = getTeamLogoHtml(team.name, team.logo);

        row.innerHTML = `
            <td class="col-pos">${index + 1}</td>
            <td class="col-team">
                <div class="table-team-cell">
                    ${logoHtml}
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
        `;
        uclStandingsBody.appendChild(row);
    });
}

// Render Matches
function renderMatches() {
    if (!matchesList) return;
    matchesList.innerHTML = '';

    if (matches.length === 0) {
        if (noMatchesMsg) noMatchesMsg.style.display = 'block';
        return;
    }
    if (noMatchesMsg) noMatchesMsg.style.display = 'none';

    matches.forEach((match, index) => {
        const homeBadgeHtml = getCardBadgeHtml(match.home);
        const awayBadgeHtml = getCardBadgeHtml(match.away);
        const isFinished = match.status === 'FT';
        const matchType = match.type || 'League';

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
            <span class="match-type-badge">${escapeHtml(matchType)}</span>
            <div class="match-teams">
                <div class="team-row">
                    <div class="team-info">
                        ${homeBadgeHtml}
                        <span class="team-name">${escapeHtml(match.home)}</span>
                    </div>
                    ${homeScoreHtml}
                </div>
                <div class="team-row">
                    <div class="team-info">
                        ${awayBadgeHtml}
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

// Render Managers Tab with Play Style & Queue Count
function renderManagers() {
    if (!managersList) return;
    managersList.innerHTML = '';

    if (teams.length === 0) {
        if (noManagersMsg) noManagersMsg.style.display = 'block';
        return;
    }
    if (noManagersMsg) noManagersMsg.style.display = 'none';

    teams.forEach(team => {
        const mgrName = managers[team.name] || 'Not Appointed';
        const styleInfo = playStyles[team.name] || { position: 'Gaming', queueCount: '3' };
        const logoHtml = getTeamLogoHtml(team.name, team.logo);

        const card = document.createElement('div');
        card.className = 'manager-card';
        card.innerHTML = `
            <div class="manager-card-top">
                <div class="manager-team-row">
                    ${logoHtml}
                    <div>
                        <div class="manager-team-name">${escapeHtml(team.name)}</div>
                        <div class="manager-person-name">Manager: <strong>${escapeHtml(mgrName)}</strong></div>
                    </div>
                </div>
                <button class="btn-item-action btn-edit" onclick="setManager('${escapeHtml(team.name)}')">Change</button>
            </div>

            <!-- Play Style Section -->
            <div class="play-style-box">
                <div class="play-style-title">Play Style &amp; Setup</div>
                <div class="play-style-grid">
                    <div class="play-style-item">
                        <span class="play-style-label">Position</span>
                        <span class="play-style-value">${escapeHtml(styleInfo.position)}</span>
                        <button class="btn-edit-style" onclick="editPosition('${escapeHtml(team.name)}')">Edit</button>
                    </div>
                    <div class="play-style-item">
                        <span class="play-style-label">Queue Count</span>
                        <span class="play-style-value">${escapeHtml(styleInfo.queueCount)}</span>
                        <button class="btn-edit-style" onclick="editQueueCount('${escapeHtml(team.name)}')">Edit</button>
                    </div>
                </div>
            </div>
        `;
        managersList.appendChild(card);
    });
}

window.setManager = function(teamName) {
    const current = managers[teamName] || '';
    const name = prompt(`Enter manager name for ${teamName}:`, current);
    if (name !== null) {
        managers[teamName] = name.trim() || 'Not Appointed';
        saveAndRefresh();
    }
};

window.editPosition = function(teamName) {
    const current = (playStyles[teamName] && playStyles[teamName].position) || 'Gaming';
    const newPos = prompt(`Edit Position for ${teamName}:`, current);
    if (newPos !== null && newPos.trim()) {
        if (!playStyles[teamName]) playStyles[teamName] = { position: 'Gaming', queueCount: '3' };
        playStyles[teamName].position = newPos.trim();
        saveAndRefresh();
    }
};

window.editQueueCount = function(teamName) {
    const current = (playStyles[teamName] && playStyles[teamName].queueCount) || '3';
    const newCount = prompt(`Edit Queue Count for ${teamName}:`, current);
    if (newCount !== null && newCount.trim()) {
        if (!playStyles[teamName]) playStyles[teamName] = { position: 'Gaming', queueCount: '3' };
        playStyles[teamName].queueCount = newCount.trim();
        saveAndRefresh();
    }
};

// Season Progress
function updateSeasonProgress() {
    const leagueMatchesPlayed = matches.filter(m => (m.type || 'League') === 'League' && m.status === 'FT').length;
    const totalTeams = teams.length;
    const matchesPerTeam = Number(leagueConfig.matchesPerTeam) || 14;

    const totalScheduledTarget = totalTeams > 1 ? Math.floor((totalTeams * matchesPerTeam) / 2) : 0;

    let percentage = 0;
    if (totalScheduledTarget > 0) {
        percentage = Math.min(100, Math.round((leagueMatchesPlayed / totalScheduledTarget) * 100));
    }

    if (seasonProgressFill) seasonProgressFill.style.width = `${percentage}%`;
    if (seasonProgressPct) seasonProgressPct.textContent = `${percentage}%`;
    if (progressPlayedCount) progressPlayedCount.textContent = leagueMatchesPlayed;
    if (progressTargetCount) progressTargetCount.textContent = totalScheduledTarget;
}

// Settings Dashboard
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
        const logoHtml = getTeamLogoHtml(team.name, team.logo);
        const li = document.createElement('li');
        li.className = 'team-list-item';
        li.innerHTML = `
            <div class="team-item-left">
                <span>${index + 1}.</span>
                ${logoHtml}
                <strong>${escapeHtml(team.name)}</strong>
            </div>
            <div class="team-item-actions">
                <button class="btn-item-action btn-edit" onclick="editTeamDetails(${index})">Edit</button>
                <button class="btn-item-action btn-del" onclick="deleteTeam(${index})">Delete</button>
            </div>
        `;
        teamList.appendChild(li);
    });

    updateSeasonProgress();
}

function updateTeamSelects() {
    if (!homeTeamSelect || !awayTeamSelect || !matchTypeSelect) return;
    homeTeamSelect.innerHTML = '<option value="" disabled selected>Select Home Team</option>';
    awayTeamSelect.innerHTML = '<option value="" disabled selected>Select Away Team</option>';

    const sourceTeams = matchTypeSelect.value === 'UCL' ? uclTeams : teams;

    sourceTeams.forEach(team => {
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

if (matchTypeSelect) {
    matchTypeSelect.addEventListener('change', updateTeamSelects);
}

function saveAndRefresh() {
    localStorage.setItem('ccnn_teams', JSON.stringify(teams));
    localStorage.setItem('ccnn_ucl_teams', JSON.stringify(uclTeams));
    localStorage.setItem('ccnn_matches', JSON.stringify(matches));
    localStorage.setItem('ccnn_managers', JSON.stringify(managers));
    localStorage.setItem('ccnn_playstyles', JSON.stringify(playStyles));
    localStorage.setItem('ccnn_config', JSON.stringify(leagueConfig));

    renderLeagueTable();
    renderUclTable();
    renderMatches();
    renderManagers();
    renderSettingsDashboard();
    updateTeamSelects();
}

// Convert uploaded file to Base64 String
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Add Team (with Logo File or URL)
if (addTeamForm) {
    addTeamForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = teamNameInput.value.trim();
        if (!name) return;

        const max = Number(leagueConfig.maxTeams) || 8;
        if (teams.length >= max) {
            alert(`Maximum limit of ${max} teams reached.`);
            return;
        }

        let logoData = teamLogoUrlInput.value.trim();
        if (teamLogoFileInput.files && teamLogoFileInput.files[0]) {
            try {
                logoData = await fileToBase64(teamLogoFileInput.files[0]);
            } catch (err) {
                console.error('File conversion failed', err);
            }
        }

        teams.push({ name: name, logo: logoData });
        teamNameInput.value = '';
        teamLogoUrlInput.value = '';
        teamLogoFileInput.value = '';
        saveAndRefresh();
    });
}

// Edit Team Name and Logo
window.editTeamDetails = async function(index) {
    const current = teams[index];
    const newName = prompt('Edit Team Name:', current.name);
    if (newName === null) return;

    const cleanName = newName.trim() || current.name;
    const newLogo = prompt('Edit Logo Image URL (leave blank to keep current):', current.logo);
    
    const finalLogo = (newLogo !== null && newLogo.trim() !== '') ? newLogo.trim() : current.logo;

    // Synchronize updates across other collections
    const oldName = current.name;
    matches.forEach(m => {
        if (m.home === oldName) m.home = cleanName;
        if (m.away === oldName) m.away = cleanName;
    });

    uclTeams.forEach(u => {
        if (u.name === oldName) {
            u.name = cleanName;
            u.logo = finalLogo;
        }
    });

    if (managers[oldName]) {
        managers[cleanName] = managers[oldName];
        delete managers[oldName];
    }

    if (playStyles[oldName]) {
        playStyles[cleanName] = playStyles[oldName];
        delete playStyles[oldName];
    }

    teams[index].name = cleanName;
    teams[index].logo = finalLogo;
    saveAndRefresh();
};

window.deleteTeam = function(index) {
    const target = teams[index].name;
    if (confirm(`Delete team "${target}"? All their matches and UCL entries will be removed.`)) {
        teams.splice(index, 1);
        matches = matches.filter(m => m.home !== target && m.away !== target);
        uclTeams = uclTeams.filter(u => u.name !== target);
        delete managers[target];
        delete playStyles[target];
        saveAndRefresh();
    }
};

// Config changes
if (maxTeamsSelect) {
    maxTeamsSelect.addEventListener('change', (e) => {
        const newMax = parseInt(e.target.value, 10);
        if (teams.length > newMax) {
            alert(`You currently have ${teams.length} teams. Delete down to ${newMax} before reducing capacity.`);
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

// End Season: Qualify top teams to UCL (preserving logos) and reset scores
if (endSeasonBtn) {
    endSeasonBtn.addEventListener('click', () => {
        const confirmed = confirm(
            'End Season & Qualify to UCL?\n\n' +
            '• Teams currently inside the blue qualification line will qualify for the UCL tab.\n' +
            '• League match results will be cleared for the next season.\n' +
            '• Teams list and Logos will remain intact.'
        );
        if (confirmed) {
            const finalLeagueStandings = calculateTableStats(teams, 'League');
            const qualSpots = Number(leagueConfig.qualSpots) || 4;
            const qualified = finalLeagueStandings.slice(0, qualSpots).map(t => ({
                name: t.name,
                logo: t.logo || ''
            }));

            uclTeams = qualified;
            matches = matches.filter(m => m.type === 'UCL');

            saveAndRefresh();
            alert(`Season ended! ${qualified.length} team(s) have qualified to the UCL tab.`);
        }
    });
}

// Delete Everything
if (deleteEverythingBtn) {
    deleteEverythingBtn.addEventListener('click', () => {
        const confirmed = confirm(
            '⚠️ Delete Everything?\n\n' +
            'This will permanently delete all teams, logos, UCL entries, match results, managers, and configurations.'
        );
        if (confirmed) {
            localStorage.clear();
            teams = [];
            uclTeams = [];
            matches = [];
            managers = {};
            playStyles = {};
            leagueConfig = { maxTeams: 8, qualSpots: 4, matchesPerTeam: 14, darkMode: false };
            applyTheme(false);
            saveAndRefresh();
            alert('All league data has been erased.');
        }
    });
}

// Match Scheduling
if (openModalBtn) {
    openModalBtn.addEventListener('click', () => {
        const isUcl = matchTypeSelect.value === 'UCL';
        const source = isUcl ? uclTeams : teams;
        if (source.length < 2) {
            alert(`You need at least 2 ${isUcl ? 'qualified UCL' : ''} teams to create a match.`);
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
        const type = matchTypeSelect.value;
        const home = homeTeamSelect.value;
        const away = awayTeamSelect.value;

        if (!home || !away) return;
        if (home === away) {
            alert('Please select two different teams.');
            return;
        }

        matches.unshift({
            type: type,
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
