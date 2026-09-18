# BTG Stock

Bridge the Gap Tennis inventory for **BJK** and **ELDO**. Upload a ClubAutomation retail CSV, recount the desk, set par levels, and build a Smart & Final / Instacart list.

Live site: **https://nzemlin.github.io/court-stock/**

Everything runs in the browser. CSVs and par levels stay on the device. Nothing is sent to a server.

## Use it

1. Open the site on the desk computer or a tablet.
2. **Upload** a ClubAutomation retail items CSV. If the filename contains `bjk` or `eldo`, it is assigned automatically.
3. **Order** lists snacks and drinks below par (rounded to pack size). Copy the paste list into Instacart. Ice cream, Barebells, LMNT, NOCCO, and pickle bars are separate vendors and stay off this list.
4. **Recount** — **Desk** counts strings, grips, dampeners, balls, food, drinks, ice cream, and sunscreen (not bags, shoes, or apparel). **Full shop** counts everything. Download the adjustment CSV for ClubAutomation.
5. **Pars** — edit min / target / pack size / Instacart search names for food and drink. Ice cream, Barebells, LMNT, NOCCO, and pickle bars are not on this page.

The Sep 17, 2026 exports are seeded so you can try the desk before uploading a new file.

## Run locally

```bash
npm install
npm run dev
```

## GitHub Pages

Push to `main`. The Actions workflow builds with `base: /court-stock/` and publishes the `gh-pages` branch.
