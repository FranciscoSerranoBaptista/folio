# folio serve

Starts either a local development server to preview your documentation with live-reloading, or a Knowledge API server for programmatic access by AI agents.

## Usage

```bash
folio serve [options]
```

## Options

| Option | Description |
|--------|-------------|
| `-p, --port <port>` | Port to run the server on (default: `3000`) |
| `--no-open` | Do not automatically open the browser (preview mode only) |
| `--api` | Start Knowledge API server instead of preview server |

### Server Modes

**Preview Server (default):**
- Live-reloading documentation preview
- Web-based interface for browsing docs
- Automatic browser opening
- File watching and hot reload

**Knowledge API Server (`--api`):**
- REST API for programmatic access
- Designed for AI agent integration
- In-memory document indexing
- Fast querying and filtering

## Examples

### Preview Server (Default)

```bash
# Start preview server on default port 3000
folio serve

# Custom port without auto-opening browser
folio serve --port 8080 --no-open
```

### Knowledge API Server

```bash
# Start Knowledge API for AI integration
folio serve --api

# API on custom port
folio serve --api --port 3001
```

The Knowledge API will be available at `http://localhost:PORT` with these endpoints:
- `GET /api/health` - Server health check
- `GET /api/documents` - Search and filter documents  
- `GET /api/documents/:id` - Get specific document

### AI Integration Workflow

```bash
# 1. Start Knowledge API
folio serve --api --port 3000

# 2. Generate AI prompt
folio generate-prompt --provider claude

# 3. Configure your AI assistant with the generated prompt
# 4. AI can now query your project knowledge!
```

## Features

### Live Preview

The development server provides:
- **Real-time rendering**: See changes instantly as you edit
- **Hot reloading**: Automatically refreshes when files change
- **Mobile responsive**: Preview on different screen sizes
- **Syntax highlighting**: Proper code highlighting for all languages

### Web Interface

The server includes a web-based interface with:

#### Document Browser
- Browse all document types
- Filter by status, owner, date
- Search across all content
- Quick navigation between related documents

#### Validation Dashboard
- Real-time validation status
- Error highlighting and suggestions
- Batch validation across document types

#### Statistics Overview
- Document counts by type and status
- Recent activity timeline
- Link analysis and health checks

### File Watching

Monitors changes to:
- **Documentation files**: `.md` and `.mdx` files in your docs directory
- **Configuration**: `folio.config.ts` changes
- **Templates**: Template modifications
- **Styles**: Custom CSS and theme files

## URL Structure

When the server is running, you can access:

```
http://localhost:3000/
├── /                          # Home dashboard
├── /docs/                     # Document browser
├── /docs/adr/                 # ADR list
├── /docs/adr/1               # Specific ADR
├── /docs/ticket/             # Ticket list
├── /validate                 # Validation dashboard
├── /search                   # Search interface
└── /api/                     # JSON API endpoints
```

## API Endpoints

The server exposes RESTful API endpoints:

### Document APIs
```
GET /api/docs                 # List all document types
GET /api/docs/adr             # List ADRs
GET /api/docs/adr/1           # Get specific ADR
PUT /api/docs/adr/1/status    # Update status
```

### Validation APIs
```
GET /api/validate             # Validate all documents
GET /api/validate/adr         # Validate ADRs only
```

### Search APIs
```
GET /api/search?q=auth        # Search documents
GET /api/search/adr?q=db      # Search within type
```

## Configuration

### Custom Themes

Create a `folio.theme.css` file to customize the appearance:

```css
/* Custom theme variables */
:root {
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  --background-color: #ffffff;
  --text-color: #1e293b;
}

/* Custom styles */
.document-title {
  color: var(--primary-color);
}
```

### Server Configuration

Add server settings to your `folio.config.ts`:

```typescript
export default defineConfig({
  // ... other config
  server: {
    port: 3000,
    host: 'localhost',
    theme: 'dark', // 'light' | 'dark' | 'auto'
    features: {
      search: true,
      validation: true,
      statistics: true,
      api: true
    }
  }
});
```

## Use Cases

### Documentation Review

```bash
# Start server for review session
folio serve --open

# Navigate to validation dashboard
# Review all proposed ADRs
# Check for broken links
```

### Content Development

```bash
# Start with file watching
folio serve --watch

# Edit documents in your editor
# See changes in real-time
# Validate as you write
```

### Team Presentations

```bash
# Start on all interfaces for team access
folio serve --host=0.0.0.0 --port=8080

# Share URL: http://your-ip:8080
# Present documentation in browser
# Navigate between related documents
```

### Integration Testing

```bash
# Start server for automated testing
folio serve --no-watch --port=9000

# Run integration tests against API
# Validate rendered output
# Check link integrity
```

## Performance

The development server is optimized for:
- **Fast startup**: Minimal initial load time
- **Incremental builds**: Only rebuild changed files
- **Memory efficiency**: Streaming for large document sets
- **Caching**: Intelligent caching of rendered content

## Security

Development server security features:
- **Local-only by default**: Binds to localhost unless specified
- **No external access**: Requires explicit host configuration
- **Read-only by default**: Modification APIs require authentication
- **CORS protection**: Prevents unauthorized cross-origin requests

## See Also

- [folio generate-prompt](./generate-prompt.md) - Generate AI system prompts
- [AI Integration Guide](../ai-integration/) - Complete AI integration documentation
- [Knowledge API Reference](../ai-integration/knowledge-api.md) - API endpoint details
- [folio validate](./validate.md) - Validate your documentation
- [CI/CD Integration](../04-advanced-guides/ci-cd-integration.md) - Deploy documentation