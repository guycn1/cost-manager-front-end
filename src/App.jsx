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
import { loadExchangeRates, remoteRatesUrl } from './services/rates.js';

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

// The floating message bar at the bottom of the screen.
function renderNotice(notice, onClose) {
    // The Snackbar needs a single child, so build the alert (or
    // undefined) first, then drop it in.
    const alert = notice
        ? <Alert severity={notice.severity} onClose={onClose}>{notice.text}</Alert>
        : undefined;
    // Auto-hide after five seconds; centred along the bottom edge.
    const anchor = { vertical: 'bottom', horizontal: 'center' };
    return (
        <Snackbar
            open={Boolean(notice)} autoHideDuration={5000}
            onClose={onClose} anchorOrigin={anchor}
        >
            {/* The alert element, or nothing when there is no message. */}
            {alert}
        </Snackbar>
    );
}

// The root component: opens the database, loads the rates and hosts
// the tab bar that switches between the five screens.
export default function App() {
    // The open database wrapper is stable for the whole session.
    const database = useMemo(function () {
        return openCostsDB(databaseName, databaseVersion);
    }, []);

    // Which tab is visible, a reload counter for the report and chart
    // screens, and the current transient message (or null).
    const [activeTab, setActiveTab] = useState(0);
    const [dataVersion, setDataVersion] = useState(0);
    const [notice, setNotice] = useState(null);

    // Bump the reload counter so child screens refetch.
    const bumpDataVersion = useCallback(function () {
        setDataVersion(function (value) {
            return value + 1;
        });
    }, []);

    // Clear the current message.
    const clearNotice = useCallback(function () {
        setNotice(null);
    }, []);

    // Pull the exchange rates from the server as soon as the app loads.
    useEffect(function () {
        loadExchangeRates()
            .then(function (result) {
                bumpDataVersion();
                // A source other than the remote one means the bundled
                // copy of the rates was used as a fallback.
                if (result.source !== remoteRatesUrl) {
                    // Let the user know the rates may be stale.
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

    // Tab strip change handler.
    function onTabChange(event, value) {
        setActiveTab(value);
    }

    // The screen for each tab, rebuilt on render so props stay current.
    const screens = [
        <AddCostForm database={database} onCostAdded={handleDataChanged} />,
        <MonthlyReport database={database} dataVersion={dataVersion} />,
        <CategoryPieChart database={database} dataVersion={dataVersion} />,
        <YearlyBarChart database={database} dataVersion={dataVersion} />,
        <SettingsPanel onRatesReloaded={handleRatesReloaded} />
    ];

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
                    value={activeTab} onChange={onTabChange}
                    textColor="inherit" indicatorColor="secondary"
                    variant="scrollable"
                >
                    {/* Build the strip from the tabLabels list. */}
                    {tabLabels.map(function (label) {
                        return <Tab key={label} label={label} />;
                    })}
                </Tabs>
            </AppBar>

            {/* Only the screen for the active tab is rendered. */}
            <Container maxWidth="md" sx={{ py: 4 }}>
                {screens[activeTab]}
            </Container>

            {/* Success, warning and error messages. */}
            {renderNotice(notice, clearNotice)}
        </Box>
    );
}
