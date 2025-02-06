const tabs = document.querySelectorAll('.tab-button');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach(tab =>
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
    }));

// dark-theme
const themeToggle = document.getElementById('theme-toggle');

function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.textContent = 'Светлая тема';
    } else {
        document.body.classList.remove('dark-theme');
        themeToggle.textContent = 'Темная тема';
    }

    localStorage.setItem('theme', theme);
}

themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';

    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
});

const savedTheme = localStorage.getItem('theme');

if (savedTheme) {
    setTheme(savedTheme);
} else {
    setTheme('light');
}
