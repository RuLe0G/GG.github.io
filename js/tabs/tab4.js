import Api from '../modules/api.js';
import {Helpers} from '../modules/helpers.js';
import {Dom} from '../modules/dom.js';

class Tab4 {
    constructor() {
        this.init();
    }

    async init() {
        try {
            this.data = await Api.fetchData('data/library.json', 'library');
            if (this.data) {
                this.createLibraryTab(this.data);
            }
        } catch (error) {
            Helpers.handleError(error);
        }
    }

    createLibraryTab(data) {
        const container = document.getElementById('tab4');
        container.innerHTML = '';

        const searchBar = document.createElement('div');
        searchBar.className = 'search-bar';

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Поиск по названию...';
        searchInput.className = 'search-input';

        const ratingSliderContainer = document.createElement('div');
        ratingSliderContainer.className = 'slider-container';

        const ratingSlider = document.createElement('input');
        ratingSlider.type = 'range';
        ratingSlider.min = '-1';
        ratingSlider.max = '10';
        ratingSlider.value = '-1';
        ratingSlider.className = 'rating-slider';

        const sliderLabel = document.createElement('span');
        sliderLabel.textContent = 'Не использовать';
        sliderLabel.className = 'slider-label';

        ratingSlider.addEventListener('input', () => {
            const value = parseInt(ratingSlider.value, 10);
            if (value === -1) {
                sliderLabel.textContent = 'Не использовать';
            } else {
                sliderLabel.textContent = `${value}/10`;
            }
            this.filterGames(data.Library, searchInput.value.toLowerCase(), value);
        });

        searchInput.addEventListener('input', () =>
            this.filterGames(data.Library, searchInput.value.toLowerCase(), parseInt(ratingSlider.value, 10))
        );

        ratingSliderContainer.appendChild(ratingSlider);
        ratingSliderContainer.appendChild(sliderLabel);
        searchBar.appendChild(searchInput);
        searchBar.appendChild(ratingSliderContainer);

        // Фильтрация по авторам
        const authorsContainer = document.createElement('div');
        authorsContainer.className = 'authors-container';
        const uniqueAuthors = this.getUniqueAuthors(data.Library);
        uniqueAuthors.forEach(author => {
            const btn = document.createElement('button');
            btn.className = 'author-tag';
            btn.textContent = author;
            btn.addEventListener('click', () => {
                this.toggleActiveTag(btn, authorsContainer);
                this.filterGames(data.Library, searchInput.value.toLowerCase(), parseInt(ratingSlider.value), author);
            });
            authorsContainer.appendChild(btn);
        });
        searchBar.appendChild(authorsContainer);

        // Фильтрация по событиям
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'events-container';
        const uniqueEvents = this.getUniqueEvents(data.Library);
        uniqueEvents.forEach(event => {
            const btn = document.createElement('button');
            btn.className = 'event-tag';
            btn.textContent = event;
            btn.addEventListener('click', () => {
                this.toggleActiveTag(btn, eventsContainer);
                this.filterGames(data.Library, searchInput.value.toLowerCase(), parseInt(ratingSlider.value), null, event);
            });
            eventsContainer.appendChild(btn);
        });
        searchBar.appendChild(eventsContainer);

        const resetButton = document.createElement('button');
        resetButton.textContent = 'Сбросить фильтры';
        resetButton.className = 'reset-button';
        resetButton.addEventListener('click', () => {
            searchInput.value = '';
            ratingSlider.value = '-1';
            sliderLabel.textContent = 'Не использовать';
            this.clearActiveTags(authorsContainer);
            this.clearActiveTags(eventsContainer);
            this.filterGames(data.Library, '', -1);
        });
        searchBar.appendChild(resetButton);

        container.appendChild(searchBar);

        const gamesGrid = document.createElement('div');
        gamesGrid.className = 'games-grid';
        container.appendChild(gamesGrid);

        const sidebar = document.createElement('div');
        sidebar.className = 'sidebar hidden';
        const closeButton = document.createElement('button');
        closeButton.className = 'close-sidebar';
        closeButton.textContent = '✕';
        closeButton.addEventListener('click', () => {
            sidebar.classList.add('hidden');
            gamesGrid.classList.remove('collapsed');
        });
        sidebar.appendChild(closeButton);
        container.appendChild(sidebar);

        this.updateGamesGrid(data.Library, gamesGrid, sidebar);

        Dom.delegateEvent(gamesGrid, 'click', '.game-card', e => {
            const gameId = e.target.closest('.game-card').dataset.gameId;
            const game = data.Library.find(g => g.gameName === gameId);
            if (game) this.showSidebar(game, sidebar, gamesGrid);
        });
    }

