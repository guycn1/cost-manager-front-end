// db.js - module version
//
// Same behaviour as the vanilla db.js at the project root, but exported
// as an ES module so it can be imported by the React application.
//
//   import { openCostsDB } from './db.js';
//   const database = openCostsDB('costsdb', 1);
//   database.addCost({ sum, currency, category, description });
//   const report = database.getReport('USD', 2025, 9);
//
// Cost items always keep their original currency in local storage. The
// report converts totals into the currency requested by the caller.

// The currencies the application supports. These strings double as the
// currency symbols used across the code base.
export const SUPPORTED_CURRENCIES = ['USD', 'ILS', 'GBP', 'EURO'];

// Exchange rates against USD (USD is always 1). "ILS: 3.4" means that
// 3.4 ILS are equivalent to 1 USD. Replaced at runtime with real rates.
let exchangeRates = { USD: 1, ILS: 3.4, GBP: 0.6, EURO: 0.7 };

// Update the rates table shared by every open database.
export function setExchangeRates(rates) {
    if (rates && typeof rates === 'object') {
        exchangeRates = Object.assign({ USD: 1 }, rates);
    }
}

// Return a copy of the rates currently in use.
export function getExchangeRates() {
    return Object.assign({}, exchangeRates);
}

// Compose the local storage key for a given database name and version.
function buildStorageKey(databaseName, databaseVersion) {
    return 'costsdb:' + databaseName + ':v' + databaseVersion;
}

// Read the stored cost array, tolerating a missing or broken entry.
function readCosts(storageKey) {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) {
        return [];
    }
    try {
        const parsedValue = JSON.parse(rawValue);
        return Array.isArray(parsedValue) ? parsedValue : [];
    } catch (parseError) {
        return [];
    }
}

// Write the cost array back to local storage.
function writeCosts(storageKey, costs) {
    window.localStorage.setItem(storageKey, JSON.stringify(costs));
}

// Convert an amount between two supported currencies through USD.
function convert(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
        return amount;
    }
    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];
    if (typeof fromRate !== 'number' || typeof toRate !== 'number') {
        return amount;
    }
    const amountInUsd = amount / fromRate;
    return amountInUsd * toRate;
}

// Round a money value to two decimals without floating point noise.
function roundMoney(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

// Validate and normalise the object handed to addCost.
function normaliseCostInput(cost) {
    if (!cost || typeof cost !== 'object') {
        throw new Error('addCost expects a cost object');
    }
    const sum = Number(cost.sum);
    if (!isFinite(sum)) {
        throw new Error('the sum of a cost item must be a number');
    }
    const currency = String(cost.currency || '').toUpperCase();
    if (SUPPORTED_CURRENCIES.indexOf(currency) === -1) {
        throw new Error('unsupported currency: ' + cost.currency);
    }
    const category = String(cost.category || '').trim();
    const description = String(cost.description || '').trim();
    return { sum, currency, category, description };
}

// Build the wrapper object that represents one open database.
function createDatabase(databaseName, databaseVersion) {
    const storageKey = buildStorageKey(databaseName, databaseVersion);

    // Add a cost item, stamping it with the current date.
    function addCost(cost) {
        const clean = normaliseCostInput(cost);
        const now = new Date();
        const record = {
            sum: clean.sum,
            currency: clean.currency,
            category: clean.category,
            description: clean.description,
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate()
        };
        const costs = readCosts(storageKey);
        costs.push(record);
        writeCosts(storageKey, costs);
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
        const targetYear = (year === undefined || year === null)
            ? now.getFullYear()
            : Number(year);
        const targetMonth = (month === undefined || month === null)
            ? now.getMonth() + 1
            : Number(month);

        const costs = readCosts(storageKey);
        const reportCosts = [];
        let runningTotal = 0;

        // Keep only the items inside the chosen month and year.
        for (let index = 0; index < costs.length; index += 1) {
            const item = costs[index];
            if (item.year !== targetYear || item.month !== targetMonth) {
                continue;
            }
            reportCosts.push({
                sum: item.sum,
                currency: item.currency,
                category: item.category,
                description: item.description,
                date: { day: item.day }
            });
            runningTotal += convert(item.sum, item.currency, targetCurrency);
        }

        return {
            year: targetYear,
            month: targetMonth,
            costs: reportCosts,
            total: { currency: targetCurrency, sum: roundMoney(runningTotal) }
        };
    }

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
    if (!databaseName) {
        throw new Error('openCostsDB requires a database name');
    }
    const version = (databaseVersion === undefined) ? 1 : Number(databaseVersion);
    return createDatabase(String(databaseName), version);
}

// Default export mirrors the shape of the global "db" object.
export default { openCostsDB, setExchangeRates, getExchangeRates, SUPPORTED_CURRENCIES };
