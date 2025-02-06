fetch('data/merged.json')
    .then(response => {
        if (!response.ok) throw new Error(`Failed to load data: ${response.status}`);
        return response.json();
    })
    .then(data => {
        const suggestions = data.applist.apps;

        const searchInput = document.getElementById('search-input');
        const suggestionsList = document.getElementById('suggestions-list');

        searchInput.addEventListener('input', () => {
            const userInput = searchInput.value.toLowerCase();

            const filteredSuggestions = suggestions.filter(suggestion =>
                suggestion.name.toLowerCase().startsWith(userInput)
            );

            suggestionsList.innerHTML = '';

            const limitedSuggestions = filteredSuggestions.slice(0, 10);

            limitedSuggestions.forEach(suggestion => {
                const li = document.createElement('li');
                li.textContent = suggestion.name;

                li.addEventListener('click', () => {
                    searchInput.value = suggestion.name;
                    suggestionsList.innerHTML = '';
                    updateInfoBlocks(suggestion);
                });

                suggestionsList.appendChild(li);
            });
        });
    })
    .catch(error => console.error('Error loading JSON:', error));

function updateInfoBlocks(app) {
    const {
        appid, name, developer, publisher, date,
        positive, negative, timeToBeat, score, link, SteamDBRating
    } = app;

    document.querySelector('.info-block:nth-of-type(1)').innerHTML = `
    <h2>INFO</h2>
    <p><strong>App ID:</strong> ${appid}</p>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Developer:</strong> ${developer}</p>
    <p><strong>Publisher:</strong> ${publisher}</p>
    <p><strong>Date:</strong> ${date}</p>
  `;

    document.querySelector('.info-block:nth-of-type(2)').innerHTML = `
    <h2>Steam Reviews</h2>
    <p><strong>Positive:</strong> ${positive}</p>
    <p><strong>Negative:</strong> ${negative}</p>
    <p><strong>SteamDB Rating:</strong> ${SteamDBRating.toFixed(2)}</p>
    <p><strong>Steam Rating:</strong> ${getSteamReviewsText(SteamDBRating)}</p>
  `;

    document.querySelector('.info-block:nth-of-type(3)').innerHTML = `
    <h2>Metacritic Review</h2>
    <p><strong>Score:</strong> ${score}</p>
    <p><strong>Link:</strong> <a href="${link}" target="_blank">${link}</a></p>
  `;

    const timeToBeatText = timeToBeat.split('||').map(time => `${time.trim()} hours`).join('<br>');
    document.querySelector('.info-block:nth-of-type(4)').innerHTML = `
    <h2>HowLongToBeat</h2>
    <p>${timeToBeatText}</p>
  `;
}

function getSteamReviewsText(rating) {
    if (rating >= 90) return 'Overwhelmingly Positive';
    if (rating >= 80) return 'Very Positive';
    if (rating >= 70) return 'Mostly Positive';
    if (rating >= 50) return 'Mixed';
    return 'Mostly Negative';
}

// calculator
const hoursInput = document.getElementById('hours');
const category1Select = document.getElementById('category1');
const category2Select = document.getElementById('category2');
const resultInput = document.getElementById('result');

function calculateResult() {
    const hours = parseFloat(hoursInput.value) || 0;
    const category1 = parseFloat(category1Select.value) || 1;
    const category2 = parseFloat(category2Select.value) || 1;

    const result = hours * 10 * category1 * category2;
    resultInput.value = result.toFixed(2);
}

[hoursInput, category1Select, category2Select].forEach(input =>
    input.addEventListener('input', calculateResult)
);
