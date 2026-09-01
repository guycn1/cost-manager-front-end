/*
 * SettingsPanel.jsx
 *
 * Screen that lets the user set a URL from which the currency exchange
 * rates are fetched. When the field is left empty the application uses
 * its own remote rates server (see services/exchangeRates.js).
 */

// React and the MUI primitives used on this screen.
import React, { useState } from 'react';
import {
    Alert, Button, Card, CardContent, Stack, TextField, Typography
} from '@mui/material';

// The rates service: default URL, URL storage and the loader.
import {
    defaultRatesUrl, setRatesUrl, readStoredRatesUrl, loadExchangeRates
} from '../services/exchangeRates.js';

// The example JSON shown to the user in the help text.
const exampleJson = '{"USD":1,"GBP":0.6,"EURO":0.7,"ILS":3.4}';

function SettingsPanel(props) {
    const { onRatesReloaded } = props;

    // Start from the stored URL, if the user set one before.
    const [url, setUrl] = useState(readStoredRatesUrl());
    const [status, setStatus] = useState(null);

    // Save the field and fetch rates from the resulting source.
    async function handleSave() {
        setStatus(null);
        setRatesUrl(url);
        // An empty field means "use the default remote server".
        try {
            const result = await loadExchangeRates(url);
            // Report which source answered and what it returned.
            setStatus({
                severity: 'success',
                text: 'Rates loaded from ' + result.source + ': '
                    + JSON.stringify(result.rates)
            });
            onRatesReloaded('Exchange rates updated from the server.');
        } catch (error) {
            // Report a URL that could not be read.
            setStatus({
                severity: 'error',
                text: 'Could not load rates from that URL: ' + error.message
            });
        }
    }

    // Clear the custom URL and go back to the default remote server.
    async function handleReset() {
        setStatus(null);
        // Forget the stored URL and blank the field.
        setUrl('');
        setRatesUrl('');
        try {
            // With no argument, loadExchangeRates uses the default server.
            const result = await loadExchangeRates();
            setStatus({
                severity: 'success',
                text: 'Back to the default server (' + result.source + '): '
                    + JSON.stringify(result.rates)
            });
            onRatesReloaded('Exchange rates reset to the default source.');
        } catch (error) {
            // Report a default server that could not be reached.
            setStatus({
                severity: 'error',
                text: 'Could not load the default rates: ' + error.message
            });
        }
    }

    // Card with the help text, the URL field, a status line and buttons.
    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Settings
                </Typography>

                {/* Short explanation of what the field is for. */}
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                    The exchange rates are always fetched from a server with the
                    Fetch API. Enter a URL that returns a JSON such as
                    {' ' + exampleJson + '. '}
                    Leave it empty to use the built in server.
                </Typography>

                <Stack spacing={3}>
                    {/* The URL field itself. */}
                    <TextField
                        label="Exchange rates URL"
                        fullWidth
                        value={url}
                        placeholder={defaultRatesUrl}
                        onChange={function (event) {
                            setUrl(event.target.value);
                        }}
                    />

                    {/* Result of the last save or reset. */}
                    {status ? (
                        <Alert severity={status.severity}>{status.text}</Alert>
                    ) : undefined}

                    <Stack direction="row" spacing={2}>
                        <Button variant="contained" onClick={handleSave}>
                            Save and load
                        </Button>
                        <Button variant="outlined" onClick={handleReset}>
                            Use default
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}

export default SettingsPanel;
