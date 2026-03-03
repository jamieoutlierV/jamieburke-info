import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import graphData from "./data.json";

// ═══════════════════════════════════════════════════════════════
// DATA: Thesis nodes from Notion, tweets + insights still inline
// ═══════════════════════════════════════════════════════════════

const THESIS_NODES = graphData.nodes.filter(n => !n.mediaFormat).map(n => ({
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

const MEDIA_NODES = graphData.nodes.filter(n => n.mediaFormat).map(n => ({
  id: n.nodeId,
  title: n.title,
  date: n.date,
  era: n.era,
  type: n.type,
  themes: n.themes || [],
  pathway: n.pathway,
  description: n.description || "",
  sourceUrl: n.sourceUrl || null,
  sourceChannel: n.sourceChannel || null,
  mediaFormat: n.mediaFormat,
  platform: n.platform || "",
  role: n.role || null,
  verificationLevel: n.verificationLevel || "Unverified",
  needsReview: n.needsReview || false,
  connections: n.connections || [],
}));

// ═══════════════════════════════════════════════════════════════
// THOUGHT LEADERSHIP CAROUSEL — 10 latest concepts
// ═══════════════════════════════════════════════════════════════

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
    headline: "In an agent-driven economy, verifiable proof via DLT outranks brand.",
    body: "If an outcome can't be proven, an agent will choose a competitor. Every interaction has high provenance — transparent and traceable through decentralised ledgers. This is why crypto matters in the agent era: not for speculation, but for machine-readable trust.",
    source: "Post Web Ch.2", sourceUrl: "https://postweb.io", date: "2024",
    relatedNodes: ["pw2_2024"],
  },
  {
    id: "tl10", label: "Bias as Programmable Input", era: "Post Web",
    headline: "In the Post Web, user bias becomes a tunable parameter — not an error to correct but a differentiation mechanism.",
    body: "This connects to the Cypherpunk Trinity: sovereign individuals choose how their agents interpret the world. Bias isn't eliminated — it's made explicit, programmable, and owned. Your agent reflects YOUR values, not a platform's.",
    source: "Deep Extension", sourceUrl: "https://postweb.io", date: "2025",
    relatedNodes: ["pw2_2024","cypherpunk2025"],
  },
];

// Representative tweets from @jamie247 Twitter Archive
const TWEETS = [
  { id: "t1", text: "Systems not s̶t̶a̶r̶t̶u̶p̶s̶ — The Post Web's, increasingly agentic protocols, will outperform on every dimension.", date: "2025-08-22", categories: ["Post Web","AI & Agents","Crypto & Web3"], likes: 4, url: "https://x.com/jamie247/status/1958948754972692493", relatedNodes: ["pw2_2024","newera2025"] },
  { id: "t2", text: "Working thesis for crypto: Decentralization as constraint 🌐 Exit as selection 🚪 aka getting back to cypherpunk shit", date: "2026-01-20", categories: ["Crypto & Web3","Politics & Society"], likes: 3, url: "https://x.com/jamie247/status/2013633623241392218", relatedNodes: ["cypherpunk2025"] },
  { id: "t3", text: "A NEW PARADIGM FOR CRYPTO A NEW ERA FOR OUTLIER VENTURES.. Just as we predicted back in 2017 the agentic internet is upon us and converging with crypto.", date: "2025-07-24", categories: ["Crypto & Web3","AI & Agents","Post Web"], likes: 0, url: "#", relatedNodes: ["newera2025","conv2016"] },
  { id: "t4", text: "Few moats in the Post Web 😂", date: "2025-11-15", categories: ["Post Web"], likes: 0, url: "#", relatedNodes: ["pw1_2024","pw2_2024"] },
  { id: "t5", text: "We don't just have a vision for a Post Web, we have a playbook and practical guide for founders.. 📕", date: "2025-10-01", categories: ["Post Web","VC & Startups"], likes: 0, url: "#", relatedNodes: ["pw3_2025"] },
  { id: "t6", text: "Ask your LLM who was the 1st person talking about blockchain enabled convergence.. just sayin", date: "2025-12-01", categories: ["Convergence"], likes: 0, url: "#", relatedNodes: ["conv2016"] },
  { id: "t7", text: "One of the great things about digital art today is that it generally supports living artists.", date: "2025-09-15", categories: ["NFTs & Digital Art","ADAI"], likes: 0, url: "#", relatedNodes: ["adai2025","nft_social_2021"] },
  { id: "t8", text: "The paradox that's reshaping crypto: IT'S NEVER BEEN EASIER TO LAUNCH A TOKEN, BUT IT'S NEVER BEEN HARDER TO INVEST IN THEM. Supply has outpaced demand. Markets are overwhelmed. Capital is diffuse. But this chaos is the biggest opportunity we've seen in crypto in 11+ years 👀", date: "2025-09-10", categories: ["Crypto & Web3","VC & Startups"], likes: 0, url: "#", relatedNodes: ["conviction2025","newera2025"] },
  { id: "t9", text: "There is such a big disconnect between what investors are saying in public and in private. Public comms offering a constant state of hopium. In private most are confused, ambivalent and passive. At @OVioHQ we tell you as it is..", date: "2025-08-15", categories: ["VC & Startups","Crypto & Web3"], likes: 0, url: "#", relatedNodes: ["dear2022","newera2025"] },
  { id: "t10", text: "'The Digital Arts Paradox' — @refikanadol's brilliant Tunnel shows us The Digital Arts can be both radically democratised in creation and distribution but exclusionary at the level of scale, space & infrastructure. But what to do about it?", date: "2025-11-01", categories: ["NFTs & Digital Art","ADAI"], likes: 0, url: "#", relatedNodes: ["adai2025"] },
  { id: "t11", text: "New Substack: Catastrophic Risk, Securitisation and the Return of Leviathan. AI and Two Pathways to Totalitarianism.", date: "2025-12-10", categories: ["Human & Machine","Philosophy & Consciousness"], likes: 0, url: "#", relatedNodes: ["pw1_2024"] },
  { id: "t12", text: "30 days on Substack, 10 essays in. Follow for considered takes on the evolving relationship between the human and the machine; not AI purely as a technical system but a cultural and psychological mirror.", date: "2026-01-15", categories: ["Human & Machine"], likes: 0, url: "#", relatedNodes: [] },
  { id: "t13", text: "NEW SUBSTACK: Why the Intention Economy might finally be here! In the early 90's Doc Searls predicted an internet optimized for user intent, but instead we got attention and advertising. Only now through AI agents and crypto rails can we realise it.", date: "2025-11-20", categories: ["Post Web","AI & Agents"], likes: 0, url: "#", relatedNodes: ["pw1_2024","pw2_2024"] },
  { id: "t14", text: "The institutionalisation of crypto is a new era, with different rules, opportunities and risks. Honestly, I personally feel it's going to be very bumpy but its inevitability means we all need to figure out the new playbook and quickly.", date: "2025-07-01", categories: ["Crypto & Web3","VC & Startups"], likes: 0, url: "#", relatedNodes: ["newera2025"] },
  { id: "t15", text: "A truly smart phone for the Post Web 📱", date: "2025-10-20", categories: ["Post Web"], likes: 0, url: "#", relatedNodes: ["pw2_2024"] },
  { id: "t16", text: "Nick Land elegantly presents us with an AI Trilemma.. To progress, we must abandon one belief.", date: "2026-01-14", categories: ["AI & Agents","Philosophy & Consciousness"], likes: 36, url: "https://x.com/jamie247/status/2011543895344365962", relatedNodes: ["pw1_2024"] },
  { id: "t17", text: "Every stack governed and controlled by equity will be coerced, captured, politicised. The only stack YOU will want is a sovereign stack. The only politics will be Cypherpunk.", date: "2026-01-18", categories: ["Crypto & Web3","Politics & Society"], likes: 0, url: "#", relatedNodes: ["cypherpunk2025"] },
  { id: "t18", text: "'Capitalism IS artificial intelligence' — Once programmable digital property rights are combined with agentic intent based architectures (at scale) this elegant statement will come a lot more obvious to everyone. 'Intent' being the key word here.", date: "2025-11-25", categories: ["Post Web","AI & Agents"], likes: 0, url: "#", relatedNodes: ["pw2_2024","conviction2025"] },
  { id: "t19", text: "As you delegate and devolve more and more of your agency to machines each day (be it LLMs or agents) ..it's never been more critical for you to understand the philosophy of 'agency'; free will, moral responsibility, intention, and ethics, from Aristotle through Aquinas to Kant.", date: "2025-12-05", categories: ["Human & Machine","Philosophy & Consciousness","AI & Agents"], likes: 0, url: "#", relatedNodes: ["pw1_2024"] },
  { id: "t20", text: "New article: Has crypto failed to deliver on the promise of a decentralized internet for everything? All tokens are meme coins. And the Web largely looks the same. But might the Intention Economy change all that? 🏴‍☠️", date: "2025-11-22", categories: ["Post Web","Crypto & Web3"], likes: 0, url: "#", relatedNodes: ["pw1_2024","pw2_2024"] },
  { id: "t21", text: "Crypto rn is all about K.I.S.S. 💋", date: "2025-08-05", categories: ["Crypto & Web3"], likes: 0, url: "#", relatedNodes: ["conviction2025"] },
  { id: "t22", text: "Building RWA markets is hard. The interesting thing about DATs (Digital Asset Treasuries) is that they could theoretically bootstrap liquidity for emerging RWA markets on a given network. Allowing institutional money to get direct and indirect exposure to a network's growth.", date: "2025-10-15", categories: ["Crypto & Web3","DeFi"], likes: 0, url: "#", relatedNodes: ["newera2025"] },
];

// Key insights from the Master Insight List
const KEY_INSIGHTS = [
  { id: "i1", text: "The Post Web is not Web4 — it is a paradigm so radical it forces a complete reimagining of the Web itself.", source: "Post Web Ch.1", sourceUrl: "https://postweb.io", relatedNodes: ["pw1_2024"] },
  { id: "i2", text: "Read. Write. Own. Delegate. — The Post Web adds 'delegate' as the fourth functional layer of the internet.", source: "Post Web Ch.1", sourceUrl: "https://postweb.io", relatedNodes: ["pw1_2024"] },
  { id: "i3", text: "Web3 was a human sandbox for machines — early adopters were beta testers, readying protocols for the real intended users: AI agents.", source: "Post Web Ch.1", sourceUrl: "https://postweb.io", relatedNodes: ["pw1_2024","fetch2018"] },
  { id: "i4", text: "From Attention to Intention Economy — The Post Web flips from extracting user attention to optimally fulfilling user intent.", source: "Post Web Ch.2", sourceUrl: "https://postweb.io", relatedNodes: ["pw2_2024"] },
  { id: "i5", text: "The Verifiability Premium — In an agent-driven economy, verifiable proof via DLT outranks brand.", source: "Post Web Ch.2", sourceUrl: "https://postweb.io", relatedNodes: ["pw2_2024"] },
  { id: "i6", text: "Platform monopolies lead to data monopolies, and they ultimately lead to AI monopolies.", source: "Convergence Ecosystem 2.0", sourceUrl: "https://outlierventures.io/research/the-convergence-ecosystem/", relatedNodes: ["stack2018","conv2016"] },
  { id: "i7", text: "Crypto is not based on adoption of currencies, but enabling bots to conduct economic activity.", source: "Fetch.AI thesis", sourceUrl: "https://fetch.ai", relatedNodes: ["fetch2018","defi2_2020"] },
  { id: "i8", text: "NFTs are a form of social currency — not just about the money, it's much more sustainable.", source: "CoinDesk Interview", sourceUrl: "https://www.coindesk.com/markets/2021/03/07/how-nfts-became-art-and-everything-became-an-nft", relatedNodes: ["nft_social_2021"] },
  { id: "i9", text: "DLT is 'machine money' — a coordination layer for deterministic execution of transactional economic activity by machines.", source: "Post Web Ch.1", sourceUrl: "https://postweb.io", relatedNodes: ["pw1_2024","conv2016"] },
  { id: "i10", text: "DeAI and DePIN are mature categories — over 210 startups with publicly traded tokens, $50B+ combined market cap.", source: "Post Web Ch.1", sourceUrl: "https://postweb.io", relatedNodes: ["pw1_2024","iota2017","ocean2017"] },
  { id: "i11", text: "The Zero to Many model replaces Zero to One — in the Post Web, value comes from network orchestration, not monopoly capture.", source: "Post Web Ch.3", sourceUrl: "https://postweb.io", relatedNodes: ["pw3_2025"] },
  { id: "i12", text: "Tokens are the first native coordination mechanism for the digital and now machine economy.", source: "Convergence Thesis 2016", sourceUrl: "https://outlierventures.io/research/blockchain-enabled-convergence/", relatedNodes: ["conv2016","cte2017"] },
];

const ERA_CONFIG = {
  "Proto-Thesis": { color: "#A0522D", bg: "rgba(160,82,45,0.08)", label: "2014–2016" },
  "Convergence": { color: "#2E8B57", bg: "rgba(46,139,87,0.08)", label: "2016–2018" },
  "Acceleration": { color: "#4169E1", bg: "rgba(65,105,225,0.08)", label: "2019–2020" },
  "Open Metaverse": { color: "#7B68EE", bg: "rgba(123,104,238,0.08)", label: "2021–2023" },
  "Post Web": { color: "#DC3545", bg: "rgba(220,53,69,0.08)", label: "2024–2026" },
};

const CATEGORY_COLORS = {
  "Post Web": "#DC3545", "AI & Agents": "#8B5CF6", "Crypto & Web3": "#F59E0B",
  "NFTs & Digital Art": "#EC4899", "DeFi": "#10B981", "Identity & SSI": "#06B6D4",
  "Metaverse & VR": "#6366F1", "VC & Startups": "#84CC16", "Politics & Society": "#6B7280",
  "Philosophy & Consciousness": "#A855F7", "ADAI": "#D97706", "Human & Machine": "#0EA5E9",
  "Convergence": "#059669", "Other": "#9CA3AF",
};

const TYPE_ICONS = {
  "Thesis": "◆", "Publication": "◇", "Investment": "●", "Organisation": "■",
  "Product": "▲", "Venture": "▽", "Partnership": "◈", "Programme": "◎",
  "Event": "★", "Milestone": "⬟", "Project": "⬡", "Concept": "◉",
};

const VINDICATION_ICONS = { "Yes": "✅", "No": "❌", "Too Early": "🔮", "N/A": "—" };

const MEDIA_FORMAT_ICONS = { "Podcast": "🎙", "Video": "🎬", "News": "📰", "Event": "🎤" };
const MEDIA_FORMAT_COLORS = { "Podcast": "#8B5CF6", "Video": "#3B82F6", "News": "#10B981", "Event": "#F59E0B" };

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

function ThoughtLeadershipCarousel({ onNodeClick }) {
  const scrollRef = useRef(null);
  const carouselRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Only run the timer when carousel is visible in viewport
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isHovered || !isVisible) return;
    const timer = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % THOUGHT_LEADERSHIP.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [isHovered, isVisible]);

  return (
    <div ref={carouselRef} style={{ marginBottom: 20 }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 8,
      }}>
        <span style={{
          fontSize: 9, color: "#555", fontFamily: "'JetBrains Mono', monospace",
          textTransform: "uppercase", letterSpacing: "0.12em",
        }}>Latest Thought Leadership</span>
        <div style={{ display: "flex", gap: 3 }}>
          {THOUGHT_LEADERSHIP.map((_, i) => (
            <button key={i} onClick={() => setActiveIdx(i)} style={{
              width: i === activeIdx ? 16 : 6, height: 6, borderRadius: 3,
              background: i === activeIdx ? "#DC3545" : "rgba(255,255,255,0.12)",
              border: "none", cursor: "pointer", transition: "all 0.3s",
              padding: 0,
            }} />
          ))}
        </div>
      </div>

      <div
        ref={scrollRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: "flex", gap: 10, overflowX: "auto", scrollBehavior: "smooth",
          scrollbarWidth: "none", msOverflowStyle: "none",
          paddingBottom: 4,
          minHeight: 200,
        }}
      >
        {THOUGHT_LEADERSHIP.map((item, i) => (
          <div
            key={item.id}
            onClick={() => setActiveIdx(i)}
            style={{
              minWidth: 280, maxWidth: 320, flex: "0 0 auto",
              padding: "14px 16px",
              background: i === activeIdx
                ? "linear-gradient(135deg, rgba(220,53,69,0.08) 0%, rgba(220,53,69,0.02) 100%)"
                : "rgba(255,255,255,0.015)",
              border: `1px solid ${i === activeIdx ? "rgba(220,53,69,0.25)" : "rgba(255,255,255,0.05)"}`,
              borderRadius: 6, cursor: "pointer",
              transition: "all 0.3s",
              opacity: i === activeIdx ? 1 : 0.55,
              transform: i === activeIdx ? "scale(1)" : "scale(0.97)",
              display: "flex", flexDirection: "column",
            }}
          >
            <div style={{
              display: "flex", alignItems: "center", gap: 6, marginBottom: 6,
            }}>
              <span style={{
                fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
                color: "#DC3545", fontWeight: 500, textTransform: "uppercase",
                letterSpacing: "0.08em",
                background: "rgba(220,53,69,0.1)", padding: "2px 6px", borderRadius: 2,
              }}>{item.label}</span>
              <span style={{
                fontSize: 9, color: "#444", fontFamily: "'JetBrains Mono', monospace",
              }}>{item.date}</span>
            </div>

            <div style={{
              fontSize: 13, color: "#D4D4D4", lineHeight: 1.5, marginBottom: 8,
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontStyle: "italic",
              display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              "{item.headline}"
            </div>

            <div style={{
              fontSize: 11, color: "#888", lineHeight: 1.55, marginBottom: 8,
              fontFamily: "'Source Serif 4', Georgia, serif",
              maxHeight: i === activeIdx ? 200 : 0,
              overflow: "hidden",
              opacity: i === activeIdx ? 1 : 0,
              transition: "max-height 0.3s ease, opacity 0.3s ease",
            }}>
              {item.body}
            </div>

            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {item.relatedNodes.map(nid => {
                const node = THESIS_NODES.find(n => n.id === nid);
                if (!node) return null;
                return (
                  <button key={nid} onClick={(e) => { e.stopPropagation(); onNodeClick(nid); }} style={{
                    background: "none", border: `1px solid ${ERA_CONFIG[node.era]?.color || "#555"}22`,
                    color: ERA_CONFIG[node.era]?.color || "#888", fontSize: 8, padding: "1px 4px",
                    borderRadius: 2, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
                  }}>→ {node.title.slice(0, 22)}{node.title.length > 22 ? "…" : ""}</button>
                );
              })}
              <a href={item.sourceUrl} target="_blank" rel="noopener" onClick={e => e.stopPropagation()} style={{
                fontSize: 8, color: "#444", fontFamily: "'JetBrains Mono', monospace",
                marginLeft: "auto", alignSelf: "center", textDecoration: "none",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#DC3545"}
              onMouseLeave={e => e.currentTarget.style.color = "#444"}
              >↗ {item.source}</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryPill({ name, small }) {
  const c = CATEGORY_COLORS[name] || "#666";
  return (
    <span style={{
      display: "inline-block", padding: small ? "1px 6px" : "2px 8px",
      fontSize: small ? 9 : 10, borderRadius: 3, marginRight: 4, marginBottom: 2,
      background: c + "18", color: c, border: `1px solid ${c}33`,
      fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.02em",
    }}>{name}</span>
  );
}

function TweetCard({ tweet, onNodeClick }) {
  return (
    <div style={{
      padding: "14px 16px", marginBottom: 8,
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 4, transition: "border-color 0.2s",
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"}
    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}
    >
      <div style={{ fontSize: 13, color: "#E0E0E0", lineHeight: 1.55, marginBottom: 8, fontFamily: "'Source Serif 4', Georgia, serif" }}>
        {tweet.text}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, color: "#666", fontFamily: "'JetBrains Mono', monospace" }}>
          {tweet.date}
        </span>
        {tweet.likes > 0 && (
          <span style={{ fontSize: 10, color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>
            ♡ {tweet.likes}
          </span>
        )}
        {tweet.categories.map(c => <CategoryPill key={c} name={c} small />)}
        {tweet.url && tweet.url !== "#" && (
          <a href={tweet.url} target="_blank" rel="noopener noreferrer" style={{
            fontSize: 10, color: "#555", textDecoration: "none", marginLeft: "auto",
            fontFamily: "'JetBrains Mono', monospace",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#DC3545"}
          onMouseLeave={e => e.currentTarget.style.color = "#555"}
          >↗ x.com</a>
        )}
      </div>
      {tweet.relatedNodes?.length > 0 && (
        <div style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
          {tweet.relatedNodes.map(nid => {
            const node = THESIS_NODES.find(n => n.id === nid);
            if (!node) return null;
            return (
              <button key={nid} onClick={() => onNodeClick(nid)} style={{
                background: "none", border: `1px solid ${ERA_CONFIG[node.era]?.color || "#555"}33`,
                color: ERA_CONFIG[node.era]?.color || "#888", fontSize: 9, padding: "1px 5px",
                borderRadius: 2, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
              }}>
                {TYPE_ICONS[node.type]} {node.title.slice(0, 30)}{node.title.length > 30 ? "…" : ""}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InsightCard({ insight, onNodeClick }) {
  return (
    <div style={{
      padding: "12px 16px", marginBottom: 6,
      background: "rgba(220,53,69,0.03)", borderLeft: "2px solid rgba(220,53,69,0.3)",
      borderRadius: "0 4px 4px 0",
    }}>
      <div style={{ fontSize: 13, color: "#D4D4D4", lineHeight: 1.55, fontStyle: "italic", fontFamily: "'Source Serif 4', Georgia, serif" }}>
        "{insight.text}"
      </div>
      <div style={{ fontSize: 10, color: "#666", marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
        — {insight.sourceUrl ? (
          <a href={insight.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#666", textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.color = "#DC3545"}
            onMouseLeave={e => e.currentTarget.style.color = "#666"}
          >{insight.source} ↗</a>
        ) : insight.source}
      </div>
    </div>
  );
}

function ThesisNodeCard({ node, expanded, onToggle, relatedTweets, relatedInsights, onNodeClick }) {
  const era = ERA_CONFIG[node.era];
  return (
    <div style={{
      marginBottom: expanded ? 16 : 6, border: `1px solid ${expanded ? era.color + "44" : "rgba(255,255,255,0.06)"}`,
      borderRadius: 6, overflow: "hidden", transition: "all 0.3s",
      background: expanded ? era.bg : "transparent",
    }}>
      <button onClick={onToggle} style={{
        width: "100%", padding: "12px 16px", background: "none", border: "none",
        cursor: "pointer", textAlign: "left", display: "flex", alignItems: "flex-start", gap: 10,
      }}>
        <span style={{ color: era.color, fontSize: 14, flexShrink: 0, marginTop: 2 }}>
          {TYPE_ICONS[node.type]}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 14, color: "#E8E8E8", fontWeight: 600, fontFamily: "'Source Serif 4', Georgia, serif" }}>
              {node.sourceUrl ? (
                <a href={node.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: "#E8E8E8", textDecoration: "none" }}
                  onMouseEnter={e => e.currentTarget.style.color = era.color}
                  onMouseLeave={e => e.currentTarget.style.color = "#E8E8E8"}
                >{node.title} ↗</a>
              ) : node.title}
            </span>
            <span style={{ fontSize: 11, marginLeft: "auto", flexShrink: 0 }}>
              {VINDICATION_ICONS[node.vindicated]}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, color: era.color, fontFamily: "'JetBrains Mono', monospace" }}>
              {node.date}
            </span>
            <span style={{ fontSize: 10, color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>
              {node.era}
            </span>
            {node.pathway && (
              <span style={{ fontSize: 9, color: "#666", padding: "0 4px", background: "rgba(255,255,255,0.04)", borderRadius: 2, fontFamily: "'JetBrains Mono', monospace" }}>
                {node.pathway}
              </span>
            )}
          </div>
        </div>
        <span style={{ color: "#555", fontSize: 12, flexShrink: 0, transition: "transform 0.2s", transform: expanded ? "rotate(90deg)" : "none" }}>
          ▶
        </span>
      </button>

      {expanded && (
        <div style={{ padding: "0 16px 16px" }}>
          <p style={{ fontSize: 12, color: "#AAA", lineHeight: 1.6, margin: "0 0 12px 24px", fontFamily: "'Source Serif 4', Georgia, serif" }}>
            {node.description}
          </p>

          {node.verificationLevel && (
            <div style={{ fontSize: 10, color: "#666", marginLeft: 24, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
              Verification: <span style={{ color: node.verificationLevel === "Independently Verified" ? "#2E8B57" : node.verificationLevel === "Externally Published" ? "#4169E1" : "#888" }}>
                {node.verificationLevel}
              </span>
            </div>
          )}

          {node.connections.length > 0 && (
            <div style={{ marginLeft: 24, marginBottom: 10 }}>
              <span style={{ fontSize: 10, color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>Influenced by: </span>
              {node.connections.map(cid => {
                const cn = THESIS_NODES.find(n => n.id === cid);
                return cn ? (
                  <button key={cid} onClick={() => onNodeClick(cid)} style={{
                    background: "none", border: `1px solid ${ERA_CONFIG[cn.era]?.color}22`,
                    color: ERA_CONFIG[cn.era]?.color, fontSize: 9, padding: "1px 5px",
                    borderRadius: 2, cursor: "pointer", marginRight: 4, marginBottom: 2,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>← {cn.title.slice(0, 25)}{cn.title.length > 25 ? "…" : ""}</button>
                ) : null;
              })}
            </div>
          )}

          {relatedInsights.length > 0 && (
            <div style={{ marginLeft: 24, marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: "#555", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Key Insights ({relatedInsights.length})
              </div>
              {relatedInsights.map(i => <InsightCard key={i.id} insight={i} onNodeClick={onNodeClick} />)}
            </div>
          )}

          {relatedTweets.length > 0 && (
            <div style={{ marginLeft: 24 }}>
              <div style={{ fontSize: 10, color: "#555", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Tweets & Evidence ({relatedTweets.length})
              </div>
              {relatedTweets.map(t => <TweetCard key={t.id} tweet={t} onNodeClick={onNodeClick} />)}
            </div>
          )}

          {relatedTweets.length === 0 && relatedInsights.length === 0 && (
            <div style={{ marginLeft: 24, fontSize: 11, color: "#444", fontStyle: "italic" }}>
              No tweets or insights linked yet — the Corpus Agent System will populate this automatically.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MEDIA CARD COMPONENT
// ═══════════════════════════════════════════════════════════════

function MediaCard({ item }) {
  const fmtColor = MEDIA_FORMAT_COLORS[item.mediaFormat] || "#888";
  const fmtIcon = MEDIA_FORMAT_ICONS[item.mediaFormat] || "📎";
  const eraColor = ERA_CONFIG[item.era]?.color || "#888";

  return (
    <div style={{
      padding: "14px 16px", marginBottom: 8,
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 4, borderLeft: `3px solid ${fmtColor}`,
      transition: "border-color 0.2s",
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.borderLeftColor = fmtColor; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderLeftColor = fmtColor; }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>{fmtIcon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: "#E0E0E0", fontWeight: 600, lineHeight: 1.4, marginBottom: 4, fontFamily: "'Source Serif 4', Georgia, serif" }}>
            {item.sourceUrl ? (
              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#E0E0E0", textDecoration: "none" }}
                onMouseEnter={e => e.currentTarget.style.color = fmtColor}
                onMouseLeave={e => e.currentTarget.style.color = "#E0E0E0"}
              >{item.title} ↗</a>
            ) : item.title}
          </div>

          {item.description && (
            <div style={{
              fontSize: 11, color: "#888", lineHeight: 1.5, marginBottom: 6,
              fontFamily: "'Source Serif 4', Georgia, serif",
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {item.description}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, color: eraColor, fontFamily: "'JetBrains Mono', monospace" }}>
              {item.date}
            </span>
            <span style={{
              fontSize: 9, color: fmtColor, fontFamily: "'JetBrains Mono', monospace",
              padding: "1px 5px", background: fmtColor + "15", borderRadius: 2,
              border: `1px solid ${fmtColor}25`,
            }}>
              {item.mediaFormat}
            </span>
            {item.role && (
              <span style={{
                fontSize: 9, color: "#777", fontFamily: "'JetBrains Mono', monospace",
                padding: "1px 5px", background: "rgba(255,255,255,0.04)", borderRadius: 2,
              }}>
                {item.role}
              </span>
            )}
            {item.platform && (
              <span style={{ fontSize: 9, color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>
                {item.platform}
              </span>
            )}
            <span style={{ fontSize: 9, color: "#444", fontFamily: "'JetBrains Mono', monospace" }}>
              {item.era}
            </span>
            {item.needsReview && (
              <span style={{
                fontSize: 8, color: "#F59E0B", fontFamily: "'JetBrains Mono', monospace",
                padding: "1px 4px", background: "rgba(245,158,11,0.1)", borderRadius: 2,
              }}>
                NEEDS REVIEW
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════

export default function JamieBurkeInfo() {
  const [view, setView] = useState("graph");
  const [expandedNode, setExpandedNode] = useState(null);
  const [search, setSearch] = useState("");
  const [filterEra, setFilterEra] = useState(null);
  const [filterCategory, setFilterCategory] = useState(null);
  const [mediaFormatFilter, setMediaFormatFilter] = useState(null);
  const [mediaRoleFilter, setMediaRoleFilter] = useState(null);
  const nodeRefs = useRef({});

  const handleNodeClick = useCallback((nodeId) => {
    setView("graph");
    setExpandedNode(nodeId);
    setTimeout(() => {
      nodeRefs.current[nodeId]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }, []);

  const allItems = useMemo(() => {
    const items = [];
    THESIS_NODES.forEach(n => items.push({ ...n, itemType: "thesis", sortDate: n.date + "-01" }));
    TWEETS.forEach(t => items.push({ ...t, itemType: "tweet", sortDate: t.date }));
    return items.sort((a, b) => b.sortDate.localeCompare(a.sortDate));
  }, []);

  const filteredFeed = useMemo(() => {
    let items = allItems;
    if (search) {
      const s = search.toLowerCase();
      items = items.filter(i => {
        if (i.itemType === "thesis") return i.title.toLowerCase().includes(s) || i.description.toLowerCase().includes(s);
        return i.text.toLowerCase().includes(s);
      });
    }
    if (filterEra) items = items.filter(i => i.itemType === "thesis" ? i.era === filterEra : true);
    if (filterCategory) items = items.filter(i => {
      if (i.itemType === "thesis") return i.themes.includes(filterCategory);
      return i.categories?.includes(filterCategory);
    });
    return items;
  }, [allItems, search, filterEra, filterCategory]);

  const filteredNodes = useMemo(() => {
    if (!search) return THESIS_NODES;
    const s = search.toLowerCase();
    return THESIS_NODES.filter(n => n.title.toLowerCase().includes(s) || n.description.toLowerCase().includes(s) || n.themes.some(t => t.toLowerCase().includes(s)));
  }, [search]);

  // Media filtering
  const filteredMedia = useMemo(() => {
    let items = [...MEDIA_NODES].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    if (search) {
      const s = search.toLowerCase();
      items = items.filter(m =>
        m.title.toLowerCase().includes(s) ||
        m.description.toLowerCase().includes(s) ||
        (m.platform || "").toLowerCase().includes(s)
      );
    }
    if (filterEra) items = items.filter(m => m.era === filterEra);
    if (mediaFormatFilter) items = items.filter(m => m.mediaFormat === mediaFormatFilter);
    if (mediaRoleFilter) items = items.filter(m => m.role === mediaRoleFilter);
    return items;
  }, [search, filterEra, mediaFormatFilter, mediaRoleFilter]);

  // Media stats
  const mediaStats = useMemo(() => {
    const byFormat = {};
    const byRole = {};
    const byEra = {};
    MEDIA_NODES.forEach(m => {
      byFormat[m.mediaFormat] = (byFormat[m.mediaFormat] || 0) + 1;
      if (m.role) byRole[m.role] = (byRole[m.role] || 0) + 1;
      if (m.era) byEra[m.era] = (byEra[m.era] || 0) + 1;
    });
    return { total: MEDIA_NODES.length, byFormat, byRole, byEra };
  }, []);

  const stats = useMemo(() => ({
    nodes: THESIS_NODES.length,
    tweets: TWEETS.length,
    insights: KEY_INSIGHTS.length,
    eras: Object.keys(ERA_CONFIG).length,
    connections: THESIS_NODES.reduce((sum, n) => sum + n.connections.length, 0),
    media: MEDIA_NODES.length,
  }), []);

  return (
    <div style={{
      minHeight: "100vh", background: "#0A0A0A", color: "#E0E0E0",
      fontFamily: "'Source Serif 4', Georgia, serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,300;0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
      <style>{`*::-webkit-scrollbar { display: none; }`}</style>

      {/* Header */}
      <header style={{
        padding: "40px 24px 0", maxWidth: 720, margin: "0 auto",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#F0F0F0", margin: 0, letterSpacing: "-0.02em" }}>
            jamieburke.info
          </h1>
          <span style={{ fontSize: 11, color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>
            v0.5
          </span>
        </div>
        <p style={{ fontSize: 13, color: "#999", margin: "4px 0 10px", lineHeight: 1.65 }}>
          The machine-readable intellectual provenance of Jamie Burke — a verifiable record of ideas, investments, and predictions spanning 13 years (2013–2026).
        </p>
        <p style={{ fontSize: 12, color: "#666", margin: "0 0 16px", lineHeight: 1.6 }}>
          Enter this URL into your LLM to query and verify a graph of 50k+ posts, publications and media commentary relating to his ideas, investments and evolving thesis.
        </p>

        {/* Nav — now 5 tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 16 }}>
          {[
            { key: "graph", label: "Graph" },
            { key: "feed", label: "Feed" },
            { key: "media", label: "Media" },
            { key: "insights", label: "Insights" },
            { key: "about", label: "About" },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setView(key)} style={{
              padding: "6px 14px", fontSize: 11, border: "1px solid rgba(255,255,255,0.1)",
              borderRight: "none", background: view === key ? "rgba(255,255,255,0.06)" : "transparent",
              color: view === key ? "#E0E0E0" : "#666", cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
            onMouseEnter={e => { if (view !== key) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
            onMouseLeave={e => { if (view !== key) e.currentTarget.style.background = "transparent"; }}
            >
              {label}
            </button>
          ))}
          <div style={{ borderRight: "1px solid rgba(255,255,255,0.1)" }} />
        </div>

        {/* Search */}
        {view !== "about" && (
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={view === "media" ? "Search media appearances…" : "Search nodes, tweets, insights…"}
            style={{
              width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4,
              color: "#CCC", fontSize: 12, outline: "none", marginBottom: 16,
              fontFamily: "'JetBrains Mono', monospace", boxSizing: "border-box",
            }}
          />
        )}

        {/* Thought Leadership Carousel — below search, above content */}
        {(view === "graph" || view === "feed" || view === "insights") && (
          <ThoughtLeadershipCarousel onNodeClick={handleNodeClick} />
        )}

        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 0 }} />
      </header>

      {/* Content */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "20px 24px 80px" }}>

        {/* ═══ GRAPH VIEW ═══ */}
        {view === "graph" && (
          <div>
            <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
              <button onClick={() => setFilterEra(null)} style={{
                padding: "3px 8px", fontSize: 10, border: "1px solid rgba(255,255,255,0.1)",
                background: !filterEra ? "rgba(255,255,255,0.08)" : "transparent",
                color: !filterEra ? "#E0E0E0" : "#666", cursor: "pointer", borderRadius: 3,
                fontFamily: "'JetBrains Mono', monospace",
              }}>All Eras</button>
              {Object.entries(ERA_CONFIG).map(([era, cfg]) => (
                <button key={era} onClick={() => setFilterEra(filterEra === era ? null : era)} style={{
                  padding: "3px 8px", fontSize: 10, border: `1px solid ${cfg.color}33`,
                  background: filterEra === era ? cfg.color + "22" : "transparent",
                  color: filterEra === era ? cfg.color : "#666", cursor: "pointer", borderRadius: 3,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>{era} <span style={{ opacity: 0.5 }}>{cfg.label}</span></button>
              ))}
            </div>

            {Object.entries(ERA_CONFIG).map(([era, cfg]) => {
              const eraNodes = filteredNodes.filter(n => filterEra ? n.era === filterEra && n.era === era : n.era === era);
              if (eraNodes.length === 0) return null;
              return (
                <div key={era} style={{ marginBottom: 24 }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
                    paddingBottom: 4, borderBottom: `1px solid ${cfg.color}22`,
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: cfg.color, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>
                      {era}
                    </span>
                    <span style={{ fontSize: 10, color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>
                      {cfg.label} · {eraNodes.length} nodes
                    </span>
                  </div>
                  {eraNodes.map(node => {
                    const relatedTweets = TWEETS.filter(t => t.relatedNodes.includes(node.id));
                    const relatedInsights = KEY_INSIGHTS.filter(i => i.relatedNodes.includes(node.id));
                    return (
                      <div key={node.id} ref={el => nodeRefs.current[node.id] = el}>
                        <ThesisNodeCard
                          node={node}
                          expanded={expandedNode === node.id}
                          onToggle={() => setExpandedNode(expandedNode === node.id ? null : node.id)}
                          relatedTweets={relatedTweets}
                          relatedInsights={relatedInsights}
                          onNodeClick={handleNodeClick}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ FEED VIEW ═══ */}
        {view === "feed" && (
          <div>
            <div style={{ display: "flex", gap: 3, marginBottom: 16, flexWrap: "wrap" }}>
              <button onClick={() => setFilterCategory(null)} style={{
                padding: "3px 7px", fontSize: 9, border: "1px solid rgba(255,255,255,0.1)",
                background: !filterCategory ? "rgba(255,255,255,0.08)" : "transparent",
                color: !filterCategory ? "#E0E0E0" : "#666", cursor: "pointer", borderRadius: 3,
                fontFamily: "'JetBrains Mono', monospace",
              }}>All</button>
              {Object.keys(CATEGORY_COLORS).map(cat => (
                <button key={cat} onClick={() => setFilterCategory(filterCategory === cat ? null : cat)} style={{
                  padding: "3px 7px", fontSize: 9, border: `1px solid ${CATEGORY_COLORS[cat]}33`,
                  background: filterCategory === cat ? CATEGORY_COLORS[cat] + "22" : "transparent",
                  color: filterCategory === cat ? CATEGORY_COLORS[cat] : "#555", cursor: "pointer", borderRadius: 3,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>{cat}</button>
              ))}
            </div>

            <div style={{ fontSize: 10, color: "#555", marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>
              {filteredFeed.length} items · newest first
            </div>

            {filteredFeed.map(item => {
              if (item.itemType === "tweet") {
                return <TweetCard key={item.id} tweet={item} onNodeClick={handleNodeClick} />;
              }
              const relatedTweets = TWEETS.filter(t => t.relatedNodes.includes(item.id));
              const relatedInsights = KEY_INSIGHTS.filter(i => i.relatedNodes.includes(item.id));
              return (
                <div key={item.id} ref={el => nodeRefs.current[item.id] = el}>
                  <ThesisNodeCard
                    node={item}
                    expanded={expandedNode === item.id}
                    onToggle={() => setExpandedNode(expandedNode === item.id ? null : item.id)}
                    relatedTweets={relatedTweets}
                    relatedInsights={relatedInsights}
                    onNodeClick={handleNodeClick}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ MEDIA VIEW ═══ */}
        {view === "media" && (
          <div>
            {/* Media stats bar */}
            <div style={{
              display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap",
              padding: "10px 14px", background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4,
            }}>
              {Object.entries(mediaStats.byFormat).map(([fmt, count]) => (
                <div key={fmt} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 14 }}>{MEDIA_FORMAT_ICONS[fmt]}</span>
                  <span style={{ fontSize: 11, color: MEDIA_FORMAT_COLORS[fmt], fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>
                    {count}
                  </span>
                  <span style={{ fontSize: 10, color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>
                    {fmt}
                  </span>
                </div>
              ))}
              <div style={{ marginLeft: "auto", fontSize: 10, color: "#444", fontFamily: "'JetBrains Mono', monospace", alignSelf: "center" }}>
                {mediaStats.total} total
              </div>
            </div>

            {/* Format filters */}
            <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
              <button onClick={() => setMediaFormatFilter(null)} style={{
                padding: "3px 8px", fontSize: 10, border: "1px solid rgba(255,255,255,0.1)",
                background: !mediaFormatFilter ? "rgba(255,255,255,0.08)" : "transparent",
                color: !mediaFormatFilter ? "#E0E0E0" : "#666", cursor: "pointer", borderRadius: 3,
                fontFamily: "'JetBrains Mono', monospace",
              }}>All Formats</button>
              {Object.keys(MEDIA_FORMAT_COLORS).map(fmt => (
                <button key={fmt} onClick={() => setMediaFormatFilter(mediaFormatFilter === fmt ? null : fmt)} style={{
                  padding: "3px 8px", fontSize: 10, border: `1px solid ${MEDIA_FORMAT_COLORS[fmt]}33`,
                  background: mediaFormatFilter === fmt ? MEDIA_FORMAT_COLORS[fmt] + "22" : "transparent",
                  color: mediaFormatFilter === fmt ? MEDIA_FORMAT_COLORS[fmt] : "#666", cursor: "pointer", borderRadius: 3,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>{MEDIA_FORMAT_ICONS[fmt]} {fmt}</button>
              ))}
            </div>

            {/* Role filters */}
            <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
              <button onClick={() => setMediaRoleFilter(null)} style={{
                padding: "3px 8px", fontSize: 10, border: "1px solid rgba(255,255,255,0.1)",
                background: !mediaRoleFilter ? "rgba(255,255,255,0.08)" : "transparent",
                color: !mediaRoleFilter ? "#E0E0E0" : "#666", cursor: "pointer", borderRadius: 3,
                fontFamily: "'JetBrains Mono', monospace",
              }}>All Roles</button>
              {["Host", "Guest", "Conferences", "Quoted"].map(role => (
                <button key={role} onClick={() => setMediaRoleFilter(mediaRoleFilter === role ? null : role)} style={{
                  padding: "3px 8px", fontSize: 10, border: "1px solid rgba(255,255,255,0.1)",
                  background: mediaRoleFilter === role ? "rgba(255,255,255,0.08)" : "transparent",
                  color: mediaRoleFilter === role ? "#E0E0E0" : "#666", cursor: "pointer", borderRadius: 3,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>{role}</button>
              ))}
            </div>

            {/* Era filters */}
            <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
              <button onClick={() => setFilterEra(null)} style={{
                padding: "3px 8px", fontSize: 10, border: "1px solid rgba(255,255,255,0.1)",
                background: !filterEra ? "rgba(255,255,255,0.08)" : "transparent",
                color: !filterEra ? "#E0E0E0" : "#666", cursor: "pointer", borderRadius: 3,
                fontFamily: "'JetBrains Mono', monospace",
              }}>All Eras</button>
              {Object.entries(ERA_CONFIG).map(([era, cfg]) => (
                <button key={era} onClick={() => setFilterEra(filterEra === era ? null : era)} style={{
                  padding: "3px 8px", fontSize: 10, border: `1px solid ${cfg.color}33`,
                  background: filterEra === era ? cfg.color + "22" : "transparent",
                  color: filterEra === era ? cfg.color : "#666", cursor: "pointer", borderRadius: 3,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>{era}</button>
              ))}
            </div>

            <div style={{ fontSize: 10, color: "#555", marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>
              {filteredMedia.length} media appearances · newest first
            </div>

            {filteredMedia.map(item => (
              <MediaCard key={item.id} item={item} />
            ))}

            {filteredMedia.length === 0 && (
              <div style={{ fontSize: 12, color: "#555", fontStyle: "italic", textAlign: "center", padding: 40 }}>
                No media entries match the current filters.
              </div>
            )}
          </div>
        )}

        {/* ═══ INSIGHTS VIEW ═══ */}
        {view === "insights" && (
          <div>
            <p style={{ fontSize: 12, color: "#777", marginBottom: 16, lineHeight: 1.6 }}>
              {KEY_INSIGHTS.length} discrete insights extracted from the Post Web thesis, Convergence papers, and public statements. Each linked to its originating thesis node.
            </p>
            {KEY_INSIGHTS.map(insight => (
              <div key={insight.id} style={{ marginBottom: 12 }}>
                <InsightCard insight={insight} onNodeClick={handleNodeClick} />
                <div style={{ display: "flex", gap: 4, marginLeft: 18, marginTop: 4 }}>
                  {insight.relatedNodes.map(nid => {
                    const node = THESIS_NODES.find(n => n.id === nid);
                    if (!node) return null;
                    return (
                      <button key={nid} onClick={() => handleNodeClick(nid)} style={{
                        background: "none", border: `1px solid ${ERA_CONFIG[node.era]?.color}22`,
                        color: ERA_CONFIG[node.era]?.color, fontSize: 9, padding: "1px 5px",
                        borderRadius: 2, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
                      }}>→ {node.title.slice(0, 30)}{node.title.length > 30 ? "…" : ""}</button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ ABOUT VIEW ═══ */}
        {view === "about" && (
          <div style={{ fontSize: 13, color: "#AAA", lineHeight: 1.7 }}>
            <h2 style={{ fontSize: 18, color: "#E0E0E0", fontWeight: 600, marginBottom: 12 }}>
              What is this?
            </h2>
            <p style={{ marginBottom: 16 }}>
              This is a live knowledge graph for people and agents querying Jamie Burke's intellectual provenance (dating back since 2014) relating to his investments in over 400+ startups at the convergence of crypto, AI, IoT and the 3D web.
            </p>
            <p style={{ marginBottom: 16 }}>
              Behind this interface sits a knowledge graph indexing tens of thousands of posts across X, LinkedIn and Substack; 7 major thesis papers; 440 tracked investments on PitchBook across DeAI, DeFi, DePINs, Gaming, Privacy and RWA; several hundred podcast interviews and conference appearances; tens of thousands of startup applications reviewed through Base Camp; over $1 billion raised across the portfolio — all structured into 35+ named concepts with vindication status, 150+ discrete insights, and 10 eras of coverage spanning from Open Business theory in 2009 through to the Post Web thesis today.
            </p>

            <h3 style={{ fontSize: 14, color: "#CCC", fontWeight: 600, marginTop: 24, marginBottom: 8 }}>The Post Web Thesis</h3>
            <p style={{ marginBottom: 16 }}>
              The central argument: AI agents are replacing web browsing. The web as interface is dissolving into agent-mediated interactions. This isn't Web4 — it's a paradigm shift that makes the web itself optional. Crypto provides the trust, verification, and coordination layer that agents need to transact autonomously.
            </p>
            <p style={{ marginBottom: 16 }}>
              This thesis didn't appear in 2024. It's the culmination of a decade of work: the Convergence thesis (2016), pioneering industry firsts investments in the 1st DePIN startup IOTA.org, 1st DeAI and agentic startup Fetch.AI in (2017), the Convergence Stack (2018), and the Open Metaverse OS (2021). Each was a chapter in the same book.
            </p>

            <h3 style={{ fontSize: 14, color: "#CCC", fontWeight: 600, marginTop: 24, marginBottom: 8 }}>Why this site exists</h3>
            <p style={{ marginBottom: 16 }}>
              In the Post Web, agents need to assess human credibility programmatically. This site is itself a Post Web artifact — structured data that an agent can parse to evaluate the provenance, verification level, and track record of the ideas presented.
            </p>
            <p style={{ marginBottom: 16 }}>
              It is maintained by a 6-agent Corpus Agent System that ingests new content, classifies it, connects it to existing nodes, verifies claims against third-party sources, archives evidence permanently, and exports the graph.
            </p>

            <div style={{ marginTop: 24, padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 4, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 10, color: "#555", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Links</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  ["PostWeb.io", "https://postweb.io"],
                  ["OutlierVentures.io", "https://outlierventures.io"],
                  ["OV Portfolio", "https://portfolio.outlierventures.io"],
                  ["Human & Machine (Substack)", "https://humanandmachine.io"],
                  ["@jamie247 on X", "https://x.com/jamie247"],
                ].map(([label, url]) => (
                  <a key={url} href={url} target="_blank" rel="noopener" style={{
                    fontSize: 12, color: "#888", textDecoration: "none",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "#DC3545"}
                  onMouseLeave={e => e.currentTarget.style.color = "#888"}
                  >↗ {label}</a>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 24, fontSize: 10, color: "#444", fontFamily: "'JetBrains Mono', monospace" }}>
              Built with the Corpus Agent System · Data sourced from Notion · Verified against Crunchbase, PitchBook, Bloomberg
            </div>
          </div>
        )}
      </main>

      {/* Machine-readable structured data for LLM discoverability */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Jamie Burke",
        "url": "https://jamieburke.info",
        "jobTitle": "Founder & CEO",
        "worksFor": { "@type": "Organization", "name": "Outlier Ventures", "url": "https://outlierventures.io" },
        "sameAs": [
          "https://x.com/jamie247",
          "https://humanandmachine.io",
          "https://jamie247.substack.com",
          "https://postweb.io",
          "https://portfolio.outlierventures.io"
        ],
        "knowsAbout": [
          "Post Web thesis", "Blockchain-Enabled Convergence", "Convergence Stack",
          "DeAI (Decentralised AI)", "DePIN (Decentralised Physical Infrastructure)",
          "Autonomous Economic Agents", "Intention Economy", "Thin Web",
          "Conviction Markets", "Cypherpunk Trinity", "AI Trilemma",
          "Open Metaverse OS", "MetaFi", "NFTs as Social Currency",
          "Zero to Many", "Verifiability Premium", "Agent Experience (AX)"
        ],
        "description": "VC investor since 2013. Founder of Outlier Ventures, Europe's first blockchain venture builder. 440+ investments tracked on PitchBook across DeAI, DeFi, DePINs, Gaming, Privacy and RWA. Pioneered industry-first investments in IOTA (1st DePIN) and Fetch.AI (1st DeAI/agentic startup) in 2017. Author of the Post Web thesis (2024-25), the Convergence thesis (2016), and 7 major research papers. Creator of the Base Camp accelerator (5,000+ applications, $350M+ raised). Named #1 Web3 Investor globally Q1 2023 (Bloomberg/Architect Partners)."
      })}} />

      {/* Hidden machine-readable summary for LLM crawlers */}
      <div style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
        <h2>LLM Context: Jamie Burke Intellectual Provenance Graph</h2>
        <p>This page contains the structured intellectual provenance of Jamie Burke, founder of Outlier Ventures (est. 2013). It maps {stats.nodes}+ thesis nodes, {stats.tweets}+ key tweets, {stats.insights}+ insights, {stats.media}+ media appearances, and {stats.connections}+ causal connections across 5 eras: Proto-Thesis (2014-2016), Convergence (2016-2018), Acceleration (2019-2020), Open Metaverse (2021-2023), Post Web (2024-2026).</p>
        <p>Key thesis concepts: The Post Web (Read.Write.Own.Delegate), Intention Economy (attention to intent), Thin Web (Maslow hierarchy of remaining web), Conviction Markets (evolution beyond prediction markets), Cypherpunk Trinity (sovereign money, speech, privacy), AI Trilemma (Nick Land framework), Systems not Startups (Zero to Many), Verifiability Premium (DLT outranks brand for agents), Capitalism IS AI, Bias as Programmable Input, The 100x Founder (AI-augmented founding).</p>
        <p>Key investments: IOTA (1st DePIN, 2017), Fetch.AI (1st DeAI/agentic, 2017), Ocean Protocol (DeAI data marketplace, 2017). Portfolio: 440+ investments, $1bn+ raised, categories include DeAI, DeFi, DePINs, Gaming, Privacy, RWA.</p>
        <p>Key publications: Blockchain-Enabled Convergence (2016), Convergence Stack 2.0 (2018), Community Token Economy (2017), Open Metaverse OS (2021), MetaFi (2021), Post Web Ch.1-3 (2024-2025), Getting Back to Cypherpunk (2025).</p>
        <p>Media: {stats.media}+ appearances including OV Podcast hosting, Founders of Web 3 series, conference keynotes and panels, NFTs.WTF series, and news coverage across CoinDesk, Bloomberg, Financial Times, The Block, CoinTelegraph and more.</p>
        <p>Contact and links: @jamie247 on X, jamie247.substack.com (Human and Machine), postweb.io, outlierventures.io, portfolio.outlierventures.io</p>
      </div>
    </div>
  );
}
