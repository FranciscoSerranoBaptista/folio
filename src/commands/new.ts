import path from "node:path";
import { Command } from "commander";
import matter from "gray-matter";
import Handlebars from "handlebars";
import { loadConfig } from "../utils/config-loader";
import {
  generateSequentialFilename,
  readTemplateFile,
  writeDocFile,
} from "../utils/files";
import { updateIndexFile } from "../utils/indexing";

async function handleNew(type: string, title: string) {
  // 1. Load config
  const { config, filepath } = await loadConfig();
  const configDir = path.dirname(filepath);
  const docTypeConfig = config.types[type];

  // 2. Generate filename
  const filename = await generateSequentialFilename(
    docTypeConfig,
    title,
    config,
    configDir,
  );
  const id = parseInt(filename.split("-")[0], 10);

  // 3. Populate front matter data
  const frontmatterData = { id, title, date: new Date(), status: "proposed" };

  // 4. Compile template with data
  const templateContent = await readTemplateFile(
    docTypeConfig.template,
    configDir,
  );
  const compiledTemplate = Handlebars.compile(templateContent);
  const markdownBody = compiledTemplate(frontmatterData);

  // 5. Create final file content
  const finalContent = matter.stringify(markdownBody, frontmatterData);

  // 6. Write the file
  const newFilePath = await writeDocFile(
    docTypeConfig,
    filename,
    finalContent,
    config,
    configDir,
  );

  console.log(
    `✅ Successfully created: ${path.relative(process.cwd(), newFilePath)}`,
  );

  // Now, update the index for this document type
  try {
    await updateIndexFile(docTypeConfig, config, configDir);
  } catch (indexError) {
    const error =
      indexError instanceof Error ? indexError : new Error(String(indexError));
    console.error(
      `\x1b[33m⚠️ Could not update the index file: ${error.message}\x1b[0m`,
    );
  }

  // Update navigation for LLM accessibility
  try {
    const { handleGenerateNav } = await import("./generate-nav");
    await handleGenerateNav();
  } catch (_navError) {
    // Navigation generation is optional, don't fail the whole operation
    console.log(
      "\x1b[33mℹ️ Run 'folio generate-nav' to update navigation files\x1b[0m",
    );
  }
}

export function createNewCommand(): Command {
  const cmd = new Command("new");

  cmd
    .description("Create a new document from a template (e.g., adr, ticket).")
    .argument(
      "<type>",
      'The type of document to create (e.g., "adr", "ticket").',
    )
    .argument("<title>", "The title of the new document.")
    .option("-e, --epic <id>", "Link to an epic ID.")
    .option("-s, --sprint <id>", "Link to a sprint ID.")
    .action(handleNew);

  return cmd;
}
