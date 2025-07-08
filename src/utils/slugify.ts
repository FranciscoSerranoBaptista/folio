/**
 * @file A utility function to convert a string into a URL-friendly slug.
 */

/**
 * Converts a string into a clean, URL-safe slug.
 * Example: "This is a Test!" -> "this-is-a-test"
 * @param text The input string to slugify.
 * @returns The slugified string.
 */
export function slugify(text: string): string {
  if (!text) return "";
  return (
    text
      .toString()
      .toLowerCase()
      .trim()
      // Replace spaces and underscores with a hyphen
      .replace(/[\s_]+/g, "-")
      // Remove all characters that are not a word character (a-z, 0-9, _), a hyphen, or a dot.
      .replace(/[^\w\-.]+/g, "")
      // Replace multiple hyphens with a single hyphen
      .replace(/--+/g, "-")
      // Remove leading or trailing hyphens
      .replace(/^-+/, "")
      .replace(/-+$/, "")
  );
}
