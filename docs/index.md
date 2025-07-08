# Welcome to Folio

**Folio is a modern, TypeScript-based command-line interface for managing structured Markdown documentation.** It empowers you to treat your project's knowledge base—ADRs, sprint plans, product specs—with the same rigor and automation as your source code.

This documentation will guide you through installing, configuring, and mastering Folio to build a verifiable and maintainable documentation suite.

## Core Philosophy

1.  **Docs as Code:** Your documentation should live in your repository, be version-controlled, and reviewed in pull requests.
2.  **Structure is King:** By defining schemas for your documents, you turn them from simple text into a queryable dataset.
3.  **Automation over Manual Effort:** Creating files, updating indexes, and validating content should be fast, easy, and automated.
4.  **No Vendor Lock-in:** Folio works with standard Markdown files. You own your data, and it remains readable and portable with or without our tool.

## Where to Start?

-   **New to Folio?** Start with [**Installation**](./01-getting-started/01-installation.md), then follow the [**Quick Start**](./01-getting-started/02-quick-start.md) tutorial.
-   **Want to configure the tool?** Read the deep dive on [**The Folio Config**](./02-core-concepts/01-the-folio-config.md).
-   **Looking for a specific command?** Jump to the [**Command Reference**](./03-command-reference/init.md).
-   **Need help with workflows?** Check out the [**Advanced Guides**](./04-advanced-guides/ci-cd-integration.md).
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
- [folio serve](./03-command-reference/serve.md) - Development server
- [folio adr](./03-command-reference/adr.md) - ADR lifecycle management

### 🚀 Advanced Guides
- [CI/CD Integration](./04-advanced-guides/02-ci-cd-integration.md) - Automate with GitHub Actions
- [LLM Navigation](./04-advanced-guides/03-llm-navigation.md) - Optimize for AI assistants
- [ADR Workflows](./04-advanced-guides/01-adr-workflows.md) - Architecture decision processes

### 🛠️ Troubleshooting
- [FAQ](./05-troubleshooting/faq.md) - Common questions and solutions

### 💡 Examples
- [Template Examples](./06-examples/template-examples.md) - Sample templates and configurations
