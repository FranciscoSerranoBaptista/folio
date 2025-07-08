# folio status

Quickly updates the status field of a specific document, with automatic validation and index regeneration.

## Usage

```bash
folio status <type> <id> <new-status>
```

## Arguments

| Argument | Description |
|----------|-------------|
| `type` | Required. The document type (e.g., `adr`, `ticket`, `epic`). |
| `id` | Required. The unique identifier of the document to update. |
| `new-status` | Required. The new status value. Must be valid according to your schema. |

## Examples

### Update an ADR status:

```bash
folio status adr 1 "accepted"
```

### Move a ticket to done:

```bash
folio status ticket JIRA-123 "Done"
```

### Change an epic to active:

```bash
folio status epic EPIC-001 "active"
```

## What Happens

When you run this command:

1. **Finds the document**: Locates the document by type and ID
2. **Validates new status**: Ensures the status is allowed by your schema
3. **Updates frontmatter**: Modifies the `status` field in the document
4. **Preserves formatting**: Maintains the original file structure and formatting
5. **Updates indexes**: Regenerates relevant index files
6. **Updates navigation**: Refreshes LLM navigation files

## Status Validation

The command validates that the new status is allowed according to your `folio.config.ts`:

```typescript
// Example configuration
types: {
  adr: {
    frontmatter: {
      status: { 
        type: 'string', 
        enum: ['proposed', 'accepted', 'rejected', 'deprecated'] 
      }
    }
  }
}
```

Valid status transitions for this configuration:
- `proposed` → `accepted`
- `proposed` → `rejected`
- `accepted` → `deprecated`
- etc.

## Common Status Workflows

### ADR Lifecycle

```bash
# Create ADR (starts as 'proposed')
folio new adr "Use React for frontend"

# Accept the decision
folio status adr 1 "accepted"

# Later, deprecate if superseded
folio status adr 1 "deprecated"
```

### Ticket Workflow

```bash
# Move ticket through states
folio status ticket JIRA-123 "In Progress"
folio status ticket JIRA-123 "Done"

# Handle blocked tickets
folio status ticket JIRA-456 "Blocked"
```

### Epic Management

```bash
# Start an epic
folio status epic EPIC-001 "active"

# Complete an epic
folio status epic EPIC-001 "completed"

# Cancel an epic
folio status epic EPIC-001 "cancelled"
```

## Error Handling

The command will fail if:

### Document Not Found
```bash
folio status adr 999 "accepted"
# Error: ADR with ID '999' not found
```

### Invalid Status
```bash
folio status adr 1 "maybe"
# Error: Invalid status 'maybe'. Must be one of: proposed, accepted, rejected, deprecated
```

### Missing Configuration
```bash
folio status unknowntype 1 "active"
# Error: Document type 'unknowntype' not found in configuration
```

## Batch Updates (Coming Soon)

Update multiple documents at once:

```bash
# Update all proposed ADRs to accepted
folio status adr --filter="status:proposed" "accepted"

# Move all tickets in sprint to done
folio status ticket --filter="sprint:2024.05" "Done"
```

## History Tracking (Coming Soon)

Track status change history:

```bash
# See status history
folio status adr 1 --history

# Add transition notes
folio status adr 1 "accepted" --note="Approved in architecture review"
```

## Integration with Other Commands

### Combined Workflows

```bash
# Create and immediately accept an ADR
folio new adr "Use PostgreSQL for primary database"
folio status adr 2 "accepted"

# Find and update tickets
folio find "authentication" --type=ticket
folio status ticket JIRA-123 "In Progress"
```

### Automation Scripts

Use in shell scripts for automation:

```bash
#!/bin/bash
# Move all completed tickets to done
for ticket_id in $(folio list ticket --status="Ready for Review" --format=json | jq -r '.documents[].id'); do
  folio status ticket "$ticket_id" "Done"
done
```

## See Also

- [folio list](./list.md) - List documents by status
- [folio find](./find.md) - Find documents to update
- [folio validate](./validate.md) - Validate status values
- [ADR Workflows](../04-advanced-guides/adr-workflows.md) - Learn about ADR lifecycle management