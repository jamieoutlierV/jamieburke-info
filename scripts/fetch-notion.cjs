const fs = require('fs');
const path = require('path');

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = 'f16e020d9ff74759888a556b3cc9415a';
const NOTION_VERSION = '2022-06-28';

if (!NOTION_API_KEY) {
  console.warn('NOTION_API_KEY not set — using fallback data.json if it exists');
  process.exit(0);
}

async function notionFetch(url, body = null) {
  const opts = {
    method: body ? 'POST' : 'GET',
    headers: {
      'Authorization': `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const resp = await fetch(url, opts);
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Notion API ${resp.status}: ${text}`);
  }
  return resp.json();
}

async function queryAllPages() {
  let allPages = [];
  let startCursor = undefined;
  let hasMore = true;
  while (hasMore) {
    const body = { page_size: 100 };
    if (startCursor) body.start_cursor = startCursor;
    const data = await notionFetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      body
    );
    allPages = allPages.concat(data.results);
    hasMore = data.has_more;
    startCursor = data.next_cursor;
  }
  return allPages;
}

function richTextToPlain(arr) {
  if (!arr || !Array.isArray(arr)) return '';
  return arr.map(rt => rt.plain_text || '').join('');
}
function selectVal(prop) { return prop?.select?.name || null; }
function multiSelectVals(prop) {
  if (!prop?.multi_select) return [];
  return prop.multi_select.map(ms => ms.name);
}
function dateVal(prop) { return prop?.date?.start || null; }
function urlVal(prop) { return prop?.url || null; }
function checkboxVal(prop) { return prop?.checkbox || false; }
function numberVal(prop) { return prop?.number ?? null; }
function relationIds(prop) {
  if (!prop?.relation) return [];
  return prop.relation.map(r => r.id);
}

function transformPage(page) {
  const p = page.properties;
  return {
    notionId: page.id,
    nodeId: richTextToPlain(p['Node ID']?.rich_text),
    title: richTextToPlain(p['Title']?.title),
    date: dateVal(p['Date']),
    era: selectVal(p['Era']),
    type: selectVal(p['Type']),
    themes: multiSelectVals(p['Themes']),
    pathway: selectVal(p['Pathway']),
    description: richTextToPlain(p['Description']),
    sourceUrl: urlVal(p['Source URL']),
    sourceChannel: selectVal(p['Source Channel']),
    verificationLevel: selectVal(p['Verification Level']),
    verificationSources: richTextToPlain(p['Verification Sources']?.rich_text),
    vindicated: selectVal(p['Vindicated']),
    influencedByIds: relationIds(p['Influenced By']),
    archived: checkboxVal(p['Archived']),
    needsReview: checkboxVal(p['Needs Review']),
    agentConfidence: numberVal(p['Agent Confidence']),
    wordCount: numberVal(p['Word Count']),
    contentHash: richTextToPlain(p['Content Hash']?.rich_text),
    ipfsCid: richTextToPlain(p['IPFS CID']?.rich_text),
    arweaveTx: richTextToPlain(p['Arweave TX']?.rich_text),
    attestationUid: urlVal(p['Attestation UID']),
    timestampProof: urlVal(p['Timestamp Proof']),
    waybackUrl: urlVal(p['Wayback URL']),
    // Media-specific fields
    mediaFormat: selectVal(p['Media Format']),
    platform: richTextToPlain(p['Platform']?.rich_text),
    role: selectVal(p['Role']),
  };
}

async function main() {
  console.log('Fetching from Notion Provenance Graph...');
  const pages = await queryAllPages();
  console.log(`  Found ${pages.length} nodes`);

  const nodes = pages.map(transformPage).filter(n => !n.archived);
  console.log(`  ${nodes.length} active (non-archived) nodes`);

  const idMap = {};
  nodes.forEach(n => { idMap[n.notionId] = n.nodeId; });

  nodes.forEach(n => {
    n.connections = n.influencedByIds.map(nid => idMap[nid]).filter(Boolean);
    delete n.influencedByIds;
    delete n.notionId;
  });

  nodes.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  const output = {
    generatedAt: new Date().toISOString(),
    nodeCount: nodes.length,
    nodes,
  };

  const outPath = path.join(__dirname, '..', 'src', 'data.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`Wrote ${outPath} (${nodes.length} nodes)`);
}

main().catch(err => {
  console.error('Notion fetch failed:', err.message);
  if (fs.existsSync(path.join(__dirname, '..', 'src', 'data.json'))) {
    console.log('  Using existing data.json as fallback');
  } else {
    process.exit(1);
  }
});
