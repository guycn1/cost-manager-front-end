// exchangeRates.js
//
// Retrieves the currency exchange rates from a server using the Fetch API
// and feeds them into the db.js library.
//
// The primary source is a static JSON document hosted separately from the
// application, on GitHub Pages. The application always fetches its rates
// over the network, including when the user has not entered a custom URL
// in the settings screen. A copy of the JSON is bundled with the built
// site and used only as a last resort if the network request fails.

import { setExchangeRates, SUPPORTED_CURRENCIES } from '../db.js';

// Local storage key that holds the user supplied rates URL.
const RATES_URL_STORAGE_KEY = 'costsdb:ratesUrl';

// The remote server that provides the rates. This is a static JSON file
// deployed on GitHub Pages; it answers with "Access-Control-Allow-Origin: *"
// so it can be read from any origin.
export const REMOTE_RATES_URL =
    'https://guycn1.github.io/cost-manager-front-end/exchange-rates.json';

// Offline safety net: the same JSON, bundled with the built application.
export const BUNDLED_RATES_URL = new URL('exchange-rates.json', document.baseURI).href;

// The source used when the user has not configured anything.
export const DEFAULT_RATES_URL = REMOTE_RATES_URL;

// Read the URL the user configured, or fall back to the remote default.
export function getRatesUrl() {
    const storedUrl = window.localStorage.getItem(RATES_URL_STORAGE_KEY);
    return storedUrl && storedUrl.trim() ? storedUrl.trim() : DEFAULT_RATES_URL;
}

// Persist (or clear) the user supplied rates URL.
export function setRatesUrl(url) {
    if (url && url.trim()) {
        window.localStorage.setItem(RATES_URL_STORAGE_KEY, url.trim());
    } else {
        window.localStorage.removeItem(RATES_URL_STORAGE_KEY);
    }
}

// Make sure the object returned by the server holds a numeric rate for
// every currency the application supports.
function isValidRatesObject(rates) {
    if (!rates || typeof rates !== 'object') {
        return false;
    }
    return SUPPORTED_CURRENCIES.every(function (currency) {
        return typeof rates[currency] === 'number' && isFinite(rates[currency]);
    });
}

// Fetch a rates JSON from a single URL and validate its shape.
async function fetchRatesFrom(url) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error('the rates server answered with status ' + response.status);
    }
    const rates = await response.json();
    if (!isValidRatesObject(rates)) {
        throw new Error('the rates JSON is missing one of the supported currencies');
    }
    return rates;
}

// Load the rates and push them into db.js.
//
// When an explicit URL is given (the user saved one in the settings) it
// is used as is and any failure is reported to the caller. Otherwise the
// remote server is tried first and the bundled copy is the fallback.
export async function loadExchangeRates(url) {
    const explicitUrl = url && url.trim() ? url.trim() : null;

    if (explicitUrl) {
        const rates = await fetchRatesFrom(explicitUrl);
        setExchangeRates(rates);
        return { rates: rates, source: explicitUrl };
    }

    // No user URL: fetch from the remote server, then the bundled file.
    try {
        const rates = await fetchRatesFrom(REMOTE_RATES_URL);
        setExchangeRates(rates);
        return { rates: rates, source: REMOTE_RATES_URL };
    } catch (remoteError) {
        const rates = await fetchRatesFrom(BUNDLED_RATES_URL);
        setExchangeRates(rates);
        return { rates: rates, source: BUNDLED_RATES_URL, remoteError: remoteError };
    }
}
