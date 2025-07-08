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

// Mock slugify
vi.mock('../../src/utils/slugify', () => ({
  slugify: vi.fn()
}));

describe('files', () => {
  let mockSlugify: any;

  beforeEach(async () => {
    mockSlugify = vi.mocked(await import('../../src/utils/slugify')).slugify;
    // Clear the in-memory filesystem
    vol.reset();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ensureDirectoryExists', () => {
    it('should create directory when it does not exist', async () => {
      const { ensureDirectoryExists } = await import('../../src/utils/files');
      const fs = await import('node:fs/promises');

      await ensureDirectoryExists('/test/path');

      // Check that directory was created
      const stats = await fs.stat('/test/path');
      expect(stats.isDirectory()).toBe(true);
    });

    it('should handle existing directories gracefully', async () => {
      const { ensureDirectoryExists } = await import('../../src/utils/files');
      
      // Create directory structure first
      vol.fromJSON({
        '/existing/path': null
      });

      // Should not throw when directory already exists
      await expect(ensureDirectoryExists('/existing/path')).resolves.not.toThrow();
    });

    it('should create nested directories', async () => {
      const { ensureDirectoryExists } = await import('../../src/utils/files');
      const fs = await import('node:fs/promises');

      await ensureDirectoryExists('/deep/nested/directory/structure');

      // Check that all nested directories were created
      const stats = await fs.stat('/deep/nested/directory/structure');
      expect(stats.isDirectory()).toBe(true);
    });
  });

  describe('readTemplateFile', () => {
    it('should read template file successfully', async () => {
      const { readTemplateFile } = await import('../../src/utils/files');

      const templateContent = '# Template Content\n\nTitle: {{title}}';
      
      // Set up the file system with the template
      vol.fromJSON({
        '/project/templates/adr.md': templateContent
      });

      const result = await readTemplateFile('adr.md', '/project');
      expect(result).toBe(templateContent);
    });

    it('should throw error when template file not found', async () => {
      const { readTemplateFile } = await import('../../src/utils/files');

      await expect(readTemplateFile('missing.md', '/project')).rejects.toThrow(
        "Template file not found at '/project/templates/missing.md'. Please make sure it exists."
      );
    });

    it('should throw error when templates directory does not exist', async () => {
      const { readTemplateFile } = await import('../../src/utils/files');

      await expect(readTemplateFile('adr.md', '/nonexistent')).rejects.toThrow(
        "Template file not found at '/nonexistent/templates/adr.md'. Please make sure it exists."
      );
    });
  });

  describe('generateSequentialFilename', () => {
    const mockDocTypeConfig = {
      path: 'adrs',
      template: 'adr.md',
      frontmatter: {}
    };

    const mockConfig = {
      root: 'docs',
      indexing: { columns: ['id', 'title'] },
      types: {}
    };

    const configDir = '/project';

    it('should generate first filename when no files exist', async () => {
      const { generateSequentialFilename } = await import('../../src/utils/files');

      // Set up empty directory
      vol.fromJSON({
        '/project/docs/adrs': null
      });

      mockSlugify.mockReturnValue('my-first-adr');

      const result = await generateSequentialFilename(
        mockDocTypeConfig,
        'My First ADR',
        mockConfig,
        configDir
      );

      expect(mockSlugify).toHaveBeenCalledWith('My First ADR');
      expect(result).toBe('0001-my-first-adr.md');
    });

    it('should generate sequential filename when files exist', async () => {
      const { generateSequentialFilename } = await import('../../src/utils/files');

      // Set up directory with existing files
      vol.fromJSON({
        '/project/docs/adrs/0001-first-adr.md': '# First ADR',
        '/project/docs/adrs/0003-third-adr.md': '# Third ADR',
        '/project/docs/adrs/0002-second-adr.md': '# Second ADR',
        '/project/docs/adrs/non-numbered-file.md': '# Non-numbered'
      });

      mockSlugify.mockReturnValue('fourth-adr');

      const result = await generateSequentialFilename(
        mockDocTypeConfig,
        'Fourth ADR',
        mockConfig,
        configDir
      );

      expect(result).toBe('0004-fourth-adr.md');
    });

    it('should handle files with large ID numbers', async () => {
      const { generateSequentialFilename } = await import('../../src/utils/files');

      vol.fromJSON({
        '/project/docs/adrs/0001-first.md': '# First',
        '/project/docs/adrs/0100-big-number.md': '# Big Number',
        '/project/docs/adrs/0050-middle.md': '# Middle'
      });

      mockSlugify.mockReturnValue('next-adr');

      const result = await generateSequentialFilename(
        mockDocTypeConfig,
        'Next ADR',
        mockConfig,
        configDir
      );

      expect(result).toBe('0101-next-adr.md');
    });

    it('should ignore files without numeric prefixes', async () => {
      const { generateSequentialFilename } = await import('../../src/utils/files');

      vol.fromJSON({
        '/project/docs/adrs/index.md': '# Index',
        '/project/docs/adrs/README.md': '# README',
        '/project/docs/adrs/notes.md': '# Notes',
        '/project/docs/adrs/abc-not-numbered.md': '# Not numbered'
      });

      mockSlugify.mockReturnValue('first-numbered');

      const result = await generateSequentialFilename(
        mockDocTypeConfig,
        'First Numbered',
        mockConfig,
        configDir
      );

      expect(result).toBe('0001-first-numbered.md');
    });

    it('should handle invalid numeric prefixes', async () => {
      const { generateSequentialFilename } = await import('../../src/utils/files');

      vol.fromJSON({
        '/project/docs/adrs/0abc-invalid.md': '# Invalid',
        '/project/docs/adrs/00-empty-number.md': '# Empty',
        '/project/docs/adrs/0002-valid.md': '# Valid'
      });

      mockSlugify.mockReturnValue('next-valid');

      const result = await generateSequentialFilename(
        mockDocTypeConfig,
        'Next Valid',
        mockConfig,
        configDir
      );

      expect(result).toBe('0003-next-valid.md');
    });
  });

  describe('writeDocFile', () => {
    const mockDocTypeConfig = {
      path: 'adrs',
      template: 'adr.md',
      frontmatter: {}
    };

    const mockConfig = {
      root: 'docs',
      indexing: { columns: ['id', 'title'] },
      types: {}
    };

    const configDir = '/project';

    it('should write file successfully', async () => {
      const { writeDocFile } = await import('../../src/utils/files');
      const fs = await import('node:fs/promises');

      const content = '---\ntitle: Test ADR\n---\n\nContent here';
      const result = await writeDocFile(
        mockDocTypeConfig,
        '0001-test-adr.md',
        content,
        mockConfig,
        configDir
      );

      expect(result).toBe('/project/docs/adrs/0001-test-adr.md');
      
      // Verify file was written
      const writtenContent = await fs.readFile('/project/docs/adrs/0001-test-adr.md', 'utf-8');
      expect(writtenContent).toBe(content);
    });

    it('should throw error when file already exists', async () => {
      const { writeDocFile } = await import('../../src/utils/files');

      // Pre-create the file
      vol.fromJSON({
        '/project/docs/adrs/0001-existing.md': 'Existing content'
      });

      const content = '---\ntitle: Test ADR\n---\n\nContent here';

      await expect(writeDocFile(
        mockDocTypeConfig,
        '0001-existing.md',
        content,
        mockConfig,
        configDir
      )).rejects.toThrow(
        "A file named '0001-existing.md' already exists in this directory."
      );
    });

    it('should create nested directories if needed', async () => {
      const { writeDocFile } = await import('../../src/utils/files');
      const fs = await import('node:fs/promises');

      const nestedDocTypeConfig = {
        path: 'architecture/decisions',
        template: 'adr.md',
        frontmatter: {}
      };

      const content = '---\ntitle: Nested ADR\n---\n\nContent here';
      const result = await writeDocFile(
        nestedDocTypeConfig,
        '0001-nested.md',
        content,
        mockConfig,
        configDir
      );

      expect(result).toBe('/project/docs/architecture/decisions/0001-nested.md');
      
      // Verify nested directories and file were created
      const stats = await fs.stat('/project/docs/architecture/decisions');
      expect(stats.isDirectory()).toBe(true);
      
      const writtenContent = await fs.readFile('/project/docs/architecture/decisions/0001-nested.md', 'utf-8');
      expect(writtenContent).toBe(content);
    });
  });
});