import axios from 'axios';

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Creates an axios instance for GitHub API with optional authentication
 * @param {string} token - GitHub personal access token (optional)
 * @returns {import('axios').AxiosInstance}
 */
function createGitHubClient(token) {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'github-activity-readme-gen',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return axios.create({
    baseURL: GITHUB_API_BASE,
    headers,
    timeout: 30000,
  });
}

/**
 * Fetches GitHub user profile information
 * @param {string} username - GitHub username
 * @param {string} token - GitHub token (optional)
 * @returns {Promise<Object>} User profile data
 */
export async function fetchUserProfile(username, token = null) {
  const client = createGitHubClient(token);
  const response = await client.get(`/users/${username}`);
  return response.data;
}

/**
 * Fetches user's public events (activity)
 * @param {string} username - GitHub username
 * @param {string} token - GitHub token (optional)
 * @param {number} perPage - Number of events per page (max 100)
 * @returns {Promise<Array>} Array of events
 */
export async function fetchUserEvents(username, token = null, perPage = 100) {
  const client = createGitHubClient(token);
  const response = await client.get(`/users/${username}/events/public`, {
    params: { per_page: perPage }
  });
  return response.data;
}

/**
 * Fetches user's repositories
 * @param {string} username - GitHub username
 * @param {string} token - GitHub token (optional)
 * @param {string} sort - Sort field (created, updated, pushed, full_name)
 * @param {number} perPage - Number of repos per page
 * @returns {Promise<Array>} Array of repositories
 */
export async function fetchUserRepos(username, token = null, sort = 'pushed', perPage = 100) {
  const client = createGitHubClient(token);
  const response = await client.get(`/users/${username}/repos`, {
    params: { sort, per_page: perPage, type: 'owner' }
  });
  return response.data;
}

/**
 * Fetches repository commit activity
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} token - GitHub token (optional)
 * @returns {Promise<Array>} Commit activity data
 */
export async function fetchRepoCommitActivity(owner, repo, token = null) {
  const client = createGitHubClient(token);
  try {
    const response = await client.get(`/repos/${owner}/${repo}/stats/commit_activity`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 202) {
      // GitHub is computing the stats, return empty for now
      return [];
    }
    throw error;
  }
}

/**
 * Fetches user's contribution stats from repositories they own
 * @param {string} username - GitHub username
 * @param {string} token - GitHub token (optional)
 * @returns {Promise<Object>} Aggregated contribution stats
 */
export async function fetchContributionStats(username, token = null) {
  // Get user's repositories
  const repos = await fetchUserRepos(username, token);

  // Get language statistics
  const languageStats = {};
  for (const repo of repos.slice(0, 20)) { // Limit to avoid rate limiting
    if (repo.language) {
      languageStats[repo.language] = (languageStats[repo.language] || 0) + repo.size;
    }
  }

  // Calculate totals
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
  const totalRepos = repos.length;

  return {
    totalStars,
    totalForks,
    totalRepos,
    languages: languageStats,
    recentRepos: repos.slice(0, 10),
  };
}

/**
 * Analyzes user events and extracts activity patterns
 * @param {Array} events - Array of GitHub events
 * @returns {Object} Activity analysis
 */
export function analyzeEvents(events) {
  const eventCounts = {};
  const repoActivity = {};
  const dailyActivity = {};
  const hourlyActivity = Array(24).fill(0);

  for (const event of events) {
    // Count event types
    eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;

    // Track repo activity
    const repoName = event.repo?.name || 'unknown';
    repoActivity[repoName] = (repoActivity[repoName] || 0) + 1;

    // Track daily activity
    const date = event.created_at?.split('T')[0];
    if (date) {
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    }

    // Track hourly activity
    const hour = new Date(event.created_at).getHours();
    if (!isNaN(hour)) {
      hourlyActivity[hour]++;
    }
  }

  // Find peak activity hour
  const peakHour = hourlyActivity.indexOf(Math.max(...hourlyActivity));

  // Find most active repo
  const sortedRepos = Object.entries(repoActivity).sort((a, b) => b[1] - a[1]);
  const mostActiveRepo = sortedRepos[0]?.[0] || null;

  // Calculate activity streak
  const dates = Object.keys(dailyActivity).sort();
  let currentStreak = 0;
  let maxStreak = 0;

  if (dates.length > 0) {
    currentStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, currentStreak);
  }

  return {
    eventCounts,
    repoActivity: sortedRepos.slice(0, 5),
    peakHour,
    activityStreak: maxStreak,
    totalEvents: events.length,
    mostActiveRepo,
    dailyActivity,
  };
}

/**
 * Fetches and aggregates all user activity data
 * @param {string} username - GitHub username
 * @param {string} token - GitHub token (optional)
 * @returns {Promise<Object>} Complete activity data
 */
export async function fetchAllActivityData(username, token = null) {
  try {
    const [profile, events, contributionStats] = await Promise.all([
      fetchUserProfile(username, token),
      fetchUserEvents(username, token),
      fetchContributionStats(username, token),
    ]);

    const eventAnalysis = analyzeEvents(events);

    return {
      profile,
      events,
      eventAnalysis,
      contributionStats,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`User "${username}" not found`);
    }
    if (error.response?.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Please try again later or provide a token.');
    }
    throw error;
  }
}

export default {
  fetchUserProfile,
  fetchUserEvents,
  fetchUserRepos,
  fetchRepoCommitActivity,
  fetchContributionStats,
  analyzeEvents,
  fetchAllActivityData,
};
