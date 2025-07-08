# Frequently Asked Questions

Common questions and solutions for using Folio CLI.

## Installation & Setup

### Q: I get "command not found: folio" after installation

**A:** This typically happens with global installations. Try these solutions:

1. **Use npx** (recommended):
   ```bash
   npx folio --version
   ```

2. **Check global bin path**:
   ```bash
   npm config get prefix
   # Ensure this path is in your $PATH
   ```

3. **Reinstall globally**:
   ```bash
   npm uninstall -g folio-cli
   npm install -g folio-cli
   ```

4. **Use local installation**:
   ```bash
   npm install --save-dev folio-cli
   npx folio --version
   ```

### Q: TypeScript errors in folio.config.ts

**A:** Ensure your project supports TypeScript:

1. **Install TypeScript**:
   ```bash
   npm install --save-dev typescript
   ```

2. **Create/update tsconfig.json**:
   ```json
   {
     "compilerOptions": {
       "module": "commonjs",
       "target": "es2020",
       "moduleResolution": "node",
       "esModuleInterop": true
     },
     "include": ["folio.config.ts"]
   }
   ```

3. **Alternative: Use JavaScript**:
   ```bash
   mv folio.config.ts folio.config.js
   # Update imports to require() syntax
   ```

### Q: "Cannot find module 'folio-cli'" when importing

**A:** This happens when the package isn't installed or there's a version mismatch:

1. **Install as dependency**:
   ```bash
   npm install --save-dev folio-cli
   ```

2. **Clear cache and reinstall**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## Configuration Issues

### Q: Validation errors for valid documents

**A:** Check your schema configuration:

1. **Verify enum values**:
   ```typescript
   status: { 
     type: 'string', 
     enum: ['proposed', 'accepted', 'rejected'] // Must match exactly
   }
   ```

2. **Check required fields**:
   ```yaml
   # Ensure all required fields are present
   ---
   id: 1
   title: "Required title"
   status: "proposed"
   ---
   ```

3. **Validate configuration**:
   ```bash
   folio validate --dry-run
   ```

### Q: "Document type not found" error

**A:** Ensure the document type exists in your configuration:

1. **Check folio.config.ts**:
   ```typescript
   export default defineConfig({
     types: {
       adr: { /* config */ },  // Type name must match command
       ticket: { /* config */ }
     }
   });
   ```

2. **Verify type name in command**:
   ```bash
   folio new adr "Title"  # 'adr' must be in config.types
   ```

### Q: Template not found errors

**A:** Ensure templates exist in the correct location:

1. **Check template path**:
   ```typescript
   types: {
     adr: {
       template: 'adr.md'  // Must exist in templates/adr.md
     }
   }
   ```

2. **Create missing template**:
   ```bash
   mkdir -p templates
   touch templates/adr.md
   ```

3. **Verify template content**:
   ```markdown
   ---
   id: {{id}}
   title: "{{title}}"
   ---
   
   # {{title}}
   
   Content here...
   ```

## File and Directory Issues

### Q: "Permission denied" when creating files

**A:** Check file permissions and directory access:

1. **Verify directory permissions**:
   ```bash
   ls -la docs/
   # Ensure you have write permissions
   ```

2. **Create directories if missing**:
   ```bash
   mkdir -p docs/02-architecture-and-design/adrs
   ```

3. **Check disk space**:
   ```bash
   df -h
   ```

### Q: Generated files appear in wrong location

**A:** Check your configuration paths:

1. **Verify root directory**:
   ```typescript
   export default defineConfig({
     root: 'docs',  // Relative to project root
   });
   ```

2. **Check type paths**:
   ```typescript
   types: {
     adr: {
       path: '02-architecture-and-design/adrs'  // Relative to root
     }
   }
   ```

3. **Ensure you're in project root**:
   ```bash
   pwd  # Should be your project root
   ls folio.config.ts  # Should exist
   ```

## Command-Specific Issues

### Q: "No documents found" when they exist

**A:** Check search patterns and file structure:

1. **Verify file extensions**:
   ```bash
   ls docs/**/*.md  # Should show your files
   ```

2. **Check frontmatter format**:
   ```yaml
   ---
   id: 1  # Proper YAML format
   title: "Title"
   ---
   ```

3. **Regenerate navigation**:
   ```bash
   folio generate-nav
   ```

