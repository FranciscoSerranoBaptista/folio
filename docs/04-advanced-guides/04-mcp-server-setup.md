# MCP Server Setup

The Folio Knowledge API serves as a Model Context Protocol (MCP) server, providing AI agents with structured access to your project's documentation and knowledge base.

## Overview

The MCP server transforms your Folio documentation into a programmable interface that AI agents can query, understand, and interact with. This enables powerful AI-assisted development workflows where agents can research existing decisions, understand project patterns, and even contribute new documentation.

## Installation Options

### Local Development Setup (Recommended for Testing)

If you're working with the Folio CLI source code or testing unreleased features:

```bash
# 1. Clone and build Folio CLI
git clone <folio-cli-repo>
cd folio-cli
pnpm install
npm run build

# 2. Package for local installation
npm run pack
# Creates: dist-packages/folio-cli-1.0.0.tgz

# 3. Install in your project
cd /path/to/your/project
pnpm install --save-dev file:../folio-cli/dist-packages/folio-cli-1.0.0.tgz

# 4. Add to your package.json scripts for convenience
echo '"mcp": "npx folio serve --api --port 9001"' >> package.json
```

### Published Package Setup

Once Folio CLI is published to npm:

```bash
# Install globally
pnpm install -g folio-cli

# Or install locally in your project
pnpm install --save-dev folio-cli
```

## Quick Start

### 1. Initialize Your Project

```bash
# Create a new Folio project
folio init

# Add some sample documentation
folio new adr "Authentication Strategy"
folio new ticket "User Login Feature" --epic "User Management"
folio new epic "User Management System"
```

### 2. Start the MCP Server

```bash
# Method 1: Using the CLI directly
folio serve --api --port 9001

# Method 2: Using the convenience script (from project root)
npm run mcp
```

Expected output:
```
ℹ️ Serving documentation from: docs
ℹ️ Loading documents into knowledge API...
ℹ️ Loaded 3 documents

🚀 Folio Knowledge API is running at: http://localhost:3000

Available endpoints:
  GET http://localhost:3000/api/health
  GET http://localhost:3000/api/documents
  GET http://localhost:3000/api/documents/:id

Example queries:
  http://localhost:3000/api/documents?type=adr
  http://localhost:3000/api/documents?status=Accepted&limit=10
  http://localhost:3000/api/documents?q=authentication

Press Ctrl+C to stop the server.
```

### 3. Test the API

```bash
# Health check
curl http://localhost:3000/api/health

# List all documents
curl http://localhost:3000/api/documents

# Filter by document type
curl "http://localhost:3000/api/documents?type=adr"

# Search by content
curl "http://localhost:3000/api/documents?q=authentication"
```

### 4. Generate AI System Prompt

```bash
# Generate prompt for Claude
folio generate-prompt --provider claude

# Generate prompt for OpenAI
folio generate-prompt --provider openai

# Save prompt to file
folio generate-prompt --provider claude -o ai-setup.txt
```

## Claude MCP Configuration

### 5. Configure Claude Desktop

To use Folio as an MCP server with Claude Desktop, add the following configuration to your Claude settings file:

**Location:** `~/.claude/settings.local.json`

### Option 1: HTTP MCP Server (Recommended)

Use Claude Code's built-in MCP HTTP transport to connect directly to the Folio API.

#### Add Folio as HTTP MCP Server

```bash
# Add Folio API as an HTTP MCP server
claude mcp add --transport http folio-api http://localhost:9001

# For project-wide sharing (creates .mcp.json)
claude mcp add --transport http -s project folio-api http://localhost:9001
```

#### Verify Configuration

```bash
# List all MCP servers
claude mcp list

# Get details for Folio server
claude mcp get folio-api

# Check server status in Claude Code
/mcp
```

### Option 2: Direct Folio Execution (Alternative)

This approach runs Folio directly as an MCP server:

```json
{
  "mcpServers": {
    "folio": {
      "command": "node",
      "args": [
        "/path/to/your/project/dist/src/index.js",
        "serve",
        "--api",
        "--port",
        "3000"
      ],
      "cwd": "/path/to/your/project"
    }
  }
}
```

