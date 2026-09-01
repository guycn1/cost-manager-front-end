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
import {
    loadExchangeRates, readStoredRatesUrl, bundledRatesUrl
} from './services/rates.js';

// One screen component per tab.
import AddCostForm from './components/AddCostForm.jsx';
import MonthlyReport from './components/MonthlyReport.jsx';
import CategoryPieChart from './components/CategoryPieChart.jsx';
import YearlyBarChart from './components/YearlyBarChart.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';

// The label shown on each tab, in tab order.
const tabLabels = [
    'Add Cost', 'Monthly Report', 'Category Pie Chart',
    'Yearly Bar Chart', 'Settings'
];

// How often to re-check the configured rates URL, in milliseconds.
const ratesRefreshInterval = 10 * 60 * 1000;

// The root component: opens the database, loads the rates and hosts the
// tab bar that switches between the five screens.
export default function App() {
    // The open database wrapper is stable for the whole session.
    const database = useMemo(
        () => openCostsDB(databaseName, databaseVersion),
        []
    );

    // Which tab is visible, a reload counter for the report and chart
    // screens, and the current transient message (or null).
    const [activeTab, setActiveTab] = useState(0);
    const [dataVersion, setDataVersion] = useState(0);
    const [notice, setNotice] = useState(null);

    // Bump the reload counter so child screens refetch.
    const bumpDataVersion = useCallback(
        () => setDataVersion(value => value + 1),
        []
    );

    // Clear the current message.
    const clearNotice = useCallback(() => setNotice(null), []);

    // Load the rates from the URL saved on the settings screen, or the
    // default source when none is set, and let the report screens
    // recompute once the fresh values are in memory.
    const loadRates = useCallback(() => {
        return loadExchangeRates(readStoredRatesUrl()).then(result => {
            bumpDataVersion();
            return result;
        });
    }, [bumpDataVersion]);

    // Fetch once on startup, then re-check the same URL on a timer so a
    // value entered on the settings screen is picked up over time. Only
    // the first load reports a problem to the user.
    useEffect(() => {
        loadRates()
            .then(result => {
                // The bundled copy means the network fetch failed.
                if (result.source === bundledRatesUrl) {
                    setNotice({
                        severity: 'warning',
                        text: 'The rates server could not be reached. '
                            + 'Using the built in copy of the rates for now.'
                    });
                }
            })
            // A configured URL that fails to load has no fallback.
            .catch(error => {
                setNotice({
                    severity: 'error',
                    text: 'Could not load exchange rates: ' + error.message
                });
            });
        // Background refreshes stay silent; a failed one is ignored.
        const timer = setInterval(() => {
            loadRates().catch(() => undefined);
        }, ratesRefreshInterval);
        return () => clearInterval(timer);
    }, [loadRates]);

    // Called by a child screen after it changes the stored data.
    const handleDataChanged = useCallback(message => {
        bumpDataVersion();
        if (message) {
            setNotice({ severity: 'success', text: message });
        }
    }, [bumpDataVersion]);

    // Called by the settings screen after new rates are loaded.
    const handleRatesReloaded = useCallback(message => {
        bumpDataVersion();
        setNotice({ severity: 'success', text: message });
    }, [bumpDataVersion]);

    // The screen for each tab, rebuilt on render so props stay current.
    const screens = [
        <AddCostForm database={database} onCostAdded={handleDataChanged} />,
        <MonthlyReport database={database} dataVersion={dataVersion} />,
        <CategoryPieChart database={database} dataVersion={dataVersion} />,
        <YearlyBarChart database={database} dataVersion={dataVersion} />,
        <SettingsPanel onRatesReloaded={handleRatesReloaded} />
    ];

    // The alert to drop into the Snackbar, or nothing when idle.
    const noticeAlert = notice ? (
        <Alert severity={notice.severity} onClose={clearNotice}>
            {notice.text}
        </Alert>
    ) : undefined;

    // Title bar and tab strip, then the active screen, then the message.
    return (
        <Box>
            <AppBar position="static">
                {/* Title bar. */}
                <Toolbar>
                    <Typography variant="h6" component="h1">
                        Cost Manager
                    </Typography>
                </Toolbar>

                {/* One tab per label; its index is the tab value. */}
                <Tabs
                    value={activeTab}
                    onChange={(event, value) => setActiveTab(value)}
                    textColor="inherit" indicatorColor="secondary"
                    variant="scrollable"
                >
                    {/* One <Tab> per entry in the label list. */}
                    {tabLabels.map(label => <Tab key={label} label={label} />)}
                </Tabs>
            </AppBar>

            {/* Only the screen for the active tab is rendered. */}
            <Container maxWidth="md" sx={{ py: 4 }}>
                {screens[activeTab]}
            </Container>

            {/* Transient success, warning and error message. */}
            <Snackbar
                open={Boolean(notice)} autoHideDuration={5000} onClose={clearNotice}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                {/* The alert built above, shown only while a notice is set. */}
                {noticeAlert}
            </Snackbar>
        </Box>
    );
}
