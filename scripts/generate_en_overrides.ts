/*
  Generate English overrides for services from src/data/services.ts
  Requirements:
  - Set environment variables for Azure Translator:
    AZURE_TRANSLATOR_KEY, AZURE_TRANSLATOR_ENDPOINT (e.g. https://api.cognitive.microsofttranslator.com), AZURE_TRANSLATOR_REGION
  Usage:
    npx ts-node scripts/generate_en_overrides.ts
  Output:
    - Writes src/data/services_en_overrides.json
*/

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = path.resolve(__dirname, '..');
const SRC_FILE = path.join(ROOT, 'src', 'data', 'services.ts');
const OUT_FILE = path.join(ROOT, 'src', 'data', 'services_en_overrides.json');

const requiredFields = [
  'packageName',
  'painPoint',
  'persuasiveDescription',
  'keyDeliverables',
  'quantifiableBenefit',
  'example',
] as const;

type FieldKey = typeof requiredFields[number];

type Overrides = Record<string, Partial<Record<FieldKey, string>>>;

const AZURE_ENDPOINT = process.env.AZURE_TRANSLATOR_ENDPOINT?.replace(/\/$/, '') || '';
const AZURE_KEY = process.env.AZURE_TRANSLATOR_KEY || '';
const AZURE_REGION = process.env.AZURE_TRANSLATOR_REGION || '';

async function translateBatchRUtoEN(texts: string[]): Promise<string[]> {
  if (!AZURE_ENDPOINT || !AZURE_KEY) {
    console.warn('[translate] Azure Translator not configured. Returning source text as fallback.');
    return texts; // fallback: no translation
  }

  const url = `${AZURE_ENDPOINT}/translate?api-version=3.0&from=ru&to=en`;
  const body = texts.map(t => ({ text: t }));

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': AZURE_KEY,
      ...(AZURE_REGION ? { 'Ocp-Apim-Subscription-Region': AZURE_REGION } : {}),
      'Content-Type': 'application/json',
      'X-ClientTraceId': crypto.randomUUID(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.warn(`[translate] Azure error ${res.status}: ${await res.text()}`);
    return texts; // fallback
  }

  const data: any = await res.json();
  // Expected shape: [ { translations: [ { text: '...' } ] }, ... ]
  return data.map((item: any, i: number) => item?.translations?.[0]?.text ?? texts[i]);
}

function extractServicesBlocks(source: string) {
  // Very lightweight parser based on packageId markers
  const blocks: { id: string; content: string }[] = [];
  const regex = /\{\s*packageId:\s*'([^']+)'[\s\S]*?\n\s*\}/g; // greedy within one level object
  let match: RegExpExecArray | null;
  while ((match = regex.exec(source))) {
    const full = match[0];
    const id = match[1];
    blocks.push({ id, content: full });
  }
  return blocks;
}

function pickField(block: string, key: string): string | null {
  // Match key: '...'
  const reg = new RegExp(`${key}\\s*:\\s*([\"][\\s\\S]*?[\"]|'[\\s\\S]*?')`, 'm');
  const m = reg.exec(block);
  if (!m) return null;
  let raw = m[1];
  if ((raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith('"') && raw.endsWith('"'))) {
    raw = raw.slice(1, -1);
  }
  // Unescape simple sequences
  return raw.replace(/\\n/g, '\n').replace(/\\'/g, "'").replace(/\\"/g, '"');
}

async function main() {
  const src = fs.readFileSync(SRC_FILE, 'utf8');
  const blocks = extractServicesBlocks(src);
  if (!blocks.length) {
    console.error('No service blocks found.');
    process.exit(1);
  }

  const overrides: Overrides = {};

  for (const { id, content } of blocks) {
    const ruValues: Partial<Record<FieldKey, string>> = {};
    for (const key of requiredFields) {
      const v = pickField(content, key);
      if (v) ruValues[key] = v;
    }

    // Gather texts to translate preserving order
    const keysToTranslate = requiredFields.filter(k => !!ruValues[k]) as FieldKey[];
    const texts = keysToTranslate.map(k => ruValues[k] as string);
    const translated = await translateBatchRUtoEN(texts);

    overrides[id] = {};
    translated.forEach((t, idx) => {
      const k = keysToTranslate[idx];
      overrides[id]![k] = t;
    });
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(overrides, null, 2), 'utf8');
  console.log(`Written EN overrides: ${OUT_FILE}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});