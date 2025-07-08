import fs from "node:fs/promises";
import path from "node:path";
import { Command } from "commander";
import log from "../utils/logging";
import { type ScaffoldNode, structure } from "../utils/scaffold-structure";

// A robust way to get the path to the project root from within the compiled file.
// In the final package, __dirname will be inside `dist/commands/`.
const currentDir = path.dirname(__filename);
const TEMPLATES_ROOT = path.resolve(currentDir, "../../templates");

/**
 * Recursively creates directories and files based on the scaffold structure.
 * @param nodes The array of nodes (files or directories) to create.
 * @param parentPath The absolute path of the parent directory for creation.
 */
async function createStructure(
  nodes: ScaffoldNode[],
  parentPath: string,
): Promise<void> {
  for (const node of nodes) {
    const currentPath = path.join(parentPath, node.name);
    const relativePath = path.relative(process.cwd(), currentPath);

    if (node.type === "directory") {
      await fs.mkdir(currentPath, { recursive: true });
      log.info(`- Created directory: ${relativePath}/`);
      if (node.children) {
        await createStructure(node.children, currentPath);
      }
    } else if (node.type === "file") {
      await fs.writeFile(currentPath, node.content || "");
      log.info(`- Created file:      ${relativePath}`);
    }
  }
}

/**
 * Copies the core configuration and markdown templates into the user's project.
 * @param userCwd The user's current working directory.
 */
async function copyCoreTemplates(userCwd: string): Promise<void> {
  // Define source paths (inside the CLI package's `templates` directory)
  const sourceConfigTemplate = path.join(
    TEMPLATES_ROOT,
    "config/folio.config.ts",
  );
  const sourceMarkdownDir = path.join(TEMPLATES_ROOT, "markdown");
  const sourceWorkflowsDir = path.join(TEMPLATES_ROOT, "github-workflows");

  // Define destination paths (in the user's project)
  const destConfigPath = path.join(userCwd, "folio.config.ts");
  const destTemplatesDir = path.join(userCwd, "templates");
  const destWorkflowsDir = path.join(userCwd, ".github/workflows");

  // 1. Copy the main config file
  await fs.copyFile(sourceConfigTemplate, destConfigPath);
  log.info(`- Created config:    folio.config.ts`);

  // 2. Copy markdown templates
  await fs.mkdir(destTemplatesDir, { recursive: true });
  const mdTemplates = await fs.readdir(sourceMarkdownDir);
  for (const template of mdTemplates) {
    const source = path.join(sourceMarkdownDir, template);
    const destination = path.join(destTemplatesDir, template);
    await fs.copyFile(source, destination);
  }
  log.info(`- Copied markdown templates to: templates/`);

  // 3. Copy GitHub Actions workflows
  try {
    await fs.mkdir(destWorkflowsDir, { recursive: true });
    const workflowTemplates = await fs.readdir(sourceWorkflowsDir);
    for (const workflow of workflowTemplates) {
      const source = path.join(sourceWorkflowsDir, workflow);
      const destination = path.join(destWorkflowsDir, workflow);
      await fs.copyFile(source, destination);
    }
    log.info(`- Created GitHub Actions workflows in: .github/workflows/`);
  } catch (_error) {
    log.warn("Could not copy GitHub Actions workflows (optional feature)");
  }
}

/**
 * Handles the main logic for the `folio init` command.
 * @param options The command options from Commander.js, specifically `{ force: boolean }`.
 */
async function handleInit(options: { force: boolean }): Promise<void> {
  log.info("Initializing new Folio documentation project...\n");

  const userCwd = process.cwd();
  const rootDocsDir = path.join(userCwd, "docs");

  // 1. Safeguard Check: Verify that the `docs` directory doesn't already exist.
  try {
    await fs.access(rootDocsDir); // Throws an error if the directory doesn't exist
    if (!options.force) {
      log.error(
        `Directory 'docs' already exists. Use ${log.highlight("--force")} to proceed.`,
      );
      log.error(
        `Directory 'docs' already exists. Run with '--force' to proceed and create missing files.`,
      );
      return; // Abort the mission
    }
    log.warn(
      "'docs' directory already exists. --force flag detected, proceeding...",
    );
  } catch (_error) {
    // This is the good path: the directory doesn't exist. We can proceed safely.
  }

  // 2. Perform the scaffolding
  try {
    log.info("\nCreating project directory structure...");
    await createStructure(structure, userCwd);

    log.info("\nCopying core templates and configuration...");
    await copyCoreTemplates(userCwd);

    // 3. Final Success Message and Instructions
    log.success("Project structure successfully initialized!");
    log.info("\n--- Next Steps ---");
    log.info("\n1. Install 'folio-cli' as a dev dependency");
    log.info(
      "   This enables autocompletion and type-checking in your `folio.config.ts` file.",
    );
    log.info("   > npm install --save-dev folio-cli");

    log.info("\n2. Customize Your Project");
    log.info("   - Edit `folio.config.ts` to define your document types.");
    log.info("   - Populate the schemas in `docs/schemas/`.");

    log.info("\n3. Enable GitHub Actions (Optional)");
    log.info(
      "   - GitHub Actions workflows have been created in `.github/workflows/`",
    );
    log.info(
      "   - These will automatically validate your documentation on push/PR",
    );
    log.info("   - Weekly health checks will monitor documentation quality");

    log.info("\n4. Start Documenting!");
    log.info("   - Run `folio new --help` to see how to create new documents.");
    log.info("   - Push to GitHub to see the CI/CD workflows in action!");

    // Generate initial navigation
    log.info("\nGenerating initial navigation...");
    try {
      const { handleGenerateNav } = await import("./generate-nav");
      await handleGenerateNav();
      log.success("Navigation files generated for LLM accessibility!");
    } catch (_navError) {
      log.info("Run 'folio generate-nav' manually to create navigation files");
    }
  } catch (error) {
    log.error(
      error instanceof Error
        ? error
        : new Error(
            `An unexpected error occurred during initialization: ${error}`,
          ),
    );
  }
}

/**
 * Creates and configures the `init` command for the Folio CLI.
 * @returns A Commander.js Command object.
 */
export function createInitCommand(): Command {
  const init = new Command("init");

  init
    .description(
      "Initialize a new documentation project with a standard directory structure.",
    )
    .option(
      "-f, --force",
      "Force creation even if the docs/ directory already exists.",
    )
    .action(handleInit);

  return init;
}
