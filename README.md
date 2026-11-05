# Shelfwise

A self-hostable retail inventory portfolio project for Jedar Nori. Real Norwegian product references, locally stored product images, EAN search, camera barcode scanning, editable stock and placement, daily sales, waste (svinn), replenishment and receiving.

## Version 2.1: English / Norwegian and cappuccino

Use the Language / Språk selector in the top bar to choose English or Norsk (bokmål). Your choice is saved in the browser. Navigation, forms, alerts, scanner guidance, categories and waste reasons are translated. Product names, EANs and your own placement text remain as entered. Currency formatting follows the selected language; business dates remain in the Oslo timezone.

TINE IsKaffe Cappuccino 330ml (EAN **7038010003813**) is included with a local product photo. Existing saved catalogues receive this item without resetting previous stock, sales, waste or orders. An existing item with that EAN is preserved. On an existing installation, its sales history starts empty until sales are recorded; a fresh demo gets sample history.

### Updating your Windows project

1. Stop the running server with Ctrl+C.
2. Download and extract the updated ZIP. Open the inner `shelfwise` folder — the one containing `package.json` and `package-lock.json`.
3. Run `npm ci`, then `npm run dev`.
4. Open the same localhost address and port as before to reuse browser-saved data. If you change browser or origin, export/import a JSON backup from About.

Do not reset the demo to get the new coffee: it is added automatically. If you changed source code yourself, compare your changes before replacing your project folder.

## Run locally

Install Node.js 22 LTS or newer, open this folder in VS Code, then run:

```sh
npm ci
npm run dev
```

Open the localhost URL printed by Vite. Do not open index.html directly from disk.

```sh
npm test       # domain tests
npm run build # creates dist/
npm run preview # preview the production build
```

The ZIP also includes a ready-built `dist/` folder, so you can host it without building first.

## Host it yourself

This is a static web app with no platform-specific hosting dependency. Upload **the contents of dist/** to an HTTPS static host, your web server, or a static hosting service. For a Git-connected host, use `npm ci && npm run build` as the build command and `dist` as the output directory. Relative asset paths support hosting under a subfolder, including a GitHub Pages project path. There is no client-side router requiring rewrite rules.

For Docker:

```sh
docker build -t shelfwise .
docker run --rm -p 8080:80 shelfwise
```

Use an HTTPS reverse proxy for a remote deployment. Camera access works on HTTPS or localhost; plain HTTP over your phone's LAN IP normally cannot access the camera. The Docker image only serves static files; it does not add a backend.

## Features

- Product name, valid EAN-8/EAN-13, price, shelf placement, stock, target, category and next-expiry date.
- Inventory name/EAN search; a keyboard barcode scanner can type into the search field and press Enter.
- Product details include a collapsible price and a daily sales history. Inventory prices can be shown or hidden.
- Add products and edit existing ones; duplicate EANs and bad check digits are rejected. User-added products use a neutral placeholder image.
- Camera barcode reading with bundled ZXing; requests camera only after Start camera is pressed. Camera frames are processed locally. Closing the dialog or hiding the tab stops the camera. Manual EAN entry handles devices without a usable camera.
- Daily sales totals and per-product breakdown with a date selector. Recording a sale reduces stock and captures its price at that time.
- Waste / Svinn section, with expired/damaged/quality/other reasons. Waste reduces stock and records retail value (not procurement cost).
- Replenishment accounts for pending orders. Receiving updates inventory once.
- Product-level next-expiry reminders; no batch-level traceability yet.
- CSV stock export and JSON backup/restore from About.

## Data model and limitations

**This is a functional single-browser portfolio prototype, not a multi-user production inventory system.** It uses localStorage under `shelfwise-v2`, with no backend, account system or shared database. Data stays in the current browser and origin; clearing browser storage removes it. Use JSON export/import to move data. Hiding prices is a display preference, not security. Other tabs/devices are not synchronised; avoid concurrent edits in multiple tabs.

Product names, EANs and pack images reference real listings. **Prices, placements, stock and sales are sample store data, not live retailer information.** Seven days of deterministic demo sales are generated on the first run. Seed stock represents the current opening snapshot and is not reduced again for the preloaded historical sales. New sale/waste records reduce current stock, including when backdated. Changing product prices does not rewrite historical sales values. Expiry dates start unset and must be entered by the user.

Unknown barcodes return a catalogue-not-found message; this is not a global product lookup service. Real scanners and permission handling need testing on your target phone/browser. There is no supplier, NGFLYT, ASKO, payment or POS integration.

## Project layout

```
src/app.js          UI and event handlers
src/model.js        domain rules (stock, orders, sales, waste)
src/scanner.js      camera lifecycle and ZXing decoder
src/products.json  seed product references and source URLs
src/style.css      responsive styles
public/assets/     local reference product photos
 tests/model.test.js domain tests
```

## Suggested production extension

Add a backend API and database with products, stock movements, sales, waste, orders and batches; authenticated roles; database transactions preventing negative stock and duplicate receipts; server-side validation; audit history and backups. Keep business rules in model.js as the specification. This version intentionally has no embedded credentials or proprietary services.

## Product references and asset rights

See SOURCES.md. Code is offered under the MIT licence. Product photos, packaging, logos and trademarks are third-party reference assets and are **not covered by that licence**. Their source pages are documented; no ownership or broad redistribution licence is claimed. Confirm appropriate permission or replace these assets before a commercial release. Shelfwise is independent and is not affiliated with TINE, Orkla, Freia, MENY, NorgesGruppen or ASKO.

## Verification

Run `npm test` for EAN validation, Oslo dates, stock deduction, sales price snapshots, invalid movement rejection, order coverage, duplicate receiving prevention and stock counts. Run `npm run build` for the production bundle. Camera scanning requires a real device and a printed/product barcode; a software-only check cannot verify focus or hardware behaviour.
