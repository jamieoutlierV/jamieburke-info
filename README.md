# Provenance Graph — Personal Intellectual Knowledge Graph

A machine-readable knowledge graph and website that maps your intellectual history into a verifiable, structured, agent-queryable format. Built with React + Vite, backed by Notion as CMS, deployed on Vercel.

Live example: jamieburke.info

## What This Is

A personal provenance system that maps your ideas, publications, investments, and media appearances across time, groups them into eras showing intellectual evolution, tracks vindication status (were predictions correct?), provides verification levels, and exposes structured data for LLMs and AI agents to query. Uses Notion as a live CMS.

Site tabs: Graph (thesis nodes by era), Feed (timeline of nodes + tweets), Media (podcasts, videos, news, events), Insights (quotable insights linked to nodes), About (overview and links).

## Architecture

Notion DB feeds fetch-notion.cjs at build time, which writes src/data.json, which the React app renders on Vercel.

## Setup Guide for Claude

Prompt: "I want to set up a Provenance Graph for my intellectual history. Here is the repo: [your-github-url]. Help me configure the Notion database, populate it with my content, and deploy it."

### Step 1: Create the Notion Database

Required Properties:
- Title (Title) — Name of the node
- Node ID (Text) — Unique slug e.g. pw1_2024, conv2016
- Date (Date) — When the idea/event occurred
- Era (Select) — Time period grouping
- Type (Select) — Thesis, Publication, Investment, Organisation, Product, Venture, Partnership, Programme, Event, Milestone, Project, Concept
- Themes (Multi-select) — Topic tags
- Pathway (Select) — Technology, Digital Art, Investment, Research
- Description (Text) — 2-4 sentence summary
- Source URL (URL) — Link to original source
- Source Channel (Select) — Substack, X/Twitter, LinkedIn, Blog, Research, Medium, External, Manual
- Verification Level (Select) — Unverified, Self-Attested, Externally Published, Independently Verified, On-Chain Attested
- Vindicated (Select) — Yes, No, Too Early, N/A
- Influenced By (Relation to self) — What earlier nodes influenced this
- Archived (Checkbox) — Hide from site without deleting
- Needs Review (Checkbox) — Flag for human review
- Agent Confidence (Number %) — Classification confidence

Media-specific Properties:
- Media Format (Select) — Podcast, Video, News, Event
- Platform (Text) — YouTube, Spotify, CoinDesk, etc.
- Role (Select) — Host, Guest, Conferences, Quoted

Era options (customise to your timeline):
- Proto-Thesis (brown), Convergence (green), Acceleration (blue), Open Metaverse (purple), Post Web (red)

### Step 2: Share Database with Notion Integration

1. Go to notion.so/my-integrations
2. Create new integration named "Provenance Graph"
3. Copy the Internal Integration Secret (starts with ntn_)
4. Open your Notion database, click ... menu, Connections, add your integration
5. Note your Database ID (32-char string in the database URL)

### Step 3: Clone and Configure

Clone the repo, run npm install. Edit scripts/fetch-notion.cjs and replace DATABASE_ID with your 32-character database ID.

### Step 4: Deploy to Vercel

1. Push repo to GitHub
2. Go to vercel.com, Add New Project, import your repo
3. Add Environment Variable: NOTION_API_KEY = your ntn_ key
4. Deploy. Build command runs fetch-notion.cjs then vite build automatically.

### Step 5: Custom Domain (Optional)

In Vercel Settings, Domains, add your domain. Set CNAME to cname.vercel-dns.com.

### Step 6: Populate with Claude

Give Claude Notion MCP access and ask it to:
1. Audit your existing content across Twitter, LinkedIn, Substack, publications
2. Create thesis nodes with appropriate era, type, themes, description
3. Map Influenced By connections showing idea evolution
4. Add media appearances with Media Format, Platform, Role
5. Verify claims by searching third-party sources
6. Check vindication of predictions

Useful prompts:

"Search for all my podcast appearances and conference talks from 2020-2025. Add each to Notion with Media Format, Platform, Role, Date, Era, Description, Source URL, and Verification Level."

"Review my Twitter archive and identify the 20 most significant tweets representing key positions. Create thesis nodes for ideas not yet in the graph."

"Audit for verification gaps. Which Self-Attested nodes could be upgraded to Externally Published or Independently Verified?"

## Customising the Frontend

Edit ERA_CONFIG in src/App.jsx to match your eras (name, color, date range). Edit CATEGORY_COLORS for your topic areas. Edit THOUGHT_LEADERSHIP array with your latest 5-10 key ideas for the carousel. Edit the About view for your background. Edit JSON-LD and hidden LLM context for agent discoverability.

## Maintenance

Edit in Notion, then trigger Vercel rebuild (push a commit or click Redeploy). Optional: set up Vercel Deploy Hook with a daily cron for automated rebuilds.

## File Structure

- index.html (entry point)
- package.json (deps and build scripts)
- scripts/fetch-notion.cjs (pulls Notion data at build)
- src/App.jsx (main React app, all tabs)
- src/data.json (generated at build from Notion)
- src/main.jsx (React entry)
- public/llms.txt (optional machine-readable summary)

## Troubleshooting

- Blank page: check Vercel build logs, ensure NOTION_API_KEY is set
- Nodes missing: ensure Node ID field is filled in Notion
- Media tab empty: ensure Media Format is set on media entries
- Feed crash: open browser console (Cmd+Option+J), usually null era on a node
- Stale data: trigger Vercel redeploy
- Build fail: check Notion integration has database access

## License

MIT

## Credits

Built across 6 Claude sessions for jamieburke.info. Co-developed by Jamie Burke (@jamie247) and Claude (Anthropic).
