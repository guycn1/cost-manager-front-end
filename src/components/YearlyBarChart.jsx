/*
 * YearlyBarChart.jsx
 *
 * Screen that draws a bar chart with the total cost of each of the
 * twelve months in a year the user selects, in a currency the user
 * picks. Each bar is one call to db.js getReport.
 */

// React, MUI and the recharts bar primitives.
import React, { useEffect, useMemo, useState } from 'react';
import {
    Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

// Shared screen frame, filter row, empty note and month labels.
import ScreenCard from './ScreenCard.jsx';
import ReportFilters from './ReportFilters.jsx';
import EmptyNote from './EmptyNote.jsx';
import { monthNames } from '../constants.js';

// Ask db.js for a report per month and collect the twelve totals.
function buildMonthlyTotals(database, currency, year) {
    const rows = [];
    // One row per month: a three letter label and the converted total.
    for (let month = 1; month <= 12; month += 1) {
        const report = database.getReport(currency, year, month);
        const label = monthNames[month - 1].slice(0, 3);
        rows.push({ month: label, total: report.total.sum });
    }
    return rows;
}

// Screen: a bar chart of the twelve monthly totals in one year.
export default function YearlyBarChart(props) {
    const { database, dataVersion } = props;

    // The year selector defaults to the current year, in USD.
    const [year, setYear] = useState(new Date().getFullYear());
    const [currency, setCurrency] = useState('USD');
    const [rows, setRows] = useState([]);

    // Recompute the twelve monthly totals on any change.
    useEffect(() => {
        setRows(buildMonthlyTotals(database, currency, year));
    }, [database, currency, year, dataVersion]);

    // Whether any month in the selected year has a cost.
    const hasData = useMemo(
        () => rows.some(row => row.total > 0),
        [rows]
    );

    // The filter row, then the chart or the empty note.
    return (
        <ScreenCard title="Costs by month">
            {/* Year and currency selectors, no month here. */}
            <ReportFilters
                showMonth={false} year={year} onYearChange={setYear}
                currency={currency} onCurrencyChange={setCurrency}
            />

            {/* An empty note when the year has nothing, else the chart. */}
            {!hasData ? (
                <EmptyNote>No cost items were recorded for this year.</EmptyNote>
            ) : (
                <ResponsiveContainer width="100%" height={360}>
                    {/* Grid, the two axes, the tooltip and one bar per month. */}
                    <BarChart data={rows}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                            dataKey="total" fill="#1976d2"
                            name={'Total in ' + currency}
                        />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </ScreenCard>
    );
}
