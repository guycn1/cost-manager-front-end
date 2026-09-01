/*
 * MonthlyReport.jsx
 *
 * Screen that shows a detailed report for a chosen month and year in a
 * currency the user selects. The report is produced by db.js; the
 * table and total are drawn by ReportTable.
 */

// React and hooks.
import React, { useEffect, useState } from 'react';

// The shared screen frame, filter row, empty note and the table.
import ScreenCard from './ScreenCard.jsx';
import ReportFilters from './ReportFilters.jsx';
import EmptyNote from './EmptyNote.jsx';
import ReportTable from './ReportTable.jsx';

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

    // The filter row, then the table or an empty note.
    return (
        <ScreenCard title="Monthly report">
            {/* Month, year and currency selectors. */}
            <ReportFilters
                showMonth month={month} onMonthChange={setMonth}
                year={year} onYearChange={setYear}
                currency={currency} onCurrencyChange={setCurrency}
            />
            {/* The table, or a note when the month has nothing. */}
            {hasCosts ? <ReportTable report={report} /> : undefined}
            {report && !hasCosts ? (
                <EmptyNote>No cost items were recorded for this month.</EmptyNote>
            ) : undefined}
        </ScreenCard>
    );
}
