// CategoryPieChart.jsx
//
// Screen that draws a pie chart of the total costs for a selected month
// and year, broken down by category, in a currency the user picks.

import React, { useEffect, useMemo, useState } from 'react';
import {
    Card, CardContent, MenuItem, Stack, TextField, Typography
} from '@mui/material';
import {
    Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip
} from 'recharts';

import { SUPPORTED_CURRENCIES } from '../db.js';
import { convertAmount, roundMoney } from '../lib/convert.js';
import { CHART_COLORS, MONTH_NAMES, buildYearOptions } from '../constants.js';

const YEAR_OPTIONS = buildYearOptions();

// Group the report items by category, converting every sum first.
function buildCategoryTotals(reportCosts, currency) {
    const totalsByCategory = {};
    reportCosts.forEach(function (item) {
        const converted = convertAmount(item.sum, item.currency, currency);
        const key = item.category || 'Uncategorised';
        totalsByCategory[key] = (totalsByCategory[key] || 0) + converted;
    });
    return Object.keys(totalsByCategory).map(function (category) {
        return { name: category, value: roundMoney(totalsByCategory[category]) };
    });
}

function CategoryPieChart(props) {
    const { database, dataVersion } = props;

    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [currency, setCurrency] = useState('USD');
    const [reportCosts, setReportCosts] = useState([]);

    // Reload the raw report items on any change.
    useEffect(function () {
        const result = database.getReport(currency, year, month);
        setReportCosts(result.costs);
    }, [database, currency, year, month, dataVersion]);

    const chartData = useMemo(function () {
        return buildCategoryTotals(reportCosts, currency);
    }, [reportCosts, currency]);

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Costs by category
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                    <TextField
                        select
                        label="Month"
                        value={month}
                        onChange={function (event) {
                            setMonth(Number(event.target.value));
                        }}
                        sx={{ minWidth: 140 }}
                    >
                        {MONTH_NAMES.map(function (name, index) {
                            return (
                                <MenuItem key={name} value={index + 1}>
                                    {name}
                                </MenuItem>
                            );
                        })}
                    </TextField>

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

                {chartData.length === 0 ? (
                    <Typography color="text.secondary">
                        No cost items were recorded for this month.
                    </Typography>
                ) : (
                    <ResponsiveContainer width="100%" height={360}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={130}
                                label={function (entry) {
                                    return entry.name + ': ' + entry.value;
                                }}
                            >
                                {chartData.map(function (entry, index) {
                                    return (
                                        <Cell
                                            key={entry.name}
                                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                                        />
                                    );
                                })}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}

export default CategoryPieChart;
