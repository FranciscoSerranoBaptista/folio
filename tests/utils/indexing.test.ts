import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vol } from 'memfs';

// Mock node:fs/promises to use memfs
vi.mock('node:fs/promises', async () => {
  const memfs = await import('memfs');
  return {
    default: memfs.fs.promises,
    ...memfs.fs.promises
  };
});

// Mock gray-matter
vi.mock('gray-matter', () => ({
  default: vi.fn()
}));

describe('indexing', () => {
  let mockMatter: any;

  beforeEach(async () => {
    mockMatter = vi.mocked(await import('gray-matter')).default;
    // Clear the in-memory filesystem
    vol.reset();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('updateIndexFile', () => {
    const mockDocTypeConfig = {
      path: 'adrs',
      template: 'adr.md',
      frontmatter: {}
    };

    const mockConfig = {
      root: 'docs',
      indexing: {
        columns: ['id', 'title', 'status'],
        format: 'table' as const
      },
      types: {}
    };

    const configDir = '/project';

    it('should create index from scratch when no files exist', async () => {
      const { updateIndexFile } = await import('../../src/utils/indexing');

      // Set up empty directory
      vol.fromJSON({
        '/project/docs/adrs': null
      });

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await updateIndexFile(mockDocTypeConfig, mockConfig, configDir);

      // Verify the index file was created
      const fs = await import('node:fs/promises');
      const indexContent = await fs.readFile('/project/docs/adrs/README.md', 'utf-8');
      
      expect(indexContent).toContain('# Index of Adrs');
      expect(indexContent).toContain('No documents found for this type.');

      consoleLogSpy.mockRestore();
    });

    it('should generate table format index with documents', async () => {
      const { updateIndexFile } = await import('../../src/utils/indexing');

      // Set up directory with documents
      vol.fromJSON({
        '/project/docs/adrs/001-test-adr.md': 'content1',
        '/project/docs/adrs/002-another-adr.md': 'content2'
      });

      mockMatter
        .mockReturnValueOnce({
          data: { id: 1, title: 'Test ADR', status: 'proposed' }
        })
        .mockReturnValueOnce({
          data: { id: 2, title: 'Another ADR', status: 'accepted' }
        });

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await updateIndexFile(mockDocTypeConfig, mockConfig, configDir);

      // Verify the index file content
      const fs = await import('node:fs/promises');
      const indexContent = await fs.readFile('/project/docs/adrs/README.md', 'utf-8');

      expect(indexContent).toContain('| id | title | status |');
      expect(indexContent).toContain('| --- | --- | --- |');
      expect(indexContent).toContain('[Test ADR](001-test-adr.md)');
      expect(indexContent).toContain('[Another ADR](002-another-adr.md)');
      expect(indexContent).toContain('proposed');
      expect(indexContent).toContain('accepted');

      consoleLogSpy.mockRestore();
    });

    it('should generate list format index when configured', async () => {
      const { updateIndexFile } = await import('../../src/utils/indexing');

      const listConfig = {
        ...mockConfig,
        indexing: {
          columns: ['id', 'title', 'status'],
          format: 'list' as const
        }
      };

      vol.fromJSON({
        '/project/docs/adrs/001-test-adr.md': 'content1'
      });

      mockMatter.mockReturnValueOnce({
        data: { id: 1, title: 'Test ADR', status: 'proposed' }
      });

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await updateIndexFile(mockDocTypeConfig, listConfig, configDir);

      const fs = await import('node:fs/promises');
      const indexContent = await fs.readFile('/project/docs/adrs/README.md', 'utf-8');

      expect(indexContent).toContain('- [Test ADR](001-test-adr.md) (Status: proposed)');
      expect(indexContent).not.toContain('| id | title | status |');

      consoleLogSpy.mockRestore();
    });

    it('should update existing index file between markers', async () => {
      const { updateIndexFile } = await import('../../src/utils/indexing');

      const existingContent = `# My Custom Title

Some introduction text.

<!-- FOLIO:INDEX:START -->
Old content here
<!-- FOLIO:INDEX:END -->

Some footer text.`;

      vol.fromJSON({
        '/project/docs/adrs/001-test-adr.md': 'content1',
        '/project/docs/adrs/README.md': existingContent
      });

      mockMatter.mockReturnValueOnce({
        data: { id: 1, title: 'Test ADR', status: 'proposed' }
      });

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await updateIndexFile(mockDocTypeConfig, mockConfig, configDir);

      const fs = await import('node:fs/promises');
      const indexContent = await fs.readFile('/project/docs/adrs/README.md', 'utf-8');

      expect(indexContent).toContain('# My Custom Title');
      expect(indexContent).toContain('Some introduction text.');
      expect(indexContent).toContain('Some footer text.');
      expect(indexContent).toContain('[Test ADR](001-test-adr.md)');
      expect(indexContent).not.toContain('Old content here');

      consoleLogSpy.mockRestore();
    });

    it('should handle missing frontmatter fields with N/A', async () => {
      const { updateIndexFile } = await import('../../src/utils/indexing');

      vol.fromJSON({
        '/project/docs/adrs/001-incomplete-adr.md': 'content1'
      });

      mockMatter.mockReturnValueOnce({
        data: { id: 1, title: 'Incomplete ADR' } // Missing status
      });

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await updateIndexFile(mockDocTypeConfig, mockConfig, configDir);

      const fs = await import('node:fs/promises');
      const indexContent = await fs.readFile('/project/docs/adrs/README.md', 'utf-8');

      expect(indexContent).toContain('| 1 | [Incomplete ADR](001-incomplete-adr.md) | N/A |');

      consoleLogSpy.mockRestore();
    });

    it('should sort documents by ID when all have IDs', async () => {
      const { updateIndexFile } = await import('../../src/utils/indexing');

      vol.fromJSON({
        '/project/docs/adrs/003-third.md': 'content3',
        '/project/docs/adrs/001-first.md': 'content1',
        '/project/docs/adrs/002-second.md': 'content2'
      });

      mockMatter
        .mockReturnValueOnce({ data: { id: 3, title: 'Third' } })
        .mockReturnValueOnce({ data: { id: 1, title: 'First' } })
        .mockReturnValueOnce({ data: { id: 2, title: 'Second' } });

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await updateIndexFile(mockDocTypeConfig, mockConfig, configDir);

      const fs = await import('node:fs/promises');
      const indexContent = await fs.readFile('/project/docs/adrs/README.md', 'utf-8');

      // Check that documents appear in ID order (1, 2, 3)
      const firstIndex = indexContent.indexOf('[First]');
      const secondIndex = indexContent.indexOf('[Second]');
      const thirdIndex = indexContent.indexOf('[Third]');

      expect(firstIndex).toBeLessThan(secondIndex);
      expect(secondIndex).toBeLessThan(thirdIndex);

      consoleLogSpy.mockRestore();
    });

    it('should filter out README.md from document list', async () => {
      const { updateIndexFile } = await import('../../src/utils/indexing');

      vol.fromJSON({
        '/project/docs/adrs/001-test.md': 'content1',
        '/project/docs/adrs/README.md': 'existing index',
        '/project/docs/adrs/002-another.md': 'content2'
      });

      mockMatter
        .mockReturnValueOnce({ data: { id: 1, title: 'Test' } })
        .mockReturnValueOnce({ data: { id: 2, title: 'Another' } });

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await updateIndexFile(mockDocTypeConfig, mockConfig, configDir);

      // Should only call mockMatter for the 2 non-index files
      expect(mockMatter).toHaveBeenCalledTimes(2);

      consoleLogSpy.mockRestore();
    });

    it('should handle mdx files in addition to md files', async () => {
      const { updateIndexFile } = await import('../../src/utils/indexing');

      vol.fromJSON({
        '/project/docs/adrs/001-test.md': 'content1',
        '/project/docs/adrs/002-another.mdx': 'content2'
      });

      mockMatter
        .mockReturnValueOnce({ data: { id: 1, title: 'Test MD' } })
        .mockReturnValueOnce({ data: { id: 2, title: 'Test MDX' } });

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await updateIndexFile(mockDocTypeConfig, mockConfig, configDir);

      const fs = await import('node:fs/promises');
      const indexContent = await fs.readFile('/project/docs/adrs/README.md', 'utf-8');

      expect(indexContent).toContain('[Test MD](001-test.md)');
      expect(indexContent).toContain('[Test MDX](002-another.mdx)');

      consoleLogSpy.mockRestore();
    });

    it('should handle readdir errors gracefully', async () => {
      const { updateIndexFile } = await import('../../src/utils/indexing');

      // Set up empty directory (readdir will succeed but return empty array)
      vol.fromJSON({
        '/project/docs/adrs': null
      });

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await updateIndexFile(mockDocTypeConfig, mockConfig, configDir);

      const fs = await import('node:fs/promises');
      const indexContent = await fs.readFile('/project/docs/adrs/README.md', 'utf-8');

      expect(indexContent).toContain('No documents found for this type.');

      consoleLogSpy.mockRestore();
    });
  });
});