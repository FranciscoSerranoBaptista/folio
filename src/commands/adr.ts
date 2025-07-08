/**
 * @file Contains the logic for the `folio adr` command.
 * This command provides ADR lifecycle management: deprecate, reorder, renumber.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { Command } from "commander";
import matter from "gray-matter";
import { loadConfig } from "../utils/config-loader";
import { updateIndexFile } from "../utils/indexing";
import log from "../utils/logging";

interface ADRDocument {
  filename: string;
  filepath: string;
  frontmatter: { [key: string]: any };
  content: string;
  id: number;
  title: string;
  status: string;
}

/**
 * Gets all ADR documents in the ADR directory
 */
async function getADRDocuments(adrDir: string): Promise<ADRDocument[]> {
  const adrs: ADRDocument[] = [];

  try {
    const files = await fs.readdir(adrDir);
    const adrFiles = files.filter(
      (file) =>
        (file.endsWith(".md") || file.endsWith(".mdx")) &&
        file !== "index.md" &&
        /^\\d+/.test(file), // Must start with a number
    );

    for (const filename of adrFiles) {
      const filepath = path.join(adrDir, filename);
      const fileContent = await fs.readFile(filepath, "utf-8");
      const { data, content } = matter(fileContent);

      // Extract ID from filename
      const idMatch = filename.match(/^(\\d+)/);
      const id = idMatch ? parseInt(idMatch[1], 10) : 0;

      adrs.push({
        filename,
        filepath,
        frontmatter: data,
        content,
        id,
        title: data.title || filename.replace(/\\.(md|mdx)$/, ""),
        status: data.status || "unknown",
      });
    }

    // Sort by ID
    adrs.sort((a, b) => a.id - b.id);
  } catch (error) {
    throw new Error(`Failed to read ADR directory: ${error}`);
  }

  return adrs;
}

/**
 * Updates an ADR document's frontmatter and content
 */
async function updateADRDocument(
  adr: ADRDocument,
  newFrontmatter: { [key: string]: any },
  newContent?: string,
): Promise<void> {
  const updatedFrontmatter = { ...adr.frontmatter, ...newFrontmatter };
  const contentToWrite = newContent || adr.content;
  const newFileContent = matter.stringify(contentToWrite, updatedFrontmatter);

  await fs.writeFile(adr.filepath, newFileContent, "utf-8");
}

/**
 * Deprecates an ADR by setting its status to deprecated
 */
async function handleDeprecate(
  adrId: string,
  options: {
    reason?: string;
    supersededBy?: string;
    "dry-run"?: boolean;
  },
): Promise<void> {
  log.title(`Deprecating ADR ${adrId}`);

  try {
    const { config, filepath } = await loadConfig();
    const configDir = path.dirname(filepath);

    // Find ADR type configuration
    const adrType = Object.entries(config.types).find(
      ([_, typeConfig]) =>
        typeConfig.path.includes("adr") || typeConfig.template.includes("adr"),
    );

    if (!adrType) {
      throw new Error("No ADR document type found in configuration");
    }

    const adrDir = path.join(configDir, config.root, adrType[1].path);
    const adrs = await getADRDocuments(adrDir);

    const targetADR = adrs.find(
      (adr) =>
        adr.id.toString() === adrId ||
        adr.filename.includes(adrId) ||
        adr.frontmatter.id === adrId,
    );

    if (!targetADR) {
      throw new Error(`ADR "${adrId}" not found`);
    }

    log.info(`Found ADR: ${targetADR.title} (${targetADR.filename})`);
    log.info(`Current status: ${targetADR.status}`);

    if (targetADR.status === "deprecated") {
      log.warn("ADR is already deprecated");
      return;
    }

    if (options["dry-run"]) {
      log.info("DRY RUN - Would make these changes:");
      log.info("  - Set status to 'deprecated'");
      if (options.reason) {
        log.info(`  - Add deprecation reason: "${options.reason}"`);
      }
      if (options.supersededBy) {
        log.info(`  - Mark as superseded by: "${options.supersededBy}"`);
      }
      return;
    }

    // Update the ADR
    const updates: { [key: string]: any } = {
      status: "deprecated",
      deprecated_date: new Date().toISOString().split("T")[0],
    };

    if (options.reason) {
      updates.deprecation_reason = options.reason;
    }

    if (options.supersededBy) {
      updates.superseded_by = options.supersededBy;
    }

    await updateADRDocument(targetADR, updates);

    log.success(`Deprecated ADR ${adrId}`);

    // Update the index
    await updateIndexFile(adrType[1], config, configDir);
    log.info("Updated ADR index");
  } catch (error) {
    log.error(error instanceof Error ? error : new Error("Deprecation failed"));
    process.exit(1);
  }
}