**Important:** Replace `/path/to/your/project` with the absolute path to your Folio documentation project.

### Configuration Examples

**Single Project:**
```json
{
  "mcpServers": {
    "my-project-docs": {
      "command": "node", 
      "args": [
        "/Users/username/folio-cli/dist/src/index.js",
        "serve",
        "--api",
        "--port",
        "3000"
      ],
      "cwd": "/Users/username/my-project"
    }
  }
}
```

**Multiple Projects:**
```json
{
  "mcpServers": {
    "project-a-docs": {
      "command": "node",
      "args": [
        "/Users/username/folio-cli/dist/src/index.js", 
        "serve",
        "--api",
        "--port",
        "3001"
      ],
      "cwd": "/Users/username/project-a"
    },
    "project-b-docs": {
      "command": "node",
      "args": [
        "/Users/username/folio-cli/dist/src/index.js",
        "serve", 
        "--api",
        "--port",
        "3002"
      ],
      "cwd": "/Users/username/project-b"
    }
  }
}
```

### Setup Steps

#### For Option 1 (HTTP MCP Server):

1. **Install Folio CLI:**

   **Method A: From npm registry (when published):**
   ```bash
   pnpm install -g folio-cli
   ```

   **Method B: Local development installation:**
   ```bash
   # From the folio-cli repository root
   npm run pack
   
   # This creates: dist-packages/folio-cli-1.0.0.tgz
   # Install in your project:
   cd /path/to/your/project
   pnpm install --save-dev file:../folio/dist-packages/folio-cli-1.0.0.tgz
   
   # Or add to package.json dependencies:
   # "folio-cli": "file:../folio/dist-packages/folio-cli-1.0.0.tgz"
   ```

   **Method C: Link for development:**
   ```bash
   # From folio-cli repository root
   npm run build
   pnpm link --global
   
   # From your project directory
   pnpm link --global folio-cli
   ```

2. **Start Folio API server:**
   ```bash
   cd /path/to/your/project
   
   # Method 1: Direct CLI command
   folio serve --api --port 9001
   
   # Method 2: Using convenience script (if folio-cli is in devDependencies)
   npm run mcp
   
   # Method 3: Using npx (if installed locally)
   npx folio serve --api --port 9001
   ```
   
   Keep this running in a terminal.

3. **Add HTTP MCP server:**
   ```bash
   # Local scope (default)
   claude mcp add --transport http folio-api http://localhost:9001
   
   # Or project scope for team sharing
   claude mcp add --transport http -s project folio-api http://localhost:9001
   ```

4. **Test MCP server:**
   ```bash
   claude mcp list
   claude mcp get folio-api
   
   # Check status in Claude Code
   /mcp
   ```

#### For Option 2 (Direct Execution):

1. **Install Folio CLI:**
   
   Use one of the installation methods from Option 1 above.

2. **Find Folio installation path:**
   ```bash
   # For global installation:
   which folio
   # Output: /usr/local/bin/folio (or similar)
   
   # For local development build:
   # Use absolute path to: /path/to/folio/dist/src/index.js
   ```

3. **Create Claude settings file and add direct configuration** (see Option 2 above)

4. **Restart Claude Desktop** for changes to take effect.

### Verification

1. **Test Folio API manually:**
   ```bash
   cd /path/to/your/project
   folio serve --api --port 9001
   
   # In another terminal:
   curl http://localhost:9001/api/health
   curl http://localhost:9001/api/documents
   ```

2. **Check Claude connection:**
   - Open Claude Desktop  
   - Look for MCP server connection indicators in the interface
   - Try asking: "What documentation do you have access to?"
   - Or: "Can you fetch from http://localhost:9001/api/health?"

3. **Test MCP fetch capabilities:**
   In Claude, try:
   - "Fetch http://localhost:9001/api/documents?type=adr"
   - "Get the health status from the Folio API"
   - "List all available documents"

### Troubleshooting Claude MCP

**MCP fetch server not starting:**
```bash
# Test if npx can access the MCP fetch server
npx @modelcontextprotocol/server-fetch --help

# Check if Folio API is running
curl http://localhost:9001/api/health
```

