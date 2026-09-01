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
    Box, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Typography
} from '@mui/material';

// The shared screen frame, filter row and empty note.
import ScreenCard from './ScreenCard.jsx';
import ReportFilters from './ReportFilters.jsx';
import EmptyNote from './EmptyNote.jsx';

// The table header row.
function renderHeadRow() {
    return (
        <TableRow>
            {/* Date and what the cost was for. */}
            <TableCell>Day</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Description</TableCell>
            {/* The amount and its original currency. */}
            <TableCell align="right">Sum</TableCell>
            <TableCell>Currency</TableCell>
        </TableRow>
    );
}

// One body row for a single cost item. The sum keeps its own original
// currency; only the report total is converted.
function renderCostRow(item, index) {
    return (
        <TableRow key={index}>
            {/* Date and what the cost was for. */}
            <TableCell>{item.date.day}</TableCell>
            <TableCell>{item.category}</TableCell>
            <TableCell>{item.description}</TableCell>
            {/* The stored amount and its currency. */}
            <TableCell align="right">{item.sum}</TableCell>
            <TableCell>{item.currency}</TableCell>
        </TableRow>
    );
}

// The table of cost items plus the converted month total.
function renderReport(report) {
    return (
        <Box>
            {/* The list of cost items for the month. */}
            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>{renderHeadRow()}</TableHead>
                    <TableBody>{report.costs.map(renderCostRow)}</TableBody>
                </Table>
            </TableContainer>
            {/* The month total in the chosen currency. */}
            <Typography variant="h6" sx={{ mt: 2 }}>
                Total: {report.total.sum} {report.total.currency}
            </Typography>
        </Box>
    );
}

// Screen: a detailed cost table and total for one month.
export default function MonthlyReport(props) {
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

    // The filter row, then the table or the empty note.
    return (
        <ScreenCard title="Monthly report">
            {/* Month, year and currency selectors. */}
            <ReportFilters
                showMonth month={month} onMonthChange={setMonth}
                year={year} onYearChange={setYear}
                currency={currency} onCurrencyChange={setCurrency}
            />
            {/* The table when the month has items, otherwise a note. */}
            {hasCosts ? renderReport(report) : undefined}
            {report && !hasCosts ? (
                <EmptyNote>No cost items were recorded for this month.</EmptyNote>
            ) : undefined}
        </ScreenCard>
    );
}
