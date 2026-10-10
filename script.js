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
let clubLeadership = JSON.parse(localStorage.getItem('ccnn_club_leadership')) || {};
let tournamentBracket = JSON.parse(localStorage.getItem('ccnn_bracket')) || null;

let matchesFilter = 'upcoming'; // 'upcoming' (Matches) or 'results' (Results)

let leagueConfig = JSON.parse(localStorage.getItem('ccnn_config')) || {
    maxTeams: 8,
    qualSpots: 4,
    matchesPerTeam: 14,
    darkMode: false,
    selectedLeague: 'ccnn',
    selectedTournament: 'ucl',
    seasonEnded: false,
    championTeam: null,
    seasonNumber: 1,
    groupStageFormat: 'single', // 'single' or 'home-away'
    semiFinalLegs: 1,
    quarterFinalLegs: 1
};

// Normalize team object structure with logo property
let teams = rawTeams.map(t => ({
    name: t.name || 'Team',
    logo: t.logo || ''
}));

// League Branding Definitions
const LEAGUE_BRANDING = {
    'ccnn': {
        name: 'CCNN ESPORTS',
        short: 'CCNN',
        progressTitle: 'CCNN League Progress',
        cupName: 'CCNN League Trophy',
        logo: null,
        trophy: '/CN/images/trophies/ccnn-trophy.webp'
    },
    'premier-league': {
        name: 'PREMIER LEAGUE',
        short: 'Premier League',
        progressTitle: 'Premier League Progress',
        cupName: 'Premier League Trophy',
        logo: '/CN/images/premier-league.webp',
        trophy: '/CN/images/trophies/premier-league-trophy.webp'
    },
    'la-liga': {
        name: 'LALIGA',
        short: 'La Liga',
        progressTitle: 'La Liga Progress',
        cupName: 'La Liga Trophy',
        logo: '/CN/images/la-liga.webp',
        trophy: '/CN/images/trophies/la-liga-trophy.webp'
    },
    'serie-a': {
        name: 'SERIE A',
        short: 'Serie A',
        progressTitle: 'Serie A Progress',
        cupName: 'Coppa Campioni d\'Italia',
        logo: '/CN/images/serie-a.webp',
        trophy: '/CN/images/trophies/serie-a-trophy.webp'
    }
};

const headerCcnnBrand = document.getElementById('header-ccnn-brand');
const headerCollabBrand = document.getElementById('header-collab-brand');
const headerLeagueLogo = document.getElementById('header-league-logo');
const currentLeagueBadge = document.getElementById('current-league-badge');
const leagueSelectionDropdown = document.getElementById('league-selection-dropdown');

const leagueTrophyImg = document.getElementById('league-trophy-img');
const leagueTrophyWinnerDetails = document.getElementById('league-trophy-winner-details');
const leagueTrophyWinnerName = document.getElementById('league-trophy-winner-name');
const leagueTrophyActivePlaceholder = document.getElementById('league-trophy-active-placeholder');
const leagueCupName = document.getElementById('league-cup-name');

const leagueProgressTitle = document.getElementById('league-progress-title');
const leagueProgressPct = document.getElementById('league-progress-pct');
const leagueProgressFill = document.getElementById('league-progress-fill');
const leagueProgressPlayedCount = document.getElementById('league-progress-played-count');
const leagueProgressTargetCount = document.getElementById('league-progress-target-count');

function applyLeagueBranding(leagueKey) {
    const key = LEAGUE_BRANDING[leagueKey] ? leagueKey : 'ccnn';
    document.body.setAttribute('data-league', key);

    const brand = LEAGUE_BRANDING[key];

    if (key === 'ccnn' || !brand.logo) {
        if (headerCcnnBrand) headerCcnnBrand.style.display = 'block';
        if (headerCollabBrand) headerCollabBrand.style.display = 'none';
    } else {
        if (headerCcnnBrand) headerCcnnBrand.style.display = 'none';
        if (headerCollabBrand) {
            headerCollabBrand.style.display = 'inline-flex';
            if (headerLeagueLogo) {
                headerLeagueLogo.src = brand.logo;
                headerLeagueLogo.alt = brand.short;
            }
        }
    }

    if (currentLeagueBadge) currentLeagueBadge.textContent = brand.short;
    if (leagueSelectionDropdown) leagueSelectionDropdown.value = key;
    if (leagueTrophyImg) leagueTrophyImg.src = brand.trophy;
    if (leagueCupName) leagueCupName.textContent = brand.cupName;
    if (leagueProgressTitle) leagueProgressTitle.textContent = brand.progressTitle;
}
applyLeagueBranding(leagueConfig.selectedLeague);

if (leagueSelectionDropdown) {
    leagueSelectionDropdown.addEventListener('change', (e) => {
        leagueConfig.selectedLeague = e.target.value;
        applyLeagueBranding(leagueConfig.selectedLeague);
        saveAndRefresh();
    });
}

// Tournament Definitions
const TOURNAMENT_DEFINITIONS = {
    'ucl': { title: 'UEFA Champions League', tabLabel: 'UCL', badge: 'UCL' },
    'world-cup': { title: 'FIFA World Cup', tabLabel: 'World Cup', badge: 'World Cup' },
    'euro': { title: 'UEFA Euro', tabLabel: 'Euro', badge: 'Euro' },
    'asian-cup': { title: 'AFC Asian Cup', tabLabel: 'Asian Cup', badge: 'Asian Cup' }
};

const tournamentSelectionDropdown = document.getElementById('tournament-selection-dropdown');
const currentTournamentBadge = document.getElementById('current-tournament-badge');
const bottomUclLabel = document.getElementById('bottom-ucl-label');
const drawerUclLabel = document.getElementById('drawer-ucl-label');
const uclSectionTitle = document.getElementById('ucl-section-title');
const legendQualLabel = document.getElementById('legend-qual-label');
const matchTypeTournamentOption = document.getElementById('match-type-tournament-option');

function applyTournamentSettings(tournKey) {
    const key = TOURNAMENT_DEFINITIONS[tournKey] ? tournKey : 'ucl';
    const tournament = TOURNAMENT_DEFINITIONS[key];

    if (currentTournamentBadge) currentTournamentBadge.textContent = tournament.badge;
    if (bottomUclLabel) bottomUclLabel.textContent = tournament.tabLabel;
    if (drawerUclLabel) drawerUclLabel.textContent = tournament.tabLabel;
    if (uclSectionTitle) uclSectionTitle.textContent = tournament.title;
    if (legendQualLabel) legendQualLabel.textContent = `${tournament.title} Qualification`;
    if (matchTypeTournamentOption) matchTypeTournamentOption.textContent = `${tournament.title} Match`;
    if (tournamentSelectionDropdown) tournamentSelectionDropdown.value = key;
}
applyTournamentSettings(leagueConfig.selectedTournament);

