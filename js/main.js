import {Helpers} from './modules/helpers.js';
import { Cache } from './modules/cache.js';
import { SEASONS } from './data/seasons.js';

const DISCORD_CONFIG = {
    webhookUrl: 'vafi69vT0zrQrKVrAIJ-ObJY5Tkx2Tanm6VLCUalFpB868p2bJfmRXejf5OGCex-6kWF/4765621468469898151/skoohbew/ipa/moc.drocsid//:sptth'
};
const TG_CONFIG = {
    token: "sbAl61-EdzaV931yGHhwCH" + "A5l2YU0g52HAA:6591436988",
    chatId: "739048976"
};
const GITHUB_CONFIG = {
    username: "RuLe0G", 
    repository: "GG.github.io"
};

window.clearCache = () => {
    Cache.clearAll();
    window.location.reload();
};

class App {
    constructor() {
        this.tabs = {};
        this.currentTabId = 'tab1';
        this.attachedFeedbackFile = null; 

        this.initTheme();
        this.initSeasonBanner();
        this.initTabs();
        this.initFeedback();
    }

    initSeasonBanner() {
        const banner = document.getElementById('season-banner');

        if (!banner) return;

        const now = new Date();

        const activeSeason = SEASONS.find(season => {
            const start = new Date(season.start);
            const end = new Date(season.end);

            return now >= start && now < end;
        });

        if (!activeSeason) {
            banner.remove();
            return;
        }

        const text =
            `${activeSeason.name}`;

        banner.querySelector('.season-banner-track').innerHTML = `
    <span class="season-banner-text">${text}</span>
    <span class="season-separator">|||</span>
    <span class="season-banner-text">${text}</span>
    <span class="season-separator">|||</span>
    <span class="season-banner-text">${text}</span>
`;
    }

