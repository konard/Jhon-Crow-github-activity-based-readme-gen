/**
 * Tests for Activity Summarizer module
 */

import { generateActivitySummary, generateShortSummary } from '../src/activity-summarizer.js';

describe('Activity Summarizer', () => {
  const mockActivityData = {
    profile: {
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://example.com/avatar.png',
      html_url: 'https://github.com/testuser',
    },
    events: [
      {
        type: 'PushEvent',
        created_at: '2024-01-15T10:00:00Z',
        repo: { name: 'testuser/project1' },
        payload: { commits: [{ message: 'Initial commit' }] },
      },
      {
        type: 'PullRequestEvent',
        created_at: '2024-01-14T10:00:00Z',
        repo: { name: 'testuser/project2' },
        payload: { pull_request: { title: 'Add new feature' } },
      },
    ],
    eventAnalysis: {
      eventCounts: { PushEvent: 5, PullRequestEvent: 2 },
      repoActivity: [['testuser/project1', 4], ['testuser/project2', 3]],
      peakHour: 10,
      activityStreak: 7,
      totalEvents: 7,
      mostActiveRepo: 'testuser/project1',
      dailyActivity: { '2024-01-15': 3, '2024-01-14': 4 },
    },
    contributionStats: {
      totalStars: 50,
      totalForks: 10,
      totalRepos: 15,
      languages: { JavaScript: 5000, Python: 3000, TypeScript: 2000 },
      recentRepos: [],
    },
  };

  describe('generateActivitySummary', () => {
    it('should return summary with correct username', () => {
      const result = generateActivitySummary(mockActivityData);

      expect(result.username).toBe('testuser');
      expect(result.displayName).toBe('Test User');
    });

    it('should identify primary language', () => {
      const result = generateActivitySummary(mockActivityData);

      expect(result.primaryLanguage).toBe('JavaScript');
    });

    it('should include stats', () => {
      const result = generateActivitySummary(mockActivityData);

      expect(result.stats.totalRepos).toBe(15);
      expect(result.stats.totalStars).toBe(50);
      expect(result.stats.activityStreak).toBe(7);
    });

    it('should identify notable patterns for streak', () => {
      const result = generateActivitySummary(mockActivityData);

      const streakPattern = result.notablePatterns.find(p => p.type === 'streak');
      expect(streakPattern).toBeDefined();
      expect(streakPattern.description).toContain('7-day');
    });

    it('should generate human-readable summary text', () => {
      const result = generateActivitySummary(mockActivityData);

      expect(result.summary).toBeTruthy();
      expect(typeof result.summary).toBe('string');
      expect(result.summary.length).toBeGreaterThan(50);
    });

    it('should extract recent projects', () => {
      const result = generateActivitySummary(mockActivityData);

      expect(result.recentProjects).toBeDefined();
      expect(Array.isArray(result.recentProjects)).toBe(true);
    });

    it('should identify schedule pattern based on peak hour', () => {
      const result = generateActivitySummary(mockActivityData);

      const schedulePattern = result.notablePatterns.find(p => p.type === 'schedule');
      expect(schedulePattern).toBeDefined();
      expect(schedulePattern.description).toContain('morning');
    });
  });

  describe('generateShortSummary', () => {
    it('should generate a short one-line description', () => {
      const result = generateShortSummary(mockActivityData);

      expect(typeof result).toBe('string');
      expect(result.length).toBeLessThan(100);
    });

    it('should include username and primary language', () => {
      const result = generateShortSummary(mockActivityData);

      expect(result).toContain('Test User');
      expect(result).toContain('JavaScript');
    });

    it('should mention streak if significant', () => {
      const result = generateShortSummary(mockActivityData);

      expect(result).toContain('streak');
    });
  });

  describe('edge cases', () => {
    it('should handle user with no name', () => {
      const dataWithoutName = {
        ...mockActivityData,
        profile: { ...mockActivityData.profile, name: null },
      };

      const result = generateActivitySummary(dataWithoutName);

      expect(result.displayName).toBe('testuser');
    });

    it('should handle empty languages', () => {
      const dataWithoutLanguages = {
        ...mockActivityData,
        contributionStats: { ...mockActivityData.contributionStats, languages: {} },
      };

      const result = generateActivitySummary(dataWithoutLanguages);

      expect(result.primaryLanguage).toBeUndefined();
    });

    it('should handle low activity streak', () => {
      const lowStreak = {
        ...mockActivityData,
        eventAnalysis: { ...mockActivityData.eventAnalysis, activityStreak: 2 },
      };

      const result = generateActivitySummary(lowStreak);

      const streakPattern = result.notablePatterns.find(p => p.type === 'streak');
      expect(streakPattern).toBeUndefined();
    });
  });
});
