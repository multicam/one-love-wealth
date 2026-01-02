import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { packages } from '../../workspace.config';

const pkg = packages['backtesting-ui'];

export default defineConfig({
    plugins: [tailwindcss(), sveltekit()],
    server: {
        port: pkg.devPort
    },
    preview: {
        port: pkg.previewPort
    },
    resolve: {
        dedupe: ['svelte', '@one-love-wealth/shared-ui', '@one-love-wealth/backtesting', '@one-love-wealth/data-layer']
    },
    optimizeDeps: {
        exclude: ['@one-love-wealth/shared-ui', '@one-love-wealth/backtesting', '@one-love-wealth/data-layer']
    }
});
