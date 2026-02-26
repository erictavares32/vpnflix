document.addEventListener("DOMContentLoaded", () => {
  // Get DOM elements
  const searchInput = document.getElementById("search-input")
  const searchButton = document.getElementById("search-button")
  const searchResults = document.getElementById("search-results")
  const searchContainer = document.getElementById("search-container")
  const headerSearchButton = document.getElementById("header-search-button")

  // Check if elements exist (prevent errors if not found)
  if (!searchInput || !searchButton || !searchResults || !searchContainer) {
    console.error("Search elements not found in the DOM")
    return
  }

  if (headerSearchButton) {
    headerSearchButton.addEventListener("click", () => {
      // Toggle the search container visibility
      searchContainer.classList.toggle("hidden")
      // Focus the search input when shown
      if (!searchContainer.classList.contains("hidden")) {
        searchInput.focus()
      }
    })
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
    const searchWrapper = searchInput.closest(".search-wrapper")
    if (searchWrapper && !searchWrapper.contains(event.target)) {
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

    // Check if this is an entertainment-related query
    const isEntertainmentQuery = checkIfEntertainmentQuery(query)

    // Find matching results with improved algorithm
    const matches = findMatches(query, isEntertainmentQuery)

    if (matches.length === 0) {
      // Show no results message
      const noResults = document.createElement("div")
      noResults.className = "search-no-results"
      noResults.textContent = "No results found. Try different keywords."
      searchResults.appendChild(noResults)
    } else {
      // Display results
      matches.forEach((result) => {
        const resultElement = createResultElement(result, query)
        searchResults.appendChild(resultElement)
      })
    }

    // Show results container
    searchResults.classList.remove("hidden")

    // Log search activity for debugging
    console.log(`Search query: "${query}" - Found ${matches.length} results - Entertainment: ${isEntertainmentQuery}`)
  }

  // Check if a query is entertainment-related
  function checkIfEntertainmentQuery(query) {
    // List of entertainment-related keywords
    const entertainmentKeywords = [
      "movie",
      "film",
      "show",
      "series",
      "episode",
      "season",
      "watch",
      "stream",
      "actor",
      "actress",
      "director",
      "cast",
      "character",
      "netflix",
      "disney",
      "hulu",
      "amazon",
      "prime",
      "hbo",
      "max",
      "peacock",
      "paramount",
      "apple tv",
    ]

    // Check if query contains any entertainment keywords
    for (const keyword of entertainmentKeywords) {
      if (query.includes(keyword)) {
        return true
      }
    }

    // Check if query matches any popular titles
    const popularTitleEntries = window.searchData.filter(
      (item) =>
        item.url === "https://app.vpnflix.online" &&
        item.exactMatch &&
        item.exactMatch.some((match) => match === query),
    )

    return popularTitleEntries.length > 0
  }

  function findMatches(query, isEntertainmentQuery) {
    // If it's an entertainment query, prioritize the app.vpnflix.online results
    if (isEntertainmentQuery) {
      const entertainmentResults = window.searchData.filter(
        (item) =>
          item.url === "https://app.vpnflix.online" &&
          (item.query.some((keyword) => query.includes(keyword)) ||
            (item.exactMatch && item.exactMatch.some((match) => query.includes(match)))),
      )

      if (entertainmentResults.length > 0) {
        return entertainmentResults
      }
    }

    // Split query into individual words for better matching
    const queryWords = query.split(" ").filter((word) => word.length > 1)

    // Array to store matches with their relevance score
    const matchesWithScores = []

    // Search through our data with improved matching
    window.searchData.forEach((item) => {
      // Skip the wildcard entry for now
      if (item.query[0] === "*") return

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

      // Boost score for entertainment queries if the result is from app.vpnflix.online
      if (isEntertainmentQuery && item.url === "https://app.vpnflix.online") {
        score *= 2
      }

      // Only include results with a score above 0
      if (score > 0) {
        matchesWithScores.push({
          item: item,
          score: score,
        })
      }
    })

    // If no matches found or only low-scoring matches, add the wildcard internal search
    if (matchesWithScores.length === 0 || matchesWithScores.every((match) => match.score < 10)) {
      // For entertainment queries, redirect to app.vpnflix.online even if no exact match
      if (isEntertainmentQuery) {
        const entertainmentItem = window.searchData.find(
          (item) => item.url === "https://app.vpnflix.online" && item.query.includes("movies"),
        )

        if (entertainmentItem) {
          // Clone the item and customize it for this search
          const customizedItem = JSON.parse(JSON.stringify(entertainmentItem))
          customizedItem.title = `Find where to watch "${query}"`
          customizedItem.snippet =
            "Discover which streaming services offer this title in your region with VPN location options."

          matchesWithScores.push({
            item: customizedItem,
            score: 50, // High enough to be prioritized
          })
        }
      } else {
        // For non-entertainment queries, use the wildcard internal search
        const wildcardItem = window.searchData.find((item) => item.query[0] === "*")
        if (wildcardItem) {
          // Clone the wildcard item and customize it for this search
          const customizedItem = JSON.parse(JSON.stringify(wildcardItem))
          customizedItem.title += `"${query}"`
          matchesWithScores.push({
            item: customizedItem,
            score: 1, // Low score so it appears after any better matches
          })
        }
      }
    }

    // Sort by score (highest first) and extract just the items
    return matchesWithScores.sort((a, b) => b.score - a.score).map((match) => match.item)
  }

  function createResultElement(result, query) {
    const resultElement = document.createElement("div")
    resultElement.className = "search-result"

    // Get the URL from the result
    const url = result.url

    // Create the link element
    const titleElement = document.createElement("a")
    titleElement.href = url
    titleElement.className = "search-result-title"
    titleElement.textContent = result.title

    // If this is an internal search result, add a click handler
    if (result.type === "internal") {
      titleElement.addEventListener("click", (e) => {
        e.preventDefault()

        // Store the search query in sessionStorage
        sessionStorage.setItem("vpnflixSearchQuery", query)

        // Navigate to the page
        window.location.href = url
      })
    }

    const snippetElement = document.createElement("div")
    snippetElement.className = "search-result-snippet"
    snippetElement.textContent = result.snippet

    const urlElement = document.createElement("div")
    urlElement.className = "search-result-url"
    urlElement.textContent = url

    resultElement.appendChild(titleElement)
    resultElement.appendChild(snippetElement)
    resultElement.appendChild(urlElement)

    return resultElement
  }

  // Check if we need to search for text on page load (for internal searches)
  function checkForStoredSearch() {
    const searchQuery = sessionStorage.getItem("vpnflixSearchQuery")
    if (searchQuery) {
      // Clear the stored search query
      sessionStorage.removeItem("vpnflixSearchQuery")

      // Wait for page to fully load
      setTimeout(() => {
        // Create a search overlay
        createSearchOverlay(searchQuery)
      }, 1000) // Wait 1 second for page to load
    }
  }

  // Create a search overlay similar to browser's find functionality
  function createSearchOverlay(query) {
    // Create overlay container
    const overlay = document.createElement("div")
    overlay.className = "vpnflix-search-overlay"
    overlay.style.position = "fixed"
    overlay.style.top = "10px"
    overlay.style.right = "10px"
    overlay.style.zIndex = "9999"
    overlay.style.background = "white"
    overlay.style.padding = "10px"
    overlay.style.borderRadius = "5px"
    overlay.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)"
    overlay.style.display = "flex"
    overlay.style.flexDirection = "column"
    overlay.style.gap = "10px"

    // Create header
    const header = document.createElement("div")
    header.style.display = "flex"
    header.style.justifyContent = "space-between"
    header.style.alignItems = "center"

    // Create title
    const title = document.createElement("div")
    title.textContent = `Searching for: "${query}"`
    title.style.fontWeight = "bold"

    // Create close button
    const closeButton = document.createElement("button")
    closeButton.textContent = "×"
    closeButton.style.background = "none"
    closeButton.style.border = "none"
    closeButton.style.fontSize = "20px"
    closeButton.style.cursor = "pointer"
    closeButton.style.padding = "0 5px"
    closeButton.onclick = () => {
      // Remove all highlights
      removeHighlights()
      // Remove the overlay
      document.body.removeChild(overlay)
    }

    header.appendChild(title)
    header.appendChild(closeButton)
    overlay.appendChild(header)

    // Create controls
    const controls = document.createElement("div")
    controls.style.display = "flex"
    controls.style.gap = "5px"

    // Create previous button
    const prevButton = document.createElement("button")
    prevButton.textContent = "Previous"
    prevButton.style.padding = "5px 10px"
    prevButton.style.background = "#f0f0f0"
    prevButton.style.border = "1px solid #ccc"
    prevButton.style.borderRadius = "3px"
    prevButton.style.cursor = "pointer"

    // Create next button
    const nextButton = document.createElement("button")
    nextButton.textContent = "Next"
    nextButton.style.padding = "5px 10px"
    nextButton.style.background = "#f0f0f0"
    nextButton.style.border = "1px solid #ccc"
    nextButton.style.borderRadius = "3px"
    nextButton.style.cursor = "pointer"

    // Create counter
    const counter = document.createElement("div")
    counter.style.marginLeft = "auto"
    counter.style.padding = "5px 0"

    controls.appendChild(prevButton)
    controls.appendChild(nextButton)
    controls.appendChild(counter)
    overlay.appendChild(controls)

    // Add the overlay to the page
    document.body.appendChild(overlay)

    // Perform the search
    const words = query
      .toLowerCase()
      .split(" ")
      .filter((word) => word.length > 1)
    const highlights = []
    let currentHighlightIndex = -1

    // Highlight all occurrences of each word
    words.forEach((word) => {
      const newHighlights = highlightWord(word)
      highlights.push(...newHighlights)
    })

    // Update counter
    counter.textContent = highlights.length > 0 ? `${currentHighlightIndex + 1} of ${highlights.length}` : "No matches"

    // If no highlights found
    if (highlights.length === 0) {
      prevButton.disabled = true
      nextButton.disabled = true
      return
    }

    // Navigate to the first highlight
    currentHighlightIndex = 0
    scrollToHighlight(highlights[currentHighlightIndex])

    // Set up navigation buttons
    prevButton.onclick = () => {
      if (currentHighlightIndex > 0) {
        currentHighlightIndex--
        scrollToHighlight(highlights[currentHighlightIndex])
        counter.textContent = `${currentHighlightIndex + 1} of ${highlights.length}`
      }
    }

    nextButton.onclick = () => {
      if (currentHighlightIndex < highlights.length - 1) {
        currentHighlightIndex++
        scrollToHighlight(highlights[currentHighlightIndex])
        counter.textContent = `${currentHighlightIndex + 1} of ${highlights.length}`
      }
    }
  }

  // Highlight all occurrences of a word in the document
  function highlightWord(word) {
    const highlights = []
    const textNodes = getTextNodesIn(document.body)

    textNodes.forEach((node) => {
      const text = node.nodeValue
      const lowerText = text.toLowerCase()
      let index = lowerText.indexOf(word)

      if (index >= 0) {
        // This text node contains the word
        const parent = node.parentNode

        // Skip if parent is a script, style, or already highlighted
        if (parent.nodeName === "SCRIPT" || parent.nodeName === "STYLE" || parent.className === "vpnflix-highlight") {
          return
        }

        // Create a document fragment to hold the new nodes
        const fragment = document.createDocumentFragment()
        let lastIndex = 0

        // Find all occurrences of the word in this text node
        while (index >= 0) {
          // Add text before the match
          if (index > lastIndex) {
            fragment.appendChild(document.createTextNode(text.substring(lastIndex, index)))
          }

          // Create a span for the highlighted word
          const highlightSpan = document.createElement("span")
          highlightSpan.className = "vpnflix-highlight"
          highlightSpan.appendChild(document.createTextNode(text.substring(index, index + word.length)))

          // Add the highlight to our collection
          highlights.push(highlightSpan)

          // Add the highlight to the fragment
          fragment.appendChild(highlightSpan)

          // Move past this word
          lastIndex = index + word.length

          // Find the next occurrence
          index = lowerText.indexOf(word, lastIndex)
        }

        // Add any remaining text
        if (lastIndex < text.length) {
          fragment.appendChild(document.createTextNode(text.substring(lastIndex)))
        }

        // Replace the original text node with our fragment
        parent.replaceChild(fragment, node)
      }
    })

    return highlights
  }

  // Remove all highlights from the document
  function removeHighlights() {
    const highlights = document.querySelectorAll(".vpnflix-highlight")

    highlights.forEach((highlight) => {
      const parent = highlight.parentNode
      const text = highlight.textContent

      // Replace the highlight with a text node
      const textNode = document.createTextNode(text)
      parent.replaceChild(textNode, highlight)

      // Normalize the parent to merge adjacent text nodes
      parent.normalize()
    })
  }

  // Scroll to a highlighted element
  function scrollToHighlight(highlight) {
    // Remove active class from all highlights
    document.querySelectorAll(".vpnflix-highlight-active").forEach((el) => {
      el.classList.remove("vpnflix-highlight-active")
      el.style.backgroundColor = "#ffff00"
    })

    // Add active class to this highlight
    highlight.classList.add("vpnflix-highlight-active")
    highlight.style.backgroundColor = "#ff9632"

    // Scroll to the highlight
    highlight.scrollIntoView({
      behavior: "smooth",
      block: "center",
    })
  }

  // Helper function to get all text nodes in an element
  function getTextNodesIn(node) {
    var textNodes = []

    function getTextNodes(node) {
      if (node.nodeType === 3) {
        // Text node
        textNodes.push(node)
      } else if (node.nodeType === 1) {
        // Element node
        var children = node.childNodes
        for (var i = 0; i < children.length; i++) {
          getTextNodes(children[i])
        }
      }
    }

    getTextNodes(node)
    return textNodes
  }

  // Initialize search with placeholder text
  searchInput.placeholder = "Search for VPN information..."

  // Check for stored search on page load
  checkForStoredSearch()

  // Add a debug function to test if search is working
  window.testSearch = (query) => {
    searchInput.value = query
    performSearch()
  }

  console.log("Enhanced search functionality initialized successfully")
})
