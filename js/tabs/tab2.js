import Api from '../modules/api.js';
import {Helpers} from '../modules/helpers.js';
import {Dom} from '../modules/dom.js';

class Tab2 {
    constructor() {
        this.elements = Dom.cacheSelectors({
            currentEvent: '#current-event',
            pastEvents: '#past-events'
        });
        this.init();
    }

    async init() {
        try {
            const data = await Api.fetchData('data/events.json', 'events');
            this.events = data.events;
            this.renderCurrentEvent();
            this.renderPastEvents(this.events);
            Dom.delegateEvent(this.elements.pastEvents, 'click', '.player-card', e => this.handlePlayerClick(e.target.closest('.player-card')));
        } catch (error) {
            Helpers.handleError(error);
        }
    }

    renderCurrentEvent() {
        const currentEventPanel = this.elements.currentEvent;
        const eventDate = new Date('2025-07-01T00:00:00');
        const updateTimer = () => {
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
        <p>Гряжет веселуха. Готовь списки и жопу</p>
        <p>Осталось врмени:</p>
        <div id="timer">
          ${days} дней, ${hours} часов, ${minutes} минут, ${seconds} секунд
        </div>
      `;
        };
        updateTimer();
        const timerInterval = setInterval(updateTimer, 1000);
    }

    renderPastEvents(events) {
        const pastEventsPanel = this.elements.pastEvents;
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

    handlePlayerClick(playerCard) {
    }

    activate() {
    }

    deactivate() {
    }
}

export default Tab2;
