import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { packages } from '../../workspace.config';

const pkg = packages['trading-dashboards'];

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		port: pkg.devPort
	},
	preview: {
		port: pkg.previewPort
	},
	resolve: {
		dedupe: ['svelte', '@one-love-wealth/shared-ui']
	},
	optimizeDeps: {
		exclude: ['@one-love-wealth/shared-ui']
	}
});
