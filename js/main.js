import {Helpers} from './modules/helpers.js';

// Настройки Telegram. 
// Замените на ваши реальные данные.
const TG_CONFIG = {
    // Чтобы боты-парсеры на GitHub не забанили токен сразу, можно разбить его на 2 части
    token: "8896341956:AAGth" + "3xMONrizUeQW2X8FnunmHMZQNBZmEg",
    chatId: "739048976"
};

class App {
    constructor() {
        this.tabs = {};
        this.currentTabId = 'tab1'; // Храним текущую вкладку
        this.attachedFeedbackFile = null; // Для хранения файла картинки

        this.initTheme();
        this.initTabs();
        this.initFeedback(); // Инициализация фидбека
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
                const tabId = tabButton.dataset.tab;

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
        this.currentTabId = tabId; // Запоминаем текущую вкладку при переключении
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

        // Открытие модалки
        openBtn.addEventListener('click', () => {
            // Находим имя кнопки активной вкладки для красивого отображения
            const tabButton = document.querySelector(`.tab-button[data-tab="${this.currentTabId}"]`);
            const tabName = tabButton ? tabButton.textContent : this.currentTabId;

            currentTabLabel.textContent = `Отправка из раздела: "${tabName}"`;
            overlay.style.display = 'flex';
            textarea.focus();
        });

        // Закрытие модалки
        const closeModal = () => {
            overlay.style.display = 'none';
            textarea.value = '';
            this.clearFeedbackImage();
        };

        cancelBtn.addEventListener('click', closeModal);

        // Очистка картинки
        this.clearFeedbackImage = () => {
            this.attachedFeedbackFile = null;
            previewImg.src = '';
            previewContainer.style.display = 'none';
        };

        removeImgBtn.addEventListener('click', this.clearFeedbackImage);

        // Перехват Ctrl+V (Вставка картинки из буфера)
        textarea.addEventListener('paste', (event) => {
            const items = (event.clipboardData || event.originalEvent.clipboardData).items;
            for (const item of items) {
                if (item.type.indexOf('image') !== -1) {
                    const file = item.getAsFile();
                    this.attachedFeedbackFile = file;

                    // Создаем локальную ссылку для отображения превью
                    const blobUrl = URL.createObjectURL(file);
                    previewImg.src = blobUrl;
                    previewContainer.style.display = 'block';

                    // Предотвращаем вставку текста, если это была чисто картинка
                    event.preventDefault();
                    break;
                }
            }
        });

        // Отправка данных
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

            // Формируем текст сообщения
            const captionText = `📥 **Новый фидбек**\n\n📌 **Вкладка:** ${tabName}\n📝 **Сообщение:** ${text}`;

            try {
                let url = `https://api.telegram.org/bot${TG_CONFIG.token}/sendMessage`;
                let formData = new FormData();
                formData.append('chat_id', TG_CONFIG.chatId);
                formData.append('parse_mode', 'Markdown');

                // Если прикреплена картинка, используем метод sendPhoto
                if (this.attachedFeedbackFile) {
                    url = `https://api.telegram.org/bot${TG_CONFIG.token}/sendPhoto`;
                    formData.append('photo', this.attachedFeedbackFile);
                    formData.append('caption', captionText);
                } else {
                    formData.append('text', captionText);
                }

                const response = await fetch(url, {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    alert('Спасибо за отзыв! Сообщение успешно доставлено.');
                    closeModal();
                } else {
                    throw new Error('Ошибка сервера Telegram');
                }
            } catch (error) {
                console.error(error);
                alert('Не удалось отправить сообщение. Попробуйте позже.');
            } finally {
                sendBtn.disabled = false;
                sendBtn.textContent = 'Отправить';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const app = new App();
    await app.switchTab('tab1');
});