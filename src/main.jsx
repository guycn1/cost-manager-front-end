/*
 * main.jsx
 *
 * Application entry point. It mounts the React tree into the page and
 * applies a light MUI theme suited to a desktop tool.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App.jsx';

// A light theme is enough for a desktop oriented tool like this one.
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: '#1976d2' }
    }
});

// Mount the tree onto the root element defined in index.html.
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

// CssBaseline applies the MUI baseline styles; App is the whole UI.
root.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            {/* Baseline styles, then the application. */}
            <CssBaseline />
            <App />
        </ThemeProvider>
    </React.StrictMode>
);
