# folio validate

Validates all documents (or a specific type) against your configured schemas to ensure they conform to your frontmatter rules and requirements.

## Usage

```bash
folio validate [type] [options]
```

## Arguments

| Argument | Description |
|----------|-------------|
| `type` | Optional. The document type to validate (e.g., `adr`, `ticket`). If omitted, validates all document types. |

## Options

| Option | Description |
|--------|-------------|
| `--fix` | Automatically fix common issues where possible |
| `--strict` | Enable strict mode with additional validation rules |
| `--format <format>` | Output format: `table`, `json`, or `summary` (default: `table`) |

## Examples

### Validate all documents:

```bash
folio validate
```

### Validate only ADRs:

```bash
folio validate adr
```

### Validate with automatic fixes:

```bash
folio validate --fix
```

### Get JSON output for CI/CD:

```bash
folio validate --format=json
```

## What Gets Validated

### Frontmatter Validation

- **Required fields**: Ensures all required fields are present
- **Data types**: Validates that fields match their expected types (`string`, `number`, `boolean`, `date`)
- **Enum values**: Checks that enum fields contain only allowed values
- **Unique constraints**: Verifies that fields marked as unique don't have duplicates
- **Pattern matching**: Validates string fields against regex patterns
- **Array validation**: Ensures array fields contain the correct element types

### File Structure Validation

- **File naming**: Checks that files follow naming conventions
- **Directory placement**: Ensures files are in the correct directories
- **Template compliance**: Verifies files were created from proper templates

### Content Validation

- **Frontmatter syntax**: Ensures valid YAML frontmatter
- **Markdown structure**: Basic markdown syntax validation
- **Internal links**: Validates links between documents (coming soon)

## Validation Output

### Table Format (Default)

```
Validating documents...

✅ ADRs (5 documents)
   - All documents valid

❌ Tickets (3 documents, 2 errors)
   File: 0001-user-authentication.md
   - Missing required field: 'owner'
   - Invalid status: 'In-Progress' (must be one of: 'To Do', 'In Progress', 'Done')

✅ Epics (2 documents)
   - All documents valid

Summary: 8 valid, 2 invalid documents
```

### JSON Format

```json
{
  "valid": true,
  "summary": {
    "total": 10,
    "valid": 8,
    "invalid": 2
  },
  "results": [
    {
      "type": "adr",
      "file": "0001-use-typescript.md",
      "valid": true,
      "errors": []
    },
    {
      "type": "ticket",
      "file": "0001-user-authentication.md",
      "valid": false,
      "errors": [
        {
          "field": "owner",
          "message": "Missing required field"
        },
        {
          "field": "status",
          "message": "Invalid value 'In-Progress'. Must be one of: 'To Do', 'In Progress', 'Done'"
        }
      ]
    }
  ]
}
```

## Auto-Fix Capabilities

When using `--fix`, the validator can automatically correct:

- **Formatting issues**: Standardize frontmatter formatting
- **Case sensitivity**: Fix enum values with incorrect casing
- **Date formats**: Convert dates to ISO format
- **Missing default values**: Add default values for fields that have them configured

## Common Validation Errors

### Missing Required Fields

```yaml
# ❌ Invalid - missing required 'title' field
---
id: 1
status: proposed
---

# ✅ Valid
---
id: 1
title: "Use TypeScript for new services"
status: proposed
---
```

### Invalid Enum Values

```yaml
# ❌ Invalid - 'approved' is not in the enum
---
status: approved
---

# ✅ Valid
---
status: accepted
---
```

### Type Mismatches

```yaml
# ❌ Invalid - ID should be a number
---
id: "one"
---

# ✅ Valid
---
id: 1
---
```

### Pattern Violations

```yaml
# ❌ Invalid - doesn't match pattern /^[A-Z]+-\d+$/
---
id: "ticket-123"
---

# ✅ Valid
---
id: "JIRA-123"
---
```

## CI/CD Integration

Use validation in your GitHub Actions workflows:

```yaml
name: Validate Documentation
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx folio validate --format=json
```

## Exit Codes

- `0`: All documents are valid
- `1`: Validation errors found
- `2`: Configuration or system error

## Performance

Validation is optimized for large document sets:
- Parallel processing of multiple files
- Incremental validation (only changed files in CI)
- Configurable validation rules to balance speed vs. thoroughness

## See Also

- [The Folio Config](../02-core-concepts/01-the-folio-config.md) - Configure validation rules
- [folio new](./new.md) - Create valid documents from templates
- [CI/CD Integration](../04-advanced-guides/ci-cd-integration.md) - Automate validation