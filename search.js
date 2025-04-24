document.addEventListener("DOMContentLoaded", () => {
  // Get DOM elements
  const searchInput = document.getElementById("search-input")
  const searchButton = document.getElementById("search-button")
  const searchResults = document.getElementById("search-results")
  const searchContainer = document.getElementById("search-container")

  // Check if elements exist (prevent errors if not found)
  if (!searchInput || !searchButton || !searchResults || !searchContainer) {
    console.error("Search elements not found in the DOM")
    return
  }

  // Make sure searchData is defined (from search-data.js)
  if (typeof window.searchData === "undefined") {
    console.error("searchData is not defined. Make sure search-data.js is loaded before search.js")
    // Create a fallback searchData if it's not defined
    window.searchData = []
    return
  }

  // Toggle search results visibility when clicking outside
  document.addEventListener("click", (event) => {
    if (!searchContainer.contains(event.target)) {
      searchResults.classList.add("hidden")
    }
  })

  // Show results when the search input is focused
  searchInput.addEventListener("focus", () => {
    if (searchInput.value.trim() !== "" && searchResults.children.length > 0) {
      searchResults.classList.remove("hidden")
    }
  })

  // Handle search button click
  searchButton.addEventListener("click", () => {
    performSearch()
  })

  // Handle Enter key press in search input
  searchInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      performSearch()
    }

    // Live search as user types (optional)
    if (searchInput.value.trim().length > 2) {
      performSearch()
    }

    if (searchInput.value.trim() === "") {
      searchResults.classList.add("hidden")
    }
  })

  function performSearch() {
    const query = searchInput.value.trim().toLowerCase()
    if (query === "") {
      searchResults.classList.add("hidden")
      return
    }

    // Clear previous results
    searchResults.innerHTML = ""

    // Find matching results with improved algorithm
    const matches = findMatches(query)

    if (matches.length === 0) {
      // Show no results message
      const noResults = document.createElement("div")
      noResults.className = "search-no-results"
      noResults.textContent = "No results found. Try different keywords."
      searchResults.appendChild(noResults)
    } else {
      // Display results
      matches.forEach((result) => {
        const resultElement = createResultElement(result)
        searchResults.appendChild(resultElement)
      })
    }

    // Show results container
    searchResults.classList.remove("hidden")

    // Log search activity for debugging
    console.log(`Search query: "${query}" - Found ${matches.length} results`)
  }

  function findMatches(query) {
    // Split query into individual words for better matching
    const queryWords = query.split(" ").filter((word) => word.length > 1)

    // Array to store matches with their relevance score
    const matchesWithScores = []

    // Search through our data with improved matching
    window.searchData.forEach((item) => {
      let score = 0
      let exactMatchFound = false

      // Check for exact matches first (highest priority)
      if (item.exactMatch && item.exactMatch.some((exact) => exact === query)) {
        score += 100
        exactMatchFound = true
      }

      // If not an exact match, check if any query terms match keywords
      if (!exactMatchFound) {
        // Check each query word against each keyword
        queryWords.forEach((queryWord) => {
          item.query.forEach((keyword) => {
            // Exact keyword match
            if (keyword === queryWord) {
              score += 10
            }
            // Keyword contains query word
            else if (keyword.includes(queryWord)) {
              score += 5
            }
            // Query word contains keyword
            else if (queryWord.includes(keyword)) {
              score += 3
            }
          })
        })

        // Check if title contains query words for additional relevance
        queryWords.forEach((queryWord) => {
          if (item.title.toLowerCase().includes(queryWord)) {
            score += 2
          }
        })
      }

      // Only include results with a score above 0
      if (score > 0) {
        matchesWithScores.push({
          item: item,
          score: score,
        })
      }
    })

    // Sort by score (highest first) and extract just the items
    return matchesWithScores.sort((a, b) => b.score - a.score).map((match) => match.item)
  }

  function createResultElement(result) {
    const resultElement = document.createElement("div")
    resultElement.className = "search-result"

    const titleElement = document.createElement("a")
    titleElement.href = result.url
    titleElement.className = "search-result-title"
    titleElement.textContent = result.title

    const snippetElement = document.createElement("div")
    snippetElement.className = "search-result-snippet"
    snippetElement.textContent = result.snippet

    const urlElement = document.createElement("div")
    urlElement.className = "search-result-url"
    urlElement.textContent = result.url

    resultElement.appendChild(titleElement)
    resultElement.appendChild(snippetElement)
    resultElement.appendChild(urlElement)

    return resultElement
  }

  // Initialize search with placeholder text
  searchInput.placeholder = "Search for VPN information..."

  // Add a debug function to test if search is working
  window.testSearch = (query) => {
    searchInput.value = query
    performSearch()
  }

  console.log("Enhanced search functionality initialized successfully")
})
