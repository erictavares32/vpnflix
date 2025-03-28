// API Configuration
const TMDB_API_KEY = '8015f104741271883e610d9c704183e4';
const WATCHMODE_API_KEY = 'NgObMKWGQPhz4UH6Zs8xwidmsw6s8JZdRstAbtio';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours cache

// Supported Countries (50+ countries)
const COUNTRIES = [
  {code: 'AR', name: 'Argentina', flag: '🇦🇷'},
  {code: 'AU', name: 'Australia', flag: '🇦🇺'},
  {code: 'AT', name: 'Austria', flag: '🇦🇹'},
  {code: 'BE', name: 'Belgium', flag: '🇧🇪'},
  {code: 'BR', name: 'Brazil', flag: '🇧🇷'},
  {code: 'BG', name: 'Bulgaria', flag: '🇧🇬'},
  {code: 'CA', name: 'Canada', flag: '🇨🇦'},
  {code: 'CL', name: 'Chile', flag: '🇨🇱'},
  {code: 'CO', name: 'Colombia', flag: '🇨🇴'},
  {code: 'HR', name: 'Croatia', flag: '🇭🇷'},
  {code: 'CZ', name: 'Czech Republic', flag: '🇨🇿'},
  {code: 'DK', name: 'Denmark', flag: '🇩🇰'},
  {code: 'EE', name: 'Estonia', flag: '🇪🇪'},
  {code: 'FI', name: 'Finland', flag: '🇫🇮'},
  {code: 'FR', name: 'France', flag: '🇫🇷'},
  {code: 'DE', name: 'Germany', flag: '🇩🇪'},
  {code: 'GR', name: 'Greece', flag: '🇬🇷'},
  {code: 'HK', name: 'Hong Kong', flag: '🇭🇰'},
  {code: 'HU', name: 'Hungary', flag: '🇭🇺'},
  {code: 'IS', name: 'Iceland', flag: '🇮🇸'},
  {code: 'IN', name: 'India', flag: '🇮🇳'},
  {code: 'ID', name: 'Indonesia', flag: '🇮🇩'},
  {code: 'IE', name: 'Ireland', flag: '🇮🇪'},
  {code: 'IL', name: 'Israel', flag: '🇮🇱'},
  {code: 'IT', name: 'Italy', flag: '🇮🇹'},
  {code: 'JP', name: 'Japan', flag: '🇯🇵'},
  {code: 'LV', name: 'Latvia', flag: '🇱🇻'},
  {code: 'LT', name: 'Lithuania', flag: '🇱🇹'},
  {code: 'MY', name: 'Malaysia', flag: '🇲🇾'},
  {code: 'MX', name: 'Mexico', flag: '🇲🇽'},
  {code: 'NL', name: 'Netherlands', flag: '🇳🇱'},
  {code: 'NZ', name: 'New Zealand', flag: '🇳🇿'},
  {code: 'NO', name: 'Norway', flag: '🇳🇴'},
  {code: 'PE', name: 'Peru', flag: '🇵🇪'},
  {code: 'PH', name: 'Philippines', flag: '🇵🇭'},
  {code: 'PL', name: 'Poland', flag: '🇵🇱'},
  {code: 'PT', name: 'Portugal', flag: '🇵🇹'},
  {code: 'RO', name: 'Romania', flag: '🇷🇴'},
  {code: 'RU', name: 'Russia', flag: '🇷🇺'},
  {code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦'},
  {code: 'SG', name: 'Singapore', flag: '🇸🇬'},
  {code: 'SK', name: 'Slovakia', flag: '🇸🇰'},
  {code: 'ZA', name: 'South Africa', flag: '🇿🇦'},
  {code: 'KR', name: 'South Korea', flag: '🇰🇷'},
  {code: 'ES', name: 'Spain', flag: '🇪🇸'},
  {code: 'SE', name: 'Sweden', flag: '🇸🇪'},
  {code: 'CH', name: 'Switzerland', flag: '🇨🇭'},
  {code: 'TW', name: 'Taiwan', flag: '🇹🇼'},
  {code: 'TH', name: 'Thailand', flag: '🇹🇭'},
  {code: 'TR', name: 'Turkey', flag: '🇹🇷'},
  {code: 'UA', name: 'Ukraine', flag: '🇺🇦'},
  {code: 'GB', name: 'United Kingdom', flag: '🇬🇧'},
  {code: 'US', name: 'United States', flag: '🇺🇸'},
  {code: 'VN', name: 'Vietnam', flag: '🇻🇳'}
];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  setupSearch();
});

