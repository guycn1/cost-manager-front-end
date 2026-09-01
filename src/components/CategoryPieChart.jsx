/*
 * CategoryPieChart.jsx
 *
 * Screen that draws a pie chart of the total costs for a selected
 * month and year, broken down by category, in a currency the user
 * picks. Every sum is converted before the slices are added up.
 */

// React and hooks.
import React, { useEffect, useMemo, useState } from 'react';

// Shared screen frame, filter row, empty note, the pie and helpers.
import ScreenCard from './ScreenCard.jsx';
import ReportFilters from './ReportFilters.jsx';
import EmptyNote from './EmptyNote.jsx';
import CategoryPie from './CategoryPie.jsx';
import { convertAmount, roundMoney } from '../lib/convert.js';
import { chartColors } from '../constants.js';

// Group the report items by category, converting every sum first.
function buildCategoryTotals(reportCosts, currency) {
    const totalsByCategory = {};
    // Add every converted sum onto its category's running total.
    reportCosts.forEach(item => {
        const converted = convertAmount(item.sum, item.currency, currency);
        const key = item.category || 'Uncategorised';
        totalsByCategory[key] = (totalsByCategory[key] || 0) + converted;
    });
    // Turn the totals into the { name, value, colour } rows the pie wants.
    return Object.keys(totalsByCategory).map((category, index) => ({
        name: category,
        value: roundMoney(totalsByCategory[category]),
        color: chartColors[index % chartColors.length]
    }));
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
    useEffect(() => {
        const result = database.getReport(currency, year, month);
        setReportCosts(result.costs);
    }, [database, currency, year, month, dataVersion]);

    // Derive the per category totals for the chart.
    const chartData = useMemo(
        () => buildCategoryTotals(reportCosts, currency),
        [reportCosts, currency]
    );

    // The filter row, then the pie or an empty note.
    return (
        <ScreenCard title="Costs by category">
            {/* Month, year and currency selectors. */}
            <ReportFilters
                showMonth month={month} onMonthChange={setMonth}
                year={year} onYearChange={setYear}
                currency={currency} onCurrencyChange={setCurrency}
            />
            {/* The pie, or a note when the month has nothing. */}
            {chartData.length === 0 ? (
                <EmptyNote>No cost items were recorded for this month.</EmptyNote>
            ) : <CategoryPie data={chartData} />}
        </ScreenCard>
    );
}
