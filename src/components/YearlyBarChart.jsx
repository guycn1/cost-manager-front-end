// YearlyBarChart.jsx
//
// Screen that draws a bar chart with the total cost of each of the twelve
// months in a year the user selects, in a currency the user picks.

import React, { useEffect, useMemo, useState } from 'react';
import {
    Card, CardContent, MenuItem, Stack, TextField, Typography
} from '@mui/material';
import {
    Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

import { SUPPORTED_CURRENCIES } from '../db.js';
import { MONTH_NAMES, buildYearOptions } from '../constants.js';

const YEAR_OPTIONS = buildYearOptions();

// Ask db.js for a report per month and collect the twelve totals.
function buildMonthlyTotals(database, currency, year) {
    const rows = [];
    for (let month = 1; month <= 12; month += 1) {
        const report = database.getReport(currency, year, month);
        rows.push({
            month: MONTH_NAMES[month - 1].slice(0, 3),
            total: report.total.sum
        });
    }
    return rows;
}

function YearlyBarChart(props) {
    const { database, dataVersion } = props;

    const [year, setYear] = useState(new Date().getFullYear());
    const [currency, setCurrency] = useState('USD');
    const [rows, setRows] = useState([]);

    // Recompute the twelve monthly totals on any change.
    useEffect(function () {
        setRows(buildMonthlyTotals(database, currency, year));
    }, [database, currency, year, dataVersion]);

    const hasData = useMemo(function () {
        return rows.some(function (row) {
            return row.total > 0;
        });
    }, [rows]);

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Costs by month
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                    <TextField
                        select
                        label="Year"
                        value={year}
                        onChange={function (event) {
                            setYear(Number(event.target.value));
                        }}
                        sx={{ minWidth: 120 }}
                    >
                        {YEAR_OPTIONS.map(function (option) {
                            return (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            );
                        })}
                    </TextField>

                    <TextField
                        select
                        label="Currency"
                        value={currency}
                        onChange={function (event) {
                            setCurrency(event.target.value);
                        }}
                        sx={{ minWidth: 120 }}
                    >
                        {SUPPORTED_CURRENCIES.map(function (option) {
                            return (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            );
                        })}
                    </TextField>
                </Stack>

                {!hasData ? (
                    <Typography color="text.secondary">
                        No cost items were recorded for this year.
                    </Typography>
                ) : (
                    <ResponsiveContainer width="100%" height={360}>
                        <BarChart data={rows}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="total" fill="#1976d2" name={'Total (' + currency + ')'} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}

export default YearlyBarChart;