if (tournamentSelectionDropdown) {
    tournamentSelectionDropdown.addEventListener('change', (e) => {
        leagueConfig.selectedTournament = e.target.value;
        applyTournamentSettings(leagueConfig.selectedTournament);
        saveAndRefresh();
    });
}

// Dark Mode Toggle Logic
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

// DOM Elements: Home Dashboard Cards
const homeTop4List = document.getElementById('home-top4-list');
const homeTableMoreBtn = document.getElementById('home-table-more-btn');
const homePredictionsList = document.getElementById('home-predictions-list');
const homeSeasonDisplay = document.getElementById('home-season-display');
const seasonNumberInput = document.getElementById('season-number-input');

// DOM Elements: League
const standingsBody = document.getElementById('standings-body');
const standingsTable = document.querySelector('#league-view .standings-table');
const noTeamsMsg = document.getElementById('no-teams-msg');
const leagueLegendsContainer = document.getElementById('league-legends-container');

// DOM Elements: Matches Tab Switcher
const filterUpcomingBtn = document.getElementById('filter-upcoming-btn');
const filterResultsBtn = document.getElementById('filter-results-btn');

if (filterUpcomingBtn && filterResultsBtn) {
    filterUpcomingBtn.addEventListener('click', () => {
        matchesFilter = 'upcoming';
        filterUpcomingBtn.classList.add('active');
        filterResultsBtn.classList.remove('active');
        renderMatches();
    });

    filterResultsBtn.addEventListener('click', () => {
        matchesFilter = 'results';
        filterResultsBtn.classList.add('active');
        filterUpcomingBtn.classList.remove('active');
        renderMatches();
    });
}

// DOM Elements: Tournament UCL Tabs & Panels
const uclGroupTabBtn = document.getElementById('ucl-group-tab-btn');
const uclKnockoutTabBtn = document.getElementById('ucl-knockout-tab-btn');
const uclGroupPanel = document.getElementById('ucl-group-panel');
const uclKnockoutPanel = document.getElementById('ucl-knockout-panel');

const uclStandingsBody = document.getElementById('ucl-standings-body');
const uclStandingsTable = document.querySelector('#ucl-view .standings-table');
const noUclTeamsMsg = document.getElementById('no-ucl-teams-msg');
const tournamentBracketContainer = document.getElementById('tournament-bracket-container');

const groupProgressPct = document.getElementById('group-progress-pct');
const groupProgressFill = document.getElementById('group-progress-fill');
const groupProgressPlayedCount = document.getElementById('group-progress-played-count');
const groupProgressTargetCount = document.getElementById('group-progress-target-count');

if (uclGroupTabBtn && uclKnockoutTabBtn) {
    uclGroupTabBtn.addEventListener('click', () => {
        uclGroupTabBtn.classList.add('active');
        uclKnockoutTabBtn.classList.remove('active');
        uclGroupPanel.classList.add('active');
        uclKnockoutPanel.classList.remove('active');
    });

    uclKnockoutTabBtn.addEventListener('click', () => {
        uclKnockoutTabBtn.classList.add('active');
        uclGroupTabBtn.classList.remove('active');
        uclKnockoutPanel.classList.add('active');
        uclGroupPanel.classList.remove('active');
    });
}

// Bracket Score Modal Elements
const bracketScoreModal = document.getElementById('bracket-score-modal');
const closeBracketScoreModalBtn = document.getElementById('close-bracket-score-modal-btn');
const bracketScoreForm = document.getElementById('bracket-score-form');
const bracketRoundKeyInput = document.getElementById('bracket-round-key');
const bracketMatchIndexInput = document.getElementById('bracket-match-index');
const bracketLegNumberInput = document.getElementById('bracket-leg-number');
const bracketScoreTitle = document.getElementById('bracket-score-title');
const bracketScoreHomeLabel = document.getElementById('bracket-score-home-label');
const bracketScoreAwayLabel = document.getElementById('bracket-score-away-label');
const bracketHomeScoreInput = document.getElementById('bracket-home-score-input');
const bracketAwayScoreInput = document.getElementById('bracket-away-score-input');
const bracketPenaltiesBox = document.getElementById('bracket-penalties-box');
const bracketPenaltiesWinnerSelect = document.getElementById('bracket-penalties-winner-select');

// Settings Format Dropdowns
const groupStageFormatSelect = document.getElementById('group-stage-format-select');
const semiFinalLegsSelect = document.getElementById('semi-final-legs-select');
const quarterFinalLegsSelect = document.getElementById('quarter-final-legs-select');

