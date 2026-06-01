# Git Flow Setup Guide

## Initial Setup

### Step 1: Initialize Git Flow (Optional - for local convenience)

If using the `git-flow` extension:

```bash
# Install git-flow (optional, for easier commands)
# macOS
brew install git-flow

# Ubuntu/Debian
sudo apt-get install git-flow

# Windows (via Git Bash or WSL)
wget --no-check-certificate -q -O - https://github.com/nvie/gitflow/raw/develop/contrib/gitflow-installer.sh | bash
```

### Step 2: Configure Main Branches

The main branches are already created. Verify they exist:

```bash
git branch -a
# Should show:
# - main
# - develop
# - remotes/origin/main
# - remotes/origin/develop
```

### Step 3: Create Protection Rules on GitHub

1. **Go to Repository Settings** → **Branches**

2. **Protect `main` branch:**
   - Click "Add rule" under Branch protection rules
   - Branch name pattern: `main`
   - ✅ Require a pull request before merging
   - ✅ Require approvals (at least 1)
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require code review from code owners
   - ✅ Require conversation resolution before merging
   - ✅ Include administrators in restrictions
   - Save changes

3. **Protect `develop` branch:**
   - Branch name pattern: `develop`
   - ✅ Require a pull request before merging
   - ✅ Require approvals (at least 1)
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Dismiss stale approvals
   - Save changes

---

## Working with Git Flow

### Creating a Feature

```bash
# Method 1: Using git-flow (if installed)
git flow feature start expense-filtering
# Creates: feature/expense-filtering from develop
# Automatically switches to the new branch

# Method 2: Manual (works without git-flow)
git checkout develop
git pull origin develop
git checkout -b feature/expense-filtering
```

### Finishing a Feature

```bash
# Method 1: Using git-flow
git flow feature finish expense-filtering
# Merges feature/expense-filtering to develop
# Deletes the feature branch locally
# Switch to develop

git push origin develop
git push origin --delete feature/expense-filtering

# Method 2: Manual
# 1. Push your branch
git push origin feature/expense-filtering

# 2. Create Pull Request on GitHub
# - Base: develop
# - Compare: feature/expense-filtering
# - Wait for CI to pass
# - Get approval
# - Merge via GitHub UI

# 3. Delete branch (GitHub UI or CLI)
git fetch origin
git branch -d feature/expense-filtering
git push origin --delete feature/expense-filtering
```

### Creating a Release

```bash
# Method 1: Using git-flow
git flow release start 1.1.0
# Creates: release/1.1.0 from develop
# Edit package.json versions, update CHANGELOG
git flow release finish 1.1.0
# Merges to main AND develop
# Creates tag v1.1.0

git push origin main develop --tags

# Method 2: Manual
git checkout develop
git pull origin develop
git checkout -b release/1.1.0

# Update package.json and CHANGELOG.md
npm version minor --workspaces

git add .
git commit -m "chore: release 1.1.0"
git push origin release/1.1.0

# Create PR to main on GitHub
# After merge, the release workflow triggers automatically
```

### Creating a Hotfix

```bash
# Method 1: Using git-flow
git flow hotfix start critical-security-fix
# Creates: hotfix/critical-security-fix from main
# Make your fix
git flow hotfix finish critical-security-fix
# Merges to main AND develop
# Creates tag

git push origin main develop --tags

# Method 2: Manual
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# Make your fix
git add .
git commit -m "fix: critical security vulnerability in JWT validation"
git push origin hotfix/critical-security-fix

# Create TWO pull requests on GitHub:
# 1. To main (for immediate production fix)
# 2. To develop (to sync the fix back)

# Merge to main first (for production)
# Then merge to develop (to keep in sync)
```

---

## Feature Branch Naming Conventions

### Naming Pattern: `<type>/<description>`

**Types:**
- `feature/` - New feature
- `bugfix/` or `fix/` - Bug fix
- `refactor/` - Code refactoring
- `perf/` - Performance improvement
- `test/` - Test additions
- `docs/` - Documentation changes
- `chore/` - Maintenance tasks

### Examples

```
✓ feature/user-authentication
✓ feature/expense-split-calculator
✓ feature/group-invite-system
✓ bugfix/jwt-validation-error
✓ fix/duplicate-expense-display
✓ refactor/api-response-formatting
✓ perf/optimize-database-queries
✓ test/add-payment-tests
✓ docs/api-endpoint-documentation
✓ chore/update-dependencies

✗ my-feature
✗ new_feature_branch
✗ fix123
✗ temp_branch
```

---

## Commit Message Format

### Pattern: `<type>: <description>`

**Types:**
- `feat` - A new feature
- `fix` - A bug fix
- `docs` - Documentation only changes
- `style` - Changes that don't affect code meaning (formatting, etc.)
- `refactor` - Code change that neither fixes a bug nor adds a feature
- `perf` - Code change that improves performance
- `test` - Adding or updating tests
- `chore` - Changes to build process or dependencies

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Examples

