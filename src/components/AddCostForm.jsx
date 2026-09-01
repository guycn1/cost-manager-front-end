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
    Autocomplete, Box, Button, MenuItem, Stack, TextField, Typography
} from '@mui/material';

// The shared screen frame plus the currency and category lists.
import ScreenCard from './ScreenCard.jsx';
import { supportedCurrencies } from '../db.js';
import { defaultCategories } from '../constants.js';

// The blank state of the form fields.
const emptyForm = { sum: '', currency: 'USD', category: '', description: '' };

// One <MenuItem> per supported currency (USD, ILS, GBP, EURO).
function renderCurrencyItems() {
    return supportedCurrencies.map(function (currency) {
        return <MenuItem key={currency} value={currency}>{currency}</MenuItem>;
    });
}

// The text field the category autocomplete renders.
function renderCategoryInput(params) {
    return <TextField {...params} label="Category" required />;
}

// Screen: capture a new cost item and pass it to db.js.
export default function AddCostForm(props) {
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

    // Read the form, validate it and hand a clean cost to db.js.
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

    // Change handlers, one per field. The autocomplete passes the new
    // text as a second argument; the plain fields use event.target.
    function onSum(event) {
        updateField('sum', event.target.value);
    }
    function onCurrency(event) {
        updateField('currency', event.target.value);
    }
    // Category comes from the autocomplete's input value.
    function onCategory(event, value) {
        updateField('category', value);
    }
    function onDescription(event) {
        updateField('description', event.target.value);
    }

    // The four fields stacked above the submit button.
    return (
        <ScreenCard title="Add a new cost item">
            <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    {/* Sum, as a positive number. */}
                    <TextField
                        label="Sum" type="number" required
                        value={form.sum} onChange={onSum}
                        inputProps={{ min: 0, step: '0.01' }}
                    />

                    {/* Currency, one of the four supported ones. */}
                    <TextField
                        select label="Currency" required
                        value={form.currency} onChange={onCurrency}
                    >
                        {renderCurrencyItems()}
                    </TextField>

                    {/* Category: pick from the list or type a new one. */}
                    <Autocomplete
                        freeSolo
                        options={defaultCategories}
                        inputValue={form.category}
                        onInputChange={onCategory}
                        renderInput={renderCategoryInput}
                    />

                    {/* Free text description. */}
                    <TextField
                        label="Description"
                        multiline
                        minRows={2}
                        value={form.description}
                        onChange={onDescription}
                    />

                    {/* Validation message, shown only when set. */}
                    {errorText ? (
                        <Typography color="error">{errorText}</Typography>
                    ) : undefined}

                    {/* Submit button. */}
                    <Button type="submit" variant="contained" size="large">
                        Add cost
                    </Button>
                </Stack>
            </Box>
        </ScreenCard>
    );
}
