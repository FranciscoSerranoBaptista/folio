# CI/CD Integration

Automate your documentation workflows with GitHub Actions and other CI/CD platforms. Folio provides built-in workflows and supports custom automation.

## GitHub Actions (Automatic)

When you run `folio init`, GitHub Actions workflows are automatically created in `.github/workflows/`:

### validate-docs.yml

Validates all documentation on push and pull requests:

```yaml
name: Validate Documentation
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx folio validate
      - run: npx folio generate-nav
```

### update-indexes.yml

Automatically updates index files when documents change:

```yaml
name: Update Documentation Indexes
on:
  push:
    branches: [main]
    paths: ['docs/**/*.md']

jobs:
  update-indexes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx folio generate-nav
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add docs/
          git diff --staged --quiet || git commit -m "Auto-update documentation indexes"
          git push
```

### docs-health-check.yml

Weekly health monitoring for documentation quality:

```yaml
name: Documentation Health Check
on:
  schedule:
    - cron: '0 9 * * 1' # Every Monday at 9 AM

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx folio validate --strict
      - run: npx folio list adr --status=proposed
      - name: Check for stale documents
        run: |
          # Custom script to find stale documents
          find docs/ -name "*.md" -mtime +90 -exec echo "Stale: {}" \;
```

## Custom GitHub Actions

### Advanced Validation

Create `.github/workflows/advanced-validation.yml`:

```yaml
name: Advanced Documentation Validation
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      
      # Validate all documents
      - name: Validate documentation
        run: npx folio validate --format=json > validation-results.json
      
      # Check for broken links
      - name: Check links
        run: |
          npm install -g markdown-link-check
          find docs/ -name "*.md" -exec markdown-link-check {} \;
      
      # Validate ADR lifecycle
      - name: Check ADR statuses
        run: |
          # Ensure no ADRs have been in "proposed" for >30 days
          npx folio list adr --status=proposed --format=json | \
          jq '.documents[] | select(.date < (now - 30*24*3600) | strftime("%Y-%m-%d"))' | \
          jq -s 'if length > 0 then error("Stale proposed ADRs found") else empty end'
      
      # Generate and validate navigation
      - name: Generate navigation
        run: npx folio generate-nav
      
      # Check that navigation is up to date
      - name: Verify navigation is current
        run: |
          if git diff --quiet docs/README.md; then
            echo "Navigation is up to date"
          else
            echo "Navigation needs updating"
            exit 1
          fi
```

### Documentation Metrics

Track documentation metrics over time:

```yaml
name: Documentation Metrics
on:
  push:
    branches: [main]

jobs:
  metrics:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      
      - name: Generate metrics
        run: |
          # Count documents by type
          echo "ADRs: $(npx folio list adr --format=json | jq '.total')"
          echo "Tickets: $(npx folio list ticket --format=json | jq '.total')"
          echo "Epics: $(npx folio list epic --format=json | jq '.total')"
          
          # Status distribution
          echo "Proposed ADRs: $(npx folio list adr --status=proposed --format=json | jq '.total')"
          echo "Accepted ADRs: $(npx folio list adr --status=accepted --format=json | jq '.total')"
          
          # Save metrics to artifact
          npx folio validate --format=json > docs-metrics.json
      
      - name: Upload metrics
        uses: actions/upload-artifact@v3
        with:
          name: documentation-metrics
          path: docs-metrics.json
```

## Other CI/CD Platforms

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
stages:
  - validate
  - deploy

validate-docs:
  stage: validate
  image: node:18
  script:
    - npm ci
    - npx folio validate
    - npx folio generate-nav
  rules:
    - changes:
        - docs/**/*.md
        - folio.config.ts

update-navigation:
  stage: deploy
  image: node:18
  script:
    - npm ci
    - npx folio generate-nav
    - git config --global user.email "gitlab-ci@example.com"
    - git config --global user.name "GitLab CI"
    - git add docs/README.md docs/**/README.md
    - git commit -m "Update documentation navigation" || exit 0
    - git push
  only:
    - main
