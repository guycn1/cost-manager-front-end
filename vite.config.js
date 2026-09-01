// Build configuration for the cost manager front end.
// A relative base keeps the bundle working when it is served from
// a sub path on the hosting provider.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    base: './',
    plugins: [react()],
    server: {
        port: 5173,
        open: true
    }
});
