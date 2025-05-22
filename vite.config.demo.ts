import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess'; // For SCSS, PostCSS, etc.
// import path from 'path'; // Import path if you use it for aliases

// https://vitejs.dev/config/
export default defineConfig({
  root: 'src', // Set the root directory to 'src'
  plugins: [
    svelte({
      preprocess: sveltePreprocess(), // Optional: for SCSS, PostCSS, etc.
      compilerOptions: {
        runes: true, // Enable Svelte 5 runes
      },
    }),
  ],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: '../dist-demo', // Output directory relative to the project root
    rollupOptions: {
      input: {
        // This path is relative to the `root` directory specified above (`src`)
        main: 'index.html', // Resolves to `src/index.html`
      },
    },
  },
  resolve: {
    alias: {
      // Example: '$lib': path.resolve(__dirname, './src/lib')
      // Ensure 'path' is imported if you uncomment and use path.resolve
    },
    dedupe: ['svelte'], // Helps prevent issues with multiple Svelte versions
  },
});
