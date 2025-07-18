import path from "node:path";
import { Command } from "commander";
import { createServer } from "vite";
import { loadConfig } from "../utils/config-loader";
import { FolioKnowledgeAPI } from "../utils/api-server";
import log from "../utils/logging";

/**
 * Handles the core logic for the 'serve' command.
 * @param options Command options, e.g., { port: 3000, open: true, api: false }.
 */
async function handleServe(options: { port: number; open: boolean; api: boolean }) {
  try {
    // 1. Load the project's config to find the documentation root.
    const { config, filepath } = await loadConfig();
    const configDir = path.dirname(filepath);
    const docsRoot = path.join(configDir, config.root);

    log.info(
      `Serving documentation from: ${path.relative(process.cwd(), docsRoot)}`,
    );

    if (options.api) {
      // Start Knowledge API server
      log.info("Starting Folio Knowledge API...");
      const api = new FolioKnowledgeAPI();
      await api.loadDocuments(docsRoot);
      const apiUrl = await api.start(options.port);
      
      log.info(`\n🚀 Folio Knowledge API is running at: ${apiUrl}`);
      log.info(`\nAvailable endpoints:`);
      log.info(`  GET ${apiUrl}/api/health`);
      log.info(`  GET ${apiUrl}/api/documents`);
      log.info(`  GET ${apiUrl}/api/documents/:id`);
      log.info(`\nExample queries:`);
      log.info(`  ${apiUrl}/api/documents?type=adr`);
      log.info(`  ${apiUrl}/api/documents?status=approved&limit=10`);
      log.info(`  ${apiUrl}/api/documents?q=authentication`);
      log.info(`\nPress Ctrl+C to stop the server.`);
    } else {
      // Start regular preview server
      log.info("Starting Folio live preview server...");
      
      // 2. Create a Vite development server instance.
      // Vite is a perfect tool for a fast, modern static file server with HMR.
      const server = await createServer({
        // The `root` option tells Vite where the source files are.
        // This will become the root of the web server.
        root: docsRoot,
        server: {
          port: options.port,
          // The `open` option automatically opens the default browser.
          open: options.open,
        },
        // Clear the screen for a cleaner startup message
        clearScreen: false,
      });

      // 3. Start the server.
      await server.listen();

      // 4. Print the server URLs to the console.
      log.info("\nServer is running! You can view your documentation at:\n");
      server.printUrls();
      log.info("\nPress Ctrl+C to stop the server.");
    }
  } catch (error) {
    if (error instanceof Error) {
      log.error(`Error starting server: ${error.message}`);
    } else {
      log.error("An unexpected error occurred.");
    }
    process.exit(1);
  }
}

/**
 * Creates and configures the `serve` command for the Folio CLI.
 */
export function createServeCommand(): Command {
  const cmd = new Command("serve");

  cmd
    .description(
      "Starts a local live-reloading server to preview your documentation or API server for programmatic access.",
    )
    .option(
      "-p, --port <number>",
      "Specify the port to run the server on.",
      "3000",
    )
    .option("--no-open", "Do not automatically open the browser.")
    .option("--api", "Start the Knowledge API server instead of the preview server.")
    .action((opts) => {
      // Commander passes parsed options. We need to parse the port to a number.
      const parsedOpts = {
        port: parseInt(opts.port, 10),
        open: opts.open, // `open` will be false if --no-open is used
        api: opts.api || false,
      };
      handleServe(parsedOpts);
    });

  return cmd;
}
