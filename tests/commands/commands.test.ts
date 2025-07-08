import { describe, it, expect } from 'vitest';

describe('command structure', () => {
  describe('init command', () => {
    it('should create properly structured init command', async () => {
      const { createInitCommand } = await import('../../src/commands/init');
      
      const command = createInitCommand();
      
      expect(command.name()).toBe('init');
      expect(command.description()).toContain('Initialize a new documentation project');
      expect(command._actionHandler).toBeDefined();
    });
  });

  describe('new command', () => {
    it('should create properly structured new command', async () => {
      const { createNewCommand } = await import('../../src/commands/new');
      
      const command = createNewCommand();
      
      expect(command.name()).toBe('new');
      expect(command.description()).toContain('Create a new document');
      
      // Check arguments
      const args = command.registeredArguments;
      expect(args).toHaveLength(2);
      expect(args[0].required).toBe(true); // type
      expect(args[1].required).toBe(true); // title
      
      // Check options
      const options = command.options;
      expect(options.some(opt => opt.long === '--epic')).toBe(true);
      expect(options.some(opt => opt.long === '--sprint')).toBe(true);
    });
  });

  describe('list command', () => {
    it('should create properly structured list command', async () => {
      const { createListCommand } = await import('../../src/commands/list');
      
      const command = createListCommand();
      
      expect(command.name()).toBe('list');
      expect(command.description()).toBeDefined();
      
      // Check arguments
      const args = command.registeredArguments;
      expect(args).toHaveLength(1);
      expect(args[0].required).toBe(true); // type
    });
  });

  describe('validate command', () => {
    it('should create properly structured validate command', async () => {
      const { createValidateCommand } = await import('../../src/commands/validate');
      
      const command = createValidateCommand();
      
      expect(command.name()).toBe('validate');
      expect(command.description()).toBeDefined();
    });
  });

  describe('status command', () => {
    it('should create properly structured status command', async () => {
      const { createStatusCommand } = await import('../../src/commands/status');
      
      const command = createStatusCommand();
      
      expect(command.name()).toBe('status');
      expect(command.description()).toBeDefined();
    });
  });

  describe('find command', () => {
    it('should create properly structured find command', async () => {
      const { createFindCommand } = await import('../../src/commands/find');
      
      const command = createFindCommand();
      
      expect(command.name()).toBe('find');
      expect(command.description()).toBeDefined();
      
      // Check arguments
      const args = command.registeredArguments;
      expect(args).toHaveLength(1);
      expect(args[0].required).toBe(true); // query
    });
  });

  describe('adr command', () => {
    it('should create properly structured adr command with subcommands', async () => {
      const { createADRCommand } = await import('../../src/commands/adr');
      
      const command = createADRCommand();
      
      expect(command.name()).toBe('adr');
      expect(command.description()).toContain('ADR lifecycle management');
      
      // Check for subcommands
      const subcommands = command.commands;
      expect(subcommands.length).toBeGreaterThan(0);
      
      // Check for deprecate subcommand
      const deprecateCmd = subcommands.find(cmd => cmd.name() === 'deprecate');
      expect(deprecateCmd).toBeDefined();
      
      // Check for reorder subcommand (if it exists)
      const reorderCmd = subcommands.find(cmd => cmd.name() === 'reorder');
      if (reorderCmd) {
        expect(reorderCmd.name()).toBe('reorder');
      }
    });
  });

  describe('serve command', () => {
    it('should create properly structured serve command', async () => {
      const { createServeCommand } = await import('../../src/commands/serve');
      
      const command = createServeCommand();
      
      expect(command.name()).toBe('serve');
      expect(command.description()).toBeDefined();
    });
  });

  describe('generate-nav command', () => {
    it('should create properly structured generate-nav command', async () => {
      const { createGenerateNavCommand } = await import('../../src/commands/generate-nav');
      
      const command = createGenerateNavCommand();
      
      expect(command.name()).toBe('generate-nav');
      expect(command.description()).toBeDefined();
    });
  });
});

describe('command integration basics', () => {
  it('should export all command creators', async () => {
    // Verify all commands can be imported without errors
    const commands = await Promise.all([
      import('../../src/commands/init'),
      import('../../src/commands/new'),
      import('../../src/commands/list'),
      import('../../src/commands/validate'),
      import('../../src/commands/status'),
      import('../../src/commands/find'),
      import('../../src/commands/adr'),
      import('../../src/commands/serve'),
      import('../../src/commands/generate-nav')
    ]);

    // Each should export a create function
    expect(commands[0].createInitCommand).toBeDefined();
    expect(commands[1].createNewCommand).toBeDefined();
    expect(commands[2].createListCommand).toBeDefined();
    expect(commands[3].createValidateCommand).toBeDefined();
    expect(commands[4].createStatusCommand).toBeDefined();
    expect(commands[5].createFindCommand).toBeDefined();
    expect(commands[6].createADRCommand).toBeDefined();
    expect(commands[7].createServeCommand).toBeDefined();
    expect(commands[8].createGenerateNavCommand).toBeDefined();
  });

  it('should create all commands successfully', async () => {
    const { createInitCommand } = await import('../../src/commands/init');
    const { createNewCommand } = await import('../../src/commands/new');
    const { createListCommand } = await import('../../src/commands/list');
    const { createValidateCommand } = await import('../../src/commands/validate');
    const { createStatusCommand } = await import('../../src/commands/status');
    const { createFindCommand } = await import('../../src/commands/find');
    const { createADRCommand } = await import('../../src/commands/adr');
    const { createServeCommand } = await import('../../src/commands/serve');
    const { createGenerateNavCommand } = await import('../../src/commands/generate-nav');

    // All should create without throwing
    expect(() => createInitCommand()).not.toThrow();
    expect(() => createNewCommand()).not.toThrow();
    expect(() => createListCommand()).not.toThrow();
    expect(() => createValidateCommand()).not.toThrow();
    expect(() => createStatusCommand()).not.toThrow();
    expect(() => createFindCommand()).not.toThrow();
    expect(() => createADRCommand()).not.toThrow();
    expect(() => createServeCommand()).not.toThrow();
    expect(() => createGenerateNavCommand()).not.toThrow();
  });

  it('should have unique command names', async () => {
    const commands = [
      (await import('../../src/commands/init')).createInitCommand(),
      (await import('../../src/commands/new')).createNewCommand(),
      (await import('../../src/commands/list')).createListCommand(),
      (await import('../../src/commands/validate')).createValidateCommand(),
      (await import('../../src/commands/status')).createStatusCommand(),
      (await import('../../src/commands/find')).createFindCommand(),
      (await import('../../src/commands/adr')).createADRCommand(),
      (await import('../../src/commands/serve')).createServeCommand(),
      (await import('../../src/commands/generate-nav')).createGenerateNavCommand()
    ];

    const names = commands.map(cmd => cmd.name());
    const uniqueNames = new Set(names);
    
    expect(uniqueNames.size).toBe(names.length); // All names should be unique
  });
});