#!/usr/bin/env bun
/**
 * Watcher em Tempo Real: Estudo -> Final
 * 
 * Monitora qualquer modificação salva em Estudo e
 * imediatamente higieniza e replica para Final.
 */

import fs from 'fs';
import path from 'path';
import { copyAndSanitizeFile } from './sync-versions.mjs';

const ROOT_DIR = process.cwd();
const ESTUDO_DIR = path.join(ROOT_DIR, 'Estudo');
const FINAL_DIR = path.join(ROOT_DIR, 'Final');

console.log('👀 Observador de alterações ativo...');
console.log('⚡ Monitorando pasta "Estudo/" para propagação automática e higienizada em "Final/"...\n');

let debounceTimer = null;
const changedFiles = new Set();

function processChangedFiles() {
  for (const relPath of changedFiles) {
    const srcPath = path.join(ESTUDO_DIR, relPath);
    const destPath = path.join(FINAL_DIR, relPath);

    if (fs.existsSync(srcPath)) {
      try {
        const stats = fs.statSync(srcPath);
        if (!stats.isDirectory()) {
          const destDir = path.dirname(destPath);
          if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
          copyAndSanitizeFile(srcPath, destPath);
          console.log(`✨ [Auto-Sync] Atualizado e higienizado: ${relPath}`);
        }
      } catch (err) {
        console.error(`❌ Erro ao sincronizar ${relPath}:`, err.message);
      }
    } else {
      // Arquivo deletado no Estudo
      if (fs.existsSync(destPath)) {
        try {
          fs.rmSync(destPath, { recursive: true, force: true });
          console.log(`🗑️  [Auto-Sync] Removido de Final: ${relPath}`);
        } catch {}
      }
    }
  }
  changedFiles.clear();
}

function handleFileEvent(filename) {
  if (!filename) return;
  if (
    filename.includes('node_modules') ||
    filename.includes('dist') ||
    filename.includes('.git') ||
    filename.endsWith('.sqlite') ||
    filename.endsWith('.sqlite-journal') ||
    filename.endsWith('.DS_Store')
  ) {
    return;
  }

  changedFiles.add(filename);
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(processChangedFiles, 300);
}

// Iniciar observação recursiva na pasta Estudo
try {
  fs.watch(ESTUDO_DIR, { recursive: true }, (eventType, filename) => {
    handleFileEvent(filename);
  });
} catch (err) {
  console.error('Falha ao iniciar fs.watch recursivo:', err.message);
}
