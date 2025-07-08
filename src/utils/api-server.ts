import Fastify, { FastifyInstance } from 'fastify';
import path from 'node:path';
import fs from 'node:fs/promises';
import matter from 'gray-matter';
import log from './logging';

interface DocumentMetadata {
  id: string;
  filePath: string;
  type?: string;
  status?: string;
  tags?: string[];
  title?: string;
  [key: string]: any;
}

interface DocumentWithContent extends DocumentMetadata {
  content: string;
}

class FolioKnowledgeAPI {
  private documents: Map<string, DocumentWithContent> = new Map();
  private server: FastifyInstance;

  constructor() {
    this.server = Fastify({ logger: false });
    this.setupRoutes();
  }

  private setupRoutes() {
    // GET /api/documents - Search/filter documents
    this.server.get('/api/documents', async (request) => {
      const query = request.query as any;
      let results = Array.from(this.documents.values());

      // Filter by metadata
      if (query.type) {
        results = results.filter(doc => doc.type === query.type);
      }
      if (query.status) {
        results = results.filter(doc => doc.status === query.status);
      }
      if (query.tags) {
        const queryTags = query.tags.split(',');
        results = results.filter(doc => 
          doc.tags && queryTags.some((tag: string) => doc.tags!.includes(tag))
        );
      }

      // Simple text search in title and content
      if (query.q) {
        const searchTerm = query.q.toLowerCase();
        results = results.filter(doc => 
          doc.title?.toLowerCase().includes(searchTerm) ||
          doc.content.toLowerCase().includes(searchTerm)
        );
      }

      // Limit results
      const limit = query.limit ? parseInt(query.limit) : 50;
      results = results.slice(0, limit);

      // Return metadata only (no content)
      const metadata = results.map(({ content, ...meta }) => meta);
      
      return { documents: metadata, total: metadata.length };
    });

    // GET /api/documents/:id - Get single document with content
    this.server.get('/api/documents/:id', async (request, reply) => {
      const { id } = request.params as { id: string };
      const document = this.documents.get(id);
      
      if (!document) {
        reply.code(404);
        return { error: 'Document not found' };
      }
      
      return { document };
    });

    // GET /api/health - Health check
    this.server.get('/api/health', async () => {
      return { 
        status: 'ok', 
        documents: this.documents.size,
        timestamp: new Date().toISOString()
      };
    });
  }

  async loadDocuments(docsRoot: string) {
    log.info('Loading documents into knowledge API...');
    this.documents.clear();

    try {
      // Find all markdown files
      const markdownFiles = await this.findMarkdownFiles(docsRoot);
      
      for (const filePath of markdownFiles) {
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const { data: frontmatter, content: markdownContent } = matter(content);
          
          // Generate ID from file path
          const relativePath = path.relative(docsRoot, filePath);
          const id = this.generateId(relativePath);
          
          const document: DocumentWithContent = {
            id,
            filePath: relativePath,
            content: markdownContent,
            title: frontmatter.title || path.basename(filePath, '.md'),
            ...frontmatter
          };
          
          this.documents.set(id, document);
        } catch (error) {
          log.warn(`Failed to parse ${filePath}: ${error}`);
        }
      }
      
      log.info(`Loaded ${this.documents.size} documents`);
    } catch (error) {
      log.error(`Error loading documents: ${error}`);
    }
  }

  private async findMarkdownFiles(docsRoot: string): Promise<string[]> {
    const files: string[] = [];
    
    async function scanDir(dir: string) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
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
    
    await scanDir(docsRoot);
    return files;
  }

  private generateId(filePath: string): string {
    // Convert path to simple ID: docs/adrs/001-auth.md -> adr-001-auth
    return filePath
      .replace(/\//g, '-')
      .replace(/\.md$/, '')
      .replace(/^docs-/, '')
      .toLowerCase();
  }

  async start(port: number): Promise<string> {
    try {
      await this.server.listen({ port, host: '0.0.0.0' });
      return `http://localhost:${port}`;
    } catch (error) {
      throw new Error(`Failed to start API server: ${error}`);
    }
  }

  async stop() {
    await this.server.close();
  }
}

export { FolioKnowledgeAPI };