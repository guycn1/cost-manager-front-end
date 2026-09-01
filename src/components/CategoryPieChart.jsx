/*
 * CategoryPieChart.jsx
 *
 * Screen that draws a pie chart of the total costs for a selected
 * month and year, broken down by category, in a currency the user
 * picks. Every sum is converted before the slices are added up.
 */

// React, MUI and the recharts pie primitives.
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import {
    Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip
} from 'recharts';

// Shared filter row, the currency helper and the slice colours.
import ReportFilters from './ReportFilters.jsx';
import { convertAmount, roundMoney } from '../lib/convert.js';
import { chartColors } from '../constants.js';

// Group the report items by category, converting every sum first.
function buildCategoryTotals(reportCosts, currency) {
    const totalsByCategory = {};
    // Add every converted sum onto its category bucket.
    reportCosts.forEach(function (item) {
        const converted = convertAmount(item.sum, item.currency, currency);
        const key = item.category || 'Uncategorised';
        totalsByCategory[key] = (totalsByCategory[key] || 0) + converted;
    });
    // Turn the buckets into the array shape recharts expects, giving
    // each slice a colour from the palette in order.
    return Object.keys(totalsByCategory).map(function (category, index) {
        const value = roundMoney(totalsByCategory[category]);
        const color = chartColors[index % chartColors.length];
        return { name: category, value, color };
    });
}

function CategoryPieChart(props) {
    const { database, dataVersion } = props;

    // The selectors default to the current month and year in USD.
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [currency, setCurrency] = useState('USD');
    const [reportCosts, setReportCosts] = useState([]);

    // Reload the raw report items when a selector or the data changes.
    useEffect(function () {
        const result = database.getReport(currency, year, month);
        setReportCosts(result.costs);
    }, [database, currency, year, month, dataVersion]);

    // Derive the per category totals for the chart.
    const chartData = useMemo(function () {
        return buildCategoryTotals(reportCosts, currency);
    }, [reportCosts, currency]);

    // Card with the filter row and either the pie or an empty note.
    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Costs by category
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

                {/* Empty state, or the pie chart itself. */}
                {chartData.length === 0 ? (
                    <Typography color="text.secondary">
                        No cost items were recorded for this month.
                    </Typography>
                ) : (
                    <ResponsiveContainer width="100%" height={360}>
                        <PieChart>
                            {/* One slice per category, labelled with its value. */}
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={130}
                                label={function (entry) {
                                    return entry.name + ': ' + entry.value;
                                }}
                            >
                                {/* Colour each slice from its own data. */}
                                {chartData.map(function (entry) {
                                    return <Cell key={entry.name} fill={entry.color} />;
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