/**
 * Renumbers all ADRs to have sequential IDs
 */
async function handleRenumber(options: {
  "start-from"?: number;
  "dry-run"?: boolean;
  force?: boolean;
}): Promise<void> {
  log.title("Renumbering ADRs");

  if (!options.force) {
    log.warn("⚠️  DANGEROUS OPERATION: This will rename all ADR files!");
    log.warn("    This may break existing links and references.");
    log.warn("    Use --force to proceed or --dry-run to preview changes.");
    return;
  }

  try {
    const { config, filepath } = await loadConfig();
    const configDir = path.dirname(filepath);

    // Find ADR type configuration
    const adrType = Object.entries(config.types).find(
      ([_, typeConfig]) =>
        typeConfig.path.includes("adr") || typeConfig.template.includes("adr"),
    );

    if (!adrType) {
      throw new Error("No ADR document type found in configuration");
    }

    const adrDir = path.join(configDir, config.root, adrType[1].path);
    const adrs = await getADRDocuments(adrDir);

    if (adrs.length === 0) {
      log.info("No ADRs found to renumber");
      return;
    }

    const startFrom = options["start-from"] || 1;
    log.info(`Found ${adrs.length} ADRs, renumbering from ${startFrom}`);

    // Plan the renumbering
    const renamePlan: Array<{
      old: ADRDocument;
      newId: number;
      newFilename: string;
      newFilepath: string;
    }> = [];

    for (let i = 0; i < adrs.length; i++) {
      const adr = adrs[i];
      const newId = startFrom + i;
      const oldTitle = adr.title.replace(/^\\d+[-\\s]*/, ""); // Remove old number prefix
      const newFilename = `${String(newId).padStart(4, "0")}-${oldTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
      const newFilepath = path.join(adrDir, newFilename);

      renamePlan.push({
        old: adr,
        newId,
        newFilename,
        newFilepath,
      });
    }

    if (options["dry-run"]) {
      log.info("DRY RUN - Would make these changes:");
      for (const plan of renamePlan) {
        if (plan.old.filename !== plan.newFilename) {
          log.info(`  ${plan.old.filename} → ${plan.newFilename}`);
        }
      }
      return;
    }

    // Execute the renumbering
    log.info("Executing renumbering...");

    // Use a temporary suffix to avoid conflicts during renaming
    const tempSuffix = ".tmp-renumber";

    // Phase 1: Rename to temporary names
    for (const plan of renamePlan) {
      if (plan.old.filename !== plan.newFilename) {
        const tempPath = plan.old.filepath + tempSuffix;
        await fs.rename(plan.old.filepath, tempPath);
      }
    }

    // Phase 2: Update content and rename to final names
    for (const plan of renamePlan) {
      const sourcePath =
        plan.old.filename === plan.newFilename
          ? plan.old.filepath
          : plan.old.filepath + tempSuffix;

      // Update the ID in frontmatter
      const updatedFrontmatter = {
        ...plan.old.frontmatter,
        id: plan.newId,
      };

      const newFileContent = matter.stringify(
        plan.old.content,
        updatedFrontmatter,
      );
      await fs.writeFile(plan.newFilepath, newFileContent, "utf-8");

      // Remove temporary file if it exists
      if (sourcePath !== plan.newFilepath) {
        try {
          await fs.unlink(sourcePath);
        } catch {
          // Ignore errors
        }
      }

      log.info(`  Renumbered: ${plan.old.filename} → ${plan.newFilename}`);
    }

    log.success(`Successfully renumbered ${adrs.length} ADRs`);

    // Update the index
    await updateIndexFile(adrType[1], config, configDir);
    log.info("Updated ADR index");
  } catch (error) {
    log.error(error instanceof Error ? error : new Error("Renumbering failed"));
    process.exit(1);
  }
}

/**
 * Lists all ADRs with their status
 */
async function handleList(options: {
  status?: string;
  format?: "table" | "list";
}): Promise<void> {
  try {
    const { config, filepath } = await loadConfig();
    const configDir = path.dirname(filepath);

    // Find ADR type configuration
    const adrType = Object.entries(config.types).find(
      ([_, typeConfig]) =>
        typeConfig.path.includes("adr") || typeConfig.template.includes("adr"),
    );

    if (!adrType) {
      throw new Error("No ADR document type found in configuration");
    }

    const adrDir = path.join(configDir, config.root, adrType[1].path);
    const adrs = await getADRDocuments(adrDir);

    // Filter by status if specified
    const filteredADRs = options.status
      ? adrs.filter(
          (adr) => adr.status.toLowerCase() === options.status?.toLowerCase(),
        )
      : adrs;

    if (filteredADRs.length === 0) {
      const statusFilter = options.status
        ? ` with status "${options.status}"`
        : "";
      log.info(`No ADRs found${statusFilter}`);
      return;
    }

    log.info(
      `Found ${filteredADRs.length} ADR(s)${options.status ? ` with status "${options.status}"` : ""}`,
    );
    console.log();

    if (options.format === "list") {
      for (const adr of filteredADRs) {
        console.log(
          `📄 **ADR-${String(adr.id).padStart(4, "0")}**: ${adr.title}`,
        );
        console.log(`   📊 Status: ${adr.status}`);
        console.log(`   📁 File: ${adr.filename}`);
        console.log();
      }
    } else {
      console.log("| ID | Title | Status | File |");
      console.log("|----|-------|--------|------|");

      for (const adr of filteredADRs) {
        const id = String(adr.id).padStart(4, "0");
        const title =
          adr.title.length > 40
            ? `${adr.title.substring(0, 37)}...`
            : adr.title;
        console.log(
          `| \`${id}\` | ${title} | ${adr.status} | \`${adr.filename}\` |`,
        );
      }
    }
  } catch (error) {
    log.error(
      error instanceof Error ? error : new Error("Failed to list ADRs"),
    );
    process.exit(1);
  }
}

