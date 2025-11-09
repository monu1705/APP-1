# GitHub Pages Deployment Guide

## Automatic Deployment (Recommended)

This repository is configured with GitHub Actions to automatically deploy to GitHub Pages when you push to the `main` branch.

### Quick Setup (3 Steps):

1. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click on **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions** (NOT "Deploy from a branch")
   - Save the settings

2. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Setup GitHub Pages deployment"
   git push origin main
   ```

3. **Wait for deployment:**
   - Go to the **Actions** tab in your repository
   - Wait for the workflow to complete (usually 2-3 minutes)
   - Your app will be available at: `https://yourusername.github.io/M-track/`
   - (Replace `M-track` with your actual repository name)

### That's it! 
Every time you push to `main`, your app will be automatically deployed.

## Manual Deployment

If you prefer to deploy manually:

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Set the base path** (replace `M-track` with your repository name):
   ```bash
   npm run build -- --base=/M-track/
   ```

3. **Deploy the `dist` folder:**
   - Go to repository Settings → Pages
   - Select **Deploy from a branch**
   - Choose the `main` branch and `/dist` folder
   - Save

## Important Notes:

- **Repository Name**: If your repository name is different from `M-track`, update the base path in:
  - `.github/workflows/deploy.yml` (line with `VITE_BASE_PATH`)
  - Or set it as an environment variable in GitHub Secrets

- **Custom Domain**: If you're using a custom domain, set `VITE_BASE_PATH=/` in your build configuration.

- **404 Handling**: The `404.html` file is included to handle client-side routing on GitHub Pages.

## Troubleshooting:

1. **Assets not loading:**
   - Make sure the base path is correct
   - Check browser console for 404 errors
   - Verify the build output includes correct paths

2. **Blank page:**
   - Check browser console for JavaScript errors
   - Verify all dependencies are installed
   - Make sure the build completed successfully

3. **Routing not working:**
   - Ensure `404.html` is in the root of your `dist` folder
   - Check that GitHub Pages is serving from the correct branch/folder

## Repository Structure:

```
M-track/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
├── dist/                       # Built files (generated)
├── 404.html                    # SPA fallback for GitHub Pages
├── index.html
├── vite.config.ts             # Vite configuration with base path
└── package.json
```

