// ======================
// StreamFinder App
// ======================

const TMDB_API_KEY = '8015f104741271883e610d9c704183e4'; // 
const WATCHMODE_API_KEY = 'NgObMKWGQPhz4UH6Zs8xwidmsw6s8JZdRstAbtio'; // 

// 2. BASIC CONFIGURATION
const API_LIMIT = 1000; // Your Watchmode daily limit
let apiRequestsMade = 0;

// 3. COUNTRIES WE CHECK (limited to stay under API limits)
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
// 4. WHEN PAGE LOADS
window.addEventListener('DOMContentLoaded', function() {
  // Set up search functionality
  document.getElementById('searchBtn').addEventListener('click', doSearch);
  document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') doSearch();
  });
  
  // Focus on search box
  document.getElementById('searchInput').focus();
  
  // Show API counter
  updateApiCounter();
});

// 5. MAIN SEARCH FUNCTION
async function doSearch() {
  // Check API limits
  if (apiRequestsMade >= API_LIMIT) {
    showError('Daily API limit reached. Try again tomorrow.');
    return;
  }

  // Get search query
  const query = document.getElementById('searchInput').value.trim();
  if (!query) {
    showError('Please enter a movie or TV show name');
    return;
  }

  // Show loading state
  showLoading(true, 'Searching...');
  clearResults();

  try {
    // Search TMDB
    const results = await searchTMDB(query);
    
    if (!results || results.length === 0) {
      showEmptyState('No results found. Try a different name.');
      return;
    }
    
    // Show results
    if (results.length > 1) {
      showMultipleResults(results);
    } else {
      checkAvailability(results[0]);
    }
  } catch (error) {
    showError('Search failed. Please try again later.');
    console.error('Search error:', error);
  } finally {
    showLoading(false);
  }
}

// 6. SEARCH TMDB DATABASE
async function searchTMDB(query) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) throw new Error('API error');
    
    const data = await response.json();
    return data.results
      .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
      .slice(0, 5); // Get top 5 results
  } catch (error) {
    console.error('TMDB error:', error);
    throw error;
  }
}

// 7. CHECK AVAILABILITY FOR A SINGLE TITLE
async function checkAvailability(movie) {
  showLoading(true, 'Checking availability...');
  
  // Create results container
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = `
    <div class="card mb-4">
      <div class="row g-0">
        <div class="col-md-3">
          <img src="${movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'}" 
               class="img-fluid rounded-start" alt="${movie.title || movie.name}">
        </div>
        <div class="col-md-9">
          <div class="card-body">
            <h2 class="card-title">${movie.title || movie.name}</h2>
            <p class="card-text">${movie.overview || 'No description available'}</p>
            <p class="card-text"><small class="text-muted">${movie.release_date || movie.first_air_date || ''} • ${movie.media_type === 'movie' ? 'Movie' : 'TV Show'}</small></p>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h3 class="mb-0">Where to Watch</h3>
        <span class="badge bg-primary">${COUNTRIES.length} countries checked</span>
      </div>
      <div class="card-body p-0">
        <div class="list-group list-group-flush" id="countryResults"></div>
      </div>
    </div>
  `;

  const countryList = document.getElementById('countryResults');
  let availableCountries = 0;

  // Check each country
  for (const country of COUNTRIES) {
    if (apiRequestsMade >= API_LIMIT) break;
    
    // Show loading state for this country
    const countryItem = document.createElement('div');
    countryItem.className = 'list-group-item';
    countryItem.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <div>${country.flag} ${country.name}</div>
        <div class="spinner-border spinner-border-sm" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;
    countryList.appendChild(countryItem);
    
    try {
      // Check availability in this country
      const sources = await checkCountryAvailability(movie.id, country.code);
      
      // Update display
      if (sources && sources.length > 0) {
        availableCountries++;
        countryItem.innerHTML = `
          <div class="d-flex justify-content-between align-items-center">
            <div>${country.flag} <strong>${country.name}</strong></div>
            <span class="badge bg-success">Available</span>
          </div>
          <div class="mt-2">
            ${formatServices(sources)}
          </div>
        `;
      } else {
        countryItem.innerHTML = `
          <div class="d-flex justify-content-between align-items-center">
            <div>${country.flag} ${country.name}</div>
            <span class="badge bg-secondary">Not available</span>
          </div>
        `;
      }
    } catch (error) {
      console.error(`Error checking ${country.name}:`, error);
      countryItem.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
          <div>${country.flag} ${country.name}</div>
          <span class="badge bg-warning">Check failed</span>
        </div>
      `;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 300));
    updateApiCounter();
  }

  // Add summary
  if (availableCountries > 0) {
    const summary = document.createElement('div');
    summary.className = 'list-group-item bg-light';
    summary.innerHTML = `
      <p class="mb-0"><strong>Found in ${availableCountries} countries</strong></p>
      <small class="text-muted">Click on service names to watch</small>
    `;
    countryList.prepend(summary);
  }
}

// 8. CHECK AVAILABILITY IN ONE COUNTRY
async function checkCountryAvailability(movieId, countryCode) {
  try {
    apiRequestsMade++;
    const response = await fetch(
      `https://api.watchmode.com/v1/title/${movieId}/sources/?apiKey=${WATCHMODE_API_KEY}&regions=${countryCode}`
    );
    
    if (!response.ok) return null;
    
    const sources = await response.json();
    if (!Array.isArray(sources)) return null;
    
    // Filter valid sources
    return sources.filter(source => 
      source.name && 
      (source.web_url || source.type === 'theatrical') &&
      source.type
    ).map(source => ({
      name: source.name,
      type: source.type,
      web_url: source.web_url || '#',
      price: source.price || null
    }));
  } catch (error) {
    console.error('Country check error:', error);
    return null;
  }
}

