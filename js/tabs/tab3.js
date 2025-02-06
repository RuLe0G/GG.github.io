// URL к CSV-данным из Google Sheets
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQe2XYbj9llkG2wUoDJDkU1QdWh2S9YStYDyZpi5kUbfdf53b-2A9QyTd6Af2SbBNqBeQ0GSw9AaKAe/pub?output=csv';

class Tab3 {
    constructor() {
        this.init();
    }

    async init() {
        const data = await this.fetchData();
        if (data) {
            this.createAchievementPanels(data);
        }
    }

    async fetchData() {
        try {
            const response = await fetch(SHEET_URL);
            if (!response.ok) throw new Error(`Ошибка загрузки данных: ${response.status}`);
            const csvData = await response.text();
            return this.parseCSV(csvData);
        } catch (error) {
            console.error('Ошибка при загрузке данных:', error);
            return null;
        }
    }

    parseCSV(data) {
        const rows = data.split('\n').map(row => row.split(','));
        const headers = rows.shift();
        return {headers, rows};
    }

    createAchievementPanels({headers, rows}) {
        const container = document.getElementById('tab3');
        container.innerHTML = '';
        const playerNames = headers.slice(3);
        const players = playerNames.map(name => ({name, achievements: []}));
        const allAchievements = [];

        rows.forEach(row => {
            const rarity = row[0].trim();
            const imageUrl = row[1].trim();
            const achievementName = row[2].trim();
            allAchievements.push({name: achievementName, image: imageUrl});
            row.slice(3).forEach((value, index) => {
                if (value.trim() === '1') {
                    players[index].achievements.push({
                        name: achievementName,
                        image: imageUrl,
                        rarity
                    });
                }
            });
        });

        this.createAllAchievementsPanel(container, allAchievements);

        players.sort((a, b) => b.achievements.length - a.achievements.length);
        players.forEach(player => {
            const panel = document.createElement('div');
            panel.className = 'player-panel';
            const title = document.createElement('h3');
            title.textContent = `${player.name} (${player.achievements.length})`;
            title.style.textAlign = 'center';
            title.style.marginBottom = '10px';
            panel.appendChild(title);

            const achievementList = document.createElement('div');
            achievementList.className = 'achievement-list-horizontal';
            panel.appendChild(achievementList);

            player.achievements.forEach(achievement => {
                const card = document.createElement('div');
                card.className = 'achievement-card';
                if (achievement.rarity === 'Rare') card.classList.add('rare');
                const image = document.createElement('img');
                image.src = achievement.image;
                image.alt = achievement.name;
                image.width = 32;
                image.height = 32;
                card.appendChild(image);
                const text = document.createElement('p');
                text.textContent = achievement.name;
                text.style.margin = '0';
                text.style.padding = '5px';
                text.style.textAlign = 'center';
                card.appendChild(text);
                achievementList.appendChild(card);
            });

            container.appendChild(panel);
        });
    }

    createAllAchievementsPanel(container, allAchievements) {
        const toggleButton = document.createElement('button');
        toggleButton.className = 'toggle-achievements-button';
        toggleButton.textContent = 'Возможные достижения';

        const panel = document.createElement('div');
        panel.className = 'all-achievements-panel';
        panel.style.display = 'none';

        allAchievements.forEach(achievement => {
            const card = document.createElement('div');
            card.className = 'achievement-card monochrome';
            const image = document.createElement('img');
            image.src = achievement.image;
            image.alt = achievement.name;
            image.width = 32;
            image.height = 32;
            card.appendChild(image);
            const text = document.createElement('p');
            text.textContent = achievement.name;
            text.style.margin = '0';
            text.style.padding = '5px';
            text.style.textAlign = 'center';
            card.appendChild(text);
            panel.appendChild(card);
        });

        toggleButton.addEventListener('click', () => {
            panel.style.display = panel.style.display === 'none' ? 'grid' : 'none';
        });

        container.appendChild(toggleButton);
        container.appendChild(panel);
    }

    activate() {
    }

    deactivate() {
    }
}

export default Tab3;
