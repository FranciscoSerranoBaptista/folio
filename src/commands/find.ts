/**
 * @file Contains the logic for the `folio find` command.
 * This command quickly finds documents by ID, title, or other criteria.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { Command } from "commander";
import matter from "gray-matter";
import { loadConfig } from "../utils/config-loader";
import type { FolioConfig } from "../types/folio";
import log from "../utils/logging";

interface SearchResult {
  filename: string;
  filepath: string;
  relativePath: string;
  frontmatter: { [key: string]: any };
  title: string;
  id?: string;
  type: string;
  matchReason: string;
}

/**
 * Recursively searches for documents matching the query
 */
async function searchDocuments(
  query: string,
  searchType: "id" | "title" | "content" | "any",
  docsRoot: string,
  configDir: string,
  config: FolioConfig,
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const queryLower = query.toLowerCase();

  async function scanDirectory(
    dir: string,
    type: string = "misc",
  ): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await scanDirectory(fullPath, type);
        } else if (
          entry.isFile() &&
          (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) &&
          // Skip common non-document files
          entry.name !== "README.md" &&
          entry.name !== "_templates"
        ) {
          try {
            const content = await fs.readFile(fullPath, "utf-8");
            
            // Skip template files (contain Handlebars placeholders)
            if (content.includes("{{") && content.includes("}}")) {
              continue;
            }
            
            const { data, content: bodyContent } = matter(content);
            const relativePath = path.relative(configDir, fullPath);

            // Skip files without proper frontmatter (likely not actual documents)
            if (!data || Object.keys(data).length === 0) {
              continue;
            }

            const doc = {
              filename: entry.name,
              filepath: fullPath,
              relativePath,
              frontmatter: data,
              title: data.title || entry.name.replace(/\\.(md|mdx)$/, ""),
              id: data.id || data.ticket_id || data.adr_id,
              type,
              matchReason: "",
            };

            let isMatch = false;

            // Check different search criteria
            if (searchType === "id" || searchType === "any") {
              if (doc.id && String(doc.id).toLowerCase().includes(queryLower)) {
                doc.matchReason = `ID: ${doc.id}`;
                isMatch = true;
              }
            }

            if (!isMatch && (searchType === "title" || searchType === "any")) {
              if (doc.title.toLowerCase().includes(queryLower)) {
                doc.matchReason = `Title: ${doc.title}`;
                isMatch = true;
              }
            }

            if (
              !isMatch &&
              (searchType === "content" || searchType === "any")
            ) {
              if (bodyContent.toLowerCase().includes(queryLower)) {
                doc.matchReason = "Content match";
                isMatch = true;
              }
            }

            // Also check filename
            if (!isMatch && searchType === "any") {
              if (entry.name.toLowerCase().includes(queryLower)) {
                doc.matchReason = `Filename: ${entry.name}`;
                isMatch = true;
              }
            }

            // Check other frontmatter fields
            if (!isMatch && searchType === "any") {
              for (const [key, value] of Object.entries(data)) {
                if (
                  typeof value === "string" &&
                  value.toLowerCase().includes(queryLower)
                ) {
                  doc.matchReason = `${key}: ${value}`;
                  isMatch = true;
                  break;
                }
              }
            }

            if (isMatch) {
              results.push(doc);
            }
          } catch (_error) {
            // Skip files that can't be parsed
          }
        }
      }
    } catch (_error) {
      // Directory might not exist, skip
    }
  }

  // Only scan configured document type directories
  for (const [typeName, typeConfig] of Object.entries(config.types)) {
    const typeDir = path.join(docsRoot, typeConfig.path);
    await scanDirectory(typeDir, typeName);
  }
  
  return results;
}

/**
 * Handles the main logic for the 'folio find' command
 */
