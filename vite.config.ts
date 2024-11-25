import { defineConfig, Plugin } from 'vite';
import path from 'path';

// Create a plugin to inject build timestamp
const buildTimestampPlugin = (): Plugin => ({
  name: 'build-timestamp',
  transformIndexHtml: {
    transform(html) {
      console.log('Injecting build timestamp...');
      const timestamp = new Date().toLocaleString();
      console.log('Timestamp:', timestamp);
      const result = html.replace('<!--BUILD_TIMESTAMP-->', timestamp);
      if (result === html) {
        console.warn('Warning: Build timestamp placeholder not found in HTML');
      }
      return result;
    }
  }
});

export default defineConfig({
  plugins: [buildTimestampPlugin()],
  base: '/audio-viz/',
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  server: {
    port: 3000,
    open: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, './src/core'),
      '@components': path.resolve(__dirname, './src/components'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@scenes': path.resolve(__dirname, './src/scenes')
    }
  }
});
