/*
 * CategoryPieChart.jsx
 *
 * Screen that draws a pie chart of the total costs for a selected
 * month and year, broken down by category, in a currency the user
 * picks. Every sum is converted before the slices are added up.
 */

// React, MUI and the recharts pie primitives.
import React, { useEffect, useMemo, useState } from 'react';
import {
    Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip
} from 'recharts';

// Shared screen frame, filter row, empty note and helpers.
import ScreenCard from './ScreenCard.jsx';
import ReportFilters from './ReportFilters.jsx';
import EmptyNote from './EmptyNote.jsx';
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
    // Shape each bucket for recharts and give it a colour in order.
    return Object.keys(totalsByCategory).map(function (category, index) {
        const value = roundMoney(totalsByCategory[category]);
        const color = chartColors[index % chartColors.length];
        return { name: category, value, color };
    });
}

// The slice label: "Category: amount".
function sliceLabel(entry) {
    return entry.name + ': ' + entry.value;
}

// A coloured slice for one category datum.
function renderSlice(entry) {
    return <Cell key={entry.name} fill={entry.color} />;
}

// The full pie chart for the given category totals.
function renderChart(chartData) {
    return (
        <ResponsiveContainer width="100%" height={360}>
            <PieChart>
                {/* One coloured slice per category. */}
                <Pie
                    data={chartData} dataKey="value" nameKey="name"
                    outerRadius={130} label={sliceLabel}
                >
                    {chartData.map(renderSlice)}
                </Pie>
                {/* Hover tooltip and the category legend. */}
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
}

// Screen: a pie chart of one month's costs split by category.
export default function CategoryPieChart(props) {
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

    // The filter row, then the pie or the empty note.
    return (
        <ScreenCard title="Costs by category">
            {/* Month, year and currency selectors. */}
            <ReportFilters
                showMonth month={month} onMonthChange={setMonth}
                year={year} onYearChange={setYear}
                currency={currency} onCurrencyChange={setCurrency}
            />
            {/* The pie when the month has items, otherwise a note. */}
            {chartData.length === 0 ? (
                <EmptyNote>No cost items were recorded for this month.</EmptyNote>
            ) : renderChart(chartData)}
        </ScreenCard>
    );
}
