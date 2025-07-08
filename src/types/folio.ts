/**
 * @fileoverview Defines the core type definitions for the Folio CLI configuration.
 * These types are used to validate the user's `folio.config.ts` and to guide
 * the CLI's operations.
 */

//==============================================================================
// Front Matter Field Schema
// Defines the validation rules for a single field in a document's front matter.
//==============================================================================

/**
 * A function that generates a default value for a front matter field.
 * @returns The generated default value.
 */
export type DefaultValueGenerator = () => string | number | boolean | Date;

/**
 * Defines the schema for a single field within the front matter of a document.
 * This object is used to create, validate, and manipulate front matter data.
 */
/**
 * Defines the schema for a single field within the front matter of a document.
 * This object is used to create, validate, and manipulate front matter data.
 */
export interface FrontmatterField {
  /** The data type of the field's value (or the type of items if isArray is true). */
  type: "string" | "number" | "boolean" | "date";

  /** If true, this field must be present in the front matter. */
  required?: boolean;

  /** If true, the value must be unique across all documents of the same type. */
  unique?: boolean;

  /** If true, the field is an array of the specified `type`. */
  isArray?: boolean;

  /** A default value or a function to generate one. */
  default?: any | (() => any);

  /** An array of allowed values for this field. */
  enum?: readonly (string | number)[];

  // --- New fields added to support advanced validation from JSON Schema ---

  /** A RegExp pattern that string values must match. */
  pattern?: RegExp;

  /** The minimum length for a string or the minimum number of items in an array. */
  minLength?: number;

  /** The minimum value for a number. */
  minimum?: number;
}

/**
 * A map defining the entire front matter schema for a document type.
 * The keys are the names of the front matter fields (e.g., 'title', 'status').
 */
export type FrontmatterSchema = {
  [fieldName: string]: FrontmatterField;
};

//==============================================================================
// Document Type and Indexing Configuration
// Defines a single type of document (like an ADR) and how to index it.
//==============================================================================

/**
 * Configuration for how an `index.md` file should be generated for a document type.
 */
export interface IndexingConfig {
  /**
   * An array of front matter field names to be used as columns in the
   * generated markdown table or list.
   */
  columns: string[];

  /**
   * The format for the generated index.
   * - 'table': A markdown table.
   * - 'list': A markdown bulleted list.
   * @default 'table'
   */
  format?: "table" | "list";
}

/**
 * Defines a complete configuration for a single document type, such as an
 * ADR, Sprint, or Ticket.
 */
export interface DocumentType {
  /**
   * The name of the subdirectory within the `root` where these documents are stored.
   * Example: 'adr' will result in a path like `docs/adr/`.
   */
  path: string;

  /**
   * The filename of the Handlebars template to use for creating new documents of this type.
   * The path is relative to the `templates/` directory in the user's project.
   * Example: 'adr.md'
   */
  template: string;

  /**
   * The schema that defines the structure and rules of the front matter for this
   * document type.
   */
  frontmatter: FrontmatterSchema;
}

//==============================================================================
// Top-Level Folio Configuration
// This is the main configuration object that users will define.
//==============================================================================

/**
 * The main configuration object for the Folio CLI.
 * This is the expected structure of the user's `folio.config.ts` file.
 */
export interface FolioConfig {
  /**
   * The root directory where all documentation will be stored.
   * @default 'docs'
   */
  root: string;

  /**
   * An object defining all the document types managed by Folio.
   * The key is the identifier for the type (e.g., 'adr', 'sprint') and is used
   * in CLI commands like `folio new adr ...`.
   */
  types: {
    [name: string]: DocumentType;
  };

  /**
   * Global configuration for how all index files are generated.
   * This can be overridden on a per-type basis if needed in the future.
   */
  indexing: IndexingConfig;
}

//==============================================================================
// Helper Function
// Provides type-safety and autocompletion for the user's config file.
//==============================================================================

/**
 * A helper function to provide type-safety and autocompletion for your Folio
 * configuration. Wrap your configuration object in this function.
 *
 * @example
 * ```ts
 * // folio.config.ts
 * import { defineConfig } from 'folio-cli';
 *
 * export default defineConfig({
 *   root: 'docs',
 *   // ...
 * });
 * ```
 * @param config The Folio configuration object.
 * @returns The same configuration object, but with type checking.
 */
export function defineConfig(config: FolioConfig): FolioConfig {
  return config;
}
