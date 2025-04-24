// Define searchData globally so it's accessible to search.js
window.searchData = [
  // Main page - we know this exists
  {
    query: [
      "vpn",
      "comparison",
      "best vpn",
      "vpn 2025",
      "expressvpn",
      "nordvpn",
      "protonvpn",
      "surfshark",
      "mullvad",
      "windscribe",
    ],
    title: "Best VPN Comparison 2025",
    snippet:
      "Comprehensive comparison of the top VPNs in 2025 including ExpressVPN, NordVPN, ProtonVPN, Surfshark, Windscribe, and Mullvad.",
    url: "index.html",
  },

  // These files appear to exist based on your repository
  {
    query: ["cybersecurity", "news", "security", "vpn security"],
    title: "VPN Security News and Updates",
    snippet: "Stay informed about the latest cybersecurity news and how it affects VPN services.",
    url: "cybersecuritynews.html",
  },
  {
    query: ["privacy", "policy", "data collection", "logs"],
    title: "VPN Privacy Policies Compared",
    snippet: "Detailed analysis of privacy policies from top VPN providers.",
    url: "privacy-policy.html",
  },
  {
    query: ["streaming", "netflix", "disney", "hulu", "streaming vpn"],
    title: "Best VPNs for Streaming in 2025",
    snippet: "Discover which VPNs reliably unblock Netflix, Disney+, and other streaming services.",
    url: "Streaming-Guide-2025.html",
  },

  // Topics that link to sections on the main page
  {
    query: ["protocols", "wireguard", "openvpn", "ikev2"],
    title: "VPN Protocols Explained",
    snippet: "Learn about different VPN protocols including WireGuard, OpenVPN, and IKEv2.",
    url: "index.html",
  },
  {
    query: ["encryption", "security", "aes-256"],
    title: "VPN Encryption Standards",
    snippet: "Understand VPN encryption standards and how they protect your data.",
    url: "index.html",
  },
  {
    query: ["torrenting", "p2p", "download"],
    title: "VPNs for Torrenting",
    snippet: "Find the best VPNs for safe and anonymous torrenting.",
    url: "index.html",
  },
  {
    query: ["gaming", "ping", "latency"],
    title: "VPNs for Gaming",
    snippet: "Learn how VPNs can help with gaming by reducing ping and bypassing throttling.",
    url: "index.html",
  },
]

// Log to console to verify the script loaded
console.log("Search data loaded: " + window.searchData.length + " entries")
