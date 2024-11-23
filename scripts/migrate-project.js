#!/usr/bin/env node

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = dirname(__dirname);

const oldPaths = {
  core: join(rootDir, 'core'),
  components: join(rootDir, 'core/components')
};

const newPaths = {
  core: join(rootDir, 'src/core'),
  components: join(rootDir, 'src/components')
};

async function ensureDirectoryExists(dir) {
  try {
    await mkdir(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function migrateFiles() {
  console.log('Starting migration...');

  try {
    // Ensure target directories exist
    await ensureDirectoryExists(newPaths.core);
    await ensureDirectoryExists(newPaths.components);

    // Migrate core files
    const coreFiles = await readdir(oldPaths.core);
    for (const file of coreFiles) {
      if (file.endsWith('.js')) {
        const oldPath = join(oldPaths.core, file);
        const newPath = join(newPaths.core, file.replace('.js', '.ts'));
        await migrateFile(oldPath, newPath);
      }
    }

    // Migrate component files
    const componentFiles = await readdir(oldPaths.components);
    for (const file of componentFiles) {
      if (file.endsWith('.js')) {
        const oldPath = join(oldPaths.components, file);
        const newPath = join(newPaths.components, file.replace('.js', '.ts'));
        await migrateFile(oldPath, newPath);
      }
    }

    console.log('\nMigration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Review migrated TypeScript files');
    console.log('2. Fix any type errors');
    console.log('3. Update imports to use new paths');
    console.log('4. Run type checking with: npm run type-check');

  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

async function migrateFile(oldPath, newPath) {
  console.log(`\nMigrating ${oldPath} to ${newPath}`);

  try {
    // Read the source file
    const content = await readFile(oldPath, 'utf8');

    // Convert to TypeScript
    let tsContent = content
      // Add type annotations to function parameters
      .replace(/function\s+(\w+)\s*\((.*?)\)/g, (match, name, params) => {
        const typedParams = params
          .split(',')
          .map(param => param.trim())
          .map(param => `${param}: any`)
          .join(', ');
        return `function ${name}(${typedParams})`;
      })
      // Add return types to functions
      .replace(/function\s+(\w+)\s*\((.*?)\)\s*{/g, 'function $1($2): void {')
      // Convert class methods
      .replace(/(\w+)\s*\((.*?)\)\s*{/g, '$1($2): void {')
      // Add type annotations to variables
      .replace(/let\s+(\w+)\s*=/g, 'let $1: any =')
      .replace(/const\s+(\w+)\s*=/g, 'const $1: any =')
      // Convert imports/exports to TypeScript syntax
      .replace(/require\(/g, 'import')
      .replace(/module\.exports/g, 'export default')
      // Add basic type imports
      .replace(/^/, `import { Component } from '../core/Component';\n`);

    // Write the TypeScript file
    await writeFile(newPath, tsContent);
    console.log(`Successfully migrated to ${newPath}`);

  } catch (error) {
    console.error(`Error migrating ${oldPath}:`, error);
    throw error;
  }
}

// Run migration
migrateFiles().catch(console.error);
