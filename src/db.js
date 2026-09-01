/*
 * db.js - module version
 *
 * Same behaviour as the vanilla db.js at the project root, but exported
 * as an ES module so it can be imported by the React application.
 *
 *   import { openCostsDB } from './db.js';
 *   const database = openCostsDB('costsdb', 1);
 *   database.addCost({ sum, currency, category, description });
 *   const report = database.getReport('USD', 2025, 9);
 *
 * Cost items always keep their original currency in local storage. The
 * report converts the total into the currency requested by the caller.
 */

// The four currencies the application supports. These strings double
// as the currency symbols used across the code base.
export const supportedCurrencies = ['USD', 'ILS', 'GBP', 'EURO'];

// Exchange rates against USD, which is always 1. A value of 3.4 for
// ILS means that 3.4 ILS are equivalent to 1 USD. The defaults are
// replaced at runtime once real rates arrive from a server.
let exchangeRates = { USD: 1, ILS: 3.4, GBP: 0.6, EURO: 0.7 };

// Replace the rates table shared by every open database.
export function setExchangeRates(rates) {
    if (rates && typeof rates === 'object') {
        exchangeRates = Object.assign({ USD: 1 }, rates);
    }
}

// Return a copy of the rates currently in use.
export function getExchangeRates() {
    return Object.assign({}, exchangeRates);
}

// Compose the local storage key for a database name and version.
function buildStorageKey(databaseName, databaseVersion) {
    return 'costsdb:' + databaseName + ':v' + databaseVersion;
}

// Read the stored cost array, tolerating a missing or broken value.
function readCosts(storageKey) {
    const rawValue = window.localStorage.getItem(storageKey);
    // Nothing stored yet means an empty list of costs.
    if (!rawValue) {
        return [];
    }
    // A corrupted entry should not break the whole application.
    try {
        const parsedValue = JSON.parse(rawValue);
        return Array.isArray(parsedValue) ? parsedValue : [];
    } catch (parseError) {
        return [];
    }
}

// Write the cost array back into local storage as JSON text.
function writeCosts(storageKey, costs) {
    window.localStorage.setItem(storageKey, JSON.stringify(costs));
}

// Convert an amount between two supported currencies through USD.
function convert(amount, fromCurrency, toCurrency) {
    // The same currency needs no conversion at all.
    if (fromCurrency === toCurrency) {
        return amount;
    }
    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];
    // An unknown currency falls back to the original amount.
    if (typeof fromRate !== 'number' || typeof toRate !== 'number') {
        return amount;
    }
    // First to USD, then from USD to the target currency.
    const amountInUsd = amount / fromRate;
    return amountInUsd * toRate;
}

// Round a money value to two decimals without floating point noise.
function roundMoney(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

// Validate the object handed to addCost and return a clean copy.
function normaliseCostInput(cost) {
    // The argument has to be a real object.
    if (!cost || typeof cost !== 'object') {
        throw new Error('addCost expects a cost object');
    }
    // The sum has to be a finite number.
    const sum = Number(cost.sum);
    if (!Number.isFinite(sum)) {
        throw new Error('the sum of a cost item must be a number');
    }
    // The currency has to be one of the supported ones.
    const currency = String(cost.currency || '').toUpperCase();
    if (supportedCurrencies.indexOf(currency) === -1) {
        throw new Error('unsupported currency: ' + cost.currency);
    }
    // Category and description are free text, so just trim them.
    const category = String(cost.category || '').trim();
    const description = String(cost.description || '').trim();
    return { sum, currency, category, description };
}

// Build the wrapper object that represents one open database.
function createDatabase(databaseName, databaseVersion) {
    const storageKey = buildStorageKey(databaseName, databaseVersion);

    // Add a cost item, stamping it with the current date parts.
    function addCost(cost) {
        const clean = normaliseCostInput(cost);
        const now = new Date();
        const record = {
            // The four values supplied by the caller.
            sum: clean.sum,
            currency: clean.currency,
            category: clean.category,
            description: clean.description,
            // The date the item was added, split into parts.
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate()
        };
        // Append the record and persist the whole list.
        const costs = readCosts(storageKey);
        costs.push(record);
        writeCosts(storageKey, costs);
        // Echo back exactly the four properties the spec asks for.
        return {
            sum: record.sum,
            currency: record.currency,
            category: record.category,
            description: record.description
        };
    }

    // Produce a detailed monthly report in the requested currency.
    function getReport(currency, year, month) {
        const now = new Date();
        const targetCurrency = String(currency || 'USD').toUpperCase();
        // Fall back to the current year when none was passed.
        const targetYear = (year === undefined || year === null)
            ? now.getFullYear()
            : Number(year);
        // Fall back to the current month when none was passed.
        const targetMonth = (month === undefined || month === null)
            ? now.getMonth() + 1
            : Number(month);

        // Walk every stored cost and keep the ones in this month.
        const costs = readCosts(storageKey);
        const reportCosts = [];
        let runningTotal = 0;
        for (let index = 0; index < costs.length; index += 1) {
            const item = costs[index];
            // Skip items that belong to a different month or year.
            if (item.year !== targetYear || item.month !== targetMonth) {
                continue;
            }
            // Each listed item keeps its own original currency.
            reportCosts.push({
                sum: item.sum,
                currency: item.currency,
                category: item.category,
                description: item.description,
                date: { day: item.day }
            });
            // The total is accumulated in the requested currency.
            runningTotal += convert(item.sum, item.currency, targetCurrency);
        }

        // The shape below matches the report described in the spec.
        return {
            year: targetYear,
            month: targetMonth,
            costs: reportCosts,
            total: { currency: targetCurrency, sum: roundMoney(runningTotal) }
        };
    }

    // The public surface of one open database.
    return {
        databaseName,
        databaseVersion,
        addCost,
        getReport,
        setExchangeRates
    };
}

// The single entry point of the library.
export function openCostsDB(databaseName, databaseVersion) {
    // A database name is required.
    if (!databaseName) {
        throw new Error('openCostsDB requires a database name');
    }
    // The version defaults to 1 when it is left out.
    const version = (databaseVersion === undefined) ? 1 : Number(databaseVersion);
    return createDatabase(String(databaseName), version);
}

// The default export mirrors the shape of the global "db" object.
export default { openCostsDB, setExchangeRates, getExchangeRates, supportedCurrencies };
