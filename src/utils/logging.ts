/**
 * @file A centralized utility for styled console logging.
 * This ensures consistent formatting for success, error, warning, and info messages
 * across the entire CLI application. It uses `picocolors` for lightweight and
 * fast terminal styling.
 */

import pc from "picocolors";

/**
 * A collection of icons to prefix log messages for better readability.
 */
const ICONS = {
  success: pc.green("✅"),
  error: pc.red("❌"),
  warn: pc.yellow("⚠️"),
  info: pc.cyan("ℹ️"),
};

/**
 * A logger object with styled logging methods.
 */
const log = {
  /**
   * Logs a success message in green with a checkmark icon.
   * @param message The message to log.
   */
  success(message: string): void {
    console.log(`\n${ICONS.success} ${pc.green(message)}`);
  },

  /**
   * Logs an error message in red with a cross icon.
   * Accepts either a string or an Error object.
   * @param message The error message or Error object.
   */
  error(message: string | Error): void {
    const errorMessage = message instanceof Error ? message.message : message;
    console.error(
      `\n${ICONS.error} ${pc.red("Error:")} ${pc.red(errorMessage)}`,
    );
  },

  /**
   * Logs a warning message in yellow with a warning icon.
   * @param message The message to log.
   */
  warn(message: string): void {
    console.warn(
      `${ICONS.warn} ${pc.yellow("Warning:")} ${pc.yellow(message)}`,
    );
  },

  /**
   * Logs an informational message in cyan with an info icon.
   * @param message The message to log.
   */
  info(message: string): void {
    console.log(`${ICONS.info} ${pc.cyan(message)}`);
  },

  /**
   * Logs a plain message with no styling. A simple wrapper around console.log.
   * @param message The message to log.
   */
  message(...args: any[]): void {
    console.log(...args);
  },

  /**
   * Returns a highlighted string, typically for commands, file paths, or key terms.
   * Does not log to the console directly.
   * @param text The text to highlight.
   * @returns A styled string.
   */
  highlight(text: string): string {
    return pc.bold(pc.cyan(text));
  },

  /**
   * Prints a bold, underlined title to the console, useful for separating sections.
   * @param text The title text.
   */
  title(text: string): void {
    console.log(`\n${pc.bold(pc.underline(text))}`);
  },
};

export default log;
