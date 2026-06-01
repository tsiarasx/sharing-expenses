# DevOps Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Git Flow Strategy](#git-flow-strategy)
3. [CI/CD Pipeline](#cicd-pipeline)
4. [Version Management](#version-management)
5. [Deployment Strategy](#deployment-strategy)
6. [Monitoring & Best Practices](#monitoring--best-practices)
7. [Implementation Details](#implementation-details)

---

## Overview

This document outlines the complete DevOps infrastructure implemented for the **Expense-Sharing App** (MERN Stack). The implementation includes:

- **Git Flow** branching strategy for organized development
- **GitHub Actions** automated CI/CD pipeline
- **Semantic Versioning** for release management
- **Automated testing** and code quality checks
- **Build and deployment** workflows

### Tech Stack Used
- **Version Control:** Git & GitHub
- **CI/CD:** GitHub Actions
- **Languages:** Node.js 18, React, Express
- **Package Manager:** npm
- **Containerization Ready:** Docker-compatible setup

---

## Git Flow Strategy

### Overview
Git Flow is a branching model that provides a robust framework for managing releases and features in a team environment. It uses multiple long-running and short-lived branches with specific purposes.

### Branch Structure

```
main (production)
  ├── release branches (release/*)
  ├── hotfix branches (hotfix/*)
  └── tags (v1.0.0, v1.1.0, etc.)

develop (staging/integration)
  ├── feature branches (feature/*)
  └── bugfix branches (bugfix/*)
```

### Branch Descriptions

#### 1. **main** (Production Branch)
- **Purpose:** Contains production-ready code only
- **Protection Rules:**
  - Require pull request reviews before merging
  - Dismiss stale PR approvals
  - Require branches to be up to date
  - Require status checks to pass (CI/CD)
- **Merging:** Only through release or hotfix branches
- **Deployment:** Auto-deploys to production on merge
- **Tags:** Each commit should be tagged with version number (v1.0.0)

#### 2. **develop** (Integration Branch)
- **Purpose:** Integration branch for features; staging environment
- **Protection Rules:**
  - Require pull request reviews
  - Require CI/CD checks to pass
  - At least 1 approval required
- **Merging:** Features are merged here first
- **Deployment:** Deploys to staging environment

#### 3. **feature/** (Feature Branches)
- **Naming:** `feature/user-authentication`, `feature/expense-split-calculator`, etc.
- **Created from:** `develop`
- **Merged back to:** `develop` (via pull request)
- **Lifetime:** Short-lived (days to weeks)
- **Naming Convention:** `feature/<feature-name>` (kebab-case)

Example:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/expense-filtering
# Make changes...
git add .
git commit -m "feat: add expense filtering by date range"
git push origin feature/expense-filtering
# Create PR to develop on GitHub
```

#### 4. **release/** (Release Branches)
- **Naming:** `release/1.1.0`
- **Created from:** `develop` when preparing a production release
- **Purpose:** Final testing, bug fixes, version bump
- **Merged to:** Both `main` and back to `develop`
- **Lifetime:** Days to weeks (before release)

Creation process:
```bash
git checkout develop
git pull origin develop
git checkout -b release/1.1.0
# Update CHANGELOG.md, bump versions
npm version minor --workspaces
git add .
git commit -m "chore: release 1.1.0"
git push origin release/1.1.0
# Create PR to main
```

#### 5. **hotfix/** (Emergency Fixes)
- **Naming:** `hotfix/critical-bug-fix`
- **Created from:** `main`
- **Purpose:** Emergency fixes for production issues
- **Merged to:** Both `main` and `develop`
- **Lifetime:** Very short (hours to days)

Example:
```bash
git checkout main
git pull origin main
git checkout -b hotfix/security-patch
git add .
git commit -m "fix: security vulnerability in JWT"
git push origin hotfix/security-patch
# Create PRs to both main and develop
```

### Git Flow Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         MAIN (Production)                        │
│                    Tags: v1.0.0, v1.1.0, v1.2.0               │
└──────────────┬────────────────────────────┬──────────────────────┘
               │ (merge release)            │ (merge hotfix)
               │                            │
       ┌───────▼─────────┐        ┌────────▼────────┐
       │ release/1.1.0   │        │ hotfix/bug-fix  │
       │                 │        │                 │
       └────────┬────────┘        └────────┬────────┘
                │ (merge back)             │ (merge back)
                │                          │
┌───────────────▼────────────────────────────▼──────────────────────┐
│                      DEVELOP (Integration)                         │
│                    Latest pre-release code                         │
└──────────┬───────────────────────────────────────────────────────┘
           │
           ├─► feature/user-auth ─────┐
           │                          │
           ├─► feature/expense-split  │
           │                          │
           └─► feature/ui-redesign ───┤ (merge via PR)
                                      │
           ┌──────────────────────────┘
           │
           ▼ (main development happens here)
```

---

## CI/CD Pipeline

### Overview
The CI/CD pipeline is implemented using **GitHub Actions** with three main workflows:
1. **CI Workflow** - Runs on PRs and pushes to develop/main
2. **Release Workflow** - Manages versioning and releases
3. **Deploy Workflow** - Builds and prepares artifacts for deployment

### 1. CI Workflow (`ci.yml`)

**Triggers:**
- Pull requests to `develop` branch
- Pushes to `develop` and `main` branches

**Jobs:**

#### a) Test Backend
```yaml
Steps:
1. Checkout code
2. Setup Node.js 18
3. Install dependencies (npm ci)
4. Lint code (eslint)
5. Run tests (jest)
```

**What it does:**
- Validates Node.js project structure
- Installs exact dependencies from package-lock.json
- Runs linting to catch code style issues
- Executes unit and integration tests
- Ensures backend code quality before merge

#### b) Test Frontend
```yaml
Steps:
1. Checkout code
2. Setup Node.js 18
3. Install dependencies (npm ci)
4. Lint code (eslint)
5. Build React app (production build)
6. Run tests with coverage
```

**What it does:**
- Validates React project setup
- Builds the production bundle to catch build errors
- Runs test suite with coverage reporting
- Ensures no dead code or unused imports

#### c) Security Scan
```yaml
- npm audit (checks for vulnerable dependencies)
```

**What it does:**
- Scans all npm packages for known vulnerabilities
- Prevents merging if critical issues found
- Automated dependency security checks

#### d) Code Quality
```yaml
- Verify Node.js versions match
- Check project file structure
- Validate package.json files exist
```

**What it does:**
- Ensures consistency across environments
- Validates project structure integrity
- Confirms all required files present

### 2. Release Workflow (`release.yml`)

**Triggers:**
- Manual dispatch via GitHub Actions UI
- Automatic on push to `main`

**Features:**

#### Version Calculation
- Reads current version from `backend/package.json`
- Calculates new version based on bump type:
  - **patch:** 1.0.0 → 1.0.1 (bug fixes)
  - **minor:** 1.0.0 → 1.1.0 (new features)
  - **major:** 1.0.0 → 2.0.0 (breaking changes)

#### Automatic Updates
1. Updates `package.json` in both backend and frontend
2. Updates `CHANGELOG.md` with new version entry
3. Creates git tag (e.g., `v1.1.0`)
4. Commits and pushes changes
5. Creates GitHub Release with auto-generated notes

#### Semantic Versioning Format
```
v[MAJOR].[MINOR].[PATCH]

Examples:
v1.0.0   - Initial release
v1.1.0   - New feature added
v1.1.1   - Bug fix
v2.0.0   - Breaking changes
```

### 3. Deploy Workflow (`deploy.yml`)

**Triggers:**
- On release publication
- On push to `main` (code changes)

**Jobs:**

#### a) Build Backend
```yaml
Steps:
1. Install dependencies
2. Check syntax (node -c)
3. Create build artifact
4. Upload artifact for 7 days
```

#### b) Build Frontend
```yaml
Steps:
1. Install dependencies
2. Run production build
3. Minify and optimize assets
4. Upload artifact for 7 days
```

#### c) Verify Deployment
- Downloads and validates artifacts
- Generates deployment summary
- Confirms readiness for production

### Workflow Execution Timeline

```
Feature Development
       │
       ▼
Create PR to develop
       │
       ├─► CI Workflow Runs
       │   ├─ Tests backend ✓
       │   ├─ Tests frontend ✓
       │   ├─ Security scan ✓
       │   └─ Code quality ✓
       │
       ▼
Merge to develop (staging deployed)
       │
       ├─► Tests run again
       │
       ▼
Release Preparation
       │
       ├─► Create release/* branch
       │
       ▼
Create PR to main
       │
       ├─► CI Workflow Runs again
       │
       ▼
Merge to main (production)
       │
       ├─► Release Workflow Runs
       │   ├─ Bump version
       │   ├─ Update CHANGELOG
       │   ├─ Create tag
       │   └─ Create GitHub Release
       │
       ├─► Deploy Workflow Runs
       │   ├─ Build backend
       │   ├─ Build frontend
       │   └─ Generate artifacts
       │
       ▼
Production Deployed ✓
```

---

## Version Management

### Semantic Versioning (SemVer)

Following the standard: **MAJOR.MINOR.PATCH**

```
MAJOR version when you make incompatible API changes
MINOR version when you add functionality in a backwards-compatible manner
PATCH version when you make backwards-compatible bug fixes
```

### Examples

| Scenario | Old Version | New Version | Type |
|----------|-------------|-------------|------|
| Bug fix in payment calculation | 1.0.0 | 1.0.1 | PATCH |
| Add new expense filter feature | 1.0.1 | 1.1.0 | MINOR |
| Redesign API endpoints | 1.1.0 | 2.0.0 | MAJOR |
| Add group invite feature | 1.1.0 | 1.2.0 | MINOR |

### Version Sources of Truth

1. **`backend/package.json`** - Backend version
2. **`frontend/package.json`** - Frontend version
3. **`CHANGELOG.md`** - Release history and dates
4. **Git tags** - Historical version markers (v1.0.0, v1.1.0, etc.)

### Release Checklist

Before creating a release:
- [ ] All features tested in develop
- [ ] CHANGELOG.md updated
- [ ] No failing tests
- [ ] Security scan passed
- [ ] Code review completed
- [ ] Version bump appropriate
- [ ] Documentation updated

### Manual Version Update (if needed)

```bash
# Backend
cd backend
npm version minor

# Frontend  
cd frontend
npm version minor

# Update CHANGELOG.md manually
# Commit
git add .
git commit -m "chore: bump to version X.X.X"

# Tag
git tag -a vX.X.X -m "Release version X.X.X"

# Push
git push origin main --tags
```

---

## Deployment Strategy

### Multi-Environment Setup

```
┌─────────────────────────────────────────────────────────────┐
│                    Local Development                         │
│              (Developer's machine / localhost)               │
│              npm run dev (backend & frontend)                │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ git push
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Development/Staging                         │
│                    (develop branch)                          │
│           Auto-deploys via GitHub Actions                   │
│         Used for feature testing and validation             │
└─────────────────────────────────────────────────────────────┘
                           │
                    (manual promotion)
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 Pre-Production (Release)                     │
│              (release/* and main branches)                   │
│          Final testing, version bumping, tagging            │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ merge to main
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Production                               │
│                   (main branch)                             │
│              Auto-deploys via GitHub Actions                │
│            Latest stable version available                  │
└─────────────────────────────────────────────────────────────┘
```

### Deployment Instructions

#### Development (Local)
```bash
# Clone repository
git clone <repository-url>
cd sharing-expenses

# Backend setup
cd backend
npm install
# Create .env file with MONGO_URI, PORT, JWT_SECRET
npm run dev

# Frontend setup (in new terminal)
cd frontend
npm install
npm start
```

#### Staging Deployment (via develop branch)
```bash
git checkout develop
git pull origin develop
# Automated deployment via GitHub Actions

# Check deployment status
# Go to GitHub Actions tab → Select CI/CD Pipeline
```

#### Production Deployment (via main branch)
```bash
# Create release branch
git checkout develop
git pull origin develop
git checkout -b release/X.X.X

# Update versions
npm version minor --workspaces

# Update CHANGELOG.md
# Commit changes
git add .
git commit -m "chore: release version X.X.X"
git push origin release/X.X.X

# Create PR to main on GitHub
# After approval, merge to main
# Release workflow automatically runs
```

### Post-Deployment Verification

1. **Check GitHub Actions**
   - Navigate to Actions tab
   - Verify Deploy workflow completed successfully
   - Check artifact generation

2. **Verify Application**
   - Backend health check: `GET /health` (if implemented)
   - Frontend build verification
   - API connectivity test

3. **Monitor Deployment**
   - Check application logs
   - Verify database connections
   - Test user authentication flow

---

## Monitoring & Best Practices

### Best Practices

#### 1. Commit Message Format
Follow conventional commits:
```
feat: add expense filtering by date range
fix: correct JWT token validation logic
docs: update README with setup instructions
test: add unit tests for payment calculator
chore: update dependencies
refactor: simplify expense calculation logic
```

#### 2. Pull Request Process
1. **Create feature branch** from develop
2. **Push changes** regularly
3. **Open PR** with description of changes
4. **Wait for CI** to pass (automatic)
5. **Request review** from team members
6. **Address feedback** with new commits
7. **Merge** once approved

#### 3. Release Process
1. **Determine bump type** (major, minor, patch)
2. **Create release branch** from develop
3. **Update CHANGELOG.md** with changes
4. **Update version numbers** in package.json files
5. **Create PR to main**
6. **Merge after approval** (triggers release workflow)
7. **Tag** is created automatically
8. **GitHub Release** generated automatically

#### 4. Emergency Fixes (Hotfixes)
For critical production issues:
```bash
git checkout main
git pull origin main
git checkout -b hotfix/critical-issue

# Make fix
git commit -m "fix: critical security patch"
git push origin hotfix/critical-issue

# Create TWO PRs:
# 1. To main (for production)
# 2. To develop (to sync the fix)

# Merge to main first, then develop
```

#### 5. Code Review Checklist
- [ ] Code follows project style guide
- [ ] Tests are included for new features
- [ ] Documentation updated
- [ ] No console.logs or debug code
- [ ] Performance implications considered
- [ ] Security best practices followed
- [ ] Database migrations (if any) documented

### Monitoring Checklist

- [ ] CI/CD pipeline passes for all commits
- [ ] Test coverage maintained above 80%
- [ ] No security vulnerabilities (npm audit)
- [ ] Build times tracked and optimized
- [ ] Deployment success rate monitored
- [ ] Error logs monitored post-deployment
- [ ] Performance metrics tracked

### Troubleshooting Common Issues

#### CI Pipeline Failing
```bash
# Check locally first
npm run test        # Backend tests
npm run lint        # Code style

# If issue persists
git log --oneline -5  # Check recent commits
git diff origin/develop  # Check changes
```

#### Merge Conflicts
```bash
git fetch origin
git rebase origin/develop
# Resolve conflicts in editor
git add .
git rebase --continue
git push origin feature/branch-name -f
```

#### Release Failed
1. Check GitHub Actions logs for specific error
2. Verify version numbers are valid
3. Ensure CHANGELOG.md is properly formatted
4. Try manual version update if workflow fails repeatedly

---

## Implementation Details

### Files Created

```
.github/
├── workflows/
│   ├── ci.yml          # Continuous Integration
│   ├── release.yml     # Version Management
│   └── deploy.yml      # Build & Deploy

CHANGELOG.md            # Version History
DEVOPS.md              # This documentation
```

### Key Features Implemented

1. ✅ **Git Flow** - Complete branching strategy
2. ✅ **Automated Testing** - Backend and frontend tests
3. ✅ **Code Quality** - Linting and security scanning
4. ✅ **Semantic Versioning** - Automatic version bumping
5. ✅ **Release Management** - Automated releases with tags
6. ✅ **Build Pipeline** - Automated builds for both services
7. ✅ **Artifact Management** - 7-day retention for builds

### GitHub Actions Variables

Used in workflows:

```yaml
github.event.inputs.version_bump  # Manual version bump selection
github.token                       # Automatic GitHub token
github.ref                        # Branch reference
github.event_name                 # Trigger type (push, pull_request, etc.)
```

### Environment Variables for Deployment

Create these in GitHub Secrets for production deployment:

```
MONGO_URI              # MongoDB connection string
JWT_SECRET             # JWT signing secret
REACT_APP_API_URL      # Frontend API URL
DEPLOYMENT_KEY         # SSH key for server (optional)
```

### Status Checks Configuration

Enable in GitHub repository settings:

1. Go to **Settings** → **Branches**
2. Select **main** branch
3. Enable:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Dismiss stale PR approvals

---

## Conclusion

This DevOps setup provides:

- **Reliability**: Automated testing prevents bugs
- **Traceability**: Version control and changelog tracking
- **Scalability**: Modular workflow design
- **Best Practices**: Git Flow and semantic versioning
- **Automation**: Reduce manual steps, prevent human error

The implementation follows industry standards and can be extended with:
- Docker containerization
- Kubernetes deployment
- Monitoring and alerting
- Advanced security scanning
- Performance testing
- Load testing

---

## Quick Reference

### Commands Reference

```bash
# Feature development
git checkout develop
git pull origin develop
git checkout -b feature/my-feature
# ... make changes ...
git add .
git commit -m "feat: describe your change"
git push origin feature/my-feature

# Release preparation
git checkout develop
git pull origin develop
git checkout -b release/1.1.0
npm version minor --workspaces
# Update CHANGELOG.md
git add .
git commit -m "chore: release 1.1.0"
git push origin release/1.1.0

# Hotfix
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug
# ... fix the bug ...
git add .
git commit -m "fix: critical bug description"
git push origin hotfix/critical-bug

# View all releases and tags
git tag -l
git log --oneline --graph --all

# Clean up old local branches
git branch -d feature/completed-feature
```

### Useful Links

- [Git Flow Cheatsheet](https://danielkummer.github.io/git-flow-cheatsheet/)
- [Semantic Versioning](https://semver.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)

---

**Document Version**: 1.0  
**Last Updated**: 2026-06-01  
**Author**: Development Team  
**Status**: Active
