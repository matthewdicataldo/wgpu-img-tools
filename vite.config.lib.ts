/// <reference types="vitest" />
import { defineConfig, configDefaults } from 'vitest/config';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'), // Main entry point of your library
            name: 'WgpuImgTools', // Global variable name when used in UMD/IIFE builds
            fileName: (format) => `wgpu-img-tools.${format}.js`, // Output file name
            formats: ['es', 'umd', 'iife'], // Output formats
        },
        rollupOptions: {
            // Externalize dependencies that should not be bundled
            // e.g., external: ['vue'],
            output: {
                // Global variables to use in the UMD/IIFE build
                // e.g., globals: { vue: 'Vue' },
            },
        },
        sourcemap: true, // Generate source maps for debugging
    },
    plugins: [
        dts({ // Generates .d.ts files from your TypeScript sources
            insertTypesEntry: true,
            // Optionally specify the path to your tsconfig.json if not in root
            // tsConfigFilePath: './tsconfig.json', 
        }),
    ],
    server: {
        watch: {
            ignored: [
                '**/node_modules/**',
                '**/.git/**',
                '**/dist/**',
                '**/playwright-report/**', // Explicitly ignore playwright-report
                '**/coverage/**',
            ],
        },
    },
    test: {
        globals: true,
        environment: 'happy-dom',
        // setupFiles: ['./tests/setup.ts'], // Uncomment if you create a setup file
        include: [
            'src/**/*.test.ts',
            'tests/unit/**/*.test.ts',
            'tests/integration/**/*.test.ts'
        ],
        exclude: [
            ...configDefaults.exclude,
            'tests/e2e/**'
        ],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
        },
        ui: true,
        // open: true, // You might want to uncomment this to auto-open UI
    },
}); 