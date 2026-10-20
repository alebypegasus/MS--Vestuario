/**
 * Gerador de narração do Motion Pitch (Sprint 6) via ElevenLabs — COM CACHE.
 *
 * - Lê o roteiro em frontend/public/pitch/roteiro.json
 * - Gera 1 MP3 por cena em frontend/public/pitch/audio/cena-XX.mp3
 * - Usa o endpoint /with-timestamps para obter o tempo de cada palavra (legenda karaokê sincronizada)
 * - Grava frontend/public/pitch/audio/manifest.json (duração + palavras por cena)
 * - CACHE: se o MP3 já existe e o hash (texto + voz + modelo + ajustes) não mudou, a cena NÃO é regerada.
 *
 * Uso:
 *   npm run pitch:audio            -> gera apenas o que falta / mudou
 *   npm run pitch:audio -- --force -> força regerar tudo
 *   npm run pitch:audio -- --cena 5 -> regera só a cena 5
 *
 * Variáveis (backend/.env):
 *   ELEVENLABS_API_KEY   (obrigatória, começa com "sk_")
 *   ELEVENLABS_VOICE_ID  (opcional; se ausente, escolhe uma voz PT-BR da conta ou um narrador multilíngue)
 *   ELEVENLABS_MODEL_ID  (opcional; se ausente, escolhe o modelo multilíngue mais recente disponível)
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ_BACKEND = dirname(dirname(fileURLToPath(import.meta.url)));
const RAIZ_PROJETO = dirname(RAIZ_BACKEND);
const ARQ_ROTEIRO = resolve(RAIZ_PROJETO, 'frontend/public/pitch/roteiro.json');
const DIR_AUDIO = resolve(RAIZ_PROJETO, 'frontend/public/pitch/audio');
const ARQ_MANIFEST = resolve(DIR_AUDIO, 'manifest.json');
const API = 'https://api.elevenlabs.io/v1';

// Narrador multilíngue premade (fallback caso a conta não tenha voz PT-BR própria)
const VOZ_FALLBACK = 'JBFqnCBsd6RMkjVDRZzb';
const AJUSTES_VOZ = { stability: 0.42, similarity_boost: 0.82, style: 0.3, use_speaker_boost: true, speed: 1.0 };

function lerEnv() {
  const caminho = resolve(RAIZ_BACKEND, '.env');
  if (!existsSync(caminho)) return {};
  return Object.fromEntries(
    readFileSync(caminho, 'utf8')
      .split(/\r?\n/)
      .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
      .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
  );
}

const args = process.argv.slice(2);
const FORCAR = args.includes('--force');
const idxCena = args.indexOf('--cena');
const SO_CENA = idxCena >= 0 ? Number(args[idxCena + 1]) : null;

const env = { ...lerEnv(), ...process.env };
const CHAVE = (env.ELEVENLABS_API_KEY || '').trim();

if (!CHAVE) {
  console.error('[ERRO] ELEVENLABS_API_KEY ausente em backend/.env');
  process.exit(1);
}
if (!CHAVE.startsWith('sk_')) {
  console.error(
    '[ERRO] A chave em ELEVENLABS_API_KEY não é uma API key válida.\n' +
      '       O valor informado parece ser o "Key ID". A chave real começa com "sk_" e só aparece\n' +
      '       no momento em que é criada em https://elevenlabs.io/app/settings/api-keys.\n' +
      '       Atualize backend/.env e rode novamente: npm run pitch:audio'
  );
  process.exit(1);
}

const cabecalhos = { 'xi-api-key': CHAVE, 'Content-Type': 'application/json' };

async function getJson(caminho) {
  const r = await fetch(`${API}${caminho}`, { headers: cabecalhos });
  if (!r.ok) throw new Error(`GET ${caminho} -> ${r.status} ${await r.text()}`);
  return r.json();
}

/** Escolhe o modelo multilíngue mais novo disponível (ex.: v4 > v3 > v2). */
async function escolherModelo() {
  if (env.ELEVENLABS_MODEL_ID) return env.ELEVENLABS_MODEL_ID;
  try {
    const modelos = await getJson('/models');
    const tts = modelos.filter((m) => m.can_do_text_to_speech);
    const versao = (id) => Number((id.match(/v(\d+)/) || [0, 0])[1]);
    const multi = tts
      .filter((m) => /multilingual/i.test(m.model_id))
      .sort((a, b) => versao(b.model_id) - versao(a.model_id));
    if (multi.length) return multi[0].model_id;
    const v3 = tts.find((m) => m.model_id === 'eleven_v3');
    if (v3) return v3.model_id;
  } catch (e) {
    console.warn('[AVISO] Não foi possível listar modelos:', e.message);
  }
  return 'eleven_multilingual_v2';
}

/** Prefere voz com rótulo de português/brasileiro; senão, narrador multilíngue. */
async function escolherVoz() {
  if (env.ELEVENLABS_VOICE_ID) return { id: env.ELEVENLABS_VOICE_ID, nome: '(definida no .env)' };
  try {
    const { voices = [] } = await getJson('/voices');
    const pt = voices.find((v) => {
      const l = v.labels || {};
      const txt = `${l.language || ''} ${l.accent || ''} ${v.name || ''}`.toLowerCase();
      return /\bpt\b|portug|brazil|brasil/.test(txt);
    });
    if (pt) return { id: pt.voice_id, nome: pt.name };
  } catch (e) {
    console.warn('[AVISO] Não foi possível listar vozes:', e.message);
  }
  return { id: VOZ_FALLBACK, nome: 'George (multilíngue)' };
}

