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

describe('generate-prompt command', () => {
  beforeEach(() => {
    vol.reset();
  });

  describe('command structure', () => {
    it('should create properly structured generate-prompt command', async () => {
      const { createGeneratePromptCommand } = await import('../../src/commands/generate-prompt');
      
      const command = createGeneratePromptCommand();
      
      expect(command.name()).toBe('generate-prompt');
      expect(command.description()).toContain('Generate AI system prompts');
      expect(command._actionHandler).toBeDefined();
    });

    it('should have correct options', async () => {
      const { createGeneratePromptCommand } = await import('../../src/commands/generate-prompt');
      
      const command = createGeneratePromptCommand();
      const options = command.options;
      
      expect(options.some(opt => opt.long === '--provider')).toBe(true);
      expect(options.some(opt => opt.long === '--readonly')).toBe(true);
      expect(options.some(opt => opt.long === '--include-create')).toBe(true);
      expect(options.some(opt => opt.long === '--port')).toBe(true);
      expect(options.some(opt => opt.long === '--output')).toBe(true);
    });
  });
});