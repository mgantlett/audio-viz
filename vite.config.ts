import { defineConfig } from 'vite';
import { resolve } from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';

export default defineConfig({
    base: '/audio-viz/',
    plugins: [
        nodePolyfills({
            include: ['buffer', 'stream', 'util', 'process'],
            globals: {
                Buffer: true,
                global: true,
                process: true
            }
        }),
        viteCommonjs(),
        {
            name: 'vertx-mock',
            resolveId(id) {
                if (id === 'vertx') {
                    return 'vertx-mock';
                }
            },
            load(id) {
                if (id === 'vertx-mock') {
                    return 'export default {}';
                }
            }
        },
        {
            name: 'hrtime-polyfill',
            transform(code) {
                if (code.includes('process.hrtime')) {
                    const polyfill = `
                        if (!process.hrtime) {
                            process.hrtime = function(time) {
                                const now = performance.now();
                                const sec = Math.floor(now / 1000);
                                const nano = Math.floor((now % 1000) * 1e6);
                                if (!time) {
                                    return [sec, nano];
                                }
                                const [prevSec, prevNano] = time;
                                const diffSec = sec - prevSec;
                                const diffNano = nano - prevNano;
                                return [diffSec, diffNano];
                            };
                        }
                    `;
                    return { code: polyfill + code };
                }
            }
        }
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            '@tensorflow/tfjs-node': '@tensorflow/tfjs',
        },
    },
    define: {
        'global': 'globalThis',
        'process.env': {}
    },
    optimizeDeps: {
        esbuildOptions: {
            define: {
                global: 'globalThis'
            }
        },
        include: ['@magenta/music']
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html')
            },
            external: ['@tensorflow/tfjs-node']
        },
        commonjsOptions: {
            transformMixedEsModules: true
        }
    }
});
