/*
 * SettingsPanel.jsx
 *
 * Screen that lets the user set a URL from which the currency exchange
 * rates are fetched. When the field is left empty the application uses
 * its own remote rates server (see services/rates.js).
 */

// React and the MUI primitives used on this screen.
import React, { useState } from 'react';
import { Alert, Button, Stack, TextField, Typography } from '@mui/material';

// The shared screen frame and the rates service.
import ScreenCard from './ScreenCard.jsx';
import {
    defaultRatesUrl, setRatesUrl, readStoredRatesUrl, loadExchangeRates
} from '../services/rates.js';

// The example JSON shown to the user, and the help paragraph around it.
const exampleJson = '{"USD":1,"GBP":0.6,"EURO":0.7,"ILS":3.4}';
const helpText = 'The exchange rates are always fetched from a server with '
    + 'the Fetch API. Enter a URL that returns a JSON such as ' + exampleJson
    + '. Leave it empty to use the built in server.';

// Screen: configure the exchange rates URL and reload the rates.
export default function SettingsPanel(props) {
    const { onRatesReloaded } = props;

    // Start from the stored URL, if the user set one before.
    const [url, setUrl] = useState(readStoredRatesUrl());
    const [status, setStatus] = useState(null);

    // Turn a successful load into a green status line.
    function reportSuccess(result) {
        const text = 'Rates from ' + result.source + ': '
            + JSON.stringify(result.rates);
        setStatus({ severity: 'success', text });
    }

    // Turn a failed load into a red status line.
    function reportFailure(error) {
        const text = 'Could not load rates: ' + error.message;
        setStatus({ severity: 'error', text });
    }

    // Save the field, then fetch rates from the resulting source.
    async function handleSave() {
        setStatus(null);
        setRatesUrl(url);
        // An empty field means "use the default remote server".
        try {
            const result = await loadExchangeRates(url);
            reportSuccess(result);
            // Tell the parent so the other screens refetch.
            onRatesReloaded('Exchange rates updated from the server.');
        } catch (error) {
            reportFailure(error);
        }
    }

    // Clear the custom URL and go back to the default remote server.
    async function handleReset() {
        setStatus(null);
        setUrl('');
        setRatesUrl('');
        // With no argument, loadExchangeRates uses the default server.
        try {
            const result = await loadExchangeRates();
            reportSuccess(result);
            // Tell the parent so the other screens refetch.
            onRatesReloaded('Exchange rates reset to the default source.');
        } catch (error) {
            reportFailure(error);
        }
    }

    // Help text, the URL field, the status line and the two buttons.
    return (
        <ScreenCard title="Settings">
            {/* Greyed out explanation above the field. */}
            <Typography color="text.secondary" sx={{ mb: 2 }}>
                {helpText}
            </Typography>

            <Stack spacing={3}>
                {/* The URL field itself. */}
                <TextField
                    label="Exchange rates URL"
                    fullWidth
                    value={url}
                    placeholder={defaultRatesUrl}
                    onChange={event => setUrl(event.target.value)}
                />

                {/* Result of the last save or reset. */}
                {status ? (
                    <Alert severity={status.severity}>{status.text}</Alert>
                ) : undefined}

                {/* Save the typed URL, or reset to the default server. */}
                <Stack direction="row" spacing={2}>
                    <Button variant="contained" onClick={handleSave}>
                        Save and load
                    </Button>
                    {/* Clears the field and reloads the default. */}
                    <Button variant="outlined" onClick={handleReset}>
                        Use default
                    </Button>
                </Stack>
            </Stack>
        </ScreenCard>
    );
}
