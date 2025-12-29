/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
            colors: {
                background: '#1a1a2e',
                surface: '#16213e',
                'surface-light': '#1f2937',
                border: '#2d2d44',
                'text-primary': '#f3f4f6',
                'text-secondary': '#9ca3af',
                accent: '#3b82f6',
                success: '#22c55e',
                danger: '#ef4444',
                warning: '#f59e0b'
            }
        }
    },
    plugins: []
};
