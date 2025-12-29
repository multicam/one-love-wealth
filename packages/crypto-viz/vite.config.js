import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    plugins: [sveltekit()],
    resolve: {
        dedupe: ['svelte', '@one-love-wealth/shared-ui']
    },
    optimizeDeps: {
        exclude: ['@one-love-wealth/shared-ui']
    }
});
