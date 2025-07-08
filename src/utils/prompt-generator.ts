import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

interface PromptOptions {
  provider: string;
  readonly: boolean;
  includeCreate: boolean;
  apiPort: number;
  docsRoot: string;
  config: any;
}

interface DocumentType {
  type: string;
  count: number;
  statuses: Set<string>;
  tags: Set<string>;
}

/**
 * Generates a comprehensive AI system prompt for accessing Folio project knowledge
 */
export async function generateSystemPrompt(options: PromptOptions): Promise<string> {
  // Analyze the project to understand document types and patterns
  const analysis = await analyzeProject(options.docsRoot);
  
  // Generate the base system prompt
  const systemPrompt = generateBasePrompt(analysis, options);
  
  // Generate tool definitions based on provider
  const tools = generateToolDefinitions(options.provider, analysis, options);
  
  // Combine into final prompt
  return combinePrompt(systemPrompt, tools, options);
}

/**
 * Analyzes the project to understand document types, statuses, and patterns
 */
async function analyzeProject(docsRoot: string): Promise<{
  documentTypes: DocumentType[];
  totalDocuments: number;
  commonTags: string[];
  commonStatuses: string[];
}> {
  const documentTypes = new Map<string, DocumentType>();
  const allTags = new Set<string>();
  const allStatuses = new Set<string>();
  let totalDocuments = 0;

  try {
    const files = await findMarkdownFiles(docsRoot);
    
    for (const filePath of files) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter } = matter(content);
        
        totalDocuments++;
        
        const type = frontmatter.type || 'document';
        if (!documentTypes.has(type)) {
          documentTypes.set(type, {
            type,
            count: 0,
            statuses: new Set(),
            tags: new Set()
          });
        }
        
        const docType = documentTypes.get(type)!;
        docType.count++;
        
        if (frontmatter.status) {
          docType.statuses.add(frontmatter.status);
          allStatuses.add(frontmatter.status);
        }
        
        if (frontmatter.tags) {
          const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [frontmatter.tags];
          tags.forEach(tag => {
            docType.tags.add(tag);
            allTags.add(tag);
          });
        }
      } catch (error) {
        // Skip files that can't be parsed
      }
    }
  } catch (error) {
    // If we can't analyze, continue with defaults
  }

  return {
    documentTypes: Array.from(documentTypes.values()),
    totalDocuments,
    commonTags: Array.from(allTags).slice(0, 20), // Top 20 tags
    commonStatuses: Array.from(allStatuses)
  };
}

/**
 * Recursively finds all markdown files
 */
async function findMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  async function scanDir(currentDir: string) {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          await scanDir(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }
  
  await scanDir(dir);
  return files;
}

/**
 * Generates the base system prompt text
 */
function generateBasePrompt(analysis: any, options: PromptOptions): string {
  const { documentTypes, totalDocuments } = analysis;
  
  const documentTypesList = documentTypes
    .map((dt: DocumentType) => `- **${dt.type}** (${dt.count} documents)`)
    .join('\n');

  return `You are an expert AI software engineer and core contributor to this project.

Your primary goal is to help with software development tasks by leveraging the project's comprehensive knowledge base. You have access to ${totalDocuments} structured documents that contain the project's architectural decisions, requirements, and planning information.

**PROJECT KNOWLEDGE OVERVIEW:**
${documentTypesList}

**DOCUMENTATION STRUCTURE:**
- Each directory contains a README.md file with an index of documents in that directory
- The root docs/ directory has a comprehensive README.md with navigation and search capabilities
- Templates are stored in docs/_templates/ for creating new documents
- All indexes are automatically maintained by Folio CLI commands

**YOUR REASONING PROCESS:**

1. **Understand the Request:** Clarify what the user wants to accomplish.

2. **Research First:** Before writing any code, use the available tools to search the project's knowledge base:
   - Look for existing architectural decisions (ADRs) related to the task
   - Find relevant epics, tickets, or planning documents
   - Understand existing patterns and constraints

3. **Synthesize Information:** Review what you've found and identify:
   - Existing decisions that guide your implementation
   - Gaps in documentation or missing architectural decisions
   - Conflicts between different documents

4. **Propose When Needed:** If critical architectural decisions are missing:
   ${options.includeCreate 
     ? '- Draft new ADRs or tickets using the create_document tool\n   - Present your proposal and seek human approval before proceeding'
     : '- Identify what decisions need to be made\n   - Ask the human to create the necessary documentation'
   }

5. **Implement Thoughtfully:** Write code that aligns with documented decisions and established patterns.

**IMPORTANT GUIDELINES:**
- Always search for existing knowledge before making assumptions
- Use precise filters (type, status, tags) for efficient queries
- When in doubt, ask for clarification rather than guessing
- Follow the project's established architectural patterns
- ${options.includeCreate ? 'Document your own architectural decisions when creating new features' : 'Request documentation for new architectural decisions'}

You have access to a Folio Knowledge API running at http://localhost:${options.apiPort} with the following capabilities:`;
}

interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

/**
 * Generates tool definitions based on the AI provider format
 */
