import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  root: 'src', // Set the root directory to 'src'
  server: {
    port: 3000, // Or any other port you prefer for the demo
    open: true, // Automatically open the demo page in the browser
  },
  build: {
    outDir: '../dist-demo', // Adjust outDir to be relative to the new root, placing it at project_root/dist-demo
    rollupOptions: {
      input: {
        main: 'index.html', // This will now point to src/index.html
      },
    },
  },
});