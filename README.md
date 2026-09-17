# Court Stock

Pro shop inventory for **BJK** and **ELDO**. Upload a CourtReserve retail CSV, recount the cooler, set par levels, and build a Smart & Final / Instacart list.

- **Repo:** https://github.com/NZemlin/court-stock
- **Desk site:** https://NZemlin.github.io/court-stock/

Everything runs in the browser. CSVs and par levels stay on the device (localStorage). Nothing is sent to a server.

## Use it

1. Open the site on the desk computer or a tablet.
2. **Upload** a retail items CSV. If the filename contains `bjk` or `eldo`, it is assigned automatically.
3. **Order** lists items below par (rounded to pack size). Copy the paste list into Instacart.
4. **Recount** — type counted quantities, then download the POS adjustment CSV for CourtReserve stock adjustment.
5. **Pars** — edit min / target / pack size / Instacart search names. Export a backup JSON.

The Sep 17, 2026 exports are seeded so you can try the desk before uploading a new file. Ice cream starts at target 0 (freezer off-season); set a target to bring it back.

## First-time GitHub Pages

The deploy workflow turns Pages on automatically. If the live URL still 404s, open the repo once:

**Settings → Pages → Build and deployment → Source: GitHub Actions**

Then wait for the **Deploy GitHub Pages** Action on `main` to finish.

## Run locally

```bash
npm install
npm run dev
```
