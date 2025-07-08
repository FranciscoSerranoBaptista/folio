import { cosmiconfig } from "cosmiconfig";
import { TypeScriptLoader } from "cosmiconfig-typescript-loader";
import { z } from "zod";
import type { FolioConfig } from "../types/folio";

// --- Zod Schema for Validation ---
// This schema provides runtime validation for the user's config file.
// It should be kept in sync with the `FolioConfig` type in `src/types/folio.ts`.

const FrontmatterFieldSchema = z.object({
  type: z.enum(["string", "number", "boolean", "date"]),
  required: z.boolean().optional(),
  unique: z.boolean().optional(),
  isArray: z.boolean().optional(),
  default: z.any().optional(), // `any` because it can be a value or a function
  enum: z
    .array(z.union([z.string(), z.number()]))
    .readonly()
    .optional(),
  pattern: z.instanceof(RegExp).optional(),
  minLength: z.number().optional(),
  minimum: z.number().optional(),
});

const DocumentTypeSchema = z.object({
  path: z.string().min(1, { message: "DocumentType path cannot be empty." }),
  template: z
    .string()
    .min(1, { message: "DocumentType template cannot be empty." }),
  frontmatter: z.record(FrontmatterFieldSchema),
});

const IndexingConfigSchema = z.object({
  columns: z.array(z.string()),
  format: z.enum(["table", "list"]).optional(),
});

const FolioConfigSchema = z.object({
  root: z.string().default("docs"),
  types: z.record(DocumentTypeSchema),
  indexing: IndexingConfigSchema,
});

/**
 * The result of a successful config load operation.
 */
export interface LoadConfigResult {
  /** The validated configuration object. */
  config: FolioConfig;
  /** The absolute path to the loaded configuration file. */
  filepath: string;
}

/**
 * Finds, loads, and validates the `folio.config.ts` file.
 * It searches up from the current working directory.
 *
 * @param cwd - The starting directory for the search. Defaults to `process.cwd()`.
 * @returns A promise that resolves to the loaded config and its file path.
 * @throws An error if the config file is not found or is invalid.
 */
export async function loadConfig(
  cwd: string = process.cwd(),
): Promise<LoadConfigResult> {
  // The moduleName 'folio' tells cosmiconfig to search for `folio.config.ts`, `.foliorc.ts`, etc.
  const moduleName = "folio";
  const explorer = cosmiconfig(moduleName, {
    // We use a specific loader for `.ts` files to transpile them on the fly.
    loaders: {
      ".ts": TypeScriptLoader(),
    },
    // We only care about these specific file names.
    searchPlaces: [`${moduleName}.config.ts`, `${moduleName}.config.js`],
  });

  const result = await explorer.search(cwd);

  // Handle case where no config file is found.
  if (!result || result.isEmpty) {
    throw new Error(
      `Could not find a Folio configuration file (e.g., folio.config.ts).\nPlease run 'folio init' to create one.`,
    );
  }

  // Use Zod to validate the loaded configuration object.
  const validationResult = FolioConfigSchema.safeParse(result.config);

  if (!validationResult.success) {
    // Format Zod's errors into a user-friendly message.
    const errorMessages = validationResult.error.errors.map(
      (err) => `  - Path: ${err.path.join(".") || "."}: ${err.message}`,
    );
    throw new Error(
      `Invalid configuration in ${result.filepath}:\n${errorMessages.join("\n")}`,
    );
  }

  return {
    config: validationResult.data,
    filepath: result.filepath,
  };
}
