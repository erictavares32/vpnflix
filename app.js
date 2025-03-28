// API Keys - Replace with your own
const TMDB_API_KEY = '8015f104741271883e610d9c704183e4';
const WATCHMODE_API_KEY = 'NgObMKWGQPhz4UH6Zs8xwidmsw6s8JZdRstAbtio';

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
    // 1. Search TMDB for content ID
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

    // 2. Get Watchmode ID using TMDB ID
    const watchmodeId = await getWatchmodeId(content.id, content.media_type);
    if (!watchmodeId) {
      showError('Streaming data not available for this title');
      return;
    }

    // 3. Get detailed sources from Watchmode
    const sources = await getWatchmodeSources(watchmodeId);
    displaySources(sources);

  } catch (error) {
    showError('Failed to get streaming information');
    console.error('Search error:', error);
  } finally {
    showLoading(false);
  }
}

async function getWatchmodeId(tmdbId, mediaType) {
  try {
    // Convert TMDB ID to Watchmode ID
    const response = await fetch(
      `https://api.watchmode.com/v1/search/?apiKey=${WATCHMODE_API_KEY}&search_field=imdb_id&search_value=${tmdbId}&search_type=${mediaType}`
    );
    const data = await response.json();
    
    // Return the first matching Watchmode ID
    if (data.title_results && data.title_results.length > 0) {
      return data.title_results[0].id;
    }
    return null;
  } catch (error) {
    console.error('Error getting Watchmode ID:', error);
    return null;
  }
}

async function getWatchmodeSources(watchmodeId) {
  try {
    // Get all sources for this title
    const response = await fetch(
      `https://api.watchmode.com/v1/title/${watchmodeId}/sources/?apiKey=${WATCHMODE_API_KEY}`
    );
    const data = await response.json();
    
    // Filter valid sources
    return data.filter(source => 
      source.name && 
      source.type && 
      (source.web_url || source.type === 'theatrical')
    );
  } catch (error) {
    console.error('Error getting sources:', error);
    return [];
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
      <div id="sourcesList" class="card-body"></div>
    </div>
  `;
}

function displaySources(sources) {
  const sourcesList = document.getElementById('sourcesList');
  
  if (sources.length === 0) {
    sourcesList.innerHTML = '<p>No streaming services found for this title.</p>';
    return;
  }

  // Group sources by region
  const sourcesByRegion = {};
  sources.forEach(source => {
    if (!source.regions) return;
    
    source.regions.split(',').forEach(region => {
      if (!sourcesByRegion[region]) {
        sourcesByRegion[region] = [];
      }
      sourcesByRegion[region].push(source);
    });
  });

  // Display grouped sources
  for (const [region, regionSources] of Object.entries(sourcesByRegion)) {
    const regionHeader = document.createElement('h5');
    regionHeader.className = 'mt-3 mb-2';
    regionHeader.textContent = `Region: ${getRegionName(region)}`;
    sourcesList.appendChild(regionHeader);

    regionSources.forEach(source => {
      const sourceItem = document.createElement('div');
      sourceItem.className = 'd-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded';
      sourceItem.innerHTML = `
        <div>
          <strong>${source.name}</strong>
          <div class="text-muted small">${formatSourceType(source.type)}</div>
        </div>
        <a href="${source.web_url || '#'}" target="_blank" class="btn btn-sm ${getButtonClass(source.type)}">
          ${source.price ? `${source.price}` : 'View'}
        </a>
      `;
      sourcesList.appendChild(sourceItem);
    });
  }
}

function getRegionName(code) {
  const regions = {
    US: 'United States',
    GB: 'United Kingdom',
    CA: 'Canada',
    AU: 'Australia',
    DE: 'Germany',
    FR: 'France',
    JP: 'Japan',
    IN: 'India',
    BR: 'Brazil',
    MX: 'Mexico'
  };
  return regions[code] || `Region: ${code}`;
}

function formatSourceType(type) {
  const types = {
    'subscription': 'Subscription',
    'free': 'Free',
    'rental': 'Rental',
    'purchase': 'Purchase',
    'theatrical': 'In Theaters'
  };
  return types[type] || type;
}

function getButtonClass(type) {
  const classes = {
    'subscription': 'btn-primary',
    'free': 'btn-success',
    'rental': 'btn-warning',
    'purchase': 'btn-danger',
    'theatrical': 'btn-info'
  };
  return `btn ${classes[type] || 'btn-secondary'}`;
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