    updateGamesGrid(games, gamesGrid, sidebar) {
        gamesGrid.innerHTML = '';
        sidebar.classList.add('hidden');
        games.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';
            gameCard.style.backgroundImage = `url(${game.imageLink})`;
            gameCard.dataset.gameId = game.gameName;
            const gameTitle = document.createElement('p');
            gameTitle.textContent = game.gameName;
            gameCard.appendChild(gameTitle);
            gamesGrid.appendChild(gameCard);
        });
    }

    showSidebar(game, sidebar, gamesGrid) {
        sidebar.innerHTML = '';
        const closeButton = document.createElement('button');
        closeButton.className = 'close-sidebar';
        closeButton.textContent = '✕';
        closeButton.addEventListener('click', () => {
            sidebar.classList.add('hidden');
            gamesGrid.classList.remove('collapsed');
        });
        sidebar.appendChild(closeButton);

        const title = document.createElement('h2');
        title.textContent = game.gameName;
        const image = document.createElement('img');
        image.src = game.imageLink;
        image.alt = game.gameName;
        image.className = 'sidebar-image';
        const averageScore = this.calculateAverageScore(game.reviews);
        const averageScoreText = document.createElement('p');
        averageScoreText.textContent = `Средняя оценка: ${averageScore}/10`;
        const reviewsContainer = document.createElement('div');
        reviewsContainer.className = 'reviews-container';

        game.reviews.forEach(review => {
            const reviewCard = document.createElement('div');
            reviewCard.className = 'review-card';
            const reviewerName = document.createElement('h4');
            reviewerName.textContent = review.reviewerName;
            const reviewerScore = document.createElement('p');
            reviewerScore.textContent = `Оценка: ${review.reviewerScore}/10`;
            const reviewerText = document.createElement('p');
            reviewerText.textContent = review.reviewerText;
            reviewCard.appendChild(reviewerName);
            reviewCard.appendChild(reviewerScore);
            reviewCard.appendChild(reviewerText);
            reviewsContainer.appendChild(reviewCard);
        });

        sidebar.appendChild(title);
        sidebar.appendChild(image);
        sidebar.appendChild(averageScoreText);
        sidebar.appendChild(reviewsContainer);
        sidebar.classList.remove('hidden');
        gamesGrid.classList.add('collapsed');
    }

    filterGames(games, query, rating, author = null, event = null) {
        const filteredGames = games.filter(game => {
            const matchesQuery = game.gameName.toLowerCase().startsWith(query);
            const matchesRating = rating === -1
                ? true
                : game.reviews.some(review => review.reviewerScore === rating);

            const matchesAuthor = !author || game.reviews.some(review => review.reviewerName === author);
            const matchesEvent = !event || game.event.includes(event);

            return matchesQuery && matchesRating && matchesAuthor && matchesEvent;
        });

        const gamesGrid = document.querySelector('.games-grid');
        const sidebar = document.querySelector('.sidebar');
        this.updateGamesGrid(filteredGames, gamesGrid, sidebar);
    }

    getUniqueAuthors(games) {
        const authors = new Set();
        games.forEach(game => game.reviews.forEach(review => authors.add(review.reviewerName)));
        return Array.from(authors);
    }

    getUniqueEvents(games) {
        const events = new Set();
        games.forEach(game => {
            if (Array.isArray(game.event)) {
                game.event.forEach(e => events.add(e));
            } else {
                events.add(game.event);
            }
        });
        return Array.from(events);
    }

    calculateAverageScore(reviews) {
        const totalScore = reviews.reduce((sum, review) => sum + review.reviewerScore, 0);
        return (totalScore / reviews.length).toFixed(1);
    }

    toggleActiveTag(tag, container) {
        container.querySelectorAll('.active-tag').forEach(activeTag => activeTag.classList.remove('active-tag'));
        tag.classList.add('active-tag');
    }

    clearActiveTags(container) {
        container.querySelectorAll('.active-tag').forEach(tag => tag.classList.remove('active-tag'));
    }

    activate() {
    }

    deactivate() {
    }
}

export default Tab4;
