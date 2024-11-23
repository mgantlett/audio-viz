#!/usr/bin/env node

import { execSync } from 'child_process';
import { mkdir, access } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function ensureDirectoryExists(dir) {
  try {
    await access(dir);
  } catch {
    await mkdir(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

async function setup() {
  console.log('Starting setup...');

  try {
    // Create necessary directories
    const directories = [
      'src/core',
      'src/scenes',
      'src/types',
      'src/utils',
      'src/components',
      'samples',
      'dist'
    ];

    for (const dir of directories) {
      const fullPath = resolve(dirname(__dirname), dir);
      await ensureDirectoryExists(fullPath);
    }

    // Install dependencies
    console.log('\nInstalling dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    // Run type check
    console.log('\nRunning type check...');
    try {
      execSync('npm run type-check', { stdio: 'inherit' });
      console.log('Type check passed!');
    } catch (error) {
      console.warn('\nType check failed. This is expected for new projects.');
      console.warn('Fix type errors before building for production.');
    }

    // Check Python environment
    console.log('\nChecking Python environment...');
    try {
      execSync('python --version', { stdio: 'inherit' });
      console.log('Python is available.');

      // Check required Python packages
      const requiredPackages = ['http.server'];
      for (const pkg of requiredPackages) {
        try {
          execSync(`python -c "import ${pkg}"`, { stdio: 'inherit' });
          console.log(`Python package ${pkg} is available.`);
        } catch {
          console.warn(`Warning: Python package ${pkg} might be missing.`);
        }
      }
    } catch {
      console.error('Error: Python is not available. Please install Python 3.x');
    }

    // Run initial build
    console.log('\nRunning initial build...');
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('Initial build successful!');
    } catch (error) {
      console.warn('\nInitial build failed. This is expected for new projects.');
      console.warn('Fix build errors before deploying.');
    }

    console.log('\nSetup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run `npm start` to start development servers');
    console.log('2. Run `npm run migrate` to convert existing JavaScript files');
    console.log('3. Fix any type errors in the migrated files');
    console.log('4. Start developing!');

  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

// Run setup if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  setup().catch(console.error);
}

export default setup;