/** Converte alinhamento por caractere em palavras com início/fim. */
function alinhamentoParaPalavras(al) {
  if (!al || !al.characters) return [];
  const palavras = [];
  let atual = null;
  al.characters.forEach((ch, i) => {
    const ini = al.character_start_times_seconds[i];
    const fim = al.character_end_times_seconds[i];
    if (/\s/.test(ch)) {
      if (atual) palavras.push(atual);
      atual = null;
      return;
    }
    if (!atual) atual = { w: '', s: ini, e: fim };
    atual.w += ch;
    atual.e = fim;
  });
  if (atual) palavras.push(atual);
  return palavras.map((p) => ({ w: p.w, s: +p.s.toFixed(3), e: +p.e.toFixed(3) }));
}

async function sintetizar(texto, vozId, modelo, anterior, proximo) {
  const corpo = { text: texto, model_id: modelo, voice_settings: AJUSTES_VOZ };
  if (anterior) corpo.previous_text = anterior;
  if (proximo) corpo.next_text = proximo;

  const url = `${API}/text-to-speech/${vozId}/with-timestamps?output_format=mp3_44100_128`;
  let r = await fetch(url, { method: 'POST', headers: cabecalhos, body: JSON.stringify(corpo) });

  // Alguns modelos não aceitam request stitching; tenta novamente sem contexto.
  if (r.status === 400 || r.status === 422) {
    delete corpo.previous_text;
    delete corpo.next_text;
    r = await fetch(url, { method: 'POST', headers: cabecalhos, body: JSON.stringify(corpo) });
  }
  if (!r.ok) throw new Error(`TTS ${r.status}: ${await r.text()}`);
  return r.json();
}

async function main() {
  const roteiro = JSON.parse(readFileSync(ARQ_ROTEIRO, 'utf8'));
  mkdirSync(DIR_AUDIO, { recursive: true });

  const anterior = existsSync(ARQ_MANIFEST) ? JSON.parse(readFileSync(ARQ_MANIFEST, 'utf8')) : { cenas: [] };
  const porId = new Map((anterior.cenas || []).map((c) => [c.id, c]));

  const modelo = await escolherModelo();
  const voz = await escolherVoz();
  console.log(`\n[ElevenLabs] modelo=${modelo} | voz=${voz.nome} (${voz.id})\n`);

  const saida = [];
  let geradas = 0;
  let reaproveitadas = 0;

  for (let i = 0; i < roteiro.cenas.length; i++) {
    const cena = roteiro.cenas[i];
    const arquivo = `cena-${String(cena.id).padStart(2, '0')}.mp3`;
    const caminho = resolve(DIR_AUDIO, arquivo);
    const hash = createHash('sha1')
      .update(JSON.stringify([cena.narracao, voz.id, modelo, AJUSTES_VOZ]))
      .digest('hex');

    const cache = porId.get(cena.id);
    const alvo = SO_CENA === null || SO_CENA === cena.id;
    const valido = Boolean(cache && cache.hash === hash && existsSync(caminho));
    // --force/--cena só regeram os alvos; sem flags, regera apenas o que falta ou mudou.
    const regenerar = FORCAR || SO_CENA !== null ? alvo : !valido;

    if (!regenerar) {
      if (cache) {
        saida.push(cache);
        reaproveitadas++;
        console.log(`  [cache] cena ${cena.id} — ${cena.rotulo}`);
      }
      continue;
    }

    process.stdout.write(`  [gerar] cena ${cena.id} — ${cena.rotulo} ... `);
    const resp = await sintetizar(
      cena.narracao,
      voz.id,
      modelo,
      roteiro.cenas[i - 1]?.narracao,
      roteiro.cenas[i + 1]?.narracao
    );
    writeFileSync(caminho, Buffer.from(resp.audio_base64, 'base64'));
    const palavras = alinhamentoParaPalavras(resp.alignment || resp.normalized_alignment);
    const duracao = palavras.length ? palavras[palavras.length - 1].e : cena.duracaoPadrao;
    saida.push({ id: cena.id, arquivo, hash, duracao: +duracao.toFixed(3), palavras });
    geradas++;
    console.log(`ok (${duracao.toFixed(1)}s)`);
  }

  const manifest = {
    geradoEm: new Date().toISOString(),
    modelo,
    voz: voz.nome,
    vozId: voz.id,
    cenas: saida.sort((a, b) => a.id - b.id),
  };
  writeFileSync(ARQ_MANIFEST, JSON.stringify(manifest, null, 2));

  const total = manifest.cenas.reduce((s, c) => s + c.duracao, 0);
  console.log(`\n[OK] ${geradas} gerada(s), ${reaproveitadas} do cache. Narração total: ${total.toFixed(1)}s`);
  console.log(`     Manifest: ${ARQ_MANIFEST}\n`);
}

main().catch((e) => {
  console.error('\n[ERRO]', e.message);
  process.exit(1);
});
