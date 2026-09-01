/*
 * ScreenCard.jsx
 *
 * The outer frame every screen shares: a Card with a heading and then
 * whatever the screen puts inside it. Keeping it here stops the same
 * Card / CardContent / heading markup being repeated five times.
 */

// React and the three MUI wrappers used by the frame.
import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

export default function ScreenCard(props) {
    // "title" is the heading text; "children" is the screen body.
    const { title, children } = props;
    return (
        <Card>
            <CardContent>
                {/* Heading, then the body supplied by the screen. */}
                <Typography variant="h5" gutterBottom>
                    {title}
                </Typography>
                {children}
            </CardContent>
        </Card>
    );
}
