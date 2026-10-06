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

// League Standings & Team Management
const MAX_TEAMS = 8;
let rawTeams = JSON.parse(localStorage.getItem('ccnn_teams')) || [];

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

const standingsBody = document.getElementById('standings-body');
const standingsTable = document.querySelector('.standings-table');
const noTeamsMsg = document.getElementById('no-teams-msg');
const addTeamForm = document.getElementById('add-team-form');
const teamNameInput = document.getElementById('team-name-input');
const teamList = document.getElementById('team-list');
const teamCount = document.getElementById('team-count');

function renderLeagueTable() {
    if (!standingsBody) return;
    standingsBody.innerHTML = '';

    // Show empty message if no teams are added
    if (teams.length === 0) {
        if (standingsTable) standingsTable.style.display = 'none';
        if (noTeamsMsg) noTeamsMsg.style.display = 'block';
        return;
    }

    if (standingsTable) standingsTable.style.display = 'table';
    if (noTeamsMsg) noTeamsMsg.style.display = 'none';

    // Sort by Points, GD, GF
    teams.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);

    // Only render the exact count of teams existing in array
    teams.forEach((team, index) => {
        const row = document.createElement('tr');
        
        // Qualification accent on top 4
        if (index < 4) {
            row.classList.add('top-four');
        }

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
    renderLeagueTable();
    renderSettingsList();
}

if (addTeamForm) {
    addTeamForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = teamNameInput.value.trim();
        if (!name) return;

        if (teams.length >= MAX_TEAMS) {
            alert('Maximum of 8 teams reached.');
            return;
        }

        teams.push({
            name: name,
            mp: 0,
            w: 0,
            d: 0,
            l: 0,
            gd: 0,
            pts: 0,
            gf: 0,
            ga: 0
        });

        teamNameInput.value = '';
        saveAndRefresh();
    });
}

window.deleteTeam = function(index) {
    teams.splice(index, 1);
    saveAndRefresh();
};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initial render
saveAndRefresh();