```

### Jenkins Pipeline

Create `Jenkinsfile`:

```groovy
pipeline {
    agent any
    
    stages {
        stage('Setup') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Validate') {
            steps {
                sh 'npx folio validate'
            }
        }
        
        stage('Update Navigation') {
            when {
                branch 'main'
            }
            steps {
                sh 'npx folio generate-nav'
                sh '''
                    git config user.email "jenkins@example.com"
                    git config user.name "Jenkins"
                    git add docs/
                    git commit -m "Update documentation navigation" || true
                    git push origin main || true
                '''
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: 'docs/**/*.md', allowEmptyArchive: true
        }
    }
}
```

### Azure DevOps

Create `azure-pipelines.yml`:

```yaml
trigger:
  branches:
    include:
      - main
  paths:
    include:
      - docs/*
      - folio.config.ts

pool:
  vmImage: 'ubuntu-latest'

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '18.x'
  displayName: 'Install Node.js'

- script: npm ci
  displayName: 'Install dependencies'

- script: npx folio validate
  displayName: 'Validate documentation'

- script: npx folio generate-nav
  displayName: 'Generate navigation'

- script: |
    git config --global user.email "azure-devops@example.com"
    git config --global user.name "Azure DevOps"
    git add docs/
    git commit -m "Update documentation navigation" || exit 0
    git push
  displayName: 'Commit navigation updates'
  condition: eq(variables['Build.SourceBranch'], 'refs/heads/main')
```

## Pre-commit Hooks

Set up local validation with pre-commit hooks using [Husky](https://github.com/typicode/husky):

### Installation

```bash
npm install --save-dev husky lint-staged
npx husky install
```

### Configuration

Add to `package.json`:

```json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "docs/**/*.md": [
      "npx folio validate",
      "npx folio generate-nav"
    ],
    "folio.config.ts": [
      "npx folio validate"
    ]
  }
}
```

Create `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

## Integration with Documentation Sites

### Deploy to GitHub Pages

Create `.github/workflows/deploy-docs.yml`:

```yaml
name: Deploy Documentation
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npx folio generate-nav
      - run: npx folio serve --build --output=dist
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### VitePress Integration

If using VitePress for documentation:

```javascript
// .vitepress/config.js
export default {
  title: 'Project Documentation',
  description: 'Managed by Folio CLI',
  
  // Pre-build hook to generate navigation
  buildStart() {
    require('child_process').execSync('npx folio generate-nav');
  },
  
  themeConfig: {
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Installation', link: '/01-getting-started/01-installation' },
          { text: 'Quick Start', link: '/01-getting-started/02-quick-start' }
        ]
      },
      {
        text: 'Architecture',
        items: [
          { text: 'ADRs', link: '/02-architecture-and-design/adrs/' }
        ]
      }
    ]
  }
}
```

## Notification Integration

### Slack Notifications

Add Slack notifications for documentation events:

```yaml
- name: Notify Slack
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    text: 'Documentation validation failed'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Microsoft Teams

```yaml
- name: Notify Teams
  if: always()
  uses: aliencube/microsoft-teams-actions@v0.8.0
  with:
    webhook_uri: ${{ secrets.MS_TEAMS_WEBHOOK }}
    title: Documentation Status
    summary: Validation completed with status ${{ job.status }}
```

## Best Practices

### 1. Fail Fast

Configure CI to fail quickly on documentation issues:

```yaml
- run: npx folio validate --fail-fast
```

### 2. Parallel Validation

Run multiple checks in parallel:

```yaml
strategy:
  matrix:
    check: [validate, links, spelling, navigation]
```

### 3. Conditional Updates

Only update navigation when necessary:

```yaml
- run: npx folio generate-nav
- name: Check for changes
  run: git diff --quiet docs/README.md || echo "Navigation updated"
```

### 4. Cache Dependencies

Speed up builds with caching:

```yaml
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

## See Also

- [folio validate](../03-command-reference/validate.md) - Validation command reference
- [folio generate-nav](../03-command-reference/generate-nav.md) - Navigation generation
- [GitHub Actions Documentation](https://docs.github.com/en/actions)