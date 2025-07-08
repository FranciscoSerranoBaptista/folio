# Troubleshooting AI Integration

Common issues and solutions when setting up and using Folio's AI integration features.

## Quick Diagnostics

### Verify Setup

Run these commands to check your setup:

```bash
# 1. Check Folio installation
folio --version

# 2. Verify Knowledge API starts
folio serve --api --port 3000
# Should show: "🚀 Folio Knowledge API is running at: http://localhost:3000"

# 3. Test API health
curl http://localhost:3000/api/health
# Should return: {"status":"ok","documents":N,"timestamp":"..."}

# 4. Test prompt generation
folio generate-prompt --provider claude | head -10
# Should show: "You are an expert AI software engineer..."
```

## Common Issues

### Knowledge API Problems

#### Issue: API Server Won't Start

**Symptoms:**
```bash
folio serve --api
# Error: Invalid configuration...
```

**Solutions:**

1. **Check Folio Configuration:**
```bash
# Verify config exists and is valid
folio validate

# Common fixes:
# - Add missing required fields
# - Fix YAML/TypeScript syntax errors
# - Ensure all document types have required properties
```

2. **Check Port Availability:**
```bash
# Test if port is in use
lsof -i :3000

# Use different port
folio serve --api --port 3001
```

3. **Verify Permissions:**
```bash
# Check directory permissions
ls -la docs/
# Ensure Folio can read your docs directory
```

#### Issue: API Returns No Documents

**Symptoms:**
```bash
curl http://localhost:3000/api/documents
# Returns: {"documents":[],"total":0}
```

**Debugging:**

1. **Check Document Discovery:**
```bash
# Verify documents exist
find docs/ -name "*.md" -type f

# Check file permissions
ls -la docs/**/*.md
```

2. **Verify Document Format:**
```bash
# Example valid document:
cat docs/adrs/001-example.md
```

```markdown
---
title: "Example ADR"
type: adr
status: Accepted
---

# Example ADR

Content here...
```

3. **Check Server Logs:**
```bash
folio serve --api
# Look for:
# ℹ️ Loading documents into knowledge API...
# ℹ️ Loaded N documents
```

#### Issue: Search Returns Unexpected Results

**Symptoms:**
- Documents not found by type/status filters
- Search results missing expected documents
- Content search not working

**Solutions:**

1. **Verify Frontmatter:**
```yaml
---
# Ensure correct field names
type: adr          # not Type or document_type
status: Accepted   # exact case matters
tags: [security]   # array format for multiple tags
---
```

2. **Check Query Parameters:**
```bash
# Case-sensitive status
curl "http://localhost:3000/api/documents?status=Accepted"  # ✅
curl "http://localhost:3000/api/documents?status=accepted"  # ❌

# Proper tag format
curl "http://localhost:3000/api/documents?tags=security,auth"  # ✅
curl "http://localhost:3000/api/documents?tags=security%20auth"  # ❌
```

3. **Test Different Search Types:**
```bash
# Metadata search
curl "http://localhost:3000/api/documents?type=adr"

# Content search  
curl "http://localhost:3000/api/documents?q=authentication"

# Combined search
curl "http://localhost:3000/api/documents?type=adr&q=auth"
```

### Prompt Generation Problems

#### Issue: Prompt Generation Fails

**Symptoms:**
```bash
folio generate-prompt
# Error: Error generating prompt: ...
```

**Solutions:**

1. **Fix Configuration Issues:**
```bash
# Validate Folio config
folio validate

# Common config problems:
# - Missing required fields in types definition
# - Invalid frontmatter schema  
# - Malformed TypeScript/YAML
```

2. **Check Document Access:**
```bash
# Verify docs directory exists and is readable
ls -la docs/
# Check if config.root points to correct directory
```

3. **Use Minimal Config:**
```typescript
// folio.config.ts - minimal working config
export default {
  root: "docs",
  types: {
    adr: {
      path: "adrs",
      template: "adr",
      frontmatter: {
        status: { type: "string", required: true }
      }
    }
  },
  indexing: {
    enabled: true,
    columns: ["title", "status", "type"]
  }
}
```

#### Issue: Generated Prompt Too Long

**Symptoms:**
- AI provider rejects prompt due to length
- Prompt exceeds token limits

**Solutions:**

1. **Use Readonly Mode:**
```bash
# Shorter prompts without create_document tool
folio generate-prompt --readonly
```

2. **Choose Minimal Provider Format:**
```bash
# Generic format is usually shorter
folio generate-prompt --provider generic
```

3. **Limit Project Analysis:**
```bash
# Generate for smaller document subset
# (Consider filtering large projects)
```

### AI Integration Issues

#### Issue: AI Doesn't Use Tools Correctly

**Symptoms:**
- AI doesn't query the API
- AI makes incorrect API calls
- AI gets confused about available endpoints

**Solutions:**

1. **Verify API Server is Running:**
```bash
# AI needs the API server running
folio serve --api --port 3000

# Test manually:
curl http://localhost:3000/api/health
```

2. **Check Prompt Setup:**
```bash
# Regenerate prompt with correct port
folio generate-prompt --port 3000

# Ensure you copied the complete prompt to AI
folio generate-prompt --provider claude -o prompt.txt
wc -l prompt.txt  # Should be substantial (50+ lines)
```

3. **Test with Simple Queries:**
```
Ask AI: "Search for all ADRs"
Expected: AI should call search_documents(type="adr")

Ask AI: "What architectural decisions exist?"  
Expected: AI should query the Knowledge API
```

