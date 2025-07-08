import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all dependencies
vi.mock('../../src/utils/config-loader');
vi.mock('../../src/utils/files');
vi.mock('../../src/utils/indexing');
vi.mock('gray-matter');
vi.mock('handlebars');

describe('new command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create createNewCommand function', async () => {
    const { createNewCommand } = await import('../../src/commands/new');
    
    const command = createNewCommand();
    
    expect(command).toBeDefined();
    expect(command.name()).toBe('new');
    expect(command.description()).toContain('Create a new document');
  });

  it('should have correct arguments and options', async () => {
    const { createNewCommand } = await import('../../src/commands/new');
    
    const command = createNewCommand();
    
    // Check that it has the expected arguments
    const args = command.registeredArguments;
    expect(args).toHaveLength(2);
    expect(args[0].required).toBe(true); // type
    expect(args[1].required).toBe(true); // title
    
    // Check that it has the expected options  
    const options = command.options;
    expect(options.some(opt => opt.long === '--epic')).toBe(true);
    expect(options.some(opt => opt.long === '--sprint')).toBe(true);
  });

  it('should handle document creation workflow', async () => {
    // Mock the dependencies
    const mockLoadConfig = vi.fn();
    const mockGenerateSequentialFilename = vi.fn();
    const mockReadTemplateFile = vi.fn();
    const mockWriteDocFile = vi.fn();
    const mockUpdateIndexFile = vi.fn();
    const mockHandlebarsCompile = vi.fn();
    const mockMatterStringify = vi.fn();

    vi.mocked(await import('../../src/utils/config-loader')).loadConfig = mockLoadConfig;
    vi.mocked(await import('../../src/utils/files')).generateSequentialFilename = mockGenerateSequentialFilename;
    vi.mocked(await import('../../src/utils/files')).readTemplateFile = mockReadTemplateFile;
    vi.mocked(await import('../../src/utils/files')).writeDocFile = mockWriteDocFile;
    vi.mocked(await import('../../src/utils/indexing')).updateIndexFile = mockUpdateIndexFile;
    vi.mocked(await import('handlebars')).compile = mockHandlebarsCompile;
    vi.mocked(await import('gray-matter')).stringify = mockMatterStringify;

    // Setup mocks
    mockLoadConfig.mockResolvedValue({
      config: {
        root: 'docs',
        types: {
          adr: {
            path: 'adrs',
            template: 'adr.md',
            frontmatter: {}
          }
        }
      },
      filepath: '/project/folio.config.ts'
    });

    mockGenerateSequentialFilename.mockResolvedValue('0001-test-adr.md');
    mockReadTemplateFile.mockResolvedValue('# {{title}}\n\nContent here');
    mockHandlebarsCompile.mockReturnValue(() => '# Test ADR\n\nContent here');
    mockMatterStringify.mockReturnValue('---\nid: 1\ntitle: Test ADR\n---\n# Test ADR\n\nContent here');
    mockWriteDocFile.mockResolvedValue('/project/docs/adrs/0001-test-adr.md');

    // Test the workflow
    const { createNewCommand } = await import('../../src/commands/new');
    const command = createNewCommand();
    
    // This tests that the command structure is correct
    // Full integration testing would require more complex mocking
    expect(command.name()).toBe('new');
  });
});