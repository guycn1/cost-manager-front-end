// convert.js
//
// Small helper for converting cost sums between currencies on the client
// side. It relies on the same rates table that db.js uses, so charts and
// reports stay consistent.

import { getExchangeRates } from '../db.js';

// Convert an amount from one supported currency into another through USD.
export function convertAmount(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
        return amount;
    }
    const rates = getExchangeRates();
    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];
    if (typeof fromRate !== 'number' || typeof toRate !== 'number') {
        return amount;
    }
    // USD is the shared base for every conversion.
    const amountInUsd = amount / fromRate;
    return amountInUsd * toRate;
}

// Round a money value to two decimals without floating point noise.
export function roundMoney(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}
