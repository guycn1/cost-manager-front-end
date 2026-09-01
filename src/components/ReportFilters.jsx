/*
 * ReportFilters.jsx
 *
 * The row of selectors shared by the monthly report and the two chart
 * screens: an optional month picker, a year picker and a currency
 * picker. The parent owns the state and passes the change handlers in.
 */

// React and the two MUI form primitives used here.
import React from 'react';
import { MenuItem, Stack, TextField } from '@mui/material';

// The supported currencies and the month labels.
import { supportedCurrencies } from '../db.js';
import { monthNames, buildYearOptions } from '../constants.js';

// The selectable years are the same for every screen.
const yearOptions = buildYearOptions();

function ReportFilters(props) {
    // "showMonth" is false on the yearly bar chart, which has no month.
    const {
        showMonth, month, onMonthChange,
        year, onYearChange, currency, onCurrencyChange
    } = props;

    return (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
            {/* Month picker, only when the parent asks for it. */}
            {showMonth ? (
                <TextField
                    select
                    label="Month"
                    value={month}
                    onChange={function (event) {
                        onMonthChange(Number(event.target.value));
                    }}
                    sx={{ minWidth: 140 }}
                >
                    {/* Label is the month name, value is the number 1-12. */}
                    {monthNames.map(function (name, index) {
                        return (
                            <MenuItem key={name} value={index + 1}>{name}</MenuItem>
                        );
                    })}
                </TextField>
            ) : undefined}

            {/* Year picker, one option per selectable year. */}
            <TextField
                select
                label="Year"
                value={year}
                onChange={function (event) {
                    onYearChange(Number(event.target.value));
                }}
                sx={{ minWidth: 120 }}
            >
                {/* One entry per year in the range. */}
                {yearOptions.map(function (option) {
                    return (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                    );
                })}
            </TextField>

            {/* Currency picker, one option per supported currency. */}
            <TextField
                select
                label="Currency"
                value={currency}
                onChange={function (event) {
                    onCurrencyChange(event.target.value);
                }}
                sx={{ minWidth: 120 }}
            >
                {/* One entry per supported currency. */}
                {supportedCurrencies.map(function (option) {
                    return (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                    );
                })}
            </TextField>
        </Stack>
    );
}

export default ReportFilters;
