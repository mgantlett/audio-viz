// Deploy script for GitHub Pages
import { copyFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const rootDir = resolve(process.cwd());
const distDir = join(rootDir, 'dist');
const publicDir = join(rootDir, 'public');

// Ensure dist exists
if (!existsSync(distDir)) {
    console.error('Error: dist directory not found. Run npm run build first.');
    process.exit(1);
}

// Copy all files from dist to root
console.log('Copying files from dist to root...');
const files = readdirSync(distDir);
files.forEach(file => {
    const sourcePath = join(distDir, file);
    const targetPath = join(rootDir, file);
    try {
        copyFileSync(sourcePath, targetPath);
        console.log(`Copied ${file} to root`);
    } catch (err) {
        console.error(`Error copying ${file}:`, err);
    }
});

console.log('Deployment files copied successfully!');
