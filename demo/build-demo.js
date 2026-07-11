// Genera demo/ingea-demo.html: versión estática autocontenida de la web pública
// (para publicar como Artifact). Sin servidor: catálogo embebido, cursos en modal,
// verificación/admin muestran un aviso.
const fs = require('fs');
const path = require('path');
const raiz = path.join(__dirname, '..');
const { CURSOS, CONFIG } = require(path.join(raiz, 'data', 'cursos'));

const leer = (p) => fs.readFileSync(path.join(raiz, p), 'utf8');
const b64 = (p, mime) => `data:${mime};base64,` + fs.readFileSync(p).toString('base64');

// ---- imágenes optimizadas → data URI ----
const imgDir = path.join(__dirname, 'img');
const IMGS = {};
for (const f of fs.readdirSync(imgDir)) IMGS['/img/' + f] = b64(path.join(imgDir, f), 'image/jpeg');

// ---- fuentes variables → @font-face embebido ----
const nm = path.join(raiz, 'node_modules');
const fuente = (rel) => b64(path.join(nm, rel), 'font/woff2');
const fontCss = [
  ['Fraunces', 'normal', '@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2'],
  ['Fraunces', 'italic', '@fontsource-variable/fraunces/files/fraunces-latin-wght-italic.woff2'],
  ['Inter', 'normal', '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'],
  ['Space Grotesk', 'normal', '@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2'],
].map(([fam, estilo, rel]) =>
  `@font-face{font-family:'${fam}';font-style:${estilo};font-weight:100 900;font-display:swap;src:url(${fuente(rel)}) format('woff2-variations')}`
).join('\n');

// ---- fuentes de código ----
const css = leer('public/css/styles.css');
const mainJs = leer('public/js/main.js');
const gsapJs = fs.readFileSync(path.join(nm, 'gsap/dist/gsap.min.js'), 'utf8');
const stJs = fs.readFileSync(path.join(nm, 'gsap/dist/ScrollTrigger.min.js'), 'utf8');
const lenisJs = fs.readFileSync(path.join(nm, 'lenis/dist/lenis.min.js'), 'utf8');

// ---- cuerpo de la home adaptado ----
let body = leer('public/index.html').match(/<body>([\s\S]*)<\/body>/)[1];
body = body.replace(/\s*<script src="https:[^"]+"><\/script>/g, '');
body = body.replace('<script src="/js/main.js"></script>', '<!--LIBS-->');
body = body.replace("fetch('/api/cursos').then((r) => r.json())", 'Promise.resolve(window.__CURSOS)');
body = body.replace('href="/curso/${c.slug}"', 'href="#" data-curso="${c.slug}"');
for (const [ruta, uri] of Object.entries(IMGS)) body = body.split(ruta).join(uri);

const cursosDemo = CURSOS.map((c) => ({ ...c, imagen: IMGS[c.imagen] || c.imagen }));

// ---- CSS extra: modal de curso y aviso ----
const cssDemo = `
.velo { position: fixed; inset: 0; background: rgba(16,22,15,.55); backdrop-filter: blur(6px); z-index: 300;
  display: none; align-items: flex-start; justify-content: center; overflow-y: auto; padding: 4vh 18px 6vh; }
.velo.abierto { display: flex; }
.modal { background: var(--hueso); border-radius: 26px; max-width: 900px; width: 100%; overflow: hidden;
  position: relative; box-shadow: 0 50px 120px rgba(0,0,0,.4); animation: modalEntra .5s var(--curva); }
@keyframes modalEntra { from { opacity: 0; transform: translateY(40px) scale(.97); } }
.modal-cerrar { position: absolute; top: 16px; right: 16px; z-index: 5; width: 44px; height: 44px; border-radius: 50%;
  border: 0; background: rgba(16,22,15,.55); color: #fff; font-size: 20px; cursor: pointer; backdrop-filter: blur(6px); }
.modal-img { height: 250px; position: relative; }
.modal-img img { width: 100%; height: 100%; object-fit: cover; }
.modal-img::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(16,22,15,.72)); }
.modal-img .modal-titulo { position: absolute; left: 34px; right: 34px; bottom: 22px; z-index: 2; color: #fff; }
.modal-img .modal-titulo h3 { font-size: clamp(21px, 3vw, 30px); }
.modal-cuerpo { padding: 30px 36px 40px; }
.modal-ficha { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin: 4px 0 24px; }
.modal-ficha div { border: 1px solid var(--linea); border-radius: 14px; padding: 12px 16px; }
.modal-ficha span { font: 500 10.5px var(--f-mono); letter-spacing: .12em; text-transform: uppercase; color: var(--gris); display: block; }
.modal-ficha b { font-size: 14.5px; }
.modal-cuerpo h4 { font: 560 19px var(--f-display); margin: 22px 0 10px; }
.modal-cuerpo p.desc { color: var(--gris-700, #45524c); font-size: 14.5px; }
.modal-acciones { display: flex; gap: 12px; margin-top: 28px; flex-wrap: wrap; }
.aviso-panel { max-width: 480px; text-align: center; padding: 44px 40px; }
.aviso-panel h3 { font-size: 24px; margin: 14px 0 10px; }
.aviso-panel p { color: var(--gris); font-size: 14.5px; }
body.sin-scroll { overflow: hidden; }
`;

