/**
 * @file Reusable utility functions for file system operations.
 * These helpers are designed to be aware of the Folio project structure.
 */

import fs from "node:fs/promises";
import path from "node:path";
import type { DocumentType, FolioConfig } from "../types/folio";
import { slugify } from "./slugify";

/**
 * Ensures that a directory exists, creating it recursively if it does not.
 * @param dirPath The absolute path to the directory.
 */
export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error: unknown) {
    // This can fail due to permissions, etc.
    throw new Error(
      `Failed to create directory at ${dirPath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Reads the content of a specific template file.
 * @param templateName The name of the template (e.g., 'adr.md').
 * @param config The loaded Folio configuration.
 * @param configDir The directory where the config file was found.
 * @returns The content of the template file as a string.
 */
export async function readTemplateFile(
  templateName: string,
  configDir: string,
): Promise<string> {
  // By convention, user templates are stored in a '_templates' directory
  // within the docs directory for better organization.
  const templatePath = path.join(configDir, "docs", "_templates", templateName);
  try {
    return await fs.readFile(templatePath, "utf-8");
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw new Error(
        `Template file not found at '${templatePath}'. Please make sure it exists.`,
      );
    }
    throw new Error(
      `Failed to read template file '${templateName}': ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Generates a new, unique, sequentially-numbered filename for a document.
 * Example: For a title "My New ADR", it might return "0005-my-new-adr.md".
 *
 * @param docTypeConfig The configuration for the document type.
 * @param title The title of the new document.
 * @param config The main Folio configuration.
 * @param configDir The directory where the config file was found.
 * @returns A promise that resolves to the new, unique filename string.
 */
export async function generateSequentialFilename(
  docTypeConfig: DocumentType,
  title: string,
  config: FolioConfig,
  configDir: string,
): Promise<string> {
  const docsDir = path.join(configDir, config.root, docTypeConfig.path);
  await ensureDirectoryExists(docsDir);

  const files = await fs.readdir(docsDir);

  // Find the highest existing ID from filenames like '0001-some-title.md'
  let maxId = 0;
  for (const file of files) {
    const match = file.match(/^(\d+)-.*/);
    if (match) {
      const id = parseInt(match[1], 10);
      if (id > maxId) {
        maxId = id;
      }
    }
  }

  const nextId = maxId + 1;
  const slug = slugify(title);
  const paddedId = String(nextId).padStart(4, "0"); // e.g., 1 -> "0001"

  return `${paddedId}-${slug}.md`;
}

/**
 * Writes content to a new document file within the correct directory.
 * @param docTypeConfig The configuration for the document type.
 * @param filename The name of the file to create.
 * @param content The full content (including front matter) to write to the file.
 * @param config The main Folio configuration.
 * @param configDir The directory where the config file was found.
 * @returns The absolute path to the newly created file.
 */
export async function writeDocFile(
  docTypeConfig: DocumentType,
  filename: string,
  content: string,
  config: FolioConfig,
  configDir: string,
): Promise<string> {
  const docsDir = path.join(configDir, config.root, docTypeConfig.path);
  await ensureDirectoryExists(docsDir);

  const filePath = path.join(docsDir, filename);

  try {
    await fs.writeFile(filePath, content, { flag: "wx" }); // 'wx' flag fails if path exists
    return filePath;
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === "EEXIST") {
      throw new Error(
        `A file named '${filename}' already exists in this directory.`,
      );
    }
    throw new Error(
      `Failed to write file at '${filePath}': ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
