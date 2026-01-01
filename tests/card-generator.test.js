/**
 * Tests for Card Generator module
 */

import { generateActivityCard, generateCompactCard, generateLanguagesCard } from '../src/card-generator.js';

describe('Card Generator', () => {
  const mockSummaryData = {
    username: 'testuser',
    displayName: 'Test User',
    avatarUrl: 'https://example.com/avatar.png',
    profileUrl: 'https://github.com/testuser',
    summary: 'Test User is a developer who primarily works with JavaScript. They are an early bird, most productive in the morning.',
    primaryLanguage: 'JavaScript',
    languages: ['JavaScript', 'Python', 'TypeScript'],
    recentProjects: [
      { name: 'project1', fullName: 'testuser/project1', activityType: 'code commits', detail: 'Initial commit' },
      { name: 'project2', fullName: 'testuser/project2', activityType: 'pull requests', detail: 'Add new feature' },
    ],
    achievements: ['Code Review Champion'],
    notablePatterns: [
      { type: 'streak', description: '7-day activity streak' },
      { type: 'schedule', description: 'an early bird, most productive in the morning' },
    ],
    stats: {
      totalEvents: 25,
      totalRepos: 15,
      totalStars: 50,
      activityStreak: 7,
    },
  };

  describe('generateActivityCard', () => {
    it('should generate valid SVG', () => {
      const svg = generateActivityCard(mockSummaryData);

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    });

    it('should include username in card', () => {
      const svg = generateActivityCard(mockSummaryData);

      expect(svg).toContain('Test User');
    });

    it('should include stats section by default', () => {
      const svg = generateActivityCard(mockSummaryData);

      expect(svg).toContain('Repositories');
      expect(svg).toContain('Stars');
      expect(svg).toContain('15'); // totalRepos
      expect(svg).toContain('50'); // totalStars
    });

    it('should hide stats when option is set', () => {
      const svg = generateActivityCard(mockSummaryData, { hideStats: true });

      expect(svg).not.toContain('>Stats<');
    });

    it('should include recent projects by default', () => {
      const svg = generateActivityCard(mockSummaryData);

      expect(svg).toContain('project1');
      expect(svg).toContain('project2');
    });

    it('should hide projects when option is set', () => {
      const svg = generateActivityCard(mockSummaryData, { hideProjects: true });

      expect(svg).not.toContain('Recent Projects');
    });

    it('should apply theme colors', () => {
      const svg = generateActivityCard(mockSummaryData, { theme: 'dark' });

      expect(svg).toContain('#151515'); // dark background
    });

    it('should hide border when option is set', () => {
      const svg = generateActivityCard(mockSummaryData, { showBorder: false });

      expect(svg).not.toContain('stroke=');
    });

    it('should apply custom border radius', () => {
      const svg = generateActivityCard(mockSummaryData, { borderRadius: 10 });

      expect(svg).toContain('rx="10"');
    });

    it('should escape HTML in user content', () => {
      const dataWithHtml = {
        ...mockSummaryData,
        displayName: 'Test <script>alert("xss")</script> User',
      };

      const svg = generateActivityCard(dataWithHtml);

      expect(svg).not.toContain('<script>');
      expect(svg).toContain('&lt;script&gt;');
    });
  });

  describe('generateCompactCard', () => {
    it('should generate valid SVG', () => {
      const svg = generateCompactCard(mockSummaryData);

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('should have smaller dimensions than activity card', () => {
      const svg = generateCompactCard(mockSummaryData);

      expect(svg).toContain('width="350"');
      expect(svg).toContain('height="80"');
    });

    it('should include key stats', () => {
      const svg = generateCompactCard(mockSummaryData);

      expect(svg).toContain('Repos');
      expect(svg).toContain('Stars');
      expect(svg).toContain('Streak');
    });
  });

  describe('generateLanguagesCard', () => {
    const dataWithLanguages = {
      ...mockSummaryData,
      languages: [
        ['JavaScript', 5000],
        ['Python', 3000],
        ['TypeScript', 2000],
      ],
    };

    it('should generate valid SVG', () => {
      const svg = generateLanguagesCard(dataWithLanguages);

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('should include language names', () => {
      const svg = generateLanguagesCard(dataWithLanguages);

      expect(svg).toContain('JavaScript');
      expect(svg).toContain('Python');
      expect(svg).toContain('TypeScript');
    });

    it('should show percentages', () => {
      const svg = generateLanguagesCard(dataWithLanguages);

      // JavaScript should be 50% (5000/10000)
      expect(svg).toContain('50.0%');
    });

    it('should apply theme colors', () => {
      const svg = generateLanguagesCard(dataWithLanguages, { theme: 'dracula' });

      expect(svg).toContain('#282a36'); // dracula background
    });
  });

  describe('theme support', () => {
    const themes = ['default', 'dark', 'radical', 'dracula', 'nord', 'github-dark'];

    themes.forEach(theme => {
      it(`should support ${theme} theme`, () => {
        const svg = generateActivityCard(mockSummaryData, { theme });

        expect(svg).toContain('<svg');
        expect(svg).toContain('</svg>');
      });
    });

    it('should fallback to default for unknown theme', () => {
      const svg = generateActivityCard(mockSummaryData, { theme: 'unknown-theme' });

      expect(svg).toContain('<svg');
      // Should use default background
      expect(svg).toContain('#ffffff');
    });
  });
});
