/*
 * AddCostForm.jsx
 *
 * Screen that lets the user add a new cost item: a sum, a currency, a
 * category and a short description. The date is stamped automatically
 * by db.js when the item is stored.
 */

// React and the MUI form primitives.
import React, { useState } from 'react';
import {
    Autocomplete, Box, Button, Card, CardContent, MenuItem,
    Stack, TextField, Typography
} from '@mui/material';

// The supported currency list and the suggested categories.
import { supportedCurrencies } from '../db.js';
import { defaultCategories } from '../constants.js';

// The blank state of the form fields.
const emptyForm = { sum: '', currency: 'USD', category: '', description: '' };

function AddCostForm(props) {
    const { database, onCostAdded } = props;

    // One state object for the fields and one for the error message.
    const [form, setForm] = useState(emptyForm);
    const [errorText, setErrorText] = useState('');

    // Update a single field of the form by name.
    function updateField(fieldName, value) {
        setForm(function (previous) {
            return Object.assign({}, previous, { [fieldName]: value });
        });
    }

    // Validate the input and hand it over to db.js.
    function handleSubmit(event) {
        event.preventDefault();
        setErrorText('');

        // The sum has to be a positive number.
        const sumValue = Number(form.sum);
        if (!Number.isFinite(sumValue) || sumValue <= 0) {
            setErrorText('Please enter a positive number for the sum.');
            return;
        }
        // A category is required.
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
            // Surface any validation error thrown by db.js.
            setErrorText(addError.message);
            return;
        }

        // Clear the form and let the parent refresh the other screens.
        setForm(emptyForm);
        onCostAdded('Cost item added.');
    }

    // A card holding the four fields and the submit button.
    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Add a new cost item
                </Typography>

                {/* Native form submit is intercepted by handleSubmit. */}
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        {/* Sum, as a positive number. */}
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

                        {/* Currency, one of the four supported ones. */}
                        <TextField
                            select
                            label="Currency"
                            required
                            value={form.currency}
                            onChange={function (event) {
                                updateField('currency', event.target.value);
                            }}
                        >
                            {/* One menu entry per supported currency. */}
                            {supportedCurrencies.map(function (currency) {
                                return (
                                    <MenuItem key={currency} value={currency}>
                                        {currency}
                                    </MenuItem>
                                );
                            })}
                        </TextField>

                        {/* Category: pick from the list or type a new one. */}
                        <Autocomplete
                            freeSolo
                            options={defaultCategories}
                            inputValue={form.category}
                            onInputChange={function (event, value) {
                                updateField('category', value);
                            }}
                            renderInput={function (params) {
                                // The autocomplete supplies the field props.
                                return (
                                    <TextField {...params} label="Category" required />
                                );
                            }}
                        />

                        {/* Free text description. */}
                        <TextField
                            label="Description"
                            multiline
                            minRows={2}
                            value={form.description}
                            onChange={function (event) {
                                updateField('description', event.target.value);
                            }}
                        />

                        {/* Validation message, shown only when set. */}
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
