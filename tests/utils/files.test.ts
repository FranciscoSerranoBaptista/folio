import { describe, it, expect } from 'vitest';

describe('file utilities', () => {
  it('should export required functions', async () => {
    const files = await import('../../src/utils/files');
    
    expect(files.readTemplateFile).toBeDefined();
    expect(files.generateSequentialFilename).toBeDefined();
    expect(files.writeDocFile).toBeDefined();
    expect(typeof files.readTemplateFile).toBe('function');
    expect(typeof files.generateSequentialFilename).toBe('function');
    expect(typeof files.writeDocFile).toBe('function');
  });

  // Note: More comprehensive tests would require setting up temporary directories
  // and proper mocking of the file system. For now, we test that the functions exist.
});