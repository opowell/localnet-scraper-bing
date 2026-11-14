# Bing scraper for Localnet

Reads `www.bing.com/search` pages for Localnet, a browser extension that is a personal search engine.
Localnet pulls it from here the first time it scrapes such a page, through the
[localnet-scrapers](https://github.com/opowell/localnet-scrapers) scraper source.

- `source.json`: what Localnet reads to know the scraper: its name, the URLs it reads, how the site is searched, and the file to run.
- `bing.js`: the parser. It is injected into the scraped page after Localnet's DOM helpers (content-scripts/utils/dom.js) and defines `window.__dynamicParser`.
- `bing.test.ts`: its unit tests, run from a Localnet checkout (`pnpm parsers pull`, then `pnpm test parsers/localnet-scraper-bing`).
- `saved-pages/` (not in git): real pages saved from the site, which Localnet's `e2e/saved-pages.test.ts` scrapes. See Localnet's README.

## What it reads

**Bing** (`www.bing.com/search`, `?first=11` for page 2): each `#b_results > li.b_algo`, its title the link in its `<h2>`, which goes through Bing's `/ck/a?…&u=a1<base64url of the URL>`.

It reads a page of a search's results as a listing of what it found, as Localnet's search engine scrapers do (`searchResultsOf` in Localnet's `content-scripts/utils/dom.js`).