// Matches DOM
const matchesList = document.getElementById('matches-list');
const noMatchesMsg = document.getElementById('no-matches-msg');
const openModalBtn = document.getElementById('open-match-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const matchModal = document.getElementById('match-modal');
const createMatchForm = document.getElementById('create-match-form');
const matchTypeSelect = document.getElementById('match-type-select');
const homeTeamSelect = document.getElementById('home-team-select');
const awayTeamSelect = document.getElementById('away-team-select');

// Score Modal
const scoreModal = document.getElementById('score-modal');
const closeScoreModalBtn = document.getElementById('close-score-modal-btn');
const enterScoreForm = document.getElementById('enter-score-form');
const scoreMatchIndexInput = document.getElementById('score-match-index');
const scoreHomeLabel = document.getElementById('score-home-label');
const scoreAwayLabel = document.getElementById('score-away-label');
const homeScoreInput = document.getElementById('home-score-input');
const awayScoreInput = document.getElementById('away-score-input');

// Managers DOM
const managersList = document.getElementById('managers-list');
const noManagersMsg = document.getElementById('no-managers-msg');
const managerModal = document.getElementById('manager-modal');
const closeManagerModalBtn = document.getElementById('close-manager-modal-btn');
const editManagerForm = document.getElementById('edit-manager-form');
const editManagerTeamKey = document.getElementById('edit-manager-team-key');
const editManagerNameInput = document.getElementById('edit-manager-name-input');
const editPlaystyleInput = document.getElementById('edit-playstyle-input');

const trophyCountPremierLeague = document.getElementById('trophy-count-premierLeague');
const trophyCountLaLiga = document.getElementById('trophy-count-laLiga');
const trophyCountSerieA = document.getElementById('trophy-count-serieA');
const trophyCountCcnn = document.getElementById('trophy-count-ccnn');

// Edit Team Modal
const editTeamModal = document.getElementById('edit-team-modal');
const closeEditTeamModalBtn = document.getElementById('close-edit-team-modal-btn');
const editTeamForm = document.getElementById('edit-team-form');
const editTeamIndex = document.getElementById('edit-team-index');
const editTeamNameInput = document.getElementById('edit-team-name-input');
const editTeamLogoFile = document.getElementById('edit-team-logo-file');

// Commissioner Dashboard
const addTeamForm = document.getElementById('add-team-form');
const teamNameInput = document.getElementById('team-name-input');
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

function renderLogoMarkup(teamName, className = 'table-team-logo') {
    const teamObj = teams.find(t => t.name === teamName) || uclTeams.find(t => t.name === teamName);
    const initial = teamName ? teamName.charAt(0).toUpperCase() : 'T';

    if (teamObj && teamObj.logo) {
        return `<img src="${escapeHtml(teamObj.logo)}" alt="${escapeHtml(teamName)}" class="${className}">`;
    }
    return `<span class="${className}">${escapeHtml(initial)}</span>`;
}

function getTeamAbbr(teamName) {
    if (!teamName) return 'TEA';
    const words = teamName.trim().split(/\s+/);
    if (words.length >= 3) {
        return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
    } else if (words.length === 2) {
        return (words[0].slice(0, 2) + words[1].slice(0, 1)).toUpperCase();
    }
    return teamName.slice(0, 3).toUpperCase();
}

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

    const isTournamentMatch = (type) => type === 'Tournament' || type === 'UCL';

    const chronologicalMatches = [...matches].reverse().filter(m => {
        const type = m.type || 'League';
        if (tournamentType === 'League') {
            return type === 'League';
        }
        return isTournamentMatch(type);
    });

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

function generateFormCirclesHtml(formArray) {
    const recent = formArray.slice(-5);
    let html = '<div class="form-circles-group">';

    recent.forEach(result => {
        if (result === 'W') {
            html += `<span class="form-circle form-win" title="Win"><svg viewBox="0 0 12 12"><path d="M2.5 6.2L4.8 8.5L9.5 3.5" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
        } else if (result === 'D') {
            html += `<span class="form-circle form-draw" title="Draw"><svg viewBox="0 0 12 12"><line x1="3" y1="6" x2="9" y2="6" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/></svg></span>`;
        } else if (result === 'L') {
            html += `<span class="form-circle form-loss" title="Loss"><svg viewBox="0 0 12 12"><line x1="3.5" y1="3.5" x2="8.5" y2="8.5" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/><line x1="8.5" y1="3.5" x2="3.5" y2="8.5" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/></svg></span>`;
        }
    });

    const unplayedCount = Math.max(0, 5 - recent.length);
    for (let i = 0; i < unplayedCount; i++) {
        html += '<span class="form-circle form-empty" title="Not played"></span>';
    }

    html += '</div>';
    return html;
}

// Home Page Dashboard Cards
function renderHomeDashboard() {
    if (!homeTop4List || !homePredictionsList || !homeSeasonDisplay) return;

    const leagueTableData = calculateTableStats(teams, 'League');

    homeTop4List.innerHTML = '';
    const top4 = leagueTableData.slice(0, 4);

    if (top4.length === 0) {
        homeTop4List.innerHTML = `<div style="padding: 18px 0; font-size: 0.8rem; color: var(--text-muted); text-align: center;">No teams added yet</div>`;
    } else {
        top4.forEach((t, idx) => {
            const logoHtml = renderLogoMarkup(t.name, 'home-team-logo');
            const abbr = getTeamAbbr(t.name);
            const row = document.createElement('div');
            row.className = 'home-team-row';
            row.innerHTML = `
                <div class="home-team-left">
                    <span class="home-rank">${idx + 1}</span>
                    ${logoHtml}
                    <span class="home-team-abbr">${escapeHtml(abbr)}</span>
                </div>
                <span class="home-pts">${t.pts} pts.</span>
            `;
            homeTop4List.appendChild(row);
        });
    }

    const remainingTeams = Math.max(0, leagueTableData.length - 4);
    if (homeTableMoreBtn) {
        homeTableMoreBtn.textContent = `+${remainingTeams} more`;
        homeTableMoreBtn.style.display = remainingTeams > 0 ? 'block' : 'none';
    }

    homePredictionsList.innerHTML = '';

    if (leagueTableData.length === 0) {
        homePredictionsList.innerHTML = `<div style="padding: 14px 0; font-size: 0.8rem; color: var(--text-muted);">No data available</div>`;
    } else {
        const scoredTeams = leagueTableData.map(t => {
            const leadership = clubLeadership[t.name] || {};
            const trophies = leadership.trophies || {};
            const totalTrophies = (Number(trophies.premierLeague) || 0) +
                                  (Number(trophies.laLiga) || 0) +
                                  (Number(trophies.serieA) || 0) +
                                  (Number(trophies.ccnn) || Number(trophies.league) || 0);

            const historicalScore = totalTrophies * 2;
            const recent5 = t.form.slice(-5);
            let formScore = 0;
            recent5.forEach(res => {
                if (res === 'W') formScore += 3;
                else if (res === 'D') formScore += 1;
            });

            const rawScore = (historicalScore * 0.70) + (formScore * 0.30) + 1.0;

            return {
                name: t.name,
                logo: t.logo,
                rawScore: rawScore
            };
        });

        const totalSum = scoredTeams.reduce((acc, curr) => acc + curr.rawScore, 0);
        scoredTeams.sort((a, b) => b.rawScore - a.rawScore);
        const top3Predictions = scoredTeams.slice(0, 3);

        top3Predictions.forEach(pred => {
            const pct = totalSum > 0 ? Math.round((pred.rawScore / totalSum) * 100) : 33;
            const logoHtml = renderLogoMarkup(pred.name, 'prediction-logo');

            const predRow = document.createElement('div');
            predRow.className = 'prediction-row';
            predRow.innerHTML = `
                <div class="prediction-team-info">
                    ${logoHtml}
                    <span class="prediction-name">${escapeHtml(pred.name)}</span>
                </div>
                <span class="prediction-pct">${pct}%</span>
            `;
            homePredictionsList.appendChild(predRow);
        });
    }

    const currentSeasonNum = leagueConfig.seasonNumber || 1;
    homeSeasonDisplay.textContent = `Season ${currentSeasonNum}`;
}

// Render League Standings
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

        const logoHtml = renderLogoMarkup(team.name, 'table-team-logo');
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

    if (leagueTrophyWinnerDetails && leagueTrophyWinnerName && leagueTrophyActivePlaceholder) {
        if (leagueConfig.seasonEnded && leagueConfig.championTeam) {
            leagueTrophyWinnerName.textContent = leagueConfig.championTeam;
            leagueTrophyWinnerDetails.style.display = 'flex';
            leagueTrophyActivePlaceholder.style.display = 'none';
        } else {
            leagueTrophyWinnerDetails.style.display = 'none';
            leagueTrophyActivePlaceholder.style.display = 'block';
        }
    }

    updateLeaguePageProgress();
}

function updateLeaguePageProgress() {
    const leagueMatchesPlayed = matches.filter(m => (m.type || 'League') === 'League' && m.status === 'FT').length;
    const totalTeams = teams.length;
    const matchesPerTeam = Number(leagueConfig.matchesPerTeam) || 14;

    const totalScheduledTarget = totalTeams > 1 ? Math.floor((totalTeams * matchesPerTeam) / 2) : 0;

    let percentage = 0;
    if (totalScheduledTarget > 0) {
        percentage = Math.min(100, Math.round((leagueMatchesPlayed / totalScheduledTarget) * 100));
    }

    if (leagueProgressFill) leagueProgressFill.style.width = `${percentage}%`;
    if (leagueProgressPct) leagueProgressPct.textContent = `${percentage}%`;
    if (leagueProgressPlayedCount) leagueProgressPlayedCount.textContent = leagueMatchesPlayed;
    if (leagueProgressTargetCount) leagueProgressTargetCount.textContent = totalScheduledTarget;
}

// Automatic Season Ending Check
function checkAndTriggerAutoSeasonEnd() {
    if (teams.length < 2 || leagueConfig.seasonEnded) return;

    const targetMatches = Number(leagueConfig.matchesPerTeam) || 14;
    const standings = calculateTableStats(teams, 'League');

    // Season ends automatically when every team has completed all required matches
    const allTeamsFinished = standings.length > 0 && standings.every(t => t.mp >= targetMatches);

    if (allTeamsFinished) {
        concludeSeason(false);
    }
}

// Conclude Season (shared between manual button and auto end)
function concludeSeason(isManual = false) {
    const tournDef = TOURNAMENT_DEFINITIONS[leagueConfig.selectedTournament] || TOURNAMENT_DEFINITIONS['ucl'];
    const finalLeagueStandings = calculateTableStats(teams, 'League');
    const qualSpots = Number(leagueConfig.qualSpots) || 4;
    const qualified = finalLeagueStandings.slice(0, qualSpots).map(t => ({
        name: t.name,
        logo: t.logo || ''
    }));

    if (finalLeagueStandings.length > 0) {
        const champion = finalLeagueStandings[0].name;
        leagueConfig.championTeam = champion;
        leagueConfig.seasonEnded = true;

        if (clubLeadership[champion]) {
            if (!clubLeadership[champion].trophies) {
                clubLeadership[champion].trophies = { premierLeague: 0, laLiga: 0, serieA: 0, ccnn: 0 };
            }
            
            const activeLeague = leagueConfig.selectedLeague || 'ccnn';
            if (activeLeague === 'premier-league') {
                clubLeadership[champion].trophies.premierLeague = (clubLeadership[champion].trophies.premierLeague || 0) + 1;
            } else if (activeLeague === 'la-liga') {
                clubLeadership[champion].trophies.laLiga = (clubLeadership[champion].trophies.laLiga || 0) + 1;
            } else if (activeLeague === 'serie-a') {
                clubLeadership[champion].trophies.serieA = (clubLeadership[champion].trophies.serieA || 0) + 1;
            } else {
                clubLeadership[champion].trophies.ccnn = (clubLeadership[champion].trophies.ccnn || 0) + 1;
            }
        }
    }

    uclTeams = qualified;
    tournamentBracket = null;
    matches = matches.filter(m => m.type === 'Tournament' || m.type === 'UCL');

    saveAndRefresh();

    const title = leagueConfig.championTeam || 'Champion';
    if (isManual) {
        alert(`Season ended! ${title} has won the league! Top teams qualified to ${tournDef.title}.`);
    } else {
        alert(`🏆 All season matches completed!\n\n${title} has officially won the league! Top ${qualified.length} team(s) have qualified to ${tournDef.title}.`);
    }
}

// Tournament Group Stage & Knockout Bracket
function renderUclTable() {
    if (!uclStandingsBody) return;
    uclStandingsBody.innerHTML = '';

    if (uclTeams.length === 0) {
        if (uclStandingsTable) uclStandingsTable.style.display = 'none';
        if (noUclTeamsMsg) noUclTeamsMsg.style.display = 'block';
        if (tournamentBracketContainer) tournamentBracketContainer.innerHTML = '';
        return;
    }

    if (uclStandingsTable) uclStandingsTable.style.display = 'table';
    if (noUclTeamsMsg) noUclTeamsMsg.style.display = 'none';

    const tableData = calculateTableStats(uclTeams, 'Tournament');

    tableData.forEach((team, index) => {
        const row = document.createElement('tr');
        const logoHtml = renderLogoMarkup(team.name, 'table-team-logo');
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
        uclStandingsBody.appendChild(row);
    });

    updateGroupStageProgress(tableData);
    checkAndAutoGenerateKnockoutBracket(tableData);
    renderKnockoutBracket();
}

function updateGroupStageProgress(currentGroupStandings) {
    if (!groupProgressFill || !groupProgressPct) return;
    const numTeams = currentGroupStandings.length;
    if (numTeams < 2) {
        groupProgressFill.style.width = '0%';
        groupProgressPct.textContent = '0%';
        groupProgressPlayedCount.textContent = '0';
        groupProgressTargetCount.textContent = '0';
        return;
    }

    const isHomeAway = (leagueConfig.groupStageFormat === 'home-away');
    const reqMatchesPerTeam = isHomeAway ? (numTeams - 1) * 2 : (numTeams - 1);
    const totalGroupTarget = Math.floor((numTeams * reqMatchesPerTeam) / 2);

    const groupMatchesPlayed = matches.filter(m => (m.type === 'Tournament' || m.type === 'UCL') && m.status === 'FT').length;
    const percentage = totalGroupTarget > 0 ? Math.min(100, Math.round((groupMatchesPlayed / totalGroupTarget) * 100)) : 0;

    groupProgressFill.style.width = `${percentage}%`;
    groupProgressPct.textContent = `${percentage}%`;
    groupProgressPlayedCount.textContent = groupMatchesPlayed;
    groupProgressTargetCount.textContent = totalGroupTarget;
}

function checkAndAutoGenerateKnockoutBracket(currentGroupStandings) {
    if (!currentGroupStandings || currentGroupStandings.length < 3) return;

    const numTeams = currentGroupStandings.length;
    const isHomeAway = (leagueConfig.groupStageFormat === 'home-away');
    const requiredMatchesPerTeam = isHomeAway ? (numTeams - 1) * 2 : (numTeams - 1);

    const allCompleted = currentGroupStandings.every(t => t.mp >= requiredMatchesPerTeam);

    if (allCompleted && !tournamentBracket) {
        const first = currentGroupStandings[0].name;
        const second = currentGroupStandings[1].name;
        const third = currentGroupStandings[2].name;

        const semiLegs = Number(leagueConfig.semiFinalLegs) || 1;

        tournamentBracket = {
            semiFinal: {
                legs: semiLegs,
                matches: [
                    {
                        home: second,
                        away: third,
                        homeScore: null,
                        awayScore: null,
                        winner: null
                    }
                ]
            },
            final: {
                legs: 1,
                directQualifier: first,
                matches: [
                    {
                        home: first,
                        away: null,
                        homeScore: null,
                        awayScore: null,
                        winner: null
                    }
                ]
            }
        };
        localStorage.setItem('ccnn_bracket', JSON.stringify(tournamentBracket));
    }
}

// Clean Bracket Renderer
function renderKnockoutBracket() {
    if (!tournamentBracketContainer) return;
    tournamentBracketContainer.innerHTML = '';

    if (!tournamentBracket) {
        const numTeams = uclTeams.length;
        const isHomeAway = (leagueConfig.groupStageFormat === 'home-away');
        const requiredMatchesPerTeam = isHomeAway ? (numTeams - 1) * 2 : (numTeams - 1);

        tournamentBracketContainer.innerHTML = `
            <div class="empty-state" style="padding: 24px 10px;">
                Complete all group stage matches (<strong>${requiredMatchesPerTeam} per team</strong>) to unlock the Knockout Stage automatically.
            </div>
        `;
        return;
    }

    // 1. Semi-Final Block
    const semiBlock = document.createElement('div');
    semiBlock.className = 'bracket-round-block';
    
    const semiMatch = tournamentBracket.semiFinal.matches[0];
    const semiHomeWon = semiMatch.winner === semiMatch.home;
    const semiAwayWon = semiMatch.winner === semiMatch.away;

    semiBlock.innerHTML = `
        <div class="bracket-round-title">Semi-Final</div>
        <div class="bracket-match-card" onclick="openBracketScoreModal('semiFinal', 0)">
            <div class="bracket-team-line ${semiHomeWon ? 'winner' : ''}">
                <div class="bracket-team-info">
                    ${renderLogoMarkup(semiMatch.home, 'table-team-logo')}
                    <span class="bracket-team-name">${escapeHtml(semiMatch.home)}</span>
                </div>
                <span class="bracket-score-val">${semiMatch.homeScore !== null ? semiMatch.homeScore : '-'}</span>
            </div>
            <div class="bracket-team-line ${semiAwayWon ? 'winner' : ''}">
                <div class="bracket-team-info">
                    ${renderLogoMarkup(semiMatch.away, 'table-team-logo')}
                    <span class="bracket-team-name">${escapeHtml(semiMatch.away)}</span>
                </div>
                <span class="bracket-score-val">${semiMatch.awayScore !== null ? semiMatch.awayScore : '-'}</span>
            </div>
        </div>
    `;
    tournamentBracketContainer.appendChild(semiBlock);

    // 2. Final Block
    const finalBlock = document.createElement('div');
    finalBlock.className = 'bracket-round-block';

    const finalMatch = tournamentBracket.final.matches[0];
    const finalHomeWon = finalMatch.winner === finalMatch.home;
    const finalAwayWon = finalMatch.winner === finalMatch.away;

    finalBlock.innerHTML = `
        <div class="bracket-round-title">Final</div>
        <div class="bracket-match-card" onclick="${finalMatch.away ? `openBracketScoreModal('final', 0)` : 'alert(\'The Semi-Final must be played before playing the Final.\')'}">
            <div class="bracket-team-line ${finalHomeWon ? 'winner' : ''}">
                <div class="bracket-team-info">
                    ${renderLogoMarkup(finalMatch.home, 'table-team-logo')}
                    <span class="bracket-team-name">${escapeHtml(finalMatch.home)}</span>
                </div>
                <span class="bracket-score-val">${finalMatch.homeScore !== null ? finalMatch.homeScore : '-'}</span>
            </div>
            <div class="bracket-team-line ${finalAwayWon ? 'winner' : ''}">
                <div class="bracket-team-info">
                    ${finalMatch.away ? renderLogoMarkup(finalMatch.away, 'table-team-logo') : '<span class="table-team-logo">?</span>'}
                    <span class="bracket-team-name">${finalMatch.away ? escapeHtml(finalMatch.away) : 'TBD'}</span>
                </div>
                <span class="bracket-score-val">${finalMatch.awayScore !== null ? finalMatch.awayScore : '-'}</span>
            </div>
        </div>
    `;
    tournamentBracketContainer.appendChild(finalBlock);
}

// Open Knockout Score Modal
window.openBracketScoreModal = function(roundKey, matchIndex) {
    if (!tournamentBracket || !tournamentBracket[roundKey]) return;
    const match = tournamentBracket[roundKey].matches[matchIndex];
    if (!match || !match.home || !match.away) return;

    bracketRoundKeyInput.value = roundKey;
    bracketMatchIndexInput.value = matchIndex;
    bracketScoreTitle.textContent = roundKey === 'semiFinal' ? 'Semi-Final Score' : 'Final Score';
    bracketScoreHomeLabel.textContent = match.home;
    bracketScoreAwayLabel.textContent = match.away;

    bracketHomeScoreInput.value = match.homeScore !== null ? match.homeScore : '';
    bracketAwayScoreInput.value = match.awayScore !== null ? match.awayScore : '';

    bracketPenaltiesBox.style.display = 'none';
    bracketPenaltiesWinnerSelect.innerHTML = `
        <option value="${match.home}">${match.home}</option>
        <option value="${match.away}">${match.away}</option>
    `;

    bracketScoreModal.classList.add('active');
};

if (closeBracketScoreModalBtn) {
    closeBracketScoreModalBtn.addEventListener('click', () => {
        bracketScoreModal.classList.remove('active');
    });
}

// Advance Knockout Winner
if (bracketScoreForm) {
    bracketScoreForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const roundKey = bracketRoundKeyInput.value;
        const matchIndex = parseInt(bracketMatchIndexInput.value, 10);
        const homeScore = parseInt(bracketHomeScoreInput.value, 10);
        const awayScore = parseInt(bracketAwayScoreInput.value, 10);

        if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
            alert('Please enter valid scores.');
            return;
        }

        const match = tournamentBracket[roundKey].matches[matchIndex];
        match.homeScore = homeScore;
        match.awayScore = awayScore;

        let winner = null;
        if (homeScore > awayScore) {
            winner = match.home;
        } else if (awayScore > homeScore) {
            winner = match.away;
        } else {
            winner = bracketPenaltiesWinnerSelect.value || match.home;
        }
        match.winner = winner;

        if (roundKey === 'semiFinal') {
            tournamentBracket.final.matches[0].away = winner;
        } else if (roundKey === 'final') {
            const tournDef = TOURNAMENT_DEFINITIONS[leagueConfig.selectedTournament] || TOURNAMENT_DEFINITIONS['ucl'];
            alert(`🎉 ${winner} has won the ${tournDef.title}!`);

            if (clubLeadership[winner]) {
                if (!clubLeadership[winner].trophies) {
                    clubLeadership[winner].trophies = { premierLeague: 0, laLiga: 0, serieA: 0, ccnn: 0 };
                }
                const activeTourn = leagueConfig.selectedTournament || 'ucl';
                if (activeTourn === 'ucl') {
                    clubLeadership[winner].trophies.ccnn = (clubLeadership[winner].trophies.ccnn || 0) + 1;
                }
            }
        }

        bracketScoreModal.classList.remove('active');
        saveAndRefresh();
    });
}

if (bracketHomeScoreInput && bracketAwayScoreInput) {
    const checkTie = () => {
        const h = parseInt(bracketHomeScoreInput.value, 10);
        const a = parseInt(bracketAwayScoreInput.value, 10);
        if (!isNaN(h) && !isNaN(a) && h === a) {
            bracketPenaltiesBox.style.display = 'block';
        } else {
            bracketPenaltiesBox.style.display = 'none';
        }
    };
    bracketHomeScoreInput.addEventListener('input', checkTie);
    bracketAwayScoreInput.addEventListener('input', checkTie);
}

// Render Matches list with filtering (Matches vs Results)
function renderMatches() {
    if (!matchesList) return;
    matchesList.innerHTML = '';

    const tournDef = TOURNAMENT_DEFINITIONS[leagueConfig.selectedTournament] || TOURNAMENT_DEFINITIONS['ucl'];

    // Filter matches based on active tab: upcoming (unplayed) vs results (FT)
    const filteredMatches = matches.filter(m => {
        if (matchesFilter === 'results') {
            return m.status === 'FT';
        }
        return m.status !== 'FT';
    });

    if (filteredMatches.length === 0) {
        if (noMatchesMsg) {
            noMatchesMsg.textContent = matchesFilter === 'results' ? 'No completed matches yet.' : 'No upcoming matches scheduled.';
            noMatchesMsg.style.display = 'block';
        }
        return;
    }
    if (noMatchesMsg) noMatchesMsg.style.display = 'none';

    filteredMatches.forEach((match) => {
        // Find real index in parent matches array for score modal
        const realIndex = matches.indexOf(match);
        const isFinished = match.status === 'FT';
        const rawType = match.type || 'League';
        const displayType = (rawType === 'Tournament' || rawType === 'UCL') ? tournDef.tabLabel : 'League';

        const homeLogoHtml = renderLogoMarkup(match.home, 'team-badge-circle');
        const awayLogoHtml = renderLogoMarkup(match.away, 'team-badge-circle');

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
            <span class="match-type-badge">${escapeHtml(displayType)}</span>
            <div class="match-teams">
                <div class="team-row">
                    <div class="team-info">
                        ${homeLogoHtml}
                        <span class="team-name">${escapeHtml(match.home)}</span>
                    </div>
                    ${homeScoreHtml}
                </div>
                <div class="team-row">
                    <div class="team-info">
                        ${awayLogoHtml}
                        <span class="team-name">${escapeHtml(match.away)}</span>
                    </div>
                    ${awayScoreHtml}
                </div>
            </div>
            <div class="match-divider"></div>
            <div class="match-action-col" onclick="openScoreModal(${realIndex})">
                ${rightColumnHtml}
            </div>
        `;
        matchesList.appendChild(card);
    });
}

// Trophy Showcase Definitions
const TROPHIES_CONFIG = [
    { key: 'premierLeague', img: '/CN/images/trophies/premier-league-trophy.webp', title: 'Premier League' },
    { key: 'laLiga', img: '/CN/images/trophies/la-liga-trophy.webp', title: 'La Liga' },
    { key: 'serieA', img: '/CN/images/trophies/serie-a-trophy.webp', title: 'Serie A' },
    { key: 'ccnn', img: '/CN/images/trophies/ccnn-trophy.webp', title: 'CCNN Trophy' }
];

function renderTrophyShowcaseHtml(trophiesObj) {
    if (!trophiesObj) {
        return `<div class="trophy-showcase-empty">No trophies in cabinet</div>`;
    }

    let itemsHtml = '';
    let totalCount = 0;

    TROPHIES_CONFIG.forEach(t => {
        let count = Number(trophiesObj[t.key]) || 0;
        if (t.key === 'ccnn' && !count && trophiesObj.league) {
            count = Number(trophiesObj.league) || 0;
        }

        if (count > 0) {
            totalCount += count;
            itemsHtml += `
                <div class="trophy-badge-item" title="${t.title}">
                    <img src="${t.img}" alt="${t.title}" class="trophy-badge-image" onerror="this.src='/CN/images/trophies/ccnn-trophy.webp'">
                    <span class="trophy-badge-count">x${count}</span>
                </div>
            `;
        }
    });

    if (totalCount === 0) {
        return `<div class="trophy-showcase-empty">No trophies in cabinet</div>`;
    }

    return itemsHtml;
}

// Render Managers Tab
function renderManagers() {
    if (!managersList) return;
    managersList.innerHTML = '';

    if (teams.length === 0) {
        if (noManagersMsg) noManagersMsg.style.display = 'block';
        return;
    }
    if (noManagersMsg) noManagersMsg.style.display = 'none';

    teams.forEach(team => {
        const leadership = clubLeadership[team.name] || {
            manager: 'Not Appointed',
            playstyle: 'Default / Balanced',
            trophies: { premierLeague: 0, laLiga: 0, serieA: 0, ccnn: 0 }
        };
        const logoHtml = renderLogoMarkup(team.name, 'table-team-logo');
        const trophyCabinetHtml = renderTrophyShowcaseHtml(leadership.trophies);

        const card = document.createElement('div');
        card.className = 'manager-card';
        card.innerHTML = `
            <div class="manager-card-top">
                <div>
                    <div class="manager-team-row">
                        ${logoHtml}
                        <span class="manager-team-name">${escapeHtml(team.name)}</span>
                    </div>
                    <div class="manager-person-name">Manager: <strong>${escapeHtml(leadership.manager || 'Not Appointed')}</strong></div>
                    <div class="manager-playstyle-name">Playstyle: <strong>${escapeHtml(leadership.playstyle || 'Default / Balanced')}</strong></div>
                </div>
                <button class="btn-item-action btn-edit" onclick="openManagerModal('${escapeHtml(team.name)}')">Edit</button>
            </div>
            <div class="trophy-placeholder-box">
                ${trophyCabinetHtml}
            </div>
        `;
        managersList.appendChild(card);
    });
}

window.stepTrophy = function(trophyKey, step) {
    const input = document.getElementById(`trophy-count-${trophyKey}`);
    if (input) {
        let val = parseInt(input.value, 10) || 0;
        val = Math.max(0, val + step);
        input.value = val;
    }
};

window.openManagerModal = function(teamName) {
    const leadership = clubLeadership[teamName] || {
        manager: '',
        playstyle: '',
        trophies: { premierLeague: 0, laLiga: 0, serieA: 0, ccnn: 0 }
    };
    
    editManagerTeamKey.value = teamName;
    editManagerNameInput.value = leadership.manager && leadership.manager !== 'Not Appointed' ? leadership.manager : '';
    editPlaystyleInput.value = leadership.playstyle && leadership.playstyle !== 'Default / Balanced' ? leadership.playstyle : '';

    const t = leadership.trophies || {};
    if (trophyCountPremierLeague) trophyCountPremierLeague.value = t.premierLeague || 0;
    if (trophyCountLaLiga) trophyCountLaLiga.value = t.laLiga || 0;
    if (trophyCountSerieA) trophyCountSerieA.value = t.serieA || 0;
    if (trophyCountCcnn) trophyCountCcnn.value = t.ccnn || (t.league || 0);

    managerModal.classList.add('active');
};

if (closeManagerModalBtn) {
    closeManagerModalBtn.addEventListener('click', () => {
        managerModal.classList.remove('active');
    });
}

if (editManagerForm) {
    editManagerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const teamName = editManagerTeamKey.value;
        const managerName = editManagerNameInput.value.trim() || 'Not Appointed';
        const playstyleName = editPlaystyleInput.value.trim() || 'Default / Balanced';

        const trophies = {
            premierLeague: parseInt(trophyCountPremierLeague.value, 10) || 0,
            laLiga: parseInt(trophyCountLaLiga.value, 10) || 0,
            serieA: parseInt(trophyCountSerieA.value, 10) || 0,
            ccnn: parseInt(trophyCountCcnn.value, 10) || 0
        };

        clubLeadership[teamName] = {
            manager: managerName,
            playstyle: playstyleName,
            trophies: trophies
        };

        managerModal.classList.remove('active');
        saveAndRefresh();
    });
}

