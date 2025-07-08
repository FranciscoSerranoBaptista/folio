import path from "node:path";
import { Command } from "commander";
import { createServer } from "vite";
import { loadConfig } from "../utils/config-loader";
import log from "../utils/logging";

/**
 * Handles the core logic for the 'serve' command.
 * @param options Command options, e.g., { port: 3000, open: true }.
 */
async function handleServe(options: { port: number; open: boolean }) {
  log.info("Starting Folio live preview server...");

  try {
    // 1. Load the project's config to find the documentation root.
    const { config, filepath } = await loadConfig();
    const configDir = path.dirname(filepath);
    const docsRoot = path.join(configDir, config.root);

    log.info(
      `Serving documentation from: ${path.relative(process.cwd(), docsRoot)}`,
    );

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
      "Starts a local live-reloading server to preview your documentation.",
    )
    .option(
      "-p, --port <number>",
      "Specify the port to run the server on.",
      "3000",
    )
    .option("--no-open", "Do not automatically open the browser.")
    .action((opts) => {
      // Commander passes parsed options. We need to parse the port to a number.
      const parsedOpts = {
        port: parseInt(opts.port, 10),
        open: opts.open, // `open` will be false if --no-open is used
      };
      handleServe(parsedOpts);
    });

  return cmd;
}
