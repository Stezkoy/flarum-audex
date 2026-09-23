# Audex

[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

A [Flarum](https://flarum.org) extension that manages **script blocks** and injects them into the forum pages **on the server** — while completely omitting them for excluded users and group members. Advertising, analytics, widgets — any HTML/JS.

## Features

- **Script blocks** — manage multiple blocks, each with a name, an on/off switch and ordering.
- **Placement per block:**
  - `head` — inside the page `<head>`;
  - `body` — before the closing `</body>`;
  - `widget` — rendered inside an [fof/forum-widgets-core](https://github.com/FriendsOfFlarum/forum-widgets-core) widget; the zone is configured in the fof widget editor (optional integration).
- **Exclusions** — users listed explicitly or members of the selected groups never receive the scripts: the code is not present in their HTML, not present in the page payload, and the widget endpoint returns them nothing. Nothing is loaded or executed in their browser.
- **Guests are never excluded** (by design) — they always receive the scripts.
- **Smart snippets** — a full snippet (with its own `<script>` tags) is inserted verbatim; raw JavaScript without a script tag is wrapped into one automatically.
- **Widget status** — when forum-widgets-core is disabled, `widget` blocks are marked "widget — off" in the admin list.
- **Validation** — JSON structure, block count, name safety and size limits are checked on save.

## Installation

```bash
composer require stezkoy/flarum-audex
php flarum cache:clear
```

Optional: for the "widget" placement install [fof/forum-widgets-core](https://github.com/FriendsOfFlarum/forum-widgets-core) (`composer require fof/forum-widgets-core`). Without it Audex works as head/body only.

## Usage

1. Enable the extension.
2. Open its settings page in the admin panel.
3. Add a block: paste your snippet exactly as provided (including the script tags), choose the placement, enable it.
4. For the `widget` placement: open **fof → Forum Widgets editor** and drag the Audex widget into the desired zone.
5. Configure exclusions: pick groups and/or specific users.
6. Remove the code you previously inserted manually — Audex takes care of it now.

Widget zones only render on the forum index page — that is a limitation of fof's widget sections, not of Audex.

> **Note:** inside JavaScript strings write `</script>` as `<\/script>`, otherwise the browser will terminate the script tag early (this is standard HTML parsing behaviour, not an extension limitation).

## How exclusion works

Flarum renders pages in PHP, so Audex knows the current user *before* the HTML is sent. For an excluded user the scripts are simply never added to the document — there is no hiding via CSS, no client-side tricks, no requests to the ad network. The same rule is enforced server-side by the widget content endpoint, and a per-page payload flag keeps the widget from even mounting for excluded users.

## Links

- [GitHub repository](https://github.com/Stezkoy/flarum-audex)

## License

[MIT](./LICENSE)
