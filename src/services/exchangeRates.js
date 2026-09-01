// exchangeRates.js
//
// Retrieves the currency exchange rates from a server using the Fetch API
// and feeds them into the db.js library. The application always works
// with server rates, even when the user has not entered a custom URL in
// the settings screen: in that case a JSON file bundled with the deployed
// site is used instead.

import { setExchangeRates, SUPPORTED_CURRENCIES } from '../db.js';

// Local storage key that holds the user supplied rates URL.
const RATES_URL_STORAGE_KEY = 'costsdb:ratesUrl';

// The JSON file that ships with the deployed site. It lives next to the
// built application, so a relative reference resolves to the same origin.
export const DEFAULT_RATES_URL = new URL('exchange-rates.json', document.baseURI).href;

// Read the URL the user configured, or fall back to the bundled file.
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

// Fetch the rates from the given URL (or the resolved default) and push
// them into db.js. Returns the rates object that ended up being used.
export async function loadExchangeRates(url) {
    const targetUrl = url && url.trim() ? url.trim() : getRatesUrl();
    const response = await fetch(targetUrl, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error('the rates server answered with status ' + response.status);
    }
    const rates = await response.json();
    if (!isValidRatesObject(rates)) {
        throw new Error('the rates JSON is missing one of the supported currencies');
    }
    setExchangeRates(rates);
    return rates;
}
