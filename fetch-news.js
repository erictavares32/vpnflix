#!/usr/bin/env node

/**
 * Fetch Cybersecurity News Script
 * Fetches news from The Hacker News RSS feed and generates a static JSON file
 * This script is designed to be run daily via GitHub Actions
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  rssFeedUrl: 'https://feeds.feedburner.com/TheHackersNews',
  apiEndpoint: 'https://api.rss2json.com/v1/api.json',
  apiKey: 'eyyyuhvyxn3182c4f41mxoq1t7knrmechkxj6nbi',
  maxArticles: 8,
  outputFile: path.join(__dirname, 'news-data.json')
};

/**
 * Fetch data from HTTPS URL
 */
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Sanitize HTML content
 */
function sanitizeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Truncate text to specified length
 */
function truncate(text, chars = 150) {
  if (!text) return '';
  return text.length > chars ? `${text.substring(0, chars)}...` : text;
}

/**
 * Format date string
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Main function to fetch and process news
 */
async function main() {
  console.log('🔄 Fetching cybersecurity news...');
  
  try {
    const url = `${CONFIG.apiEndpoint}?rss_url=${encodeURIComponent(CONFIG.rssFeedUrl)}&api_key=${CONFIG.apiKey}`;
    const data = await fetchJSON(url);
    
    if (data.status !== 'ok' || !data.items) {
      throw new Error(data.message || 'Invalid RSS feed data');
    }
    
    console.log(`✅ Fetched ${data.items.length} articles`);
    
    // Process articles
    const articles = data.items.slice(0, CONFIG.maxArticles).map((article, index) => ({
      id: index + 1,
      title: sanitizeHTML(article.title),
      link: article.link,
      pubDate: formatDate(article.pubDate),
      excerpt: truncate(sanitizeHTML(article.description), 150)
    }));
    
    // Create output object with metadata
    const output = {
      lastUpdated: new Date().toISOString(),
      source: 'The Hacker News',
      articles: articles
    };
    
    // Write to JSON file
    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(output, null, 2), 'utf8');
    
    console.log(`✅ Successfully wrote ${(articles.length)} articles to ${CONFIG.outputFile}`);
    console.log(`📅 Last updated: ${output.lastUpdated}`);
    
  } catch (error) {
    console.error('❌ Error fetching news:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
