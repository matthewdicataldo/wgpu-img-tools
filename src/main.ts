import App from './DemoApp.svelte';
// If you have global styles or Tailwind directives you want to process,
// you might import a CSS file here, e.g.:
// import './index.css'; // Create this file if needed

const app = new App({
  target: document.getElementById('app')!, // Use non-null assertion if you are sure 'app' exists
});

export default app;
