import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const knowledgeDir = join(__dirname, "knowledge");
const MAX_CONTEXT_CHARS = 4200;
const MAX_ENTRY_CHARS = 1200;

let cachedEntries;

export async function findKnowledgeContext({ message, mode = "qa", enabled = true }) {
  if (!enabled) {
    return { context: "", matches: [] };
  }

  const entries = await loadKnowledgeEntries();
  const query = normalize(`${mode} ${message}`);
  const scored = entries
    .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
    .filter((item) => item.score >= 3 || item.entry.id === "core-triage")
    .sort((a, b) => b.score - a.score);

  const selected = ensureCoreEntry(scored, entries).slice(0, 3);
  const matches = selected.map(({ entry, score }) => ({
    id: entry.id,
    title: entry.title,
    score,
    sources: entry.sources
  }));

  const context = buildContext(selected.map((item) => item.entry));
  return { context, matches };
}

async function loadKnowledgeEntries() {
  if (cachedEntries) return cachedEntries;

  const files = (await readdir(knowledgeDir)).filter((file) => file.endsWith(".md")).sort();
  cachedEntries = await Promise.all(
    files.map(async (file) => {
      const raw = await readFile(join(knowledgeDir, file), "utf8");
      const { metadata, body } = parseEntry(raw);
      return {
        id: metadata.id || file.replace(/\.md$/, ""),
        title: metadata.title || file.replace(/\.md$/, ""),
        keywords: splitList(metadata.keywords),
        sources: splitSources(metadata.sources),
        body
      };
    })
  );

  return cachedEntries;
}

function parseEntry(raw) {
  if (!raw.startsWith("---")) {
    return { metadata: {}, body: raw.trim() };
  }

  const end = raw.indexOf("\n---", 3);
  if (end === -1) {
    return { metadata: {}, body: raw.trim() };
  }

  const metadata = {};
  const header = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).trim();

  for (const line of header.split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    metadata[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }

  return { metadata, body };
}

function splitList(value = "") {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitSources(value = "") {
  return value
    .split(";")
    .map((item) => {
      const [title, url] = item.split("|").map((part) => part?.trim());
      return title && url ? { title, url } : null;
    })
    .filter(Boolean);
}

function scoreEntry(entry, query) {
  let score = 0;
  const content = normalize(`${entry.title} ${entry.keywords.join(" ")} ${entry.body}`);

  for (const keyword of entry.keywords) {
    const normalizedKeyword = normalize(keyword);
    if (normalizedKeyword && query.includes(normalizedKeyword)) score += 8;
  }

  for (const token of query.split(/\s+/).filter((item) => item.length >= 2)) {
    if (content.includes(token)) score += 1;
  }

  if (query.includes(normalize(entry.title))) score += 12;
  return score;
}

function ensureCoreEntry(scored, entries) {
  const hasCore = scored.some((item) => item.entry.id === "core-triage");
  if (hasCore) return scored;

  const core = entries.find((entry) => entry.id === "core-triage");
  return core ? [...scored, { entry: core, score: 0 }] : scored;
}

function buildContext(entries) {
  let context = "";

  for (const entry of entries) {
    const sourceLines = entry.sources
      .map((source) => `- ${source.title}: ${source.url}`)
      .join("\n");
    const section = [
      `## ${entry.title}`,
      entry.body.slice(0, MAX_ENTRY_CHARS),
      sourceLines ? `참고 출처:\n${sourceLines}` : ""
    ]
      .filter(Boolean)
      .join("\n\n");

    if (context.length + section.length > MAX_CONTEXT_CHARS) break;
    context += `${section}\n\n---\n\n`;
  }

  return context.trim();
}

function normalize(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
}
