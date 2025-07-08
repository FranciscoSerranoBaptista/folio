# folio list

Lists and filters documents of a specific type with powerful querying capabilities based on frontmatter fields.

## Usage

```bash
folio list <type> [options]
```

## Arguments

| Argument | Description |
|----------|-------------|
| `type` | Required. The document type to list (e.g., `adr`, `ticket`, `epic`). |

## Options

| Option | Description |
|--------|-------------|
| `--status <status>` | Filter by status field |
| `--owner <owner>` | Filter by owner field |
| `--sprint <sprint>` | Filter by sprint field |
| `--format <format>` | Output format: `table`, `list`, `json`, or `csv` (default: `table`) |
| `--sort <field>` | Sort by field (default: `id`) |
| `--reverse` | Reverse sort order |
| `--limit <number>` | Limit number of results |

## Examples

### List all ADRs:

```bash
folio list adr
```

### List tickets by status:

```bash
folio list ticket --status="In Progress"
```

### List epics for a specific owner:

```bash
folio list epic --owner="product-manager"
```

### List recent tickets in JSON format:

```bash
folio list ticket --sort=date --reverse --limit=10 --format=json
```

### List tickets for current sprint:

```bash
folio list ticket --sprint="2024.05" --status="To Do"
```

## Output Formats

### Table Format (Default)

```
ADRs (5 documents)

| ID | Title                           | Status    | Date       | Authors |
|----|--------------------------------|-----------|------------|---------|
| 1  | Use TypeScript for new services | accepted  | 2024-01-15 | tech-lead |
| 2  | Adopt microservices architecture| proposed  | 2024-01-20 | architect |
| 3  | Switch to PostgreSQL           | rejected  | 2024-01-25 | dba-team |
```

### List Format

```bash
folio list adr --format=list
```

```
📄 ADR-0001: Use TypeScript for new services
   📊 Status: accepted
   📅 Date: 2024-01-15
   👤 Authors: tech-lead
   📁 File: 0001-use-typescript-for-new-services.md

📄 ADR-0002: Adopt microservices architecture
   📊 Status: proposed
   📅 Date: 2024-01-20
   👤 Authors: architect
   📁 File: 0002-adopt-microservices-architecture.md
```

### JSON Format

```bash
folio list ticket --format=json
```

```json
{
  "type": "ticket",
  "total": 12,
  "documents": [
    {
      "id": "JIRA-123",
      "title": "Implement user authentication",
      "status": "In Progress",
      "owner": "developer-1",
      "sprint": "2024.05",
      "estimate": 8,
      "file": "JIRA-123-implement-user-authentication.md",
      "path": "docs/06-sprint-tickets/JIRA-123-implement-user-authentication.md"
    }
  ]
}
```

### CSV Format

```bash
folio list adr --format=csv
```

```csv
id,title,status,date,authors,file
1,"Use TypeScript for new services",accepted,2024-01-15,tech-lead,0001-use-typescript-for-new-services.md
2,"Adopt microservices architecture",proposed,2024-01-20,architect,0002-adopt-microservices-architecture.md
```

## Filtering

### By Status

Filter documents by their status field:

```bash
# Single status
folio list adr --status="proposed"

# Multiple statuses (coming soon)
folio list ticket --status="To Do,In Progress"
```

### By Owner

Filter by the owner or assignee:

```bash
folio list ticket --owner="jane.doe"
folio list epic --owner="product-team"
```

### By Sprint

Filter tickets or other documents by sprint:

```bash
folio list ticket --sprint="2024.Q1"
folio list ticket --sprint="current"  # Special keyword
```

### Complex Queries (Coming Soon)

Advanced filtering with multiple conditions:

```bash
# Combine multiple filters
folio list ticket --status="In Progress" --owner="team-lead" --sprint="2024.05"

# Date range filtering
folio list adr --created-after="2024-01-01" --created-before="2024-03-31"

# Custom field filtering
folio list ticket --priority="High" --estimate=">5"
```

## Sorting

### Basic Sorting

```bash
# Sort by ID (default)
folio list adr

# Sort by title
folio list adr --sort=title

# Sort by date (newest first)
folio list adr --sort=date --reverse

# Sort by status
folio list ticket --sort=status
```

### Multi-field Sorting (Coming Soon)

```bash
folio list ticket --sort="status,priority,date"
```

## Use Cases

### Sprint Planning

```bash
# See all tickets for the current sprint
folio list ticket --sprint="2024.05"

# Check what's in progress
folio list ticket --status="In Progress"

# See high-priority items
folio list ticket --priority="High" --status="To Do"
```

### Architecture Review

```bash
# Review proposed ADRs
folio list adr --status="proposed"

# See all accepted decisions
folio list adr --status="accepted" --sort=date
```

### Project Management

```bash
# Check active epics
folio list epic --status="active"

# See what's assigned to a team member
folio list ticket --owner="developer-1"
```

## Performance

The list command is optimized for:
- **Fast scanning**: Efficient frontmatter parsing
- **Memory efficiency**: Streaming for large document sets
- **Caching**: Results cached for repeated queries

## See Also

- [folio find](./find.md) - Search documents by content
- [folio status](./status.md) - Update document status
- [folio new](./new.md) - Create new documents