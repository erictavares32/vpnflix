document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input")
  const searchButton = document.getElementById("search-button")
  const searchResults = document.getElementById("search-results")
  const searchContainer = document.getElementById("search-container")

  // Sample search data (replace with your actual data source)
  const searchData = [
    {
      query: ["example", "page"],
      title: "Example Page",
      url: "example.html",
      snippet: "This is an example page with some content.",
    },
    {
      query: ["another", "test"],
      title: "Another Test Page",
      url: "another.html",
      snippet: "This is another test page for searching.",
    },
  ]

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

    // Find matching results
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
  }

  function findMatches(query) {
    const results = []
    const words = query.split(" ")

    // Search through our data
    searchData.forEach((item) => {
      // Check if any query terms match this item's keywords
      const isMatch = item.query.some((keyword) => {
        return words.some((word) => keyword.includes(word)) || keyword.includes(query)
      })

      if (isMatch) {
        results.push(item)
      }
    })

    return results
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
    urlElement.textContent = window.location.origin + "/" + result.url

    resultElement.appendChild(titleElement)
    resultElement.appendChild(snippetElement)
    resultElement.appendChild(urlElement)

    return resultElement
  }
})
