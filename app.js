// API Configuration
const TMDB_API_KEY = '8015f104741271883e610d9c704183e4';
const WATCHMODE_API_KEY = 'NgObMKWGQPhz4UH6Zs8xwidmsw6s8JZdRstAbtio ';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours cache

// Supported Countries with flags
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

// Cache Functions
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

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  // Populate country dropdown
  const countrySelect = document.getElementById('countrySelect');
  COUNTRIES.forEach(country => {
    const option = document.createElement('option');
    option.value = country.code;
    option.textContent = `${country.flag} ${country.name}`;
    countrySelect.appendChild(option);
  });

  // Set default country to user's location or US
  const userCountry = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const matchedCountry = COUNTRIES.find(c => userCountry.includes(c.name))?.code || 'US';
  countrySelect.value = matchedCountry;

  // Add search button event
  document.getElementById('searchBtn').addEventListener('click', searchContent);
  
  // Add search on Enter key
  document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') searchContent();
  });
});

// Main Search Function
async function searchContent() {
  const query = document.getElementById('searchInput').value.trim();
  const country = document.getElementById('countrySelect').value;
  
  if (!query) {
    showError('Please enter a movie or TV show name');
    return;
  }

  showLoading(true);
  clearResults();

  try {
    // Check cache first
    const cacheKey = `search_${query.toLowerCase()}_${country}`;
    const cachedResults = getCache(cacheKey);
    
    if (cachedResults) {
      displayResults(cachedResults);
      return;
    }

    // Step 1: Search TMDB for the content
    const tmdbResponse = await fetchWithTimeout(
      `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`,
      { timeout: 5000 }
    );
    
    if (!tmdbResponse.ok) {
      throw new Error(`TMDB API Error: ${tmdbResponse.status}`);
    }
    
    const tmdbData = await tmdbResponse.json();

    if (!tmdbData.results || tmdbData.results.length === 0) {
      showEmptyState('No results found for your search');
      return;
    }

    // Get top 10 results
    const topResults = tmdbData.results.slice(0, 10);
    
    // Get streaming info for each result
    const resultsWithStreaming = await Promise.all(
      topResults.map(async (content) => {
        try {
          const sources = await getStreamingInfo(content.id, country);
          return { content, sources };
        } catch (error) {
          console.error(`Error getting streaming info for ${content.id}:`, error);
          return { content, sources: null, error: error.message };
        }
      })
    );

    // Cache the results
    setCache(cacheKey, resultsWithStreaming);
    
    // Display results
    displayResults(resultsWithStreaming);

  } catch (error) {
    showError(`Failed to search: ${error.message}`);
    console.error('Search error:', error);
  } finally {
    showLoading(false);
  }
}

// Helper function for fetch with timeout
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 8000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal  
  });
  clearTimeout(id);

  return response;
}

// Get streaming info with caching
async function getStreamingInfo(contentId, country) {
  const cacheKey = `sources_${contentId}_${country}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetchWithTimeout(
      `https://api.watchmode.com/v1/title/${contentId}/sources/?apiKey=${WATCHMODE_API_KEY}&regions=${country}`,
      { timeout: 8000 }
    );

    if (!response.ok) {
      // Special case: 404 might mean content exists but no sources
      if (response.status === 404) return null; // Different from error
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle cases where Watchmode returns { message: "No sources found" }
    if (data.message && data.message.includes("No sources")) {
      return null;
    }

    // Ensure we have a proper array response
    if (!Array.isArray(data)) {
      console.warn("Unexpected Watchmode response format:", data);
      return null;
    }

    // Filter out invalid sources
    const validSources = data.filter(source => 
      source.name && source.web_url && source.type
    );

    setCache(cacheKey, validSources);
    return validSources.length > 0 ? validSources : null;

  } catch (error) {
    console.error("Watchmode API error:", error);
    return null; // Not the same as error - means "no data"
  }
}

// Display Results
function displayResults(results) {
  // ... existing setup code ...

  results.forEach(item => {
    const { content, sources, error } = item;
    
    let availabilityMessage = '';
    if (error) {
      availabilityMessage = `
        <div class="alert alert-warning p-2 mb-0">
          <i class="bi bi-exclamation-triangle me-1"></i>
          ${error}
        </div>
      `;
    } else if (sources === null) {
      // Special case - we couldn't determine availability
      availabilityMessage = `
        <div class="alert alert-info p-2 mb-0">
          <i class="bi bi-info-circle me-1"></i>
          Availability unknown for this country
        </div>
      `;
    } else if (sources.length === 0) {
      // Confirmed no sources
      availabilityMessage = '<p class="text-muted">Not available in selected country</p>';
    } else {
      // Has sources - display them
      availabilityMessage = renderStreamingBadges(sources, content.id);
    }

    // ... rest of your card HTML ...
  });
}

function renderStreamingBadges(sources) {
  const visibleSources = sources.slice(0, 5);
  const extraSources = sources.slice(5);
  
  return `
    <div class="d-flex flex-wrap">
      ${visibleSources.map(source => `
        <a href="${source.web_url}" target="_blank" class="btn btn-outline-primary btn-sm stream-badge">
          ${source.name} (${source.type})
        </a>
      `).join('')}
    </div>
    ${extraSources.length > 0 ? `
      <button class="btn btn-link btn-sm p-0 mt-2" data-bs-toggle="collapse" data-bs-target="#moreSources-${content.id}">
        + ${extraSources.length} more
      </button>
      <div class="collapse mt-2" id="moreSources-${content.id}">
        <div class="d-flex flex-wrap">
          ${extraSources.map(source => `
            <a href="${source.web_url}" target="_blank" class="btn btn-outline-primary btn-sm stream-badge">
              ${source.name} (${source.type})
            </a>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;
}

// UI Helper Functions
function showLoading(show) {
  document.getElementById('loading').style.display = show ? 'block' : 'none';
}

function clearResults() {
  document.getElementById('error').style.display = 'none';
  document.getElementById('results').innerHTML = '';
}

function showError(message) {
  const errorDiv = document.getElementById('error');
  errorDiv.style.display = 'block';
  errorDiv.innerHTML = `
    <i class="bi bi-exclamation-triangle-fill me-2"></i>
    ${message}
    <button type="button" class="btn-close float-end" onclick="this.parentElement.style.display='none'"></button>
  `;
}

function showEmptyState(message) {
  const emptyState = document.getElementById('emptyState');
  emptyState.innerHTML = `
    <i class="bi bi-emoji-frown" style="font-size: 3rem; color: #dee2e6;"></i>
    <h4 class="mt-3 text-muted">${message}</h4>
    <p class="text-muted">Try a different search term or country</p>
  `;
  emptyState.style.display = 'block';
}