```
feat(expense): add expense filtering by date range

Users can now filter expenses by selecting a start and end date.
The filter persists in the expense list view.

Closes #123

---

fix(auth): correct JWT token validation

Previous implementation was checking token expiration incorrectly.
Added unit tests to prevent regression.

Fixes #456

---

docs: update installation instructions

Added section for MongoDB Atlas setup with connection string examples.

---

refactor(api): simplify expense calculation logic

Extracted calculation logic into separate utility functions for reusability
and easier testing.

---

perf(frontend): optimize expense list rendering

Used React.memo for ExpenseItem component to prevent unnecessary re-renders.
Reduced load time from 800ms to 200ms.

---

test: add unit tests for payment calculator

Added comprehensive test suite covering:
- Equal split
- Percentage-based split
- Custom amount split

---

chore: upgrade Express from 4.17 to 4.22

Updated package.json to latest secure version.
No breaking changes in our usage.
```

---

## Synchronizing Branches

### Keep develop up to date with main

```bash
# When hotfixes are applied to main
git checkout develop
git pull origin develop
git merge origin/main
git push origin develop
```

### Keep feature branch up to date with develop

```bash
# Option 1: Merge (creates merge commit)
git checkout feature/my-feature
git fetch origin
git merge origin/develop
git push origin feature/my-feature

# Option 2: Rebase (cleaner history)
git checkout feature/my-feature
git fetch origin
git rebase origin/develop
git push origin feature/my-feature -f

# Note: Use rebase before creating PR for cleaner history
# Use merge after PR is created to preserve PR history
```

---

## Workflow Checklist

### Before Creating Feature
- [ ] Develop branch is up to date
- [ ] Feature is assigned/planned
- [ ] Feature scope is clear
- [ ] Have git-flow understanding

### During Feature Development
- [ ] Commit frequently with meaningful messages
- [ ] Push regularly to avoid losing work
- [ ] Keep commits organized
- [ ] Test your changes locally

### Before Creating PR
- [ ] Sync with latest develop
- [ ] Run tests locally
- [ ] Check code formatting
- [ ] Update documentation if needed
- [ ] Rebase to clean commit history

### PR Checklist
- [ ] Title clearly describes changes
- [ ] Description explains why, not just what
- [ ] Linked to relevant issues
- [ ] No console.logs or debugging code
- [ ] No conflicts with base branch

### Code Review
- [ ] Reviewer checks functionality
- [ ] Reviewer checks code quality
- [ ] Reviewer checks test coverage
- [ ] Reviewer checks documentation
- [ ] At least 1 approval before merge

### After Merge
- [ ] Delete feature branch
- [ ] Verify deployment to staging
- [ ] Monitor for issues
- [ ] Close related issues

---

## Troubleshooting

### I accidentally committed to main
```bash
# Create a new branch from your commit
git branch feature/my-feature
git reset --hard origin/main
git push origin main -f  # Only if main isn't protected
```

### I need to undo commits
```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Undo specific commit in middle of history
git revert <commit-hash>
```

### Feature branch is behind develop
```bash
git checkout feature/my-feature
git fetch origin
git rebase origin/develop
# Resolve any conflicts
git add .
git rebase --continue
git push origin feature/my-feature -f
```

### I need to switch branches with uncommitted changes
```bash
# Save work temporarily
git stash

# Switch branch
git checkout other-branch

# Restore work
git stash pop
```

### Delete a branch locally and remotely
```bash
# Locally
git branch -d feature/old-feature

# Remotely
git push origin --delete feature/old-feature
```

### Restore deleted branch
```bash
# Find the commit
git reflog

# Create new branch from that commit
git checkout -b feature/restored-branch <commit-hash>
```

---

## Quick Commands Summary

```bash
# Feature workflow
git checkout develop && git pull
git checkout -b feature/name
# ... work ...
git push origin feature/name
# Create PR on GitHub

# Release workflow
git checkout -b release/X.X.X develop
npm version minor --workspaces
git push origin release/X.X.X
# Create PR to main

# Hotfix workflow
git checkout -b hotfix/name main
# ... fix ...
git push origin hotfix/name
# Create PR to main AND develop

# Keep updated
git fetch origin
git rebase origin/develop  # or merge

# Delete branch
git branch -d feature/name
git push origin --delete feature/name

# View branches
git branch -a
git log --oneline --graph --all --decorate

# Sync fork with upstream
git fetch upstream
git checkout develop
git merge upstream/develop
git push origin develop
```

---

## Additional Resources

- [Nvie's Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Git Flow Extension](https://github.com/nvie/gitflow)
- [Atlassian Git Flow Tutorial](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [GitHub Flow vs Git Flow](https://www.flagship.io/git-flow-vs-github-flow/)

---

**Last Updated**: 2026-06-01  
**Status**: Active
