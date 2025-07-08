#!/usr/bin/env node

/**
 * @file The main entry point for the Folio CLI application.
 *
 * This file is responsible for:
 * - Setting up the main command-line interface program using Commander.js.
 * - Defining global program information like name, description, and version.
 * - Registering all available sub-commands by importing them from their respective files.
 * - Parsing command-line arguments and executing the appropriate command.
 */

import { Command } from "commander";
// Import package.json to dynamically get the version number.
// Requires "resolveJsonModule": true in tsconfig.json.
import pkg from "../package.json";
import { createADRCommand } from "./commands/adr";
import { createFindCommand } from "./commands/find";
import { createGenerateNavCommand } from "./commands/generate-nav";
// Import command creation functions from their dedicated modules.
// This keeps the main file clean and focused on orchestration.
import { createInitCommand } from "./commands/init";
import { createListCommand } from "./commands/list";
import { createNewCommand } from "./commands/new";
import { createServeCommand } from "./commands/serve";
import { createStatusCommand } from "./commands/status";
import { createValidateCommand } from "./commands/validate";

/**
 * The main asynchronous function that sets up and runs the CLI.
 */
async function main() {
  // Create the main program instance.
  const program = new Command();

  // Configure global program details.
  program
    .name("folio")
    .description(
      "A modern CLI for managing structured Markdown documentation like ADRs, sprints, and tickets.",
    )
    .version(
      pkg.version,
      "-v, --version",
      "Output the current version of Folio CLI",
    );

  // Attach all the commands to the main program.
  // Each `create...Command` function returns a configured Commander.js Command object.
  program.addCommand(createInitCommand());
  program.addCommand(createNewCommand());
  program.addCommand(createListCommand());
  program.addCommand(createValidateCommand());
  program.addCommand(createStatusCommand());
  program.addCommand(createServeCommand());
  program.addCommand(createGenerateNavCommand());
  program.addCommand(createFindCommand());
  program.addCommand(createADRCommand());

  // Add more commands here as the CLI grows.

  try {
    // Parse the command-line arguments and execute the corresponding command.
    // Commander.js handles routing to the correct action, including showing help.
    await program.parseAsync(process.argv);
  } catch (error) {
    // A catch-all for any unexpected errors that bubble up.
    // Most command-specific errors (like config not found) should be handled
    // within the command's own action handler for better context.
    console.error("\n\x1b[31m❌ An unexpected error occurred.\x1b[0m");
    if (error instanceof Error) {
      console.error(`   Message: ${error.message}`);
    }
    process.exit(1);
  }
}

// Execute the main function to start the CLI.
main();