// 9. FORMAT STREAMING SERVICES FOR DISPLAY
function formatServices(sources) {
  let html = '';
  
  // Group by type
  const groups = {
    subscription: [],
    free: [],
    rental: [],
    purchase: [],
    other: []
  };
  
  sources.forEach(source => {
    const type = source.type.toLowerCase();
    if (type.includes('sub')) groups.subscription.push(source);
    else if (type.includes('free')) groups.free.push(source);
    else if (type.includes('rent')) groups.rental.push(source);
    else if (type.includes('buy') || type.includes('purchase')) groups.purchase.push(source);
    else groups.other.push(source);
  });
  
  // Build HTML for each group
  for (const [type, items] of Object.entries(groups)) {
    if (items.length > 0) {
      html += `<div class="mb-2"><small>${type.toUpperCase()}:</small> `;
      html += items.map(item => `
        <a href="${item.web_url}" target="_blank" class="btn btn-sm btn-${type} stream-badge">
          ${item.name}${item.price ? ` (${item.price})` : ''}
        </a>
      `).join('');
      html += '</div>';
    }
  }
  
  return html;
}

// 10. SHOW MULTIPLE RESULTS
function showMultipleResults(results) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="mb-0">Multiple Results Found</h3>
      </div>
      <div class="card-body">
        <p>Which one are you looking for?</p>
        <div class="list-group" id="resultsList"></div>
      </div>
    </div>
  `;

  const list = document.getElementById('resultsList');
  
  results.forEach(movie => {
    const item = document.createElement('button');
    item.className = 'list-group-item list-group-item-action';
    item.innerHTML = `
      <div class="d-flex align-items-center">
        <img src="${movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : 'https://via.placeholder.com/92x138?text=No+Poster'}" 
             style="width: 46px; height: 69px; object-fit: cover; margin-right: 15px;">
        <div>
          <h6 class="mb-1">${movie.title || movie.name}</h6>
          <small class="text-muted">
            ${movie.release_date || movie.first_air_date || ''} • 
            ${movie.media_type === 'movie' ? 'Movie' : 'TV Show'}
          </small>
        </div>
      </div>
    `;
    
    item.addEventListener('click', () => {
      checkAvailability(movie);
    });
    
    list.appendChild(item);
  });
}

// ======================
// HELPER FUNCTIONS
// ======================

function updateApiCounter() {
  document.getElementById('apiCounter').textContent = `API used: ${apiRequestsMade}/${API_LIMIT}`;
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
    <i class="bi bi-film" style="font-size: 3rem;"></i>
    <h4 class="mt-3">${message}</h4>
    <p>Try a different search term</p>
  `;
  emptyState.style.display = 'block';
}
