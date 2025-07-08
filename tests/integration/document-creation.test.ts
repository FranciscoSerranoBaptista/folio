import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vol } from 'memfs';
import path from 'node:path';

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

describe('Document Creation Integration', () => {
  beforeEach(() => {
    vol.reset();
  });

  describe('Config path consistency', () => {
    it('should create documents in directories that match config paths', async () => {
      // Setup: Create a project structure like folio init would
      vol.fromJSON({
        '/test-project/folio.config.ts': `
export default {
  root: "docs",
  types: {
    adr: {
      path: "02-architecture-and-design/adrs",
      template: "adr.md",
      frontmatter: {
        id: { type: "number", required: true },
        title: { type: "string", required: true },
        status: { type: "string", required: true }
      }
    },
    epic: {
      path: "01-product-and-planning/epics",
      template: "epic.md", 
      frontmatter: {
        id: { type: "string", required: true },
        title: { type: "string", required: true }
      }
    },
    ticket: {
      path: "06-sprint-tickets",
      template: "ticket.md",
      frontmatter: {
        id: { type: "string", required: true },
        title: { type: "string", required: true }
      }
    }
  },
  indexing: { enabled: true, columns: ["title", "status"] }
};`,
        '/test-project/docs/_templates/adr.md': `# {{title}}

## Status
{{status}}

## Context
...

## Decision
...

## Consequences
...`,
        '/test-project/docs/_templates/epic.md': `# {{title}}

## Overview
...`,
        '/test-project/docs/_templates/ticket.md': `# {{title}}

## Description
...`,
        // Create the directories that should exist
        '/test-project/docs/02-architecture-and-design/adrs/.gitkeep': '',
        '/test-project/docs/01-product-and-planning/epics/.gitkeep': '',
        '/test-project/docs/06-sprint-tickets/.gitkeep': ''
      });

      const { loadConfig } = await import('../../src/utils/config-loader');
      const { generateSequentialFilename, writeDocFile } = await import('../../src/utils/files');

      // Change to the test project directory
      process.chdir('/test-project');

      // Load config
      const { config } = await loadConfig();

      // Test ADR creation
      const adrConfig = config.types.adr;
      const adrFilename = await generateSequentialFilename(adrConfig, 'Test ADR', config, '/test-project');
      
      // Verify the filename was generated (should be 0001-test-adr.md)
      expect(adrFilename).toMatch(/^\d{4}-test-adr\.md$/);

      // Create the ADR file
      const adrContent = `---
id: 1
title: Test ADR
status: Proposed
---

# Test ADR

## Status
Proposed`;

      const adrPath = await writeDocFile(adrConfig, adrFilename, adrContent, config, '/test-project');
      
      // Verify file was created in the correct location according to config
      const expectedAdrPath = '/test-project/docs/02-architecture-and-design/adrs/' + adrFilename;
      expect(adrPath).toBe(expectedAdrPath);
      
      // Verify file exists
      expect(vol.existsSync(expectedAdrPath)).toBe(true);

      // Test Epic creation
      const epicConfig = config.types.epic;
      const epicFilename = await generateSequentialFilename(epicConfig, 'Test Epic', config, '/test-project');
      
      const epicContent = `---
id: EPIC-001
title: Test Epic
---

# Test Epic`;

      const epicPath = await writeDocFile(epicConfig, epicFilename, epicContent, config, '/test-project');
      const expectedEpicPath = '/test-project/docs/01-product-and-planning/epics/' + epicFilename;
      expect(epicPath).toBe(expectedEpicPath);
      expect(vol.existsSync(expectedEpicPath)).toBe(true);

      // Test Ticket creation
      const ticketConfig = config.types.ticket;
      const ticketFilename = await generateSequentialFilename(ticketConfig, 'Test Ticket', config, '/test-project');
      
      const ticketContent = `---
id: BE-001
title: Test Ticket
---

# Test Ticket`;

      const ticketPath = await writeDocFile(ticketConfig, ticketFilename, ticketContent, config, '/test-project');
      const expectedTicketPath = '/test-project/docs/06-sprint-tickets/' + ticketFilename;
      expect(ticketPath).toBe(expectedTicketPath);
      expect(vol.existsSync(expectedTicketPath)).toBe(true);
    });

    it('should work with nested directory paths', async () => {
      vol.fromJSON({
        '/test-project/folio.config.ts': `
export default {
  root: "documentation",
  types: {
    design: {
      path: "architecture/design-docs/decisions",
      template: "design.md",
      frontmatter: {
        id: { type: "number", required: true },
        title: { type: "string", required: true }
      }
    }
  },
  indexing: { enabled: true, columns: ["title"] }
};`,
        '/test-project/docs/_templates/design.md': '# {{title}}',
        '/test-project/documentation/architecture/design-docs/decisions/.gitkeep': ''
      });

      process.chdir('/test-project');

      const { loadConfig } = await import('../../src/utils/config-loader');
      const { generateSequentialFilename, writeDocFile } = await import('../../src/utils/files');

      const { config } = await loadConfig();
      const designConfig = config.types.design;
      
      const filename = await generateSequentialFilename(designConfig, 'Nested Design Doc', config, '/test-project');
      const content = `---
id: 1
title: Nested Design Doc
---

# Nested Design Doc`;

      const filePath = await writeDocFile(designConfig, filename, content, config, '/test-project');
      
      const expectedPath = '/test-project/documentation/architecture/design-docs/decisions/' + filename;
      expect(filePath).toBe(expectedPath);
      expect(vol.existsSync(expectedPath)).toBe(true);
    });
  });

  describe('Directory creation', () => {
    it('should create missing directories automatically', async () => {
      vol.fromJSON({
        '/test-project/folio.config.ts': `
export default {
  root: "docs",
  types: {
    test: {
      path: "new/nested/directory",
      template: "test.md",
      frontmatter: {
        title: { type: "string", required: true }
      }
    }
  },
  indexing: { enabled: true, columns: ["title"] }
};`,
        '/test-project/docs/_templates/test.md': '# {{title}}'
      });

      process.chdir('/test-project');

      const { loadConfig } = await import('../../src/utils/config-loader');
      const { generateSequentialFilename, writeDocFile } = await import('../../src/utils/files');

      const { config } = await loadConfig();
      const testConfig = config.types.test;
      
      // This should create the nested directory structure
      const filename = await generateSequentialFilename(testConfig, 'Auto Directory Test', config, '/test-project');
      const content = '---\ntitle: Auto Directory Test\n---\n# Test';
      
      const filePath = await writeDocFile(testConfig, filename, content, config, '/test-project');
      
      // Verify the nested directories were created
      expect(vol.existsSync('/test-project/docs')).toBe(true);
      expect(vol.existsSync('/test-project/docs/new')).toBe(true);
      expect(vol.existsSync('/test-project/docs/new/nested')).toBe(true);
      expect(vol.existsSync('/test-project/docs/new/nested/directory')).toBe(true);
      expect(vol.existsSync(filePath)).toBe(true);
    });
  });
});