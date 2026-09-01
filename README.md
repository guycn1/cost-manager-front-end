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
Fetch API, including when the user has not entered a custom URL.

The default server is a static JSON document hosted on GitHub Pages,
served straight from the `docs/` folder of this repository:

```
https://guycn1.github.io/cost-manager-front-end/exchange-rates.json
```

```json
{ "USD": 1, "GBP": 0.79, "EURO": 0.92, "ILS": 3.7 }
```

GitHub Pages answers this file with `Access-Control-Allow-Origin: *`, so it
can be read from the deployed application on any origin.

A copy of the same JSON lives in `public/exchange-rates.json` and is
bundled with the built site. It is used only as an offline fallback if the
remote request fails.

The **Settings** screen lets the user point the app at a different URL that
returns the same JSON shape.

### Enabling the rates host

In the GitHub repository, open **Settings -> Pages** and set the source to
**Deploy from a branch**, branch `main`, folder `/docs`. After the first
deployment the URL above serves the rates file.

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
