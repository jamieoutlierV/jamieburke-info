import { useState, useMemo, useCallback, useRef, useEffect } from "react";

// ═══════════════════════════════════════════════════════
// DATA: The structured knowledge graph
// connections[] point BACKWARD to what influenced this event.
// ═══════════════════════════════════════════════════════

const NODES = [
  // ── ERA 0: PROTO-THESIS (2014–2016) ──
  { id: "ob2014", date: "2014-01", title: "10 Principles of Open Business", type: "publication", themes: ["thesis", "culture"], era: 0, vindicated: true,
    desc: "Co-authored with David Cushman. 9 of 10 principles predicted foundational Web3 concepts — radical transparency, co-creation, trust earned through behaviour. The proto-thesis.",
    connections: [] },
  { id: "ov2014", date: "2014-06", title: "Outlier Ventures Founded", type: "organisation", themes: ["investment", "building"], era: 0, vindicated: true,
    desc: "Europe's first blockchain venture builder & fund. Among the first 3 dedicated crypto funds globally after Blockchain Capital (2013).",
    connections: ["ob2014"] },
  { id: "bs2015", date: "2015-01", title: "Blockstars.io & Ecosystem Tracker", type: "product", themes: ["building", "research"], era: 0, vindicated: true,
    desc: "First searchable database of blockchain startups. By 2017: 1,220+ startups, 800 pitch decks, 18 countries, $22m dealflow. Frost & Sullivan partnership confirmed scale.",
    connections: ["ov2014"] },
  { id: "mc2015", date: "2015-03", title: "MoneyCircles.com", type: "venture", themes: ["building", "defi"], era: 0, vindicated: true,
    desc: "P2P lending on private Ethereum blockchain. DeFi prototype 4 years before 'DeFi' existed.",
    connections: ["ov2014", "bs2015"] },
  { id: "ba2016", date: "2016-02", title: "Blockchain Angels Network", type: "organisation", themes: ["investment", "community"], era: 0, vindicated: true,
    desc: "First blockchain-dedicated angel investor network. 6-week cycles across European cities. Generated the 1,220-startup dataset that powered the Convergence thesis.",
    connections: ["ov2014", "bs2015"] },

  // ── ERA 1: CONVERGENCE (2016–2019) ──
  { id: "conv2016", date: "2016-11", title: "Blockchain-Enabled Convergence Thesis", type: "thesis", themes: ["thesis", "research"], era: 1, vindicated: true,
    desc: "First published thesis framing blockchain as foundational infrastructure enabling convergence of AI, IoT, autonomous systems. The unified investment thesis that no one else had.",
    connections: ["bs2015", "ba2016", "ob2014"] },
  { id: "bs99pct", date: "2017-09", title: "99% of Blockchain Startups Are Bullshit", type: "publication", themes: ["thesis", "investment"], era: 1, vindicated: true,
    desc: "Public manifesto for shifting from broad dealflow (Blockchain Angels) to thesis-driven selection (Convergence VC). 'We now turn away most blockchain startups.'",
    connections: ["conv2016", "ba2016", "bs2015"] },
  { id: "imp2017", date: "2017-06", title: "Imperial College 3-Year R&D Partnership", type: "partnership", themes: ["research", "building"], era: 1, vindicated: true,
    desc: "First blockchain VC ↔ university applied R&D partnership. IC3RE + OV. Embedded PhD researchers, student project briefs. Produced 3Ds of Token Design.",
    connections: ["conv2016", "ov2014"] },
  { id: "iota2017", date: "2017-03", title: "IOTA Investment (Proto-DePIN)", type: "investment", themes: ["investment", "depin"], era: 1, vindicated: true,
    desc: "Machine-to-machine economy on Tangle. First DePIN investment before the term existed. IoT device payments as core thesis.",
    connections: ["conv2016"] },
  { id: "ocean2017", date: "2017-09", title: "Ocean Protocol Investment (DeAI)", type: "investment", themes: ["investment", "deai"], era: 1, vindicated: true,
    desc: "Founding investor. Decentralised data marketplace enabling AI/ML training. First DeAI investment.",
    connections: ["conv2016", "imp2017"] },
  { id: "fetch2018", date: "2018-01", title: "Fetch.AI Investment (Crypto Agents)", type: "investment", themes: ["investment", "agents"], era: 1, vindicated: true,
    desc: "Autonomous economic agents on blockchain. First crypto-native agent investment. 'Crypto is not based on adoption of currencies, but enabling bots to conduct economic activity.'",
    connections: ["conv2016", "ocean2017"] },
  { id: "cte2017", date: "2017-09", title: "Community Token Economy Paper", type: "thesis", themes: ["thesis", "research"], era: 1, vindicated: true,
    desc: "Framework for community-governed token economies. Built on by 3Ds of Token Design with Imperial.",
    connections: ["conv2016", "imp2017"] },
  { id: "3ds2018", date: "2018-06", title: "3Ds of Token Design (with Imperial)", type: "publication", themes: ["research", "thesis"], era: 1, vindicated: true,
    desc: "Award-winning paper on token design methodology. Enterprise Blockchain Award, Toronto. First institutional framework from VC/university partnership.",
    connections: ["cte2017", "imp2017"] },
  { id: "frost2017", date: "2017-03", title: "Frost & Sullivan Blockchain Startup Map", type: "partnership", themes: ["research"], era: 1, vindicated: true,
    desc: "Used OV's 1,200+ startup tracker to produce '2017 Global Blockchain Startup Map'. Independent validation of database uniqueness.",
    connections: ["bs2015"] },
  { id: "fidelity2017", date: "2017-05", title: "Fidelity Convergence Thought Leader Programme", type: "event", themes: ["investment", "thesis"], era: 1, vindicated: true,
    desc: "Institutional finance engaging with Convergence thesis 7 years before the Bitcoin ETF.",
    connections: ["conv2016"] },
  { id: "h2o2018", date: "2018-12", title: "H2O Demo — First Convergence Stack App", type: "milestone", themes: ["building", "deai"], era: 1, vindicated: true,
    desc: "ML running on OrbitDB + Ocean Protocol at Digital Catapult, London. Proof that the Convergence Stack worked.",
    connections: ["ocean2017", "conv2016"] },
  { id: "stack2018", date: "2018-06", title: "The Convergence Ecosystem Paper (2.0)", type: "thesis", themes: ["thesis", "research"], era: 1, vindicated: true,
    desc: "Detailed the full Convergence Stack: blockchain → IoT → big data → AI. 'Platform monopolies lead to data monopolies, and they ultimately lead to AI monopolies.'",
    connections: ["conv2016", "iota2017", "ocean2017", "fetch2018"] },

  // ── ERA 2: SCALING (2019–2022) ──
  { id: "alliance2019", date: "2019-07", title: "Convergence Alliance (18 Founding Members)", type: "organisation", themes: ["partnership", "thesis"], era: 2, vindicated: true,
    desc: "JLR, SAP, Deutsche Telekom, IOTA, Ocean, Fetch.AI, Imperial, Smart Dubai, MOBI, Frankfurt School. $30M committed.",
    connections: ["stack2018", "imp2017", "iota2017", "ocean2017", "fetch2018"] },
  { id: "basecamp2019", date: "2019-09", title: "Base Camp Accelerator Launched", type: "programme", themes: ["building", "investment"], era: 2, vindicated: true,
    desc: "First dedicated Web3 accelerator at scale. 100+ applicants per cohort. Condensed 6 years of OV learning into intense 12-week programme.",
    connections: ["ov2014", "conv2016", "bs2015", "imp2017"] },
  { id: "diffusion2019", date: "2019-10", title: "Diffusion 2019 Devcon", type: "event", themes: ["community", "building"], era: 2, vindicated: true,
    desc: "2-day devcon at Factory Berlin. 8 hack tracks. 'No one has a blockchain problem. Everyone has a data problem.'",
    connections: ["stack2018", "alliance2019"] },
  { id: "cryptoart_pre2021", date: "2020-06", title: "Personal Crypto Art Collecting", type: "milestone", themes: ["digital_art", "investment"], era: 2, vindicated: true,
    desc: "Early crypto art collector. Initial CryptoPunks scepticism evolved into deeper framework: 'To own a CryptoPunk is to claim you were into the first form of NFTs.' Ownership as cultural signal.",
    connections: [] },
  { id: "defi2020", date: "2020-10", title: "Broken DeFi Hypecycle (3-Part Series)", type: "publication", themes: ["thesis", "defi"], era: 2, vindicated: true,
    desc: "Predicted 5-year DeFi megacycle. Predicted NFTs as next retail trigger (✅). Predicted institutional cycle via ETFs (✅). Introduced Burke's Bullshit Cycle.",
    connections: ["mc2015", "conv2016", "cte2017"] },
  { id: "defi2_2020", date: "2020-11", title: "DeFi 2.0: AEAs as 'AI Lego'", type: "publication", themes: ["thesis", "agents", "defi"], era: 2, vindicated: true,
    desc: "AEAs described as 'AI Lego' overlaying Ethereum's 'Money Lego'. The agent layer on top of financial layer — 4 years before Post Web Ch.2.",
    connections: ["fetch2018", "defi2020", "conv2016"] },

  // ── ERA 3: OPEN METAVERSE (2021–2023) ──
  { id: "omos2021", date: "2021-01", title: "The Open Metaverse OS", type: "thesis", themes: ["thesis", "digital_art", "defi"], era: 3, vindicated: true,
    desc: "Web3 infrastructure (SSI, self-custody, privacy, NFTs, DeFi) as capabilities of an open metaverse vs closed Big Tech metaverse. NFTs as the digital ownership layer.",
    connections: ["stack2018", "defi2020", "conv2016"] },
  { id: "100xart2021", date: "2021-01", title: "100xARt District in Decentraland", type: "project", themes: ["digital_art", "building"], era: 3, vindicated: true,
    desc: "First curated virtual art district. Beeple, Jose Delbo, 24 auctions. Move from personal collecting to institutional curation. Jamie donated assets to community.",
    connections: ["omos2021", "cryptoart_pre2021"] },
  { id: "nft_social_2021", date: "2021-03", title: "NFTs as Social Currency (CoinDesk)", type: "concept", themes: ["digital_art", "thesis"], era: 3, vindicated: true,
    desc: "'NFTs are a form of social currency.' Compared to LP album ownership — artefact as badge of belonging. 'It's not just about the money. It's much more sustainable.'",
    connections: ["cryptoart_pre2021", "omos2021", "cte2017"] },
  { id: "nftswtf2021", date: "2021-04", title: "NFTs.WTF D-Zine & Documentary", type: "publication", themes: ["digital_art", "community"], era: 3, vindicated: true,
    desc: "NFT media property featuring 100 industry leaders. 3-hour audio documentary narrated by Jamie. 50+ interviews. Curation → cultural production & historiography.",
    connections: ["100xart2021", "omos2021", "nft_social_2021"] },
  { id: "trapped_value_2021", date: "2021-03", title: "Billions in Trapped Digital Value", type: "concept", themes: ["digital_art", "thesis", "defi"], era: 3, vindicated: true,
    desc: "'Billions of dollars of digital skins trapped in gaming platforms. People invested huge amounts of time and money, and they're not transferable.' NFTs as liberation of value.",
    connections: ["omos2021"] },

  { id: "metafi2021", date: "2021-12", title: "MetaFi: DeFi for the Metaverse", type: "thesis", themes: ["thesis", "defi", "digital_art"], era: 3, vindicated: true,
    desc: "Framework for how DeFi primitives serve the metaverse economy. How digital value gets financialised once liberated from platforms.",
    connections: ["omos2021", "defi2020", "trapped_value_2021"] },
  { id: "nft_decouple_2022", date: "2022-06", title: "NFTs Decouple from Crypto Speculation", type: "concept", themes: ["digital_art", "thesis"], era: 3, vindicated: true,
    desc: "Bear market analysis: NFTs as cultural assets that survive crypto cycles. Art communities persist because not just about money. Vindicated CoinDesk prediction.",
    connections: ["dear2022", "nft_social_2021", "100xart2021"] },
  { id: "dear2022", date: "2022-06", title: "Dear Web3 Founders (Bear Market Letter)", type: "publication", themes: ["investment", "thesis"], era: 3, vindicated: true,
    desc: "Strategic analysis: crypto as 'ultimate COVID stock', flight to quality, NFTs decoupled, tokens for incentive design not fundraising.",
    connections: ["defi2020", "omos2021"] },
  { id: "no1_2023", date: "2023-03", title: "#1 Web3 Investor Globally (Q1 2023)", type: "milestone", themes: ["investment"], era: 3, vindicated: true,
    desc: "42 deals in Q1 (3x Coinbase's 14). Architect Partners / Bloomberg / Sifted confirmed. Counter-cyclical scaling decision vindicated.",
    connections: ["basecamp2019", "dear2022"] },

  // ── ERA 4: POST WEB (2024–2026) ──
  { id: "pw1_2024", date: "2024-09", title: "Post Web Ch.1: The Web Is Disappearing", type: "thesis", themes: ["thesis", "agents"], era: 4, vindicated: null,
    desc: "AI agents replacing browsing. Web dissolving into agent-mediated interactions. 'The web as we know it is disappearing.'",
    connections: ["conv2016", "fetch2018", "defi2_2020", "omos2021"] },
  { id: "pw2_2024", date: "2024-12", title: "Post Web Ch.2: The Technology Stack", type: "thesis", themes: ["thesis", "agents", "deai"], era: 4, vindicated: null,
    desc: "The Post Web Stack: AI agents + crypto rails + decentralised identity + machine-readable value. The Convergence thesis fully realised.",
    connections: ["pw1_2024", "stack2018", "fetch2018", "ocean2017", "iota2017"] },
  { id: "pw3_2025", date: "2025-03", title: "Post Web Ch.3: Zero to Many", type: "thesis", themes: ["thesis", "investment"], era: 4, vindicated: null,
    desc: "New venture dynamics in the Post Web. How startups, tokens, and agents combine to create network effects.",
    connections: ["pw2_2024", "cte2017", "3ds2018"] },
  { id: "cypherpunk2025", date: "2025-08", title: "Getting Back to Cypherpunk", type: "publication", themes: ["thesis", "culture"], era: 4, vindicated: null,
    desc: "The Cypherpunk Trinity. Return to first principles of privacy, sovereignty, cryptographic proof.",
    connections: ["ob2014", "pw1_2024"] },
  { id: "conviction2025", date: "2025-09", title: "Conviction Markets", type: "concept", themes: ["thesis", "investment"], era: 4, vindicated: null,
    desc: "New market structure concept. Markets driven by thesis conviction rather than momentum.",
    connections: ["pw3_2025", "dear2022"] },
  { id: "adai2025", date: "2025-10", title: "ADAI — A Digital Arts Institute", type: "organisation", themes: ["digital_art", "building"], era: 4, vindicated: null,
    desc: "Emergent digital arts institute. Helping digital arts tell its story and express its plurality of culture and practice. Culmination of the 5-year digital art pathway.",
    connections: ["100xart2021", "nftswtf2021", "nft_decouple_2022", "ob2014", "cryptoart_pre2021"] },
  { id: "newera2025", date: "2025-08", title: "New Paradigm for Crypto, New Era for OV", type: "publication", themes: ["investment", "thesis", "agents"], era: 4, vindicated: null,
    desc: "Shift from volume acceleration to later-stage, liquid. 'We will no longer be investing in classic startups but rather agentic systems.'",
    connections: ["no1_2023", "pw2_2024", "fetch2018"] },
];

