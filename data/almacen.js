// Almacén de certificados con persistencia en GitHub (repo privado de datos).
//
// Modo GitHub (producción): define las variables de entorno
//   GITHUB_TOKEN      - fine-grained PAT con permiso Contents: Read/Write SOLO sobre el repo de datos
//   GITHUB_DATA_REPO  - p.ej. "Segcd/ingea-datos"
// Cada guardado es un commit: el historial del repo es la traza inmutable de emisiones.
//
// Modo local (desarrollo): sin esas variables, usa data/certificados.json como siempre.

const fs = require('fs');
const path = require('path');

const ARCHIVO_LOCAL = path.join(__dirname, 'certificados.json');
const TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_DATA_REPO;
const RUTA = 'certificados.json';
const API = `https://api.github.com/repos/${REPO}/contents/${RUTA}`;

let certs = [];
let sha = null; // sha del blob remoto, requerido por la API para actualizar
let cola = Promise.resolve(); // serializa los guardados para evitar carreras de sha

const modoGitHub = () => Boolean(TOKEN && REPO);

function cabeceras() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'ingea-web',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

async function subir(mensaje) {
  const body = {
    message: mensaje,
    content: Buffer.from(JSON.stringify(certs, null, 2)).toString('base64'),
  };
  if (sha) body.sha = sha;
  const r = await fetch(API, {
    method: 'PUT',
    headers: { ...cabeceras(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const detalle = await r.text().catch(() => '');
    throw new Error(`GitHub datos: no se pudo guardar (${r.status}) ${detalle.slice(0, 200)}`);
  }
  sha = (await r.json()).content.sha;
}

async function iniciar() {
  if (!modoGitHub()) {
    try {
      certs = JSON.parse(fs.readFileSync(ARCHIVO_LOCAL, 'utf8'));
    } catch {
      certs = [];
    }
    console.log(`Almacén local: ${certs.length} certificados (sin GITHUB_TOKEN/GITHUB_DATA_REPO)`);
    return;
  }
  const r = await fetch(API, { headers: cabeceras() });
  if (r.ok) {
    const j = await r.json();
    sha = j.sha;
    certs = JSON.parse(Buffer.from(j.content, 'base64').toString('utf8'));
  } else if (r.status === 404) {
    certs = [];
    await subir('Inicializa el registro de certificados');
  } else {
    const detalle = await r.text().catch(() => '');
    throw new Error(`GitHub datos: no se pudo leer (${r.status}) ${detalle.slice(0, 200)}`);
  }
  console.log(`Almacén GitHub (${REPO}): ${certs.length} certificados`);
}

// Lista viva en memoria: las rutas la leen y la mutan, y luego llaman a guardar().
function listar() {
  return certs;
}

// Persiste el estado actual. En modo GitHub devuelve una promesa que falla si
// el commit no se pudo hacer (el llamador decide si eso invalida la operación).
function guardar(mensaje) {
  if (modoGitHub()) {
    cola = cola.then(() => subir(mensaje));
    // aísla a los siguientes de un fallo previo, pero propaga el error al llamador actual
    const resultado = cola;
    cola = cola.catch(() => {});
    return resultado;
  }
  fs.writeFileSync(ARCHIVO_LOCAL, JSON.stringify(certs, null, 2), 'utf8');
  return Promise.resolve();
}

module.exports = { iniciar, listar, guardar, modoGitHub };
