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

// The <MenuItem> list for each dropdown, built once at module load.
// The month value is the number 1-12.
const monthMenu = monthNames.map((name, index) => (
    <MenuItem key={name} value={index + 1}>{name}</MenuItem>
));
// The year value is the number; the currency value is the code.
const yearMenu = buildYearOptions().map(year => (
    <MenuItem key={year} value={year}>{year}</MenuItem>
));
const currencyMenu = supportedCurrencies.map(code => (
    <MenuItem key={code} value={code}>{code}</MenuItem>
));

// Shared control: the month, year and currency selector row.
export default function ReportFilters(props) {
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
                    select label="Month" value={month} sx={{ minWidth: 140 }}
                    onChange={event => onMonthChange(Number(event.target.value))}
                >
                    {monthMenu}
                </TextField>
            ) : undefined}

            {/* Year picker; the value comes back as a number. */}
            <TextField
                select label="Year" value={year} sx={{ minWidth: 120 }}
                onChange={event => onYearChange(Number(event.target.value))}
            >
                {yearMenu}
            </TextField>

            {/* Currency picker; the value stays a string. */}
            <TextField
                select label="Currency" value={currency} sx={{ minWidth: 120 }}
                onChange={event => onCurrencyChange(event.target.value)}
            >
                {currencyMenu}
            </TextField>
        </Stack>
    );
}
