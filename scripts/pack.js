#!/usr/bin/env node

/**
 * Development script for packaging Folio CLI for distribution
 * This script is NOT part of the distributed CLI - it's only for local development
 */

const fs = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');

/**
 * Files and directories to clean up before packing
 */
const CLEANUP_PATTERNS = [
  // Test files
  'test-*.js',
  'test-*.ts', 
  '*.test.js',
  '*.test.ts',
  
  // Build artifacts
  'coverage/',
  '*.tgz',
  '*.tar.gz',
  
  // Temporary files
  '*.tmp',
  '*.temp',
  '.DS_Store',
  'Thumbs.db',
  
  // Development files
  'test-folio-project/',
  'tmp/',
  'temp/',
];

/**
 * Output directory for packaged files
 */
const DIST_DIR = 'dist-packages';

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m', // cyan
    success: '\x1b[32m', // green
    warn: '\x1b[33m', // yellow
    error: '\x1b[31m', // red
    title: '\x1b[35m', // magenta
  };
  const reset = '\x1b[0m';
  const prefix = type === 'title' ? '🚀 ' : type === 'success' ? '✅ ' : type === 'warn' ? '⚠️  ' : type === 'error' ? '❌ ' : 'ℹ️  ';
  console.log(`${colors[type]}${prefix}${message}${reset}`);
}

/**
 * Check if a file/directory matches any cleanup pattern
 */
function shouldCleanup(filename) {
  return CLEANUP_PATTERNS.some(pattern => {
    if (pattern.endsWith('/')) {
      // Directory pattern
      return filename === pattern.slice(0, -1);
    } else if (pattern.includes('*')) {
      // Glob pattern - simple implementation
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return regex.test(filename);
    } else {
      // Exact match
      return filename === pattern;
    }
  });
}

/**
 * Clean up development and test files
 */
async function cleanup(projectRoot) {
  log('🧹 Cleaning up development files...');
  
  try {
    const entries = await fs.readdir(projectRoot, { withFileTypes: true });
    let cleanedCount = 0;
    
    for (const entry of entries) {
      if (shouldCleanup(entry.name)) {
        const fullPath = path.join(projectRoot, entry.name);
        const relativePath = path.relative(process.cwd(), fullPath);
        
        try {
          if (entry.isDirectory()) {
            await fs.rm(fullPath, { recursive: true, force: true });
            log(`   Removed directory: ${relativePath}/`);
          } else {
            await fs.unlink(fullPath);
            log(`   Removed file: ${relativePath}`);
          }
          cleanedCount++;
        } catch (error) {
          log(`   Could not remove ${relativePath}: ${error.message}`, 'warn');
        }
      }
    }
    
    if (cleanedCount === 0) {
      log('   No files to clean up');
    } else {
      log(`   Cleaned up ${cleanedCount} items`, 'success');
    }
  } catch (error) {
    log(`Could not read project directory: ${error.message}`, 'warn');
  }
}

/**
 * Run pnpm pack to create distributable package
 */
async function pack(projectRoot, distDir) {
  log('📦 Creating package...');
  
  return new Promise((resolve, reject) => {
    const proc = spawn('pnpm', ['pack'], {
      cwd: projectRoot,
      stdio: 'inherit',
    });
    
    proc.on('close', async (code) => {
      if (code === 0) {
        // Move the generated .tgz file to dist directory
        try {
          const entries = await fs.readdir(projectRoot);
          const tgzFiles = entries.filter(f => f.endsWith('.tgz'));
          
          if (tgzFiles.length > 0) {
            const tgzFile = tgzFiles[tgzFiles.length - 1]; // Latest one
            const sourcePath = path.join(projectRoot, tgzFile);
            const destPath = path.join(distDir, tgzFile);
            
            // Ensure dist directory exists
            await fs.mkdir(distDir, { recursive: true });
            
            // Move file
            await fs.rename(sourcePath, destPath);
            
            log(`📦 Package created: ${destPath}`, 'success');
            resolve(destPath);
          } else {
            reject(new Error('No .tgz file found after pnpm pack'));
          }
        } catch (error) {
          reject(new Error(`Failed to move package file: ${error.message}`));
        }
      } else {
        reject(new Error(`pnpm pack failed with exit code ${code}`));
      }
    });
    
    proc.on('error', (error) => {
      reject(new Error(`Failed to run pnpm pack: ${error.message}`));
    });
  });
}

/**
 * Display package information and installation instructions
 */
async function showPackageInfo(projectRoot, packagePath) {
  try {
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    
    log('📋 Package Information:');
    log(`   Name: ${packageJson.name}`);
    log(`   Version: ${packageJson.version}`);
    log(`   Description: ${packageJson.description || 'No description'}`);
    
    // Show file size
    const stats = await fs.stat(packagePath);
    const sizeKB = Math.round(stats.size / 1024);
    log(`   Size: ${sizeKB} KB`);
    
    console.log('');
    log('🚀 Installation Instructions:', 'title');
    log('');
    log('📍 Local Installation (for testing):');
    log(`   pnpm install -g ./${path.relative(process.cwd(), packagePath)}`);
    log('   folio --version');
    log('');
    log('📤 Distribution:');
    log('   1. Test locally first with the command above');
    log('   2. Copy the .tgz file to target systems');
    log('   3. Install with: pnpm install -g path/to/folio-cli-*.tgz');
    log('');
    log('🔄 Publishing to npm (when ready):');
    log('   pnpm publish');
    log('');
    log('📦 Package Location:');
    log(`   ${path.resolve(packagePath)}`);
    
  } catch (error) {
    log(`Could not read package.json: ${error.message}`, 'warn');
  }
}

/**
 * Main function
 */
async function main() {
  const projectRoot = process.cwd();
  const distDir = path.join(projectRoot, DIST_DIR);
  
  // Check if we're in the right directory
  try {
    await fs.access(path.join(projectRoot, 'package.json'));
    await fs.access(path.join(projectRoot, 'src'));
  } catch {
    log('This script must be run from the Folio CLI project root directory', 'error');
    process.exit(1);
  }
  
  log('🚀 Packaging Folio CLI for Distribution', 'title');
  log('');
  
  try {
    // Clean up development files
    await cleanup(projectRoot);
    log('');
    
    // Create package
    const packagePath = await pack(projectRoot, distDir);
    log('');
    
    // Show package info and instructions
    await showPackageInfo(projectRoot, packagePath);
    
  } catch (error) {
    log(`Packaging failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = { main, cleanup, pack };