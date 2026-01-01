/**
 * SVG Card Generator
 * Generates beautiful SVG cards displaying GitHub activity summaries
 */

import themes from '../themes/index.js';

/**
 * Escapes HTML/XML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Wraps text to fit within a specified width
 * @param {string} text - Text to wrap
 * @param {number} maxChars - Maximum characters per line
 * @returns {Array<string>} Array of wrapped lines
 */
function wrapText(text, maxChars = 50) {
  if (!text) return [];

  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxChars) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Generates the main activity card SVG
 * @param {Object} summaryData - Data from generateActivitySummary
 * @param {Object} options - Customization options
 * @returns {string} SVG string
 */
export function generateActivityCard(summaryData, options = {}) {
  const {
    theme = 'default',
    width = 495,
    showBorder = true,
    borderRadius = 4.5,
    locale: _locale = 'en',
    hideStats = false,
    hideProjects = false,
  } = options;

  const themeConfig = themes[theme] || themes.default;
  const {
    background,
    border,
    title: titleColor,
    text: textColor,
    icon: _iconColor,
    accent,
  } = themeConfig;

  const {
    displayName,
    summary,
    stats,
    recentProjects,
    primaryLanguage,
    languages: _languages,
    achievements,
  } = summaryData;

  // Calculate dynamic height based on content
  let height = 120; // Base height for header

  // Add height for summary text
  const summaryLines = wrapText(summary, 55);
  height += summaryLines.length * 18 + 20;

  // Add height for stats section
  if (!hideStats) {
    height += 50;
  }

  // Add height for projects section
  if (!hideProjects && recentProjects && recentProjects.length > 0) {
    height += 30 + Math.min(recentProjects.length, 3) * 22;
  }

  // Add height for achievements
  if (achievements && achievements.length > 0) {
    height += 40;
  }

  // Minimum height
  height = Math.max(height, 195);

  // Generate SVG
  const borderStyle = showBorder
    ? `stroke="${border}" stroke-width="1" stroke-opacity="1"`
    : '';

  let svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"
     fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .header { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${titleColor}; }
    .stat-label { font: 400 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${textColor}; }
    .stat-value { font: 600 14px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${titleColor}; }
    .summary-text { font: 400 13px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${textColor}; }
    .project-name { font: 600 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${accent}; }
    .project-detail { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${textColor}; opacity: 0.8; }
    .section-title { font: 600 13px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${titleColor}; }
    .achievement { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${accent}; }
    .language-tag { font: 600 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${textColor}; }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate { animation: fadeIn 0.3s ease-in-out forwards; }
  </style>

  <rect x="0.5" y="0.5" rx="${borderRadius}" width="${width - 1}" height="${height - 1}"
        fill="${background}" ${borderStyle}/>
`;

  let yOffset = 35;

  // Header with username
  svg += `
  <g transform="translate(25, ${yOffset})">
    <text class="header">${escapeHtml(displayName)}'s GitHub Activity</text>
  </g>
`;
  yOffset += 15;

  // Primary language indicator
  if (primaryLanguage) {
    svg += `
  <g transform="translate(25, ${yOffset})">
    <circle cx="6" cy="5" r="6" fill="${accent}"/>
    <text x="18" y="9" class="language-tag">${escapeHtml(primaryLanguage)}</text>
  </g>
`;
    yOffset += 25;
  } else {
    yOffset += 10;
  }

  // Summary text
  for (let i = 0; i < summaryLines.length; i++) {
    svg += `
  <text x="25" y="${yOffset + i * 18}" class="summary-text animate" style="animation-delay: ${i * 0.1}s">
    ${escapeHtml(summaryLines[i])}
  </text>
`;
  }
  yOffset += summaryLines.length * 18 + 15;

  // Stats section
  if (!hideStats && stats) {
    svg += `
  <g transform="translate(25, ${yOffset})">
    <text class="section-title">Stats</text>
  </g>
`;
    yOffset += 20;

    const statsItems = [
      { label: 'Repositories', value: stats.totalRepos || 0 },
      { label: 'Stars', value: stats.totalStars || 0 },
      { label: 'Activity Streak', value: `${stats.activityStreak || 0} days` },
      { label: 'Recent Events', value: stats.totalEvents || 0 },
    ];

    let statX = 25;
    for (const stat of statsItems) {
      svg += `
    <g transform="translate(${statX}, ${yOffset})">
      <text class="stat-value">${escapeHtml(String(stat.value))}</text>
      <text y="14" class="stat-label">${escapeHtml(stat.label)}</text>
    </g>
`;
      statX += 105;
    }
    yOffset += 40;
  }

  // Recent projects section
  if (!hideProjects && recentProjects && recentProjects.length > 0) {
    svg += `
  <g transform="translate(25, ${yOffset})">
    <text class="section-title">Recent Projects</text>
  </g>
`;
    yOffset += 20;

    const projectsToShow = recentProjects.slice(0, 3);
    for (const project of projectsToShow) {
      const detail = project.detail
        ? ` - ${project.detail.substring(0, 40)}${project.detail.length > 40 ? '...' : ''}`
        : '';
      svg += `
  <g transform="translate(25, ${yOffset})">
    <text class="project-name">${escapeHtml(project.name)}</text>
    <text x="${project.name.length * 7 + 5}" class="project-detail">${escapeHtml(detail)}</text>
  </g>
`;
      yOffset += 22;
    }
  }

  // Achievements section
  if (achievements && achievements.length > 0) {
    yOffset += 10;
    svg += `
  <g transform="translate(25, ${yOffset})">
`;
    let achieveX = 0;
    for (const achievement of achievements.slice(0, 3)) {
      const badgeWidth = achievement.length * 6 + 16;
      svg += `
    <rect x="${achieveX}" y="-10" width="${badgeWidth}" height="18" rx="9" fill="${accent}" opacity="0.2"/>
    <text x="${achieveX + 8}" y="3" class="achievement">${escapeHtml(achievement)}</text>
`;
      achieveX += badgeWidth + 8;
    }
    svg += `
  </g>
`;
  }

  svg += '\n</svg>';

  return svg.trim();
}

/**
 * Generates a compact stats card
 * @param {Object} summaryData - Summary data
 * @param {Object} options - Options
 * @returns {string} SVG string
 */
export function generateCompactCard(summaryData, options = {}) {
  const {
    theme = 'default',
    width = 350,
    showBorder = true,
    borderRadius = 4.5,
  } = options;

  const themeConfig = themes[theme] || themes.default;
  const {
    background,
    border,
    title: titleColor,
    text: textColor,
    accent,
  } = themeConfig;

  const { displayName, primaryLanguage, stats } = summaryData;
  const height = 80;

  const borderStyle = showBorder
    ? `stroke="${border}" stroke-width="1" stroke-opacity="1"`
    : '';

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"
     fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .title { font: 600 14px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${titleColor}; }
    .stat { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${textColor}; }
    .value { font: 600 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${accent}; }
  </style>

  <rect x="0.5" y="0.5" rx="${borderRadius}" width="${width - 1}" height="${height - 1}"
        fill="${background}" ${borderStyle}/>

  <g transform="translate(15, 25)">
    <text class="title">${escapeHtml(displayName)}</text>
    ${primaryLanguage ? `<text x="${displayName.length * 8 + 10}" class="value">${escapeHtml(primaryLanguage)}</text>` : ''}
  </g>

  <g transform="translate(15, 50)">
    <text class="stat">Repos: <tspan class="value">${stats?.totalRepos || 0}</tspan></text>
    <text x="80" class="stat">Stars: <tspan class="value">${stats?.totalStars || 0}</tspan></text>
    <text x="150" class="stat">Streak: <tspan class="value">${stats?.activityStreak || 0}d</tspan></text>
    <text x="230" class="stat">Events: <tspan class="value">${stats?.totalEvents || 0}</tspan></text>
  </g>
</svg>
`.trim();
}

