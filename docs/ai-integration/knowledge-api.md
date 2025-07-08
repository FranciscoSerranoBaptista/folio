# Folio Knowledge API

The Folio Knowledge API transforms your project documentation into a programmable interface that AI agents can query, search, and understand. It provides RESTful endpoints for accessing structured document metadata and content.

## Starting the API Server

### Basic Usage

```bash
# Start API server on default port 3000
folio serve --api

# Start on custom port
folio serve --api --port 3001

# API will be available at http://localhost:PORT
```

### Server Output

When started, the API server displays available endpoints:

```
🚀 Folio Knowledge API is running at: http://localhost:3000

Available endpoints:
  GET http://localhost:3000/api/health
  GET http://localhost:3000/api/documents
  GET http://localhost:3000/api/documents/:id

Example queries:
  http://localhost:3000/api/documents?type=adr
  http://localhost:3000/api/documents?status=approved&limit=10
  http://localhost:3000/api/documents?q=authentication
```

## API Endpoints

### GET /api/health

Health check endpoint for monitoring server status.

**Response:**
```json
{
  "status": "ok",
  "documents": 42,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/documents

Search and filter documents using query parameters.

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `type` | string | Filter by document type | `adr`, `ticket`, `epic` |
| `status` | string | Filter by status | `Accepted`, `In Progress`, `Done` |
| `tags` | string | Comma-separated tags | `security,authentication` |
| `q` | string | Natural language search | `user authentication` |
| `limit` | number | Maximum results (default: 50) | `10` |

**Examples:**

```bash
# Get all ADRs
curl "http://localhost:3000/api/documents?type=adr"

# Get accepted security-related ADRs
curl "http://localhost:3000/api/documents?type=adr&status=Accepted&tags=security"

# Search for authentication-related documents
curl "http://localhost:3000/api/documents?q=authentication&limit=5"

# Get in-progress tickets
curl "http://localhost:3000/api/documents?type=ticket&status=In%20Progress"
```

**Response:**
```json
{
  "documents": [
    {
      "id": "adrs-001-auth",
      "filePath": "adrs/001-authentication.md",
      "type": "adr",
      "status": "Accepted",
      "tags": ["security", "authentication"],
      "title": "Choose JWT Authentication",
      "date": "2024-01-15",
      "author": "jane.doe"
    }
  ],
  "total": 1
}
```

**Note:** Search results exclude document content for performance. Use the `/api/documents/:id` endpoint to get full content.

### GET /api/documents/:id

Retrieve complete document content by ID.

**Parameters:**
- `id` - Document identifier (e.g., `adrs-001-auth`, `tickets-backend-101`)

**Example:**
```bash
curl "http://localhost:3000/api/documents/adrs-001-auth"
```

**Response:**
```json
{
  "document": {
    "id": "adrs-001-auth",
    "filePath": "adrs/001-authentication.md",
    "type": "adr",
    "status": "Accepted",
    "tags": ["security", "authentication"],
    "title": "Choose JWT Authentication",
    "content": "# Choose JWT Authentication\n\n## Status\nAccepted\n\n## Context\nWe need to implement user authentication...",
    "date": "2024-01-15",
    "author": "jane.doe"
  }
}
```

**Error Response (404):**
```json
{
  "error": "Document not found"
}
```

## Document ID Generation

The API automatically generates unique IDs from file paths:

| File Path | Generated ID |
|-----------|--------------|
| `docs/adrs/001-auth.md` | `adrs-001-auth` |
| `docs/tickets/backend/USER-101.md` | `tickets-backend-user-101` |
| `docs/epics/user-management.md` | `epics-user-management` |
| `docs/some-document.md` | `some-document` |

**Rules:**
- Remove `docs/` prefix
- Replace `/` with `-`
- Remove `.md` extension
- Convert to lowercase
- Replace special characters with `-`

## Document Loading

The API scans your documentation directory and loads all Markdown files:

### Supported Frontmatter

```yaml
---
title: "Document Title"
type: adr
status: Accepted
tags: [security, authentication]
date: 2024-01-15
author: jane.doe
epic: "User Management"
sprint: "2024.01"
priority: high
---
```

### Search Behavior

1. **Metadata Filtering** - Fast, precise filtering on frontmatter fields
2. **Content Search** - Text search on document title and body content
3. **Combined Queries** - Metadata filters applied first, then content search
4. **Case Insensitive** - All searches are case-insensitive

## Performance Characteristics

### In-Memory Storage
- **Fast startup** - Documents loaded once at server start
- **Fast queries** - All searches operate on in-memory data
- **Low latency** - Typical response times under 10ms

### Scalability
- **Small projects** (< 100 docs) - Instant responses
- **Medium projects** (100-1000 docs) - Sub-10ms responses  
- **Large projects** (1000+ docs) - May need pagination

### Memory Usage
- **Approximate** - 1KB per document in memory
- **1000 documents** ≈ 1MB RAM usage
- **Suitable for** most development projects

## Integration Patterns

### AI Agent Queries

Typical AI workflow using the API:

```javascript
// 1. Research existing decisions
const adrs = await fetch('/api/documents?type=adr&status=Accepted&tags=auth');

// 2. Search for related work
const tickets = await fetch('/api/documents?type=ticket&q=authentication');

// 3. Get specific document details
const details = await fetch('/api/documents/adrs-001-auth');
```

### Development Tools

The API can power various development tools:

- **IDE extensions** - Context-aware documentation lookup
- **CLI tools** - Automated policy checking
- **CI/CD pipelines** - Documentation validation
- **Chat bots** - Project knowledge assistance

## Configuration

The Knowledge API respects your Folio configuration:

```typescript
// folio.config.ts
export default {
  root: "docs",
  types: {
    adr: { path: "adrs", /* ... */ },
    ticket: { path: "tickets", /* ... */ }
  }
  // API automatically discovers types and paths
}
```

## Monitoring

### Health Checks

Use the health endpoint for monitoring:

```bash
# Simple health check
curl http://localhost:3000/api/health

# In monitoring scripts
if curl -f http://localhost:3000/api/health; then
  echo "API is healthy"
else
  echo "API is down"
fi
```

### Logging

The API logs key events:

```
ℹ️ Loading documents into knowledge API...
ℹ️ Loaded 42 documents
🚀 Folio Knowledge API is running at: http://localhost:3000
```

## Security Considerations

### Read-Only by Default
- The API provides **read-only access** to your documentation
- No document modification capabilities exposed
- Safe to run in development environments

### Network Binding
- Binds to `0.0.0.0` by default for container compatibility
- Consider firewall rules for production deployment
- No authentication required (assumes trusted network)

### Content Exposure
- All document content is accessible via the API
- Ensure sensitive information is not in your docs
- Consider separate repositories for public vs private documentation

---

**Next:** [AI Prompts Guide](./ai-prompts.md) - Learn how to generate system prompts for AI integration