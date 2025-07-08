import fs from "node:fs/promises";
import path from "node:path";
import { Command } from "commander";
import matter from "gray-matter";
import { loadConfig } from "../utils/config-loader";

/**
 * Handles the core logic for the 'list' command.
 * @param type The document type to list (e.g., 'adr', 'ticket').
 * @param options Command options, e.g., { status: 'proposed' }.
 */
async function handleList(type: string, options: { [key: string]: string }) {
  try {
    // 1. Load and validate the project's folio.config.ts
    const { config, filepath } = await loadConfig();
    const configDir = path.dirname(filepath);

    // 2. Validate the requested document type
    const docTypeConfig = config.types[type];
    if (!docTypeConfig) {
      console.error(
        `\x1b[31m❌ Error: Document type '${type}' is not defined in your folio.config.ts.\x1b[0m`,
      );
      console.error(
        `   Available types are: ${Object.keys(config.types).join(", ")}`,
      );
      return;
    }

    // 3. Read all files from the corresponding directory
    const docsDir = path.join(configDir, config.root, docTypeConfig.path);
    const files = await fs.readdir(docsDir).catch(() => {
      console.error(
        `\x1b[33m⚠️ Warning: Directory not found at '${docsDir}'.\x1b[0m`,
      );
      return [];
    });

    const markdownFiles = files.filter(
      (f) => f.endsWith(".md") || f.endsWith(".mdx"),
    );
    if (markdownFiles.length === 0) {
      console.log(`No documents found for type '${type}'.`);
      return;
    }

    // 4. Parse front matter from all files concurrently
    const documents = await Promise.all(
      markdownFiles.map(async (file) => {
        const filePath = path.join(docsDir, file);
        const content = await fs.readFile(filePath, "utf-8");
        const { data } = matter(content); // `data` is the front matter object
        return data;
      }),
    );

    // 5. Filter documents based on command-line options
    let filteredDocs = documents;
    for (const key in options) {
      const filterValue = options[key];
      filteredDocs = filteredDocs.filter(
        (doc) => doc[key] && String(doc[key]) === filterValue,
      );
    }

    if (filteredDocs.length === 0) {
      console.log(`No documents found matching your filter criteria.`);
      return;
    }

    // 6. Format and display the output as a table
    const columns = config.indexing.columns;
    const tableData = filteredDocs.map((doc) => {
      const row: { [key: string]: any } = {};
      for (const col of columns) {
        row[col] = doc[col] ?? "N/A"; // Use 'N/A' for missing values
      }
      return row;
    });

    console.log(`\nListing documents of type: \x1b[36m${type}\x1b[0m`);
    console.table(tableData);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`\x1b[31m❌ Error: ${error.message}\x1b[0m`);
    } else {
      console.error(`\x1b[31m❌ An unexpected error occurred.\x1b[0m`, error);
    }
  }
}

/**
 * Creates and configures the `list` command for the Folio CLI.
 */
export function createListCommand(): Command {
  const cmd = new Command("list");

  cmd
    .description("List and filter documents based on their front matter.")
    .argument("<type>", 'The type of document to list (e.g., "adr", "ticket").')
    .option("--status <value>", 'Filter by the "status" field.')
    .option("--owner <value>", 'Filter by the "owner" field.')
    // This command is easily extensible with more options.
    .action(handleList);

  return cmd;
}
