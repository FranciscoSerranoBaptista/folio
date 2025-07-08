# Documentation Websites

Generate beautiful documentation websites from your Folio project using MkDocs and GitHub Pages.

## Overview

Folio includes comprehensive support for generating documentation websites using MkDocs with the Material theme. This creates professional, searchable documentation that automatically deploys to GitHub Pages.

## For Folio CLI Repository

The Folio CLI repository is already configured with MkDocs and will automatically deploy to:
**https://franciscoserranobaptista.github.io/folio/**

## For Client Repositories

Any project using Folio CLI can easily set up documentation websites.

### Quick Setup

1. **Install Folio CLI** in your project:
   ```bash
   npm install --save-dev folio-cli
   ```

2. **Initialize Folio** (if not already done):
   ```bash
   npx folio init
   ```

3. **Set up MkDocs**:
   ```bash
   npx folio setup-docs
   ```

4. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Set Source to "GitHub Actions"
   - Save settings

5. **Push and deploy**:
   ```bash
   git add .
   git commit -m "Add MkDocs documentation setup"
   git push origin main
   ```

Your documentation will be available at:
`https://yourusername.github.io/your-repository/`

### What You Get

✅ **Professional documentation site** with Material theme  
✅ **Automatic deployment** on every push to main  
✅ **Search functionality** across all documentation  
✅ **Mobile-responsive design** that works on all devices  
✅ **Dark/light mode toggle** for user preference  
✅ **GitHub integration** with edit links and repository info  
✅ **Navigation structure** matching your Folio folder organization  

### Advanced Configuration

The `setup-docs` command accepts several options:

```bash
npx folio setup-docs \
  --project-name "My Project" \
  --description "Comprehensive project documentation" \
  --author "Your Name" \
  --github-username "yourusername" \
  --repository-name "your-repo" \
  --force
```

### Integration with Folio Commands

#### Generate Navigation

Keep your documentation updated:

```bash
npx folio generate-nav
```

This creates comprehensive README.md files that work perfectly with MkDocs.

#### Automatic Updates

Add to your CI/CD pipeline:

```yaml
- name: Update documentation
  run: |
    npx folio generate-nav
    git add docs/
    git commit -m "Update navigation" || exit 0
```

### Local Development

After running `setup-docs`, you can develop locally:

```bash
# Install dependencies
pip install -r requirements.txt

# Preview documentation
mkdocs serve

# Build static site
mkdocs build
```

### Customization

#### Theme Colors

Edit `mkdocs.yml`:

```yaml
theme:
  palette:
    - scheme: default
      primary: indigo  # Your brand color
      accent: indigo
```

#### Navigation Structure

Customize the navigation to match your project:

```yaml
nav:
  - Home: index.md
  - Architecture:
    - Overview: 02-architecture-and-design/README.md
    - ADRs: 02-architecture-and-design/adrs/README.md
  - Your Custom Section:
    - Overview: your-section/README.md
```

#### Additional Features

```yaml
theme:
  features:
    - navigation.instant    # Instant loading
    - navigation.tracking   # Anchor tracking
    - toc.follow           # Follow table of contents
    - search.suggest       # Search suggestions
```

## Examples

### Standard Project Setup

```bash
cd my-project
npx folio init
npx folio setup-docs
# Follow prompts for project details
```

### Automated Setup for CI/CD

```bash
npx folio setup-docs \
  --project-name "E-commerce Platform" \
  --description "Full-stack e-commerce solution" \
  --author "Development Team" \
  --github-username "company" \
  --repository-name "ecommerce-platform" \
  --force
```

### Custom Domain

To use a custom domain, create `docs/CNAME`:

```
docs.yourcompany.com
```

## Best Practices

1. **Run setup-docs after folio init** - Get the complete structure
2. **Keep navigation shallow** - Maximum 3 levels deep
3. **Use folio generate-nav regularly** - Keep indexes current
4. **Test locally** - Use `mkdocs serve` before pushing
5. **Update dependencies** - Keep MkDocs packages current
6. **Use descriptive titles** - Clear section and page names
7. **Include overview pages** - README.md in each directory
8. **Link related content** - Cross-reference between sections

## Troubleshooting

### Build Errors

```bash
# Check configuration
mkdocs config

# Validate with strict mode
mkdocs build --strict
```

### GitHub Pages Not Deploying

1. Check repository settings (Settings → Pages)
2. Verify GitHub Actions are enabled
3. Check workflow run logs in Actions tab
4. Ensure main branch protection allows Actions

### Navigation Issues

```bash
# Generate fresh navigation
npx folio generate-nav

# Check for missing README.md files
find docs -name "README.md"
```

### Missing Dependencies

```bash
# Install all requirements
pip install -r requirements.txt

# Or install individually
pip install mkdocs-material mkdocs-awesome-pages-plugin pymdown-extensions
```

## Templates

Folio includes several templates for documentation setup:

- **mkdocs.yml** - Complete MkDocs configuration
- **docs-workflow.yml** - GitHub Actions workflow
- **mkdocs-setup.md** - Detailed setup guide
- **requirements.txt** - Python dependencies

Access these templates in your project at `docs/_templates/`.

## Support

For issues with documentation setup:

- **MkDocs**: [Official documentation](https://www.mkdocs.org/)
- **Material theme**: [Theme documentation](https://squidfunk.github.io/mkdocs-material/)
- **GitHub Pages**: [GitHub Pages docs](https://docs.github.com/en/pages)
- **Folio CLI**: [Command reference](../03-command-reference/setup-docs.md)

## Related Commands

- [`folio init`](../03-command-reference/init.md) - Initialize Folio project
- [`folio setup-docs`](../03-command-reference/setup-docs.md) - Set up MkDocs
- [`folio generate-nav`](../03-command-reference/generate-nav.md) - Generate navigation
- [`folio serve`](../03-command-reference/serve.md) - Development server