#### Issue: AI Creates Invalid Documents

**Symptoms:**
- AI generates documents with wrong format
- Created documents don't follow project patterns
- Frontmatter is malformed

**Solutions:**

1. **Start with Readonly Mode:**
```bash
# Begin with read-only to build understanding
folio generate-prompt --readonly
# Graduate to full access once AI understands patterns
```

2. **Provide Better Examples:**
```bash
# Show AI existing document patterns
curl "http://localhost:3000/api/documents?type=adr&limit=3"
# Copy good examples to AI for reference
```

3. **Review AI-Generated Content:**
```bash
# Always review before accepting
# Set up human approval workflows
# Provide feedback to improve AI understanding
```

#### Issue: AI Doesn't Find Relevant Documents

**Symptoms:**
- AI says "no relevant documents found"
- AI misses obvious relevant content
- Search queries are too narrow/broad

**Solutions:**

1. **Improve Document Tagging:**
```yaml
---
title: "JWT Authentication Decision"
type: adr
status: Accepted
tags: [security, authentication, jwt, auth, api]  # More tags
---
```

2. **Test Search Queries:**
```bash
# Test what AI should find
curl "http://localhost:3000/api/documents?q=authentication"
curl "http://localhost:3000/api/documents?tags=security"

# Ensure documents are discoverable
```

3. **Guide AI Search Strategy:**
```
Give AI examples:
"Try searching with: search_documents(type='adr', tags='security')"
"Use broader search terms like 'auth' instead of 'authentication'"
```

## Performance Issues

### API Response Slow

**Symptoms:**
- API queries take > 1 second
- Large document collections cause timeouts

**Solutions:**

1. **Check Document Count:**
```bash
curl http://localhost:3000/api/health
# If documents > 1000, consider optimizations
```

2. **Use Specific Queries:**
```bash
# Prefer specific filters
curl "http://localhost:3000/api/documents?type=adr"  # ✅
curl "http://localhost:3000/api/documents?q=very-broad-term"  # Slow
```

3. **Limit Results:**
```bash
# Use limit parameter
curl "http://localhost:3000/api/documents?limit=10"
```

### High Memory Usage

**Symptoms:**
- Server uses excessive RAM
- Out of memory errors

**Solutions:**

1. **Check Document Size:**
```bash
# Find large documents
find docs/ -name "*.md" -exec wc -c {} + | sort -n | tail -10
```

2. **Optimize Large Documents:**
```bash
# Split large documents into smaller ones
# Move binary content out of markdown
# Use links instead of embedding large content
```

## Debugging Tools

### API Testing

```bash
# Complete API test suite
echo "Testing Knowledge API..."

# Health check
echo "1. Health check:"
curl -s http://localhost:3000/api/health | jq

# Document count
echo "2. Document search:"
curl -s "http://localhost:3000/api/documents?limit=5" | jq '.total'

# Type filtering
echo "3. Type filtering:"
curl -s "http://localhost:3000/api/documents?type=adr" | jq '.documents | length'

# Content search
echo "4. Content search:"
curl -s "http://localhost:3000/api/documents?q=auth" | jq '.documents | length'

# Individual document
echo "5. Individual document:"
DOC_ID=$(curl -s "http://localhost:3000/api/documents?limit=1" | jq -r '.documents[0].id')
curl -s "http://localhost:3000/api/documents/$DOC_ID" | jq '.document.title'
```

### Prompt Validation

```bash
# Test prompt generation for all providers
echo "Testing prompt generation..."

for provider in claude openai gemini generic; do
  echo "Testing $provider provider:"
  folio generate-prompt --provider $provider --readonly | head -5
  echo "---"
done
```

### Document Analysis

```bash
# Analyze your document structure
echo "Document analysis:"

# Count by type
echo "Documents by type:"
find docs/ -name "*.md" -exec grep -l "^type:" {} \; | \
  xargs grep "^type:" | cut -d: -f3 | sort | uniq -c

# Count by status  
echo "Documents by status:"
find docs/ -name "*.md" -exec grep -l "^status:" {} \; | \
  xargs grep "^status:" | cut -d: -f3 | sort | uniq -c

# Find documents without frontmatter
echo "Documents without frontmatter:"
find docs/ -name "*.md" -exec grep -L "^---" {} \;
```

## Getting Help

### Log Analysis

Enable verbose logging:

```bash
# Run with debug output
DEBUG=folio* folio serve --api

# Check for specific error patterns:
# - Permission denied
# - Configuration errors  
# - File parsing issues
```

### Community Support

1. **Check Documentation:**
   - [Knowledge API Reference](./knowledge-api.md)
   - [AI Prompts Guide](./ai-prompts.md) 
   - [Workflow Examples](./workflows.md)

2. **Create Minimal Reproduction:**
```bash
# Create test project
mkdir folio-test && cd folio-test
folio init
echo "---\ntitle: Test\ntype: adr\n---\n# Test" > docs/adrs/test.md
folio serve --api  # Test if this works
```

3. **Gather Information:**
   - Folio version: `folio --version`
   - Node version: `node --version`
   - Operating system
   - Configuration file content
   - Error messages and logs

### Reporting Issues

Include this information when reporting problems:

- **Environment:** OS, Node.js version, Folio version
- **Configuration:** Sanitized `folio.config.ts`
- **Commands:** Exact commands that fail
- **Logs:** Complete error messages
- **Expected vs Actual:** What should happen vs what happens

---

**Previous:** [Workflow Examples](./workflows.md) - Real-world AI integration patterns