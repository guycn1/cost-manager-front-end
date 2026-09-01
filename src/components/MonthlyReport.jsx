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
    Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Typography
} from '@mui/material';

// The shared screen frame, filter row and empty note.
import ScreenCard from './ScreenCard.jsx';
import ReportFilters from './ReportFilters.jsx';
import EmptyNote from './EmptyNote.jsx';

// The column headings, in table order.
const headings = ['Day', 'Category', 'Description', 'Sum', 'Currency'];

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
    useEffect(() => {
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

            {/* A note when the chosen month holds no items. */}
            {report && !hasCosts ? (
                <EmptyNote>No cost items were recorded for this month.</EmptyNote>
            ) : undefined}

            {/* The table of items plus the converted month total. */}
            {hasCosts ? (
                <>
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            {/* Heading row, one cell per column. */}
                            <TableHead>
                                <TableRow>
                                    {headings.map(head => (
                                        <TableCell key={head}>{head}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            {/* One body row per cost item. */}
                            <TableBody>
                                {report.costs.map((item, index) => (
                                    <TableRow key={index}>
                                        {/* Day, category and description. */}
                                        <TableCell>{item.date.day}</TableCell>
                                        <TableCell>{item.category}</TableCell>
                                        <TableCell>{item.description}</TableCell>
                                        {/* The amount and its own currency. */}
                                        <TableCell>{item.sum}</TableCell>
                                        <TableCell>{item.currency}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* The month total, converted to the chosen currency. */}
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Total: {report.total.sum} {report.total.currency}
                    </Typography>
                </>
            ) : undefined}
        </ScreenCard>
    );
}
