# Marga Research Hub

A responsive research catalogue for the Marga Institute. Visitors can search papers, filter the catalogue, read paper details, save papers, request access, and contact the research team.

## Features

- Search by keywords, author, or paper ID
- Filter by year, partner institution, research area, and publication type
- Sort by newest, oldest, title, or citation count
- View paper details and open available PDF links
- Request access when a paper does not have a PDF link
- Save papers in the browser for later
- Light and dark themes
- Responsive desktop, tablet, and mobile layouts
- Guided site tour and accessibility information
- Mobile spotlight carousel for recent papers
- Visitor count with a cached fallback value
- Offline navigation fallback through the service worker

## Project Files

| File | Purpose |
| --- | --- |
| `index.html` | Main page structure and accessible content containers |
| `css/` | Modular stylesheets loaded by `css/main.css` in cascade order |
| `js/` | Modular browser JavaScript, loaded through `js/main.js` |
| `data/paper.json` | Research paper records loaded by the catalogue |
| `offline/offline.html` | Page shown when a navigation cannot be completed while offline |
| `sw.js` | Service worker that caches the offline page and logo |
| `site_logo/marga-logo.jpg` | Logo used by the page and offline fallback |

## How the Logic Works

The project is a client-side application. There is no server-side application in this folder. The browser loads the HTML, CSS, JavaScript, and paper data, then `js/main.js` builds the catalogue and controls the interactions.

### 1. The page starts

1. The browser loads `index.html`.
2. `css/main.css` imports the layout and immediately hides the loading screen only when JavaScript is unavailable.
3. `js/main.js` restores the visitor's saved theme, removes the no-JavaScript fallback class, and waits for the page to finish loading.
4. The `init()` function finds the important HTML elements, connects event handlers, displays loading placeholders, and requests `data/paper.json`.

The page uses a loading screen while the paper data is being requested. If the request succeeds, the loading screen is removed after the first catalogue view is ready. If the request fails, the page shows an error message and a button that tries the request again.

### 2. Paper data is prepared

`paper.json` contains the original paper records. The `normalize()` function creates a consistent version of each record before it is used by the interface. It fills missing values, converts years and citation counts into useful types, creates lowercase search values, and removes citation markers left inside some abstracts.

The original JSON records are not changed. The cleaned records are stored in `state.papers`, while `papersByKey` provides a quick way to find one paper when a card, URL, or modal refers to it.

### 3. The catalogue is filtered and sorted

The current controls are stored in the `state` object. This includes the search text, search type, year range, partner, research area, publication type, sort order, and whether only saved papers should be shown.

When a visitor searches or changes a filter:

1. The selected values are copied into `state`.
2. `computeFiltered()` checks every paper against the active conditions.
3. `sortPapers()` orders the matching records.
4. `renderActiveFilterChips()` shows the active choices.
5. `renderGrid()` updates the count and draws the visible paper cards.

The page keeps the full data set in memory and filters it locally. This makes search and filter changes immediate and avoids downloading `paper.json` again.

### 4. Paper cards and modals

The catalogue is rendered from HTML strings created by `cardHTML()`. Each card stores the paper's internal key in a `data-key` attribute. A single click handler on the grid reads that key and decides whether the visitor wants to open, save, cite, share, or request the paper.

The detail modal is filled only when a paper is opened. This keeps the initial page smaller and ensures the modal always uses the current paper data. The request modal creates a pre-filled `mailto:` link so the visitor's email application can send the request.

### 5. Saved papers and browser storage

Saved paper keys are loaded from `localStorage` when the application starts. Clicking Save updates the in-memory `saved` set and writes it back to browser storage. The saved-items view uses the same filtering and rendering path as the main catalogue, but adds a saved-only condition.

The theme and tour-completion flag use the same storage approach. Storage errors are caught so a private browsing setting or full storage does not stop the catalogue from working.

### 6. Theme, accessibility, and responsive behavior

The theme buttons add or remove `data-theme="dark"` on the root `<html>` element. CSS variables then change the colors without rebuilding the page. The current button label and accessibility attributes are updated at the same time.

Responsive layout is handled by CSS media queries. JavaScript also chooses a smaller page size on narrow screens so mobile visitors see fewer cards at once. The mobile spotlight rotates between recent papers unless the visitor has enabled reduced motion.

### 7. Offline behavior

The main page stays visible during transient offline events; `js/offline.js` does not force a reload when the browser reports that the site is offline. The service worker in `sw.js` catches failed navigation requests and serves the cached offline page when available. That page checks the homepage in the background and returns to it only after a request succeeds. The service worker refreshes the cached offline page and logo periodically while the site is online.

## Run Locally

This is a static website and does not need a build step or package installation. Because the page loads `data/paper.json` with `fetch`, open it through a local web server instead of opening `index.html` directly.

### Python

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

### VS Code Live Server

Install the **Live Server** extension, right-click `index.html`, and choose **Open with Live Server**.

## Updating Papers

Edit `data/paper.json` and keep it as a valid JSON array. Each paper should normally include these fields:

```json
{
  "id": "SLR-001",
  "title": "Paper title",
  "authors": "Author names",
  "year": "2024",
  "partner": "cso",
  "partnerName": "Partner name",
  "isMarga": true,
  "area": "agriculture",
  "areaName": "Agriculture & Rural Development",
  "areaIcon": "fa-wheat-awn",
  "abstract": "Short description of the paper.",
  "pdfUrl": "https://example.com/paper.pdf",
  "citations": 0,
  "litType": "published"
}
```

The application normalizes missing or inconsistent values, but keeping the fields consistent makes filtering and display more reliable. After changing the data, refresh the page with the browser cache disabled if an old result still appears.

## Configuration

Common settings are in `js/config.js`:

- `CONTACT_EMAIL`: address used by contact and paper request forms
- `STOREHOUSE_URL`: external research store link
- `DATA_URL`: location of the paper data file
- `PAGE_SIZE`: number of papers shown based on viewport width
- `VISITOR_API_BASE`: visitor counter service
- `VISITOR_NAMESPACE` and `VISITOR_KEY`: visitor counter identifiers

The page also loads Google Fonts, Font Awesome, and GSAP from CDNs. An internet connection is needed for those external resources and for the live visitor counter, but the catalogue itself is loaded from the local `data/paper.json` file.

## Browser Storage

The site uses browser storage for optional personal features:

- Saved papers
- Selected theme
- Guided tour completion
- Visitor counter session and fallback values

Clearing site data removes these saved settings. The catalogue and the main page remain usable when storage is unavailable.

## Offline Behavior

- Keep page structure in `index.html`.
- Keep visual styles in the appropriate file under `css/`.
- Keep behavior and data rendering in the appropriate module under `js/`.
- Keep research records in `data/paper.json`.

- `index.html`
- `css/`
- `js/`
- `data/paper.json`

- Keep research records in `data/paper.json`.

