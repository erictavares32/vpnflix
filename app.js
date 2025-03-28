document.addEventListener('DOMContentLoaded', function() {
  // Configuration
  const RAPIDAPI_KEY = '9a3cca925dmsha133c7c1b3afc32p16c631jsn210637e396df';
  const TMDB_API_KEY = '8015f104741271883e610d9c704183e4';

  // Elements
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  const resultsDiv = document.getElementById('results');
  const loadingDiv = document.getElementById('loading');
  const errorDiv = document.getElementById('error');

  // Event Listeners
  searchBtn.addEventListener('click', searchContent);
  searchInput.addEventListener('keypress', (e) => e.key === 'Enter' && searchContent());

  async function searchContent() {
    const query = searchInput.value.trim();
    if (!query) {
      showError('Please enter a movie or TV show name');
      return;
    }

    showLoading(true);
    clearResults();

    try {
      // 1. Search TMDB
      const tmdbResponse = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
      const tmdbData = await tmdbResponse.json();

      if (!tmdbData.results?.length) {
        showError('No results found');
        return;
      }

      const content = tmdbData.results[0];
      displayContentInfo(content);

      // 2. Get streaming info
      const streamingInfo = await getStreamingInfo(content.id, content.media_type);
      displayStreamingInfo(streamingInfo);

    } catch (error) {
      showError('Failed to get streaming information');
      console.error('Search error:', error);
    } finally {
      showLoading(false);
    }
  }

async function getStreamingAvailability(tmdbId, mediaType) {
  const type = mediaType === 'movie' ? 'movies' : 'shows';
  const url = `https://streaming-availability.p.rapidapi.com/get/basic?country=us&tmdb_id=${tmdbId}&type=${type}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': '9a3cca925dmsha133c7c1b3afc32p16c631jsn210637e396df',
        'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
      }
    });

    if (!response.ok) throw new Error('API request failed');
    
    const data = await response.json();
    return data.streamingInfo?.us || null;
    
  } catch (error) {
    console.error('Streaming availability error:', error);
    return null;
  }
}

  function displayContentInfo(content) {
    resultsDiv.innerHTML = `
      <div class="card mb-4">
        <div class="row g-0">
          <div class="col-md-4">
            <img src="${content.poster_path ? `https://image.tmdb.org/t/p/w500${content.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'}" 
                 class="img-fluid rounded-start" alt="${content.title || content.name}">
          </div>
          <div class="col-md-8">
            <div class="card-body">
              <h2 class="card-title">${content.title || content.name}</h2>
              <p class="card-text">${content.overview || 'No description available'}</p>
              <p class="card-text">
                <small class="text-muted">
                  ${content.release_date || content.first_air_date || 'Unknown date'} • 
                  ${content.media_type === 'movie' ? 'Movie' : 'TV Show'}
                </small>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3>Streaming Availability</h3>
        </div>
        <div id="streamingResults" class="card-body"></div>
      </div>
    `;
  }

  function displayStreamingInfo(data) {
    const streamingResults = document.getElementById('streamingResults');
    
    if (!data?.streamingInfo?.us) {
      streamingResults.innerHTML = `
        <div class="alert alert-warning">
          No streaming information available for this title.
          <br><small>Try searching for more popular titles.</small>
        </div>
      `;
      return;
    }

    const services = data.streamingInfo.us;
    let html = '<div class="row">';

    services.forEach(service => {
      html += `
        <div class="col-md-6 mb-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex align-items-center mb-2">
                <img src="${service.logo}" alt="${service.platform}" 
                     style="width: 40px; height: 40px; margin-right: 10px;">
                <h5 class="card-title mb-0">${service.platform}</h5>
              </div>
              <p class="card-text">
                <span class="badge bg-primary">${service.type}</span>
                ${service.price ? `<span class="badge bg-success ms-2">${service.price}</span>` : ''}
              </p>
              <a href="${service.link}" target="_blank" class="btn btn-sm btn-primary">Watch Now</a>
            </div>
          </div>
        </div>
      `;
    });

    html += '</div>';
    streamingResults.innerHTML = html || `
      <div class="alert alert-warning">
        No active streaming services found for this title.
      </div>
    `;
  }

  function showLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
  }

  function clearResults() {
    errorDiv.style.display = 'none';
    resultsDiv.innerHTML = '';
  }

  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }
});
