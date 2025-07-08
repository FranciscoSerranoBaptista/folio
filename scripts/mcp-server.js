#!/usr/bin/env node

/**
 * Folio MCP Server
 * 
 * This server provides MCP tools for querying Folio documentation APIs.
 * Based on Anthropic's MCP server pattern.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const FOLIO_API_BASE = "http://localhost:9001";

// Create server instance
const server = new McpServer({
  name: "folio",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Helper function for making Folio API requests
async function makeFolioRequest(endpoint, params = {}) {
  const url = new URL(`${FOLIO_API_BASE}${endpoint}`);
  
  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error making Folio request:", error);
    return null;
  }
}

// Register Folio tools
server.tool(
  "get-documents",
  "Get documents from Folio documentation",
  {
    type: z.string().optional().describe("Document type (adr, ticket, epic, etc.)"),
    status: z.string().optional().describe("Document status filter"),
    q: z.string().optional().describe("Search query for document content"),
    tags: z.string().optional().describe("Comma-separated tags to filter by"),
    limit: z.number().optional().describe("Maximum number of results (default: 50)"),
  },
  async ({ type, status, q, tags, limit }) => {
    const params = {
      type,
      status, 
      q,
      tags,
      limit,
    };

    const data = await makeFolioRequest("/api/documents", params);

    if (!data) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve documents from Folio API",
          },
        ],
      };
    }

    const documents = data.documents || [];
    if (documents.length === 0) {
      const filterDesc = Object.entries(params)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}=${value}`)
        .join(', ');
      
      return {
        content: [
          {
            type: "text",
            text: `No documents found${filterDesc ? ` with filters: ${filterDesc}` : ''}`,
          },
        ],
      };
    }

    // Format documents for display
    const formattedDocs = documents.map(doc => [
      `**${doc.title}**`,
      `Type: ${doc.type}`,
      `ID: ${doc.id || 'N/A'}`,
      `Status: ${doc.status || 'Unknown'}`,
      `File: ${doc.filePath}`,
      doc.tags && doc.tags.length > 0 ? `Tags: ${doc.tags.join(', ')}` : '',
      '---'
    ].filter(Boolean).join('\n'));

    const resultText = `Found ${documents.length} documents:\n\n${formattedDocs.join('\n')}`;

    return {
      content: [
        {
          type: "text",
          text: resultText,
        },
      ],
    };
  },
);

server.tool(
  "get-document",
  "Get a specific document by ID",
  {
    id: z.string().describe("Document ID"),
  },
  async ({ id }) => {
    const data = await makeFolioRequest(`/api/documents/${id}`);

    if (!data) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve document with ID: ${id}`,
          },
        ],
      };
    }

    const doc = data.document;
    if (!doc) {
      return {
        content: [
          {
            type: "text",
            text: `Document not found: ${id}`,
          },
        ],
      };
    }

    // Format document details
    const details = [
      `# ${doc.title}`,
      '',
      `**Type:** ${doc.type}`,
      `**ID:** ${doc.id || 'N/A'}`,
      `**Status:** ${doc.status || 'Unknown'}`,
      `**File:** ${doc.filePath}`,
      doc.tags && doc.tags.length > 0 ? `**Tags:** ${doc.tags.join(', ')}` : '',
      '',
      '## Content',
      doc.content || 'No content available',
    ].filter(Boolean).join('\n');

    return {
      content: [
        {
          type: "text",
          text: details,
        },
      ],
    };
  },
);

server.tool(
  "search-documents",
  "Search documents by content or metadata",
  {
    query: z.string().describe("Search query"),
    type: z.string().optional().describe("Filter by document type"),
    limit: z.number().optional().describe("Maximum number of results"),
  },
  async ({ query, type, limit }) => {
    const params = {
      q: query,
      type,
      limit,
    };

    const data = await makeFolioRequest("/api/documents", params);

    if (!data) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to search documents",
          },
        ],
      };
    }

    const documents = data.documents || [];
    if (documents.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No documents found matching: "${query}"`,
          },
        ],
      };
    }

    // Format search results
    const results = documents.map(doc => [
      `**${doc.title}**`,
      `Type: ${doc.type} | Status: ${doc.status || 'Unknown'}`,
      `File: ${doc.filePath}`,
      doc.summary ? `Summary: ${doc.summary}` : '',
      '---'
    ].filter(Boolean).join('\n'));

    const resultText = `Found ${documents.length} documents matching "${query}":\n\n${results.join('\n')}`;

    return {
      content: [
        {
          type: "text",
          text: resultText,
        },
      ],
    };
  },
);

server.tool(
  "get-health",
  "Check Folio API server health and status",
  {},
  async () => {
    const data = await makeFolioRequest("/api/health");

    if (!data) {
      return {
        content: [
          {
            type: "text",
            text: "❌ Folio API server is not responding",
          },
        ],
      };
    }

    const healthText = [
      "✅ Folio API Health Status",
      "",
      `Status: ${data.status}`,
      `Documents loaded: ${data.documents}`,
      `Timestamp: ${data.timestamp}`,
      "",
      `API Base URL: ${FOLIO_API_BASE}`,
    ].join('\n');

    return {
      content: [
        {
          type: "text",
          text: healthText,
        },
      ],
    };
  },
);

// Main function to run the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Folio MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});