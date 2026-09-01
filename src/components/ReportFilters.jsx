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
// Month value is 1-12; year value is the number; currency value is the code.
const monthItems = monthNames.map(function (name, index) {
    return { value: index + 1, label: name };
});
const yearItems = buildYearOptions().map(function (year) {
    return { value: year, label: String(year) };
});
// The currency label and value are the same string.
const currencyItems = supportedCurrencies.map(function (code) {
    return { value: code, label: code };
});

// Render one <MenuItem> for each { value, label } entry.
function renderMenuItems(items) {
    return items.map(function (item) {
        return <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>;
    });
}

// A single labelled dropdown backed by one of the option lists.
function renderSelect(label, value, items, onChange, width) {
    // "select" turns the TextField into a native dropdown.
    const sx = { minWidth: width };
    return (
        <TextField select label={label} value={value} onChange={onChange} sx={sx}>
            {renderMenuItems(items)}
        </TextField>
    );
}

// Shared control: the month, year and currency selector row.
export default function ReportFilters(props) {
    // "showMonth" is false on the yearly bar chart, which has no month.
    const {
        showMonth, month, onMonthChange,
        year, onYearChange, currency, onCurrencyChange
    } = props;

    // Month and year come back as numbers.
    function onMonth(event) {
        onMonthChange(Number(event.target.value));
    }
    function onYear(event) {
        onYearChange(Number(event.target.value));
    }
    // The currency stays a string.
    function onCurrency(event) {
        onCurrencyChange(event.target.value);
    }

    // The month picker is optional; the other two always show.
    return (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
            {/* Month, only when the parent asks for it. */}
            {showMonth
                ? renderSelect('Month', month, monthItems, onMonth, 140)
                : undefined}
            {/* Year and currency, always shown. */}
            {renderSelect('Year', year, yearItems, onYear, 120)}
            {renderSelect('Currency', currency, currencyItems, onCurrency, 120)}
        </Stack>
    );
}
