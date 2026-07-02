import Api from '../modules/api.js';
import {Helpers} from '../modules/helpers.js';
import {Dom} from '../modules/dom.js';

const SELECTORS = {
    searchInput: '#search-input',
    suggestionsList: '#suggestions-list',
    infoBlocks: '.info-block'
};

class Tab1 {
    constructor() {
        this.elements = Dom.cacheSelectors(SELECTORS);
        this.init();
    }

    async init() {
        try {
            const data = await Api.fetchData('data/merged_final.json', 'games');
            this.games = data.applist.apps;
            this.setupEventListeners();
            this.initCalculator();
        } catch (error) {
            Helpers.handleError(error);
        }
    }

    setupEventListeners() {
        const debouncedSearch = Helpers.debounce(this.handleSearch.bind(this), 300);
        this.elements.searchInput.addEventListener('input', debouncedSearch);

        Dom.delegateEvent(this.elements.suggestionsList, 'click', 'li', e => this.handleSuggestionClick(e.target));

    }

    handleSearch(e) {
        const query = e.target.value.toLowerCase();
        const filtered = this.games.filter(game => game.name.toLowerCase().includes(query));
        this.renderSuggestions(filtered.slice(0, 10));
    }

    renderSuggestions(suggestions) {
        this.elements.suggestionsList.innerHTML = suggestions
            .map(game => `<li>${game.name}</li>`)
            .join('');
    }

    handleSuggestionClick(target) {
        const gameName = target.textContent;
        const game = this.games.find(g => g.name === gameName);
        if (game) {
            this.elements.searchInput.value = game.name;
            this.elements.suggestionsList.innerHTML = '';
            this.updateInfoBlocks(game);
        }
    }

    updateInfoBlocks(game) {
        const infoBlock1 = document.querySelector('.info-block:nth-of-type(1)');
        infoBlock1.innerHTML = `
      <h2>INFO</h2>
      <p><strong>App ID:</strong> ${game.appid}</p>
      <p><strong>Name:</strong> ${game.name}</p>
      <p><strong>Developer:</strong> ${game.developer}</p>
      <p><strong>Publisher:</strong> ${game.publisher}</p>
      <p><strong>Date:</strong> ${game.date}</p>
    `;

        const infoBlock2 = document.querySelector('.info-block:nth-of-type(2)');
        infoBlock2.innerHTML = `
      <h2>Steam Reviews</h2>
      <p><strong>Positive:</strong> ${game.positive}</p>
      <p><strong>Negative:</strong> ${game.negative}</p>
      <p><strong>SteamDB Rating:</strong> ${game.SteamDBRating.toFixed(2)}</p>
      <p><strong>Steam Rating:</strong> ${this.getSteamReviewsText(game.SteamDBRating)}</p>
    `;

        const infoBlock3 = document.querySelector('.info-block:nth-of-type(3)');
        infoBlock3.innerHTML = `
      <h2>Metacritic Review</h2>
      <p><strong>Score:</strong> ${game.score}</p>
      <p><strong>Link:</strong> <a href="${game.link}" target="_blank">${game.link}</a></p>
    `;

        const infoBlock4 = document.querySelector('.info-block:nth-of-type(4)');
        const timeToBeatText = game.timeToBeat.split('||').map(time => `${time.trim()} hours`).join('<br>');
        infoBlock4.innerHTML = `
      <h2>HowLongToBeat</h2>
      <p>${timeToBeatText}</p>
    `;
    }

    getSteamReviewsText(rating) {
        if (rating >= 90) return 'Overwhelmingly Positive';
        if (rating >= 80) return 'Very Positive';
        if (rating >= 70) return 'Mostly Positive';
        if (rating >= 50) return 'Mixed';
        return 'Mostly Negative';
    }

    initCalculator() {
        const hoursInput = document.getElementById('hours');
        const category1Select = document.getElementById('category1');
        const category2Select = document.getElementById('category2');
        const category3Select = document.getElementById('category3');
        const category4Select = document.getElementById('category4');
        const resultInput = document.getElementById('result');

        function parseNumber(value) {
            if (typeof value !== 'string') return 0;
            let cleanedValue = value.trim();
            cleanedValue = cleanedValue.replace(',', '.');
            const num = parseFloat(cleanedValue);
            return isNaN(num) ? 0 : num;
        }
        
        function calculateResult() {
            const hours = parseNumber(hoursInput.value);
            const cat1 = parseNumber(category1Select.value);
            const cat2 = parseNumber(category2Select.value);
            const cat3 = parseNumber(category3Select.value);
            const cat4 = parseNumber(category4Select.value);
            
            const result = hours * 10 * cat1 * cat2 * cat3 * cat4;
            resultInput.value = Math.round(result);
        }

        [hoursInput, category1Select, category2Select, category3Select, category4Select].forEach(input =>
            input.addEventListener('input', calculateResult)
        );
    }

    activate() {

    }

    deactivate() {
    }
}

export default Tab1;