function setupSearch() {
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  
  searchBtn.addEventListener('click', searchContent);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchContent();
  });
}

async function searchContent() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) {
    showError('Please enter a movie or TV show name');
    return;
  }

  showLoading(true);
  clearResults();

  try {
    // Search TMDB for the content
    const tmdbResults = await searchTMDB(query);
    if (!tmdbResults || tmdbResults.length === 0) {
      showEmptyState('No results found for your search');
      return;
    }

    // Display content selector if multiple results
    if (tmdbResults.length > 1) {
      displayContentSelector(tmdbResults);
    } else {
      // If only one result, proceed directly
      await displayGlobalAvailability(tmdbResults[0]);
    }
  } catch (error) {
    showError(`Search failed: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

async function searchTMDB(query) {
  const cacheKey = `tmdb_search_${query.toLowerCase()}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
    
    const data = await response.json();
    const results = data.results
      .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
      .slice(0, 5); // Limit to top 5 results
    
    setCache(cacheKey, results);
    return results;
  } catch (error) {
    console.error('TMDB search error:', error);
    throw error;
  }
}

async function displayGlobalAvailability(content) {
  showLoading(true, 'Checking global availability...');
  
  try {
    // Get availability from Watchmode
    const availability = await checkGlobalAvailability(content.id);
    
    // Display the results
    displayAvailabilityResults(content, availability);
  } catch (error) {
    showError(`Failed to check availability: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

async function checkGlobalAvailability(contentId) {
  const cacheKey = `global_availability_${contentId}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    // Get all sources for this content
    const response = await fetch(
      `https://api.watchmode.com/v1/title/${contentId}/sources/?apiKey=${WATCHMODE_API_KEY}`
    );
    
    if (!response.ok) throw new Error(`Watchmode API error: ${response.status}`);
    
    const sources = await response.json();
    
    // Organize by country
    const availabilityMap = {};
    
    sources.forEach(source => {
      if (!source.regions) return;
      
      source.regions.split(',').forEach(region => {
        if (!availabilityMap[region]) {
          availabilityMap[region] = [];
        }
        availabilityMap[region].push({
          name: source.name,
          type: source.type,
          web_url: source.web_url
        });
      });
    });
    
    setCache(cacheKey, availabilityMap);
    return availabilityMap;
  } catch (error) {
    console.error('Global availability error:', error);
    throw error;
  }
}

function displayAvailabilityResults(content, availabilityMap) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  // Display content header
  resultsDiv.innerHTML += `
    <div class="card mb-4">
      <div class="row g-0">
        <div class="col-md-3">
          <img src="${
            content.poster_path 
              ? `https://image.tmdb.org/t/p/w500${content.poster_path}` 
              : 'https://via.placeholder.com/500x750?text=No+Poster'
          }" class="img-fluid rounded-start" alt="${content.title || content.name}">
        </div>
        <div class="col-md-9">
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
        <h3 class="mb-0">Global Availability</h3>
      </div>
      <div class="card-body p-0">
        <div class="list-group list-group-flush" id="countryList"></div>
      </div>
    </div>
  `;

  const countryList = document.getElementById('countryList');
  
  // Show countries with availability
  COUNTRIES.forEach(country => {
    const sources = availabilityMap[country.code];
    const countryItem = document.createElement('div');
    countryItem.className = 'list-group-item';
    
    if (sources && sources.length > 0) {
      countryItem.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <span class="country-flag">${country.flag}</span>
            <strong>${country.name}</strong>
          </div>
          <div>
            <button class="btn btn-sm btn-outline-primary toggle-sources" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#sources-${country.code}">
              Show ${sources.length} services
            </button>
          </div>
        </div>
        <div class="collapse mt-2" id="sources-${country.code}">
          <div class="d-flex flex-wrap">
            ${sources.map(source => `
              <a href="${source.web_url}" target="_blank" 
                 class="btn btn-sm btn-outline-secondary me-2 mb-2">
                ${source.name} (${source.type})
              </a>
            `).join('')}
          </div>
        </div>
      `;
    } else {
      countryItem.innerHTML = `
        <div class="d-flex justify-content-between align-items-center text-muted">
          <div>
            <span class="country-flag">${country.flag}</span>
            ${country.name}
          </div>
          <span class="badge bg-light text-dark">Not available</span>
        </div>
      `;
    }
    
    countryList.appendChild(countryItem);
  });
}

