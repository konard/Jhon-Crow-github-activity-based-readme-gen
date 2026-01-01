#!/usr/bin/env node

/**
 * Example: Generate activity card for a GitHub user
 *
 * Usage:
 *   node examples/generate-card.js <username> [theme] [output-file]
 *
 * Examples:
 *   node examples/generate-card.js octocat
 *   node examples/generate-card.js octocat dark
 *   node examples/generate-card.js octocat dracula card.svg
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchAllActivityData } from '../src/github-api.js';
import { generateActivitySummary } from '../src/activity-summarizer.js';
import { generateActivityCard, generateCompactCard, generateLanguagesCard } from '../src/card-generator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Usage: node examples/generate-card.js <username> [theme] [output-file]

Arguments:
  username    GitHub username (required)
  theme       Theme name (default: 'default')
  output-file Output file path (default: prints to stdout)

Examples:
  node examples/generate-card.js octocat
  node examples/generate-card.js octocat dark
  node examples/generate-card.js octocat dracula card.svg
`);
    process.exit(1);
  }

  const username = args[0];
  const theme = args[1] || 'default';
  const outputFile = args[2];

  console.log(`Fetching activity data for ${username}...`);

  try {
    // Fetch data from GitHub
    const activityData = await fetchAllActivityData(username, process.env.GITHUB_TOKEN);

    console.log(`Found ${activityData.events.length} recent events`);
    console.log(`User has ${activityData.contributionStats.totalRepos} repositories`);

    // Generate summary
    const summaryData = generateActivitySummary(activityData);

    console.log(`\nSummary: ${summaryData.summary}\n`);

    // Generate cards
    const activityCard = generateActivityCard(summaryData, { theme });
    const compactCard = generateCompactCard(summaryData, { theme });
    const languagesCard = generateLanguagesCard(summaryData, { theme });

    if (outputFile) {
      // Save to file
      const outputPath = path.resolve(process.cwd(), outputFile);
      fs.writeFileSync(outputPath, activityCard);
      console.log(`Activity card saved to: ${outputPath}`);

      // Also save compact and languages cards
      const baseName = path.basename(outputFile, path.extname(outputFile));
      const dir = path.dirname(outputPath);

      fs.writeFileSync(path.join(dir, `${baseName}-compact.svg`), compactCard);
      console.log(`Compact card saved to: ${path.join(dir, `${baseName}-compact.svg`)}`);

      fs.writeFileSync(path.join(dir, `${baseName}-languages.svg`), languagesCard);
      console.log(`Languages card saved to: ${path.join(dir, `${baseName}-languages.svg`)}`);
    } else {
      // Print to stdout
      console.log('\n--- Activity Card SVG ---\n');
      console.log(activityCard);
    }

    // Print stats
    console.log('\n--- Stats ---');
    console.log(`Total Events: ${summaryData.stats.totalEvents}`);
    console.log(`Total Repos: ${summaryData.stats.totalRepos}`);
    console.log(`Total Stars: ${summaryData.stats.totalStars}`);
    console.log(`Activity Streak: ${summaryData.stats.activityStreak} days`);
    console.log(`Primary Language: ${summaryData.primaryLanguage || 'N/A'}`);

    if (summaryData.achievements.length > 0) {
      console.log(`Achievements: ${summaryData.achievements.join(', ')}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
