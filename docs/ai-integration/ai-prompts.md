# AI System Prompts

Folio generates intelligent system prompts that teach AI agents how to effectively query and interact with your project's knowledge base through the Knowledge API.

## Overview

The `folio generate-prompt` command creates sophisticated system prompts that:

- **Analyze your project** to understand document types, statuses, and common tags
- **Generate provider-specific formats** for different AI assistants
- **Include intelligent tool definitions** that teach proper API usage
- **Provide workflow guidance** for research-driven development

## Quick Start

### Generate Basic Prompt

```bash
# Generate prompt for Claude (default)
folio generate-prompt

# Generate for specific AI provider  
folio generate-prompt --provider openai
folio generate-prompt --provider gemini
folio generate-prompt --provider generic
```

### Save to File

```bash
# Save prompt for reuse
folio generate-prompt --provider claude -o claude-setup.txt

# Generate different permission levels
folio generate-prompt --readonly -o readonly-prompt.txt
folio generate-prompt --include-create -o full-access-prompt.txt
```

## Command Options

### Provider Formats

| Provider | Description | Format |
|----------|-------------|---------|
| `claude` | Anthropic Claude format | Tool descriptions with example usage |
| `openai` | OpenAI ChatGPT format | JSON function definitions |
| `gemini` | Google Gemini format | Structured tool specifications |
| `generic` | Universal format | Plain API endpoint documentation |

### Permission Modes

| Flag | Description | Capabilities |
|------|-------------|--------------|
| `--readonly` | Read-only access | Search and retrieve documents only |
| `--include-create` | Full access (default) | Search, retrieve, and create documents |

### Additional Options

| Option | Description | Example |
|--------|-------------|---------|
| `--port <number>` | API server port reference | `--port 3001` |
| `-o, --output <file>` | Save to file | `-o ai-setup.txt` |

## Project Analysis

The prompt generator automatically analyzes your project to create context-aware prompts:

### Document Discovery

```bash
# Example analysis output
ℹ️ Generating AI system prompt...

# The prompt will include:
# - Document types found: adr, ticket, epic
# - Total document count: 42 documents  
# - Common tags: security, backend, frontend, database
# - Status values: Proposed, Accepted, In Progress, Done
```

### Generated Context

The prompt includes project-specific information:

```
**PROJECT KNOWLEDGE OVERVIEW:**
- **adr** (12 documents)
- **ticket** (28 documents) 
- **epic** (2 documents)

Available document types: adr, ticket, epic
Common tags: security, authentication, backend, api, frontend
```

## AI Provider Formats

### Claude Format

Optimized for Anthropic's Claude with clear tool descriptions:

```
**AVAILABLE TOOLS:**

- **search_documents**: Search and filter project documents...
  Parameters: type: Filter by document type, status: Filter by status...

**EXAMPLE USAGE:**
To search for authentication-related ADRs:
`search_documents(type="adr", tags="authentication", status="Accepted")`
```

### OpenAI Format

JSON function definitions for ChatGPT function calling:

```
**AVAILABLE FUNCTIONS:**

```json
[
  {
    "name": "search_documents",
    "description": "Search and filter project documents...",
    "parameters": {
      "type": "object",
      "properties": {
        "type": { "type": "string", "enum": ["adr", "ticket"] },
        "status": { "type": "string", "enum": ["Accepted", "In Progress"] }
      }
    }
  }
]
```

### Gemini Format

Structured tool specifications for Google's Gemini:

```
**AVAILABLE TOOLS:**

