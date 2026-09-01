/*
 * MonthlyReport.jsx
 *
 * Screen that shows a detailed report for a chosen month and year in a
 * currency the user selects. The report itself is produced by db.js;
 * this component only renders it as a table plus a converted total.
 */

// React and the MUI table primitives.
import React, { useEffect, useState } from 'react';
import {
    Box, Card, CardContent, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Typography
} from '@mui/material';

// The shared month / year / currency selector row.
import ReportFilters from './ReportFilters.jsx';

// One table row for a single cost item. The sum keeps its own original
// currency; only the report total is converted.
function renderCostRow(item, index) {
    return (
        <TableRow key={index}>
            {/* Day, category, description, then sum and its currency. */}
            <TableCell>{item.date.day}</TableCell>
            <TableCell>{item.category}</TableCell>
            <TableCell>{item.description}</TableCell>
            <TableCell align="right">{item.sum}</TableCell>
            <TableCell>{item.currency}</TableCell>
        </TableRow>
    );
}

function MonthlyReport(props) {
    const { database, dataVersion } = props;

    // The selectors default to the current month and year in USD.
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [currency, setCurrency] = useState('USD');
    const [report, setReport] = useState(null);

    // Rebuild the report when a selector or the stored data changes.
    useEffect(function () {
        const result = database.getReport(currency, year, month);
        setReport(result);
    }, [database, currency, year, month, dataVersion]);

    // Whether the current report has any cost items to show.
    const hasCosts = Boolean(report && report.costs.length > 0);

    // Card with the filter row, then the table and total or an empty note.
    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Monthly report
                </Typography>

                {/* Month, year and currency selectors. */}
                <ReportFilters
                    showMonth
                    month={month}
                    onMonthChange={setMonth}
                    year={year}
                    onYearChange={setYear}
                    currency={currency}
                    onCurrencyChange={setCurrency}
                />

                {/* Empty state message. */}
                {report && !hasCosts ? (
                    <Typography color="text.secondary">
                        No cost items were recorded for this month.
                    </Typography>
                ) : undefined}

                {/* Table of items plus the converted total. */}
                {hasCosts ? (
                    <Box>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                {/* Column headings. */}
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Day</TableCell>
                                        <TableCell>Category</TableCell>
                                        {/* Free text, then the amount. */}
                                        <TableCell>Description</TableCell>
                                        <TableCell align="right">Sum</TableCell>
                                        <TableCell>Currency</TableCell>
                                    </TableRow>
                                </TableHead>
                                {/* One row per cost item in the report. */}
                                <TableBody>
                                    {report.costs.map(renderCostRow)}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* The month total, converted to the chosen currency. */}
                        <Typography variant="h6" sx={{ mt: 2 }}>
                            Total: {report.total.sum} {report.total.currency}
                        </Typography>
                    </Box>
                ) : undefined}
            </CardContent>
        </Card>
    );
}

export default MonthlyReport;