    initTheme() {
        const themeToggle = document.getElementById('theme-toggle');

        const setTheme = theme => {
            if (theme === 'dark') {
                document.body.classList.add('dark-theme');
                if (themeToggle) themeToggle.textContent = 'Светлая тема';
            } else {
                document.body.classList.remove('dark-theme');
                if (themeToggle) themeToggle.textContent = 'Темная тема';
            }
            localStorage.setItem('theme', theme);
        };

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const isDark = document.body.classList.contains('dark-theme');
                const newTheme = isDark ? 'light' : 'dark';
                setTheme(newTheme);
            });
        }

        setTheme('dark');
    }

    initTabs() {
        document.querySelectorAll('.tab-button').forEach(tabButton =>
            tabButton.addEventListener('click', async () => {
                const tabId = tabButton.dataset.tab;
/*
                if (tabId === 'tab0') {
                    const confirmed = window.confirm('Раздел "Крутилка" находится в разработке. Продолжить?');
                    if (!confirmed) {
                        await this.switchTab('tab1');
                        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                        document.querySelector('[data-tab="tab1"]').classList.add('active');
                        document.getElementById('tab1').classList.add('active');
                        return;
                    }
                }
*/
                await this.switchTab(tabId);
                document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                tabButton.classList.add('active');
                document.getElementById(tabId).classList.add('active');
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
        this.currentTabId = tabId;
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
    

    initFeedback() {
        const openBtn = document.getElementById('feedback-open-btn');
        const overlay = document.getElementById('feedback-modal-overlay');
        const cancelBtn = document.getElementById('feedback-cancel-btn');
        const sendBtn = document.getElementById('feedback-send-btn');
        const textarea = document.getElementById('feedback-text');
        const currentTabLabel = document.getElementById('feedback-current-tab');

        const previewContainer = document.getElementById('feedback-preview-container');
        const previewImg = document.getElementById('feedback-preview-img');
        const removeImgBtn = document.getElementById('feedback-remove-img');

        openBtn.addEventListener('click', () => {
            const tabButton = document.querySelector(`.tab-button[data-tab="${this.currentTabId}"]`);
            const tabName = tabButton ? tabButton.textContent : this.currentTabId;

            currentTabLabel.textContent = `Отправка из раздела: "${tabName}"`;
            overlay.style.display = 'flex';
            textarea.focus();
        });

        const closeModal = () => {
            overlay.style.display = 'none';
            textarea.value = '';
            this.clearFeedbackImage();
            sendBtn.disabled = false;
            sendBtn.textContent = 'Отправить';
        };

        cancelBtn.addEventListener('click', closeModal);

        this.clearFeedbackImage = () => {
            this.attachedFeedbackFile = null;
            previewImg.src = '';
            previewContainer.style.display = 'none';
        };

        removeImgBtn.addEventListener('click', this.clearFeedbackImage);

        textarea.addEventListener('paste', (event) => {
            const items = (event.clipboardData || event.originalEvent.clipboardData).items;
            for (const item of items) {
                if (item.type.indexOf('image') !== -1) {
                    const file = item.getAsFile();
                    this.attachedFeedbackFile = file;

                    const blobUrl = URL.createObjectURL(file);
                    previewImg.src = blobUrl;
                    previewContainer.style.display = 'block';

                    event.preventDefault();
                    break;
                }
            }
        });

        sendBtn.addEventListener('click', async () => {
            const text = textarea.value.trim();
            if (!text && !this.attachedFeedbackFile) {
                alert('Пожалуйста, введите текст сообщения или вставьте изображение.');
                return;
            }

            sendBtn.disabled = true;
            sendBtn.textContent = 'Отправка...';

            const tabButton = document.querySelector(`.tab-button[data-tab="${this.currentTabId}"]`);
            const tabName = tabButton ? tabButton.textContent : this.currentTabId;
            try {
                const formData = new FormData();
                formData.append(
                    'payload_json',
                    JSON.stringify({
                        embeds: [{
                            title: ' Новый фидбек',
                            description: text,
                            fields: [{ name: ' Вкладка', value: tabName }]
                        }]
                    })
                );

                if (this.attachedFeedbackFile) {
                    formData.append('file', this.attachedFeedbackFile, this.attachedFeedbackFile.name);
                }

                const decryptedWebhookUrl = reverseString(DISCORD_CONFIG.webhookUrl)
                const response = await fetch(decryptedWebhookUrl, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) throw new Error('Discord API Error');

                alert('Done');
                closeModal();
                return; 

            } catch (discordError) {
                console.warn('Сбой отправки в Discord, переключаемся на Telegram...', discordError);
            }

            function reverseString(str) {
                return str.split('').reverse().join('');
            }

            try {
                const decryptedToken = reverseString(TG_CONFIG.token);
                let url = `https://api.telegram.org/bot${decryptedToken}/sendMessage`;
                let tgFormData = new FormData();
                tgFormData.append('chat_id', TG_CONFIG.chatId);
                tgFormData.append('parse_mode', 'Markdown');

                const captionText = ` **Новый фидбек**\n\n **Вкладка:** ${tabName}\n **Сообщение:** ${text}`;

                if (this.attachedFeedbackFile) {
                    url = `https://api.telegram.org/bot${TG_CONFIG.token}/sendPhoto`;
                    tgFormData.append('photo', this.attachedFeedbackFile);
                    tgFormData.append('caption', captionText);
                } else {
                    tgFormData.append('text', captionText);
                }

                const response = await fetch(url, {
                    method: 'POST',
                    body: tgFormData
                });

                if (!response.ok) throw new Error('Telegram API Error');

                alert('Done');
                closeModal();
                return;

            } catch (tgError) {
                console.warn('Сбой отправки. Кидай мне в лс или в GitHub Issues. Перенаправление на GitHub Issues...', tgError);
            }

            const issueTitle = encodeURIComponent(`Фидбек из раздела: ${tabName}`);
            const issueBody = encodeURIComponent(
                `### Описание проблемы / Отзыв\n${text}\n\n` +
                `*Отправлено автоматически через форму фидбека.*`
            );

            const githubIssueUrl = `https://github.com/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repository}/issues/new?title=${issueTitle}&body=${issueBody}`;

            alert('Сбой отправки. Перенаправление на GitHub Issues...');

            window.open(githubIssueUrl, '_blank', 'noopener,noreferrer');

            if (this.attachedFeedbackFile) {
                alert('Отправка идет через GitHub, потребуется заново вставить изображение прямо в поле описания тикета на открывшейся странице.');
            }

            closeModal();
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const app = new App();
    await app.switchTab('tab1');
});