async function handleFind(
  query: string,
  options: {
    type?: "id" | "title" | "content" | "any";
    limit?: number;
    format?: "table" | "list" | "paths";
  },
): Promise<void> {
  const searchType = options.type || "any";
  const limit = options.limit || 20;
  const format = options.format || "table";

  log.info(`Searching for "${query}" (${searchType} search)...`);

  try {
    const { config, filepath } = await loadConfig();
    const configDir = path.dirname(filepath);
    const docsRoot = path.join(configDir, config.root);

    const results = await searchDocuments(
      query,
      searchType,
      docsRoot,
      configDir,
      config,
    );

    if (results.length === 0) {
      log.warn(`No documents found matching "${query}"`);
      log.info("Try:");
      log.info("  - Using a broader search term");
      log.info("  - Using --type=any for full-text search");
      log.info("  - Checking if the document exists");
      return;
    }

    // Sort results by relevance (exact ID matches first, then title, etc.)
    results.sort((a, b) => {
      // Exact ID matches first
      if (a.id === query && b.id !== query) return -1;
      if (b.id === query && a.id !== query) return 1;

      // Then by ID contains
      if (a.matchReason.startsWith("ID:") && !b.matchReason.startsWith("ID:"))
        return -1;
      if (b.matchReason.startsWith("ID:") && !a.matchReason.startsWith("ID:"))
        return 1;

      // Then by title
      if (
        a.matchReason.startsWith("Title:") &&
        !b.matchReason.startsWith("Title:")
      )
        return -1;
      if (
        b.matchReason.startsWith("Title:") &&
        !a.matchReason.startsWith("Title:")
      )
        return 1;

      return a.title.localeCompare(b.title);
    });

    // Limit results
    const displayResults = results.slice(0, limit);

    log.success(`Found ${results.length} matching document(s)`);

    if (results.length > limit) {
      log.info(`Showing first ${limit} results (use --limit to see more)`);
    }

    console.log(); // Empty line

    if (format === "table") {
      console.log("| ID | Title | Type | Match | File |");
      console.log("|----|-------|------|-------|------|");

      for (const result of displayResults) {
        const id = result.id || "N/A";
        const title =
          result.title.length > 30
            ? `${result.title.substring(0, 27)}...`
            : result.title;
        const filename = path.basename(result.filepath);
        console.log(
          `| \`${id}\` | ${title} | ${result.type} | ${result.matchReason} | \`${filename}\` |`,
        );
      }
    } else if (format === "list") {
      for (const result of displayResults) {
        const id = result.id ? ` (${result.id})` : "";
        console.log(`📄 **${result.title}**${id}`);
        console.log(`   📁 ${result.relativePath}`);
        console.log(`   🎯 Match: ${result.matchReason}`);
        if (result.frontmatter.status) {
          console.log(`   📊 Status: ${result.frontmatter.status}`);
        }
        console.log();
      }
    } else if (format === "paths") {
      for (const result of displayResults) {
        console.log(result.relativePath);
      }
    }

    // Show quick action suggestions
    if (displayResults.length === 1) {
      const result = displayResults[0];
      console.log("\\n💡 Quick actions:");
      console.log(`   cat "${result.relativePath}"`);
      console.log(`   code "${result.relativePath}"`);
      if (result.id) {
        console.log(`   folio status ${result.type} ${result.id} <new-status>`);
      }
    }
  } catch (error) {
    log.error(error instanceof Error ? error : new Error("Search failed"));
    process.exit(1);
  }
}

/**
 * Creates and configures the `find` command for the Folio CLI.
 */
export function createFindCommand(): Command {
  const cmd = new Command("find");

  cmd
    .description("Find documents by ID, title, or content")
    .argument(
      "<query>",
      "Search query (e.g., 'CE-112.3', 'authentication', etc.)",
    )
    .option("-t, --type <type>", "Search type: id, title, content, any", "any")
    .option("-l, --limit <number>", "Maximum number of results to show", "20")
    .option(
      "-f, --format <format>",
      "Output format: table, list, paths",
      "table",
    )
    .action((query, options) => {
      handleFind(query, {
        ...options,
        limit: parseInt(options.limit, 10),
      });
    });

  return cmd;
}
