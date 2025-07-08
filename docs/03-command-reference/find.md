# folio find

Quickly searches and locates documents by ID, title, content, or any frontmatter field with intelligent relevance ranking.

## Usage

```bash
folio find <query> [options]
```

## Arguments

| Argument | Description |
|----------|-------------|
| `query` | Required. Search query (e.g., `"CE-112.3"`, `"authentication"`, `"microservices"`). |

## Options

| Option | Description |
|--------|-------------|
| `-t, --type <type>` | Search scope: `id`, `title`, `content`, or `any` (default: `any`) |
| `-l, --limit <number>` | Maximum number of results to show (default: `20`) |
| `-f, --format <format>` | Output format: `table`, `list`, or `paths` (default: `table`) |

## Examples

### Find by exact ID:

```bash
folio find "CE-112.3"
```

### Find by title:

```bash
folio find "authentication" --type=title
```

### Find by content:

```bash
folio find "microservices" --type=content --limit=5
```

### Get file paths only:

```bash
folio find "database" --format=paths
```

## Search Types

### ID Search (`--type=id`)

Searches document IDs and related identifier fields:

```bash
folio find "ADR-001" --type=id
folio find "JIRA-123" --type=id
```

Searches these frontmatter fields:
- `id`
- `ticket_id` 
- `adr_id`
- `epic_id`

### Title Search (`--type=title`)

Searches document titles:

```bash
folio find "authentication service" --type=title
```

### Content Search (`--type=content`)

Searches within document body content:

```bash
folio find "PostgreSQL" --type=content
folio find "performance optimization" --type=content
```

### Any Search (`--type=any`, default)

Searches all fields and content with intelligent ranking:

```bash
folio find "auth"  # Finds in IDs, titles, content, and frontmatter
```

## Output Formats

### Table Format (Default)

```
Found 3 matching document(s)

| ID | Title | Type | Match | File |
|----|-------|------|-------|------|
| `CE-112` | Implement user authentication | ticket | ID: CE-112 | `CE-112-user-auth.md` |
| `0001` | Authentication architecture | adr | Title: Authentication architecture | `0001-auth-architecture.md` |
| `EPIC-5` | Auth system overhaul | epic | Content match | `EPIC-5-auth-overhaul.md` |
```

### List Format

```bash
folio find "auth" --format=list
```

```
📄 **Implement user authentication** (CE-112)
   📁 docs/06-sprint-tickets/CE-112-user-auth.md
   🎯 Match: ID: CE-112
   📊 Status: In Progress

📄 **Authentication architecture** (0001)
   📁 docs/02-architecture-and-design/adrs/0001-auth-architecture.md
   🎯 Match: Title: Authentication architecture
   📊 Status: accepted

📄 **Auth system overhaul** (EPIC-5)
   📁 docs/01-product-and-planning/epics/EPIC-5-auth-overhaul.md
   🎯 Match: Content match
   📊 Status: active
```

### Paths Format

```bash
folio find "database" --format=paths
```

```
docs/02-architecture-and-design/adrs/0003-choose-database.md
docs/06-sprint-tickets/DB-456-optimize-queries.md
docs/03-engineering/database-guidelines.md
```

## Relevance Ranking

Results are automatically ranked by relevance:

1. **Exact ID matches** - Highest priority
2. **ID contains** - High priority  
3. **Title matches** - Medium priority
4. **Filename matches** - Medium priority
5. **Content matches** - Lower priority
6. **Other frontmatter** - Lowest priority

### Example Ranking

For query `"auth"`:
1. Document with ID `"AUTH-123"` (exact ID)
2. Document with ID `"CE-AUTH-456"` (ID contains)
3. Document titled `"Authentication Service"` (title)
4. Document with content mentioning `"auth token"` (content)

## Advanced Search

### Frontmatter Field Search

Search specific frontmatter fields:

```bash
# Find by owner
folio find "jane.doe"      # Searches all fields
folio find "@jane.doe"     # Future: field-specific syntax

# Find by status  
folio find "In Progress"   # Searches all fields including status
```

### Pattern Matching

Use patterns for more precise searches:

```bash
# Find ticket patterns
folio find "JIRA-*" --type=id      # Future: wildcard support
folio find "/ADR-\d+/" --type=id   # Future: regex support
```

## Common Use Cases

### Quick Document Lookup

```bash
# Developer needs to find a specific ticket
folio find "CE-112.3"

# Architect needs to review auth decisions
folio find "authentication" --type=title

# PM needs to see all epics
folio find "" --type=epic  # Future: type filtering
```

### Content Discovery

```bash
# Find all mentions of a technology
folio find "PostgreSQL" --type=content

# Find documents by team member
folio find "john.smith"

# Find recent decisions
folio find "proposed" --type=any
```

### Debugging and Validation

```bash
# Find documents with issues
folio find "TODO" --type=content
folio find "FIXME" --type=content

# Find orphaned references
folio find "EPIC-999" --type=content
```

## Integration with LLM Navigation

The find command works seamlessly with generated navigation:

```bash
# LLM can quickly locate documents mentioned in conversation
Human: "Check ticket CE-112.3"
LLM: folio find "CE-112.3"
```

## Performance

Search is optimized for:
- **Fast scanning**: Efficient file parsing
- **Memory efficiency**: Streaming for large document sets  
- **Caching**: Results cached for repeated queries
- **Incremental search**: As-you-type functionality (in serve mode)

## Exit Codes

- `0`: Documents found
- `1`: No documents found
- `2`: Search error or invalid parameters

## See Also

- [folio list](./list.md) - List documents by type and filters
- [folio generate-nav](./generate-nav.md) - Generate searchable navigation
- [LLM Navigation Guide](../04-advanced-guides/03-llm-navigation.md) - Optimize for AI accessibility