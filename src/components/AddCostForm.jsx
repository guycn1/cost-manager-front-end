// AddCostForm.jsx
//
// Screen that lets the user add a new cost item. The user picks a sum,
// a currency, a category and a short description. The date is added
// automatically by db.js when the item is stored.

import React, { useState } from 'react';
import {
    Autocomplete, Box, Button, Card, CardContent, MenuItem,
    Stack, TextField, Typography
} from '@mui/material';

import { SUPPORTED_CURRENCIES } from '../db.js';
import { DEFAULT_CATEGORIES } from '../constants.js';

// The empty state of the form fields.
const EMPTY_FORM = { sum: '', currency: 'USD', category: '', description: '' };

function AddCostForm(props) {
    const { database, onCostAdded } = props;

    const [form, setForm] = useState(EMPTY_FORM);
    const [errorText, setErrorText] = useState('');

    // Update a single field of the form.
    function updateField(fieldName, value) {
        setForm(function (previous) {
            return Object.assign({}, previous, { [fieldName]: value });
        });
    }

    // Validate the input and hand it over to db.js.
    function handleSubmit(event) {
        event.preventDefault();
        setErrorText('');

        const sumValue = Number(form.sum);
        if (!isFinite(sumValue) || sumValue <= 0) {
            setErrorText('Please enter a positive number for the sum.');
            return;
        }
        if (!form.category.trim()) {
            setErrorText('Please choose or type a category.');
            return;
        }

        // db.js stamps the current date onto the stored item.
        try {
            database.addCost({
                sum: sumValue,
                currency: form.currency,
                category: form.category.trim(),
                description: form.description.trim()
            });
        } catch (addError) {
            setErrorText(addError.message);
            return;
        }

        setForm(EMPTY_FORM);
        onCostAdded('Cost item added.');
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Add a new cost item
                </Typography>

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            label="Sum"
                            type="number"
                            required
                            value={form.sum}
                            onChange={function (event) {
                                updateField('sum', event.target.value);
                            }}
                            inputProps={{ min: 0, step: '0.01' }}
                        />

                        <TextField
                            select
                            label="Currency"
                            required
                            value={form.currency}
                            onChange={function (event) {
                                updateField('currency', event.target.value);
                            }}
                        >
                            {SUPPORTED_CURRENCIES.map(function (currency) {
                                return (
                                    <MenuItem key={currency} value={currency}>
                                        {currency}
                                    </MenuItem>
                                );
                            })}
                        </TextField>

                        <Autocomplete
                            freeSolo
                            options={DEFAULT_CATEGORIES}
                            value={form.category}
                            onInputChange={function (event, value) {
                                updateField('category', value);
                            }}
                            renderInput={function (params) {
                                return (
                                    <TextField
                                        {...params}
                                        label="Category"
                                        required
                                    />
                                );
                            }}
                        />

                        <TextField
                            label="Description"
                            multiline
                            minRows={2}
                            value={form.description}
                            onChange={function (event) {
                                updateField('description', event.target.value);
                            }}
                        />

                        {errorText ? (
                            <Typography color="error">{errorText}</Typography>
                        ) : undefined}

                        <Button type="submit" variant="contained" size="large">
                            Add cost
                        </Button>
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
}

export default AddCostForm;
