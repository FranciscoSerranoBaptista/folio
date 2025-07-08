import { describe, it, expect } from 'vitest';
import { structure, type ScaffoldNode } from '../../src/utils/scaffold-structure';

describe('scaffold-structure', () => {
  describe('structure', () => {
    it('should export a valid structure array', () => {
      expect(structure).toBeDefined();
      expect(Array.isArray(structure)).toBe(true);
      expect(structure.length).toBeGreaterThan(0);
    });

    it('should have correct root directories', () => {
      const rootDirNames = structure.map(node => node.name);
      expect(rootDirNames).toContain('.github');
      expect(rootDirNames).toContain('docs');
    });

    it('should have .github directory with workflows', () => {
      const githubDir = structure.find(node => node.name === '.github');
      expect(githubDir).toBeDefined();
      expect(githubDir?.type).toBe('directory');
      expect(githubDir?.children).toBeDefined();
      
      const workflowsDir = githubDir?.children?.find(child => child.name === 'workflows');
      expect(workflowsDir).toBeDefined();
      expect(workflowsDir?.type).toBe('directory');
      expect(workflowsDir?.children).toBeDefined();
      
      const workflowFiles = workflowsDir?.children?.map(child => child.name);
      expect(workflowFiles).toContain('validate-docs.yml');
      expect(workflowFiles).toContain('update-indexes.yml');
      expect(workflowFiles).toContain('docs-health-check.yml');
    });

    it('should have docs directory with all expected subdirectories', () => {
      const docsDir = structure.find(node => node.name === 'docs');
      expect(docsDir).toBeDefined();
      expect(docsDir?.type).toBe('directory');
      expect(docsDir?.children).toBeDefined();
      
      const docsDirNames = docsDir?.children?.map(child => child.name);
      expect(docsDirNames).toContain('00-vision-and-strategy');
      expect(docsDirNames).toContain('01-product-and-planning');
      expect(docsDirNames).toContain('02-architecture-and-design');
      expect(docsDirNames).toContain('03-engineering');
      expect(docsDirNames).toContain('04-devops-and-infrastructure');
      expect(docsDirNames).toContain('05-operations-and-support');
      expect(docsDirNames).toContain('06-sprint-tickets');
      expect(docsDirNames).toContain('prompts');
      expect(docsDirNames).toContain('schemas');
    });

    it('should have README.md files in docs root and major directories', () => {
      const docsDir = structure.find(node => node.name === 'docs');
      const rootReadme = docsDir?.children?.find(child => child.name === 'README.md');
      expect(rootReadme).toBeDefined();
      expect(rootReadme?.type).toBe('file');
      expect(rootReadme?.content).toContain('Project Documentation');

      // Check README files in subdirectories
      const visionDir = docsDir?.children?.find(child => child.name === '00-vision-and-strategy');
      const visionReadme = visionDir?.children?.find(child => child.name === 'README.md');
      expect(visionReadme).toBeDefined();
      expect(visionReadme?.content).toContain('Vision and Strategy');
    });

    it('should have ADR directory with README.md', () => {
      const docsDir = structure.find(node => node.name === 'docs');
      const archDir = docsDir?.children?.find(child => child.name === '02-architecture-and-design');
      const adrDir = archDir?.children?.find(child => child.name === 'adrs');
      
      expect(adrDir).toBeDefined();
      expect(adrDir?.type).toBe('directory');
      
      const adrIndex = adrDir?.children?.find(child => child.name === 'README.md');
      expect(adrIndex).toBeDefined();
      expect(adrIndex?.type).toBe('file');
      expect(adrIndex?.content).toContain('Architecture Decision Records');
    });

    it('should have schema files with correct content placeholders', () => {
      const docsDir = structure.find(node => node.name === 'docs');
      const schemasDir = docsDir?.children?.find(child => child.name === 'schemas');
      
      expect(schemasDir).toBeDefined();
      expect(schemasDir?.type).toBe('directory');
      
      const schemaFiles = schemasDir?.children?.map(child => child.name);
      expect(schemaFiles).toContain('document-frontmatter.schema.yaml');
      expect(schemaFiles).toContain('ticket-frontmatter.schema.yaml');
      
      const docSchema = schemasDir?.children?.find(child => child.name === 'document-frontmatter.schema.yaml');
      expect(docSchema?.content).toContain('# Paste your schema content here');
    });

    it('should have prompts directory structure', () => {
      const docsDir = structure.find(node => node.name === 'docs');
      const promptsDir = docsDir?.children?.find(child => child.name === 'prompts');
      
      expect(promptsDir).toBeDefined();
      expect(promptsDir?.type).toBe('directory');
      
      const promptSubdirs = promptsDir?.children?.map(child => child.name);
      expect(promptSubdirs).toContain('examples');
      expect(promptSubdirs).toContain('system');
      expect(promptSubdirs).toContain('user');
      
      // Check that subdirectories have .gitkeep files
      const examplesDir = promptsDir?.children?.find(child => child.name === 'examples');
      const gitkeep = examplesDir?.children?.find(child => child.name === '.gitkeep');
      expect(gitkeep).toBeDefined();
    });

    it('should have engineering directory with technical subdirectories', () => {
      const docsDir = structure.find(node => node.name === 'docs');
      const engDir = docsDir?.children?.find(child => child.name === '03-engineering');
      
      expect(engDir).toBeDefined();
      expect(engDir?.type).toBe('directory');
      
      const engSubdirs = engDir?.children?.filter(child => child.type === 'directory').map(child => child.name);
      expect(engSubdirs).toContain('api');
      expect(engSubdirs).toContain('data-model');
      expect(engSubdirs).toContain('interfaces');
      expect(engSubdirs).toContain('module-specs');
      expect(engSubdirs).toContain('services');
      
      const engFiles = engDir?.children?.filter(child => child.type === 'file').map(child => child.name);
      expect(engFiles).toContain('tech-stack.md');
      expect(engFiles).toContain('code-structure.md');
      expect(engFiles).toContain('testing-strategy.md');
    });

    it('should validate ScaffoldNode structure recursively', () => {
      function validateNode(node: ScaffoldNode): boolean {
        // Check required properties
        if (!node.name || !node.type) return false;
        if (node.type !== 'file' && node.type !== 'directory') return false;
        
        // Directories should have children, files can have content
        if (node.type === 'directory') {
          if (node.children && node.children.length > 0) {
            return node.children.every(child => validateNode(child));
          }
          // Empty directories are allowed
          return true;
        }
        
        // Files can have content but it's optional
        return true;
      }

      const allValid = structure.every(node => validateNode(node));
      expect(allValid).toBe(true);
    });

    it('should have consistent naming conventions', () => {
      function checkNaming(node: ScaffoldNode): boolean {
        // Check for consistent naming patterns
        if (node.name.includes(' ')) return false; // No spaces in names
        if (node.name.startsWith('.') && node.name !== '.github' && node.name !== '.gitkeep') {
          return false; // Only specific dotfiles allowed
        }
        
        if (node.children) {
          return node.children.every(child => checkNaming(child));
        }
        
        return true;
      }

      const allNamesValid = structure.every(node => checkNaming(node));
      expect(allNamesValid).toBe(true);
    });

    it('should have files with appropriate content when specified', () => {
      function checkContent(node: ScaffoldNode): boolean {
        if (node.type === 'file' && node.content !== undefined) {
          // Content should be a string
          if (typeof node.content !== 'string') return false;
          
          // README files should have meaningful content
          if (node.name === 'README.md' && node.content.length < 5) return false;
        }
        
        if (node.children) {
          return node.children.every(child => checkContent(child));
        }
        
        return true;
      }

      const allContentValid = structure.every(node => checkContent(node));
      expect(allContentValid).toBe(true);
    });

    it('should count total files and directories correctly', () => {
      function countNodes(nodes: ScaffoldNode[]): { files: number; directories: number } {
        let files = 0;
        let directories = 0;
        
        for (const node of nodes) {
          if (node.type === 'file') {
            files++;
          } else if (node.type === 'directory') {
            directories++;
            if (node.children) {
              const childCounts = countNodes(node.children);
              files += childCounts.files;
              directories += childCounts.directories;
            }
          }
        }
        
        return { files, directories };
      }

      const counts = countNodes(structure);
      expect(counts.files).toBeGreaterThan(20); // Should have many files
      expect(counts.directories).toBeGreaterThan(10); // Should have many directories
      expect(counts.files + counts.directories).toBeGreaterThan(50); // Total nodes
    });
  });

  describe('ScaffoldNode type', () => {
    it('should allow valid file nodes', () => {
      const fileNode: ScaffoldNode = {
        type: 'file',
        name: 'test.md',
        content: 'test content'
      };
      
      expect(fileNode.type).toBe('file');
      expect(fileNode.name).toBe('test.md');
      expect(fileNode.content).toBe('test content');
    });

    it('should allow valid directory nodes', () => {
      const dirNode: ScaffoldNode = {
        type: 'directory',
        name: 'test-dir',
        children: [
          {
            type: 'file',
            name: 'child.md'
          }
        ]
      };
      
      expect(dirNode.type).toBe('directory');
      expect(dirNode.name).toBe('test-dir');
      expect(dirNode.children).toHaveLength(1);
      expect(dirNode.children?.[0].name).toBe('child.md');
    });
  });
});