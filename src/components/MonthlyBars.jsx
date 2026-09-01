/*
 * MonthlyBars.jsx
 *
 * The bar chart itself, given the twelve { month, total } rows built by
 * the YearlyBarChart screen. One bar per month.
 */

// React and the recharts bar primitives.
import React from 'react';
import {
    Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

// Chart: the twelve monthly totals as a bar series.
export default function MonthlyBars(props) {
    // "rows" is one entry per month; "currency" labels the bar series.
    const { rows, currency } = props;
    return (
        <ResponsiveContainer width="100%" height={360}>
            <BarChart data={rows}>
                {/* Reference grid, the month axis and the value axis. */}
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                {/* Hover tooltip, then one bar per month. */}
                <Tooltip />
                <Bar dataKey="total" fill="#1976d2" name={'Total in ' + currency} />
            </BarChart>
        </ResponsiveContainer>
    );
}
