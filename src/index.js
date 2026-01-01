/**
 * GitHub Activity Based README Generator
 *
 * Main entry point for local development
 * For production, use the Vercel serverless function in /api
 */

import http from 'http';
import { URL } from 'url';
import { fetchAllActivityData } from './github-api.js';
import { generateActivitySummary } from './activity-summarizer.js';
import { generateActivityCard, generateCompactCard, generateLanguagesCard } from './card-generator.js';
import themes from '../themes/index.js';
import 'dotenv/config';

const PORT = process.env.PORT || 3000;

/**
 * Simple in-memory cache
 */
const cache = new Map();
const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours

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

  return summaryData;
}

/**
 * Request handler
 */
async function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // Health check
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // API endpoint
  if (pathname === '/' || pathname === '/api') {
    const username = url.searchParams.get('username');
    const theme = url.searchParams.get('theme') || 'default';
    const type = url.searchParams.get('type') || 'activity';
    const border = url.searchParams.get('border') !== 'false';
    const borderRadius = parseFloat(url.searchParams.get('border_radius')) || 4.5;
    const hideStats = url.searchParams.get('hide_stats') === 'true';
    const hideProjects = url.searchParams.get('hide_projects') === 'true';

    if (!username) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Missing required parameter: username',
        usage: '/?username=YOUR_GITHUB_USERNAME',
        available_themes: Object.keys(themes),
        available_types: ['activity', 'compact', 'languages'],
      }));
      return;
    }

    if (!themes[theme]) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: `Invalid theme: ${theme}`,
        available_themes: Object.keys(themes),
      }));
      return;
    }

    try {
      const token = process.env.GITHUB_TOKEN;
      const summaryData = await getCachedData(username, token);

      const options = {
        theme,
        showBorder: border,
        borderRadius,
        hideStats,
        hideProjects,
      };

      let svg;
      switch (type) {
      case 'compact':
        svg = generateCompactCard(summaryData, options);
        break;
      case 'languages':
        svg = generateLanguagesCard(summaryData, options);
        break;
      default:
        svg = generateActivityCard(summaryData, options);
      }

      res.writeHead(200, {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=14400',
      });
      res.end(svg);
    } catch (error) {
      console.error('Error:', error.message);
      res.writeHead(error.message.includes('not found') ? 404 : 500, {
        'Content-Type': 'application/json',
      });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  // Not found
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
}

// Create and start server
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  GitHub Activity README Generator                              ║
║  Server running at http://localhost:${PORT}                       ║
╠═══════════════════════════════════════════════════════════════╣
║  Usage: http://localhost:${PORT}/?username=YOUR_GITHUB_USERNAME   ║
║                                                                ║
║  Parameters:                                                   ║
║    - username (required): GitHub username                      ║
║    - theme: ${Object.keys(themes).slice(0, 5).join(', ')}...         ║
║    - type: activity, compact, languages                        ║
║    - border: true/false                                        ║
║    - hide_stats: true/false                                    ║
║    - hide_projects: true/false                                 ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

export default server;
