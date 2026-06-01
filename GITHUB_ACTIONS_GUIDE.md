# GitHub Actions CI/CD Guide

## Overview

GitHub Actions is the built-in continuous integration and continuous deployment (CI/CD) service for GitHub repositories. It automatically runs workflows in response to events like pushes and pull requests.

---

## Workflows Overview

### 1. **CI Workflow** (`ci.yml`)
- **Runs on:** Pull requests to `develop`, pushes to `develop`/`main`
- **Purpose:** Test code quality, security, and functionality
- **Duration:** ~5-10 minutes

### 2. **Release Workflow** (`release.yml`)
- **Runs on:** Manual trigger, pushes to `main`
- **Purpose:** Manage versioning and create releases
- **Duration:** ~2-3 minutes

### 3. **Deploy Workflow** (`deploy.yml`)
- **Runs on:** Release publication, pushes to `main`
- **Purpose:** Build and prepare artifacts for deployment
- **Duration:** ~5-7 minutes

---

## Detailed Workflow Breakdown

### CI Workflow (`ci.yml`)

#### Trigger Events
```yaml
on:
  pull_request:
    branches: [develop]      # Runs on PRs to develop
  push:
    branches: [develop, main] # Runs on pushes to develop/main
```

**When it runs:**
1. When you create a PR to `develop`
2. When you push commits to an open PR
3. When you push directly to `develop`
4. When you push directly to `main`

#### Job: test-backend

**Purpose:** Verify backend code quality and functionality

```yaml
Steps:
1. actions/checkout@v4
   └─ Clones your repository

2. actions/setup-node@v4
   └─ Installs Node.js 18
   └─ Caches npm packages

3. npm ci (backend)
   └─ Installs exact dependencies
   └─ Uses package-lock.json for consistency

4. npm run lint
   └─ Checks code style with ESLint
   └─ Continues if there are warnings

5. npm test
   └─ Runs unit/integration tests
   └─ Continues even if tests fail
```

**Output Examples:**

Success:
```
✓ All dependencies installed
✓ No linting errors found
✓ 45 tests passed
```

With issues (still passes):
```
⚠ 2 linting warnings (style issues)
✗ 2 tests failed (continued anyway)
⚠ Low test coverage (68%)
```

#### Job: test-frontend

**Purpose:** Verify React app builds and tests pass

```yaml
Steps:
1. Checkout & Setup Node.js (same as backend)

2. npm ci (frontend)
   └─ Installs React dependencies

3. npm run lint
   └─ ESLint checks

4. npm run build
   └─ Creates production build
   └─ Tests if bundle can be created
   └─ Catches compile errors

5. npm test -- --coverage
   └─ Runs Jest tests
   └─ Generates coverage report
   └─ Continues even if tests fail
```

**Build Process:**
- Compiles React/JSX to JavaScript
- Minifies and optimizes code
- Creates `frontend/build` directory
- Verifies bundle is under size limits

#### Job: security-scan

**Purpose:** Check for vulnerable dependencies

```yaml
Steps:
1. npm audit
   └─ Scans all npm packages
   └─ Checks against vulnerability database
   └─ Continues even if issues found
```

**Output Examples:**

```
✓ No vulnerabilities found

Or:

⚠ 3 vulnerabilities found:
  - lodash@4.17.15 (High)
  - axios@0.18.0 (Medium)
  - express@4.16.0 (Low)
```

**What this means:**
- **Critical:** Production issues, merge blocked
- **High:** Significant security risk
- **Medium:** Should be fixed soon
- **Low:** Minor issues, informational

#### Job: code-quality

**Purpose:** Verify project structure and consistency

```yaml
Checks:
1. Node.js version consistency
2. Project directories exist
3. package.json files present
4. File structure valid
```

---

### Release Workflow (`release.yml`)

#### Trigger Events
```yaml
on:
  push:
    branches: [main]
    paths-ignore:
      - '**.md'           # Skip if only docs changed
      - 'docs/**'

  workflow_dispatch:      # Manual trigger
    inputs:
      version_bump:
        type: choice
        options:
          - patch         # 1.0.0 → 1.0.1
          - minor         # 1.0.0 → 1.1.0
          - major         # 1.0.0 → 2.0.0
```

**When to trigger manually:**

1. **Patch** - Bug fixes
   ```
   v1.0.0 → v1.0.1
   - Fixed JWT validation
   - Fixed expense calculation error
   ```

2. **Minor** - New features (backwards compatible)
   ```
   v1.0.0 → v1.1.0
   - Added expense filtering
   - Added user preferences
   ```

3. **Major** - Breaking changes
   ```
   v1.0.0 → v2.0.0
   - Redesigned API endpoints
   - Changed database schema
   ```