function updateCommissionerProgress() {
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

function renderSettingsDashboard() {
    if (!teamList) return;
    teamList.innerHTML = '';

    const max = Number(leagueConfig.maxTeams) || 8;
    teamCount.textContent = teams.length;
    teamMaxDisplay.textContent = max;
    maxTeamsSelect.value = max;
    qualZoneSelect.value = leagueConfig.qualSpots || 4;
    matchesPerTeamInput.value = leagueConfig.matchesPerTeam || 14;
    if (seasonNumberInput) seasonNumberInput.value = leagueConfig.seasonNumber || 1;

    if (groupStageFormatSelect) groupStageFormatSelect.value = leagueConfig.groupStageFormat || 'single';
    if (semiFinalLegsSelect) semiFinalLegsSelect.value = leagueConfig.semiFinalLegs || 1;
    if (quarterFinalLegsSelect) quarterFinalLegsSelect.value = leagueConfig.quarterFinalLegs || 1;

    teams.forEach((team, index) => {
        const logoHtml = renderLogoMarkup(team.name, 'table-team-logo');
        const li = document.createElement('li');
        li.className = 'team-list-item';
        li.innerHTML = `
            <div class="team-item-left">
                <span>${index + 1}.</span>
                ${logoHtml}
                <strong>${escapeHtml(team.name)}</strong>
            </div>
            <div class="team-item-actions">
                <button class="btn-item-action btn-edit" onclick="openEditTeamModal(${index})">Edit</button>
                <button class="btn-item-action btn-del" onclick="deleteTeam(${index})">Delete</button>
            </div>
        `;
        teamList.appendChild(li);
    });

    updateCommissionerProgress();
}

if (groupStageFormatSelect) {
    groupStageFormatSelect.addEventListener('change', (e) => {
        leagueConfig.groupStageFormat = e.target.value;
        saveAndRefresh();
    });
}
if (semiFinalLegsSelect) {
    semiFinalLegsSelect.addEventListener('change', (e) => {
        leagueConfig.semiFinalLegs = parseInt(e.target.value, 10);
        if (tournamentBracket && tournamentBracket.semiFinal) {
            tournamentBracket.semiFinal.legs = leagueConfig.semiFinalLegs;
        }
        saveAndRefresh();
    });
}
if (quarterFinalLegsSelect) {
    quarterFinalLegsSelect.addEventListener('change', (e) => {
        leagueConfig.quarterFinalLegs = parseInt(e.target.value, 10);
        saveAndRefresh();
    });
}

if (seasonNumberInput) {
    seasonNumberInput.addEventListener('change', (e) => {
        const val = parseInt(e.target.value, 10);
        if (val >= 1) {
            leagueConfig.seasonNumber = val;
            saveAndRefresh();
        }
    });
}

// Edit Team Handlers
window.openEditTeamModal = function(index) {
    const team = teams[index];
    if (!team) return;

    editTeamIndex.value = index;
    editTeamNameInput.value = team.name;
    editTeamLogoFile.value = '';

    editTeamModal.classList.add('active');
};

if (closeEditTeamModalBtn) {
    closeEditTeamModalBtn.addEventListener('click', () => {
        editTeamModal.classList.remove('active');
    });
}

if (editTeamForm) {
    editTeamForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const index = parseInt(editTeamIndex.value, 10);
        const oldName = teams[index].name;
        const newName = editTeamNameInput.value.trim();
        const fileInput = editTeamLogoFile.files[0];

        if (!newName) return;

        function applyTeamUpdate(finalLogo) {
            matches.forEach(m => {
                if (m.home === oldName) m.home = newName;
                if (m.away === oldName) m.away = newName;
            });
            uclTeams.forEach(u => {
                if (u.name === oldName) {
                    u.name = newName;
                    u.logo = finalLogo;
                }
            });
            if (clubLeadership[oldName]) {
                clubLeadership[newName] = clubLeadership[oldName];
                if (oldName !== newName) delete clubLeadership[oldName];
            }

            if (leagueConfig.championTeam === oldName) {
                leagueConfig.championTeam = newName;
            }

            teams[index].name = newName;
            teams[index].logo = finalLogo;

            editTeamModal.classList.remove('active');
            saveAndRefresh();
        }

        if (fileInput) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                applyTeamUpdate(evt.target.result);
            };
            reader.readAsDataURL(fileInput);
        } else {
            applyTeamUpdate(teams[index].logo || '');
        }
    });
}

