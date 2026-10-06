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

// Ensure all teams have clean numeric values including gf & ga
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
const addTeamForm = document.getElementById('add-team-form');
const teamNameInput = document.getElementById('team-name-input');
const teamList = document.getElementById('team-list');
const teamCount = document.getElementById('team-count');

function renderLeagueTable() {
    if (!standingsBody) return;
    standingsBody.innerHTML = '';

    // Sort by Points, then GD, then GF
    teams.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);

    for (let i = 0; i < MAX_TEAMS; i++) {
        const team = teams[i];
        const row = document.createElement('tr');
        
        // Premier League qualification accent on top 4
        if (i < 4 && team) {
            row.classList.add('top-four');
        }

        row.innerHTML = `
            <td class="col-pos">${i + 1}</td>
            <td class="col-team">${team ? escapeHtml(team.name) : '<span class="team-slot"></span>'}</td>
            <td>${team ? team.mp : 0}</td>
            <td>${team ? team.w : 0}</td>
            <td>${team ? team.d : 0}</td>
            <td>${team ? team.l : 0}</td>
            <td>${team ? team.gd : 0}</td>
            <td class="col-pts">${team ? team.pts : 0}</td>
            <td>${team ? team.gf : 0}</td>
            <td>${team ? team.ga : 0}</td>
        `;
        standingsBody.appendChild(row);
    }
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
