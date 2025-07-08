# Welcome to Folio

**Folio is a modern, TypeScript-based command-line interface for managing structured Markdown documentation.** It empowers you to treat your project's knowledge base—ADRs, sprint plans, product specs—with the same rigor and automation as your source code.

This documentation will guide you through installing, configuring, and mastering Folio to build a verifiable and maintainable documentation suite.

## Core Philosophy

1.  **Docs as Code:** Your documentation should live in your repository, be version-controlled, and reviewed in pull requests.
2.  **Structure is King:** By defining schemas for your documents, you turn them from simple text into a queryable dataset.
3.  **Automation over Manual Effort:** Creating files, updating indexes, and validating content should be fast, easy, and automated.
4.  **AI-Native Design:** Your documentation becomes a programmable knowledge base that AI agents can query, understand, and contribute to.
5.  **No Vendor Lock-in:** Folio works with standard Markdown files. You own your data, and it remains readable and portable with or without our tool.

## Where to Start?

-   **New to Folio?** Start with [**Installation**](./01-getting-started/01-installation.md), then follow the [**Quick Start**](./01-getting-started/02-quick-start.md) tutorial.
-   **Want AI integration?** See the [**AI Integration Guide**](./ai-integration/README.md) to make your docs AI-accessible.
-   **Want to configure the tool?** Read the deep dive on [**The Folio Config**](./02-core-concepts/01-the-folio-config.md).
-   **Looking for a specific command?** Jump to the [**Command Reference**](./03-command-reference/init.md).
-   **Need help with workflows?** Check out the [**Advanced Guides**](./04-advanced-guides/02-ci-cd-integration.md).
-   **Having issues?** See the [**FAQ**](./05-troubleshooting/faq.md) for common solutions.

## Documentation Structure

### 📚 Getting Started
- [Installation](./01-getting-started/01-installation.md) - Setup and installation guide
- [Quick Start](./01-getting-started/02-quick-start.md) - 5-minute tutorial

### 🧠 Core Concepts
- [The Folio Config](./02-core-concepts/01-the-folio-config.md) - Configuration deep dive
- [Templates](./02-core-concepts/02-templates.md) - Document templates and Handlebars
- [Indexing and Linking](./02-core-concepts/03-indexing-and-linking.md) - Navigation and cross-references

### 📖 Command Reference
- [folio init](./03-command-reference/init.md) - Initialize project structure
- [folio new](./03-command-reference/new.md) - Create new documents
- [folio validate](./03-command-reference/validate.md) - Validate documentation
- [folio list](./03-command-reference/list.md) - List and filter documents
- [folio status](./03-command-reference/status.md) - Update document status
- [folio find](./03-command-reference/find.md) - Search documents
- [folio generate-nav](./03-command-reference/generate-nav.md) - Generate LLM navigation
- [folio generate-prompt](./03-command-reference/generate-prompt.md) - Generate AI system prompts
- [folio serve](./03-command-reference/serve.md) - Development server & Knowledge API
- [folio adr](./03-command-reference/adr.md) - ADR lifecycle management

### 🚀 Advanced Guides
- [ADR Workflows](./04-advanced-guides/01-adr-workflows.md) - Architecture decision processes
- [CI/CD Integration](./04-advanced-guides/02-ci-cd-integration.md) - Automate with GitHub Actions
- [LLM Navigation](./04-advanced-guides/03-llm-navigation.md) - Optimize for AI assistants
- [MCP Server Setup](./04-advanced-guides/04-mcp-server-setup.md) - Knowledge API for AI agents

### 🛠️ Troubleshooting
- [FAQ](./05-troubleshooting/faq.md) - Common questions and solutions

### 🤖 AI Integration
- [AI Integration Overview](./ai-integration/README.md) - Transform docs into AI-accessible knowledge
- [Knowledge API](./ai-integration/knowledge-api.md) - REST API for programmatic access
- [AI System Prompts](./ai-integration/ai-prompts.md) - Generate prompts for AI assistants
- [Workflow Examples](./ai-integration/workflows.md) - Real-world AI integration patterns
- [Troubleshooting](./ai-integration/troubleshooting.md) - Common AI integration issues

### 💡 Examples
- [Template Examples](./06-examples/template-examples.md) - Sample templates and configurations
