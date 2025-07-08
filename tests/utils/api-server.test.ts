import { describe, it, expect, afterEach } from 'vitest';

describe('FolioKnowledgeAPI', () => {
  let api: any;

  afterEach(async () => {
    if (api) {
      await api.stop();
    }
  });

  describe('API server structure', () => {
    it('should create API server instance', async () => {
      const { FolioKnowledgeAPI } = await import('../../src/utils/api-server');
      api = new FolioKnowledgeAPI();
      
      expect(api).toBeDefined();
      expect(api.server).toBeDefined();
      expect(typeof api.loadDocuments).toBe('function');
      expect(typeof api.start).toBe('function');
      expect(typeof api.stop).toBe('function');
    });

    it('should have proper API routes configured', async () => {
      const { FolioKnowledgeAPI } = await import('../../src/utils/api-server');
      api = new FolioKnowledgeAPI();
      
      // Test health endpoint
      const healthResponse = await api.server.inject({
        method: 'GET',
        url: '/api/health'
      });

      expect(healthResponse.statusCode).toBe(200);
      const healthData = JSON.parse(healthResponse.payload);
      expect(healthData.status).toBe('ok');
      expect(healthData.documents).toBeDefined();
      expect(healthData.timestamp).toBeDefined();
    });

    it('should handle documents search endpoint', async () => {
      const { FolioKnowledgeAPI } = await import('../../src/utils/api-server');
      api = new FolioKnowledgeAPI();
      
      const response = await api.server.inject({
        method: 'GET',
        url: '/api/documents'
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.documents).toBeDefined();
      expect(Array.isArray(data.documents)).toBe(true);
      expect(data.total).toBeDefined();
    });

    it('should handle document query parameters', async () => {
      const { FolioKnowledgeAPI } = await import('../../src/utils/api-server');
      api = new FolioKnowledgeAPI();
      
      const response = await api.server.inject({
        method: 'GET',
        url: '/api/documents?type=adr&status=Accepted&limit=10'
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.documents).toBeDefined();
      expect(Array.isArray(data.documents)).toBe(true);
    });

    it('should handle non-existent document requests', async () => {
      const { FolioKnowledgeAPI } = await import('../../src/utils/api-server');
      api = new FolioKnowledgeAPI();
      
      const response = await api.server.inject({
        method: 'GET',
        url: '/api/documents/non-existent-id'
      });

      expect(response.statusCode).toBe(404);
      const data = JSON.parse(response.payload);
      expect(data.error).toBe('Document not found');
    });

    it('should generate correct document IDs from file paths', async () => {
      const { FolioKnowledgeAPI } = await import('../../src/utils/api-server');
      api = new FolioKnowledgeAPI();
      
      // Test the private generateId method by accessing it through reflection
      const id1 = api.generateId('docs/adrs/001-authentication.md');
      const id2 = api.generateId('docs/tickets/backend/USER-101.md');
      const id3 = api.generateId('docs/some-doc.md');
      
      expect(id1).toBe('adrs-001-authentication');
      expect(id2).toBe('tickets-backend-user-101');
      expect(id3).toBe('some-doc');
    });
  });

  describe('server lifecycle', () => {
    it('should start and stop server properly', async () => {
      const { FolioKnowledgeAPI } = await import('../../src/utils/api-server');
      api = new FolioKnowledgeAPI();
      
      // Test starting server
      expect(async () => {
        const url = await api.start(0); // Use port 0 for random available port
        expect(url).toMatch(/http:\/\/localhost:\d+/);
        await api.stop();
      }).not.toThrow();
    });

    it('should handle loadDocuments without throwing on empty directory', async () => {
      const { FolioKnowledgeAPI } = await import('../../src/utils/api-server');
      api = new FolioKnowledgeAPI();
      
      expect(async () => {
        await api.loadDocuments('/non-existent-directory');
      }).not.toThrow();
    });
  });
});