### Q: Navigation not updating

**A:** Navigation may be cached or not regenerating:

1. **Manual regeneration**:
   ```bash
   folio generate-nav
   ```

2. **Check auto-update settings**:
   ```typescript
   // In folio.config.ts
   navigation: {
     autoUpdate: true  // Enable automatic updates
   }
   ```

3. **Clear any caches**:
   ```bash
   rm -rf .folio-cache/  # If it exists
   ```

### Q: Validation passes but documents seem wrong

**A:** Use strict mode for more thorough validation:

1. **Enable strict validation**:
   ```bash
   folio validate --strict
   ```

2. **Check for warnings**:
   ```bash
   folio validate --format=json | jq '.warnings'
   ```

3. **Validate individual types**:
   ```bash
   folio validate adr
   folio validate ticket
   ```

## Performance Issues

### Q: Commands are slow with many documents

**A:** Optimize for large document sets:

1. **Use specific type validation**:
   ```bash
   folio validate adr  # Instead of validating all types
   ```

2. **Limit search results**:
   ```bash
   folio find "query" --limit=10
   ```

3. **Check document structure**:
   ```bash
   find docs/ -name "*.md" | wc -l  # Count total documents
   ```

### Q: CI/CD timeouts

**A:** Optimize CI workflows:

1. **Use caching**:
   ```yaml
   - uses: actions/cache@v3
     with:
       path: ~/.npm
       key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
   ```

2. **Parallel validation**:
   ```yaml
   strategy:
     matrix:
       type: [adr, ticket, epic]
   steps:
     - run: folio validate ${{ matrix.type }}
   ```

## Integration Issues

### Q: GitHub Actions failing

**A:** Common CI/CD issues:

1. **Check Node.js version**:
   ```yaml
   - uses: actions/setup-node@v3
     with:
       node-version: '18'  # Use supported version
   ```

2. **Install dependencies**:
   ```yaml
   - run: npm ci  # Not npm install
   ```

3. **Check file permissions in CI**:
   ```yaml
   - run: chmod +x node_modules/.bin/folio
   ```

### Q: Pre-commit hooks failing

**A:** Hook configuration issues:

1. **Check husky installation**:
   ```bash
   npx husky install
   ```

2. **Verify hook permissions**:
   ```bash
   chmod +x .husky/pre-commit
   ```

3. **Test hooks manually**:
   ```bash
   .husky/pre-commit
   ```

## Data and Migration Issues

### Q: Lost data after renumbering ADRs

**A:** ADR renumbering is destructive:

1. **Check git history**:
   ```bash
   git log --oneline --follow docs/
   ```

2. **Restore from backup**:
   ```bash
   git checkout HEAD~1 -- docs/
   ```

3. **Always use dry-run first**:
   ```bash
   folio adr renumber --dry-run
   ```

### Q: Importing existing documentation

**A:** Migrate existing docs to Folio:

1. **Create configuration for existing structure**:
   ```typescript
   types: {
     legacy: {
       path: 'existing-docs',
       template: 'legacy.md'
     }
   }
   ```

2. **Add frontmatter to existing files**:
   ```bash
   # Manual process - add YAML frontmatter to each file
   ```

3. **Validate after migration**:
   ```bash
   folio validate legacy
   ```

## Getting More Help

### Enable Debug Logging

```bash
DEBUG=folio* folio <command>
```

### Check Version Compatibility

```bash
folio --version
node --version
npm list folio-cli
```

### Report Issues

If you encounter bugs:

1. **Gather information**:
   ```bash
   folio --version > debug-info.txt
   node --version >> debug-info.txt
   cat folio.config.ts >> debug-info.txt
   ```

2. **Create minimal reproduction**:
   - Small test case demonstrating the issue
   - Exact commands that fail
   - Expected vs actual behavior

3. **Check existing issues**: Search the project repository for similar problems

### Community Resources

- **Documentation**: This documentation covers most common scenarios
- **Examples**: Check the examples directory for common patterns
- **Templates**: Use the generated templates as starting points

## See Also

- [Installation Guide](../01-getting-started/01-installation.md) - Setup instructions
- [Quick Start](../01-getting-started/02-quick-start.md) - Basic usage
- [Configuration Reference](../02-core-concepts/01-the-folio-config.md) - Configuration options