---

# Folio CLI (`folio-cli`)

[![npm version](https://badge.fury.io/js/folio-cli.svg)](https://badge.fury.io/js/folio-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

**Folio is a modern, TypeScript-based command-line interface for managing structured Markdown documentation.** It's a powerful alternative to `adr-tools`, designed to handle not just Architecture Decision Records (ADRs), but your entire documentation suite including **sprints**, **epics**, **tickets**, and more.

Turn your `docs/` folder from a collection of text files into a verifiable, interconnected, and maintainable knowledge base.

---

## The Problem

Your project documentation—ADRs, sprint plans, product specs—is as critical as your code. But keeping it consistent and up-to-date is a manual, error-prone chore.

-   Are all documents correctly formatted?
-   Do they all have the required front matter (e.g., `status`, `owner`)?
-   Are your sprint plans manually updated with links to tickets?
-   Is there an easy way to see all "proposed" ADRs or all tickets in the current sprint?

## The Solution

Folio solves these problems by treating your documentation as a structured dataset. It provides a set of simple, powerful commands to scaffold, create, validate, and query your Markdown files based on a central configuration you define.

-   **Standardize Everything:** Use one `folio.config.ts` to define schemas for all your document types.
-   **Scaffold Instantly:** Run `folio init` to generate a comprehensive, best-practice documentation structure.
-   **Never Forget Front Matter:** `folio new adr "..."` creates a new file from your template, pre-filled with a unique ID, date, status, and title.
-   **Automate Indexes:** Folio automatically creates and updates `index.md` files, giving you at-a-glance tables of your documents.
-   **Validate with Confidence:** Run `folio validate` to ensure every document in your project conforms to your schema—perfect for CI/CD checks.
-   **Query Your Docs:** Quickly find what you need with `folio list tickets --status="In Progress"`.

## Installation

The recommended approach is to install Folio as a local development dependency in your project. This ensures your entire team uses the same version and enables type-checking for your configuration file.

```bash
# Using npm
npm install --save-dev folio-cli

# Using yarn
yarn add --dev folio-cli
```

You can then run Folio via npm scripts in your `package.json` or by using `npx folio`.

## Getting Started

**1. Initialize Your Project**

Navigate to the root of your repository and run the `init` command.

```bash
npx folio init
```

This will:
-   Create a `folio.config.ts` file for you to define your document types.
-   Generate a best-practice `docs/` directory structure.
-   Create a `templates/` directory with pre-built, high-quality templates for ADRs, epics, tickets, and sprints.

**2. Configure Your Document Types**

Open `folio.config.ts` and customize it to your needs. Define the paths, templates, and front matter schemas for each type of document you want to manage.

```typescript
// folio.config.ts
import { defineConfig } from 'folio-cli';

export default defineConfig({
  root: 'docs',
  types: {
    adr: {
      path: '02-architecture-and-design/adrs',
      template: 'adr.md',
      frontmatter: {
        id: { type: 'number', unique: true },
        title: { type: 'string', required: true },
        status: { type: 'string', enum: ['Proposed', 'Accepted', 'Rejected'] },
        // ... more fields
      },
    },
    // ... define your other types like 'ticket', 'sprint', etc.
  },
  // ...
});
```

**3. Create a New Document**

Use the `new` command to create a document from a template. Folio handles the filename, ID, and basic front matter automatically.

```bash
# Create a new Architecture Decision Record
npx folio new adr "Adopt Vitest for Unit Testing"

# Create a new ticket for a sprint
npx folio new ticket "Setup login page UI" --sprint="2024.04"
```

## Core Commands

| Command                                        | Description                                                                                                   |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `folio init`                                   | Initializes a new project with a `folio.config.ts` and standard doc structure.                                |
| `folio new <type> <title> [options]`           | Creates a new document from a template, populating front matter and updating the index.                       |
| `folio list <type> [options]`                  | Lists documents of a specific type, with powerful filtering based on front matter fields.                     |
| `folio status <type> <id> <new-status>`        | Quickly updates the `status` of a specific document (e.g., moves an ADR from `Proposed` to `Accepted`).         |
| `folio validate [type]`                        | Validates all documents (or a specific type) against your schemas. Exits with an error code on failure.       |
| `folio serve [options]`                        | Starts a local live-reloading server to preview your documentation in the browser.                            |
| `folio sprint sync <sprint_id>`                | *(Coming Soon)* Automatically updates a sprint plan with a list of all tickets assigned to it.                    |

## Why Markdown?

By keeping your documentation in version-controlled Markdown files, you get:
-   **Powerful Diffing:** Review changes to documentation just like you review code changes—in pull requests.
-   **Offline Access:** Your entire knowledge base is available locally.
-   **Tool Agnostic:** Markdown is a universal standard. Your docs can be rendered by GitHub, VS Code, static site generators (Vitepress, Docusaurus), and countless other tools.
-   **No Vendor Lock-in:** You own your data, forever.

Folio embraces this philosophy by adding a layer of structure and automation on top of the simple, powerful foundation of Markdown.

## License

This project is licensed under the MIT License.