/**
 * Creates and configures the `adr` command for the Folio CLI.
 */
export function createADRCommand(): Command {
  const cmd = new Command("adr");

  cmd.description("ADR lifecycle management: deprecate, renumber, list");

  // Deprecate subcommand
  const deprecateCmd = new Command("deprecate");
  deprecateCmd
    .description("Mark an ADR as deprecated")
    .argument("<id>", "ADR ID or identifier to deprecate")
    .option("-r, --reason <reason>", "Reason for deprecation")
    .option(
      "-s, --superseded-by <id>",
      "ID of the ADR that supersedes this one",
    )
    .option("--dry-run", "Preview changes without applying them")
    .action(handleDeprecate);

  // Renumber subcommand
  const renumberCmd = new Command("renumber");
  renumberCmd
    .description("Renumber all ADRs sequentially (DANGEROUS)")
    .option("--start-from <number>", "Starting number for renumbering", "1")
    .option("--dry-run", "Preview changes without applying them")
    .option("--force", "Actually perform the renumbering (required)")
    .action((options) =>
      handleRenumber({
        ...options,
        "start-from": parseInt(options.startFrom, 10),
      }),
    );

  // List subcommand
  const listCmd = new Command("list");
  listCmd
    .description("List all ADRs")
    .option("-s, --status <status>", "Filter by status")
    .option("-f, --format <format>", "Output format: table or list", "table")
    .action(handleList);

  cmd.addCommand(deprecateCmd);
  cmd.addCommand(renumberCmd);
  cmd.addCommand(listCmd);

  return cmd;
}