// Helper functions (same as before with small improvements)
function getCache(key) {
  const cached = localStorage.getItem(`streamfinder_${key}`);
  if (!cached) return null;
  
  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp > CACHE_EXPIRY) {
    localStorage.removeItem(`streamfinder_${key}`);
    return null;
  }
  return data;
}

function setCache(key, data) {
  const cacheItem = {
    data,
    timestamp: Date.now()
  };
  localStorage.setItem(`streamfinder_${key}`, JSON.stringify(cacheItem));
}

function showLoading(show, message = 'Loading...') {
  const loadingDiv = document.getElementById('loading');
  if (show) {
    loadingDiv.innerHTML = `
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">${message}</p>
    `;
    loadingDiv.style.display = 'block';
  } else {
    loadingDiv.style.display = 'none';
  }
}

function clearResults() {
  document.getElementById('error').style.display = 'none';
  document.getElementById('results').innerHTML = '';
  document.getElementById('emptyState').style.display = 'none';
}

function showError(message) {
  const errorDiv = document.getElementById('error');
  errorDiv.innerHTML = `
    <i class="bi bi-exclamation-triangle-fill me-2"></i>
    ${message}
    <button type="button" class="btn-close float-end" onclick="this.parentElement.style.display='none'"></button>
  `;
  errorDiv.style.display = 'block';
}

function showEmptyState(message) {
  const emptyState = document.getElementById('emptyState');
  emptyState.innerHTML = `
    <i class="bi bi-film" style="font-size: 3rem; color: #dee2e6;"></i>
    <h4 class="mt-3 text-muted">${message}</h4>
    <p class="text-muted">Try a different search term</p>
  `;
  emptyState.style.display = 'block';
}

function displayContentSelector(results) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="mb-0">Multiple Results Found</h3>
      </div>
      <div class="card-body">
        <p>Please select the correct title:</p>
        <div class="list-group" id="contentSelector"></div>
      </div>
    </div>
  `;

  const selectorDiv = document.getElementById('contentSelector');
  
  results.forEach(item => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'list-group-item list-group-item-action';
    btn.innerHTML = `
      <div class="d-flex align-items-center">
        <img src="${
          item.poster_path 
            ? `https://image.tmdb.org/t/p/w92${item.poster_path}` 
            : 'https://via.placeholder.com/92x138?text=No+Poster'
        }" style="width: 46px; height: 69px; object-fit: cover; margin-right: 15px;">
        <div>
          <h6 class="mb-1">${item.title || item.name}</h6>
          <small class="text-muted">
            ${item.release_date || item.first_air_date || ''} • 
            ${item.media_type === 'movie' ? 'Movie' : 'TV Show'}
          </small>
        </div>
      </div>
    `;
    
    btn.addEventListener('click', async () => {
      await displayGlobalAvailability(item);
    });
    
    selectorDiv.appendChild(btn);
  });
}
