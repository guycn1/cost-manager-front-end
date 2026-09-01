# Cost Manager Front End

A single page application for tracking personal costs. Users add cost
items, read a detailed monthly report, and view a category pie chart and a
yearly bar chart, each in a currency of their choice. All data is kept in
the browser local storage.

## Tech stack

- React 18 with Vite
- MUI for the user interface
- Recharts for the pie and bar charts
- A local storage wrapper library, `db.js`, in two flavours

## Running locally

```bash
npm install
npm run dev
```

The app opens on `http://localhost:5173`.

## Building for the web

```bash
npm run build
npm run preview
```

`npm run build` writes a static site to `dist/`, ready to deploy on any
static host (for example Render or GitHub Pages).

## Exchange rates

The currency exchange rates are always fetched from a server with the
Fetch API. A JSON file, `public/exchange-rates.json`, is bundled with the
deployed site and used by default:

```json
{ "USD": 1, "GBP": 0.79, "EURO": 0.92, "ILS": 3.7 }
```

The **Settings** screen lets the user point the app at a different URL that
returns the same JSON shape. The response is expected to send
`Access-Control-Allow-Origin: *`.

## The db.js library

Two versions live in this repository:

- `db.js` at the project root: a plain script. Loading it with
  `<script src="db.js"></script>` adds a `db` property to the global
  object. `test-db.html` runs a small check in the browser console.
- `src/db.js`: the same behaviour exported as an ES module, imported by
  the React code.

API:

```js
const database = db.openCostsDB('costsdb', 1);
database.addCost({ sum: 200, currency: 'USD', category: 'Food', description: 'Milk 3%' });
const report = database.getReport('USD', 2025, 9);
```

`addCost` stores the item together with its original currency and the
current date. `getReport` returns the item list plus a total converted to
the requested currency. Without a year and month it reports on the current
month.
