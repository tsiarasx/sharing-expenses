# GitHub Actions Workflows

This directory contains the CI/CD pipeline workflows for the Expense-Sharing App.

## Workflows

### 1. **ci.yml** - Continuous Integration Pipeline
- **Triggers:** Pull requests to `develop`, pushes to `develop`/`main`
- **Duration:** ~5-10 minutes
- **Jobs:**
  - Backend testing and linting
  - Frontend testing and build
  - Security scanning (npm audit)
  - Code quality checks
- **Purpose:** Validate code quality before merging
- **Documentation:** See [GITHUB_ACTIONS_GUIDE.md](../../GITHUB_ACTIONS_GUIDE.md)

### 2. **release.yml** - Release & Versioning Workflow
- **Triggers:** Manual dispatch from GitHub Actions, push to `main`
- **Duration:** ~2-3 minutes
- **Features:**
  - Automatic semantic version bumping (patch/minor/major)
  - CHANGELOG.md updates
  - Git tag creation
  - GitHub Release generation
  - Auto-generated release notes
- **Purpose:** Manage releases and versions automatically
- **Documentation:** See [GITHUB_ACTIONS_GUIDE.md](../../GITHUB_ACTIONS_GUIDE.md)

### 3. **deploy.yml** - Build & Deploy Workflow
- **Triggers:** Release publication, push to `main`
- **Duration:** ~5-7 minutes
- **Jobs:**
  - Backend production build
  - Frontend optimized build
  - Deployment verification
  - Artifact upload (7-day retention)
- **Purpose:** Create deployment-ready artifacts
- **Documentation:** See [GITHUB_ACTIONS_GUIDE.md](../../GITHUB_ACTIONS_GUIDE.md)

## Quick Start

### Viewing Workflow Runs
1. Go to your repository
2. Click the **Actions** tab
3. Select a workflow to see runs
4. Click a run to see details and logs

### Manually Triggering Release Workflow
1. Go to **Actions** tab
2. Select **Release & Versioning**
3. Click **Run workflow**
4. Select version bump type:
   - `patch` for bug fixes (1.0.0 → 1.0.1)
   - `minor` for new features (1.0.0 → 1.1.0)
   - `major` for breaking changes (1.0.0 → 2.0.0)
5. Click **Run workflow**

### Checking PR Status
When you create a pull request:
1. Look for the **Checks** section
2. All CI jobs should pass (✅)
3. If any fail (❌), fix them and push again
4. Once all pass, you can merge

## Workflow Variables

The workflows use these GitHub Actions variables:

```yaml
github.event.inputs.version_bump   # User-selected version bump type
github.token                        # Automatic GitHub token
github.ref                         # Current branch
github.event_name                  # Event type (push, pull_request, etc.)
```

## Environment Secrets

To enable production deployments, configure these secrets in:
**Settings → Secrets and variables → Actions**

```
MONGO_URI              # MongoDB connection string
JWT_SECRET             # JWT signing secret
REACT_APP_API_URL      # Frontend API endpoint
DEPLOYMENT_KEY         # Server deployment key (optional)
```

## Performance

### Execution Times (Approximate)
- **CI Workflow:** 5-10 minutes (runs on every PR)
- **Release Workflow:** 2-3 minutes (manual or on main merge)
- **Deploy Workflow:** 5-7 minutes (on release)

### GitHub Actions Usage (Free Tier)
- **Available:** 2,000 minutes/month
- **Expected Usage:** ~300-400 minutes/month
- **Cost:** Free for public repos, included in free plan

## Documentation

For detailed information about workflows:
- **[DEVOPS.md](../../DEVOPS.md)** - Complete DevOps guide
- **[GITHUB_ACTIONS_GUIDE.md](../../GITHUB_ACTIONS_GUIDE.md)** - Detailed workflow guide
- **[GIT_FLOW_SETUP.md](../../GIT_FLOW_SETUP.md)** - Git Flow branching strategy

## Troubleshooting

### CI Workflow Failing
1. Check the workflow run logs
2. Look for red ❌ marks indicating which job failed
3. View job logs to see the specific error
4. Fix the issue locally
5. Push to the branch (workflow will re-run)

### Release Workflow Not Triggering
- Manual trigger: Go to **Actions** → **Release & Versioning** → **Run workflow**
- Auto-trigger: Works on push to `main` (if code files changed)
- Check that you have write permissions to the repository

### Artifact Not Found
- Artifacts are retained for 7 days after creation
- Check the **Deploy** workflow run details
- Look for the "Upload artifact" step
- Download from the workflow run page

## Extending Workflows

To add new checks or steps:

1. Edit the corresponding `.yml` file
2. Add new steps following GitHub Actions syntax
3. Push to your branch
4. Test in a PR
5. Merge when working

### Example: Add Slack Notification

```yaml
- name: Notify Slack on failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "CI Pipeline Failed"
      }
```

## Further Reading

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

---

**Last Updated:** 2026-06-01  
**Status:** Active