{JSON tool definitions optimized for Gemini's function calling format}
```

### Generic Format

Universal API documentation for any AI system:

```
**AVAILABLE API ENDPOINTS:**

GET /api/documents
- Parameters: type, status, tags, q, limit
- Description: Search and filter documents

POST /api/documents  
- Body: { type, title, content, frontmatter }
- Description: Create new document
```

## Permission Modes

### Read-Only Mode

Perfect for AI assistants that should only research existing knowledge:

```bash
folio generate-prompt --readonly
```

**Capabilities:**
- ✅ Search documents by type, status, tags
- ✅ Retrieve full document content
- ✅ Perform natural language searches
- ❌ Create new documents
- ❌ Modify existing documents

**Use Cases:**
- Code review assistance
- Documentation lookup
- Research and analysis
- Onboarding support

### Full Access Mode

For AI agents that can contribute to project knowledge:

```bash
folio generate-prompt --include-create
```

**Capabilities:**
- ✅ All read-only capabilities
- ✅ Create new ADRs when decisions are missing
- ✅ Draft tickets for new requirements
- ✅ Maintain project documentation

**Use Cases:**
- Feature development with AI
- Autonomous architectural decision making
- AI pair programming
- Documentation maintenance

## Workflow Guidance

Every generated prompt includes comprehensive workflow guidance:

### Research-First Approach

```
**YOUR REASONING PROCESS:**

1. **Understand the Request:** Clarify what the user wants to accomplish.

2. **Research First:** Before writing any code, use the available tools:
   - Look for existing architectural decisions (ADRs)
   - Find relevant epics, tickets, or planning documents
   - Understand existing patterns and constraints

3. **Synthesize Information:** Review what you've found and identify:
   - Existing decisions that guide your implementation
   - Gaps in documentation or missing architectural decisions
   - Conflicts between different documents
```

### Implementation Examples

The prompt includes real-world workflow examples:

```
**WORKFLOW EXAMPLES:**

1. **Implementing a new feature:**
   - Search for related ADRs: `search_documents(type="adr", q="feature name")`
   - Check for existing tickets: `search_documents(type="ticket", q="feature name")`
   - Review architectural constraints before coding

2. **Bug investigation:**
   - Search for related documentation: `search_documents(q="bug area OR component")`
   - Look for existing tickets: `search_documents(type="ticket", status="Done", q="similar bug")`

3. **Architectural decisions:**
   - Search existing ADRs: `search_documents(type="adr", status="Accepted")`
   - Create new ADR if needed: `create_document(type="adr", ...)`
```

## Customization

### Project-Specific Adaptations

The generator automatically adapts to your project:

```typescript
// If your project has custom document types
export default {
  types: {
    rfc: { path: "rfcs", /* ... */ },
    postmortem: { path: "postmortems", /* ... */ }
  }
}

// The generated prompt will include:
// Available document types: adr, rfc, postmortem
```

### API Server Configuration

Reference custom API configurations:

```bash
# Generate prompt for custom port
folio generate-prompt --port 8080

# The prompt will reference:
# http://localhost:8080/api/documents
```

## Integration Workflow

### 1. Start Knowledge API

```bash
folio serve --api --port 3000
```

### 2. Generate Prompt

```bash
folio generate-prompt --provider claude > ai-setup.txt
```

### 3. Configure AI Assistant

Copy the generated prompt and paste it as the system prompt in your AI assistant.

### 4. Verify Setup

Test the integration:

**You:** "What authentication decisions have we made?"

**AI:** *(Queries the API)* `search_documents(type="adr", tags="authentication", status="Accepted")`

**AI:** "Based on your project documentation, you've made the following authentication decisions: ..."

## Best Practices

### Prompt Management

- **Version control** your generated prompts alongside code
- **Regenerate prompts** when project structure changes
- **Test prompts** with different AI providers
- **Keep backups** of working prompt configurations

### AI Training

- **Start with readonly** to build trust and understanding
- **Gradually enable** document creation capabilities
- **Review AI-generated** documentation before merging
- **Establish conventions** for AI-created content

### Monitoring

- **Monitor API usage** through health checks
- **Review AI queries** to understand usage patterns
- **Track documentation quality** when AI contributes
- **Maintain human oversight** on architectural decisions

## Troubleshooting

### Common Issues

**Prompt too long for AI provider:**
```bash
# Generate shorter, focused prompts
folio generate-prompt --readonly --provider openai
```

**AI not finding documents:**
- Verify Knowledge API is running: `curl http://localhost:3000/api/health`
- Check document count in API response
- Ensure documents have proper frontmatter

**AI creating invalid documents:**
- Review project templates and patterns
- Provide example documents in the prompt
- Use readonly mode initially

### Validation

Test your setup with these queries:

```bash
# Verify API is accessible
curl "http://localhost:3000/api/health"

# Test document search
curl "http://localhost:3000/api/documents?limit=5"

# Validate prompt generation
folio generate-prompt --provider claude | head -20
```

---

**Next:** [Workflow Examples](./workflows.md) - See real-world AI integration patterns