// ---- script demo: config embebida, modales, intercepción de enlaces ----
const jsDemo = `
INGEA.config = ${JSON.stringify(CONFIG)};
window.__CURSOS = ${JSON.stringify(cursosDemo)};

// ---- modal de detalle de curso + aviso de demo ----
(() => {
  const velo = document.createElement('div');
  velo.className = 'velo';
  velo.innerHTML = '<div class="modal" id="modalCaja"></div>';
  document.body.appendChild(velo);
  const caja = velo.querySelector('#modalCaja');

  const cerrar = () => { velo.classList.remove('abierto'); document.body.classList.remove('sin-scroll'); };
  velo.addEventListener('click', (e) => { if (e.target === velo) cerrar(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrar(); });

  const abrir = (html) => {
    caja.innerHTML = '<button class="modal-cerrar" aria-label="Cerrar">✕</button>' + html;
    caja.querySelector('.modal-cerrar').addEventListener('click', cerrar);
    velo.classList.add('abierto');
    velo.scrollTop = 0;
    document.body.classList.add('sin-scroll');
  };

  window.__abrirCurso = (slug) => {
    const c = window.__CURSOS.find((x) => x.slug === slug);
    if (!c) return;
    const ws = INGEA.linkWhatsApp('Hola INGEA, quiero inscribirme en el curso "' + c.nombre + '" (inicio ' + c.inicio + '). ¿Me envían el brochure y los pasos de matrícula?');
    abrir(\`
      <div class="modal-img"><img src="\${c.imagen}" alt="" />
        <div class="modal-titulo"><span class="micro claro">\${c.categoria}</span><h3>\${c.nombre}</h3></div>
      </div>
      <div class="modal-cuerpo">
        <div class="modal-ficha">
          <div><span>Inicio</span><b>\${c.inicio}</b></div>
          <div><span>Duración</span><b>\${c.semanas} semanas · \${c.horas} h</b></div>
          <div><span>Inversión pronto pago</span><b>\${INGEA.soles(c.precioProntoPago)} <s style="color:var(--gris);font-size:12px">\${INGEA.soles(c.precio)}</s></b></div>
          <div><span>Modalidad</span><b>En vivo + aula 24/7</b></div>
        </div>
        <p class="desc">\${c.descripcion}</p>
        <h4>Plan de estudios</h4>
        <div class="acordeon">\${c.modulos.map((m, i) => \`
          <details class="modulo" \${i === 0 ? 'open' : ''}><summary>Módulo \${i + 1} — \${m.titulo}</summary>
          <ul>\${m.temas.map((t) => '<li>' + t + '</li>').join('')}</ul></details>\`).join('')}
        </div>
        <h4>Docente</h4>
        <p class="desc"><b>\${c.docente.nombre}</b> — \${c.docente.titulo}</p>
        <div class="modal-acciones">
          <a class="btn btn-ws" href="\${ws}" target="_blank" rel="noopener">\${INGEA.svgWhatsApp(18)} Inscribirme por WhatsApp</a>
          <a class="btn btn-borde" href="\${ws}" target="_blank" rel="noopener">Pedir brochure PDF</a>
        </div>
      </div>\`);
  };

  window.__abrirAviso = () => {
    const ws = INGEA.linkWhatsApp('Hola INGEA, vi la página de demostración y quiero más información.');
    abrir(\`
      <div class="modal-cuerpo aviso-panel">
        <span class="micro" style="justify-content:center">Demo pública</span>
        <h3>Disponible en la versión completa</h3>
        <p>Esta es una demostración estática de la web de INGEA. La <b>verificación de certificados con QR</b>, el <b>panel administrativo</b> y los <b>brochures PDF</b> operan en la versión completa con servidor.</p>
        <div class="modal-acciones" style="justify-content:center">
          <a class="btn btn-ws" href="\${ws}" target="_blank" rel="noopener">\${INGEA.svgWhatsApp(18)} Contactar por WhatsApp</a>
        </div>
      </div>\`);
  };

  // intercepta la navegación interna (aquí no hay servidor)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    const slug = a.dataset.curso || (href.match(/^\\/curso\\/(.+)$/) || [])[1];
    if (slug) { e.preventDefault(); window.__abrirCurso(slug); return; }
    if (/^\\/(verificar|admin)/.test(href)) { e.preventDefault(); window.__abrirAviso(); return; }
    if (href === '/' ) { e.preventDefault(); (INGEA._lenis ? INGEA._lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' })); return; }
    if (href.startsWith('/#')) {
      const destino = document.querySelector(href.slice(1));
      if (destino) { e.preventDefault(); (INGEA._lenis ? INGEA._lenis.scrollTo(destino, { offset: -72 }) : destino.scrollIntoView({ behavior: 'smooth' })); }
    }
  });
})();
`;

// ---- ensamblado (fragmento: el Artifact envuelve con doctype/head/body) ----
const salida = `<title>INGEA — Especialización en Ingeniería Ambiental</title>
<style>
${fontCss}
${css}
${cssDemo}
</style>
${body.replace('<!--LIBS-->', `<script>${gsapJs}</script>
<script>${stJs}</script>
<script>${lenisJs}</script>
<script>${mainJs}</script>
<script>${jsDemo}</script>`)}
`;

const destino = path.join(__dirname, 'ingea-demo.html');
fs.writeFileSync(destino, salida, 'utf8');
console.log('OK →', destino, Math.round(fs.statSync(destino).size / 1024), 'KB');
