// folio.config.ts
// Note: After running 'npm install --save-dev folio-cli', you can import defineConfig for better type safety:
// import { defineConfig } from "folio-cli";

// We can define the generic schema once and reuse it for multiple document types.
const genericDocFrontmatter = {
  title: { type: "string", required: true },
  description: { type: "string", required: true },
  date: { type: "date" },
  authors: { type: "string", isArray: true },
  category: {
    type: "string",
    required: true,
    enum: [
      "vision-strategy",
      "product-planning",
      "architecture-design",
      "engineering",
      "devops-infrastructure",
      "operations-support",
    ] as const, // 'as const' provides stricter type checking
  },
  tags: { type: "string", isArray: true },
  status: {
    type: "string",
    default: "draft",
    enum: ["draft", "review", "final"] as const,
  },
  related_adrs: {
    type: "string",
    isArray: true,
    pattern: /^ADR-[0-9]{3}/,
  },
  related_docs: { type: "string", isArray: true },
  version: {
    type: "string",
    pattern: /^[0-9]+\.[0-9]+(\.[0-9]+)?$/,
  },
};

// Main configuration export
export default {
  root: "docs",

  indexing: {
    columns: ["id", "title", "status", "sprint"], // Default columns for tables
    format: "table",
  },

  types: {
    // --- Document types using the generic schema ---

    vision: {
      path: "01-vision-strategy",
      template: "generic-doc.md",
      frontmatter: genericDocFrontmatter,
    },

    architecture: {
      path: "02-architecture-design",
      template: "generic-doc.md",
      frontmatter: genericDocFrontmatter,
    },

    // --- The Epic type ---
    epic: {
      path: "01-product-and-planning/epics",
      template: "epic.md",
      frontmatter: {
        id: {
          type: "string",
          required: true,
          unique: true,
          pattern: /^EPIC-\d{3,}$/, // e.g., EPIC-001
        },
        title: { type: "string", required: true, minLength: 5 },
        status: {
          type: "string",
          required: true,
          default: "To Do",
          enum: ["To Do", "In Progress", "Done", "On Hold"] as const,
        },
        owner: { type: "string", required: true },
        team: { type: "string" },
        target_release: { type: "string" },
        strategic_goals: { type: "string", isArray: true },
        related_adrs: { type: "string", isArray: true },
        sprints: { type: "string", isArray: true },
      },
    },

    // --- The Ticket type, based on your ticket-frontmatter.schema.yaml ---
    ticket: {
      path: "06-sprint-tickets",
      template: "ticket.md",
      frontmatter: {
        id: {
          type: "string",
          required: true,
          unique: true,
          pattern: /^[A-Z]{2,}-\d{3,}$/, // e.g., BE-001, FE-102
        },
        title: { type: "string", required: true, minLength: 10 },
        sprint: { type: "string" },
        epic: { type: "string", pattern: /^EPIC-\d{3,}$/ },
        status: {
          type: "string",
          required: true,
          default: "To Do",
          enum: ["To Do", "In Progress", "Review", "Blocked", "Done"] as const,
        },
        owner: { type: "string" }, // Engineer's name/handle
        estimate: { type: "number" }, // Could also be a string for t-shirt sizes
        depends_on: { type: "string", isArray: true },
        source_spec: { type: "string" },
      },
    },

    // --- The Sprint type, storing sprint plans in their own subdir ---
    sprint: {
      path: "06-sprint-tickets/sprints", // Storing sprint plans in their own subdir
      template: "sprint.md",
      frontmatter: {
        id: {
          type: "string",
          required: true,
          unique: true,
          pattern: /^\d{4}\.\d{2}$/, // e.g., 2024.03
        },
        title: { type: "string", required: true },
        status: {
          type: "string",
          required: true,
          default: "Planning",
          enum: ["Planning", "Active", "Completed", "Canceled"] as const,
        },
        start_date: {
          type: "date",
          required: true,
          default: () => new Date().toISOString().split("T")[0],
        },
        end_date: { type: "date", required: true },
        epic_focus: { type: "string", pattern: /^EPIC-\d{3,}$/ },
        total_points_committed: { type: "number", default: 0 },
        points_completed: { type: "number", default: 0 },
      },
    },

    // --- A classic ADR type ---
    // This is a more traditional ADR setup to complement your other docs
    adr: {
      path: "02-architecture-and-design/adrs",
      template: "adr.md",
      frontmatter: {
        id: { type: "number", unique: true, required: true },
        title: { type: "string", required: true, minLength: 10 },
        status: {
          type: "string",
          required: true,
          default: "Proposed",
          enum: [
            "Proposed",
            "Accepted",
            "Rejected",
            "Deprecated",
            "Superseded",
          ] as const,
        },
        date: {
          type: "date",
          required: true,
          default: () => new Date().toISOString().split("T")[0],
        },
        authors: { type: "string", isArray: true, required: true },
        reviewers: { type: "string", isArray: true },
        tags: { type: "string", isArray: true },
        related_requirements: { type: "string", isArray: true },
        supersedes: { type: "number" },
        review_date: { type: "date" },
      },
    },
  },
};
