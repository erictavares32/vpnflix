// API configuration
const TMDB_API_KEY = '8015f104741271883e610d9c704183e4'; // Replace with your TMDB API key
const RAPIDAPI_KEY = '9a3cca925dmsha133c7c1b3afc32p16c631jsn210637e396df'; // Your RapidAPI key

// DOM elements
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const countrySelect = document.getElementById('country-select');
const resultsContainer = document.getElementById('results');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error-message');

// Event listeners
searchButton.addEventListener('click', searchMedia);
searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchMedia();
    }
});

// Main search function
async function searchMedia() {
    const query = searchInput.value.trim();
    const country = countrySelect.value;
    
    if (!query) {
        showError('Please enter a movie or TV show name');
        return;
    }
    
    clearResults();
    showLoading();
    hideError();
    
    try {
        // First search TMDB for the movie/show
        const tmdbResults = await searchTMDB(query);
        
        if (tmdbResults.length === 0) {
            showError('No results found. Try a different search term.');
            return;
        }
        
        // For each result, get streaming availability
        for (const item of tmdbResults) {
            const streamingInfo = await getStreamingAvailability(item.id, item.media_type, country);
            displayResult(item, streamingInfo);
        }
    } catch (error) {
        console.error('Error:', error);
        showError('An error occurred while fetching data. Please try again.');
    } finally {
        hideLoading();
    }
}

// Search TMDB for movies/shows
async function searchTMDB(query) {
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    return data.results.map(item => ({
        id: item.id,
        title: item.title || item.name,
        overview: item.overview,
        poster_path: item.poster_path,
        media_type: item.media_type,
        year: (item.release_date || item.first_air_date) ? (item.release_date || item.first_air_date).substring(0, 4) : 'N/A'
    }));
}

// Get streaming availability from RapidAPI
async function getStreamingAvailability(id, type, country) {
    const url = `https://streaming-availability.p.rapidapi.com/shows/${type}/${id}?country=${country}`;
    
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': 'streaming-availability.p.rapidapi.com'
        }
    };
    
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (data && data.streamingInfo && data.streamingInfo[country]) {
            return data.streamingInfo[country];
        }
        return [];
    } catch (error) {
        console.error('Error fetching streaming info:', error);
        return [];
    }
}

// Display a result card
function displayResult(item, streamingInfo) {
    const posterUrl = item.poster_path 
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Poster';
    
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    card.innerHTML = `
        <img src="${posterUrl}" alt="${item.title}" class="movie-poster">
        <div class="movie-info">
            <h3 class="movie-title">${item.title}</h3>
            <p class="movie-year">${item.year} • ${item.media_type === 'movie' ? 'Movie' : 'TV Show'}</p>
            <p>${item.overview || 'No overview available.'}</p>
            
            <div class="streaming-info">
                <h4>Available on:</h4>
                ${streamingInfo.length > 0 
                    ? streamingInfo.map(service => 
                        `<span class="streaming-service">${service.service}</span>`
                      ).join('')
                    : '<p>Not available on any streaming service in this country.</p>'}
            </div>
        </div>
    `;
    
    resultsContainer.appendChild(card);
}

// Helper functions
function clearResults() {
    resultsContainer.innerHTML = '';
}

function showLoading() {
    loadingElement.style.display = 'block';
}

function hideLoading() {
    loadingElement.style.display = 'none';
}

function showError(message) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function hideError() {
    errorElement.style.display = 'none';
}
