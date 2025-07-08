
# The folio.config.ts File

The `folio.config.ts` file is the brain of your Folio setup. It's a TypeScript file where you define all your document types, their locations, and their front matter schemas. Because it's a `.ts` file, you get full autocompletion and type-safety in your editor.

## Top-Level Structure

A basic config file has three main properties: `root`, `types`, and `indexing`.

```typescript
import { defineConfig } from 'folio-cli';

export default defineConfig({
  root: 'docs',
  indexing: { /* ... */ },
  types: { /* ... */ },
});
```

### `root`

The root property is a string that specifies the top-level directory where all your documentation is stored.

- **Type:** `string`
- **Default:** `'docs'`

### `indexing`

The indexing object defines the default behavior for generating index.md files.

- **`columns`:** An array of front matter fields to display as columns in the index table.
- **`format`:** The format of the index. Can be `'table'` (default) or `'list'`.

### `types`

This is the most important section. It's an object where each key is the name of a document type (e.g., `adr`, `ticket`), and the value is a `DocumentType` object.

A `DocumentType` object has these main properties:

- **`path`:** The subdirectory within your root where these documents are stored.
- **`template`:** The filename of the template to use from your `templates/` directory.
- **`frontmatter`:** A schema defining the rules for this type's front matter.

## The Frontmatter Schema

For each field in your front matter (like `title` or `status`), you can define a set of rules:

- **`type`:** The data type. Can be `'string'`, `'number'`, `'boolean'`, or `'date'`.
- **`required`:** If `true`, `folio validate` will fail if this field is missing.
- **`unique`:** If `true`, `folio validate` will fail if two documents of the same type share the same value for this field.
- **`isArray`:** If `true`, the field should be an array of the specified type.
- **`enum`:** An array of allowed values for the field.
- **`pattern`:** A regular expression that string values must match.
- **`default`:** A static value or a function `(() => value)` to pre-fill when creating a new document.

## Full Example

```typescript
// folio.config.ts
import { defineConfig } from 'folio-cli';

export default defineConfig({
  root: 'docs',
  indexing: {
    columns: ['id', 'title', 'status', 'owner'],
    format: 'table',
  },
  types: {
    adr: {
      path: '02-architecture-and-design/adrs',
      template: 'adr.md',
      frontmatter: {
        id: { type: 'number', required: true, unique: true },
        title: { type: 'string', required: true },
        status: { 
          type: 'string', 
          enum: ['proposed', 'accepted', 'rejected', 'deprecated'], 
          default: 'proposed' 
        },
        date: { type: 'date', default: () => new Date() },
        authors: { type: 'string', isArray: true },
        tags: { type: 'string', isArray: true },
      },
    },
    ticket: {
      path: '06-sprint-tickets',
      template: 'ticket.md',
      frontmatter: {
        id: { 
          type: 'string', 
          required: true, 
          unique: true, 
          pattern: /^[A-Z]+-\d+$/ 
        },
        title: { type: 'string', required: true, minLength: 10 },
        status: { 
          type: 'string', 
          enum: ['To Do', 'In Progress', 'Done', 'Blocked'] 
        },
        owner: { type: 'string' },
        estimate: { type: 'number' },
        sprint: { type: 'string' },
        epic: { type: 'string' },
        priority: { 
          type: 'string', 
          enum: ['Low', 'Medium', 'High', 'Critical'],
          default: 'Medium'
        },
      },
    },
    epic: {
      path: '01-product-and-planning/epics',
      template: 'epic.md',
      frontmatter: {
        id: { type: 'string', required: true, unique: true },
        title: { type: 'string', required: true },
        status: { 
          type: 'string', 
          enum: ['planned', 'active', 'completed', 'cancelled'],
          default: 'planned'
        },
        owner: { type: 'string', required: true },
        start_date: { type: 'date' },
        target_date: { type: 'date' },
        business_value: { type: 'string' },
      },
    },
  },
});
```

## Advanced Configuration

### Custom Validators

You can add custom validation logic by extending the schema:

```typescript
export default defineConfig({
  types: {
    adr: {
      // ... other config
      frontmatter: {
        id: { 
          type: 'number', 
          required: true, 
          unique: true,
          // Custom validation function
          validate: (value) => value > 0 && value < 10000
        },
      },
    },
  },
});
```

### Dynamic Defaults

Use functions for dynamic default values:

```typescript
frontmatter: {
  id: { 
    type: 'number', 
    default: () => Date.now() 
  },
  author: { 
    type: 'string', 
    default: () => process.env.USER || 'Unknown' 
  },
}
```

### File Naming Patterns

Control how files are named using the `naming` property:

```typescript
export default defineConfig({
  types: {
    adr: {
      path: '02-architecture-and-design/adrs',
      template: 'adr.md',
      naming: {
        pattern: '{{id}}-{{slug}}',
        idPadding: 4, // Pad IDs to 4 digits: 0001, 0002, etc.
      },
      // ... frontmatter
    },
  },
});
```

## Best Practices

1. **Start Simple:** Begin with basic `required` and `enum` validations, add complexity later.

2. **Use Meaningful Enums:** Define clear status values that match your workflow.

3. **Leverage Unique IDs:** Use `unique: true` for ID fields to prevent duplicates.

4. **Document Your Schema:** Add comments in your config to explain field purposes.

5. **Version Your Config:** Treat `folio.config.ts` like code—review changes and document breaking updates.

## Next Steps

With your configuration in place, you're ready to:

- [Create your first documents](../03-command-reference/new.md)
- [Set up validation workflows](../04-advanced-guides/02-ci-cd-integration.md)
- [Explore ADR lifecycle management](../04-advanced-guides/01-adr-workflows.md)