**Folio API server not starting:**
```bash
# Check if Folio is properly installed
folio --version

# For local development installations:
npx folio --version
# Or if using file: installation:
node_modules/.bin/folio --version

# Test server manually
cd /path/to/your/project
folio serve --api --port 9001
# Or for local installations:
npx folio serve --api --port 9001

# Check if port is already in use
lsof -i :9001
```

**Local development installation issues:**
```bash
# Verify the package was built correctly
ls -la /path/to/folio-cli/dist-packages/
# Should contain: folio-cli-1.0.0.tgz

# Check if the file path is correct in package.json
grep folio-cli package.json
# Should show: "folio-cli": "file:../folio-cli/dist-packages/folio-cli-1.0.0.tgz"

# Test the installation
pnpm install --save-dev file:../folio-cli/dist-packages/folio-cli-1.0.0.tgz
npx folio --version
```

**Package creation issues:**
```bash
# Ensure you're in the folio-cli repository root
cd /path/to/folio-cli

# Build the project first
npm run build
# Should complete without errors

# Create the package
npm run pack
# Should create dist-packages/folio-cli-1.0.0.tgz

# Verify the package contents
tar -tzf dist-packages/folio-cli-1.0.0.tgz | head -20
# Should show dist/, templates/, package.json, etc.

# Test the package locally
pnpm install -g ./dist-packages/folio-cli-1.0.0.tgz
folio --version
```

**Claude can't connect to MCP:**
- Verify the `settings.local.json` syntax is correct (valid JSON)
- Ensure `ALLOWED_HOSTS` matches your Folio API port
- Check that both services are running
- Restart Claude Desktop after config changes
- Look for error messages in Claude's developer console

**Permission or access errors:**
```bash
# Check if npx works
npx --version

# Verify Folio API is accessible
curl -v http://localhost:9001/api/health

# Check project directory permissions
ls -la /path/to/your/project
```

**Port conflicts:**
```bash
# Check what's using port 9001
lsof -i :9001

# Use a different port if needed
folio serve --api --port 9002

# Update Claude config accordingly:
# "ALLOWED_HOSTS": "localhost:9002"
```

**MCP fetch server issues:**
```bash
# Install the MCP fetch server globally if needed
npm install -g @modelcontextprotocol/server-fetch

# Test the server directly
npx @modelcontextprotocol/server-fetch
```

## Server Configuration

### Port Options

```bash
# Default port (3000)
folio serve --api

# Custom port
folio serve --api --port 8080

# Check what's running
lsof -i :3000
```

### Server Modes

The `folio serve` command has two modes:

**Preview Server (default):**
```bash
folio serve
# Starts web-based documentation preview with live reload
```

**Knowledge API Server:**
```bash
folio serve --api
# Starts REST API for programmatic access by AI agents
```

## API Endpoints

### Health Check

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "ok",
  "documents": 15,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Usage:**
```bash
curl http://localhost:3000/api/health
```

### Document Search

**Endpoint:** `GET /api/documents`

**Query Parameters:**
- `type` - Filter by document type (adr, ticket, epic)
- `status` - Filter by status (Proposed, Accepted, In Progress, etc.)
- `tags` - Comma-separated tags to filter by
- `q` - Natural language search query
- `limit` - Maximum number of results (default: 50)

**Examples:**
```bash
# All ADRs
curl "http://localhost:3000/api/documents?type=adr"

# Accepted security-related ADRs
curl "http://localhost:3000/api/documents?type=adr&status=Accepted&tags=security"

# Search for authentication-related documents
curl "http://localhost:3000/api/documents?q=authentication&limit=5"

# In-progress tickets
curl "http://localhost:3000/api/documents?type=ticket&status=In%20Progress"
```

**Response:**
```json
{
  "documents": [
    {
      "id": "adrs-0001-authentication-strategy",
      "filePath": "02-architecture-and-design/adrs/0001-authentication-strategy.md",
      "type": "adr",
      "status": "Accepted",
      "tags": ["security", "authentication"],
      "title": "Authentication Strategy",
      "date": "2024-01-15",
      "authors": ["jane.doe"]
    }
  ],
  "total": 1
}
```

