# Audex

[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

A [Flarum](https://flarum.org) extension that manages **ad script blocks** and injects them into the forum pages **on the server** — while completely omitting them for excluded users and group members.

## Features

- Manage multiple ad script blocks (any HTML/JS snippet: AdSense, Yandex RSYA, etc.).
- Per-block placement: inside `<head>` or before the closing `</body>`.
- Per-block on/off switch, reordering.
- **Exclusions**: users listed explicitly or members of the selected groups never receive the scripts — the code is not present in their HTML at all, so nothing is loaded or executed in their browser.
- Guests always see ads (by design).
- Settings are validated on save (JSON structure, sizes, safe names).

## Installation

```bash
composer require stezkoy/flarum-audex
```

## Usage

1. Enable the extension.
2. Open its settings page in the admin panel.
3. Add a block: paste the full snippet **exactly as provided by your ad network** (including the `<script>` tags), choose the placement, enable it.
4. Configure exclusions: pick groups and/or specific users.
5. Remove the ad code you previously inserted manually — Audex takes care of it now.

> **Note:** inside JavaScript strings write `</script>` as `<\/script>`, otherwise the browser will terminate the script tag early (this is standard HTML parsing behaviour, not an extension limitation).

## How exclusion works

Flarum renders pages in PHP, so Audex knows the current user *before* the HTML is sent. For an excluded user the scripts are simply never added to the document — there is no hiding via CSS, no client-side tricks, no requests to the ad network.

## Links

- [GitHub repository](https://github.com/Stezkoy/flarum-audex)

## License

[MIT](./LICENSE)
