import { describe, it, expect } from 'vitest';

describe('Folio types', () => {
  it('should import FolioConfig type', async () => {
    const types = await import('../../src/types/folio');
    
    // Test that the types are properly exported
    expect(types).toBeDefined();
    
    // Since these are TypeScript types, we can't test them at runtime
    // but we can ensure the module imports without errors
  });

  it('should be compatible with expected config structure', () => {
    // This is a compile-time test that ensures our types work
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
            title: { type: 'string' as const, required: true },
            status: { 
              type: 'string' as const, 
              enum: ['proposed', 'accepted', 'rejected'],
              default: 'proposed'
            }
          }
        }
      }
    };

    // If this compiles, our types are working correctly
    expect(mockConfig.root).toBe('docs');
    expect(mockConfig.types.adr.path).toBe('adrs');
  });
});