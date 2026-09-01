/*
 * rates.js
 *
 * Retrieves the currency exchange rates from a server with the Fetch
 * API and feeds them into the db.js library.
 *
 * The primary source is a static JSON document hosted separately from
 * the application, on GitHub Pages. The application always fetches its
 * rates over the network, including when the user has not entered a
 * custom URL in the settings screen. A copy of the JSON is bundled
 * with the built site and used only if the network request fails.
 */

import { setExchangeRates, supportedCurrencies } from '../db.js';

// Local storage key that holds the URL the user configured.
const ratesUrlStorageKey = 'costsdb:ratesUrl';

// The remote server that provides the rates. This static JSON file is
// deployed on GitHub Pages, which answers with the header
// "Access-Control-Allow-Origin: *", so it can be read from any origin.
export const remoteRatesUrl =
    'https://guycn1.github.io/cost-manager-front-end/exchange-rates.json';

// Offline safety net: the same JSON, bundled with the built site.
export const bundledRatesUrl = new URL('exchange-rates.json', document.baseURI).href;

// The source used when the user has not configured anything.
export const defaultRatesUrl = remoteRatesUrl;

// Read the URL the user configured, or an empty string when there is none.
export function readStoredRatesUrl() {
    return window.localStorage.getItem(ratesUrlStorageKey) || '';
}

// Persist the user supplied URL, or clear it when the field is empty.
export function setRatesUrl(url) {
    if (url && url.trim()) {
        window.localStorage.setItem(ratesUrlStorageKey, url.trim());
    } else {
        window.localStorage.removeItem(ratesUrlStorageKey);
    }
}

// Check that the object from the server holds a numeric rate for
// every currency the application supports.
function isValidRatesObject(rates) {
    if (!rates || typeof rates !== 'object') {
        return false;
    }
    // Number.isFinite is false for missing keys and non numbers alike.
    return supportedCurrencies.every(currency => Number.isFinite(rates[currency]));
}

// Fetch a rates JSON from a single URL and validate its shape.
async function fetchRatesFrom(url) {
    const response = await fetch(url, { cache: 'no-store' });
    // A non success status is treated as a failure.
    if (!response.ok) {
        throw new Error('the rates server answered with status ' + response.status);
    }
    // The body has to be a JSON object with all the currencies.
    const rates = await response.json();
    if (!isValidRatesObject(rates)) {
        throw new Error('the rates JSON is missing one of the supported currencies');
    }
    return rates;
}

// Load the rates and push them into db.js. When an explicit URL is
// given (the user saved one in the settings) it is used on its own and
// any failure is reported to the caller. Otherwise the remote server is
// tried first and the bundled copy is the fallback. The return value
// names the source that was actually used.
export async function loadExchangeRates(url) {
    const explicitUrl = url && url.trim() ? url.trim() : null;

    // A user supplied URL is used on its own, with no fallback.
    if (explicitUrl) {
        const rates = await fetchRatesFrom(explicitUrl);
        setExchangeRates(rates);
        return { rates: rates, source: explicitUrl };
    }

    // No user URL: try the remote server first.
    try {
        const rates = await fetchRatesFrom(remoteRatesUrl);
        setExchangeRates(rates);
        return { rates: rates, source: remoteRatesUrl };
    } catch (remoteError) {
        // The remote server failed, so fall back to the bundled copy.
        const rates = await fetchRatesFrom(bundledRatesUrl);
        setExchangeRates(rates);
        return { rates: rates, source: bundledRatesUrl, remoteError: remoteError };
    }
}
