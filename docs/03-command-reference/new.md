
# folio new

Creates a new document from a template, automatically populating its front matter and updating its parent `index.md` file.

## Usage

```bash
folio new <type> <title> [options]
```

## Arguments

| Argument | Description |
|----------|-------------|
| `type` | Required. The document type to create (e.g., `adr`, `ticket`). This must be a key in the `types` object of your `folio.config.ts`. |
| `title` | Required. The title of the new document, enclosed in quotes. This is used for the `title` front matter field and to generate the filename slug. |

## Options

| Option | Description |
|--------|-------------|
| `--sprint <id>` | Assigns the document to a specific sprint by populating the `sprint` front matter field. |
| `--epic <id>` | Links the document to an epic by populating the `epic` front matter field. |
| `--owner <name>` | Assigns an owner by populating the `owner` front matter field. |

## Examples

### Create a simple ADR:

```bash
folio new adr "Switch to Vitest for All Unit Testing"
```

This creates a file like `0001-switch-to-vitest-for-all-unit-testing.md` in your ADR directory with:
- Automatically generated sequential ID
- Current date
- Status set to "proposed" (or your configured default)
- Title from the command

### Create a ticket with metadata:

```bash
folio new ticket "Refactor the user authentication service" --sprint="2024.05" --owner="jane.doe"
```

### Create an epic:

```bash
folio new epic "Modernize Authentication System" --owner="tech-lead"
```

## What Happens When You Run This Command

1. **Validates the type**: Ensures the document type exists in your configuration
2. **Generates a unique filename**: Uses sequential numbering and slugifies the title
3. **Populates the template**: Uses Handlebars to fill in the template with frontmatter data
4. **Creates the file**: Writes the new document to the appropriate directory
5. **Updates indexes**: Automatically regenerates the `index.md` file for the document type
6. **Updates navigation**: Refreshes LLM navigation files if the feature is enabled

## Template Variables

Your Handlebars templates have access to these variables:

- `id` - Auto-generated sequential ID
- `title` - The title you provided
- `date` - Current date
- `status` - Default status from your config
- Any other frontmatter fields with default values
- Command-line options (`sprint`, `epic`, `owner`, etc.)

## Error Handling

The command will fail if:
- The document type doesn't exist in your config
- The target directory doesn't exist
- There's a validation error with the generated frontmatter
- File permissions prevent writing

## See Also

- [folio validate](./validate.md) - Validate your documents
- [folio status](./status.md) - Update document status
- [folio list](./list.md) - List existing documents
