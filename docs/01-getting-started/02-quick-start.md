# Quick Start Tutorial

Let's get you up and running with Folio in under 5 minutes. In this guide, we'll initialize a project, create our first Architecture Decision Record (ADR), and see Folio's automation in action.

## Step 1: Installation & Initialization

First, install Folio as a development dependency in your project.

```bash
npm install --save-dev folio-cli
```

Now initialize your documentation structure:

```bash
npx folio init
```

This command creates:
- `docs/` - Your documentation root directory
- `folio.config.ts` - Configuration file defining your document types
- `templates/` - Handlebars templates for each document type
- `.github/workflows/` - CI/CD workflows for documentation validation

## Step 2: Explore the Generated Structure

Take a look at what was created:

```
your-project/
├── docs/
│   ├── 00-vision-and-strategy/
│   ├── 01-product-and-planning/
│   ├── 02-architecture-and-design/
│   │   └── adrs/
│   ├── 03-engineering/
│   ├── 04-devops-and-infrastructure/
│   ├── 05-operations-and-support/
│   ├── 06-sprint-tickets/
│   ├── prompts/
│   └── schemas/
├── folio.config.ts
├── templates/
│   ├── adr.md
│   ├── epic.md
│   ├── sprint.md
│   └── ticket.md
└── .github/workflows/
    ├── validate-docs.yml
    ├── update-indexes.yml
    └── docs-health-check.yml
```

## Step 3: Create Your First ADR

Now let's create an Architecture Decision Record:

```bash
npx folio new adr "Use TypeScript for all new services"
```

This command:
1. Creates a new ADR file with a sequential ID (e.g., `0001-use-typescript-for-all-new-services.md`)
2. Populates it with the current date, status "proposed", and your title
3. Updates the ADR index file automatically
4. Generates navigation files for LLM accessibility

## Step 4: Find Your Document

Use Folio's powerful search to quickly locate documents:

```bash
# Find by ID
npx folio find "0001"

# Find by title
npx folio find "TypeScript"

# Find any document containing "service"
npx folio find "service" --type=content
```

## Step 5: Update Document Status

Change the status of your ADR as decisions progress:

```bash
npx folio status adr 0001 "accepted"
```

This updates the frontmatter and regenerates any affected index files.

## Step 6: Validate Your Documentation

Ensure all documents follow your defined schemas:

```bash
npx folio validate
```

This checks that all required frontmatter fields are present and conform to your rules.

## Step 7: Generate Navigation for LLMs

Create comprehensive navigation files optimized for AI assistants:

```bash
npx folio generate-nav
```

This generates:
- Root `README.md` with complete document index
- Directory-level `README.md` files with local navigation
- Hyperlinked tables for quick ID-based lookups

## Next Steps

You're now ready to:

1. **Customize your config** - Edit `folio.config.ts` to define your own document types
2. **Create more documents** - Use `folio new <type> <title>` for tickets, epics, etc.
3. **Set up CI/CD** - The generated GitHub Actions will validate docs on every push
4. **Explore advanced features** - ADR lifecycle management, bulk operations, and more

## Key Commands Reference

| Command | Description |
|---------|-------------|
| `folio init` | Initialize project structure |
| `folio new <type> <title>` | Create new document |
| `folio find <query>` | Search documents |
| `folio status <type> <id> <status>` | Update document status |
| `folio validate` | Validate all documents |
| `folio generate-nav` | Generate LLM navigation |
| `folio adr deprecate <id>` | Deprecate an ADR |
| `folio list <type>` | List documents of a type |

Ready to dive deeper? Check out [The Folio Config](../02-core-concepts/01-the-folio-config.md) to learn how to customize document types and schemas.
