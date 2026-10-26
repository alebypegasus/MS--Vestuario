import { build } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendDir = dirname(__dirname);

import { copyFileSync, mkdirSync } from 'fs';

async function run() {
  console.log('Building morphicons.bundle.js for HTML motion pitch player...');
  await build({
    configFile: false,
    build: {
      lib: {
        entry: resolve(frontendDir, 'src/morphicons-entry.ts'),
        name: 'Morphicons',
        formats: ['iife'],
        fileName: () => 'morphicons.bundle.js',
      },
      outDir: resolve(frontendDir, 'public/pitch'),
      emptyOutDir: false,
      minify: 'esbuild',
      sourcemap: false,
    },
  });

  const docPitchDir = resolve(dirname(frontendDir), 'documentação/s06/pitch');
  mkdirSync(docPitchDir, { recursive: true });
  copyFileSync(
    resolve(frontendDir, 'public/pitch/morphicons.bundle.js'),
    resolve(docPitchDir, 'morphicons.bundle.js')
  );
  copyFileSync(
    resolve(frontendDir, 'public/motion-pitch-player.html'),
    resolve(dirname(frontendDir), 'documentação/s06/motion-pitch-player.html')
  );

  console.log('Done! Bundles and motion-pitch-player.html synced successfully.');
}

run().catch((err) => {
  console.error('Error building morphicons bundle:', err);
  process.exit(1);
});