const ERA_LABELS = {
  0: { name: "Proto-Thesis", period: "2014–2016", color: "#92702A" },
  1: { name: "Convergence", period: "2016–2019", color: "#1a6b4a" },
  2: { name: "Scaling", period: "2019–2022", color: "#2563EB" },
  3: { name: "Open Metaverse", period: "2021–2023", color: "#7C3AED" },
  4: { name: "Post Web", period: "2024–2026", color: "#DC2626" },
};

const THEME_COLORS = {
  thesis: "#DC2626", investment: "#059669", building: "#2563EB", research: "#D97706",
  digital_art: "#D4A574", culture: "#A78BFA", community: "#EC4899", defi: "#06B6D4",
  agents: "#F43F5E", deai: "#8B5CF6", depin: "#10B981", partnership: "#6366F1",
};
const THEME_LABELS = {
  thesis: "Thesis", investment: "Investment", building: "Building", research: "Research",
  digital_art: "Digital Art", culture: "Culture", community: "Community", defi: "DeFi",
  agents: "Agents", deai: "DeAI", depin: "DePIN", partnership: "Partnership",
};
const TYPE_ICONS = {
  thesis: "◆", publication: "◇", investment: "●", organisation: "■", product: "▲",
  venture: "▼", partnership: "⬟", programme: "◈", event: "★", milestone: "✦",
  project: "◉", concept: "◎",
};

