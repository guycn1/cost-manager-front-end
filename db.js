/*
 * db.js - vanilla version
 *
 * This library wraps the browser local storage so it can be used as a
 * small database for the cost manager application. Loading this file
 * with a plain <script> tag adds a "db" property to the global object.
 *
 * Public API:
 *   db.openCostsDB(databaseName, databaseVersion) -> database object
 *   database.addCost({ sum, currency, category, description }) -> cost
 *   database.getReport(currency, year, month) -> report object
 *
 * Every cost item is stored together with its original currency. The
 * report converts the total into the currency the caller asked for.
 */

(function (globalObject) {
    'use strict';

    // The four currencies the application supports. These strings are
    // also the currency symbols used everywhere else in the code.
    const supportedCurrencies = ['USD', 'ILS', 'GBP', 'EURO'];

    // Exchange rates expressed against USD, which is always 1. A value
    // of 3.4 for ILS means that 3.4 ILS are equivalent to 1 USD. These
    // defaults let getReport work before real rates arrive from a server.
    let exchangeRates = { USD: 1, ILS: 3.4, GBP: 0.6, EURO: 0.7 };

    // Build the local storage key that holds the list of cost items
    // for a given database name and version.
    function buildStorageKey(databaseName, databaseVersion) {
        return 'costsdb:' + databaseName + ':v' + databaseVersion;
    }

    // Read the stored cost array, tolerating a missing or broken value.
    function readCosts(storageKey) {
        const rawValue = globalObject.localStorage.getItem(storageKey);
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
        globalObject.localStorage.setItem(storageKey, JSON.stringify(costs));
    }

    // Convert an amount between two supported currencies. Every value
    // is routed through USD, which is the shared base of the rates.
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

    // Round a money value to two decimal places without float noise.
    function roundMoney(value) {
        return Math.round((value + Number.EPSILON) * 100) / 100;
    }

    // Validate the object passed to addCost and return a clean copy.
    function normaliseCostInput(cost) {
        // The argument has to be a real object.
        if (!cost || typeof cost !== 'object') {
            throw new Error('addCost expects a cost object');
        }
        // The sum has to be a finite positive number.
        const sum = Number(cost.sum);
        if (!Number.isFinite(sum) || sum <= 0) {
            throw new Error('the sum of a cost item must be a positive number');
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

    // Create the object that represents one open database. Each call
    // to openCostsDB returns a fresh wrapper over the same storage key.
    function createDatabase(databaseName, databaseVersion) {
        const storageKey = buildStorageKey(databaseName, databaseVersion);

        // Add a new cost item. The date attached to the item is the
        // moment it was added, split into year, month and day.
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

        // Build a detailed report for one month and year in the chosen
        // currency. A missing year or month means the current one.
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

        // Replace the exchange rates that getReport uses for its total.
        function setExchangeRates(rates) {
            if (rates && typeof rates === 'object') {
                exchangeRates = Object.assign({ USD: 1 }, rates);
            }
        }

        // The public surface of one open database.
        return {
            databaseName, databaseVersion,
            addCost, getReport, setExchangeRates
        };
    }

    // The single entry point of the library.
    function openCostsDB(databaseName, databaseVersion) {
        // A database name is required.
        if (!databaseName) {
            throw new Error('openCostsDB requires a database name');
        }
        // The version defaults to 1 when it is left out.
        const hasVersion = databaseVersion !== undefined;
        const version = hasVersion ? Number(databaseVersion) : 1;
        return createDatabase(String(databaseName), version);
    }

    // Expose the library on the global object, as the spec requires.
    // This is a property assignment on the global object, so every
    // binding in this file stays a const or a let.
    globalObject.db = {
        openCostsDB,
        // Let a test page override the rates before calling getReport.
        setExchangeRates(rates) {
            if (rates && typeof rates === 'object') {
                exchangeRates = Object.assign({ USD: 1 }, rates);
            }
        }
    };

// The argument below is the global object in a browser (window).
})(typeof window !== 'undefined' ? window : this);
