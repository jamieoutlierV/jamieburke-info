# jamieburke.info

Interactive intellectual provenance graph — 37 nodes, 90+ causal connections across 5 eras of ideas from Convergence (2014) to Post Web (2026).

## Deploy to Vercel (5 minutes)

### 1. Push to GitHub

```bash
cd jamieburke-info
git init
git add .
git commit -m "Initial: intellectual provenance graph"
git remote add origin git@github.com:jamie247/jamieburke-info.git
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click **"Add New Project"**
3. Select the `jamieburke-info` repo
4. Vercel auto-detects Vite — just click **Deploy**
5. You'll get a URL like `jamieburke-info.vercel.app` immediately

### 3. Add custom domain

1. In Vercel dashboard → your project → **Settings → Domains**
2. Add `jamieburke.info`
3. Vercel will show you DNS records to add:
   - **Type:** `A` → **Value:** `76.76.21.21`
   - **Type:** `CNAME` (for www) → **Value:** `cname.vercel-dns.com`
4. Go to your domain registrar and add these DNS records
5. Vercel auto-provisions SSL — live at `https://jamieburke.info` within minutes

### 4. Auto-updates

Every push to `main` triggers a rebuild. When the agent system starts updating the graph data, it commits to this repo and the site auto-deploys.

## Local development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

## Architecture

- **Single-page React app** — all data embedded in `src/App.jsx`
- **No backend, no database** — pure static site
- **Vite** for build tooling
- **IBM Plex Mono** for typography
- **Zero ongoing cost** on Vercel free tier

## Future: Agent-maintained updates

The Corpus Agent System (see `Corpus_Agent_System_Architecture.md`) will:
1. Monitor Substack, X, OV Blog for new content
2. Classify and connect new nodes via LLM
3. Commit updated graph data to this repo
4. Vercel auto-rebuilds → live site updates

This turns jamieburke.info into a self-maintaining intellectual provenance graph.
