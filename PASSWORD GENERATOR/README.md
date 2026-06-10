# Password Generator

A secure, client-side password generator built with React and Vite. All password generation happens locally in your browser — no data is sent over the network.

## Features

- **Cryptographically secure** — Uses `crypto.getRandomValues()` with rejection sampling to avoid modulo bias
- **Customizable character sets** — Toggle uppercase, lowercase, numbers, and special characters independently
- **Adjustable length** — Slide from 8 to 64 characters
- **Copy to clipboard** — One-click copy with optional auto-clear after 15 seconds
- **Show/Hide toggle** — Reveal your password without peeking shoulders
- **Auto-destroy** — Password is automatically cleared after 60 seconds of inactivity
- **HTTPS warning** — Alerts when served over HTTP in production
- **DevTools resistant** — Password stored in a React ref, not state, to prevent exposure via React DevTools

## Security

- No password is ever stored in React state — only in a `useRef` to minimize exposure
- The clipboard can be optionally auto-cleared 15 seconds after copying
- A `Content-Security-Policy` meta tag is included to restrict resource loading
- An `X-Content-Type-Options: nosniff` equivalent and `no-referrer` policy are applied

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

## Lint

```bash
npm run lint
```

## Deployment

For production, serve over HTTPS and set the following HTTP response headers:

```
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

## Tech Stack

- [React](https://react.dev) — UI framework
- [Vite](https://vitejs.dev) — Build tool and dev server
- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
