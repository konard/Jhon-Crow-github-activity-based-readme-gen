# Deployment Guide

This repository is configured for automatic deployment to both Vercel and GitHub Pages using GitHub Actions.

## GitHub Pages Deployment

GitHub Pages deployment is fully automated and requires minimal setup.

### Setup Steps

1. Go to your repository settings
2. Navigate to **Pages** section
3. Under **Build and deployment**:
   - Source: Select **GitHub Actions**
4. The workflow will automatically deploy the documentation when you push to the `main` branch

### What Gets Deployed

The GitHub Pages deployment creates a documentation site with:
- Project README rendered as the main page
- Example files (if available)
- Dark-themed, mobile-responsive layout

### Accessing Your Site

After deployment, your site will be available at:
```
https://<username>.github.io/<repository-name>/
```

## Vercel Deployment

Vercel deployment requires some initial setup to configure the secrets.

### Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Your repository imported to Vercel

### Setup Steps

#### 1. Import Project to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure the project settings (Vercel should auto-detect the configuration)
4. Deploy the project

#### 2. Get Vercel Credentials

After your project is created, you need three pieces of information:

**Vercel Token:**
1. Go to https://vercel.com/account/tokens
2. Create a new token
3. Copy the token value

**Vercel Org ID:**
1. Go to your Vercel project settings
2. Copy the **Org ID** from the project settings

**Vercel Project ID:**
1. In your Vercel project settings
2. Copy the **Project ID**

#### 3. Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add the following:

| Secret Name | Description |
|-------------|-------------|
| `VERCEL_TOKEN` | Your Vercel authentication token |
| `VERCEL_ORG_ID` | Your Vercel organization ID |
| `VERCEL_PROJECT_ID` | Your Vercel project ID |

#### 4. Optional: Add GitHub Token to Vercel

To increase GitHub API rate limits for your Vercel deployment:

1. Create a GitHub Personal Access Token:
   - Go to https://github.com/settings/tokens
   - Generate a new token (classic)
   - Select `public_repo` scope
   - Copy the token

2. Add to Vercel:
   - Go to your Vercel project settings
   - Navigate to **Environment Variables**
   - Add variable:
     - Name: `GITHUB_TOKEN`
     - Value: Your GitHub token
     - Environments: Production, Preview, Development

### How It Works

**Automatic Deployments:**

- **Push to `main` branch**: Triggers production deployment to Vercel
- **Pull Requests**: Triggers preview deployment to Vercel (with unique URL for testing)

**CI/CD Pipeline:**

Each deployment runs:
1. Checkout code
2. Setup Node.js environment
3. Install dependencies
4. Run tests
5. Run linter
6. Deploy to Vercel

**Deployment Types:**

- **Production**: `main` branch → Production URL (your-project.vercel.app)
- **Preview**: Pull requests → Preview URL (your-project-git-branch.vercel.app)

## Monitoring Deployments

### GitHub Pages

1. Go to **Actions** tab in your repository
2. Look for "Deploy to GitHub Pages" workflow
3. Click on any workflow run to see deployment details

### Vercel

1. Go to **Actions** tab in your repository
2. Look for "Deploy to Vercel" workflow
3. Click on any workflow run to see deployment details

You can also monitor deployments in your Vercel dashboard:
- Go to https://vercel.com/dashboard
- Select your project
- View deployment history and logs

## Troubleshooting

### GitHub Pages Not Deploying

1. Check that GitHub Pages is enabled in repository settings
2. Verify the workflow has `pages: write` permission
3. Check the Actions tab for error messages

### Vercel Deployment Failing

**"Invalid token" error:**
- Verify `VERCEL_TOKEN` secret is set correctly
- Generate a new token if needed

**"Project not found" error:**
- Double-check `VERCEL_PROJECT_ID` and `VERCEL_ORG_ID` secrets
- Ensure the project exists in your Vercel account

**Tests or linter failing:**
- Fix the failing tests or linting errors
- The deployment will not proceed if these checks fail

## Manual Deployment

### GitHub Pages

You can manually trigger GitHub Pages deployment:
1. Go to **Actions** tab
2. Select "Deploy to GitHub Pages" workflow
3. Click **Run workflow** button

### Vercel

Manual deployment can be done through:

**Option 1: Vercel CLI**
```bash
npm install -g vercel
vercel --prod
```

**Option 2: Vercel Dashboard**
1. Go to your project in Vercel
2. Click **Deployments**
3. Click **Redeploy** on any previous deployment

## Security Notes

- Never commit secrets to the repository
- Rotate tokens periodically
- Use environment-specific tokens when possible
- Review deployment logs for sensitive information before making them public