### Individual Document

**Endpoint:** `GET /api/documents/:id`

**Usage:**
```bash
curl "http://localhost:3000/api/documents/adrs-0001-authentication-strategy"
```

**Response:**
```json
{
  "document": {
    "id": "adrs-0001-authentication-strategy",
    "filePath": "02-architecture-and-design/adrs/0001-authentication-strategy.md",
    "type": "adr",
    "status": "Accepted",
    "title": "Authentication Strategy",
    "content": "# Authentication Strategy\n\n## Status\nAccepted\n\n## Context\n...",
    "tags": ["security", "authentication"]
  }
}
```

## AI Integration

### System Prompt Generation

Generate AI-specific prompts that teach agents how to use your MCP server:

```bash
# Claude format
folio generate-prompt --provider claude

# OpenAI function calling format
folio generate-prompt --provider openai

# Gemini format
folio generate-prompt --provider gemini

# Generic API documentation
folio generate-prompt --provider generic
```

### Permission Modes

**Read-Only Mode:**
```bash
folio generate-prompt --readonly
```
- AI can search and retrieve documents
- No document creation capabilities
- Safe for code review and research tasks

**Full Access Mode:**
```bash
folio generate-prompt --include-create
```
- AI can search, retrieve, and create documents
- Enables autonomous documentation maintenance
- Requires human oversight for document approval

### Integration Workflow

1. **Start MCP Server:**
   ```bash
   folio serve --api --port 3000
   ```

2. **Generate System Prompt:**
   ```bash
   folio generate-prompt --provider claude > ai-prompt.txt
   ```

3. **Configure AI Assistant:**
   - Copy the generated prompt
   - Use as system prompt in your AI assistant

4. **Test Integration:**
   ```
   Human: "What authentication decisions have we made?"
   AI: search_documents(type="adr", tags="authentication")
   AI: "Based on your documentation, you have ADR-001: Authentication Strategy..."
   ```

## Advanced Usage

### Custom API Queries

**Complex Filtering:**
```bash
# Multiple criteria
curl "http://localhost:3000/api/documents?type=adr&status=Accepted&tags=security,database"

# Content search with type filter
curl "http://localhost:3000/api/documents?type=ticket&q=authentication&limit=10"

# Status-based queries
curl "http://localhost:3000/api/documents?status=In%20Progress"
```

**Response Analysis:**
```bash
# Count documents by type
curl -s "http://localhost:3000/api/documents" | jq '.documents | group_by(.type) | map({type: .[0].type, count: length})'

# List unique tags
curl -s "http://localhost:3000/api/documents" | jq '[.documents[].tags // []] | flatten | unique'

# Recent documents
curl -s "http://localhost:3000/api/documents?limit=50" | jq '.documents | sort_by(.date) | reverse | .[0:5]'
```

### Monitoring

**Health Monitoring:**
```bash
#!/bin/bash
# health-check.sh
response=$(curl -s http://localhost:3000/api/health)
status=$(echo $response | jq -r '.status')

if [ "$status" = "ok" ]; then
  echo "✅ MCP Server healthy"
  echo $response | jq '.documents' | echo "📊 Documents: $(cat)"
else
  echo "❌ MCP Server unhealthy"
  exit 1
fi
```

**Performance Monitoring:**
```bash
# Response time test
time curl -s http://localhost:3000/api/documents > /dev/null

# Document load test
curl -s "http://localhost:3000/api/documents?limit=1000" | jq '.total'
```

## Development Workflows

### Local Development

```bash
# Terminal 1: Start MCP server
folio serve --api --port 9001
# Or: npm run mcp

# Terminal 2: Watch for changes and restart
# (Manual restart needed when config changes)

# Terminal 3: Test API during development
curl "http://localhost:9001/api/documents?type=adr"
```

### CI/CD Integration

```yaml
# .github/workflows/test-mcp.yml
name: Test MCP Server

on: [push, pull_request]

jobs:
  test-mcp:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Folio
        run: npm install -g folio-cli
      
      - name: Start MCP Server
        run: folio serve --api --port 3000 &
        
      - name: Wait for server
        run: sleep 5
        
      - name: Test API Health
        run: |
          curl -f http://localhost:3000/api/health
          curl -f "http://localhost:3000/api/documents?limit=5"
```

