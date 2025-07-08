/**
 * @file Contains the logic for the `folio validate` command.
 * It checks all managed documents against the schemas defined in folio.config.ts.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { Command } from "commander";
import matter from "gray-matter";
import { type ZodError, z } from "zod";
import type {
  DocumentType,
  FolioConfig,
  FrontmatterSchema,
} from "../types/folio";
import { loadConfig } from "../utils/config-loader";
import log from "../utils/logging";

/**
 * Dynamically builds a Zod schema from a Folio front matter configuration.
 * @param schemaConfig The front matter schema from folio.config.ts.
 * @returns A Zod object schema for validation.
 */
function buildZodSchema(schemaConfig: FrontmatterSchema): z.ZodObject<any> {
  const zodShape: { [key: string]: z.ZodTypeAny } = {};

  for (const fieldName in schemaConfig) {
    const field = schemaConfig[fieldName];
    let validator: z.ZodTypeAny;

    // Base type
    switch (field.type) {
      case "string":
        validator = z.string({ invalid_type_error: "Must be a string" });
        if (field.minLength)
          validator = (validator as z.ZodString).min(field.minLength);
        if (field.pattern)
          validator = (validator as z.ZodString).regex(
            field.pattern,
            `Must match pattern: ${field.pattern}`,
          );
        break;
      case "number":
        validator = z.number({ invalid_type_error: "Must be a number" });
        if (field.minimum !== undefined)
          validator = (validator as z.ZodNumber).min(field.minimum);
        break;
      case "boolean":
        validator = z.boolean({ invalid_type_error: "Must be true or false" });
        break;
      case "date":
        // A simple check for YYYY-MM-DD format
        validator = z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be in YYYY-MM-DD format");
        break;
    }

    // Handle enums
    if (field.enum) {
      // Zod enums require at least one value.
      const [first, ...rest] = field.enum.map(String);
      if (first) {
        validator = z.enum([first, ...rest]);
      }
    }

    // Handle arrays
    if (field.isArray) {
      validator = z.array(validator);
    }

    // Handle optional vs. required fields
    if (!field.required) {
      validator = validator.optional();
    }

    zodShape[fieldName] = validator;
  }

  return z.object(zodShape).strict(); // .strict() flags unknown fields as errors
}

/**
 * Validates all documents of a single type against its schema.
 * @param typeName The name of the document type (e.g., 'adr').
 * @param docTypeConfig The configuration for this document type.
 * @param globalConfig The global Folio configuration.
 * @param configDir The directory where the config file was found.
 * @returns An object containing the count of checked files and a list of error messages.
 */
async function validateDocType(
  docTypeConfig: DocumentType,
  globalConfig: FolioConfig,
  configDir: string,
) {
  let fileCount = 0;
  const errors: string[] = [];
  const uniqueValueMaps = new Map<string, Map<any, string>>();

  // Prepare maps for uniqueness checks
  for (const fieldName in docTypeConfig.frontmatter) {
    if (docTypeConfig.frontmatter[fieldName].unique) {
      uniqueValueMaps.set(fieldName, new Map());
    }
  }

  const schema = buildZodSchema(docTypeConfig.frontmatter);
  const typeDir = path.join(configDir, globalConfig.root, docTypeConfig.path);
  const files = await fs.readdir(typeDir).catch(() => []);

  for (const file of files) {
    if (!file.endsWith(".md") && !file.endsWith(".mdx")) continue;
    fileCount++;

    const filePath = path.join(typeDir, file);
    try {
      const content = await fs.readFile(filePath, "utf-8");
      const { data } = matter(content);
      const result = schema.safeParse(data);

      if (!result.success) {
        const errorList = (result.error as ZodError).errors
          .map((e) => `  - ${e.path.join(".")}: ${e.message}`)
          .join("\n");
        errors.push(
          `Invalid frontmatter in ${log.highlight(file)}:\n${errorList}`,
        );
      } else {
        // Check for uniqueness
        for (const [fieldName, valueMap] of uniqueValueMaps.entries()) {
          const value = result.data[fieldName];
          if (value === undefined || value === null) continue;

          if (valueMap.has(value)) {
            errors.push(
              `Duplicate value for unique field '${fieldName}' in ${log.highlight(file)}. First seen in ${log.highlight(valueMap.get(value) ?? "unknown")}.`,
            );
          } else {
            valueMap.set(value, file);
          }
        }
      }
    } catch (e: unknown) {
      errors.push(
        `Could not read or parse ${log.highlight(file)}: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }
  return { fileCount, errors };
}

/**
 * Handles the main logic for the 'folio validate' command.
 * @param type An optional document type to validate. If omitted, all types are validated.
 */
async function handleValidate(type?: string): Promise<void> {
  log.title("Running Documentation Validation");
  let totalFilesChecked = 0;
  let totalErrorsFound = 0;
  const allErrors: string[] = [];

  try {
    const { config, filepath } = await loadConfig();
    const configDir = path.dirname(filepath);

    const typesToValidate = type
      ? { [type]: config.types[type] }
      : config.types;
    if (type && !config.types[type]) {
      log.error(
        `Document type '${type}' is not defined in your folio.config.ts.`,
      );
      return;
    }

    for (const typeName in typesToValidate) {
      log.info(`Validating type: ${log.highlight(typeName)}...`);
      const { fileCount, errors } = await validateDocType(
        typesToValidate[typeName],
        config,
        configDir,
      );
      totalFilesChecked += fileCount;
      totalErrorsFound += errors.length;
      allErrors.push(...errors);
    }

    log.title("Validation Summary");
    if (totalErrorsFound === 0) {
      log.success(`All ${totalFilesChecked} documents are valid!`);
    } else {
      log.error(
        `${totalErrorsFound} error(s) found in ${totalFilesChecked} documents checked.`,
      );
      allErrors.forEach((err) => log.message(`\n- ${err}`));
      process.exit(1); // Exit with an error code for CI/CD pipelines
    }
  } catch (error) {
    log.error(
      error instanceof Error ? error : new Error("An unknown error occurred."),
    );
    process.exit(1);
  }
}

/**
 * Creates and configures the `validate` command for the Folio CLI.
 */
export function createValidateCommand(): Command {
  const cmd = new Command("validate");

  cmd
    .description(
      "Validate document front matter against the schemas in folio.config.ts.",
    )
    .argument("[type]", "Optional: a specific document type to validate.")
    .action(handleValidate);

  return cmd;
}