#### Version Calculation

```javascript
// Current version: 1.2.3

// PATCH bump (1.2.3 → 1.2.4)
1.2.3
1.2.[3+1] = 1.2.4

// MINOR bump (1.2.3 → 1.3.0)
1.2.3
1.[2+1].0 = 1.3.0

// MAJOR bump (1.2.3 → 2.0.0)
1.2.3
[1+1].0.0 = 2.0.0
```

#### Workflow Steps

1. **Get current version**
   ```
   Reads: backend/package.json
   Extracts: "version": "1.0.0"
   ```

2. **Calculate new version**
   ```
   Based on selected bump type
   Validates version number
   Stores for next steps
   ```

3. **Update package versions**
   ```bash
   npm version minor --no-git-tag-version
   
   Updates both:
   - backend/package.json
   - frontend/package.json
   ```

4. **Update CHANGELOG.md**
   ```markdown
   ## [1.1.0] - 2026-06-01
   
   ### Added
   - 
   
   ### Changed
   - 
   
   ### Fixed
   - 
   ```

5. **Create git tag**
   ```bash
   git tag -a "v1.1.0" -m "Release version 1.1.0"
   ```

6. **Commit and push**
   ```bash
   git commit -m "chore: bump version to 1.1.0 [skip ci]"
   git push origin HEAD:main
   git push origin --tags
   ```

7. **Create GitHub Release**
   ```
   Goes to: Releases tab
   Auto-generates release notes
   Creates downloadable artifacts
   ```

---

### Deploy Workflow (`deploy.yml`)

#### Trigger Events
```yaml
on:
  release:
    types: [published]  # When release is published

  push:
    branches: [main]
    paths:
      - 'backend/**'
      - 'frontend/**'
```

**What is an artifact?**

Artifacts are packaged versions of your code ready for deployment:
- **Backend artifact** - Server code with dependencies
- **Frontend artifact** - Optimized React build for serving

#### Build Backend

```yaml
Steps:
1. Checkout code
2. Setup Node.js 18
3. Install dependencies
4. Check syntax (node -c server.js)
   └─ Validates JavaScript syntax
5. Create dist folder with all files
6. Upload artifact for 7 days
```

**What gets uploaded:**
```
backend/dist/
├── server.js
├── package.json
├── package-lock.json
├── node_modules/
└── routes/, models/, etc.
```

#### Build Frontend

```yaml
Steps:
1. Checkout code
2. Setup Node.js 18
3. Install dependencies
4. Run production build
   └─ npm run build
   └─ Creates optimized bundle
   └─ Minifies CSS/JS
   └─ Optimizes images
5. Upload artifact for 7 days
```

**What gets uploaded:**
```
frontend/build/
├── index.html
├── static/
│   ├── css/
│   ├── js/
│   └── media/
└── favicon.ico
```

**Build optimization:**
- Removes dev dependencies
- Minifies JavaScript
- Optimizes CSS
- Compresses assets
- Generates source maps

#### Verify Deployment

```yaml
Steps:
1. Download both artifacts
2. Verify files exist
3. Generate deployment summary
4. Add to GitHub Actions summary
```

**GitHub Actions Summary shows:**
```
## Deployment Summary

**Status:** ✓ Ready for deployment
**Build Time:** 2026-06-01T10:30:00Z
**Artifacts:** Backend & Frontend
```

---

## How to Use GitHub Actions

### View Workflow Status

1. **Go to your repository**
2. **Click "Actions" tab**
3. **Select a workflow run**
4. **View details and logs**

### Monitor a PR

1. **Create a pull request**
2. **Scroll to "Checks" section**
3. **See which checks pass/fail:**
   ```
   ✓ CI/CD Pipeline / test-backend
   ✓ CI/CD Pipeline / test-frontend
   ✓ CI/CD Pipeline / security-scan
   ✓ CI/CD Pipeline / code-quality
   ```

### Manual Release Trigger

1. **Go to Actions tab**
2. **Select "Release & Versioning"**
3. **Click "Run workflow"**
4. **Select version bump type:**
   - Patch (bug fixes)
   - Minor (new features)
   - Major (breaking changes)
5. **Click "Run workflow"**
6. **Monitor the workflow run**
7. **Check Releases tab for new release**

### Check Deployment Status

1. **Go to Actions tab**
2. **Select "Deploy" workflow**
3. **View latest run**
4. **Verify artifacts were created**
5. **Check "Run summary" for deployment info**

---

## Interpreting Workflow Results

### ✅ Success - All checks passed
```
✓ Checkout code
✓ Install dependencies
✓ Lint code
✓ Run tests
✓ Security scan
```
**Action:** Ready to merge or deploy