function updateTeamSelects() {
    if (!homeTeamSelect || !awayTeamSelect || !matchTypeSelect) return;
    homeTeamSelect.innerHTML = '<option value="" disabled selected>Select Home Team</option>';
    awayTeamSelect.innerHTML = '<option value="" disabled selected>Select Away Team</option>';

    const isTournament = matchTypeSelect.value === 'Tournament' || matchTypeSelect.value === 'UCL';
    const sourceTeams = isTournament ? uclTeams : teams;

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
    localStorage.setItem('ccnn_club_leadership', JSON.stringify(clubLeadership));
    localStorage.setItem('ccnn_config', JSON.stringify(leagueConfig));
    localStorage.setItem('ccnn_bracket', JSON.stringify(tournamentBracket));

    renderHomeDashboard();
    renderLeagueTable();
    renderUclTable();
    renderMatches();
    renderManagers();
    renderSettingsDashboard();
    updateTeamSelects();
}

// Add Team (with file input only)
if (addTeamForm) {
    addTeamForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = teamNameInput.value.trim();
        if (!name) return;

        const max = Number(leagueConfig.maxTeams) || 8;
        if (teams.length >= max) {
            alert(`Maximum limit of ${max} teams reached.`);
            return;
        }

        const fileInput = teamLogoFileInput.files[0];

        function pushTeam(logoData) {
            teams.push({
                name: name,
                logo: logoData
            });

            clubLeadership[name] = {
                manager: 'Not Appointed',
                playstyle: 'Default / Balanced',
                trophies: { premierLeague: 0, laLiga: 0, serieA: 0, ccnn: 0 }
            };

            addTeamForm.reset();
            saveAndRefresh();
        }

        if (fileInput) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                pushTeam(evt.target.result);
            };
            reader.readAsDataURL(fileInput);
        } else {
            pushTeam('');
        }
    });
}

