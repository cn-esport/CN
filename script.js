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

// Team Management
const MAX_TEAMS = 8;
let teams = JSON.parse(localStorage.getItem('ccnn_teams')) || [];

const addTeamForm = document.getElementById('add-team-form');
const teamNameInput = document.getElementById('team-name-input');
const teamList = document.getElementById('team-list');
const teamCount = document.getElementById('team-count');

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

        teams.push({ name: name });
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