### ⚠️ Warning - Checks passed but with warnings
```
✓ Checkout code
✓ Install dependencies
⚠ Lint code (3 warnings found)
✓ Run tests
⚠ Security scan (low severity issues)
```
**Action:** Can merge, but address warnings

### ❌ Failure - Checks failed
```
✓ Checkout code
✓ Install dependencies
✗ Lint code (5 errors)
✗ Run tests (3 tests failed)
```
**Action:** Fix errors before merging

### 🚫 Blocked - PR cannot be merged
```
✓ CI/CD Pipeline
✗ Status checks required to pass
```
**Action:** Fix failing checks, then request re-review

---

## Common Workflow Issues & Solutions

### Issue: Npm install times out
```
Error: npm WARN deprecated...
Error: Command timed out
```
**Solution:**
- Dependencies are too large
- Check for circular dependencies
- Increase timeout in workflow
- Use npm ci instead of npm install

### Issue: Tests fail locally but pass in CI
```
Error: Test fails in CI but not locally
```
**Solution:**
- Install exact dependencies: npm ci
- Check Node.js version matches
- Verify environment variables set
- Check file permissions

### Issue: Security scan shows vulnerabilities
```
Error: npm WARN security
```
**Solution:**
```bash
# Check locally
npm audit

# Fix automatically
npm audit fix

# If not fixable, document why
npm audit --json > audit-report.json
```

### Issue: Build size exceeded
```
Error: Bundle size exceeded limit
```
**Solution:**
- Remove unused dependencies
- Code splitting in React
- Lazy load components
- Minify assets

---

## Environment Variables & Secrets

### Using GitHub Secrets in Workflows

Create secrets in GitHub Settings → Secrets and variables:

```yaml
env:
  PUBLIC_VAR: value

jobs:
  deploy:
    steps:
      - name: Use secret
        env:
          PRIVATE_KEY: ${{ secrets.DEPLOYMENT_KEY }}
        run: echo "Secret is set"
```

**Common secrets to configure:**

```
MONGODB_URI          # Database connection
JWT_SECRET           # JWT signing key
API_KEY              # Third-party API keys
DEPLOYMENT_KEY       # Server SSH key
```

### Using in your app

```javascript
// Backend (.env)
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your-secret-key

// Frontend (.env)
REACT_APP_API_URL=https://api.example.com
```

---

## Performance & Cost

### Execution Time
- **CI Workflow:** ~5-10 minutes
- **Release Workflow:** ~2-3 minutes
- **Deploy Workflow:** ~5-7 minutes

### Free Tier Limits
- 2,000 minutes/month
- 500 MB storage
- Sufficient for most projects

### Optimization Tips
```yaml
# Run jobs in parallel (faster)
test-backend:
  runs-on: ubuntu-latest
test-frontend:
  runs-on: ubuntu-latest  # These run simultaneously

# Cache dependencies (faster)
- uses: actions/setup-node@v4
  with:
    cache: 'npm'

# Skip unnecessary steps
paths-ignore:
  - '**.md'
  - 'docs/**'
```

---

## Extending Workflows

### Add Slack Notifications

```yaml
- name: Notify Slack
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
```

### Add Docker Build

```yaml
- name: Build Docker image
  run: docker build -t myapp:latest .

- name: Push to registry
  run: docker push myapp:latest
```

### Add Database Migration

```yaml
- name: Run migrations
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
  run: npm run migrate
```

### Add Performance Testing

```yaml
- name: Run performance tests
  run: npm run test:performance

- name: Compare results
  run: npm run test:performance:compare
```

---

## Troubleshooting Checklist

- [ ] Workflow file syntax is valid YAML
- [ ] Trigger events are correct
- [ ] Secrets are configured in GitHub
- [ ] Dependencies match package.json
- [ ] Node.js version is specified
- [ ] Working directory is correct
- [ ] Commands work locally
- [ ] Permissions are correct
- [ ] Cache is not stale

---

## Quick Reference

### Common Workflow Commands
```yaml
# Run command
run: npm test

# Continue on error
continue-on-error: true

# Conditional step
if: failure()
if: success()
if: always()

# Set environment variable
env:
  DEBUG: true

# Use secret
${{ secrets.MY_SECRET }}

# Use output from previous step
${{ steps.step_id.outputs.output_name }}
```

### Useful Actions
```yaml
actions/checkout        # Clone repo
actions/setup-node      # Setup Node.js
actions/upload-artifact # Upload files
actions/download-artifact # Download files
actions/github-script   # Run JavaScript
slackapi/slack-github-action # Slack notify
```

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [YAML Syntax Reference](https://learnxinyminutes.com/docs/yaml/)
- [GitHub Actions Best Practices](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

---

**Last Updated**: 2026-06-01  
**Status**: Active
