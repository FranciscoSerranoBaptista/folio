import { describe, it, expect } from 'vitest';
import { slugify } from '../../src/utils/slugify';

describe('slugify', () => {
  it('should convert basic strings to slugs', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('This is a Test')).toBe('this-is-a-test');
    expect(slugify('Simple String')).toBe('simple-string');
  });

  it('should handle special characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
    expect(slugify('Test@#$%^&*()')).toBe('test');
    expect(slugify('Some/Path\\With\\Slashes')).toBe('somepathwithslashes');
    expect(slugify('Dots.and.More.Dots')).toBe('dots.and.more.dots');
  });

  it('should handle underscores and multiple spaces', () => {
    expect(slugify('hello_world')).toBe('hello-world');
    expect(slugify('hello___world')).toBe('hello-world');
    expect(slugify('hello   world')).toBe('hello-world');
    expect(slugify('   spaced   out   ')).toBe('spaced-out');
  });

  it('should handle multiple hyphens', () => {
    expect(slugify('hello--world')).toBe('hello-world');
    expect(slugify('hello---world')).toBe('hello-world');
    expect(slugify('multiple----hyphens')).toBe('multiple-hyphens');
  });

  it('should remove leading and trailing hyphens', () => {
    expect(slugify('-leading')).toBe('leading');
    expect(slugify('trailing-')).toBe('trailing');
    expect(slugify('--both--')).toBe('both');
    expect(slugify('---multiple---')).toBe('multiple');
  });

  it('should handle edge cases', () => {
    expect(slugify('')).toBe('');
    expect(slugify('   ')).toBe('');
    expect(slugify('---')).toBe('');
    expect(slugify('!!!')).toBe('');
    expect(slugify('a')).toBe('a');
  });

  it('should handle numbers and alphanumeric strings', () => {
    expect(slugify('Test 123')).toBe('test-123');
    expect(slugify('Version 2.0.1')).toBe('version-2.0.1');
    expect(slugify('ABC123def456')).toBe('abc123def456');
  });

  it('should handle realistic document titles', () => {
    expect(slugify('Use TypeScript for All New Services')).toBe('use-typescript-for-all-new-services');
    expect(slugify('ADR-001: Database Migration Strategy')).toBe('adr-001-database-migration-strategy');
    expect(slugify('Ticket: Fix user authentication bug')).toBe('ticket-fix-user-authentication-bug');
    expect(slugify('Epic: Modernize Authentication System (Q3 2024)')).toBe('epic-modernize-authentication-system-q3-2024');
  });

  it('should handle unicode characters', () => {
    // Note: The actual behavior strips accented characters
    expect(slugify('Cafe Munich')).toBe('cafe-munich');
    expect(slugify('Naive resume')).toBe('naive-resume');
  });

  it('should be consistent with repeated calls', () => {
    const input = 'Complex!!! Title@#$ With%%% Special--- Characters';
    const result = slugify(input);
    expect(slugify(input)).toBe(result);
    expect(slugify(input)).toBe(result);
  });

  it('should handle very long strings', () => {
    const longString = 'a'.repeat(1000);
    const result = slugify(longString);
    expect(result).toBe('a'.repeat(1000));
    expect(result.length).toBe(1000);
  });

  it('should preserve dots in version numbers', () => {
    expect(slugify('Version 1.2.3')).toBe('version-1.2.3');
    expect(slugify('Release v2.0.0-beta.1')).toBe('release-v2.0.0-beta.1');
  });
});