import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// The page talks to no server at all: everything it hands to revoked travels
// as a revoked:// link the installed app opens.
export default defineConfig({
  plugins: [svelte()],
  build: {
    target: 'es2022',
    sourcemap: false,
  },
});
