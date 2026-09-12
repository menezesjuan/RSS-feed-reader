# Frontpage — RSS & Atom Feed Reader

A customizable, high-density content aggregator that pulls RSS, Atom, and RDF feeds into a clean, calm reading dashboard. Built with a focus on speed, typographic elegance, and zero algorithmic noise.

![Frontpage preview](./preview.jpg)

---

## Overview

Frontpage is a full-featured feed reader designed for developers, designers, and engineering leaders who follow dozens of technical publications and need a focused, distraction-free environment. 

The application delivers an instant **Guest Experience** pre-seeded with 19 curated industry feeds (Frontend, Design, Backend & DevOps, General Tech, and AI & ML), paired with server-side feed proxying, resilient XML normalization, full OPML 2.0 import/export, and complete keyboard navigation.

### Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Backend / API** | Node.js (v24), Express | Lightweight server for CORS proxying, HTTP caching, and feed validation. |
| **Frontend** | HTML5, Tailwind CSS v4, Modular ES6 JS | Zero compilation latency, direct DOM control, native reactive state store. |
| **Styling & Tokens** | CSS Custom Properties + Tailwind v4 | Strict implementation of design tokens (`starter/tokens.css` and `brand-kit.md`). |
| **Feed Engine** | `fast-xml-parser` | Resilient polymorphic parser for RSS 2.0, Atom 1.0, and RDF feeds. |
| **Testing** | Node.js Test Runner (`node:test`) | Native, zero-overhead test suite with 32 automated unit & integration tests. |

---

## Key Features

1. **Multi-Format Feed Engine (RSS 2.0, Atom 1.0 & RDF):**
   - Automatically detects feed format and normalizes entries into a unified canonical schema.
   - Robust date normalizer supporting RFC 822, RFC 2822, ISO 8601, and timezones.
   - HTML entity decoder (`&amp;`, `&mdash;`, `&#8217;`, numeric and hex entities).
   - Clean excerpt generation with word-boundary truncation and XSS sanitization.

2. **Tailored Reading Layouts:**
   - **Standard View:** Comprehensive view with title, publication avatar, excerpt, category pill, and unread indicator.
   - **Compact List:** High-density, single-line scanning mode for triaging high-volume feeds.
   - **Cards Grid:** 2-column visual grid for magazine-style browsing.

3. **Design Challenge 1: Content Discovery:**
   - Explore curated feeds categorized across technology disciplines.
   - Filter by discipline and subscribe with one click.

4. **Design Challenge 2: Daily Digest & Briefing:**
   - "Today's Digest" surfaces the lead story and key highlights across all subscriptions with reading time estimates.

5. **OPML 2.0 Import & Export:**
   - Full support for nested outline hierarchies, case-insensitive attribute naming (`xmlUrl`/`xmlurl`), and missing `type` attributes.
   - Intelligent deduplication reporting feeds added and duplicates skipped.
   - One-click OPML backup download directly from the sidebar.

6. **Power-User Keyboard Shortcuts & Accessibility:**
   - Press `?` anywhere in the app to view the shortcut cheat sheet.
   - `↓` / `↑` (ArrowDown / ArrowUp): Navigate seamlessly across feed items in list view and previous/next articles in reader view.
   - `o` / `Enter`: Open selected article in reader view.
   - `s`: Save / Bookmark article.
   - `m`: Toggle read / unread status.
   - `/`: Focus global article search.
   - `g` then `h`: Jump to All Items.
   - `g` then `s`: Jump to Saved bookmarks.
   - `Esc`: Close reader view or modal.

7. **Surgical DOM Updates & State Reactivity:**
   - Fine-grained DOM mutation listener that updates individual article states (unread dots, opacities, bookmark status, and sidebar counters) in place.
   - Preserves user scroll position and active keyboard focus during real-time updates without full list re-renders.

8. **Hardened XSS Protection & WCAG AA Contrast:**
   - Dedicated client-side string escaping utility (`escapeHtml`) systematically applied to all external RSS data (`title`, `excerpt`, `category`, `feedTitle`, `author`).
   - Calibrated text contrast (`--color-text-tertiary: #6b7280` on light mode, `#9ca3af` on dark mode) ensuring strict WCAG AA standard compliance (>= 4.5:1).
   - Dynamic CSS variable linkage with `--color-unread-indicator`.

