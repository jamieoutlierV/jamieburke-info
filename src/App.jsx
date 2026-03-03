import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import graphData from "./data.json";

// ═══════════════════════════════════════════════════════
// DATA: Thesis nodes from Notion, tweets + insights still inline
// ═══════════════════════════════════════════════════════

const THESIS_NODES = graphData.nodes.map(n => ({
  id: n.nodeId,
  title: n.title,
  date: n.date,
  era: n.era,
  type: n.type,
  themes: n.themes || [],
  pathway: n.pathway,
  description: n.description || "",
  vindicated: n.vindicated || "N/A",
  verificationLevel: n.verificationLevel || "Unverified",
  connections: n.connections || [],
  sourceUrl: n.sourceUrl || null,
}));

// ═══════════════════════════════════════════════════════
// THOUGHT LEADERSHIP CAROUSEL — 10 latest concepts
// ═══════════════════════════════════════════════════════

const THOUGHT_LEADERSHIP = [
  {
    id: "tl1", label: "Conviction Markets", era: "Post Web",
    headline: "Prediction markets are cool and all but… have you heard of conviction markets?",
    body: "No exit button — you commit to an outcome and wait. Conviction over speculation. Real belief, real stakes. Agent-native: agents express and stake long-term beliefs. Bridges prediction markets with reputation systems and agent economies.",
    source: "@jamie247 / LinkedIn", sourceUrl: "https://x.com/jamie247", date: "2025",
    relatedNodes: ["conviction2025","newera2025"],
  },
  {
    id: "tl2", label: "The Cypherpunk Trinity", era: "Post Web",
    headline: "Every stack governed by equity will be coerced, captured, politicised. The only stack you will want is a sovereign stack.",
    body: "Three pillars: Sovereign Money (censorship-resistant value transfer), Sovereign Speech (uncensorable communication), Sovereign Privacy (verifiable yet private identity). After a decade of financialisation, crypto must remember WHY it exists.",
    source: "jamie247.substack.com", sourceUrl: "https://jamie247.substack.com", date: "2025",
    relatedNodes: ["cypherpunk2025","ob2014"],
  },
  {
    id: "tl3", label: "The AI Trilemma", era: "Post Web",
    headline: "Nick Land elegantly presents us with an AI Trilemma.. To progress, we must abandon one belief.",
    body: "A fundamental constraint facing AI development. Three properties in tension — to advance, one must be sacrificed. The trilemma frames the philosophical and political choices societies will face as AI scales.",
    source: "@jamie247", sourceUrl: "https://x.com/jamie247/status/2011543895344365962", date: "2026-01",
    relatedNodes: ["pw1_2024"],
  },
  {
    id: "tl4", label: "The Intention Economy", era: "Post Web",
    headline: "In the early 90s Doc Searls predicted an internet optimised for user intent. Only now — through AI agents and crypto rails — can we realise it.",
    body: "Value accrual shifts from extracting attention (process) to resolving intent (outcome). The economic logic of the internet inverts. Intent-based agents protect user interests from the start, personalise interactions, and proactively optimise resources.",
    source: "jamie247.substack.com", sourceUrl: "https://jamie247.substack.com", date: "2025",
    relatedNodes: ["pw1_2024","pw2_2024"],
  },
  {
    id: "tl5", label: "The Thin Web", era: "Post Web",
    headline: "The web doesn't disappear entirely. A 'Thin Web' persists for human experiences aligned with Maslow's higher needs.",
    body: "Basic needs handled by agents. Social, self-actualisation, creativity — the Thin Web. Gaming, art, community: pure Thin Web. Digital arts occupy the highest tier. Transactional web use shrinks; experiential use persists or grows.",
    source: "Post Web Ch.1", sourceUrl: "https://postweb.io", date: "2024",
    relatedNodes: ["pw1_2024","adai2025"],
  },
  {
    id: "tl6", label: "Systems not Startups", era: "Post Web",
    headline: "The Post Web's increasingly agentic protocols will outperform on every dimension.",
    body: "Peter Thiel's 'Zero to One' monopoly thesis gives way to 'Zero to Many' — distributed, AI-driven, modular systems replacing monolithic startups. Value comes from network orchestration, not monopoly capture.",
    source: "@jamie247", sourceUrl: "https://x.com/jamie247/status/1958948754972692493", date: "2025-08",
    relatedNodes: ["pw3_2025","newera2025"],
  },
  {
    id: "tl7", label: "Read. Write. Own. Delegate.", era: "Post Web",
    headline: "The Post Web adds 'delegate' as the fourth functional layer of the internet.",
    body: "Web1: Read. Web2: Write. Web3: Own. Post Web: Delegate. As you delegate more agency to machines each day, it's never been more critical to understand the philosophy of agency — free will, moral responsibility, intention, ethics.",
    source: "Post Web Ch.1", sourceUrl: "https://postweb.io", date: "2024",
    relatedNodes: ["pw1_2024"],
  },
  {
    id: "tl8", label: "Capitalism IS AI", era: "Post Web",
    headline: "'Capitalism IS artificial intelligence' — once programmable digital property rights combine with agentic intent-based architectures, this will become obvious.",
    body: "Intent being the key word. The computable economy is the end-state: everything in the digital economy becomes computable. Digital assets become true commodities with real supply/demand dynamics, mediated by agents.",
    source: "@jamie247", sourceUrl: "https://x.com/jamie247", date: "2025",
    relatedNodes: ["pw2_2024","conviction2025"],
  },
  {
    id: "tl9", label: "The Verifiability Premium", era: "Post Web",
    headline: "In an agent-driven economy, verifiable proof via DL
