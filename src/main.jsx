// Application entry point. Mounts the React tree and applies a MUI theme.
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

const rootElement = document.getElementById('root');

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </React.StrictMode>
);
