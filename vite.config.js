/*
 * vite.config.js
 *
 * Build configuration for the cost manager front end. A relative base
 * keeps the bundle working when it is served from a sub path on the
 * hosting provider.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// A relative base keeps the built bundle working from a sub path.
export default defineConfig({
    base: './',
    // React support, then a dev server that opens on a fixed port.
    plugins: [react()],
    server: {
        port: 5173,
        open: true
    }
});
