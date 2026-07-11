// INGEA — servidor principal
// Web pública + API + panel de administración de certificados con QR de trazabilidad.

const express = require('express');
const path = require('path');
const crypto = require('crypto');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const { CURSOS, CONFIG } = require('./data/cursos');
const almacen = require('./data/almacen');

const app = express();
const PORT = process.env.PORT || 4173;

// Credenciales del administrador (cambiar en producción vía variables de entorno)
const ADMIN_USER = process.env.INGEA_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.INGEA_ADMIN_PASS || 'ingea2026';
const sessions = new Map(); // token -> { user, creado }

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- persistencia de certificados (ver data/almacen.js) ----------
function genCodigo(certs) {
  const year = new Date().getFullYear();
  let code;
  do {
    code = `INGEA-${year}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  } while (certs.some((c) => c.codigo === code));
  return code;
}
function baseUrl(req) {
  return `${req.protocol}://${req.get('host')}`;
}

// ---------- auth ----------
function requireAdmin(req, res, next) {
  const token = req.get('x-admin-token');
  if (token && sessions.has(token)) return next();
  res.status(401).json({ error: 'No autorizado' });
}

app.post('/api/admin/login', (req, res) => {
  const { usuario, clave } = req.body || {};
  if (usuario === ADMIN_USER && clave === ADMIN_PASS) {
    const token = crypto.randomBytes(24).toString('hex');
    sessions.set(token, { user: usuario, creado: Date.now() });
    return res.json({ token });
  }
  res.status(401).json({ error: 'Usuario o clave incorrectos' });
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
  sessions.delete(req.get('x-admin-token'));
  res.json({ ok: true });
});

// ---------- API pública ----------
app.get('/api/config', (req, res) => res.json(CONFIG));

app.get('/api/cursos', (req, res) => {
  res.json(
    CURSOS.map(({ slug, nombre, categoria, icono, color, imagen, resumen, horas, semanas, modalidad, inicio, precio, precioProntoPago }) => ({
      slug, nombre, categoria, icono, color, imagen, resumen, horas, semanas, modalidad, inicio, precio, precioProntoPago,
    }))
  );
});

app.get('/api/cursos/:slug', (req, res) => {
  const curso = CURSOS.find((c) => c.slug === req.params.slug);
  if (!curso) return res.status(404).json({ error: 'Curso no encontrado' });
  res.json(curso);
});

// Verificación pública de certificados (trazabilidad del QR)
app.get('/api/verificar/:codigo', (req, res) => {
  const codigo = req.params.codigo.trim().toUpperCase();
  const cert = almacen.listar().find((c) => c.codigo === codigo);
  if (!cert) return res.json({ valido: false });
  res.json({
    valido: cert.estado === 'vigente',
    certificado: {
      codigo: cert.codigo,
      nombre: cert.nombre,
      tipoDoc: cert.tipoDoc,
      documento: cert.documento,
      curso: cert.cursoNombre,
      horas: cert.horas,
      fechaInicio: cert.fechaInicio,
      fechaFin: cert.fechaFin,
      fechaEmision: cert.fechaEmision,
      estado: cert.estado,
    },
  });
});

// QR del certificado — apunta a la página pública de verificación
app.get('/api/qr/:codigo', async (req, res) => {
  const codigo = req.params.codigo.trim().toUpperCase();
  const url = `${baseUrl(req)}/verificar/${codigo}`;
  try {
    const png = await QRCode.toBuffer(url, {
      type: 'png', width: 360, margin: 1,
      color: { dark: '#1C3A26', light: '#FFFFFF' },
    });
    res.type('png').send(png);
  } catch (e) {
    res.status(500).json({ error: 'No se pudo generar el QR' });
  }
});

// ---------- Brochure PDF por curso ----------
app.get('/api/brochure/:slug', (req, res) => {
  const curso = CURSOS.find((c) => c.slug === req.params.slug);
  if (!curso) return res.status(404).json({ error: 'Curso no encontrado' });

  const doc = new PDFDocument({ size: 'A4', margins: { top: 0, bottom: 40, left: 0, right: 0 } });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="brochure-${curso.slug}.pdf"`);
  doc.pipe(res);

  const W = doc.page.width; // 595
  const verde = '#1C3A26';
  const acento = '#EFAF3C';
  const M = 48;

  // Portada / cabecera
  doc.rect(0, 0, W, 190).fill(verde);
  doc.rect(0, 190, W, 6).fill(acento);
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(20).text(CONFIG.instituto, M, 36);
  doc.font('Helvetica').fontSize(9).fillColor('#CFDCC9').text(CONFIG.nombreCompleto, M, 62, { width: W - 2 * M });
  doc.font('Helvetica').fontSize(10).fillColor(acento).text('CURSO DE ESPECIALIZACIÓN', M, 96);
  doc.font('Helvetica-Bold').fontSize(19).fillColor('#FFFFFF').text(curso.nombre, M, 112, { width: W - 2 * M });

  // Ficha rápida
  let y = 220;
  doc.font('Helvetica-Bold').fontSize(12).fillColor(verde).text('Ficha del programa', M, y);
  y += 20;
  const ficha = [
    ['Inicio', curso.inicio],
    ['Duración', `${curso.semanas} semanas — ${curso.horas} horas académicas`],
    ['Modalidad', curso.modalidad],
    ['Inversión', `S/ ${curso.precio}  (pronto pago: S/ ${curso.precioProntoPago})`],
    ['Docente', `${curso.docente.nombre} — ${curso.docente.titulo}`],
    ['Certificación', `Certificado por ${curso.horas} horas con código QR de verificación en línea`],
  ];
  doc.fontSize(10);
  for (const [k, v] of ficha) {
    doc.font('Helvetica-Bold').fillColor('#333333').text(`${k}:  `, M, y, { continued: true });
    doc.font('Helvetica').fillColor('#444444').text(v, { width: W - 2 * M - 60 });
    y = doc.y + 6;
  }

  // Descripción
  y += 8;
  doc.font('Helvetica-Bold').fontSize(12).fillColor(verde).text('Presentación', M, y);
  doc.font('Helvetica').fontSize(10).fillColor('#444444').text(curso.descripcion, M, doc.y + 6, { width: W - 2 * M, lineGap: 2 });

  // Dirigido a
  doc.font('Helvetica-Bold').fontSize(12).fillColor(verde).text('Dirigido a', M, doc.y + 16);
  doc.font('Helvetica').fontSize(10).fillColor('#444444');
  for (const d of curso.dirigido) doc.text(`•  ${d}`, M + 6, doc.y + 4, { width: W - 2 * M - 12 });

  // Plan de estudios (nueva página)
  doc.addPage({ size: 'A4', margins: { top: 48, bottom: 40, left: 48, right: 48 } });
  doc.rect(0, 0, W, 10).fill(verde);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(verde).text('Plan de estudios', M, 40);
  curso.modulos.forEach((m, i) => {
    doc.moveDown(0.8);
    doc.font('Helvetica-Bold').fontSize(11).fillColor(acento).text(`Módulo ${i + 1}: `, M, doc.y, { continued: true });
    doc.fillColor('#222222').text(m.titulo);
    doc.font('Helvetica').fontSize(10).fillColor('#444444');
    for (const t of m.temas) doc.text(`•  ${t}`, M + 14, doc.y + 3);
  });

  // Contacto
  doc.moveDown(2);
  const cy = doc.y;
  doc.roundedRect(M, cy, W - 2 * M, 92, 8).fill('#EFEDE2');
  doc.font('Helvetica-Bold').fontSize(12).fillColor(verde).text('Informes e inscripciones', M + 18, cy + 14);
  doc.font('Helvetica').fontSize(10).fillColor('#333333')
    .text(`WhatsApp: ${CONFIG.whatsappDisplay}`, M + 18, cy + 34)
    .text(`Correo: ${CONFIG.email}`, M + 18, cy + 50)
    .text(`Web: ${CONFIG.web}  |  ${CONFIG.convenio}`, M + 18, cy + 66);

  doc.end();
});

// ---------- API admin: certificados ----------
app.get('/api/admin/certificados', requireAdmin, (req, res) => {
  res.json([...almacen.listar()].sort((a, b) => b.fechaEmision.localeCompare(a.fechaEmision)));
});

app.post('/api/admin/certificados', requireAdmin, async (req, res) => {
  const { nombre, tipoDoc, documento, cursoSlug, cursoNombre, horas, fechaInicio, fechaFin } = req.body || {};
  if (!nombre || !documento || !fechaInicio || !fechaFin || (!cursoSlug && !cursoNombre)) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  const curso = CURSOS.find((c) => c.slug === cursoSlug);
  const certs = almacen.listar();
  const cert = {
    codigo: genCodigo(certs),
    nombre: String(nombre).trim(),
    tipoDoc: tipoDoc || 'DNI',
    documento: String(documento).trim(),
    cursoSlug: curso ? curso.slug : null,
    cursoNombre: curso ? curso.nombre : String(cursoNombre).trim(),
    horas: Number(horas) || (curso ? curso.horas : 0),
    fechaInicio,
    fechaFin,
    fechaEmision: new Date().toISOString().slice(0, 10),
    estado: 'vigente',
  };
  certs.push(cert);
  try {
    await almacen.guardar(`Emite ${cert.codigo} — ${cert.cursoNombre}`);
  } catch (e) {
    certs.pop(); // sin persistencia no hay emisión válida
    console.error(e.message);
    return res.status(500).json({ error: 'No se pudo guardar el certificado en el registro. Reintenta.' });
  }
  res.status(201).json(cert);
});

app.post('/api/admin/certificados/:codigo/anular', requireAdmin, async (req, res) => {
  const cert = almacen.listar().find((c) => c.codigo === req.params.codigo.toUpperCase());
  if (!cert) return res.status(404).json({ error: 'Certificado no encontrado' });
  const anterior = cert.estado;
  cert.estado = cert.estado === 'vigente' ? 'anulado' : 'vigente';
  try {
    await almacen.guardar(`${cert.estado === 'anulado' ? 'Anula' : 'Reactiva'} ${cert.codigo}`);
  } catch (e) {
    cert.estado = anterior;
    console.error(e.message);
    return res.status(500).json({ error: 'No se pudo guardar el cambio de estado. Reintenta.' });
  }
  res.json(cert);
});

// ---------- páginas ----------
const page = (file) => (req, res) => res.sendFile(path.join(__dirname, 'public', file));
app.get('/curso/:slug', page('curso.html'));
app.get('/verificar', page('verificar.html'));
app.get('/verificar/:codigo', page('verificar.html'));
app.get('/admin', page('admin.html'));
app.get('/certificado/:codigo', page('certificado.html'));

almacen
  .iniciar()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`INGEA corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((e) => {
    console.error('No se pudo iniciar el almacén de certificados:', e.message);
    process.exit(1);
  });
