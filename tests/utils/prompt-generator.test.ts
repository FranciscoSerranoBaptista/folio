import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vol } from 'memfs';

// Mock file system
vi.mock('node:fs/promises', async () => {
  const memfs = await vi.importActual('memfs');
  return memfs.fs.promises;
});

vi.mock('node:fs', async () => {
  const memfs = await vi.importActual('memfs');
  return {
    ...memfs.fs,
    promises: memfs.fs.promises,
  };
});

describe('prompt-generator', () => {
  beforeEach(() => {
    vol.reset();
  });

  describe('project analysis', () => {
    it('should analyze project documents correctly', async () => {
      // Setup mock project structure
      vol.fromJSON({
        '/test-project/docs/adrs/001-auth.md': `---
title: "Choose JWT Authentication"
type: adr
status: Accepted
tags: [security, authentication]
---

# Choose JWT Authentication

## Status
Accepted

## Decision
Use JWT tokens.`,
        '/test-project/docs/tickets/backend-101.md': `---
title: "User Registration API"
type: ticket
status: In Progress
tags: [backend, api]
---

# User Registration API

Implement user registration.`,
        '/test-project/docs/epics/user-mgmt.md': `---
title: "User Management Epic"
type: epic
status: Active
tags: [user-management, backend]
---

# User Management Epic

Complete user management system.`
      });

      const { generateSystemPrompt } = await import('../../src/utils/prompt-generator');
      
      const prompt = await generateSystemPrompt({
        provider: 'claude',
        readonly: false,
        includeCreate: true,
        apiPort: 3000,
        docsRoot: '/test-project/docs',
        config: {}
      });

      // Should include document counts
      expect(prompt).toMatch(/\d+ structured documents/);
      
      // Should include basic prompt structure
      expect(prompt).toContain('**YOUR REASONING PROCESS:**');
      expect(prompt).toContain('search_documents');
      expect(prompt).toContain('get_document_by_id');
    });

    it('should handle empty projects gracefully', async () => {
      vol.fromJSON({
        '/empty-project/docs/': null
      });

      const { generateSystemPrompt } = await import('../../src/utils/prompt-generator');
      
      const prompt = await generateSystemPrompt({
        provider: 'claude',
        readonly: false,
        includeCreate: true,
        apiPort: 3000,
        docsRoot: '/empty-project/docs',
        config: {}
      });

      expect(prompt).toContain('0 structured documents');
      expect(prompt).toContain('search_documents');
    });
  });

  describe('AI provider formats', () => {
    beforeEach(() => {
      // Setup basic project
      vol.fromJSON({
        '/test-project/docs/adrs/001-auth.md': `---
title: "Auth ADR"
type: adr
status: Accepted
---

# Auth decision`
      });
    });

    it('should generate Claude-specific format', async () => {
      const { generateSystemPrompt } = await import('../../src/utils/prompt-generator');
      
      const prompt = await generateSystemPrompt({
        provider: 'claude',
        readonly: false,
        includeCreate: true,
        apiPort: 3000,
        docsRoot: '/test-project/docs',
        config: {}
      });

      expect(prompt).toContain('**AVAILABLE TOOLS:**');
      expect(prompt).toContain('search_documents(type="adr"');
      expect(prompt).not.toContain('"function_call"');
    });

    it('should generate OpenAI-specific format', async () => {
      const { generateSystemPrompt } = await import('../../src/utils/prompt-generator');
      
      const prompt = await generateSystemPrompt({
        provider: 'openai',
        readonly: false,
        includeCreate: true,
        apiPort: 3000,
        docsRoot: '/test-project/docs',
        config: {}
      });

      expect(prompt).toContain('**AVAILABLE FUNCTIONS:**');
      expect(prompt).toContain('"function_call"');
      expect(prompt).toContain('```json');
    });

    it('should generate Gemini-specific format', async () => {
      const { generateSystemPrompt } = await import('../../src/utils/prompt-generator');
      
      const prompt = await generateSystemPrompt({
        provider: 'gemini',
        readonly: false,
        includeCreate: true,
        apiPort: 3000,
        docsRoot: '/test-project/docs',
        config: {}
      });

      expect(prompt).toContain('**AVAILABLE TOOLS:**');
      expect(prompt).toContain('"name": "search_documents"');
    });

    it('should generate generic format', async () => {
      const { generateSystemPrompt } = await import('../../src/utils/prompt-generator');
      
      const prompt = await generateSystemPrompt({
        provider: 'generic',
        readonly: false,
        includeCreate: true,
        apiPort: 3000,
        docsRoot: '/test-project/docs',
        config: {}
      });

      expect(prompt).toContain('**AVAILABLE API ENDPOINTS:**');
      expect(prompt).toContain('http://localhost:3000/api/documents');
    });
  });

  describe('permission modes', () => {
    beforeEach(() => {
      vol.fromJSON({
        '/test-project/docs/adrs/001-auth.md': `---
title: "Auth ADR"
type: adr
---
# Auth`
      });
    });

    it('should include create_document tool when includeCreate is true', async () => {
      const { generateSystemPrompt } = await import('../../src/utils/prompt-generator');
      
      const prompt = await generateSystemPrompt({
        provider: 'claude',
        readonly: false,
        includeCreate: true,
        apiPort: 3000,
        docsRoot: '/test-project/docs',
        config: {}
      });

      expect(prompt).toContain('create_document');
      expect(prompt).toContain('Draft new ADRs or tickets');
    });

    it('should exclude create_document tool when readonly is true', async () => {
      const { generateSystemPrompt } = await import('../../src/utils/prompt-generator');
      
      const prompt = await generateSystemPrompt({
        provider: 'claude',
        readonly: true,
        includeCreate: false,
        apiPort: 3000,
        docsRoot: '/test-project/docs',
        config: {}
      });

      expect(prompt).not.toContain('create_document');
      expect(prompt).toContain('Ask the human to create');
    });

    it('should reference correct API port', async () => {
      const { generateSystemPrompt } = await import('../../src/utils/prompt-generator');
      
      const prompt = await generateSystemPrompt({
        provider: 'claude',
        readonly: false,
        includeCreate: true,
        apiPort: 3001,
        docsRoot: '/test-project/docs',
        config: {}
      });

      expect(prompt).toContain('http://localhost:3001');
      expect(prompt).toContain('--port 3001');
    });
  });

  describe('workflow examples', () => {
    beforeEach(() => {
      vol.fromJSON({
        '/test-project/docs/adrs/001-auth.md': `---
title: "Auth ADR"
type: adr
status: Accepted
---
# Auth`
      });
    });

    it('should include comprehensive workflow examples', async () => {
      const { generateSystemPrompt } = await import('../../src/utils/prompt-generator');
      
      const prompt = await generateSystemPrompt({
        provider: 'claude',
        readonly: false,
        includeCreate: true,
        apiPort: 3000,
        docsRoot: '/test-project/docs',
        config: {}
      });

      expect(prompt).toContain('**WORKFLOW EXAMPLES:**');
      expect(prompt).toContain('Implementing a new feature');
      expect(prompt).toContain('Bug investigation');
      expect(prompt).toContain('Architectural decisions');
      expect(prompt).toContain('search_documents(type="adr"');
    });

    it('should include proper reasoning process', async () => {
      const { generateSystemPrompt } = await import('../../src/utils/prompt-generator');
      
      const prompt = await generateSystemPrompt({
        provider: 'claude',
        readonly: false,
        includeCreate: true,
        apiPort: 3000,
        docsRoot: '/test-project/docs',
        config: {}
      });

      expect(prompt).toContain('**YOUR REASONING PROCESS:**');
      expect(prompt).toContain('1. **Understand the Request:**');
      expect(prompt).toContain('2. **Research First:**');
      expect(prompt).toContain('3. **Synthesize Information:**');
      expect(prompt).toContain('4. **Propose When Needed:**');
      expect(prompt).toContain('5. **Implement Thoughtfully:**');
    });
  });
});