window.deleteTeam = function(index) {
    const target = teams[index].name;
    if (confirm(`Delete team "${target}"? All their matches and tournament entries will be removed.`)) {
        teams.splice(index, 1);
        matches = matches.filter(m => m.home !== target && m.away !== target);
        uclTeams = uclTeams.filter(u => u.name !== target);
        delete clubLeadership[target];
        if (leagueConfig.championTeam === target) {
            leagueConfig.championTeam = null;
        }
        tournamentBracket = null;
        saveAndRefresh();
    }
};

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

// Manual End Season Button
if (endSeasonBtn) {
    endSeasonBtn.addEventListener('click', () => {
        const tournDef = TOURNAMENT_DEFINITIONS[leagueConfig.selectedTournament] || TOURNAMENT_DEFINITIONS['ucl'];
        const confirmed = confirm(
            `End Season & Crown Champion?\n\n` +
            `• The #1 team will be declared League Champions.\n` +
            `• Top teams inside the qualification line will qualify for ${tournDef.title}.\n` +
            `• League match scores will reset for the new season.\n` +
            `• Teams, managers, and trophy records will remain intact.`
        );
        if (confirmed) {
            concludeSeason(true);
        }
    });
}

// Delete Everything
if (deleteEverythingBtn) {
    deleteEverythingBtn.addEventListener('click', () => {
        const confirmed = confirm(
            '⚠️ Delete Everything?\n\n' +
            'This will permanently delete all teams, logos, tournament entries, match results, and configurations.'
        );
        if (confirmed) {
            localStorage.clear();
            teams = [];
            uclTeams = [];
            matches = [];
            clubLeadership = {};
            tournamentBracket = null;
            leagueConfig = {
                maxTeams: 8,
                qualSpots: 4,
                matchesPerTeam: 14,
                darkMode: false,
                selectedLeague: 'ccnn',
                selectedTournament: 'ucl',
                seasonEnded: false,
                championTeam: null,
                seasonNumber: 1,
                groupStageFormat: 'single',
                semiFinalLegs: 1,
                quarterFinalLegs: 1
            };
            applyTheme(false);
            applyLeagueBranding('ccnn');
            applyTournamentSettings('ucl');
            saveAndRefresh();
            alert('All league data has been erased.');
        }
    });
}

// Match Scheduling
if (openModalBtn) {
    openModalBtn.addEventListener('click', () => {
        const isTournament = matchTypeSelect.value === 'Tournament' || matchTypeSelect.value === 'UCL';
        const source = isTournament ? uclTeams : teams;
        const tournDef = TOURNAMENT_DEFINITIONS[leagueConfig.selectedTournament] || TOURNAMENT_DEFINITIONS['ucl'];
        if (source.length < 2) {
            alert(`You need at least 2 ${isTournament ? `qualified ${tournDef.tabLabel}` : ''} teams to create a match.`);
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
        const type = matchTypeSelect.value === 'League' ? 'League' : 'Tournament';
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

        if (type === 'League' && leagueConfig.seasonEnded) {
            leagueConfig.seasonEnded = false;
        }

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

        // Check if all league teams reached the required matches to auto end season
        if (matches[index].type === 'League' || !matches[index].type) {
            checkAndTriggerAutoSeasonEnd();
        }
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initial Run
saveAndRefresh();
