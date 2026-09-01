// Shared constants for the cost manager front end.

// Name and version of the local storage backed database.
export const DATABASE_NAME = 'costsdb';
export const DATABASE_VERSION = 1;

// Default categories offered in the add cost form. The user can also
// type a category that is not on this list.
export const DEFAULT_CATEGORIES = [
    'Food',
    'Transport',
    'Housing',
    'Health',
    'Education',
    'Entertainment',
    'Shopping',
    'Bills',
    'Travel',
    'Other'
];

// Full month names indexed so that MONTH_NAMES[0] is January.
export const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Colours used by the pie chart slices, one per category in order.
export const CHART_COLORS = [
    '#1976d2', '#e53935', '#43a047', '#fb8c00', '#8e24aa',
    '#00acc1', '#fdd835', '#6d4c41', '#546e7a', '#d81b60'
];

// Build a list of selectable years centred on the current year.
export function buildYearOptions() {
    const currentYear = new Date().getFullYear();
    const years = [];
    // Offer a few past years and one year ahead.
    for (let year = currentYear - 6; year <= currentYear + 1; year += 1) {
        years.push(year);
    }
    return years;
}
