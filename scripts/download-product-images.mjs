import fs from 'fs';
import path from 'path';
import https from 'https';

const IMAGES = {
  109: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=80', // Polo
  110: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80', // Blazer
  111: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80', // Camisa Social
  112: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80', // Calca Alfaiataria
  113: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80', // Sapato Social
  114: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80', // Tenis Casual
  115: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80', // Bermuda Chino
  116: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80', // Camisa Linho
  117: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80', // Sueter Tricot
  118: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80', // Vestido Floral
  119: 'https://images.unsplash.com/photo-1534126511673-b6899657816a?w=800&q=80', // Blusa Cropped
  120: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80', // Saia Midi
  121: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80', // Calca Pantalona
  122: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80', // Tenis Chunky
  123: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80', // Carteira Couro
  124: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', // Mochila
  125: 'https://images.unsplash.com/photo-1589756823695-278bc923f962?w=800&q=80', // Gravata Seda
  126: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&q=80', // Infantil Moletom
  127: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&q=80', // Camiseta Infantil
  128: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&q=80', // Bermuda Infantil
  129: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80', // Oculos Sol
  130: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', // Relogio
  131: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80', // Cardigan
  132: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', // Macacao
  133: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80', // Camisa Jeans
  134: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80', // Jaqueta Puffer
  135: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&q=80'  // Meia-calca
};

const dirs = [
  'Estudo/frontend/public/products',
  'Final/frontend/public/products'
];

dirs.forEach(d => fs.mkdirSync(d, { recursive: true }));

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode} for ${url}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Baixando imagens coerentes para os produtos 109 a 135...');
  for (const [code, url] of Object.entries(IMAGES)) {
    const fileName = `${code}.jpg`;
    const target1 = path.join('Estudo/frontend/public/products', fileName);
    const target2 = path.join('Final/frontend/public/products', fileName);

    try {
      await downloadFile(url, target1);
      fs.copyFileSync(target1, target2);
      console.log(`✔ Produto ${code}: ${fileName} baixado com sucesso.`);
    } catch (err) {
      console.error(`❌ Erro no produto ${code}:`, err.message);
    }
  }
  console.log('Todas as imagens foram baixadas e sincronizadas!');
}

run();
