# jamieburke.info

The machine-readable intellectual provenance of Jamie Burke and Outlier Ventures — a verifiable record of ideas, investments, and predictions spanning 13 years (2013–2026).

A live knowledge graph for people and agents querying 400+ investments at the convergence of crypto, AI, IoT and the 3D web.

## v0.3 Features

- **Graph View** — 40 thesis nodes across 5 eras, expandable to show tweets and insights beneath each node
- **Feed View** — Every item chronologically, filterable by 14 categories
- **Insights View** — 12+ key insights from the Post Web thesis and Convergence papers
- **Thought Leadership Carousel** — 10 latest concepts including Conviction Markets, Cypherpunk Trinity, AI Trilemma, Intention Economy, Thin Web
- **Cross-linked** — Click any connection to navigate between nodes, tweets, and insights

## Local development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

## Deploy

Every push to `main` auto-deploys via Vercel.

```bash
git add .
git commit -m "v0.3: carousel, acceleration era, updated copy"
git push
```

## Architecture

- **Single-page React app** — all data embedded in `src/App.jsx`
- **No backend** — pure static site
- **Vite** for build tooling
- **Source Serif 4 + JetBrains Mono** typography
- **Zero ongoing cost** on Vercel free tier

## Future: Agent-maintained updates

The Corpus Agent System will monitor Substack, X, and OV Blog for new content, classify and connect new nodes, commit updated graph data to this repo, and Vercel auto-rebuilds.
