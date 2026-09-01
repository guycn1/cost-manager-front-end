/*
 * testdb.js
 *
 * A small sanity check for the vanilla db.js library, modelled on the
 * sample in the project brief. Open testdb.html in a browser and read
 * the output in the developer console.
 */

// Add two sample cost items and print the resulting report total.
function test() {
    try {
        // Start from an empty store so repeated runs are reproducible.
        window.localStorage.removeItem('costsdb:costsdb:v1');
        const database = db.openCostsDB('costsdb', 1);
        // Two USD items whose month total should come to 600.
        const first = {
            sum: 200, currency: 'USD', category: 'FOOD', description: 'pizza'
        };
        const second = {
            sum: 400, currency: 'USD', category: 'CAR', description: 'fuel'
        };
        // Add both items and keep what each call returned.
        const firstResult = database.addCost(first);
        const secondResult = database.addCost(second);
        // The first two logs confirm the database and the first item.
        if (database) {
            console.log('creating db succeeded');
        }
        if (firstResult) {
            console.log('adding 1st cost item succeeded');
        }
        // The third log confirms the second item was stored too.
        if (secondResult) {
            console.log('adding 2nd cost item succeeded');
        }
        // Print the converted month total for the two items.
        const data = database.getReport('USD');
        console.log(data.total.sum);
    } catch (exception) {
        console.log(exception.message);
    }
}

// Run the check as soon as the file loads.
test();
