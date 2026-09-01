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

// Static { value, label } option lists, one per dropdown.
const monthItems = monthNames.map(function (name, index) {
    return { value: index + 1, label: name };
});
const yearItems = buildYearOptions().map(function (year) {
    return { value: year, label: String(year) };
});
const currencyItems = supportedCurrencies.map(function (code) {
    return { value: code, label: code };
});

// Render one <MenuItem> for each { value, label } entry.
function renderMenuItems(items) {
    return items.map(function (item) {
        return (
            <MenuItem key={item.value} value={item.value}>
                {item.label}
            </MenuItem>
        );
    });
}

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
                    select label="Month" value={month} sx={{ minWidth: 140 }}
                    onChange={function (event) {
                        onMonthChange(Number(event.target.value));
                    }}
                >
                    {renderMenuItems(monthItems)}
                </TextField>
            ) : undefined}

            {/* Year picker; the value is stored as a number. */}
            <TextField
                select label="Year" value={year} sx={{ minWidth: 120 }}
                onChange={function (event) {
                    onYearChange(Number(event.target.value));
                }}
            >
                {renderMenuItems(yearItems)}
            </TextField>

            {/* Currency picker; the value is the currency symbol. */}
            <TextField
                select label="Currency" value={currency} sx={{ minWidth: 120 }}
                onChange={function (event) {
                    onCurrencyChange(event.target.value);
                }}
            >
                {renderMenuItems(currencyItems)}
            </TextField>
        </Stack>
    );
}

export default ReportFilters;
