# Court Stock

Pro shop inventory for **BJK** and **ELDO**. Upload a CourtReserve retail CSV, recount the cooler, set par levels, and build a Smart & Final / Instacart list.

Live site (GitHub Pages): **https://NZemlin.github.io/court-stock/**

Everything runs in the browser. CSVs and par levels stay on the device (localStorage). Nothing is sent to a server.

## Use it

1. Open the site on the desk computer or a tablet.
2. **Upload** a retail items CSV. If the filename contains `bjk` or `eldo`, it is assigned automatically.
3. **Order** lists items below par (rounded to pack size). Copy the paste list into Instacart.
4. **Recount** — type counted quantities, then download the POS adjustment CSV for CourtReserve stock adjustment.
5. **Pars** — edit min / target / pack size / Instacart search names. Export a backup JSON.

The Sep 17, 2026 exports are seeded so you can try the desk before uploading a new file. Ice cream starts at target 0 (freezer off-season); set a target to bring it back.

## Run locally

```bash
npm install
npm run dev
```

## GitHub Pages

Push to `main`. The Actions workflow builds with `base: /court-stock/` and deploys.

In the repo: **Settings → Pages → Source: GitHub Actions** (needed once if the first deploy is waiting on permissions).
