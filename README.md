# Cost Manager Front-End

| | |
| --- | --- |
| **Live app** | <https://cost-manager-front-end-g3lr.onrender.com> |
| **Demo video** | [Cost Manager Front-End Project - Guy Cohen & Liron Avrahamof](https://www.youtube.com/watch?v=XI3yuZJIzDk) |

A single page application for tracking personal costs. Users add cost
items, read a detailed monthly report, and view a category pie chart and a
yearly bar chart, each in a currency of their choice. All data is kept in
the browser local storage.

## Tech stack

- React 18 with Vite
- MUI for the user interface
- Recharts for the pie and bar charts
- A local storage wrapper library, `db.js`, in two flavours

## Project layout

```
db.js                     vanilla local storage wrapper (global `db`)
test-db.html              browser console check for db.js
index.html                Vite entry point
render.yaml               Render static site blueprint
public/exchange-rates.json   rates JSON bundled with the build (fallback)
docs/                     rates JSON served from GitHub Pages
src/
  main.jsx                mounts the React tree, applies the MUI theme
  App.jsx                 tab bar, opens the database, loads the rates
  db.js                   the db.js library as an ES module
  constants.js            database name, categories, month names, colours
  lib/convert.js          currency conversion helper for the charts
  services/rates.js        fetches the rates and feeds them to db.js
  components/
    AddCostForm.jsx       "Add Cost" screen
    MonthlyReport.jsx     "Monthly Report" screen
    CategoryPieChart.jsx  "Category Pie Chart" screen
    YearlyBarChart.jsx    "Yearly Bar Chart" screen
    SettingsPanel.jsx     "Settings" screen
    ReportFilters.jsx     shared month / year / currency selector row
    ScreenCard.jsx        shared card + heading frame for every screen
    EmptyNote.jsx         shared "nothing to show" line
```

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
static host.

## Deploying to Render

The repository contains a `render.yaml` blueprint. Two ways to deploy:

- **Blueprint (reproducible):** in the Render dashboard choose
  **New -> Blueprint**, pick this repository, and Render applies the
  settings from `render.yaml` automatically.
- **Manual:** **New -> Static Site**, pick this repository, then set
  **Build Command** to `npm install && npm run build` and
  **Publish Directory** to `dist`.

Every push to `main` redeploys the site.

## Exchange rates

The currency exchange rates are always fetched from a server with the
Fetch API, including when the user has not entered a custom URL.

The default server is a static JSON document hosted on GitHub Pages,
served from the `docs/` folder of this repository:

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
returns the same JSON shape (keys `USD`, `ILS`, `GBP`, `EURO`).

### Enabling the GitHub Pages rates host

In the GitHub repository open **Settings -> Pages** and set the source to
**Deploy from a branch**, branch `main`, folder `/docs`.

### Test URLs for the Settings screen

Both return the required shape with `Access-Control-Allow-Origin: *`:

```
https://cdn.jsdelivr.net/gh/guycn1/cost-manager-front-end@main/docs/exchange-rates-alt.json
https://raw.githubusercontent.com/guycn1/cost-manager-front-end/main/docs/exchange-rates.json
```

The first (`exchange-rates-alt.json`) uses deliberately different values so
the change is obvious in the report and the charts.

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
current date. `getReport` returns the item list (each item keeps its
original currency) plus a total converted to the requested currency.
Without a year and month it reports on the current month.