9. **Multi-Layered Security Hardening:**
   - **SSRF Defense Engine (`ssrfProtection.js`):** Enforces strict protocol validation (`http:`, `https:`) and blocks all private/internal subnets (RFC 1918), loopback addresses (`127.0.0.0/8`, `::1`), link-local/cloud metadata services (`169.254.169.254`), and local domains (`.localhost`, `.local`, `.internal`).
   - **Link Pseudo-Protocol Sanitization (`sanitizeUrl.js`):** Neutralizes `javascript:`, `data:`, `vbscript:`, and other executable schemes in external article and publication links.
   - **HTTP Security Headers:** Express server configured with `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `Referrer-Policy: strict-origin-when-cross-origin`.
   - **Stream Size & DoS Protection:** Caps remote feed downloads at 5MB and limits incoming JSON request bodies to 2MB.

---

## Design Decisions

### Typography & Information Density
- **UI & Controls:** Rendered using `Inter` with strict adherence to the 4px spacing scale and subtle borders (`--color-border-subtle`).
- **Reader View:** Uses `Georgia` serif typography with comfortable line height (`1.55`) and max-width (`45rem`) to create an Instapaper-like calm reading sanctuary.
- **Code Snippets:** Rendered with `JetBrains Mono` with subtle syntax background.

### Instant Guest Experience
Rather than presenting users with a login wall or an empty state, visitors entering guest mode get a pre-populated dashboard with 47 unread articles from 19 real publications. Reading progress and bookmarks persist locally via `localStorage`, while optional account registration unlocks cross-device sync.

---

## Automated Test Suite (TDD)

The codebase was constructed using strict Test-Driven Development (TDD). The test suite includes 47 automated tests covering parser resilience, date normalization, cache TTL, API route handling, escaping utilities, keyboard navigation, SSRF defense, and URL sanitization:

```text
✔ API Routes: GET /api/health returns status ok
✔ API Routes: GET /api/feeds/sample returns curated sample categories
✔ API Routes: POST /api/feeds/validate validates empty or invalid URLs
✔ API Routes: POST /api/opml/import parses OPML and returns feed list
✔ API Routes: GET /api/opml/export serves downloadable OPML file
✔ API Routes: Sets standard HTTP security headers
✔ API Routes: POST /api/feeds/validate blocks SSRF target URLs
✔ escapeHtml: Escapes &, <, >, ", and ' characters correctly
✔ escapeHtml: Handles null, undefined and numbers gracefully
✔ Keyboard Navigation: Item selection and cycle next/prev
✔ Keyboard Navigation: Toggle read status with key shortcut helper
✔ Keyboard Navigation: Arrow navigation helper calculates correct indices
✔ sanitizeUrl: Neutralizes javascript: and dangerous pseudo-protocols
✔ sanitizeUrl: Neutralizes null, undefined, objects and empty values
✔ sanitizeUrl: Preserves safe HTTP, HTTPS and relative links
✔ Store: Initial state and view selection
✔ Store: Items management and filtering by view
✔ Store: Read/Unread tracking and unread counts
✔ Store: Bookmarks tracking
✔ Store: Search filtering and sorting
✔ Atom 1.0 Parser: Parses Atom feed metadata and entry list
✔ Date Normalizer: RFC 822 and RFC 2822 dates
✔ Date Normalizer: ISO 8601 dates (Atom format)
✔ Date Normalizer: Missing or invalid date falls back gracefully
✔ Date Normalizer: Relative time formatting
✔ Feed Parser Resilience: Throws friendly error on empty or invalid XML
✔ Feed Parser Resilience: Handles missing optional item fields gracefully
✔ Feed Parser Resilience: Deduplicates items with identical links or IDs
✔ HTML Utils: decodeHtmlEntities handles standard and numeric entities
✔ HTML Utils: stripHtml removes tags and extra whitespace
✔ HTML Utils: extractExcerpt truncates cleanly at word boundary with ellipsis
✔ HTML Utils: sanitizeHtml strips harmful tags like script, iframe, onload
✔ OPML Parser: Successfully parses official sample-feeds.opml with all edge cases
✔ OPML Export: Generates valid OPML 2.0 XML with categories
✔ RSS 2.0 Parser: Parses channel metadata and items correctly
✔ CacheService: stores and retrieves values within TTL
✔ CacheService: expires items after TTL
✔ CacheService: clear and delete functionality
✔ FeedFetcher: fetches, parses and caches feed successfully
✔ FeedFetcher: handles HTTP errors gracefully
✔ FeedFetcher: blocks private and loopback URLs (SSRF protection)
✔ FeedFetcher: rejects feeds exceeding maximum size limit
✔ SSRF Protection: Rejects invalid or unsupported protocols
✔ SSRF Protection: Rejects localhost and private/internal domain names
✔ SSRF Protection: Rejects loopback, private and cloud metadata IPv4 addresses
✔ SSRF Protection: Rejects IPv6 loopback and private addresses
✔ SSRF Protection: Allows safe public HTTP/HTTPS URLs

47 tests passed (0 failures)
```

---

## Running Locally

### Prerequisites
- Node.js v20+ (developed and tested on Node.js v24)
- npm v10+

### Installation & Execution
```bash
# 1. Clone the repository
git clone https://github.com/menezesjuan/RSS-feed-reader.git
cd RSS-feed-reader

# 2. Install dependencies
npm install

# 3. Run the automated test suite
npm test

# 4. Start the application
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To view the landing page directly, navigate to [http://localhost:3000/landing.html](http://localhost:3000/landing.html).

---

## License & Credits
Built as a solution to the Frontend Mentor Product Challenge.
