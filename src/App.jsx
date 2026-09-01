// App.jsx
//
// Top level component. It opens the database once, loads the currency
// exchange rates from the server, and switches between the five screens
// of the application through a tab bar.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    AppBar, Alert, Box, Container, Snackbar, Tab, Tabs, Toolbar, Typography
} from '@mui/material';

import { openCostsDB } from './db.js';
import { DATABASE_NAME, DATABASE_VERSION } from './constants.js';
import { loadExchangeRates } from './services/exchangeRates.js';

import AddCostForm from './components/AddCostForm.jsx';
import MonthlyReport from './components/MonthlyReport.jsx';
import CategoryPieChart from './components/CategoryPieChart.jsx';
import YearlyBarChart from './components/YearlyBarChart.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';

function App() {
    // The open database wrapper is stable for the whole session.
    const database = useMemo(
        function () {
            return openCostsDB(DATABASE_NAME, DATABASE_VERSION);
        },
        []
    );

    const [activeTab, setActiveTab] = useState(0);
    // Bumping this counter tells the report and chart screens to reload.
    const [dataVersion, setDataVersion] = useState(0);
    const [notice, setNotice] = useState(null);

    // Pull the exchange rates from the server as soon as the app starts.
    useEffect(function () {
        loadExchangeRates()
            .then(function () {
                setDataVersion(function (value) {
                    return value + 1;
                });
            })
            .catch(function (error) {
                setNotice({
                    severity: 'warning',
                    text: 'Could not load exchange rates from the server. '
                        + 'Using built in rates for now. (' + error.message + ')'
                });
            });
    }, []);

    // Called by child screens after they change the stored data.
    const handleDataChanged = useCallback(function (message) {
        setDataVersion(function (value) {
            return value + 1;
        });
        if (message) {
            setNotice({ severity: 'success', text: message });
        }
    }, []);

    // Re-fetch rates after the user saves a new URL in the settings.
    const handleRatesReloaded = useCallback(function (message) {
        setDataVersion(function (value) {
            return value + 1;
        });
        setNotice({ severity: 'success', text: message });
    }, []);

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="h1">
                        Cost Manager
                    </Typography>
                </Toolbar>
                <Tabs
                    value={activeTab}
                    onChange={function (event, value) {
                        setActiveTab(value);
                    }}
                    textColor="inherit"
                    indicatorColor="secondary"
                    variant="scrollable"
                >
                    <Tab label="Add Cost" />
                    <Tab label="Monthly Report" />
                    <Tab label="Category Pie Chart" />
                    <Tab label="Yearly Bar Chart" />
                    <Tab label="Settings" />
                </Tabs>
            </AppBar>

            <Container maxWidth="md" sx={{ py: 4 }}>
                {activeTab === 0 && (
                    <AddCostForm database={database} onCostAdded={handleDataChanged} />
                )}
                {activeTab === 1 && (
                    <MonthlyReport database={database} dataVersion={dataVersion} />
                )}
                {activeTab === 2 && (
                    <CategoryPieChart database={database} dataVersion={dataVersion} />
                )}
                {activeTab === 3 && (
                    <YearlyBarChart database={database} dataVersion={dataVersion} />
                )}
                {activeTab === 4 && (
                    <SettingsPanel onRatesReloaded={handleRatesReloaded} />
                )}
            </Container>

            <Snackbar
                open={Boolean(notice)}
                autoHideDuration={5000}
                onClose={function () {
                    setNotice(null);
                }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                {notice ? (
                    <Alert
                        severity={notice.severity}
                        onClose={function () {
                            setNotice(null);
                        }}
                    >
                        {notice.text}
                    </Alert>
                ) : undefined}
            </Snackbar>
        </Box>
    );
}

export default App;
