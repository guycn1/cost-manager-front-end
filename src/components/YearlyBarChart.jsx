/*
 * YearlyBarChart.jsx
 *
 * Screen that draws a bar chart with the total cost of each of the
 * twelve months in a year the user selects, in a currency the user
 * picks. Each bar is one call to db.js getReport.
 */

// React, MUI and the recharts bar primitives.
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import {
    Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

// Shared filter row and the month labels.
import ReportFilters from './ReportFilters.jsx';
import { monthNames } from '../constants.js';

// Ask db.js for a report per month and collect the twelve totals.
function buildMonthlyTotals(database, currency, year) {
    const rows = [];
    // One row per month, using the three letter month label.
    for (let month = 1; month <= 12; month += 1) {
        const report = database.getReport(currency, year, month);
        rows.push({
            month: monthNames[month - 1].slice(0, 3),
            total: report.total.sum
        });
    }
    return rows;
}

function YearlyBarChart(props) {
    const { database, dataVersion } = props;

    // The year selector defaults to the current year, in USD.
    const [year, setYear] = useState(new Date().getFullYear());
    const [currency, setCurrency] = useState('USD');
    const [rows, setRows] = useState([]);

    // Recompute the twelve monthly totals on any change.
    useEffect(function () {
        setRows(buildMonthlyTotals(database, currency, year));
    }, [database, currency, year, dataVersion]);

    // Whether any month in the selected year has a cost.
    const hasData = useMemo(function () {
        return rows.some(function (row) {
            return row.total > 0;
        });
    }, [rows]);

    // Card with the filter row and either the chart or an empty note.
    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Costs by month
                </Typography>

                {/* Year and currency selectors, no month here. */}
                <ReportFilters
                    showMonth={false}
                    year={year}
                    onYearChange={setYear}
                    currency={currency}
                    onCurrencyChange={setCurrency}
                />

                {/* Empty state, or the bar chart itself. */}
                {!hasData ? (
                    <Typography color="text.secondary">
                        No cost items were recorded for this year.
                    </Typography>
                ) : (
                    <ResponsiveContainer width="100%" height={360}>
                        {/* Grid, axes and tooltip, then one bar series. */}
                        <BarChart data={rows}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            {/* One bar per month, keyed on the month label. */}
                            <Bar
                                dataKey="total"
                                fill="#1976d2"
                                name={'Total (' + currency + ')'}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}

export default YearlyBarChart;
