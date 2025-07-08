/**
 * @file Contains the logic for the `folio setup-docs` command.
 * This command sets up MkDocs documentation for a Folio project.
 */

import { Command } from "commander";
import fs from "node:fs/promises";
import path from "node:path";
import { loadConfig } from "../utils/config-loader";
import { readTemplateFile } from "../utils/files";
import log from "../utils/logging";

interface SetupOptions {
  projectName?: string;
  description?: string;
  author?: string;
  githubUsername?: string;
  repositoryName?: string;
  force?: boolean;
}

/**
 * Replaces template variables in content
 */
function replaceTemplateVariables(content: string, variables: Record<string, string>): string {
  let result = content;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

/**
 * Prompts for user input with a default value
 */
async function promptForInput(question: string, defaultValue?: string): Promise<string> {
  const { default: inquirer } = await import('inquirer');
  const { value } = await inquirer.prompt([
    {
      type: 'input',
      name: 'value',
      message: question,
      default: defaultValue,
    },
  ]);
  return value;
}

/**
 * Gets Git configuration
 */
async function getGitConfig(): Promise<{ name?: string; email?: string }> {
  try {
    const { spawn } = await import('node:child_process');
    
    const getName = () => new Promise<string>((resolve) => {
      const proc = spawn('git', ['config', 'user.name'], { stdio: 'pipe' });
      let output = '';
      proc.stdout.on('data', (data) => output += data.toString());
      proc.on('close', () => resolve(output.trim()));
    });
    
    const name = await getName();
    return { name };
  } catch {
    return {};
  }
}

/**
 * Gets repository information from git remote
 */
async function getRepositoryInfo(): Promise<{ username?: string; repository?: string }> {
  try {
    const { spawn } = await import('node:child_process');
    
    const getRemote = () => new Promise<string>((resolve) => {
      const proc = spawn('git', ['remote', 'get-url', 'origin'], { stdio: 'pipe' });
      let output = '';
      proc.stdout.on('data', (data) => output += data.toString());
      proc.on('close', () => resolve(output.trim()));
    });
    
    const remote = await getRemote();
    
    // Parse GitHub URL
    const match = remote.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
    if (match) {
      return {
        username: match[1],
        repository: match[2]
      };
    }
  } catch {
    // Fall back to directory name
    const cwd = process.cwd();
    const repository = path.basename(cwd);
    return { repository };
  }
  
  return {};
}

/**
 * Handles the main logic for the 'folio setup-docs' command
 */
async function handleSetupDocs(options: SetupOptions): Promise<void> {
  log.title("Setting up MkDocs Documentation");
  
  try {
    // Load Folio configuration
    const { filepath } = await loadConfig();
    const configDir = path.dirname(filepath);
    
    // Get Git information
    const gitConfig = await getGitConfig();
    const repoInfo = await getRepositoryInfo();
    
    // Determine project information
    const projectName = options.projectName || await promptForInput(
      "Project name:", 
      repoInfo.repository || path.basename(process.cwd())
    );
    
    const description = options.description || await promptForInput(
      "Project description:", 
      `Documentation for ${projectName}`
    );
    
    const author = options.author || await promptForInput(
      "Author name:", 
      gitConfig.name || "Your Name"
    );
    
    const githubUsername = options.githubUsername || await promptForInput(
      "GitHub username:", 
      repoInfo.username || "yourusername"
    );
    
    const repositoryName = options.repositoryName || await promptForInput(
      "Repository name:", 
      repoInfo.repository || projectName
    );
    
    // Template variables
    const variables = {
      project_name: projectName,
      project_description: description,
      author_name: author,
      github_username: githubUsername,
      repository_name: repositoryName,
    };
    
    // Check if files already exist
    const mkdocsPath = path.join(configDir, 'mkdocs.yml');
    const workflowPath = path.join(configDir, '.github', 'workflows', 'docs.yml');
    
    const mkdocsExists = await fs.access(mkdocsPath).then(() => true).catch(() => false);
    const workflowExists = await fs.access(workflowPath).then(() => true).catch(() => false);
    
    if ((mkdocsExists || workflowExists) && !options.force) {
      log.warn("Documentation files already exist. Use --force to overwrite.");
      log.info("Existing files:");
      if (mkdocsExists) log.info("  - mkdocs.yml");
      if (workflowExists) log.info("  - .github/workflows/docs.yml");
      return;
    }
    
    // Read and process templates
    log.info("Creating MkDocs configuration...");
    const mkdocsTemplate = await readTemplateFile('mkdocs.yml', configDir);
    const mkdocsContent = replaceTemplateVariables(mkdocsTemplate, variables);
    await fs.writeFile(mkdocsPath, mkdocsContent);
    log.success(`Created: ${path.relative(configDir, mkdocsPath)}`);
    
    // Create GitHub Actions workflow
    log.info("Creating GitHub Actions workflow...");
    const workflowDir = path.join(configDir, '.github', 'workflows');
    await fs.mkdir(workflowDir, { recursive: true });
    
    const workflowTemplate = await readTemplateFile('docs-workflow.yml', configDir);
    await fs.writeFile(workflowPath, workflowTemplate);
    log.success(`Created: ${path.relative(configDir, workflowPath)}`);
    
    // Create requirements.txt for Python dependencies
    const requirementsPath = path.join(configDir, 'requirements.txt');
    const requirementsContent = `mkdocs-material>=9.0.0
mkdocs-awesome-pages-plugin>=2.8.0
pymdown-extensions>=10.0.0
`;
    await fs.writeFile(requirementsPath, requirementsContent);
    log.success(`Created: ${path.relative(configDir, requirementsPath)}`);
    
    // Final instructions
    log.success("MkDocs documentation setup complete!");
    log.info("");
    log.info("Next steps:");
    log.info("1. Enable GitHub Pages in your repository settings");
    log.info("2. Set GitHub Pages source to 'GitHub Actions'");
    log.info("3. Push these changes to trigger the first build");
    log.info("");
    log.info("Local development:");
    log.info("  pip install -r requirements.txt");
    log.info("  mkdocs serve");
    log.info("");
    log.info("Generate navigation:");
    log.info("  folio generate-nav");
    log.info("");
    log.info(`Your documentation will be available at:`);
    log.info(`  https://${githubUsername}.github.io/${repositoryName}/`);
    
  } catch (error) {
    log.error(error instanceof Error ? error : new Error("Setup failed"));
    process.exit(1);
  }
}

/**
 * Creates and configures the `setup-docs` command for the Folio CLI.
 */
export function createSetupDocsCommand(): Command {
  const cmd = new Command("setup-docs");
  
  cmd
    .description("Set up MkDocs documentation for your Folio project")
    .option("--project-name <name>", "Project name")
    .option("--description <desc>", "Project description")
    .option("--author <author>", "Author name")
    .option("--github-username <username>", "GitHub username")
    .option("--repository-name <name>", "Repository name")
    .option("--force", "Overwrite existing files")
    .action(handleSetupDocs);
  
  return cmd;
}