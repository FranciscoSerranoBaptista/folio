import { describe, it, expect } from 'vitest';

describe('CLI integration', () => {
  it('should have all command modules available', async () => {
    // Test individual command modules can be imported
    const { createInitCommand } = await import('../../src/commands/init');
    const { createNewCommand } = await import('../../src/commands/new');
    const { createValidateCommand } = await import('../../src/commands/validate');
    
    expect(createInitCommand).toBeDefined();
    expect(createNewCommand).toBeDefined(); 
    expect(createValidateCommand).toBeDefined();
    
    // Test that commands can be created
    const initCommand = createInitCommand();
    expect(initCommand.name()).toBe('init');
  });

  it('should have all utility modules available', async () => {
    const { slugify } = await import('../../src/utils/slugify');
    const { default: log } = await import('../../src/utils/logging');
    
    expect(slugify).toBeDefined();
    expect(log).toBeDefined();
    expect(typeof slugify).toBe('function');
    expect(typeof log.info).toBe('function');
  });

  it('should export type definitions', async () => {
    const types = await import('../../src/types/folio');
    expect(types).toBeDefined();
  });
});