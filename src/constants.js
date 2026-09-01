/*
 * constants.js
 *
 * Shared values used across the cost manager front end: the database
 * name and version, the default category list, month names, chart
 * colours and a helper that builds the selectable year range.
 */

// Name and version of the local storage backed database.
export const databaseName = 'costsdb';
export const databaseVersion = 1;

// Categories offered in the add cost form. The user is also free to
// type a category that is not on this list.
export const defaultCategories = [
    'Food', 'Car', 'Transport', 'Housing', 'Health', 'Education',
    'Entertainment', 'Shopping', 'Bills', 'Travel', 'Other'
];

// Full month names, indexed so that monthNames[0] is January.
export const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Colours used by the pie chart slices, one per category in order.
export const chartColors = [
    '#1976d2', '#e53935', '#43a047', '#fb8c00', '#8e24aa', '#00acc1',
    '#fdd835', '#6d4c41', '#546e7a', '#d81b60', '#3949ab'
];

// Build a list of selectable years around the current year.
export function buildYearOptions() {
    const currentYear = new Date().getFullYear();
    const years = [];
    // Offer a few past years plus one year ahead.
    for (let year = currentYear - 6; year <= currentYear + 1; year += 1) {
        years.push(year);
    }
    return years;
}
