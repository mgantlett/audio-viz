#!/usr/bin/env node

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sourceDir = join(dirname(__dirname), 'core');
const targetDir = join(dirname(__dirname), 'src', 'core');

async function ensureDirectoryExists(dir) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function migrateFile(filePath, targetPath) {
  console.log(`Migrating ${filePath} to ${targetPath}`);
  
  // Read the source file
  const content = await readFile(filePath, 'utf8');
  
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
    .replace(/^/, `import { EventBus } from './EventBus';\n`);

  // Write the TypeScript file
  await writeFile(targetPath, tsContent);
}

async function migrateDirectory(sourceDir, targetDir) {
  // Ensure target directory exists
  await ensureDirectoryExists(targetDir);

  // Read source directory
  const files = await readdir(sourceDir);

  // Process each file
  for (const file of files) {
    if (file.endsWith('.js')) {
      const sourcePath = join(sourceDir, file);
      const targetPath = join(targetDir, file.replace('.js', '.ts'));
      await migrateFile(sourcePath, targetPath);
    }
  }
}

// Run migration
try {
  await migrateDirectory(sourceDir, targetDir);
  console.log('Migration completed successfully');
} catch (err) {
  console.error('Migration failed:', err);
  process.exit(1);
}
