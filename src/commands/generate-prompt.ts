import { Command } from "commander";
import path from "node:path";
import { loadConfig } from "../utils/config-loader";
import { generateSystemPrompt } from "../utils/prompt-generator";
import log from "../utils/logging";

/**
 * Handles the core logic for the 'generate-prompt' command.
 */
async function handleGeneratePrompt(options: {
  provider: string;
  readonly: boolean;
  includeCreate: boolean;
  port: number;
  output?: string;
}) {
  try {
    // Load project config to understand document types
    const { config, filepath } = await loadConfig();
    const configDir = path.dirname(filepath);
    const docsRoot = path.join(configDir, config.root);

    log.info("Generating AI system prompt...");

    const prompt = await generateSystemPrompt({
      provider: options.provider,
      readonly: options.readonly,
      includeCreate: options.includeCreate,
      apiPort: options.port,
      docsRoot,
      config
    });

    if (options.output) {
      const fs = await import("node:fs/promises");
      await fs.writeFile(options.output, prompt);
      log.success(`System prompt written to: ${options.output}`);
    } else {
      console.log("\n" + "=".repeat(80));
      console.log("FOLIO AI SYSTEM PROMPT");
      console.log("=".repeat(80));
      console.log(prompt);
      console.log("=".repeat(80));
    }

    log.info(`\nTo use this prompt:`);
    log.info(`1. Start the Knowledge API: folio serve --api --port ${options.port}`);
    log.info(`2. Copy the prompt above to your AI assistant`);
    log.info(`3. The AI can now query your project knowledge!`);

  } catch (error) {
    if (error instanceof Error) {
      log.error(`Error generating prompt: ${error.message}`);
    } else {
      log.error("An unexpected error occurred.");
    }
    process.exit(1);
  }
}

/**
 * Creates and configures the `generate-prompt` command for the Folio CLI.
 */
export function createGeneratePromptCommand(): Command {
  const cmd = new Command("generate-prompt");

  cmd
    .description("Generate AI system prompts for accessing your project knowledge via the Folio Knowledge API.")
    .option(
      "--provider <provider>",
      "AI provider format (claude, openai, gemini, generic)",
      "claude"
    )
    .option(
      "--readonly",
      "Generate read-only prompt (no document creation tools)",
      false
    )
    .option(
      "--include-create",
      "Include document creation capabilities",
      true
    )
    .option(
      "--port <number>",
      "API server port to reference in the prompt",
      "3000"
    )
    .option(
      "-o, --output <file>",
      "Write prompt to file instead of stdout"
    )
    .action((opts) => {
      const parsedOpts = {
        provider: opts.provider,
        readonly: opts.readonly,
        includeCreate: !opts.readonly && opts.includeCreate,
        port: parseInt(opts.port, 10),
        output: opts.output
      };
      handleGeneratePrompt(parsedOpts);
    });

  return cmd;
}