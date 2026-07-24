# SimplePad

[![Vue.js](https://img.shields.io/badge/vue.js-3.x-brightgreen.svg)](https://vuejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![GitHub repo size](https://img.shields.io/github/repo-size/patriarxis/simplepad)

A minimalist rich-text notepad that auto-saves notes to your browser's local storage. No accounts, no cloud sync — just quick private notes on your device.

## Features

- Rich text editing (bold, italic, underline, strike, headings, lists, task lists, quotes, code, links)
- Highlight, superscript / subscript, text alignment
- Image insert (stored locally as data URLs)
- Floating format toolbar with Phosphor icons and hover tooltips
- Light / dark theme
- Auto-save to `localStorage`

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

Built assets use base path `/` (Vercel / custom domain root).
