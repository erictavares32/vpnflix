// Simplified search data with verified URLs
window.searchData = [
  // Main pages
  {
    query: ["vpn", "best vpn", "vpn comparison", "compare vpn", "top vpn"],
    title: "Best VPN Comparison",
    snippet:
      "Comprehensive comparison of the top VPNs including ExpressVPN, NordVPN, ProtonVPN, Surfshark, Windscribe, and Mullvad.",
    url: "./", // Root URL for the main page
    exactMatch: ["vpn comparison", "best vpn"],
  },

  // External pages - using relative URLs without .html extension
  {
    query: ["expressvpn vs nordvpn", "nordvpn vs expressvpn"],
    title: "ExpressVPN vs NordVPN Comparison",
    snippet:
      "Head-to-head comparison of ExpressVPN and NordVPN across speed, security, streaming capabilities, and price.",
    url: "./ExpressVPN-vs-NordVPN",
    exactMatch: ["expressvpn vs nordvpn", "nordvpn vs expressvpn"],
  },
  {
    query: ["nordvpn vs protonvpn", "protonvpn vs nordvpn"],
    title: "NordVPN vs ProtonVPN Comparison",
    snippet: "Detailed comparison between NordVPN and ProtonVPN, analyzing security features, speed, and value.",
    url: "./NordVPN-vs-ProtonVPN",
    exactMatch: ["nordvpn vs protonvpn", "protonvpn vs nordvpn"],
  },
  {
    query: ["surfshark vs expressvpn", "expressvpn vs surfshark"],
    title: "Surfshark vs ExpressVPN Comparison",
    snippet: "Comparison of Surfshark and ExpressVPN, focusing on price-to-performance ratio and feature sets.",
    url: "./Surfshark-vs-ExpressVPN",
    exactMatch: ["surfshark vs expressvpn", "expressvpn vs surfshark"],
  },
  {
    query: ["mullvad vs nordvpn", "nordvpn vs mullvad"],
    title: "Mullvad vs NordVPN Privacy Comparison",
    snippet: "Privacy-focused comparison between Mullvad and NordVPN, analyzing anonymity features and security.",
    url: "./Mullvad-vs-NordVPN",
    exactMatch: ["mullvad vs nordvpn", "nordvpn vs mullvad"],
  },
  {
    query: ["nordvpn vs windscribe", "windscribe vs nordvpn"],
    title: "NordVPN vs Windscribe Comparison",
    snippet: "Comparison between NordVPN's premium features and Windscribe's flexible pricing model.",
    url: "./NordVPN-vs-Windscribe",
    exactMatch: ["nordvpn vs windscribe", "windscribe vs nordvpn"],
  },
  {
    query: ["nordvpn vs surfshark", "surfshark vs nordvpn"],
    title: "NordVPN vs Surfshark Value Comparison",
    snippet: "Analysis of which VPN provides better value: NordVPN or Surfshark, comparing features and pricing.",
    url: "./NordVPN-vs-Surfshark",
    exactMatch: ["nordvpn vs surfshark", "surfshark vs nordvpn"],
  },

  // Other pages
  {
    query: ["streaming", "netflix vpn", "streaming guide"],
    title: "VPN Streaming Guide",
    snippet: "Comprehensive guide to using VPNs with streaming services including Netflix, Disney+, and BBC iPlayer.",
    url: "./Streaming-Guide",
    exactMatch: ["streaming guide", "netflix vpn"],
  },
  {
    query: ["cybersecurity", "security news", "vpn security"],
    title: "VPN Cybersecurity News",
    snippet: "Latest news and updates about VPN security, data breaches, and privacy concerns.",
    url: "./cybersecuritynews",
    exactMatch: ["cybersecurity", "security news", "vpn security"],
  },
  {
    query: ["privacy policy", "data collection", "logs policy"],
    title: "VPN Privacy Policies",
    snippet:
      "Analysis of privacy policies from major VPN providers, focusing on data collection and retention practices.",
    url: "./privacy-policy",
    exactMatch: ["privacy policy", "data collection", "logs policy"],
  },

  // VPN Providers
  {
    query: ["expressvpn", "express vpn"],
    title: "ExpressVPN Review",
    snippet: "Detailed analysis of ExpressVPN including speed tests, server network, and security features.",
    url: "./ExpressVPN-vs-NordVPN",
    exactMatch: ["expressvpn", "express vpn"],
  },
  {
    query: ["nordvpn", "nord vpn"],
    title: "NordVPN Security Features",
    snippet: "Comprehensive review of NordVPN's advanced security features including Double VPN and CyberSec.",
    url: "./NordVPN-vs-ExpressVPN",
    exactMatch: ["nordvpn", "nord vpn"],
  },
  {
    query: ["protonvpn", "proton vpn"],
    title: "ProtonVPN Privacy Analysis",
    snippet: "Evaluation of ProtonVPN's Swiss jurisdiction, no-logs policy, and free tier limitations.",
    url: "./NordVPN-vs-ProtonVPN",
    exactMatch: ["protonvpn", "proton vpn"],
  },
  {
    query: ["surfshark", "surf shark"],
    title: "Surfshark VPN Features",
    snippet: "Analysis of Surfshark's unlimited connections policy, CleanWeb feature, and budget-friendly pricing.",
    url: "./Surfshark-vs-ExpressVPN",
    exactMatch: ["surfshark", "surf shark"],
  },
  {
    query: ["mullvad", "mullvad vpn"],
    title: "Mullvad Privacy Features",
    snippet:
      "Detailed look at Mullvad's anonymous account system, cryptocurrency payment options, and strict no-logs policy.",
    url: "./Mullvad-vs-NordVPN",
    exactMatch: ["mullvad", "mullvad vpn"],
  },
  {
    query: ["windscribe", "wind scribe"],
    title: "Windscribe Free & Premium Plans",
    snippet:
      "Comparison of Windscribe's free and premium tiers, including data limits, server access, and R.O.B.E.R.T feature.",
    url: "./NordVPN-vs-Windscribe",
    exactMatch: ["windscribe", "wind scribe"],
  },

  // Common VPN topics - using text search instead of anchors
  {
    query: ["vpn protocols", "wireguard", "openvpn", "ikev2"],
    title: "VPN Protocols Explained",
    snippet:
      "Technical comparison of VPN protocols including WireGuard, OpenVPN, and IKEv2, analyzing speed and security.",
    url: "./",
    searchText: "vpn protocols",
    exactMatch: ["vpn protocols", "wireguard", "openvpn"],
  },
  {
    query: ["encryption", "aes-256", "chacha20"],
    title: "VPN Encryption Standards",
    snippet: "Explanation of encryption standards used by VPN services, including AES-256 and ChaCha20.",
    url: "./",
    searchText: "encryption standards",
    exactMatch: ["encryption", "aes-256", "chacha20"],
  },
  {
    query: ["kill switch", "network lock", "leak protection"],
    title: "VPN Kill Switch Technology",
    snippet: "How kill switch technology prevents data leaks when your VPN connection drops unexpectedly.",
    url: "./",
    searchText: "kill switch",
    exactMatch: ["kill switch", "network lock"],
  },
  {
    query: ["torrenting", "p2p", "bittorrent", "file sharing"],
    title: "VPNs for Safe Torrenting",
    snippet: "How to safely use torrenting and P2P file sharing with a VPN, including port forwarding considerations.",
    url: "./",
    searchText: "torrenting",
    exactMatch: ["torrenting", "p2p", "bittorrent"],
  },
  {
    query: ["gaming", "reduce ping", "gaming vpn", "latency"],
    title: "VPNs for Online Gaming",
    snippet: "How VPNs can reduce ping, prevent DDoS attacks, and bypass ISP throttling for better gaming performance.",
    url: "./",
    searchText: "gaming",
    exactMatch: ["gaming", "reduce ping", "gaming vpn"],
  },
]

// Log to console to verify the script loaded
console.log("Simplified search data loaded: " + window.searchData.length + " entries")
