/**
 * Activity Summarizer Module
 * Generates human-readable summaries of GitHub activity
 * Uses rule-based analysis to identify interesting patterns and achievements
 */

/**
 * Event type descriptions in human-readable form
 */
const EVENT_DESCRIPTIONS = {
  PushEvent: 'code commits',
  PullRequestEvent: 'pull requests',
  IssuesEvent: 'issues',
  CreateEvent: 'repository/branch creations',
  DeleteEvent: 'branch deletions',
  WatchEvent: 'repository stars',
  ForkEvent: 'repository forks',
  IssueCommentEvent: 'issue comments',
  PullRequestReviewEvent: 'code reviews',
  PullRequestReviewCommentEvent: 'review comments',
  CommitCommentEvent: 'commit comments',
  ReleaseEvent: 'releases',
  PublicEvent: 'repository publications',
  MemberEvent: 'collaborator additions',
  GollumEvent: 'wiki updates',
};

/**
 * Generates a summary of unusual/notable activity patterns
 * @param {Object} activityData - Complete activity data from fetchAllActivityData
 * @returns {Object} Summary with notable patterns and human-readable text
 */
export function generateActivitySummary(activityData) {
  const { profile, eventAnalysis, contributionStats, events } = activityData;

  const notablePatterns = [];
  const achievements = [];
  const activityHighlights = [];

  // Analyze activity streak
  if (eventAnalysis.activityStreak >= 7) {
    notablePatterns.push({
      type: 'streak',
      severity: eventAnalysis.activityStreak >= 30 ? 'exceptional' : 'notable',
      description: `${eventAnalysis.activityStreak}-day activity streak`,
    });
  }

  // Analyze peak working hours
  const peakHour = eventAnalysis.peakHour;
  let timeDescription = '';
  if (peakHour >= 0 && peakHour < 6) {
    timeDescription = 'a night owl, most active in the early morning hours';
  } else if (peakHour >= 6 && peakHour < 12) {
    timeDescription = 'an early bird, most productive in the morning';
  } else if (peakHour >= 12 && peakHour < 18) {
    timeDescription = 'most active during afternoon hours';
  } else {
    timeDescription = 'an evening coder, most active in the late hours';
  }
  notablePatterns.push({
    type: 'schedule',
    description: timeDescription,
  });

  // Analyze main focus area
  if (eventAnalysis.mostActiveRepo) {
    const repoName = eventAnalysis.mostActiveRepo.split('/')[1] || eventAnalysis.mostActiveRepo;
    activityHighlights.push(`Heavily focused on "${repoName}"`);
  }

  // Analyze event distribution
  const eventCounts = eventAnalysis.eventCounts;
  const totalEvents = eventAnalysis.totalEvents;

  if (eventCounts.PushEvent && eventCounts.PushEvent / totalEvents > 0.5) {
    activityHighlights.push('Primarily focused on pushing code');
  }

  if (eventCounts.PullRequestReviewEvent && eventCounts.PullRequestReviewEvent > 5) {
    activityHighlights.push('Active code reviewer');
    achievements.push('Code Review Champion');
  }

  if (eventCounts.IssuesEvent && eventCounts.IssuesEvent > 10) {
    activityHighlights.push('Active issue tracker');
  }

  // Analyze contribution stats
  if (contributionStats.totalStars >= 100) {
    achievements.push(`Earned ${contributionStats.totalStars} stars`);
  }

  if (contributionStats.totalRepos >= 50) {
    achievements.push('Prolific creator with 50+ repositories');
  }

  // Analyze language diversity
  const languages = Object.keys(contributionStats.languages);
  if (languages.length >= 5) {
    achievements.push(`Polyglot developer using ${languages.length} languages`);
  }

  // Find the primary language
  const primaryLanguage = Object.entries(contributionStats.languages)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  // Analyze recent project activity
  const recentProjects = extractRecentProjects(events);

  // Generate human-readable summary
  const summary = generateHumanReadableSummary({
    profile,
    notablePatterns,
    achievements,
    activityHighlights,
    primaryLanguage,
    languages,
    recentProjects,
    eventAnalysis,
    contributionStats,
  });

  return {
    username: profile.login,
    displayName: profile.name || profile.login,
    avatarUrl: profile.avatar_url,
    profileUrl: profile.html_url,
    notablePatterns,
    achievements,
    activityHighlights,
    primaryLanguage,
    languages: languages.slice(0, 5),
    recentProjects,
    summary,
    stats: {
      totalEvents: totalEvents,
      totalRepos: contributionStats.totalRepos,
      totalStars: contributionStats.totalStars,
      activityStreak: eventAnalysis.activityStreak,
    },
  };
}

