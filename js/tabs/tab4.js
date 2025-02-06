const LIBRARY_DATA_URL = 'data/library.json';

async function fetchLibraryData() {
    try {
        const response = await fetch(LIBRARY_DATA_URL);
        if (!response.ok) throw new Error(`Ошибка загрузки данных: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Ошибка при загрузке данных библиотеки:', error);
        return null;
    }
}

function createLibraryTab(data) {
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
    ratingSlider.min = '0';
    ratingSlider.max = '10';
    ratingSlider.value = '0';
    ratingSlider.className = 'rating-slider';

    const sliderLabel = document.createElement('span');
    sliderLabel.textContent = 'Не использовать';
    sliderLabel.className = 'slider-label';

    ratingSlider.addEventListener('input', () => {
        const value = ratingSlider.value;
        sliderLabel.textContent = value === '0' ? 'Не использовать' : `${value}/10`;
        filterGames(data.Library, searchInput.value.toLowerCase(), parseInt(value));
    });

    searchInput.addEventListener('input', () => filterGames(data.Library, searchInput.value.toLowerCase(), parseInt(ratingSlider.value)));

    ratingSliderContainer.appendChild(ratingSlider);
    ratingSliderContainer.appendChild(sliderLabel);
    searchBar.appendChild(searchInput);
    searchBar.appendChild(ratingSliderContainer);

    const authorsContainer = document.createElement('div');
    authorsContainer.className = 'authors-container';
    const uniqueAuthors = getUniqueAuthors(data.Library);

    uniqueAuthors.forEach(author => {
        const authorTag = document.createElement('button');
        authorTag.className = 'author-tag';
        authorTag.textContent = author;

        authorTag.addEventListener('click', () => {
            toggleActiveTag(authorTag, authorsContainer);
            filterGames(data.Library, searchInput.value.toLowerCase(), parseInt(ratingSlider.value), author);
        });

        authorsContainer.appendChild(authorTag);
    });

    const eventsContainer = document.createElement('div');
    eventsContainer.className = 'events-container';
    const uniqueEvents = getUniqueEvents(data.Library);

    uniqueEvents.forEach(event => {
        const eventTag = document.createElement('button');
        eventTag.className = 'event-tag';
        eventTag.textContent = event;

        eventTag.addEventListener('click', () => {
            toggleActiveTag(eventTag, eventsContainer);
            filterGames(data.Library, searchInput.value.toLowerCase(), parseInt(ratingSlider.value), null, event);
        });

        eventsContainer.appendChild(eventTag);
    });

    searchBar.appendChild(authorsContainer);
    searchBar.appendChild(eventsContainer);

    const resetButton = document.createElement('button');
    resetButton.textContent = 'Сбросить фильтры';
    resetButton.className = 'reset-button';
    resetButton.addEventListener('click', () => {
        searchInput.value = '';
        ratingSlider.value = '0';
        sliderLabel.textContent = 'Не использовать';
        clearActiveTags(authorsContainer);
        clearActiveTags(eventsContainer);
        filterGames(data.Library, '', 0);
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

    updateGamesGrid(data.Library, gamesGrid, sidebar);
}

function toggleActiveTag(tag, container) {
    container.querySelectorAll('.active-tag').forEach(activeTag => activeTag.classList.remove('active-tag'));
    tag.classList.add('active-tag');
}

function clearActiveTags(container) {
    container.querySelectorAll('.active-tag').forEach(tag => tag.classList.remove('active-tag'));
}

function updateGamesGrid(games, gamesGrid, sidebar) {
    gamesGrid.innerHTML = '';
    sidebar.classList.add('hidden');

    games.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        gameCard.style.backgroundImage = `url(${game.imageLink})`;

        const gameTitle = document.createElement('p');
        gameTitle.textContent = game.gameName;
        gameCard.appendChild(gameTitle);

        gameCard.addEventListener('click', () => showSidebar(game, sidebar));

        gamesGrid.appendChild(gameCard);
    });
}

function showSidebar(game, sidebar) {
    sidebar.innerHTML = '';
    const gamesGrid = document.querySelector('.games-grid');
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

    const averageScore = calculateAverageScore(game.reviews);
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

function filterGames(games, query, rating, author = null, event = null) {
    const filteredGames = games.filter(game => {
        const matchesQuery = game.gameName.toLowerCase().startsWith(query);
        const matchesRating = rating === 0 || game.reviews.some(review => review.reviewerScore === rating);
        const matchesAuthor = !author || game.reviews.some(review => review.reviewerName === author);
        const matchesEvent = !event || game.event.includes(event);
        return matchesQuery && matchesRating && matchesAuthor && matchesEvent;
    });

    const gamesGrid = document.querySelector('.games-grid');
    const sidebar = document.querySelector('.sidebar');
    updateGamesGrid(filteredGames, gamesGrid, sidebar);
}

function getUniqueAuthors(games) {
    const authors = new Set();
    games.forEach(game => game.reviews.forEach(review => authors.add(review.reviewerName)));
    return Array.from(authors);
}

function getUniqueEvents(games) {
    const events = new Set();
    games.forEach(game => {
        if (Array.isArray(game.event)) {
            game.event.forEach(event => events.add(event));
        } else {
            events.add(game.event);
        }
    });
    return Array.from(events);
}

function calculateAverageScore(reviews) {
    const totalScore = reviews.reduce((sum, review) => sum + review.reviewerScore, 0);
    return (totalScore / reviews.length).toFixed(1);
}

document.addEventListener('DOMContentLoaded', () =>
    fetchLibraryData().then(data => {
        if (data) {
            createLibraryTab(data);
        }
    }));
