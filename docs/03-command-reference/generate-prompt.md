# folio generate-prompt

Generate AI system prompts that teach AI assistants how to effectively interact with your project's knowledge base through the Folio Knowledge API.

## Synopsis

```bash
folio generate-prompt [options]
```

## Description

The `generate-prompt` command analyzes your project documentation and creates sophisticated system prompts that enable AI assistants to:

- Query your project's structured documentation
- Search for relevant architectural decisions, tickets, and planning documents
- Follow your project's established patterns and constraints
- Create new documentation when architectural decisions are missing

The generated prompts are tailored to different AI providers and include intelligent tool definitions for the Knowledge API.

## Options

### Provider Selection

| Option | Description | Default |
|--------|-------------|---------|
| `--provider <provider>` | Target AI provider format | `claude` |

**Supported Providers:**
- `claude` - Anthropic Claude format with tool descriptions
- `openai` - OpenAI ChatGPT format with JSON function definitions  
- `gemini` - Google Gemini format with structured tools
- `generic` - Universal API documentation format

### Permission Modes

| Option | Description | Default |
|--------|-------------|---------|
| `--readonly` | Generate read-only prompt (search and retrieve only) | `false` |
| `--include-create` | Include document creation capabilities | `true` |

### Configuration

| Option | Description | Default |
|--------|-------------|---------|
| `--port <number>` | API server port to reference in prompt | `3000` |
| `-o, --output <file>` | Write prompt to file instead of stdout | - |

## Examples

### Basic Usage

```bash
# Generate prompt for Claude (default)
folio generate-prompt

# Generate for different AI providers
folio generate-prompt --provider openai
folio generate-prompt --provider gemini
folio generate-prompt --provider generic
```

### Permission Control

```bash
# Read-only prompt (no document creation)
folio generate-prompt --readonly

# Full access with document creation
folio generate-prompt --include-create
```

### File Output

```bash
# Save prompt for reuse
folio generate-prompt --provider claude -o claude-setup.txt

# Generate different versions
folio generate-prompt --readonly -o readonly-prompt.txt
folio generate-prompt --include-create -o full-access-prompt.txt
```

### Custom Configuration

```bash
# Reference custom API port
folio generate-prompt --port 3001

# Multiple options
folio generate-prompt --provider openai --readonly --port 8080 -o openai-readonly.txt
```

## Output Format

The generated prompt includes several key sections:

### Project Analysis
```
**PROJECT KNOWLEDGE OVERVIEW:**
- **adr** (12 documents)
- **ticket** (28 documents)
- **epic** (2 documents)
```

### Tool Definitions
Provider-specific format for API interaction tools:

**Claude Format:**
```
**AVAILABLE TOOLS:**

- **search_documents**: Search and filter project documents...
  Parameters: type, status, tags, q, limit

**EXAMPLE USAGE:**
search_documents(type="adr", status="Accepted")
```

**OpenAI Format:**
```
**AVAILABLE FUNCTIONS:**

```json
[
  {
    "name": "search_documents",
    "description": "Search and filter project documents...",
    "parameters": {
      "type": "object",
      "properties": { ... }
    }
  }
]
```

### Workflow Guidance
```
**YOUR REASONING PROCESS:**

1. **Understand the Request**
2. **Research First** - Use tools to search existing knowledge
3. **Synthesize Information** - Identify patterns and gaps
4. **Propose When Needed** - Create documentation for missing decisions
5. **Implement Thoughtfully** - Follow documented patterns
```

### Usage Examples
```
**WORKFLOW EXAMPLES:**

1. **Implementing a new feature:**
   - Search for related ADRs: `search_documents(type="adr", q="feature name")`
   - Check for existing tickets: `search_documents(type="ticket", q="feature name")`

2. **Bug investigation:**
   - Search for related docs: `search_documents(q="bug area")`
   - Look for similar past issues: `search_documents(type="ticket", status="Done")`
```

## Prerequisites

### Knowledge API Server

The generated prompt references the Folio Knowledge API. Start it before using the prompt:

```bash
# Start API server (referenced in prompt)
folio serve --api --port 3000
```

### Project Structure

Ensure your project has proper Folio configuration:

```bash
# Validate configuration
folio validate

# Verify documents are discoverable
curl http://localhost:3000/api/health
```

## Integration Workflow

### 1. Start Knowledge API
```bash
folio serve --api --port 3000
```

### 2. Generate System Prompt
```bash
folio generate-prompt --provider claude > ai-setup.txt
```

### 3. Configure AI Assistant
Copy the generated prompt and use it as the system prompt in your AI assistant.

### 4. Test Integration
**You:** "What authentication decisions have we made?"

**AI:** *(Uses the tools)* `search_documents(type="adr", tags="authentication", status="Accepted")`

**AI:** "Based on your documentation, you've made these authentication decisions: ..."

## Project Analysis

The command automatically analyzes your project to generate context-aware prompts:

### Document Discovery
- Scans all Markdown files in your documentation directory
- Identifies document types from frontmatter
- Counts documents by type and status
- Extracts common tags and patterns

### Smart Adaptations
- **Document Types**: Only includes types that exist in your project
- **Status Values**: Uses actual status values from your documents  
- **Common Tags**: Highlights frequently used tags for better search
- **Project Context**: Includes real document counts and statistics

### Provider Optimization
- **Claude**: Emphasizes natural language tool descriptions
- **OpenAI**: Provides strict JSON schema for function calling
- **Gemini**: Uses Google's preferred tool specification format
- **Generic**: Plain API documentation for any system

## Best Practices

### Prompt Management
- **Version control** generated prompts alongside your code
- **Regenerate** when project structure changes significantly
- **Test** with different AI providers to find best fit
- **Backup** working prompt configurations

### Security Considerations
- **Review** readonly vs full-access permissions carefully
- **Monitor** AI document creation in full-access mode
- **Establish** approval workflows for AI-generated content
- **Validate** AI understanding before granting creation rights

### Performance
- **Use readonly mode** for better AI response times
- **Limit** broad content searches in large projects
- **Prefer** metadata filtering over content search when possible
- **Monitor** API performance with large document sets

## Related Commands

- [`folio serve`](./serve.md) - Start the Knowledge API server
- [`folio validate`](./validate.md) - Verify project configuration
- [`folio list`](./list.md) - Understand your document structure

## See Also

- [AI Integration Overview](../ai-integration/) - Complete AI integration guide
- [Knowledge API Reference](../ai-integration/knowledge-api.md) - API endpoint documentation
- [Workflow Examples](../ai-integration/workflows.md) - Real-world usage patterns
- [Troubleshooting](../ai-integration/troubleshooting.md) - Common issues and solutions