## Troubleshooting

### Server Won't Start

**Check Configuration:**
```bash
folio validate
```

**Check Port Availability:**
```bash
lsof -i :3000
# Kill if needed: kill $(lsof -t -i:3000)
```

**Check Document Structure:**
```bash
folio list adr
folio list ticket
ls -la docs/_templates/
```

### No Documents Found

**Verify Document Format:**
```bash
# Check document frontmatter
head -10 docs/02-architecture-and-design/adrs/*.md

# Verify config paths match directory structure
grep -A 5 "types:" folio.config.ts
```

**Check Template Locations:**
```bash
ls -la docs/_templates/
# Should contain: adr.md, epic.md, ticket.md, etc.
```

### API Returns Empty Results

**Debug Document Loading:**
```bash
# Check server logs when starting
folio serve --api

# Look for: "ℹ️ Loaded N documents"
# If N=0, documents aren't being found
```

**Test Document Creation:**
```bash
folio new adr "Test ADR"
# Check if file appears in correct location
```

### AI Integration Issues

**Verify API is Running:**
```bash
curl http://localhost:3000/api/health
```

**Test Prompt Generation:**
```bash
folio generate-prompt --provider claude | head -20
```

**Check API Responses:**
```bash
# Test what AI should see
curl "http://localhost:3000/api/documents?type=adr&limit=5"
```

## Performance Considerations

### Optimal Usage

- **Small Projects** (< 100 docs): Instant responses
- **Medium Projects** (100-1000 docs): Sub-10ms responses
- **Large Projects** (1000+ docs): Consider pagination

### Memory Usage

- **Approximate**: 1KB per document in memory
- **1000 documents** ≈ 1MB RAM usage
- **Scaling**: Suitable for most development projects

### Query Optimization

```bash
# Fast: Metadata filtering
curl "http://localhost:3000/api/documents?type=adr&status=Accepted"

# Slower: Content search
curl "http://localhost:3000/api/documents?q=very-broad-search-term"

# Optimal: Combined filtering
curl "http://localhost:3000/api/documents?type=adr&q=specific-term"
```

## Security

### Access Control

- **Local Development**: Binds to `0.0.0.0` (accessible on network)
- **Production**: Consider firewall rules
- **Authentication**: None required (assumes trusted network)

### Content Exposure

- **All document content** accessible via API
- **No sensitive data** should be in documentation
- **Consider separate repositories** for public vs private docs

## File Organization

### Index Files Convention

Folio uses a consistent file naming convention for navigation and organization:

- **`docs/README.md`** - Root documentation index (generated by `folio generate-nav`)
- **`docs/*/README.md`** - Directory-level indexes (generated by `folio generate-nav` and updated by `folio validate`)
- **`docs/_templates/`** - Document templates for `folio new` command

The `folio init` command creates `README.md` files in each directory, and both `folio generate-nav` and `folio validate` maintain these consistently. This follows GitHub's convention where README.md files are automatically displayed when browsing directories.

## Complete Setup Summary

### Quick Setup Checklist

For the recommended HTTP MCP approach:

#### Production Setup (Published Package)
1. ✅ **Install Folio:** `pnpm install -g folio-cli`
2. ✅ **Start Folio API:** `folio serve --api --port 9001` (keep running)
3. ✅ **Add MCP server:** `claude mcp add --transport http -s project folio-api http://localhost:9001`
4. ✅ **Test connection:** `/mcp` command in Claude Code
5. ✅ **Use API resources:** Reference Folio data with @folio-api mentions
6. ✅ **Add project documentation:** Create a `CLAUDE.md` file in your project (see below)

