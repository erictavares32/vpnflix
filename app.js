// API Configuration - Get these from RapidAPI
const RAPIDAPI_KEY = '9a3cca925dmsha133c7c1b3afc32p16c631jsn210637e396df'; 
const TMDB_API_KEY = '8015f104741271883e610d9c704183e4'; 

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('searchBtn').addEventListener('click', search);
  document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') search();
  });
});

async function search() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) {
    showError('Please enter a title to search');
    return;
  }

  showLoading(true);
  clearResults();

  try {
    // 1. Search TMDB for content ID (we still need this first)
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
    const streamingData = await getStreamingAvailability(content.id, content.media_type);
    displayStreamingInfo(streamingData);

  } catch (error) {
    showError('Failed to get streaming information');
    console.error('Search error:', error);
  } finally {
    showLoading(false);
  }
}

async function getStreamingAvailability(tmdbId, mediaType) {
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(
      `https://streaming-availability.p.rapidapi.com/get/basic?country=us&tmdb_id=${tmdbId}&type=${mediaType}`,
      options
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching from RapidAPI:', error);
    return null;
  }
}

function displayContentInfo(content) {
  const resultsDiv = document.getElementById('results');
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
        <h3>Streaming Availability</h3>
      </div>
      <div id="streamingInfo" class="card-body"></div>
    </div>
  `;
}

function displayStreamingInfo(data) {
  const streamingInfo = document.getElementById('streamingInfo');
  
  if (!data || !data.streamingInfo || Object.keys(data.streamingInfo).length === 0) {
    streamingInfo.innerHTML = '<p>No streaming information available for this title.</p>';
    return;
  }

  let html = '';
  
  // Display by country
  for (const [country, services] of Object.entries(data.streamingInfo)) {
    html += `<h5 class="mt-3">${getCountryName(country)}</h5>`;
    
    if (!services || services.length === 0) {
      html += '<p>Not available in this country</p>';
      continue;
    }

    html += '<div class="row">';
    
    services.forEach(service => {
      html += `
        <div class="col-md-6 mb-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <img src="${service.logo}" alt="${service.platform}" style="width: 40px; height: 40px; margin-right: 10px;">
                <h5 class="card-title mb-0">${service.platform}</h5>
              </div>
              <p class="card-text mt-2">
                <span class="badge bg-primary">${service.type}</span>
                ${service.price ? `<span class="badge bg-success ms-2">${service.price}</span>` : ''}
              </p>
              <a href="${service.link}" target="_blank" class="btn btn-sm btn-outline-primary">Watch Now</a>
            </div>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
  }
  
  streamingInfo.innerHTML = html;
}

function getCountryName(code) {
  const countries = {
    us: 'United States',
    gb: 'United Kingdom',
    ca: 'Canada',
    au: 'Australia',
    de: 'Germany',
    fr: 'France',
    jp: 'Japan',
    in: 'India',
    br: 'Brazil',
    mx: 'Mexico'
  };
  return countries[code.toLowerCase()] || code.toUpperCase();
}

// Helper functions
function showLoading(show) {
  document.getElementById('loading').style.display = show ? 'block' : 'none';
}

function clearResults() {
  document.getElementById('error').style.display = 'none';
  document.getElementById('results').innerHTML = '';
}

function showError(message) {
  const errorDiv = document.getElementById('error');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}
