import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock picocolors to avoid color codes in tests
vi.mock('picocolors', () => ({
  default: {
    red: (text: string) => text,
    green: (text: string) => text,
    yellow: (text: string) => text,
    blue: (text: string) => text,
    cyan: (text: string) => text,
    bold: (text: string) => text,
    dim: (text: string) => text,
    underline: (text: string) => text,
  }
}));

describe('logging utilities', () => {
  let consoleLogSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log info messages', async () => {
    const { default: log } = await import('../../src/utils/logging');
    
    log.info('Test message');
    expect(consoleLogSpy).toHaveBeenCalledWith('ℹ️ Test message');
  });

  it('should log success messages', async () => {
    const { default: log } = await import('../../src/utils/logging');
    
    log.success('Success message');
    expect(consoleLogSpy).toHaveBeenCalledWith('\n✅ Success message');
  });

  it('should log warning messages', async () => {
    const { default: log } = await import('../../src/utils/logging');
    
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    log.warn('Warning message');
    expect(consoleWarnSpy).toHaveBeenCalledWith('⚠️ Warning: Warning message');
    
    consoleWarnSpy.mockRestore();
  });

  it('should log error messages', async () => {
    const { default: log } = await import('../../src/utils/logging');
    
    const error = new Error('Test error');
    log.error(error);
    expect(consoleErrorSpy).toHaveBeenCalledWith('\n❌ Error: Test error');
  });

  it('should log title messages', async () => {
    const { default: log } = await import('../../src/utils/logging');
    
    log.title('Title message');
    expect(consoleLogSpy).toHaveBeenCalledWith('\nTitle message');
  });

  it('should highlight text', async () => {
    const { default: log } = await import('../../src/utils/logging');
    
    const result = log.highlight('highlighted text');
    expect(result).toBe('highlighted text');
  });
});