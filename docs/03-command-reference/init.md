# folio init

Initializes a new documentation project with a standard directory structure, configuration file, templates, and CI/CD workflows.

## Usage

```bash
folio init [options]
```

## Options

| Option | Description |
|--------|-------------|
| `-f, --force` | Force creation even if the `docs/` directory already exists. |

## What Gets Created

When you run `folio init`, the following structure is generated:

```
your-project/
├── docs/                                    # Documentation root
│   ├── 00-vision-and-strategy/             # High-level strategy docs
│   ├── 01-product-and-planning/            # Product specs and planning
│   │   └── epics/                          # Epic planning documents
│   ├── 02-architecture-and-design/         # Technical architecture
│   │   └── adrs/                           # Architecture Decision Records
│   ├── 03-engineering/                     # Development guidelines
│   ├── 04-devops-and-infrastructure/       # Infrastructure docs
│   ├── 05-operations-and-support/          # Operations and support
│   ├── 06-sprint-tickets/                  # Sprint planning and tickets
│   ├── prompts/                            # LLM prompts and instructions
│   └── schemas/                            # JSON schemas and validation
├── folio.config.ts                         # Main configuration file
├── templates/                              # Handlebars templates
│   ├── adr.md                             # ADR template
│   ├── epic.md                            # Epic template
│   ├── sprint.md                          # Sprint template
│   └── ticket.md                          # Ticket template
└── .github/workflows/                      # CI/CD workflows
    ├── validate-docs.yml                   # Documentation validation
    ├── update-indexes.yml                  # Automatic index updates
    └── docs-health-check.yml               # Weekly health monitoring
```

## Examples

### Basic initialization:

```bash
folio init
```

### Force initialization over existing docs:

```bash
folio init --force
```

Use the `--force` flag when you want to add Folio to an existing project that already has a `docs/` directory. This will create missing files without overwriting existing ones.

## What Happens After Initialization

1. **Directory structure created**: Standard organizational hierarchy for different types of documentation
2. **Configuration file generated**: `folio.config.ts` with predefined document types
3. **Templates installed**: High-quality Handlebars templates for common document types
4. **CI/CD workflows added**: GitHub Actions for automated validation and maintenance
5. **Initial navigation generated**: LLM-friendly index files created automatically

## Post-Installation Steps

After running `folio init`, you should:

1. **Install as dev dependency**:
   ```bash
   npm install --save-dev folio-cli
   ```

2. **Customize your configuration**:
   - Edit `folio.config.ts` to match your project's needs
   - Modify document types, paths, and validation rules

3. **Customize templates**:
   - Edit files in `templates/` to match your organization's standards
   - Add new templates for custom document types

4. **Create your first document**:
   ```bash
   folio new adr "Your first architectural decision"
   ```

5. **Set up GitHub integration**:
   - Push to GitHub to activate the CI/CD workflows
   - Review and customize the workflow files if needed

## Directory Purpose Guide

| Directory | Purpose |
|-----------|---------|
| `00-vision-and-strategy/` | Mission, vision, strategy documents |
| `01-product-and-planning/` | Product requirements, roadmaps, epics |
| `02-architecture-and-design/` | Technical architecture, ADRs, design docs |
| `03-engineering/` | Coding standards, guidelines, processes |
| `04-devops-and-infrastructure/` | Infrastructure, deployment, monitoring |
| `05-operations-and-support/` | Runbooks, troubleshooting, support |
| `06-sprint-tickets/` | Sprint planning, user stories, tickets |
| `prompts/` | LLM prompts, AI assistant instructions |
| `schemas/` | JSON schemas, validation rules |

## Customization

You can modify the generated structure by:

1. **Editing `folio.config.ts`** to change paths and add new document types
2. **Modifying templates** in the `templates/` directory
3. **Customizing CI/CD workflows** in `.github/workflows/`
4. **Adding new directories** and updating the config to reference them

## Error Handling

The command will fail if:
- You don't have write permissions in the current directory
- The `docs/` directory exists and you don't use `--force`
- There are file system errors during creation

## See Also

- [The Folio Config](../02-core-concepts/01-the-folio-config.md) - Learn how to customize your configuration
- [folio new](./new.md) - Create your first document
- [CI/CD Integration](../04-advanced-guides/02-ci-cd-integration.md) - Set up automated workflows