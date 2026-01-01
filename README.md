# GitHub Activity Based README Generator

Generate beautiful, dynamic README cards that tell the story of your GitHub activity in a human-readable way.

This project is inspired by [github-readme-stats](https://github.com/anuraghazra/github-readme-stats) but focuses on generating **narrative summaries** about what you've been working on, highlighting unusual or complex activities.

## Features

- **Human-readable activity summaries** - Tells a story about what you've been doing
- **Multiple card types** - Activity, compact, and languages cards
- **20+ themes** - Including dark, radical, dracula, nord, and more
- **Activity analysis** - Identifies patterns like streaks, peak hours, and focus areas
- **Customizable** - Control visibility of stats, projects, borders, and more
- **Serverless** - Deploy to Vercel in minutes

## Quick Start

### Use in Your README

Add this to your GitHub profile README:

```markdown
![GitHub Activity](https://your-deployment.vercel.app/?username=YOUR_USERNAME)
```

### Available Card Types

#### Activity Card (Default)

Shows a comprehensive view of your GitHub activity with a human-readable summary.

```markdown
![Activity](https://your-deployment.vercel.app/?username=YOUR_USERNAME&type=activity)
```

#### Compact Card

A minimal card showing key stats.

```markdown
![Stats](https://your-deployment.vercel.app/?username=YOUR_USERNAME&type=compact)
```

#### Languages Card

Shows your most used programming languages.

```markdown
![Languages](https://your-deployment.vercel.app/?username=YOUR_USERNAME&type=languages)
```

## Configuration Options

| Parameter | Description | Default | Example |
|-----------|-------------|---------|---------|
| `username` | GitHub username (required) | - | `?username=octocat` |
| `theme` | Card theme | `default` | `?theme=dark` |
| `type` | Card type: `activity`, `compact`, `languages` | `activity` | `?type=compact` |
| `border` | Show border | `true` | `?border=false` |
| `border_radius` | Border radius in pixels | `4.5` | `?border_radius=10` |
| `hide_stats` | Hide stats section | `false` | `?hide_stats=true` |
| `hide_projects` | Hide recent projects | `false` | `?hide_projects=true` |
| `cache_seconds` | Cache duration (max 86400) | `14400` | `?cache_seconds=7200` |

## Available Themes

- `default` - Clean blue theme
- `dark` - Dark mode with green accents
- `radical` - Vibrant pink and cyan
- `merko` - Dark green theme
- `gruvbox` - Warm retro colors
- `tokyonight` - Blue and purple night theme
- `onedark` - Atom One Dark inspired
- `cobalt` - Deep blue with pink
- `synthwave` - 80s retro style
- `highcontrast` - Maximum contrast
- `dracula` - Popular dark theme
- `monokai` - Editor classic
- `vue` - Vue.js colors
- `vue-dark` - Vue.js dark variant
- `github` - GitHub light
- `github-dark` - GitHub dark
- `nord` - Arctic blue palette
- `algolia` - Algolia brand colors
- `sunset` - Warm sunset colors
- `ocean` - Deep ocean blue

### Theme Examples

```markdown
<!-- Dark theme -->
![Activity](https://your-deployment.vercel.app/?username=YOUR_USERNAME&theme=dark)

<!-- Dracula theme -->
![Activity](https://your-deployment.vercel.app/?username=YOUR_USERNAME&theme=dracula)

<!-- Tokyo Night theme -->
![Activity](https://your-deployment.vercel.app/?username=YOUR_USERNAME&theme=tokyonight)
```

## Self-Hosting

### Deploy to Vercel

1. Fork this repository
2. Import to [Vercel](https://vercel.com/new)
3. (Optional) Add `GITHUB_TOKEN` environment variable for higher API rate limits
4. Deploy!

### Local Development

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/github-activity-based-readme-gen.git
cd github-activity-based-readme-gen

# Install dependencies
npm install

# (Optional) Create .env file with GitHub token
echo "GITHUB_TOKEN=your_token_here" > .env

# Start development server
npm run dev

# Open http://localhost:3000/?username=YOUR_USERNAME
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_TOKEN` | GitHub Personal Access Token for higher rate limits | No |

## How It Works

1. **Data Collection** - Fetches your public GitHub activity using the GitHub API
2. **Pattern Analysis** - Analyzes events to find interesting patterns:
   - Activity streaks
   - Peak working hours
   - Most active repositories
   - Language distribution
   - Contribution statistics
3. **Summary Generation** - Creates a human-readable narrative about your activity
4. **Card Rendering** - Generates beautiful SVG cards with your data

## API Reference

### GET /

Returns an SVG card based on the provided parameters.

**Request:**
```
GET /?username=octocat&theme=dark&type=activity
```

**Response:**
- Content-Type: `image/svg+xml`
- Cache: 4 hours by default

**Error Response:**
```json
{
  "error": "User \"unknown\" not found"
}
```

## Project Structure

```
├── api/
│   └── index.js          # Vercel serverless function
├── src/
│   ├── index.js          # Local dev server
│   ├── github-api.js     # GitHub API integration
│   ├── activity-summarizer.js  # Activity analysis
│   └── card-generator.js # SVG card generation
├── themes/
│   └── index.js          # Theme definitions
├── tests/
│   └── ...               # Test files
├── examples/
│   └── ...               # Example usage
├── package.json
├── vercel.json           # Vercel configuration
└── README.md
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [github-readme-stats](https://github.com/anuraghazra/github-readme-stats)
- Built for the GitHub community
