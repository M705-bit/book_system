# Book Tracker + Recommendation System
> Deploy target: GitHub Pages (static only — HTML, CSS, vanilla JS)

---

## What it does

- **My Shelf** — search Google Books API, add books to a personal shelf (stored in localStorage)
- **Recommendations** — suggests books based on what's on your shelf using TF-IDF + cosine similarity

---

## File Structure

```
book_system/
├── index.html
├── css/
│   └── styles.css
└── js/
    ├── api.js        ← Google Books API calls
    ├── shelf.js      ← localStorage read/write
    ├── recommend.js  ← TF-IDF + cosine similarity engine
    └── app.js        ← UI rendering + event handling
```

---

## Step 1 — No API Key Needed

Google Books API works without any key. Just call it directly:

```
GET https://www.googleapis.com/books/v1/volumes?q={query}&maxResults=10
```

Limit: ~1000 requests/day — fine for a personal project.

> If you later hit rate limits, you can create a key at console.cloud.google.com with a personal Google account. Brazil may ask for CNPJ during billing setup — skip this by never enabling billing. The Books API is free and works on a keyless account with no billing required.

---

## Step 2 — Google Books API (js/api.js)

Endpoint:
```
GET https://www.googleapis.com/books/v1/volumes?q={query}&maxResults=10&key={KEY}
```

Fields to extract from each result (`item.volumeInfo`):
- `title`
- `authors` (array)
- `description`
- `categories` (array)
- `imageLinks.thumbnail`
- `averageRating`

Write a `searchBooks(query)` function that fetches and normalizes results into plain objects.

---

## Step 3 — Shelf Storage (js/shelf.js)

Use `localStorage` with key `bookshelf_v1`. Store an array of normalized book objects.

Functions to write:
- `getShelf()` — returns array from localStorage
- `addToShelf(book)` — push to array, save back, return false if duplicate
- `removeFromShelf(bookId)` — filter out by id, save back
- `isOnShelf(bookId)` — check if id exists in array

---

## Step 4 — Recommendation Engine (js/recommend.js)

### How it works

1. For each book on the shelf, extract its `categories` and `authors`
2. Use those as search queries to fetch ~8 candidate books each from the API
3. Pool all candidates, exclude books already on the shelf
4. Rank candidates by cosine similarity against shelf books using TF-IDF
5. Return top 12

### TF-IDF + Cosine Similarity (pure JS)

Build a feature string per book:
```
title + authors.join(' ') + categories.join(' ') + description
```

Then:
1. **Tokenize** — lowercase, strip punctuation, remove stopwords (a, the, and, is...)
2. **Term Frequency (TF)** — count of each token / total tokens in document
3. **Inverse Document Frequency (IDF)** — `log((N+1) / (docs containing term + 1)) + 1`
4. **TF-IDF vector** — `TF * IDF` per term (sparse object `{ term: score }`)
5. **Cosine similarity** — `dot(a,b) / (|a| * |b|)` between two sparse vectors

Score each candidate as `max(cosine(candidate, shelfBook))` across all shelf books.

---

## Step 5 — UI (index.html + js/app.js)

Two tabs:
- **My Shelf** — search bar → results grid → shelf grid
- **Recommendations** — auto-loads when tab opens, refresh button

Book card shows: thumbnail, title, author, category, and an Add/Remove button.

Use **event delegation** — one `document.addEventListener('click')` handles all card buttons via `data-action="add|remove"` and `data-book-id`.

Store fetched book objects in a `Map` in memory so cards only need `data-book-id` (avoids encoding full JSON in HTML attributes).

---

## Step 6 — Deploy to GitHub Pages

Option A — root deploy:
```
Push everything to main branch → Settings → Pages → Source: main / (root)
```

Option B — /docs folder:
```
Move all files into /docs → Settings → Pages → Source: main / docs
```

Your app will be live at `https://yourusername.github.io/repo-name/`

---

## Key Constraints

| Constraint | Solution |
|---|---|
| No backend | All logic runs in the browser |
| No database | localStorage for shelf, in-memory Map for session cache |
| Rate limits | Cache API responses in sessionStorage; same query = no refetch |
| No build step needed | Plain `<script src="...">` tags, no bundler required |
