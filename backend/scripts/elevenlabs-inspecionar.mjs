// Inspeciona modelos e vozes disponíveis na conta ElevenLabs (uso pontual).
// Execução: node scripts/elevenlabs-inspecionar.mjs
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const env = Object.fromEntries(
  readFileSync(resolve(raiz, '.env'), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
);

const chave = env.ELEVENLABS_API_KEY;
if (!chave) throw new Error('ELEVENLABS_API_KEY ausente no backend/.env');

const cabecalhos = { 'xi-api-key': chave };

const modelos = await (await fetch('https://api.elevenlabs.io/v1/models', { headers: cabecalhos })).json();
console.log('=== MODELOS ===');
for (const m of Array.isArray(modelos) ? modelos : []) {
  const pt = (m.languages || []).some((l) => l.language_id === 'pt');
  console.log(`${m.model_id} | ${m.name} | tts=${m.can_do_text_to_speech} | pt=${pt}`);
}
if (!Array.isArray(modelos)) console.log(JSON.stringify(modelos).slice(0, 500));

const vozes = await (await fetch('https://api.elevenlabs.io/v1/voices', { headers: cabecalhos })).json();
console.log('\n=== VOZES ===');
for (const v of vozes.voices || []) {
  const l = v.labels || {};
  console.log(`${v.voice_id} | ${v.name} | ${v.category} | ${l.gender || ''} | ${l.accent || ''} | ${l.language || ''} | ${l.use_case || ''}`);
}
if (!vozes.voices) console.log(JSON.stringify(vozes).slice(0, 500));

const assinatura = await (await fetch('https://api.elevenlabs.io/v1/user/subscription', { headers: cabecalhos })).json();
console.log('\n=== CRÉDITOS ===');
console.log(`tier=${assinatura.tier} usados=${assinatura.character_count} limite=${assinatura.character_limit}`);
