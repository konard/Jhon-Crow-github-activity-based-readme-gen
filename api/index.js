/**
 * API Endpoint for GitHub Activity Card
 * Vercel Serverless Function
 */

import { fetchAllActivityData } from '../src/github-api.js';
import { generateActivitySummary } from '../src/activity-summarizer.js';
import { generateActivityCard, generateCompactCard, generateLanguagesCard } from '../src/card-generator.js';
import themes from '../themes/index.js';

// Cache for storing results (simple in-memory cache)
const cache = new Map();
const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

/**
 * Gets cached data or fetches new data
 * @param {string} username - GitHub username
 * @param {string} token - GitHub token
 * @returns {Promise<Object>} Activity summary data
 */
async function getCachedData(username, token) {
  const cacheKey = `user:${username}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const activityData = await fetchAllActivityData(username, token);
  const summaryData = generateActivitySummary(activityData);

  cache.set(cacheKey, {
    data: summaryData,
    timestamp: Date.now(),
  });

  // Clean up old cache entries
  if (cache.size > 1000) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }

  return summaryData;
}

/**
 * Main API handler
 * @param {Request} req - HTTP Request
 * @param {Response} res - HTTP Response
 */
export default async function handler(req, res) {
  const {
    username,
    theme = 'default',
    type = 'activity', // 'activity', 'compact', 'languages'
    border = 'true',
    border_radius,
    hide_stats,
    hide_projects,
    cache_seconds,
  } = req.query;

  // Validate username
  if (!username) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(400).json({
      error: 'Missing required parameter: username',
      usage: '/?username=YOUR_GITHUB_USERNAME',
    });
  }

  // Validate username format
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(400).json({
      error: 'Invalid username format',
    });
  }

  // Validate theme
  if (!themes[theme]) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(400).json({
      error: `Invalid theme: ${theme}`,
      available_themes: Object.keys(themes),
    });
  }

  try {
    // Get GitHub token from environment or header
    const githubToken = process.env.GITHUB_TOKEN || req.headers['x-github-token'];

    // Fetch and process data
    const summaryData = await getCachedData(username, githubToken);

    // Card generation options
    const options = {
      theme,
      showBorder: border !== 'false',
      borderRadius: border_radius ? parseFloat(border_radius) : 4.5,
      hideStats: hide_stats === 'true',
      hideProjects: hide_projects === 'true',
    };

    // Generate appropriate card type
    let svg;
    switch (type) {
    case 'compact':
      svg = generateCompactCard(summaryData, options);
      break;
    case 'languages':
      svg = generateLanguagesCard(summaryData, options);
      break;
    case 'activity':
    default:
      svg = generateActivityCard(summaryData, options);
      break;
    }

    // Set cache headers
    const cacheSeconds = cache_seconds ? parseInt(cache_seconds) : 14400; // 4 hours default
    res.setHeader('Cache-Control', `public, max-age=${Math.min(cacheSeconds, 86400)}`);
    res.setHeader('Content-Type', 'image/svg+xml');

    return res.status(200).send(svg);
  } catch (error) {
    console.error('Error generating card:', error);

    // Generate error SVG
    const errorSvg = generateErrorCard(error.message);

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    return res.status(error.message.includes('not found') ? 404 : 500).send(errorSvg);
  }
}

/**
 * Generates an error card SVG
 * @param {string} message - Error message
 * @returns {string} SVG string
 */
function generateErrorCard(message) {
  const escapedMessage = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .substring(0, 100);

  return `
<svg width="495" height="120" viewBox="0 0 495 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .header { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: #e74c3c; }
    .message { font: 400 14px 'Segoe UI', Ubuntu, Sans-Serif; fill: #666; }
  </style>
  <rect x="0.5" y="0.5" rx="4.5" width="494" height="119" fill="#ffeef0" stroke="#e74c3c" stroke-width="1"/>
  <text x="25" y="35" class="header">Error</text>
  <text x="25" y="60" class="message">${escapedMessage}</text>
  <text x="25" y="85" class="message">Please check the username and try again.</text>
</svg>
`.trim();
}
