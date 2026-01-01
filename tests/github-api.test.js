/**
 * Tests for GitHub API module
 */

import { jest } from '@jest/globals';

// Mock axios before importing the module
const mockAxios = {
  create: jest.fn(() => ({
    get: jest.fn(),
  })),
};

jest.unstable_mockModule('axios', () => ({
  default: mockAxios,
}));

describe('GitHub API', () => {
  let githubApi;
  let mockClient;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockClient = { get: jest.fn() };
    mockAxios.create.mockReturnValue(mockClient);

    // Dynamic import after mocking
    githubApi = await import('../src/github-api.js');
  });

  describe('analyzeEvents', () => {
    it('should count events by type', () => {
      const events = [
        { type: 'PushEvent', created_at: '2024-01-15T10:00:00Z', repo: { name: 'test/repo' } },
        { type: 'PushEvent', created_at: '2024-01-15T11:00:00Z', repo: { name: 'test/repo' } },
        { type: 'PullRequestEvent', created_at: '2024-01-15T12:00:00Z', repo: { name: 'test/repo' } },
      ];

      const result = githubApi.analyzeEvents(events);

      expect(result.eventCounts.PushEvent).toBe(2);
      expect(result.eventCounts.PullRequestEvent).toBe(1);
      expect(result.totalEvents).toBe(3);
    });

    it('should identify most active repo', () => {
      const events = [
        { type: 'PushEvent', created_at: '2024-01-15T10:00:00Z', repo: { name: 'user/repo1' } },
        { type: 'PushEvent', created_at: '2024-01-15T11:00:00Z', repo: { name: 'user/repo2' } },
        { type: 'PushEvent', created_at: '2024-01-15T12:00:00Z', repo: { name: 'user/repo2' } },
        { type: 'PushEvent', created_at: '2024-01-15T13:00:00Z', repo: { name: 'user/repo2' } },
      ];

      const result = githubApi.analyzeEvents(events);

      expect(result.mostActiveRepo).toBe('user/repo2');
    });

    it('should calculate activity streak', () => {
      const events = [
        { type: 'PushEvent', created_at: '2024-01-15T10:00:00Z', repo: { name: 'test/repo' } },
        { type: 'PushEvent', created_at: '2024-01-16T10:00:00Z', repo: { name: 'test/repo' } },
        { type: 'PushEvent', created_at: '2024-01-17T10:00:00Z', repo: { name: 'test/repo' } },
      ];

      const result = githubApi.analyzeEvents(events);

      expect(result.activityStreak).toBe(3);
    });

    it('should handle empty events array', () => {
      const result = githubApi.analyzeEvents([]);

      expect(result.totalEvents).toBe(0);
      expect(result.eventCounts).toEqual({});
      expect(result.mostActiveRepo).toBeNull();
    });

    it('should track hourly activity and find peak hour', () => {
      // Use a specific hour that should be identified as peak
      // We use events at the same local hour to make the test timezone-independent
      const now = new Date();
      const hour1 = new Date(now);
      hour1.setHours(10, 0, 0, 0);
      const hour2 = new Date(now);
      hour2.setHours(10, 30, 0, 0);
      const hour3 = new Date(now);
      hour3.setHours(15, 0, 0, 0);

      const events = [
        { type: 'PushEvent', created_at: hour1.toISOString(), repo: { name: 'test/repo' } },
        { type: 'PushEvent', created_at: hour2.toISOString(), repo: { name: 'test/repo' } },
        { type: 'PushEvent', created_at: hour3.toISOString(), repo: { name: 'test/repo' } },
      ];

      const result = githubApi.analyzeEvents(events);

      // Hour 10 should be the peak since it has 2 events vs hour 15 which has 1
      expect(result.peakHour).toBe(10);
    });
  });
});
