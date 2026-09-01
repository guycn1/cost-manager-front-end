// SettingsPanel.jsx
//
// Screen that lets the user set a URL from which the currency exchange
// rates are fetched. When the field is left empty the application uses
// its own remote rates server (see services/exchangeRates.js).

import React, { useState } from 'react';
import {
    Alert, Button, Card, CardContent, Stack, TextField, Typography
} from '@mui/material';

import {
    DEFAULT_RATES_URL, setRatesUrl, loadExchangeRates
} from '../services/exchangeRates.js';

function SettingsPanel(props) {
    const { onRatesReloaded } = props;

    // Show the stored URL, but keep the default hidden as placeholder text.
    const storedUrl = window.localStorage.getItem('costsdb:ratesUrl') || '';
    const [url, setUrl] = useState(storedUrl);
    const [status, setStatus] = useState(null);

    // Save the URL and immediately try to fetch rates from it.
    async function handleSave() {
        setStatus(null);
        setRatesUrl(url);
        try {
            // An empty field means "use the default remote server".
            const result = await loadExchangeRates(url);
            setStatus({
                severity: 'success',
                text: 'Rates loaded from ' + result.source + ': '
                    + JSON.stringify(result.rates)
            });
            onRatesReloaded('Exchange rates updated from the server.');
        } catch (error) {
            setStatus({
                severity: 'error',
                text: 'Could not load rates from that URL: ' + error.message
            });
        }
    }

    // Clear the custom URL and go back to the default remote server.
    async function handleReset() {
        setStatus(null);
        setUrl('');
        setRatesUrl('');
        try {
            const result = await loadExchangeRates();
            setStatus({
                severity: 'success',
                text: 'Back to the default server (' + result.source + '): '
                    + JSON.stringify(result.rates)
            });
            onRatesReloaded('Exchange rates reset to the default source.');
        } catch (error) {
            setStatus({
                severity: 'error',
                text: 'Could not load the default rates: ' + error.message
            });
        }
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Settings
                </Typography>

                <Typography color="text.secondary" sx={{ mb: 2 }}>
                    The exchange rates are always fetched from a server with the
                    Fetch API. Enter a URL that returns a JSON such as
                    {' '}
                    {'{"USD":1,"GBP":0.6,"EURO":0.7,"ILS":3.4}'}
                    . Leave it empty to use the built in server.
                </Typography>

                <Stack spacing={3}>
                    <TextField
                        label="Exchange rates URL"
                        fullWidth
                        value={url}
                        placeholder={DEFAULT_RATES_URL}
                        onChange={function (event) {
                            setUrl(event.target.value);
                        }}
                    />

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
