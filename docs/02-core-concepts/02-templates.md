# Templates

Templates are the foundation of Folio's document creation system. They use Handlebars templating to generate consistent, well-structured documents with proper frontmatter and content organization.

## How Templates Work

When you run `folio new <type> <title>`, Folio:

1. **Loads the template** from your `templates/` directory
2. **Compiles it** using Handlebars with your frontmatter data
3. **Generates the document** with proper YAML frontmatter
4. **Writes the file** to the configured path

## Template Structure

### Basic Template Anatomy

```markdown
---
id: {{id}}
title: "{{title}}"
status: {{status}}
date: {{date}}
---

# {{title}}

## Overview

{{description}}

## Content

[Template content here...]
```

### Frontmatter Variables

Templates have access to these automatic variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{id}}` | Auto-generated sequential ID | `1`, `2`, `PROJ-123` |
| `{{title}}` | Title from command line | `"Use PostgreSQL"` |
| `{{date}}` | Current date | `2024-07-08` |
| `{{status}}` | Default status from config | `"proposed"` |

### Command-Line Variables

Variables from command options are also available:

```bash
folio new ticket "Fix login bug" --owner="john" --sprint="2024.05"
```

Template access:
```markdown
---
owner: {{owner}}     # "john"
sprint: {{sprint}}   # "2024.05"
---
```

## Template Configuration

### Basic Template Setup

In your `folio.config.ts`:

```typescript
export default defineConfig({
  types: {
    adr: {
      path: '02-architecture-and-design/adrs',
      template: 'adr.md',  // Points to templates/adr.md
      frontmatter: {
        id: { type: 'number', required: true },
        title: { type: 'string', required: true },
        status: { type: 'string', default: 'proposed' }
      }
    }
  }
});
```

### Template Location

Templates are stored in the `templates/` directory:

```
your-project/
   templates/
      adr.md          # ADR template
      ticket.md       # Ticket template
      epic.md         # Epic template
      sprint.md       # Sprint template
   folio.config.ts
   docs/
```

## Handlebars Features

### Conditional Content

```markdown
{{#if owner}}
**Assigned to**: {{owner}}
{{/if}}

{{#if epic}}
**Epic**: [{{epic}}](../epics/{{epic}}.md)
{{/if}}
```

### Loops and Arrays

```markdown
{{#each tags}}
- {{this}}
{{/each}}

{{#if authors}}
**Authors**:
{{#each authors}}
- {{this}}
{{/each}}
{{/if}}
```

## Template Best Practices

### 1. Consistent Structure

Use consistent sections across templates:

```markdown
---
# Frontmatter
---

# Title

## Overview/Summary

## Details/Content

## References/Links
```

### 2. Rich Frontmatter

Include comprehensive metadata:

```markdown
---
id: {{id}}
title: "{{title}}"
status: {{status}}
date: {{date}}
owner: {{owner}}
tags: []
priority: "Medium"
estimate: null
---
```

### 3. Helpful Prompts

Include guidance for content creation:

```markdown
## Context

<!-- What is the issue that we're seeing? -->

## Decision

<!-- What is the change that we're proposing? -->

## Consequences

<!-- What becomes easier or more difficult? -->
```

### 4. Cross-References

Enable easy linking between documents:

```markdown
{{#if epic}}
**Related Epic**: [{{epic}}](../01-product-and-planning/epics/{{epic}}.md)
{{/if}}

{{#if related_adrs}}
**Related ADRs**:
{{#each related_adrs}}
- [ADR-{{this}}](./{{padLeft this 4}}-*.md)
{{/each}}
{{/if}}
```

## Advanced Template Features

### Dynamic Defaults

Use functions for dynamic default values:

```typescript
// folio.config.ts
frontmatter: {
  id: { 
    type: 'string', 
    default: () => `PROJ-${Date.now()}` 
  },
  author: { 
    type: 'string', 
    default: () => process.env.USER || 'Unknown' 
  },
  quarter: {
    type: 'string',
    default: () => {
      const now = new Date();
      const quarter = Math.ceil((now.getMonth() + 1) / 3);
      return `${now.getFullYear()}.Q${quarter}`;
    }
  }
}
```

### Template Validation

Ensure templates produce valid documents:

```typescript
frontmatter: {
  title: { 
    type: 'string', 
    required: true,
    validate: (value) => value.length >= 10  // Minimum title length
  },
  estimate: {
    type: 'number',
    validate: (value) => value > 0 && value <= 21  // Valid story points
  }
}
```

## Common Template Patterns

### Status Workflows

Template with status-specific content:

```markdown
---
status: {{status}}
---

# {{title}}

{{#eq status "proposed"}}
> = **Status**: This is a proposed decision awaiting review.
{{/eq}}

{{#eq status "accepted"}}
>  **Status**: This decision has been accepted and is being implemented.
{{/eq}}

{{#eq status "deprecated"}}
>   **Status**: This decision has been superseded.
{{/eq}}
```

### Integration Hooks

Templates that integrate with external systems:

```markdown
---
jira_id: {{id}}
github_issue: null
slack_channel: "#{{team}}-{{project}}"
---

# {{title}}

{{#if jira_id}}
**Jira**: [{{jira_id}}](https://company.atlassian.net/browse/{{jira_id}})
{{/if}}

{{#if github_issue}}
**GitHub**: [Issue #{{github_issue}}](https://github.com/org/repo/issues/{{github_issue}})
{{/if}}
```

## See Also

- [Template Examples](../06-examples/template-examples.md) - Sample templates for different document types
- [The Folio Config](./01-the-folio-config.md) - Configuration reference
- [folio new](../03-command-reference/new.md) - Creating documents from templates