/**
 * Extracts recent project information from events
 * @param {Array} events - GitHub events
 * @returns {Array} Recent projects with descriptions
 */
function extractRecentProjects(events) {
  const projectMap = new Map();

  for (const event of events) {
    const repoName = event.repo?.name;
    if (!repoName || projectMap.has(repoName)) continue;

    const project = {
      name: repoName.split('/')[1] || repoName,
      fullName: repoName,
      activityType: EVENT_DESCRIPTIONS[event.type] || event.type,
      lastActive: event.created_at,
    };

    // Extract additional context from payload
    if (event.type === 'PushEvent' && event.payload?.commits) {
      const commitCount = event.payload.commits.length;
      project.detail = `${commitCount} commit${commitCount > 1 ? 's' : ''}`;
    } else if (event.type === 'PullRequestEvent' && event.payload?.pull_request) {
      project.detail = event.payload.pull_request.title;
    } else if (event.type === 'IssuesEvent' && event.payload?.issue) {
      project.detail = event.payload.issue.title;
    } else if (event.type === 'CreateEvent' && event.payload?.ref_type) {
      project.detail = `Created ${event.payload.ref_type}`;
    }

    projectMap.set(repoName, project);
  }

  return Array.from(projectMap.values()).slice(0, 5);
}

/**
 * Generates human-readable summary text
 * @param {Object} data - Processed activity data
 * @returns {string} Human-readable summary
 */
function generateHumanReadableSummary(data) {
  const {
    profile,
    notablePatterns,
    achievements,
    activityHighlights: _activityHighlights,
    primaryLanguage,
    recentProjects,
    contributionStats,
  } = data;

  const lines = [];

  // Opening line
  const name = profile.name || profile.login;
  if (primaryLanguage) {
    lines.push(`${name} is a developer who primarily works with ${primaryLanguage}.`);
  } else {
    lines.push(`${name} is an active developer on GitHub.`);
  }

  // Activity patterns
  const schedulePattern = notablePatterns.find(p => p.type === 'schedule');
  if (schedulePattern) {
    lines.push(`They are ${schedulePattern.description}.`);
  }

  // Streak
  const streakPattern = notablePatterns.find(p => p.type === 'streak');
  if (streakPattern) {
    if (streakPattern.severity === 'exceptional') {
      lines.push(`Impressively, they've maintained a ${streakPattern.description}!`);
    } else {
      lines.push(`They've been on a ${streakPattern.description}.`);
    }
  }

  // Recent focus
  if (recentProjects.length > 0) {
    const projectNames = recentProjects.slice(0, 3).map(p => p.name).join(', ');
    lines.push(`Recently active on: ${projectNames}.`);
  }

  // Achievements
  if (achievements.length > 0) {
    lines.push(`Notable: ${achievements.join(', ')}.`);
  }

  // Stats summary
  if (contributionStats.totalRepos > 0 || contributionStats.totalStars > 0) {
    const statParts = [];
    if (contributionStats.totalRepos > 0) {
      statParts.push(`${contributionStats.totalRepos} repositories`);
    }
    if (contributionStats.totalStars > 0) {
      statParts.push(`${contributionStats.totalStars} stars earned`);
    }
    lines.push(`Stats: ${statParts.join(', ')}.`);
  }

  return lines.join(' ');
}

/**
 * Generates a short one-line description
 * @param {Object} activityData - Activity data
 * @returns {string} Short description
 */
export function generateShortSummary(activityData) {
  const { profile, contributionStats, eventAnalysis } = activityData;
  const name = profile.name || profile.login;

  const primaryLanguage = Object.entries(contributionStats.languages)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  if (primaryLanguage && eventAnalysis.activityStreak >= 7) {
    return `${name}: ${primaryLanguage} developer on a ${eventAnalysis.activityStreak}-day streak`;
  } else if (primaryLanguage) {
    return `${name}: Active ${primaryLanguage} developer`;
  } else {
    return `${name}: Active GitHub contributor`;
  }
}

export default {
  generateActivitySummary,
  generateShortSummary,
};