function generateToolDefinitions(provider: string, analysis: any, options: PromptOptions): any {
  const { documentTypes, commonStatuses, commonTags } = analysis;
  
  const typeEnum = documentTypes.map((dt: DocumentType) => dt.type);
  const statusEnum = commonStatuses.length > 0 ? commonStatuses : ['Proposed', 'Accepted', 'Deprecated', 'In Progress', 'Done'];
  
  const baseTools: ToolDefinition[] = [
    {
      name: "search_documents",
      description: `Search and filter project documents. This is your primary research tool. Use type filters for efficient queries. Available document types: ${typeEnum.join(', ')}.`,
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            description: "Filter by document type for precise results",
            enum: typeEnum
          },
          status: {
            type: "string", 
            description: "Filter by status (e.g., 'Accepted' for approved ADRs)",
            enum: statusEnum
          },
          tags: {
            type: "string",
            description: `Comma-separated tags to filter by. Common tags: ${commonTags.slice(0, 10).join(', ')}`
          },
          q: {
            type: "string",
            description: "Natural language search query for content-based search"
          },
          limit: {
            type: "number",
            description: "Maximum number of results (default: 50)"
          }
        }
      }
    },
    {
      name: "get_document_by_id", 
      description: "Retrieve the complete content of a specific document when you have its ID",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The document ID (e.g., 'adrs-001-auth', 'tickets-backend-101')"
          }
        },
        required: ["id"]
      }
    }
  ];

  if (options.includeCreate) {
    baseTools.push({
      name: "create_document",
      description: "Create new project documentation. Use this when architectural decisions are missing or new requirements need to be documented.",
      parameters: {
        type: "object", 
        properties: {
          type: {
            type: "string",
            description: "Type of document to create",
            enum: typeEnum
          },
          title: {
            type: "string",
            description: "Clear, descriptive title for the document"
          },
          content: {
            type: "string", 
            description: "Full Markdown content following project templates"
          },
          frontmatter: {
            type: "object",
            description: "YAML frontmatter with metadata like status, tags, etc."
          }
        },
        required: ["type", "title", "content"]
      }
    });
  }

  // Format based on provider
  switch (provider.toLowerCase()) {
    case 'openai':
      return formatForOpenAI(baseTools);
    case 'claude':
      return formatForClaude(baseTools);
    case 'gemini':
      return formatForGemini(baseTools);
    default:
      return formatGeneric(baseTools);
  }
}

function formatForOpenAI(tools: any[]): string {
  return `
**AVAILABLE FUNCTIONS:**

You have access to the following functions. Call them using the function calling format.

\`\`\`json
${JSON.stringify(tools, null, 2)}
\`\`\`

**EXAMPLE USAGE:**
\`\`\`json
{
  "function_call": {
    "name": "search_documents",
    "arguments": {
      "type": "adr",
      "status": "Accepted",
      "tags": "authentication,security"
    }
  }
}
\`\`\``;
}

function formatForClaude(tools: any[]): string {
  const toolDescriptions = tools.map(tool => {
    const params = Object.entries(tool.parameters.properties || {})
      .map(([key, value]: [string, any]) => `${key}: ${value.description}`)
      .join(', ');
    
    return `- **${tool.name}**: ${tool.description}
  Parameters: ${params}`;
  }).join('\n\n');

  return `
**AVAILABLE TOOLS:**

${toolDescriptions}

**EXAMPLE USAGE:**
To search for authentication-related ADRs:
\`search_documents(type="adr", tags="authentication", status="Accepted")\`

To get a specific document:
\`get_document_by_id(id="adrs-001-auth")\``;
}

function formatForGemini(tools: any[]): string {
  return `
**AVAILABLE TOOLS:**

${JSON.stringify(tools, null, 2)}

Use these tools by calling them as functions in your response.`;
}

function formatGeneric(tools: any[]): string {
  return `
**AVAILABLE API ENDPOINTS:**

${tools.map(tool => `
**${tool.name}**
${tool.description}

Parameters: ${JSON.stringify(tool.parameters, null, 2)}
`).join('\n')}

Make HTTP requests to: http://localhost:${3000}/api/documents`;
}

/**
 * Combines the system prompt and tool definitions
 */
function combinePrompt(systemPrompt: string, tools: string, options: PromptOptions): string {
  return `${systemPrompt}

${tools}

**WORKFLOW EXAMPLES:**

1. **Implementing a new feature:**
   - Search for related ADRs: \`search_documents(type="adr", q="feature name")\`
   - Check for existing tickets: \`search_documents(type="ticket", q="feature name")\`
   - Review architectural constraints before coding

2. **Bug investigation:**
   - Search for related documentation: \`search_documents(q="bug area OR component")\`
   - Look for existing tickets: \`search_documents(type="ticket", status="Done", q="similar bug")\`

3. **Architectural decisions:**
   - Search existing ADRs: \`search_documents(type="adr", status="Accepted")\`
   - ${options.includeCreate ? 'Create new ADR if needed: `create_document(type="adr", ...)`' : 'Request new ADR creation if decisions are missing'}

Remember: Always research first, then implement. Your code should reflect the project's documented architectural decisions and established patterns.

---

**API SERVER:** Make sure the Folio Knowledge API is running at http://localhost:${options.apiPort}
Start it with: \`folio serve --api --port ${options.apiPort}\``;
}