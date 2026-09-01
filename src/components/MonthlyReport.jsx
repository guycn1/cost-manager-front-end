// MonthlyReport.jsx
//
// Screen that shows a detailed report for a chosen month and year in a
// currency the user selects. The report is produced by db.js.

import React, { useEffect, useState } from 'react';
import {
    Box, Card, CardContent, MenuItem, Paper, Stack, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, TextField, Typography
} from '@mui/material';

import { SUPPORTED_CURRENCIES } from '../db.js';
import { MONTH_NAMES, buildYearOptions } from '../constants.js';

const YEAR_OPTIONS = buildYearOptions();

function MonthlyReport(props) {
    const { database, dataVersion } = props;

    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [currency, setCurrency] = useState('USD');
    const [report, setReport] = useState(null);

    // Rebuild the report whenever a selection or the stored data changes.
    useEffect(function () {
        const result = database.getReport(currency, year, month);
        setReport(result);
    }, [database, currency, year, month, dataVersion]);

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Monthly report
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

                {report && report.costs.length === 0 ? (
                    <Typography color="text.secondary">
                        No cost items were recorded for this month.
                    </Typography>
                ) : undefined}

                {report && report.costs.length > 0 ? (
                    <Box>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Day</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell align="right">Sum</TableCell>
                                        <TableCell>Currency</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {report.costs.map(function (item, index) {
                                        return (
                                            <TableRow key={index}>
                                                <TableCell>{item.date.day}</TableCell>
                                                <TableCell>{item.category}</TableCell>
                                                <TableCell>{item.description}</TableCell>
                                                <TableCell align="right">
                                                    {item.sum}
                                                </TableCell>
                                                <TableCell>{item.currency}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Typography variant="h6" sx={{ mt: 2 }}>
                            Total: {report.total.sum} {report.total.currency}
                        </Typography>
                    </Box>
                ) : undefined}
            </CardContent>
        </Card>
    );
}

export default MonthlyReport;