/**
 * Generates a languages card showing language distribution
 * @param {Object} summaryData - Summary data
 * @param {Object} options - Options
 * @returns {string} SVG string
 */
export function generateLanguagesCard(summaryData, options = {}) {
  const {
    theme = 'default',
    width = 300,
    showBorder = true,
    borderRadius = 4.5,
    layout = 'compact', // 'compact', 'normal', 'donut'
  } = options;

  const themeConfig = themes[theme] || themes.default;
  const {
    background,
    border,
    title: titleColor,
    text: textColor,
  } = themeConfig;

  const { displayName: _displayName, languages } = summaryData;

  // Language colors (subset of common languages)
  const languageColors = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Python: '#3572A5',
    Java: '#b07219',
    Go: '#00ADD8',
    Rust: '#dea584',
    Ruby: '#701516',
    PHP: '#4F5D95',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    Swift: '#ffac45',
    Kotlin: '#F18E33',
    Scala: '#c22d40',
    Shell: '#89e051',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Vue: '#41b883',
    Dart: '#00B4AB',
    Elixir: '#6e4a7e',
  };

  const height = layout === 'compact' ? 100 : 140;
  const borderStyle = showBorder
    ? `stroke="${border}" stroke-width="1" stroke-opacity="1"`
    : '';

  // Calculate percentages
  const totalSize = languages.reduce((sum, [_, size]) => sum + size, 0) || 1;
  const languageData = languages.slice(0, 5).map(([lang, size]) => ({
    name: lang,
    percentage: (size / totalSize * 100).toFixed(1),
    color: languageColors[lang] || '#858585',
  }));

  let svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"
     fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .title { font: 600 14px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${titleColor}; }
    .lang-name { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${textColor}; }
    .lang-percent { font: 600 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${textColor}; }
  </style>

  <rect x="0.5" y="0.5" rx="${borderRadius}" width="${width - 1}" height="${height - 1}"
        fill="${background}" ${borderStyle}/>

  <text x="15" y="25" class="title">Most Used Languages</text>
`;

  // Progress bar
  let barX = 15;
  const barWidth = width - 30;
  const barHeight = 8;

  svg += '<g transform="translate(0, 40)">';

  for (const lang of languageData) {
    const segmentWidth = (parseFloat(lang.percentage) / 100) * barWidth;
    if (segmentWidth > 0) {
      svg += `
    <rect x="${barX}" y="0" width="${segmentWidth}" height="${barHeight}" fill="${lang.color}" rx="1"/>
`;
      barX += segmentWidth;
    }
  }
  svg += '</g>';

  // Language labels
  let labelY = 60;
  let labelX = 15;
  const labelSpacing = 90;

  for (let i = 0; i < languageData.length; i++) {
    const lang = languageData[i];
    if (i > 0 && i % 3 === 0) {
      labelY += 20;
      labelX = 15;
    }
    svg += `
  <g transform="translate(${labelX}, ${labelY})">
    <circle cx="4" cy="5" r="4" fill="${lang.color}"/>
    <text x="12" y="9" class="lang-name">${escapeHtml(lang.name)}</text>
    <text x="${12 + lang.name.length * 6 + 5}" y="9" class="lang-percent">${lang.percentage}%</text>
  </g>
`;
    labelX += labelSpacing;
  }

  svg += '\n</svg>';

  return svg.trim();
}

export default {
  generateActivityCard,
  generateCompactCard,
  generateLanguagesCard,
};
