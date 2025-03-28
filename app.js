const tmdbAPIKey = '8015f104741271883e610d9c704183e4';
const rapidAPIKey = '9a3cca925dmsha133c7c1b3afc32p16c631jsn210637e396df';

async function searchContent() {
    const query = document.getElementById('searchQuery').value;
    const tmdbResults = await searchTMDb(query);
    console.log('TMDb Results:', tmdbResults);  // Log the results from TMDb
    displayResults(tmdbResults);
}

async function searchTMDb(query) {
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${tmdbAPIKey}&query=${query}&language=en-US&page=1&include_adult=false`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('TMDb API Response:', data);  // Log the full TMDb API response
        return data.results;
    } catch (error) {
        console.error('Error fetching TMDb data:', error);  // Log any errors from TMDb API
    }
}

async function getStreamingServices(id, mediaType = 'movie') {
    const country = document.getElementById('countrySelect').value; // If you add a country selector
    const url = `https://streaming-availability.p.rapidapi.com/v2/get/basic?tmdb_id=${id}&country=${country}&rapidapi-key=${rapidAPIKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('RapidAPI Streaming Data:', data); // Log the data from RapidAPI
        if (data && data.streams) {
            return data.streams;
        } else {
            console.log('No streaming data found.');
            return null; // If no streaming data is found
        }
    } catch (error) {
        console.error('Error fetching RapidAPI data:', error); // Log any errors from RapidAPI
        return null;
    }
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
                ${streamingServices ? Object.keys(streamingServices).map(service => `<li>${service}</li>`).join('') : "<li>No streaming data available</li>"}
            </ul>
        `;
        
        resultsDiv.appendChild(movieDiv);
    });
}
