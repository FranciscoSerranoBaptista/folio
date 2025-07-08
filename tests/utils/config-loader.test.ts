import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock cosmiconfig
vi.mock('cosmiconfig', () => ({
  cosmiconfig: vi.fn()
}));

// Mock cosmiconfig-typescript-loader
vi.mock('cosmiconfig-typescript-loader', () => ({
  TypeScriptLoader: vi.fn(() => () => {})
}));

describe('config-loader', () => {
  let mockExplorer: any;
  let mockSearch: any;

  beforeEach(async () => {
    mockSearch = vi.fn();
    mockExplorer = {
      search: mockSearch
    };

    const { cosmiconfig } = vi.mocked(await import('cosmiconfig'));
    cosmiconfig.mockReturnValue(mockExplorer);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('loadConfig', () => {
    it('should load and validate a valid config', async () => {
      const { loadConfig } = await import('../../src/utils/config-loader');

      const mockConfig = {
        root: 'docs',
        indexing: {
          columns: ['id', 'title', 'status'],
          format: 'table' as const
        },
        types: {
          adr: {
            path: 'adrs',
            template: 'adr.md',
            frontmatter: {
              id: { type: 'number' as const, required: true },
              title: { type: 'string' as const, required: true }
            }
          }
        }
      };

      mockSearch.mockResolvedValue({
        config: mockConfig,
        filepath: '/project/folio.config.ts',
        isEmpty: false
      });

      const result = await loadConfig();

      expect(result.config).toEqual(mockConfig);
      expect(result.filepath).toBe('/project/folio.config.ts');
    });

    it('should throw error when config file not found', async () => {
      const { loadConfig } = await import('../../src/utils/config-loader');

      mockSearch.mockResolvedValue(null);

      await expect(loadConfig()).rejects.toThrow(
        'Could not find a Folio configuration file'
      );
    });

    it('should throw error when config file is empty', async () => {
      const { loadConfig } = await import('../../src/utils/config-loader');

      mockSearch.mockResolvedValue({
        config: {},
        filepath: '/project/folio.config.ts',
        isEmpty: true
      });

      await expect(loadConfig()).rejects.toThrow(
        'Could not find a Folio configuration file'
      );
    });

    it('should throw error for invalid config structure', async () => {
      const { loadConfig } = await import('../../src/utils/config-loader');

      const invalidConfig = {
        root: 'docs',
        types: {
          adr: {
            path: '', // Invalid: empty path
            template: 'adr.md',
            frontmatter: {}
          }
        },
        indexing: {
          columns: ['id', 'title']
        }
      };

      mockSearch.mockResolvedValue({
        config: invalidConfig,
        filepath: '/project/folio.config.ts',
        isEmpty: false
      });

      await expect(loadConfig()).rejects.toThrow('Invalid configuration');
    });

    it('should validate frontmatter field schemas', async () => {
      const { loadConfig } = await import('../../src/utils/config-loader');

      const configWithInvalidFrontmatter = {
        root: 'docs',
        indexing: {
          columns: ['id', 'title']
        },
        types: {
          adr: {
            path: 'adrs',
            template: 'adr.md',
            frontmatter: {
              id: { type: 'invalid-type' }, // Invalid type
              title: { type: 'string' }
            }
          }
        }
      };

      mockSearch.mockResolvedValue({
        config: configWithInvalidFrontmatter,
        filepath: '/project/folio.config.ts',
        isEmpty: false
      });

      await expect(loadConfig()).rejects.toThrow('Invalid configuration');
    });

    it('should validate enum values correctly', async () => {
      const { loadConfig } = await import('../../src/utils/config-loader');

      const configWithEnum = {
        root: 'docs',
        indexing: {
          columns: ['id', 'title', 'status']
        },
        types: {
          adr: {
            path: 'adrs',
            template: 'adr.md',
            frontmatter: {
              id: { type: 'number' as const, required: true },
              title: { type: 'string' as const, required: true },
              status: {
                type: 'string' as const,
                enum: ['proposed', 'accepted', 'rejected']
              }
            }
          }
        }
      };

      mockSearch.mockResolvedValue({
        config: configWithEnum,
        filepath: '/project/folio.config.ts',
        isEmpty: false
      });

      const result = await loadConfig();
      expect(result.config.types.adr.frontmatter.status.enum).toEqual([
        'proposed', 'accepted', 'rejected'
      ]);
    });

    it('should validate pattern field with RegExp', async () => {
      const { loadConfig } = await import('../../src/utils/config-loader');

      const configWithPattern = {
        root: 'docs',
        indexing: {
          columns: ['id', 'title']
        },
        types: {
          ticket: {
            path: 'tickets',
            template: 'ticket.md',
            frontmatter: {
              id: {
                type: 'string' as const,
                pattern: /^[A-Z]+-\d+$/,
                required: true
              },
              title: { type: 'string' as const, required: true }
            }
          }
        }
      };

      mockSearch.mockResolvedValue({
        config: configWithPattern,
        filepath: '/project/folio.config.ts',
        isEmpty: false
      });

      const result = await loadConfig();
      expect(result.config.types.ticket.frontmatter.id.pattern).toBeInstanceOf(RegExp);
    });

    it('should handle default values correctly', async () => {
      const { loadConfig } = await import('../../src/utils/config-loader');

      const configWithDefaults = {
        root: 'docs',
        indexing: {
          columns: ['id', 'title']
        },
        types: {
          adr: {
            path: 'adrs',
            template: 'adr.md',
            frontmatter: {
              id: { type: 'number' as const, required: true },
              title: { type: 'string' as const, required: true },
              status: {
                type: 'string' as const,
                default: 'proposed'
              },
              date: {
                type: 'date' as const,
                default: () => new Date()
              }
            }
          }
        }
      };

      mockSearch.mockResolvedValue({
        config: configWithDefaults,
        filepath: '/project/folio.config.ts',
        isEmpty: false
      });

      const result = await loadConfig();
      expect(result.config.types.adr.frontmatter.status.default).toBe('proposed');
      expect(typeof result.config.types.adr.frontmatter.date.default).toBe('function');
    });

    it('should use default root value when not specified', async () => {
      const { loadConfig } = await import('../../src/utils/config-loader');

      const configWithoutRoot = {
        indexing: {
          columns: ['id', 'title']
        },
        types: {
          adr: {
            path: 'adrs',
            template: 'adr.md',
            frontmatter: {
              id: { type: 'number' as const, required: true },
              title: { type: 'string' as const, required: true }
            }
          }
        }
      };

      mockSearch.mockResolvedValue({
        config: configWithoutRoot,
        filepath: '/project/folio.config.ts',
        isEmpty: false
      });

      const result = await loadConfig();
      expect(result.config.root).toBe('docs'); // Default value
    });

    it('should validate array fields correctly', async () => {
      const { loadConfig } = await import('../../src/utils/config-loader');

      const configWithArrays = {
        root: 'docs',
        indexing: {
          columns: ['id', 'title', 'tags']
        },
        types: {
          adr: {
            path: 'adrs',
            template: 'adr.md',
            frontmatter: {
              id: { type: 'number' as const, required: true },
              title: { type: 'string' as const, required: true },
              tags: {
                type: 'string' as const,
                isArray: true
              }
            }
          }
        }
      };

      mockSearch.mockResolvedValue({
        config: configWithArrays,
        filepath: '/project/folio.config.ts',
        isEmpty: false
      });

      const result = await loadConfig();
      expect(result.config.types.adr.frontmatter.tags.isArray).toBe(true);
    });
  });
});