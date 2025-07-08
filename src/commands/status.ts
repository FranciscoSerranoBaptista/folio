/**
 * @file Contains the logic for the `folio status` command, which allows
 *       users to quickly update the status field of a specific document.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { Command } from "commander";
import matter from "gray-matter";
import { loadConfig } from "../utils/config-loader";
import { updateIndexFile } from "../utils/indexing";
import log from "../utils/logging";

interface TargetFile {
  path: string;
  matter: matter.GrayMatterFile<string>;
}

/**
 * Handles the core logic for the 'status' command.
 * @param type The document type to update (e.g., 'adr', 'ticket').
 * @param id The unique ID of the document to find.
 * @param newStatus The new status value to set.
 */
async function handleStatus(
  type: string,
  id: string,
  newStatus: string,
): Promise<void> {
  try {
    // 1. Load and validate the project's folio.config.ts
    const { config, filepath } = await loadConfig();
    const configDir = path.dirname(filepath);

    // 2. Validate the document type and its schema
    const docTypeConfig = config.types[type];
    if (!docTypeConfig) {
      log.error(
        `Document type '${type}' is not defined in your folio.config.ts.`,
      );
      log.info(`Available types are: ${Object.keys(config.types).join(", ")}`);
      return;
    }
    const statusField = docTypeConfig.frontmatter.status;
    if (!statusField) {
      log.error(
        `Document type '${type}' does not have a 'status' field defined in its schema.`,
      );
      return;
    }
    if (statusField.enum && !statusField.enum.includes(newStatus)) {
      log.error(`'${newStatus}' is not a valid status for type '${type}'.`);
      log.info(
        `Valid options are: ${log.highlight(statusField.enum.join(", "))}`,
      );
      return;
    }

    // 3. Find the target file by its ID
    const typeDir = path.join(configDir, config.root, docTypeConfig.path);
    const files = await fs.readdir(typeDir).catch(() => []);
    let targetFile: TargetFile | null = null;

    for (const file of files) {
      if (!file.endsWith(".md") && !file.endsWith(".mdx")) continue;

      const filePath = path.join(typeDir, file);
      const content = await fs.readFile(filePath, "utf-8");
      const docMatter = matter(content);

      // Compare IDs, coercing both to string for reliable comparison
      if (docMatter.data.id && String(docMatter.data.id) === id) {
        targetFile = { path: filePath, matter: docMatter };
        break; // Found our file, no need to search further
      }
    }

    if (!targetFile) {
      log.error(`Could not find a document of type '${type}' with ID '${id}'.`);
      return;
    }

    // 4. Update the front matter and stringify the new content
    const oldStatus = targetFile.matter.data.status;
    targetFile.matter.data.status = newStatus;

    // Bonus: If a 'date' or 'dateModified' field exists, update it.
    const dateFieldToUpdate = ["dateModified", "date", "updated_at"].find(
      (field) => docTypeConfig.frontmatter[field],
    );
    if (dateFieldToUpdate) {
      targetFile.matter.data[dateFieldToUpdate] = new Date()
        .toISOString()
        .split("T")[0];
    }

    // matter.stringify takes the original content and the new data object
    const newContent = matter.stringify(
      targetFile.matter.content,
      targetFile.matter.data,
    );

    // 5. Write the changes back to the file
    await fs.writeFile(targetFile.path, newContent, "utf-8");

    // 6. Update the index file since the status has changed
    await updateIndexFile(docTypeConfig, config, configDir);

    log.success(`Status updated for ${type} ${log.highlight(id)}`);
    log.message(`   ${oldStatus} -> ${log.highlight(newStatus)}`);
  } catch (error) {
    // Let the logger handle formatting the error message
    log.error(
      error instanceof Error ? error : new Error("An unknown error occurred."),
    );
    process.exit(1);
  }
}

/**
 * Creates and configures the `status` command for the Folio CLI.
 */
export function createStatusCommand(): Command {
  const cmd = new Command("status");

  cmd
    .description(
      "Update the status of a specific document (e.g., an ADR or ticket).",
    )
    .argument("<type>", 'The type of document (e.g., "adr", "ticket").')
    .argument("<id>", "The unique ID of the document.")
    .argument("<newStatus>", "The new status to set.")
    .action(handleStatus);

  return cmd;
}
