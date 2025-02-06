fetch('data/events.json')
    .then(response => {
        if (!response.ok) throw new Error(`Failed to load data: ${response.status}`);
        return response.json();
    })
    .then(jsonData => {
        renderCurrentEvent();

        const pastEvents = jsonData.events;
        renderPastEvents(pastEvents);
    })
    .catch(error => console.error("Ошибка загрузки данных:", error));

function renderCurrentEvent() {
    const currentEventPanel = document.getElementById('current-event');
    const eventDate = new Date('2025-06-04T00:00:00');

    function updateTimer() {
        const now = new Date();
        const timeDiff = eventDate - now;

        if (timeDiff <= 0) {
            currentEventPanel.innerHTML = `
                <h2>Текущий Рулетыч</h2>
                <p>Рулетыча нет</p>
                <p>Но можно поздравить меня с днем рождения!</p>
            `;
            clearInterval(timerInterval);
            return;
        }

        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        currentEventPanel.innerHTML = `
            <h2>Текущий Рулетыч</h2>
            <p>Рулетыча нет</p>
            <p>Но до моего дня рождения:</p>
            <div id="timer">
                ${days} дней, ${hours} часов, ${minutes} минут, ${seconds} секунд
            </div>
        `;
    }

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
}

function renderPastEvents(events) {
    const pastEventsPanel = document.getElementById('past-events');
    pastEventsPanel.innerHTML = `<h2>Старые события</h2>`;

    if (!events || events.length === 0) {
        pastEventsPanel.innerHTML += `<p>А их нет...</p>`;
        return;
    }

    events.forEach(event => {
        const eventBlock = document.createElement('div');
        eventBlock.className = 'event-panel';
        eventBlock.style.textAlign = 'center';

        eventBlock.innerHTML = `
            <h3>${event.eventName}</h3>
            <p>Приз: ${event.prize}</p>
            <div class="player-list"></div>
        `;

        const playerList = eventBlock.querySelector('.player-list');

        const sortedPlayers = [...event.players].sort((a, b) => (a.place || Infinity) - (b.place || Infinity));

        sortedPlayers.forEach(player => {
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card';

            playerCard.innerHTML = `
                <img src="resources/${player.place}.png" alt="${player.name}">
                <div class="player-info">
                    <strong>${player.name}</strong><br>
                    Игры: ${player.gamesCount}
                </div>
                <div class="details">
                    Очки: ${player.score}<br>
                    Дропы: ${player.dropped}<br>
                    Бонусы: ${player.bonuses}<br>
                    <button onclick="window.open('${player.link}', '_blank')">Профиль</button>
                </div>
            `;

            playerList.appendChild(playerCard);
        });

        pastEventsPanel.appendChild(eventBlock);
    });
}