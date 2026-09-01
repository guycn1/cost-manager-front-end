/*
 * App.jsx
 *
 * Top level component. It opens the database once, loads the currency
 * exchange rates from the server, and switches between the five
 * screens of the application through a tab bar.
 */

// React and MUI.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    AppBar, Alert, Box, Container, Snackbar, Tab, Tabs, Toolbar, Typography
} from '@mui/material';

// The database library, shared constants and the rates service.
import { openCostsDB } from './db.js';
import { databaseName, databaseVersion } from './constants.js';
import { loadExchangeRates, remoteRatesUrl } from './services/exchangeRates.js';

// One screen component per tab.
import AddCostForm from './components/AddCostForm.jsx';
import MonthlyReport from './components/MonthlyReport.jsx';
import CategoryPieChart from './components/CategoryPieChart.jsx';
import YearlyBarChart from './components/YearlyBarChart.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';

function App() {
    // The open database wrapper is stable for the whole session.
    const database = useMemo(function () {
        return openCostsDB(databaseName, databaseVersion);
    }, []);

    // Which tab is visible, and a counter that forces the report and
    // chart screens to reload after the stored data changes.
    const [activeTab, setActiveTab] = useState(0);
    const [dataVersion, setDataVersion] = useState(0);
    const [notice, setNotice] = useState(null);

    // Bump the reload counter.
    const bumpDataVersion = useCallback(function () {
        setDataVersion(function (value) {
            return value + 1;
        });
    }, []);

    // Pull the exchange rates from the server as soon as the app loads.
    useEffect(function () {
        loadExchangeRates()
            .then(function (result) {
                bumpDataVersion();
                // Warn when the remote server could not be reached and
                // the bundled copy of the rates was used instead.
                if (result.source !== remoteRatesUrl) {
                    setNotice({
                        severity: 'warning',
                        text: 'The rates server could not be reached. '
                            + 'Using the built in copy of the rates for now.'
                    });
                }
            })
            .catch(function (error) {
                // Both the remote server and the bundled copy failed.
                setNotice({
                    severity: 'error',
                    text: 'Could not load exchange rates: ' + error.message
                });
            });
    }, [bumpDataVersion]);

    // Called by a child screen after it changes the stored data.
    const handleDataChanged = useCallback(function (message) {
        bumpDataVersion();
        if (message) {
            setNotice({ severity: 'success', text: message });
        }
    }, [bumpDataVersion]);

    // Called by the settings screen after new rates are loaded.
    const handleRatesReloaded = useCallback(function (message) {
        bumpDataVersion();
        setNotice({ severity: 'success', text: message });
    }, [bumpDataVersion]);

    // The label shown on each tab.
    const tabLabels = [
        'Add Cost', 'Monthly Report', 'Category Pie Chart',
        'Yearly Bar Chart', 'Settings'
    ];
    // The screen for each tab, in the same order as the labels above.
    const screens = [
        <AddCostForm database={database} onCostAdded={handleDataChanged} />,
        <MonthlyReport database={database} dataVersion={dataVersion} />,
        <CategoryPieChart database={database} dataVersion={dataVersion} />,
        <YearlyBarChart database={database} dataVersion={dataVersion} />,
        <SettingsPanel onRatesReloaded={handleRatesReloaded} />
    ];

    // Title bar, tab strip, the active screen and the message bar.
    return (
        <Box>
            <AppBar position="static">
                {/* Title bar. */}
                <Toolbar>
                    <Typography variant="h6" component="h1">
                        Cost Manager
                    </Typography>
                </Toolbar>

                {/* Tab strip: one tab per screen, built from tabLabels. */}
                <Tabs
                    value={activeTab}
                    onChange={function (event, value) {
                        setActiveTab(value);
                    }}
                    textColor="inherit"
                    indicatorColor="secondary"
                    variant="scrollable"
                >
                    {/* One <Tab> per label; its index is the tab value. */}
                    {tabLabels.map(function (label) {
                        return <Tab key={label} label={label} />;
                    })}
                </Tabs>
            </AppBar>

            {/* Only the screen for the active tab is rendered. */}
            <Container maxWidth="md" sx={{ py: 4 }}>
                {screens[activeTab]}
            </Container>

            {/* Transient success, warning and error messages. */}
            <Snackbar
                open={Boolean(notice)}
                autoHideDuration={5000}
                onClose={function () {
                    setNotice(null);
                }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                {/* The coloured alert, shown only while a notice is set. */}
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
