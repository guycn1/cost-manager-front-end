/*
 * EmptyNote.jsx
 *
 * The greyed out "nothing to show" line used by the report and the two
 * chart screens when the selected period holds no cost items.
 */

// React and the one MUI text component used here.
import React from 'react';
import { Typography } from '@mui/material';

export default function EmptyNote(props) {
    // The message text is passed in as children.
    return (
        <Typography color="text.secondary">
            {props.children}
        </Typography>
    );
}
