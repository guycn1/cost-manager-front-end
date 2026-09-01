/*
 * ReportTable.jsx
 *
 * The monthly report rendered as a table of cost items plus a converted
 * total. Each item keeps its own original currency; only the total is
 * converted, and that conversion happens inside db.js.
 */

// React and the MUI table primitives.
import React from 'react';
import {
    Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Typography
} from '@mui/material';

// The column headings, in table order.
const headings = ['Day', 'Category', 'Description', 'Sum', 'Currency'];

// Section: the cost table for one month plus its converted total.
export default function ReportTable(props) {
    // "report" is the object returned by db.js getReport.
    const { report } = props;
    return (
        <>
            {/* The list of cost items for the month. */}
            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    {/* Heading row, one cell per column. */}
                    <TableHead>
                        <TableRow>
                            {headings.map(head => (
                                <TableCell key={head}>{head}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    {/* One body row per cost item. */}
                    <TableBody>
                        {report.costs.map((item, index) => (
                            <TableRow key={index}>
                                {/* Day, category and description. */}
                                <TableCell>{item.date.day}</TableCell>
                                <TableCell>{item.category}</TableCell>
                                <TableCell>{item.description}</TableCell>
                                {/* Then the amount and its own currency. */}
                                <TableCell>{item.sum}</TableCell>
                                <TableCell>{item.currency}</TableCell>
                            </TableRow>
                        ))}
                    {/* End of the per item rows. */}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* The month total, converted to the chosen currency. */}
            <Typography variant="h6" sx={{ mt: 2 }}>
                Total: {report.total.sum} {report.total.currency}
            </Typography>
        </>
    );
}
