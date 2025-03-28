// app.js - Complete Streaming Availability Checker
document.addEventListener('DOMContentLoaded', function() {
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  const resultsDiv = document.getElementById('results');
  const loadingDiv = document.getElementById('loading');
  const errorDiv = document.getElementById('error');

  // Configure API
  const RAPIDAPI_KEY = '9a3cca925dmsha133c7c1b3afc32p16c631jsn210637e396df';
  const TMDB_API_KEY = '8015f104741271883e610d9c704183e4';

  searchBtn.addEventListener('click', search);
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') search();
  });

  async function search() {
    const query = searchInput.value.trim();
    if (!query) {
      showError('Please enter a movie or TV show name');
      return;
    }

    showLoading(true);
    clearResults();

    try {
      // 1. First search TMDB for the content
      const tmdbResponse = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
      );
      const tmdbData = await tmdbResponse.json();

      if (!tmdbData.results || tmdbData.results.length === 0) {
        showError('No results found');
        return;
      }

      // Take first result (most relevant)
      const content = tmdbData.results[0];
      displayContentInfo(content);

      // 2. Get streaming availability from RapidAPI
      const contentType = content.media_type === 'movie' ? 'movie' : 'show';
      const streamingData = await getStreamingAvailability(content.id, contentType);
      displayStreamingInfo(streamingData);

    } catch (error) {
      showError('Failed to get streaming information: ' + error.message);
      console.error('Search error:', error);
    } finally {
      showLoading(false);
    }
  }

  async function getStreamingAvailability(id, type) {
    const options = {
      method: 'GET',
      hostname: 'streaming-availability.p.rapidapi.com',
      path: `/${type}/${id}`,
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'streaming-availability.p.rapidapi.com'
      }
    };

    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Failed to parse response'));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
  }

  function displayContentInfo(content) {
    resultsDiv.innerHTML = `
      <div class="card mb-4">
        <div class="row g-0">
          <div class="col-md-4">
            <img src="${content.poster_path ? `https://image.tmdb.org/t/p/w500${content.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'}" 
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
      <div class="card">
        <div class="card-header">
          <h3>Where to Watch</h3>
        </div>
        <div id="streamingInfo" class="card-body"></div>
      </div>
    `;
  }

  function displayStreamingInfo(data) {
    const streamingInfo = document.getElementById('streamingInfo');
    
    if (!data || !data.streamingInfo || Object.keys(data.streamingInfo).length === 0) {
      streamingInfo.innerHTML = '<p>No streaming information available</p>';
      return;
    }

    let html = '';
    for (const [country, services] of Object.entries(data.streamingInfo)) {
      html += `<h5 class="mt-3">${country.toUpperCase()}</h5>`;
      
      if (!services || services.length === 0) {
        html += '<p>Not available in this country</p>';
        continue;
      }

      services.forEach(service => {
        html += `
          <div class="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
            <div>
              <strong>${service.platform}</strong>
              <div class="text-muted small">${service.type} ${service.price ? `• ${service.price}` : ''}</div>
            </div>
            <a href="${service.link}" target="_blank" class="btn btn-sm btn-primary">
              Watch Now
            </a>
          </div>
        `;
      });
    }

    streamingInfo.innerHTML = html;
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
