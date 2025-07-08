/**
 * @file Contains the logic for generating and updating index.md files.
 * It reads the front matter of all documents in a directory and creates
 * a summary table or list.
 */

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import type { DocumentType, FolioConfig } from "../types/folio";

const START_MARKER = "<!-- FOLIO:INDEX:START -->";
const END_MARKER = "<!-- FOLIO:INDEX:END -->";

interface DocumentIndexInfo {
  filename: string;
  frontmatter: { [key: string]: any };
}

/**
 * Generates a Markdown table from a list of documents.
 * @param documents An array of document info objects.
 * @param columns The front matter keys to use as table columns.
 * @returns A string containing the formatted Markdown table.
 */
function generateMarkdownTable(
  documents: DocumentIndexInfo[],
  columns: string[],
): string {
  // Use the title column for the link, if it exists. Otherwise, use the first column.
  const linkColumn = columns.includes("title") ? "title" : columns[0];

  const header = `| ${columns.join(" | ")} |`;
  const separator = `| ${columns.map(() => "---").join(" | ")} |`;

  const rows = documents.map((doc) => {
    const rowData = columns.map((col) => {
      const value = doc.frontmatter[col] ?? "N/A"; // Default to N/A for missing values
      // Create a link for the designated link column
      if (col === linkColumn) {
        return `[${value}](${encodeURI(doc.filename)})`;
      }
      return value;
    });
    return `| ${rowData.join(" | ")} |`;
  });

  return [header, separator, ...rows].join("\n");
}

/**
 * Generates a Markdown list from a list of documents.
 * @param documents An array of document info objects.
 * @returns A string containing the formatted Markdown list.
 */
function generateMarkdownList(documents: DocumentIndexInfo[]): string {
  const listItems = documents.map((doc) => {
    const title = doc.frontmatter.title ?? doc.filename;
    const status = doc.frontmatter.status
      ? ` (Status: ${doc.frontmatter.status})`
      : "";
    return `- [${title}](${encodeURI(doc.filename)})${status}`;
  });
  return listItems.join("\n");
}

/**
 * Updates the index.md file for a given document type.
 * It reads all .md files, parses their front matter, and generates a new
 * index table/list within the special marker comments in index.md.
 *
 * @param docTypeConfig The configuration for the document type to index.
 * @param config The global Folio configuration.
 * @param configDir The absolute path to the directory containing folio.config.ts.
 */
export async function updateIndexFile(
  docTypeConfig: DocumentType,
  config: FolioConfig,
  configDir: string,
): Promise<void> {
  const typeDir = path.join(configDir, config.root, docTypeConfig.path);
  const indexPath = path.join(typeDir, "index.md");

  // 1. Get all markdown files in the directory, excluding the index itself.
  const allFiles = await fs.readdir(typeDir).catch(() => []);
  const docFiles = allFiles.filter(
    (file) =>
      (file.endsWith(".md") || file.endsWith(".mdx")) && file !== "index.md",
  );

  // 2. Parse front matter from all document files concurrently.
  const documents: DocumentIndexInfo[] = await Promise.all(
    docFiles.map(async (filename) => {
      const filePath = path.join(typeDir, filename);
      const content = await fs.readFile(filePath, "utf-8");
      const { data } = matter(content);
      return { filename, frontmatter: data };
    }),
  );

  // Sort documents. A common case is by ID if it exists.
  if (documents.every((d) => d.frontmatter.id)) {
    documents.sort((a, b) => (a.frontmatter.id > b.frontmatter.id ? 1 : -1));
  }

  // 3. Generate the new index content based on the configuration.
  let newIndexContent: string;
  if (documents.length === 0) {
    newIndexContent = "No documents found for this type.";
  } else {
    const format = config.indexing.format ?? "table";
    if (format === "list") {
      newIndexContent = generateMarkdownList(documents);
    } else {
      newIndexContent = generateMarkdownTable(
        documents,
        config.indexing.columns,
      );
    }
  }

  // 4. Read the existing index.md and replace the content between the markers.
  const fullNewContent = `${START_MARKER}\n\n${newIndexContent}\n\n${END_MARKER}`;

  let finalFileContent: string;
  try {
    const existingContent = await fs.readFile(indexPath, "utf-8");
    const startMarkerIndex = existingContent.indexOf(START_MARKER);
    const endMarkerIndex = existingContent.indexOf(END_MARKER);

    if (startMarkerIndex !== -1 && endMarkerIndex !== -1) {
      // Markers found, replace the content between them
      const before = existingContent.substring(0, startMarkerIndex);
      const after = existingContent.substring(
        endMarkerIndex + END_MARKER.length,
      );
      finalFileContent = before + fullNewContent + after;
    } else {
      // Markers not found, append the new index to the end of the file.
      finalFileContent = `${existingContent.trim()}\n\n${fullNewContent}`;
    }
  } catch (error: unknown) {
    // If index.md doesn't exist, create it from scratch.
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      const title = docTypeConfig.path
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      finalFileContent = `# Index of ${title}\n\n${fullNewContent}`;
    } else {
      throw error; // Rethrow other errors
    }
  }

  // 5. Write the updated content back to index.md.
  await fs.writeFile(indexPath, finalFileContent);
  console.log(`✅ Updated index: ${path.relative(process.cwd(), indexPath)}`);
}
