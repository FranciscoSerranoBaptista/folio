# AI Integration with Folio

Folio provides native AI integration through its **Knowledge API** and **AI System Prompts**, transforming your documentation into a programmable knowledge base that AI agents can query, understand, and contribute to.

## Overview

The AI integration consists of two main components:

1. **Folio Knowledge API** - A REST API that serves your project's structured documentation
2. **AI System Prompts** - Generated prompts that teach AI agents how to use the Knowledge API effectively

This turns your Folio project into an **AI-native development environment** where AI agents can:
- Research existing architectural decisions before coding
- Search for relevant tickets, epics, and documentation  
- Create new documentation when decisions are missing
- Follow established project patterns and constraints

## Quick Start

### 1. Start the Knowledge API

```bash
# Start the API server
folio serve --api --port 3000

# API will be available at http://localhost:3000
```

### 2. Generate AI System Prompt

```bash
# Generate a prompt for Claude
folio generate-prompt --provider claude

# Generate a read-only prompt for OpenAI
folio generate-prompt --provider openai --readonly

# Save prompt to file
folio generate-prompt --provider claude -o ai-setup.txt
```

### 3. Set Up Your AI Assistant

1. Copy the generated system prompt
2. Paste it into your AI assistant (Claude, ChatGPT, etc.)
3. The AI can now query your project knowledge!

## Example AI Workflow

Once set up, an AI agent can work like this:

**Human:** "Implement two-factor authentication for our login system"

**AI Agent:**
1. **Research**: `search_documents(type="adr", q="authentication", status="Accepted")`
2. **Discover Gap**: No 2FA architectural decision exists
3. **Propose**: Creates ADR draft using `create_document(type="adr", ...)`
4. **Seek Approval**: "I've drafted ADR-006 for 2FA. Please review before I implement."
5. **Implement**: Writes code following documented patterns

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Folio Docs    │    │  Knowledge API   │    │   AI Assistant  │
│                 │    │                  │    │                 │
│ ├─ ADRs         │───▶│ GET /api/docs    │◀───│ search_docs()   │
│ ├─ Tickets      │    │ GET /api/docs/:id│    │ get_doc_by_id() │
│ ├─ Epics        │    │ POST /api/docs   │    │ create_doc()    │
│ └─ ...          │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

The Knowledge API acts as the bridge between your human-readable documentation and machine-queryable knowledge.

## Core Concepts

### Knowledge API
- **In-memory document store** for fast querying
- **Metadata filtering** by type, status, tags
- **Content search** with natural language queries
- **RESTful interface** for easy integration

### AI System Prompts
- **Provider-specific formatting** (Claude, OpenAI, Gemini)
- **Tool definitions** that teach AI how to query the API
- **Workflow guidance** for research → synthesize → implement
- **Permission control** (read-only vs read-write)

### Project Analysis
- **Auto-discovery** of document types and patterns
- **Smart tool generation** based on your specific project
- **Context-aware prompts** with real project statistics

## Benefits

### For Developers
- **Reduced context switching** - AI handles research automatically
- **Consistent patterns** - AI follows documented decisions
- **Living documentation** - AI can create and update docs
- **Faster onboarding** - New team members get AI-assisted guidance

### For AI Agents
- **Structured knowledge access** - No more blind file searching
- **Project-specific intelligence** - Understands your architecture
- **Autonomous operation** - Can work independently with guidance
- **Knowledge contribution** - Can maintain and evolve documentation

### For Teams
- **AI-native workflow** - Documentation designed for both humans and AI
- **Knowledge preservation** - Decisions and context are queryable
- **Scalable expertise** - AI agents act as knowledgeable team members
- **Consistent quality** - AI follows established patterns

## Next Steps

- [Knowledge API Reference](./knowledge-api.md) - Complete API documentation
- [AI Prompt Guide](./ai-prompts.md) - System prompt generation and customization
- [Workflow Examples](./workflows.md) - Real-world AI integration patterns
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions

---

**Folio: The first documentation tool designed for AI collaboration.** 🤖✨