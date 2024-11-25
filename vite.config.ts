import { defineConfig, Plugin } from 'vite';
import path from 'path';

// Create a plugin to inject build timestamp
const buildTimestampPlugin = (): Plugin => ({
  name: 'build-timestamp',
  transformIndexHtml: {
    transform(html) {
      const timestamp = new Date().toLocaleString();
      return html.replace('<!--BUILD_TIMESTAMP-->', timestamp);
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