#### Local Development Setup
1. ✅ **Build Folio:** `npm run build && npm run pack` (from folio-cli repo)
2. ✅ **Install locally:** `pnpm install --save-dev file:../folio-cli/dist-packages/folio-cli-1.0.0.tgz`
3. ✅ **Start Folio API:** `npx folio serve --api --port 9001` (keep running)
4. ✅ **Add MCP server:** `claude mcp add --transport http -s project folio-api http://localhost:9001`
5. ✅ **Test connection:** `/mcp` command in Claude Code
6. ✅ **Use API resources:** Reference Folio data with @folio-api mentions
7. ✅ **Add project documentation:** Create a `CLAUDE.md` file in your project (see below)

### What You Get

With this setup, Claude can:
- **Query your documentation:** Search ADRs, tickets, epics
- **Access project knowledge:** Understand architecture decisions and patterns  
- **Answer contextual questions:** Based on your actual project documentation
- **Assist with development:** Using your established patterns and decisions

### Example Claude Queries

Once connected, try these with Claude:
- "What ADRs do we have about authentication?"
- "Show me our current database architecture decisions"
- "What tickets are in progress?"
- "Fetch http://localhost:9001/api/documents?type=adr&status=Accepted"

## Project-Specific Setup

### Required Files

Each project using Folio with MCP needs these files:

#### 1. .mcp.json Configuration

**File:** `.mcp.json` (project root)
```json
{
  "mcpServers": {
    "folio-api": {
      "type": "http",
      "url": "http://localhost:9001"
    }
  }
}
```

This enables Claude Code to connect to your project's Folio API server.

#### 2. CLAUDE.md Documentation

Add this file to your project root to help Claude understand your Folio documentation setup:

**File:** `CLAUDE.md`
```markdown
## Folio Documentation Server

This project has a Folio Knowledge API server running on port 9001 that provides access to project documentation.

### Available Endpoints

- **Health Check**: `GET http://localhost:9001/api/health`
- **All Documents**: `GET http://localhost:9001/api/documents`
- **Specific Document**: `GET http://localhost:9001/api/documents/:id`

### Example Queries

- `http://localhost:9001/api/documents?type=adr` - Get ADRs (Architecture Decision Records)
- `http://localhost:9001/api/documents?status=approved&limit=10` - Get approved documents
- `http://localhost:9001/api/documents?q=authentication` - Search for authentication-related docs

### Usage with Claude Code

The project connects to Folio via HTTP MCP server. You can:

- **Reference API endpoints** using @ mentions: `@folio-api:/api/documents`
- **Access Folio data** directly through Claude Code's MCP integration
- **Query documentation** using HTTP requests to the Folio API

### Example Usage in Claude Code

Using @ mentions to reference Folio resources:
```
@folio-api:/api/health
@folio-api:/api/documents?type=adr
@folio-api:/api/documents?q=authentication
@folio-api:/api/documents/adr-001
```

Natural language requests:
- "Can you fetch the health status from @folio-api:/api/health?"
- "Show me all ADRs: @folio-api:/api/documents?type=adr"
- "Find authentication docs: @folio-api:/api/documents?q=authentication"

### Recommended Workflow

1. Check server health: `@folio-api:/api/health`
2. Search for features: `@folio-api:/api/documents?q=[feature_name]`
3. Find ADRs by topic: `@folio-api:/api/documents?type=adr&q=[topic]`
4. Get specific documents: `@folio-api:/api/documents/[document-id]`

The server loads 45+ documents from the `docs/` directory and provides searchable access to all project knowledge.
```

### Benefits of CLAUDE.md

Adding this file to your project:
- **Educates Claude** about your specific Folio setup
- **Provides query examples** for your documentation
- **Establishes workflow patterns** for development
- **Documents your MCP configuration** for team members

### Customization Tips

Adapt the template for your project:
- Update the document count (e.g., "45+ documents")
- Add project-specific endpoint examples
- Include your actual document types beyond ADRs
- Mention specific architectural patterns or conventions
- Add team-specific workflow recommendations

## See Also

- [AI Integration Overview](../ai-integration/README.md) - Complete AI integration guide
- [Knowledge API Reference](../ai-integration/knowledge-api.md) - Detailed API documentation
- [AI System Prompts](../ai-integration/ai-prompts.md) - Prompt generation guide
- [Workflow Examples](../ai-integration/workflows.md) - Real-world usage patterns
- [folio serve command](../03-command-reference/serve.md) - Command reference