const PATHWAYS = [
  { id: "tech", name: "Technology", color: "#DC2626", desc: "Convergence → Post Web: what infrastructure enables a decentralised internet?",
    nodes: ["conv2016", "stack2018", "iota2017", "ocean2017", "fetch2018", "h2o2018", "alliance2019", "pw1_2024", "pw2_2024", "pw3_2025"] },
  { id: "art", name: "Digital Art", color: "#D4A574", desc: "Collecting → Curation → Media → Institution: what cultural forms emerge with native digital ownership?",
    nodes: ["cryptoart_pre2021", "100xart2021", "nft_social_2021", "trapped_value_2021", "nftswtf2021", "omos2021", "metafi2021", "nft_decouple_2022", "adai2025"] },
  { id: "invest", name: "Investment", color: "#059669", desc: "Blockchain Angels → Convergence VC → Base Camp → #1 Global → Agentic systems",
    nodes: ["ba2016", "bs99pct", "basecamp2019", "no1_2023", "dear2022", "conviction2025", "newera2025"] },
  { id: "research", name: "Research", color: "#D97706", desc: "Blockstars database → Imperial partnership → token design methodology",
    nodes: ["bs2015", "frost2017", "imp2017", "cte2017", "3ds2018"] },
];

// ═══════════════════════════════════════════════════════
export default function BurkeKnowledgeGraph() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeThemes, setActiveThemes] = useState(new Set());
  const [activeEras, setActiveEras] = useState(new Set([0,1,2,3,4]));
  const [activePathway, setActivePathway] = useState(null);
  const [viewMode, setViewMode] = useState("timeline");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredNode, setHoveredNode] = useState(null);

  const sorted = useMemo(() => [...NODES].sort((a,b) => b.date.localeCompare(a.date)), []);
  const filtered = useMemo(() => sorted.filter(n => {
    if (!activeEras.has(n.era)) return false;
    if (activeThemes.size > 0 && !n.themes.some(t => activeThemes.has(t))) return false;
    if (activePathway) { const pw = PATHWAYS.find(p=>p.id===activePathway); if (pw && !pw.nodes.includes(n.id)) return false; }
    if (searchQuery) { const q = searchQuery.toLowerCase(); return n.title.toLowerCase().includes(q) || n.desc.toLowerCase().includes(q); }
    return true;
  }), [sorted, activeThemes, activeEras, activePathway, searchQuery]);

  const toggleTheme = useCallback(t => { setActivePathway(null); setActiveThemes(p => { const n = new Set(p); n.has(t)?n.delete(t):n.add(t); return n; }); }, []);
  const toggleEra = useCallback(e => { setActiveEras(p => { const n = new Set(p); n.has(e)?n.delete(e):n.add(e); return n; }); }, []);
  const selectPathway = useCallback(id => { setActiveThemes(new Set()); setActivePathway(p => p===id?null:id); }, []);

  const getConn = useCallback(nid => {
    if (!nid) return new Set();
    const s = new Set();
    const nd = NODES.find(n=>n.id===nid);
    if (nd) nd.connections.forEach(c => s.add(c));
    NODES.forEach(n => { if (n.connections.includes(nid)) s.add(n.id); });
    return s;
  }, []);

  const activeConn = useMemo(() => getConn(selectedNode||hoveredNode), [selectedNode, hoveredNode, getConn]);
  const fmt = d => { const [y,m]=d.split("-"); const M=["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; return `${M[+m]} ${y}`; };
  const sel = selectedNode ? NODES.find(n=>n.id===selectedNode) : null;
  const stats = useMemo(() => ({ n: NODES.length, c: NODES.reduce((a,n)=>a+n.connections.length,0), da: NODES.filter(n=>n.themes.includes("digital_art")).length }), []);

  return (
    <div style={{ fontFamily: "'IBM Plex Mono','SF Mono',monospace", background: "#0A0A0B", color: "#E4E4E7", minHeight: "100vh" }}>
      {/* HEADER */}
      <div style={{ borderBottom: "1px solid #27272A", padding: "14px 18px 10px", background: "linear-gradient(180deg,#111113,#0A0A0B)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 600, margin: 0, letterSpacing: "-0.02em", background: "linear-gradient(135deg,#F4F4F5,#A1A1AA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Burke / Outlier Ventures</h1>
            <p style={{ fontSize: 9, color: "#71717A", margin: "2px 0 0", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Intellectual Provenance Graph · {stats.n} nodes · {stats.c} connections · <span style={{color:"#D4A574"}}>{stats.da} digital art</span>
            </p>
          </div>
          <div style={{ display: "flex", gap: 2 }}>
            {["timeline","graph","list"].map(m => (
              <button key={m} onClick={()=>setViewMode(m)} style={{ padding:"4px 9px",fontSize:9,fontFamily:"inherit",cursor:"pointer",border:"1px solid",borderRadius:3,textTransform:"uppercase",letterSpacing:"0.04em",borderColor:viewMode===m?"#52525B":"#27272A",background:viewMode===m?"#27272A":"transparent",color:viewMode===m?"#F4F4F5":"#71717A" }}>{m}</button>
            ))}
          </div>
        </div>
        <input type="text" placeholder="Search nodes…" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} style={{ width:"100%",padding:"6px 9px",fontSize:10,fontFamily:"inherit",background:"#18181B",border:"1px solid #27272A",borderRadius:4,color:"#E4E4E7",marginTop:8,outline:"none",boxSizing:"border-box" }} />
        
        {/* PATHWAYS */}
        <div style={{ display:"flex",gap:4,marginTop:7,flexWrap:"wrap",alignItems:"center" }}>
          <span style={{ fontSize:8,color:"#52525B",textTransform:"uppercase",letterSpacing:"0.06em" }}>Tracks</span>
          {PATHWAYS.map(pw => (
            <button key={pw.id} onClick={()=>selectPathway(pw.id)} style={{ padding:"3px 8px",fontSize:8,fontFamily:"inherit",cursor:"pointer",border:`1px solid ${activePathway===pw.id?pw.color+"88":"#27272A"}`,borderRadius:3,background:activePathway===pw.id?pw.color+"22":"transparent",color:activePathway===pw.id?pw.color:"#52525B" }}>{pw.name}</button>
          ))}
        </div>
        
        {/* ERAS */}
        <div style={{ display:"flex",gap:4,marginTop:5,flexWrap:"wrap",alignItems:"center" }}>
          <span style={{ fontSize:8,color:"#52525B",textTransform:"uppercase",letterSpacing:"0.06em" }}>Eras</span>
          {Object.entries(ERA_LABELS).map(([e,info])=>{ const n=+e,a=activeEras.has(n); return (
            <button key={e} onClick={()=>toggleEra(n)} style={{ padding:"2px 8px",fontSize:8,fontFamily:"inherit",cursor:"pointer",border:`1px solid ${a?info.color+"88":"#27272A"}`,borderRadius:3,background:a?info.color+"22":"transparent",color:a?info.color:"#52525B" }}>{info.name}</button>
          )})}
        </div>
        
        {/* THEMES */}
        <div style={{ display:"flex",gap:3,marginTop:5,flexWrap:"wrap",alignItems:"center" }}>
          <span style={{ fontSize:8,color:"#52525B",textTransform:"uppercase",letterSpacing:"0.06em" }}>Themes</span>
          {Object.entries(THEME_LABELS).map(([k,l])=>{ const a=activeThemes.has(k); return (
            <button key={k} onClick={()=>toggleTheme(k)} style={{ padding:"2px 6px",fontSize:7,fontFamily:"inherit",cursor:"pointer",border:`1px solid ${a?THEME_COLORS[k]+"88":"#1F1F23"}`,borderRadius:2,background:a?THEME_COLORS[k]+"18":"transparent",color:a?THEME_COLORS[k]:"#52525B",fontWeight:k==="digital_art"?700:400 }}>{l}</button>
          )})}
          {activeThemes.size>0&&<button onClick={()=>setActiveThemes(new Set())} style={{ padding:"2px 6px",fontSize:7,fontFamily:"inherit",cursor:"pointer",border:"1px solid #27272A",borderRadius:2,background:"transparent",color:"#71717A" }}>Clear</button>}
        </div>

        {activePathway && <div style={{ marginTop:6,padding:"5px 9px",background:"#18181B",borderRadius:3,borderLeft:`3px solid ${PATHWAYS.find(p=>p.id===activePathway)?.color}` }}>
          <p style={{ fontSize:9,color:"#A1A1AA",margin:0,lineHeight:1.4 }}><strong style={{ color:PATHWAYS.find(p=>p.id===activePathway)?.color }}>{PATHWAYS.find(p=>p.id===activePathway)?.name}:</strong>{" "}{PATHWAYS.find(p=>p.id===activePathway)?.desc}</p>
        </div>}
      </div>

      {/* MAIN */}
      <div style={{ display:"flex",height:"calc(100vh - 250px)",overflow:"hidden" }}>
        <div style={{ flex:sel?"0 0 55%":"1 1 100%",overflowY:"auto",padding:"10px 14px",transition:"flex 0.3s ease" }}>
          {viewMode==="timeline"&&<Timeline nodes={filtered} sel={selectedNode} hov={hoveredNode} conn={activeConn} onSel={setSelectedNode} onHov={setHoveredNode} fmt={fmt}/>}
          {viewMode==="graph"&&<Graph nodes={filtered} sel={selectedNode} hov={hoveredNode} conn={activeConn} onSel={setSelectedNode} onHov={setHoveredNode}/>}
          {viewMode==="list"&&<List nodes={filtered} sel={selectedNode} onSel={setSelectedNode} fmt={fmt}/>}
        </div>
        {sel&&<div style={{ flex:"0 0 45%",borderLeft:"1px solid #27272A",overflowY:"auto",padding:"14px 18px",background:"#111113" }}>
          <Detail node={sel} all={NODES} onClose={()=>setSelectedNode(null)} nav={setSelectedNode} fmt={fmt} pws={PATHWAYS}/>
        </div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
function Timeline({nodes,sel,hov,conn,onSel,onHov,fmt}) {
  const t = sel||hov;
  return <div style={{position:"relative"}}>
    <div style={{position:"absolute",left:72,top:0,bottom:0,width:1,background:"#27272A"}}/>
    {nodes.map(n => {
      const isSel=n.id===sel,isT=n.id===t,isC=t&&conn.has(n.id),dm=t&&!isT&&!isC;
      const tc=THEME_COLORS[n.themes[0]];
      const isArt=n.themes.includes("digital_art");
      return <div key={n.id} onClick={()=>onSel(isSel?null:n.id)} onMouseEnter={()=>onHov(n.id)} onMouseLeave={()=>onHov(null)}
        style={{display:"flex",alignItems:"flex-start",gap:10,padding:"7px 8px",marginBottom:1,cursor:"pointer",borderRadius:4,position:"relative",
          background:isSel?"#1C1C20":n.id===hov?"#15151A":"transparent",opacity:dm?0.18:1,transition:"all 0.15s ease",
          borderLeft:isC&&!isT?`2px solid ${tc}44`:"2px solid transparent",
          borderRight:isArt&&!dm?`2px solid #D4A57422`:"2px solid transparent"
        }}>
        <div style={{flex:"0 0 52px",fontSize:9,color:"#71717A",textAlign:"right",paddingTop:2,fontVariantNumeric:"tabular-nums"}}>{fmt(n.date)}</div>
        <div style={{flex:"0 0 12px",textAlign:"center",fontSize:10,color:isT?tc:isC?tc+"AA":"#52525B",paddingTop:1,position:"relative",zIndex:1}}>{TYPE_ICONS[n.type]||"●"}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:11,fontWeight:500,color:isT?"#F4F4F5":"#D4D4D8",lineHeight:1.3,marginBottom:2}}>{n.title}</div>
          <div style={{fontSize:9,color:"#71717A",lineHeight:1.4}}>{n.desc.length>100&&!isSel?n.desc.slice(0,100)+"…":n.desc}</div>
          <div style={{display:"flex",gap:3,marginTop:4,flexWrap:"wrap"}}>
            {n.themes.map(th=><span key={th} style={{fontSize:7,padding:"1px 4px",borderRadius:2,letterSpacing:"0.04em",textTransform:"uppercase",background:THEME_COLORS[th]+"18",color:THEME_COLORS[th]+"CC",border:`1px solid ${THEME_COLORS[th]}22`,fontWeight:th==="digital_art"?700:400}}>{THEME_LABELS[th]}</span>)}
            {n.vindicated===true&&<span style={{fontSize:7,padding:"1px 4px",borderRadius:2,background:"#16A34A18",color:"#16A34A",border:"1px solid #16A34A22"}}>✓</span>}
            {n.connections.length>0&&<span style={{fontSize:7,padding:"1px 4px",borderRadius:2,background:"#27272A",color:"#71717A"}}>←{n.connections.length}</span>}
          </div>
        </div>
      </div>;
    })}
  </div>;
}

// ═══════════════════════════════════════════════════════
function Graph({nodes,sel,hov,conn,onSel,onHov}) {
  const [pos,setPos]=useState({});
  useEffect(()=>{
    const p={},g={};
    nodes.forEach(n=>{if(!g[n.era])g[n.era]=[];g[n.era].push(n);});
    const W=640,H=540,eras=Object.keys(g).sort((a,b)=>+b-+a);
    eras.forEach((e,ei)=>{const gr=g[e],yB=36+(ei/Math.max(eras.length-1,1))*(H-72);
      gr.forEach((n,ni)=>{const xB=66+(ni/Math.max(gr.length-1,1))*(W-132);
        p[n.id]={x:gr.length===1?W/2:xB+Math.sin(ni*2.3)*16,y:yB+Math.cos(ni*1.7)*20};
      });
    });
    setPos(p);
  },[nodes]);
  const t=sel||hov;
  return <svg width="100%" viewBox="0 0 640 540" style={{overflow:"visible"}}>
    {Object.entries(ERA_LABELS).map(([e,info])=>{const en=nodes.filter(n=>n.era===+e);if(!en.length)return null;const ay=en.reduce((a,n)=>a+(pos[n.id]?.y||0),0)/en.length;return<text key={e} x={4} y={ay} fill={info.color+"44"} fontSize={7} fontFamily="inherit" dominantBaseline="middle">{info.name}</text>;})}
    {nodes.map(n=>n.connections.map(cid=>{const f=pos[n.id],to=pos[cid];if(!f||!to)return null;const hi=t&&(n.id===t||cid===t),dm=t&&!hi;return<line key={`${n.id}-${cid}`} x1={f.x} y1={f.y} x2={to.x} y2={to.y} stroke={hi?THEME_COLORS[n.themes[0]]+"88":"#27272A"} strokeWidth={hi?1.5:0.4} opacity={dm?0.05:0.3} strokeDasharray={hi?"none":"2,3"}/>;}))}
    {nodes.map(n=>{const p=pos[n.id];if(!p)return null;const isT=n.id===t,isC=t&&conn.has(n.id),dm=t&&!isT&&!isC,c=THEME_COLORS[n.themes[0]],r=isT?8:n.type==="thesis"?6:n.themes.includes("digital_art")?5:4;
      return<g key={n.id} onClick={()=>onSel(n.id===sel?null:n.id)} onMouseEnter={()=>onHov(n.id)} onMouseLeave={()=>onHov(null)} style={{cursor:"pointer"}}>
        <circle cx={p.x} cy={p.y} r={r+5} fill="transparent"/>
        {n.themes.includes("digital_art")&&!dm&&<circle cx={p.x} cy={p.y} r={r+2} fill="none" stroke="#D4A574" strokeWidth={0.5} opacity={0.4} strokeDasharray="2,2"/>}
        <circle cx={p.x} cy={p.y} r={r} fill={isT?c:dm?"#27272A":c+"88"} stroke={isT?c:"transparent"} strokeWidth={isT?2:0} opacity={dm?0.12:1}/>
        {(isT||isC)&&<text x={p.x} y={p.y-r-4} textAnchor="middle" fill={isT?"#F4F4F5":"#A1A1AA"} fontSize={7} fontFamily="inherit">{n.title.length>26?n.title.slice(0,24)+"…":n.title}</text>}
      </g>;
    })}
  </svg>;
}

// ═══════════════════════════════════════════════════════
function List({nodes,sel,onSel,fmt}) {
  return <div style={{fontSize:10}}>
    <div style={{display:"grid",gridTemplateColumns:"68px 1fr 100px 60px",gap:0,borderBottom:"1px solid #27272A",paddingBottom:4,marginBottom:5,color:"#52525B",fontSize:8,textTransform:"uppercase",letterSpacing:"0.06em"}}>
      <div>Date</div><div>Title</div><div>Themes</div><div>Links</div>
    </div>
    {nodes.map(n=><div key={n.id} onClick={()=>onSel(n.id===sel?null:n.id)} style={{display:"grid",gridTemplateColumns:"68px 1fr 100px 60px",gap:0,padding:"3px 0",cursor:"pointer",borderBottom:"1px solid #18181B",background:n.id===sel?"#1C1C20":"transparent",color:n.id===sel?"#F4F4F5":"#A1A1AA"}}>
      <div style={{fontVariantNumeric:"tabular-nums",fontSize:9,color:"#71717A"}}>{fmt(n.date)}</div>
      <div style={{fontWeight:500,fontSize:10}}>{n.title}</div>
      <div style={{fontSize:8,color:"#52525B"}}>{n.themes.map(t=>THEME_LABELS[t]).join(", ")}</div>
      <div style={{fontSize:8,color:"#52525B"}}>←{n.connections.length} →{NODES.filter(x=>x.connections.includes(n.id)).length}</div>
    </div>)}
  </div>;
}

// ═══════════════════════════════════════════════════════
function Detail({node,all,onClose,nav,fmt,pws}) {
  const inf=node.connections.map(c=>all.find(n=>n.id===c)).filter(Boolean);
  const infd=all.filter(n=>n.connections.includes(node.id));
  const era=ERA_LABELS[node.era];
  const tc=THEME_COLORS[node.themes[0]];
  const memberOf=pws.filter(p=>p.nodes.includes(node.id));

  return <div>
    <button onClick={onClose} style={{float:"right",background:"transparent",border:"none",color:"#52525B",cursor:"pointer",fontSize:16,fontFamily:"inherit"}}>×</button>
    <div style={{display:"inline-block",padding:"2px 6px",borderRadius:3,fontSize:8,background:era.color+"22",color:era.color,border:`1px solid ${era.color}44`,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>{era.name}</div>
    {memberOf.map(pw=><div key={pw.id} style={{display:"inline-block",padding:"2px 6px",borderRadius:3,fontSize:8,background:pw.color+"15",color:pw.color,border:`1px solid ${pw.color}33`,marginLeft:4,letterSpacing:"0.04em"}}>⟶ {pw.name}</div>)}
    <h2 style={{fontSize:15,fontWeight:600,margin:"6px 0",lineHeight:1.2,color:"#F4F4F5",letterSpacing:"-0.02em"}}>{node.title}</h2>
    <div style={{fontSize:10,color:"#71717A",marginBottom:12}}>
      <span>{fmt(node.date)}</span><span style={{margin:"0 5px",opacity:0.4}}>·</span><span>{TYPE_ICONS[node.type]} {node.type}</span>
      {node.vindicated===true&&<><span style={{margin:"0 5px",opacity:0.4}}>·</span><span style={{color:"#16A34A"}}>✓ Vindicated</span></>}
      {node.vindicated===null&&<><span style={{margin:"0 5px",opacity:0.4}}>·</span><span style={{color:"#D97706"}}>⏳ Futures Bank</span></>}
    </div>
    <div style={{display:"flex",gap:3,marginBottom:12,flexWrap:"wrap"}}>
      {node.themes.map(t=><span key={t} style={{fontSize:8,padding:"2px 6px",borderRadius:3,background:THEME_COLORS[t]+"18",color:THEME_COLORS[t],border:`1px solid ${THEME_COLORS[t]}33`,fontWeight:t==="digital_art"?700:400}}>{THEME_LABELS[t]}</span>)}
    </div>
    <p style={{fontSize:11,lineHeight:1.6,color:"#D4D4D8",margin:"0 0 16px",paddingBottom:12,borderBottom:"1px solid #27272A"}}>{node.desc}</p>

    {inf.length>0&&<div style={{marginBottom:14}}>
      <h3 style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.06em",color:"#52525B",margin:"0 0 5px"}}>← Influenced By ({inf.length})</h3>
      {inf.map(i=><div key={i.id} onClick={()=>nav(i.id)} style={{padding:"5px 7px",marginBottom:2,borderRadius:3,cursor:"pointer",background:"#18181B",border:"1px solid #27272A",display:"flex",alignItems:"center",gap:5}}>
        <span style={{color:THEME_COLORS[i.themes[0]],fontSize:9}}>{TYPE_ICONS[i.type]}</span>
        <div><div style={{fontSize:10,color:"#D4D4D8",fontWeight:500}}>{i.title}</div><div style={{fontSize:8,color:"#52525B"}}>{fmt(i.date)} · {ERA_LABELS[i.era].name}</div></div>
      </div>)}
    </div>}

    {infd.length>0&&<div style={{marginBottom:14}}>
      <h3 style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.06em",color:"#52525B",margin:"0 0 5px"}}>→ Influenced ({infd.length})</h3>
      {infd.map(i=><div key={i.id} onClick={()=>nav(i.id)} style={{padding:"5px 7px",marginBottom:2,borderRadius:3,cursor:"pointer",background:"#18181B",border:"1px solid #27272A",display:"flex",alignItems:"center",gap:5}}>
        <span style={{color:THEME_COLORS[i.themes[0]],fontSize:9}}>{TYPE_ICONS[i.type]}</span>
        <div><div style={{fontSize:10,color:"#D4D4D8",fontWeight:500}}>{i.title}</div><div style={{fontSize:8,color:"#52525B"}}>{fmt(i.date)} · {ERA_LABELS[i.era].name}</div></div>
      </div>)}
    </div>}

    <div style={{borderTop:"1px solid #27272A",paddingTop:12}}>
      <h3 style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.06em",color:"#52525B",margin:"0 0 5px"}}>Provenance Chain</h3>
      <Chain node={node} all={all} nav={nav} fmt={fmt} d={0}/>
    </div>
  </div>;
}

function Chain({node,all,nav,fmt,d}) {
  if(d>4||!node.connections.length) return <div style={{paddingLeft:d*12,fontSize:9,color:"#52525B",marginBottom:1}}><span style={{color:THEME_COLORS[node.themes[0]]}}>●</span> {node.title} <span style={{opacity:0.5}}>— ROOT</span></div>;
  const ps=node.connections.map(c=>all.find(n=>n.id===c)).filter(Boolean);
  return <div>
    <div onClick={()=>nav(node.id)} style={{paddingLeft:d*12,fontSize:9,color:"#A1A1AA",marginBottom:1,cursor:"pointer"}}><span style={{color:THEME_COLORS[node.themes[0]]}}>●</span> {node.title} <span style={{color:"#52525B"}}>({fmt(node.date)})</span></div>
    {ps.map(p=><Chain key={p.id} node={p} all={all} nav={nav} fmt={fmt} d={d+1}/>)}
  </div>;
}
