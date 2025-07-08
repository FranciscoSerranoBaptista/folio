# setup-docs Command

Sets up MkDocs documentation for your Folio project with GitHub Pages deployment.

## Usage

```bash
folio setup-docs [options]
```

## Description

The `setup-docs` command creates a complete MkDocs documentation setup for your Folio project, including:

- **mkdocs.yml** - Material theme configuration optimized for Folio
- **GitHub Actions workflow** - Automatic deployment to GitHub Pages
- **requirements.txt** - Python dependencies for MkDocs
- **Interactive setup** - Prompts for project details

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--project-name <name>` | Project name for documentation | Repository name |
| `--description <desc>` | Project description | "Documentation for {project}" |
| `--author <author>` | Author name | Git user.name |
| `--github-username <username>` | GitHub username | From git remote |
| `--repository-name <name>` | Repository name | From git remote |
| `--force` | Overwrite existing files | false |

## Examples

### Basic Setup

```bash
folio setup-docs
```

Interactive setup with prompts for all required information.

### Automated Setup

```bash
folio setup-docs \
  --project-name "My Project" \
  --description "Comprehensive project documentation" \
  --author "John Doe" \
  --github-username "johndoe" \
  --repository-name "my-project" \
  --force
```

### Force Overwrite

```bash
folio setup-docs --force
```

Overwrite existing mkdocs.yml and workflow files.

## What Gets Created

### mkdocs.yml

Material theme configuration with:
- Navigation structure matching your Folio project
- Search functionality
- Code highlighting
- Dark/light mode toggle
- GitHub integration

### .github/workflows/docs.yml

GitHub Actions workflow that:
- Builds documentation on push to main
- Deploys to GitHub Pages
- Caches dependencies for faster builds
- Runs on documentation changes only

### requirements.txt

Python dependencies:
- mkdocs-material
- mkdocs-awesome-pages-plugin
- pymdown-extensions

## GitHub Pages Setup

After running the command:

1. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Set Source to "GitHub Actions"
   - Save settings

2. **Push changes**:
   ```bash
   git add .
   git commit -m "Add MkDocs documentation setup"
   git push origin main
   ```

3. **Access documentation**:
   - Visit `https://yourusername.github.io/your-repo/`
   - First build may take a few minutes

## Local Development

### Install Dependencies

```bash
pip install -r requirements.txt
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

## Integration with Folio

### Generate Navigation

Keep your documentation updated:

```bash
folio generate-nav
```

This creates comprehensive README.md files that work perfectly with MkDocs.

### Automatic Updates

Add to your CI/CD pipeline:

```yaml
- name: Update documentation
  run: |
    folio generate-nav
    git add docs/
    git commit -m "Update navigation" || exit 0
```

## Customization

### Navigation Structure

Edit the `nav:` section in `mkdocs.yml`:

```yaml
nav:
  - Home: index.md
  - Architecture:
    - Overview: 02-architecture-and-design/README.md
    - ADRs: 02-architecture-and-design/adrs/README.md
  # Add your sections here
```

### Theme Colors

```yaml
theme:
  palette:
    - scheme: default
      primary: indigo  # Your brand color
      accent: indigo
```

### Additional Features

```yaml
theme:
  features:
    - navigation.instant
    - navigation.tracking
    - toc.follow
    - search.suggest
```

## Troubleshooting

### Files Already Exist

```bash
# Use --force to overwrite
folio setup-docs --force
```

### GitHub Pages Not Working

1. Check repository settings
2. Verify GitHub Actions are enabled
3. Check workflow run logs
4. Ensure main branch protection allows Actions

### Build Errors

```bash
# Validate configuration
mkdocs config

# Check for broken links
mkdocs build --strict
```

### Missing Navigation

```bash
# Generate Folio navigation
folio generate-nav

# Check README.md files exist
ls docs/*/README.md
```

## Best Practices

1. **Run setup-docs after folio init** - Get the full structure
2. **Keep navigation shallow** - Maximum 3 levels
3. **Use folio generate-nav** - Maintain up-to-date indexes
4. **Test locally** - Use `mkdocs serve` before pushing
5. **Update regularly** - Keep dependencies current

## Related Commands

- [`folio init`](init.md) - Initialize Folio project
- [`folio generate-nav`](generate-nav.md) - Generate navigation files
- [`folio serve`](serve.md) - Start development server

## Support

For issues with MkDocs setup, check:
- [MkDocs documentation](https://www.mkdocs.org/)
- [Material theme docs](https://squidfunk.github.io/mkdocs-material/)
- [GitHub Pages documentation](https://docs.github.com/en/pages)