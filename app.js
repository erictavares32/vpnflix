const tmdbAPIKey = '8015f104741271883e610d9c704183e4';
const rapidAPIKey = '9a3cca925dmsha133c7c1b3afc32p16c631jsn210637e396df';

async function searchContent() {
    const query = document.getElementById('searchQuery').value;
    const tmdbResults = await searchTMDb(query);
    displayResults(tmdbResults);
}

async function searchTMDb(query) {
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${tmdbAPIKey}&query=${query}&language=en-US&page=1&include_adult=false`;

    const response = await fetch(url);
    const data = await response.json();
    return data.results;
}

async function getStreamingServices(id, mediaType = 'movie') {
    const url = `https://streaming-availability.p.rapidapi.com/v2/get/basic?tmdb_id=${id}&country=US&rapidapi-key=${rapidAPIKey}`;

    const response = await fetch(url);
    const data = await response.json();
    return data;
}

function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    results.forEach(async (item) => {
        if (item.media_type !== 'movie' && item.media_type !== 'tv') return;

        const streamingServices = await getStreamingServices(item.id, item.media_type);
        
        const movieDiv = document.createElement('div');
        movieDiv.classList.add('movie');
        movieDiv.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${item.title || item.name}">
            <h3>${item.title || item.name}</h3>
            <p>${item.overview || "No description available"}</p>
            <h4>Available on:</h4>
            <ul>
                ${streamingServices.streams ? Object.keys(streamingServices.streams).map(service => `<li>${service}</li>`).join('') : "<li>No streaming data available</li>"}
            </ul>
        `;
        
        resultsDiv.appendChild(movieDiv);
    });
}
