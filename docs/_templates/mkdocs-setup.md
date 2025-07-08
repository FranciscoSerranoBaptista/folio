# MkDocs Setup Guide for Folio Projects

This guide helps you set up MkDocs documentation for your Folio project.

## Quick Setup

### 1. Copy Configuration Files

Copy these files to your project root:

```bash
# Copy MkDocs configuration
cp docs/_templates/mkdocs.yml ./mkdocs.yml

# Copy GitHub Actions workflow
mkdir -p .github/workflows
cp docs/_templates/docs-workflow.yml .github/workflows/docs.yml
```

### 2. Customize Configuration

Edit `mkdocs.yml` and replace the template variables:

```yaml
site_name: Your Project Name Documentation
site_description: Your project description
site_url: https://yourusername.github.io/your-repo-name/
repo_url: https://github.com/yourusername/your-repo-name
repo_name: yourusername/your-repo-name
```

### 3. Enable GitHub Pages

1. Go to your repository settings
2. Navigate to "Pages" section
3. Set Source to "GitHub Actions"
4. Save the settings

### 4. Customize Navigation

Edit the `nav:` section in `mkdocs.yml` to match your project structure:

```yaml
nav:
  - Home: index.md
  - Vision & Strategy:
    - Overview: 00-vision-and-strategy/README.md
  - Product & Planning:
    - Overview: 01-product-and-planning/README.md
    - Epics: 01-product-and-planning/epics/README.md
  # Add or remove sections as needed
```

## Local Development

### Install Dependencies

```bash
pip install mkdocs-material mkdocs-awesome-pages-plugin pymdown-extensions
```

### Preview Documentation

```bash
mkdocs serve
```

Visit `http://localhost:8000` to preview your documentation.

### Build Static Site

```bash
mkdocs build
```

## Folio Integration

### Generate Navigation

Use Folio CLI to generate navigation files:

```bash
folio generate-nav
```

This creates comprehensive README.md files that work perfectly with MkDocs.

### Auto-Update Documentation

Add this to your CI/CD pipeline:

```yaml
- name: Update documentation navigation
  run: |
    npx folio generate-nav
    git add docs/
    git commit -m "Update documentation navigation" || exit 0
```

## Customization Options

### Theme Colors

```yaml
theme:
  palette:
    - scheme: default
      primary: indigo  # Change to your brand color
      accent: indigo
```

### Additional Features

```yaml
theme:
  features:
    - navigation.instant    # Instant loading
    - navigation.tracking   # Anchor tracking
    - navigation.tabs.sticky # Sticky navigation tabs
    - toc.follow           # Follow table of contents
    - search.suggest       # Search suggestions
```

### Custom CSS

Create `docs/stylesheets/extra.css`:

```css
:root {
  --md-primary-fg-color: #your-brand-color;
}
```

Add to `mkdocs.yml`:

```yaml
extra_css:
  - stylesheets/extra.css
```

## Best Practices

1. **Keep navigation shallow** - Maximum 3 levels deep
2. **Use descriptive titles** - Clear section and page names
3. **Include overview pages** - README.md in each directory
4. **Link related content** - Cross-reference between sections
5. **Update regularly** - Use `folio generate-nav` to keep indexes current

## Troubleshooting

### Build Errors

```bash
# Check configuration
mkdocs config

# Validate navigation
mkdocs build --strict
```

### Missing Pages

- Ensure all referenced files exist
- Check file paths in navigation
- Verify README.md files are present

### Broken Links

- Use relative paths for internal links
- Test links locally with `mkdocs serve`
- Check for case sensitivity issues

## Support

For issues with:
- **MkDocs**: Check [MkDocs documentation](https://www.mkdocs.org/)
- **Material theme**: See [Material theme docs](https://squidfunk.github.io/mkdocs-material/)
- **Folio CLI**: Visit [Folio CLI documentation](https://franciscoserranobaptista.github.io/folio/)