# folio adr

Comprehensive ADR (Architecture Decision Record) lifecycle management including deprecation, renumbering, and listing with advanced filtering.

## Usage

```bash
folio adr <command> [options]
```

## Commands

| Command | Description |
|---------|-------------|
| `deprecate` | Mark an ADR as deprecated |
| `renumber` | Renumber all ADRs sequentially |
| `list` | List ADRs with filtering options |

## folio adr deprecate

Mark an ADR as deprecated with optional metadata about the deprecation.

### Usage

```bash
folio adr deprecate <id> [options]
```

### Arguments

| Argument | Description |
|----------|-------------|
| `id` | Required. ADR ID or identifier to deprecate. |

### Options

| Option | Description |
|--------|-------------|
| `-r, --reason <reason>` | Reason for deprecation |
| `-s, --superseded-by <id>` | ID of the ADR that supersedes this one |
| `--dry-run` | Preview changes without applying them |

### Examples

```bash
# Simple deprecation
folio adr deprecate 1

# Deprecation with reason
folio adr deprecate 2 --reason="Superseded by new microservices architecture"

# Deprecation with replacement reference
folio adr deprecate 3 --superseded-by="0007" --reason="Replaced by updated database strategy"

# Preview changes first
folio adr deprecate 4 --dry-run
```

### What Happens

When deprecating an ADR:

1. **Updates status**: Changes `status` to `"deprecated"`
2. **Adds metadata**: Includes deprecation date and optional reason
3. **Preserves history**: Original content remains intact
4. **Updates indexes**: Regenerates ADR index and navigation
5. **Links replacement**: Optionally references superseding ADR

Example frontmatter after deprecation:

```yaml
---
id: 3
title: "Use MongoDB for primary database"
status: deprecated
date: 2024-01-15
deprecated_date: 2024-07-08
deprecation_reason: "Replaced by updated database strategy"
superseded_by: "0007"
---
```

## folio adr renumber

Renumber all ADRs to have sequential IDs. **This is a dangerous operation** that renames files and updates IDs.

### Usage

```bash
folio adr renumber [options]
```

### Options

| Option | Description |
|--------|-------------|
| `--start-from <number>` | Starting number for renumbering (default: `1`) |
| `--dry-run` | Preview changes without applying them |
| `--force` | Required flag to perform the operation |

### Examples

```bash
# Preview the renumbering
folio adr renumber --dry-run

# Renumber starting from 1
folio adr renumber --force

# Renumber starting from 100
folio adr renumber --start-from=100 --force
```

### What Happens

⚠️ **Warning**: This operation:
- Renames all ADR files
- Updates ID fields in frontmatter
- May break existing links and references
- Cannot be easily undone

The renumbering process:

1. **Analyzes existing ADRs**: Scans all ADR files
2. **Plans new sequence**: Determines new sequential IDs
3. **Creates backup names**: Uses temporary filenames to avoid conflicts
4. **Updates content**: Modifies frontmatter with new IDs
5. **Renames files**: Applies new sequential filenames
6. **Updates indexes**: Regenerates all navigation and indexes

### Safety Features

- **Requires `--force`**: Prevents accidental execution
- **Dry-run mode**: Preview changes before applying
- **Atomic operation**: Either all files are updated or none
- **Backup recommended**: Always backup before renumbering

## folio adr list

List all ADRs with powerful filtering and formatting options.

### Usage

```bash
folio adr list [options]
```

### Options

| Option | Description |
|--------|-------------|
| `-s, --status <status>` | Filter by status |
| `-f, --format <format>` | Output format: `table` or `list` (default: `table`) |

### Examples

```bash
# List all ADRs
folio adr list

# List only proposed ADRs
folio adr list --status="proposed"

# List deprecated ADRs
folio adr list --status="deprecated"

# List in detailed format
folio adr list --format=list
```

### Output Formats

#### Table Format (Default)

```
Found 5 ADR(s)

| ID | Title | Status | File |
|----|-------|--------|------|
| `0001` | Use TypeScript for new services | accepted | `0001-use-typescript-for-new-services.md` |
| `0002` | Adopt microservices architecture | proposed | `0002-adopt-microservices-architecture.md` |
| `0003` | Use MongoDB for primary database | deprecated | `0003-use-mongodb-for-primary-database.md` |
```

#### List Format

```bash
folio adr list --format=list
```

```
📄 **ADR-0001**: Use TypeScript for new services
   📊 Status: accepted
   📁 File: 0001-use-typescript-for-new-services.md

📄 **ADR-0002**: Adopt microservices architecture  
   📊 Status: proposed
   📁 File: 0002-adopt-microservices-architecture.md

📄 **ADR-0003**: Use MongoDB for primary database
   📊 Status: deprecated
   📁 File: 0003-use-mongodb-for-primary-database.md
```

## ADR Lifecycle Workflows

### Standard ADR Process

```bash
# 1. Create new ADR
folio new adr "Adopt GraphQL for API layer"

# 2. Review and discuss (external process)

# 3. Accept or reject the decision
folio adr list --status="proposed"  # Review pending ADRs
folio status adr 4 "accepted"       # Accept the decision

# 4. Later, if superseded
folio new adr "Migrate from GraphQL to REST"
folio adr deprecate 4 --superseded-by="5" --reason="Performance concerns addressed"
```

### Batch Operations

```bash
# Review all proposed ADRs
folio adr list --status="proposed"

# Find ADRs that might need review
folio find "TODO" --type=content
folio find "deprecated" --type=content

# Periodic cleanup
folio adr list --status="deprecated" --format=list
```

### Migration and Cleanup

```bash
# Before major refactoring, renumber for clean sequence
folio adr renumber --dry-run        # Preview
folio adr renumber --force          # Execute

# After migration, update references
folio find "ADR-" --type=content    # Find old references
# Manually update references to new IDs
```

## Configuration

ADR commands automatically detect your ADR configuration:

```typescript
// folio.config.ts
export default defineConfig({
  types: {
    adr: {
      path: '02-architecture-and-design/adrs',
      template: 'adr.md',
      frontmatter: {
        id: { type: 'number', required: true, unique: true },
        status: { 
          type: 'string', 
          enum: ['proposed', 'accepted', 'rejected', 'deprecated'],
          default: 'proposed'
        }
      }
    }
  }
});
```

## See Also

- [folio status](./status.md) - Update ADR status
- [folio new](./new.md) - Create new ADRs
- [ADR Workflows Guide](../04-advanced-guides/adr-workflows.md) - Best practices and workflows