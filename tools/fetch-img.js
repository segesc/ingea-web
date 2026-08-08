// Descarga las fotografías del sitio (Unsplash, licencia libre) en public/img.
// Se ejecuta en el build de Render para no versionar binarios en el repo.
const fs = require('fs');
const path = require('path');

const FOTOS = {
  'hero-panorama': 'photo-1501854140801-50d01698950b',
  'curso-iga': 'photo-1454165804606-c3d57bc86b40',
  'curso-eia': 'photo-1477959858617-67f85cf4f1df',
  'curso-fiscalizacion': 'photo-1504328345606-18bbc8c9d7d1',
  'curso-monitoreo': 'photo-1576086213369-97a306d36557',
  'curso-residuos': 'photo-1583258292688-d0213dc5a3a8',
  'curso-iso': 'photo-1552664730-d307ca884978',
  'curso-proyectos': 'photo-1581091226825-a6a2a5aee158',
  'curso-minas': 'photo-1464822759023-fed622ff2c3b',
  'curso-sig': 'photo-1524661135-423995f22d0b',
  'curso-carbono': 'photo-1518623001395-125242310d0c',
  'curso-ssoma': 'photo-1587293852726-70cdb56c2866',
  'curso-hidrico': 'photo-1502472584811-0a2f2feb8968',
  'curso-datos': 'photo-1551288049-bebda4e38f71',
  'curso-informes': 'photo-1455390582262-044cdead277a',
  'gal-turbinas': 'photo-1466611653911-95081537e5b7',
  'gal-solar': 'photo-1509391366360-2e959784a276',
  'gal-bosque': 'photo-1441974231531-c6227db76b6e',
  'gal-niebla': 'photo-1470071459604-3b5ec3a7fe05',
  'gal-campo': 'photo-1500382017468-9049fed747ef',
  'retrato-1': 'photo-1494790108377-be9c29b29330',
  'retrato-2': 'photo-1507003211169-0a1dd7228f2d',
  'retrato-3': 'photo-1438761681033-6461ffad8d80',
};

const destino = path.join(__dirname, '..', 'public', 'img');
fs.mkdirSync(destino, { recursive: true });

async function bajar(nombre, id, intento = 1) {
  const archivo = path.join(destino, `${nombre}.jpg`);
  if (fs.existsSync(archivo) && fs.statSync(archivo).size > 10000) {
    console.log(`ya existe  ${nombre}.jpg`);
    return;
  }
  const url = `https://images.unsplash.com/${id}?w=1400&q=72&auto=format&fit=crop`;
  try {
    const r = await fetch(url, { redirect: 'follow' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 10000) throw new Error(`respuesta sospechosa (${buf.length} bytes)`);
    fs.writeFileSync(archivo, buf);
    console.log(`descargada ${nombre}.jpg (${Math.round(buf.length / 1024)} KB)`);
  } catch (e) {
    if (intento < 3) {
      console.warn(`reintento ${intento + 1} para ${nombre}: ${e.message}`);
      await new Promise((res) => setTimeout(res, 1500 * intento));
      return bajar(nombre, id, intento + 1);
    }
    console.error(`FALLO ${nombre}.jpg: ${e.message} (el sitio seguirá funcionando sin esa imagen)`);
  }
}

(async () => {
  for (const [nombre, id] of Object.entries(FOTOS)) await bajar(nombre, id);
  console.log('Imágenes listas.');
})();
