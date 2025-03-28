// app.js - Complete Browser-Compatible Version
document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  const resultsDiv = document.getElementById('results');
  const loadingDiv = document.getElementById('loading');
  const errorDiv = document.getElementById('error');
  const emptyState = document.getElementById('empty-state');

  // API Configuration
  const RAPIDAPI_KEY = '9a3cca925dmsha133c7c1b3afc32p16c631jsn210637e396df';
  const TMDB_API_KEY = '8015f104741271883e610d9c704183e4'; 

  // Event Listeners
  searchBtn.addEventListener('click', executeSearch);
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') executeSearch();
  });

  async function executeSearch() {
    const query = searchInput.value.trim();
    if (!query) {
      showError('Please enter a movie or TV show name');
      return;
    }

    showLoading(true);
    clearResults();

    try {
      // 1. Search TMDB first
      const content = await searchTMDB(query);
      if (!content) {
        showError('Content not found');
        return;
      }

      displayContentInfo(content);

      // 2. Get streaming availability
      const contentType = content.media_type === 'movie' ? 'movie' : 'show';
      const streamingData = await fetchStreamingInfo(content.id, contentType);
      
      if (!streamingData) {
        showError('No streaming data available');
        return;
      }

      displayStreamingInfo(streamingData);
      
    } catch (error) {
      showError(`Failed to get streaming information: ${error.message}`);
      console.error('Search error:', error);
    } finally {
      showLoading(false);
    }
  }

  async function searchTMDB(query) {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      return data.results?.[0]; // Return first result
    } catch (error) {
      console.error('TMDB search error:', error);
      return null;
    }
  }

  async function fetchStreamingInfo(id, type) {
    try {
      const response = await fetch(
        `https://streaming-availability.p.rapidapi.com/${type}/${id}`,
        {
          headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': 'streaming-availability.p.rapidapi.com'
          }
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Streaming info error:', error);
      return null;
    }
  }

  function displayContentInfo(content) {
    emptyState.style.display = 'none';
    resultsDiv.innerHTML = `
      <div class="card mb-4 shadow-sm">
        <div class="row g-0">
          <div class="col-md-4">
            <img src="${content.poster_path ? 
              `https://image.tmdb.org/t/p/w500${content.poster_path}` : 
              'https://via.placeholder.com/500x750?text=No+Poster'}" 
                 class="poster card-img-top" alt="${content.title || content.name}">
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
      <div class="card shadow-sm">
        <div class="card-header bg-primary text-white">
          <h3 class="mb-0"><i class="bi bi-play-btn"></i> Where to Watch</h3>
        </div>
        <div id="streamingInfo" class="card-body"></div>
      </div>
    `;
  }

  function displayStreamingInfo(data) {
    const streamingInfo = document.getElementById('streamingInfo');
    
    if (!data?.streamingInfo || Object.keys(data.streamingInfo).length === 0) {
      streamingInfo.innerHTML = `
        <div class="alert alert-info">
          <i class="bi bi-info-circle"></i> No streaming information available
        </div>
      `;
      return;
    }

    let html = '';
    for (const [country, services] of Object.entries(data.streamingInfo)) {
      if (!services || services.length === 0) continue;
      
      html += `
        <div class="country-header">
          <i class="bi bi-globe"></i> ${country.toUpperCase()}
        </div>
        <div class="row row-cols-1 row-cols-md-2 g-3">
      `;
      
      services.forEach(service => {
        html += `
          <div class="col">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex align-items-center mb-2">
                  ${service.logo ? 
                    `<img src="${service.logo}" alt="${service.platform}" 
                          style="width: 40px; height: 40px; margin-right: 10px;">` : 
                    `<i class="bi bi-tv" style="font-size: 1.5rem; margin-right: 10px;"></i>`}
                  <h5 class="card-title mb-0">${service.platform}</h5>
                </div>
                <div class="mb-2">
                  <span class="badge bg-primary">${service.type}</span>
                  ${service.price ? `<span class="badge bg-success ms-2">${service.price}</span>` : ''}
                </div>
                <a href="${service.link || '#'}" target="_blank" 
                   class="btn btn-sm btn-outline-primary w-100">
                  <i class="bi bi-play-fill"></i> Watch Now
                </a>
              </div>
            </div>
          </div>
        `;
      });
      
      html += `</div>`; // Close row
    }

    streamingInfo.innerHTML = html || `
      <div class="alert alert-warning">
        <i class="bi bi-exclamation-triangle"></i> No available services found
      </div>
    `;
  }

  function showLoading(show) {
    loadingDiv.style.display = show ? 'flex' : 'none';
    if (show) {
      emptyState.style.display = 'none';
    }
  }

  function clearResults() {
    errorDiv.style.display = 'none';
    resultsDiv.innerHTML = '';
  }

  function showError(message) {
    document.getElementById('error-message').textContent = message;
    errorDiv.style.display = 'block';
  }
});
