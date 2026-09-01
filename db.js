// db.js - vanilla version
//
// This library wraps the browser local storage so it can be used as a
// small database for the cost manager application. Loading this file with
// a plain <script> tag adds a "db" property to the global object.
//
// Public API:
//   db.openCostsDB(databaseName, databaseVersion) -> database object
//   <database>.addCost({ sum, currency, category, description }) -> cost object
//   <database>.getReport(currency, year, month) -> report object
//
// A cost item is always stored together with its original currency. The
// report converts the totals into the currency the caller asked for.

(function (globalObject) {
    'use strict';

    // The currencies the application knows about. These strings are also
    // the symbols the code uses everywhere else.
    const SUPPORTED_CURRENCIES = ['USD', 'ILS', 'GBP', 'EURO'];

    // Fallback exchange rates, expressed against USD (USD is always 1).
    // A value of 3.4 for ILS means "3.4 ILS are equivalent to 1 USD".
    // These are replaced at runtime once real rates are fetched from a
    // server, but they keep getReport working on its own.
    let exchangeRates = { USD: 1, ILS: 3.4, GBP: 0.6, EURO: 0.7 };

    // Build the local storage key that holds the cost list for a database.
    function buildStorageKey(databaseName, databaseVersion) {
        return 'costsdb:' + databaseName + ':v' + databaseVersion;
    }

    // Read the raw cost array for a database out of local storage.
    function readCosts(storageKey) {
        const rawValue = globalObject.localStorage.getItem(storageKey);
        if (!rawValue) {
            return [];
        }
        // A corrupted entry should not crash the whole application.
        try {
            const parsedValue = JSON.parse(rawValue);
            return Array.isArray(parsedValue) ? parsedValue : [];
        } catch (parseError) {
            return [];
        }
    }

    // Persist the cost array for a database back into local storage.
    function writeCosts(storageKey, costs) {
        globalObject.localStorage.setItem(storageKey, JSON.stringify(costs));
    }

    // Convert an amount from one supported currency into another using the
    // rates table. Everything is routed through USD as the common base.
    function convert(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) {
            return amount;
        }
        const fromRate = exchangeRates[fromCurrency];
        const toRate = exchangeRates[toCurrency];
        if (typeof fromRate !== 'number' || typeof toRate !== 'number') {
            // Unknown currency: fall back to the original amount.
            return amount;
        }
        const amountInUsd = amount / fromRate;
        return amountInUsd * toRate;
    }

    // Round a money value to two decimal places without float noise.
    function roundMoney(value) {
        return Math.round((value + Number.EPSILON) * 100) / 100;
    }

    // Validate the object passed to addCost and normalise its fields.
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
        // Category and description are free text, so only trim them.
        const category = String(cost.category || '').trim();
        const description = String(cost.description || '').trim();
        return { sum: sum, currency: currency, category: category, description: description };
    }

    // Create the object that represents one open database. Every call to
    // openCostsDB returns a fresh wrapper bound to the same storage key.
    function createDatabase(databaseName, databaseVersion) {
        const storageKey = buildStorageKey(databaseName, databaseVersion);

        // Add a new cost item. The date attached to the item is the moment
        // it was added. The returned object echoes the stored values.
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
            // The spec asks for exactly these four properties back.
            return {
                sum: record.sum,
                currency: record.currency,
                category: record.category,
                description: record.description
            };
        }

        // Build a detailed report for a single month and year in the
        // requested currency. Missing year/month default to the current
        // month and year.
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

            // Keep only the items that fall inside the chosen month.
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

        // Replace the currency exchange rates used by getReport.
        function setExchangeRates(rates) {
            if (rates && typeof rates === 'object') {
                exchangeRates = Object.assign({ USD: 1 }, rates);
            }
        }

        return {
            databaseName: databaseName,
            databaseVersion: databaseVersion,
            addCost: addCost,
            getReport: getReport,
            setExchangeRates: setExchangeRates
        };
    }

    // The single entry point of the library.
    function openCostsDB(databaseName, databaseVersion) {
        if (!databaseName) {
            throw new Error('openCostsDB requires a database name');
        }
        const version = (databaseVersion === undefined) ? 1 : Number(databaseVersion);
        return createDatabase(String(databaseName), version);
    }

    // Expose the library on the global object as required.
    globalObject.db = {
        openCostsDB: openCostsDB,
        SUPPORTED_CURRENCIES: SUPPORTED_CURRENCIES.slice(),
        setExchangeRates: function (rates) {
            if (rates && typeof rates === 'object') {
                exchangeRates = Object.assign({ USD: 1 }, rates);
            }
        }
    };
})(typeof window !== 'undefined' ? window : this);
