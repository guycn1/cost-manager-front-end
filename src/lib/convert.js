/*
 * convert.js
 *
 * Small helper for converting cost sums between currencies on the
 * client side. It reads the same rates table that db.js uses, so the
 * charts and the reports stay consistent with one another.
 */

import { getExchangeRates } from '../db.js';

// Convert an amount from one supported currency into another. Every
// value is routed through USD, the shared base of the rates table.
export function convertAmount(amount, fromCurrency, toCurrency) {
    // The same currency needs no conversion at all.
    if (fromCurrency === toCurrency) {
        return amount;
    }
    const rates = getExchangeRates();
    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];
    // An unknown currency falls back to the original amount.
    if (typeof fromRate !== 'number' || typeof toRate !== 'number') {
        return amount;
    }
    // First to USD, then from USD to the target currency.
    const amountInUsd = amount / fromRate;
    return amountInUsd * toRate;
}

// Round a money value to two decimals without floating point noise.
export function roundMoney(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}
