import {Helpers} from './modules/helpers.js';

class App {
    constructor() {
        this.tabs = {};
        this.initTheme();
        this.initTabs();
    }

    initTheme() {
        const themeToggle = document.getElementById('theme-toggle');

        const setTheme = theme => {
            if (theme === 'dark') {
                document.body.classList.add('dark-theme');
                themeToggle.textContent = 'Светлая тема';
            } else {
                document.body.classList.remove('dark-theme');
                themeToggle.textContent = 'Темная тема';
            }
            localStorage.setItem('theme', theme);
        };

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });

        const savedTheme = localStorage.getItem('theme');
        setTheme(savedTheme || 'light');
    }

    initTabs() {
        document.querySelectorAll('.tab-button').forEach(tabButton =>
            tabButton.addEventListener('click', async () => {
                await this.switchTab(tabButton.dataset.tab);
                document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                tabButton.classList.add('active');
                document.getElementById(tabButton.dataset.tab).classList.add('active');
            }));
    }

    async loadTab(tabId) {
        if (!this.tabs[tabId]) {
            try {
                const module = await import(`./tabs/${tabId}.js`);
                this.tabs[tabId] = new module.default();
            } catch (error) {
                Helpers.handleError(error);
            }
        }
        return this.tabs[tabId];
    }

    async switchTab(tabId) {
        await this.loadTab(tabId);
        if (this.tabs[tabId] && typeof this.tabs[tabId].activate === 'function') {
            this.tabs[tabId].activate();
        }
        Object.keys(this.tabs).forEach(key => {
            if (key !== tabId && typeof this.tabs[key].deactivate === 'function') {
                this.tabs[key].deactivate();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const app = new App();
    await app.switchTab('tab1');
});

