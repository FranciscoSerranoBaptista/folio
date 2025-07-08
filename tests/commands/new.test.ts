import { describe, it, expect } from 'vitest';

describe('new command (simplified)', () => {
  it('should create command with correct configuration', async () => {
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

  it('should have action handler defined', async () => {
    const { createNewCommand } = await import('../../src/commands/new');
    
    const command = createNewCommand();
    
    expect(command._actionHandler).toBeDefined();
    expect(typeof command._actionHandler).toBe('function');
  });
});