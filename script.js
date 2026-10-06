// Switch active button when tapped
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all buttons
        navItems.forEach(nav => nav.classList.remove('active'));
        
        // Add active class to the tapped button
        item.classList.add('active');

        const sectionName = item.getAttribute('data-target');
        console.log(`Switched to: ${sectionName}`);
    });
});
