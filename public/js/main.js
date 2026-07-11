// INGEA — utilidades compartidas (config, logo, nav, WhatsApp, animaciones)

const INGEA = {
  config: null,
  _logoN: 0,

  async cargarConfig() {
    if (!this.config) {
      this.config = await fetch('/api/config').then((r) => r.json());
    }
    return this.config;
  },

  linkWhatsApp(mensaje) {
    const num = this.config ? this.config.whatsapp : '51987654321';
    return `https://wa.me/${num}?text=${encodeURIComponent(mensaje)}`;
  },

  soles(n) {
    return `S/ ${Number(n).toLocaleString('es-PE')}`;
  },

  // Logo institucional: escudo "D" pino + hoja verde + sol ámbar.
  // Usa máscaras para que el recorte alrededor de la hoja sea transparente
  // (funciona sobre fondos claros y oscuros).
  logoSVG(size = 40, tinta = '#1C3A26') {
    const id = `lg${++this._logoN}`;
    const hoja = 'M46 96 C44 70 58 46 96 40 C99 70 82 94 50 97 Z';
    const vena = 'M50 94 C56 74 68 58 88 48';
    return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="display:block">
      <defs>
        <mask id="${id}a">
          <rect width="100" height="100" fill="#fff"/>
          <path d="${hoja}" fill="#000" transform="translate(-6 -5) scale(1.12)"/>
        </mask>
        <mask id="${id}b">
          <path d="${hoja}" fill="#fff"/>
          <path d="${vena}" fill="none" stroke="#000" stroke-width="7" stroke-linecap="round"/>
        </mask>
      </defs>
      <path d="M14 8 H50 C74 8 90 25 90 48 C90 72 73 90 48 90 C35 90 24 84 14 73 Z"
            fill="none" stroke="${tinta}" stroke-width="9" mask="url(#${id}a)"/>
      <circle cx="44" cy="37" r="10" fill="#EFAF3C"/>
      <path d="${hoja}" fill="#5F9E4E" mask="url(#${id}b)"/>
    </svg>`;
  },

  icono(nombre, size = 20, color = 'currentColor') {
    const p = {
      doc: '<path d="M6 2h9l5 5v15H6z" fill="none" stroke="COL" stroke-width="1.8"/><path d="M15 2v5h5M9 12h8M9 16h8" stroke="COL" stroke-width="1.8" fill="none"/>',
      chart: '<path d="M4 20V6M4 20h16" stroke="COL" stroke-width="1.8"/><path d="M8 16v-4M12 16V8M16 16v-6" stroke="COL" stroke-width="2.4" stroke-linecap="round"/>',
      shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" fill="none" stroke="COL" stroke-width="1.8"/><path d="M9 12l2 2 4-4" stroke="COL" stroke-width="1.8" fill="none"/>',
      flask: '<path d="M10 3h4M11 3v6l-5.5 9.5A2 2 0 007.2 21h9.6a2 2 0 001.7-2.5L13 9V3" fill="none" stroke="COL" stroke-width="1.8"/><path d="M8.5 15h7" stroke="COL" stroke-width="1.8"/>',
      recycle: '<path d="M7 9l3-5h4l3 5M17 9l4 6-2 4h-5M7 9L3 15l2 4h5M9 19l-2 2m10-2l2 2M12 4l-1-2" fill="none" stroke="COL" stroke-width="1.7" stroke-linejoin="round"/>',
      badge: '<circle cx="12" cy="9" r="6" fill="none" stroke="COL" stroke-width="1.8"/><path d="M9 14l-1.5 7L12 18.5 16.5 21 15 14M12 6.5l.9 1.8 2 .3-1.4 1.4.3 2-1.8-.9-1.8.9.3-2-1.4-1.4 2-.3z" fill="none" stroke="COL" stroke-width="1.5"/>',
      target: '<circle cx="12" cy="12" r="9" fill="none" stroke="COL" stroke-width="1.8"/><circle cx="12" cy="12" r="5" fill="none" stroke="COL" stroke-width="1.8"/><circle cx="12" cy="12" r="1.6" fill="COL"/>',
      mountain: '<path d="M3 20l6-11 4 7 3-4 5 8z" fill="none" stroke="COL" stroke-width="1.8" stroke-linejoin="round"/><circle cx="17" cy="6" r="2" fill="none" stroke="COL" stroke-width="1.6"/>',
      check: '<path d="M4 12.5l5 5L20 6.5" stroke="COL" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
      reloj: '<circle cx="12" cy="12" r="9" fill="none" stroke="COL" stroke-width="1.8"/><path d="M12 7v5l3.5 2" stroke="COL" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
      cal: '<rect x="3" y="5" width="18" height="16" rx="2.5" fill="none" stroke="COL" stroke-width="1.8"/><path d="M3 9.5h18M8 3v4M16 3v4" stroke="COL" stroke-width="1.8"/>',
      video: '<rect x="2.5" y="6" width="13" height="12" rx="2.5" fill="none" stroke="COL" stroke-width="1.8"/><path d="M15.5 10.5l6-3.5v10l-6-3.5" fill="none" stroke="COL" stroke-width="1.8" stroke-linejoin="round"/>',
      flecha: '<path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="COL" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      flechaNE: '<path d="M7 17L17 7M9 7h8v8" fill="none" stroke="COL" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      qr: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h3v3h-3zM19 16v4h-4M17 12h4M12 12v2" fill="none" stroke="COL" stroke-width="1.7"/>',
    };
    const cuerpo = (p[nombre] || p.doc).replaceAll('COL', color);
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${cuerpo}</svg>`;
  },

  svgWhatsApp(size = 22) {
    return `<svg viewBox="0 0 32 32" width="${size}" height="${size}" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M16 3C9.4 3 4 8.3 4 14.9c0 2.6.8 5 2.3 7L4.6 28l6.3-1.6a12 12 0 0 0 5.1 1.1c6.6 0 12-5.3 12-11.9S22.6 3 16 3zm0 21.7c-1.6 0-3.2-.4-4.6-1.2l-.3-.2-3.7 1 1-3.6-.2-.3a9.6 9.6 0 0 1-1.8-5.5C6.4 9.6 10.7 5.3 16 5.3s9.6 4.3 9.6 9.6-4.3 9.8-9.6 9.8zm5.4-7.2c-.3-.1-1.7-.9-2-1s-.5-.1-.7.1c-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1a7.8 7.8 0 0 1-3.9-3.4c-.3-.5.3-.5.8-1.6.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5 1.9.8 2.6.9 3.6.8.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.7-.4z"/></svg>`;
  },

  navHTML() {
    return `
    <nav class="nav" id="navBar">
      <div class="contenedor nav-inner">
        <a href="/" class="logo">
          <span class="logo-marca">${this.logoSVG(38)}</span>
          <span class="logo-texto"><b>INGEA</b><small>Especialización ambiental</small></span>
        </a>
        <ul class="nav-links" id="navLinks">
          <li><a href="/#cursos">Cursos</a></li>
          <li><a href="/#instituto">Instituto</a></li>
          <li><a href="/#certificacion">Certificación</a></li>
          <li><a href="/#testimonios">Egresados</a></li>
          <li><a href="/verificar">Verificar certificado</a></li>
        </ul>
        <div class="nav-cta">
          <a class="btn btn-tinta btn-mag" id="navWs" href="#" target="_blank" rel="noopener">${this.svgWhatsApp(16)}<span>Escríbenos</span></a>
          <button class="hamburguesa" id="btnMenu" aria-label="Menú"><span></span><span></span></button>
        </div>
      </div>
    </nav>`;
  },

  footerHTML() {
    const c = this.config;
    return `
    <footer class="footer">
      <div class="contenedor">
        <div class="footer-top">
          <div class="footer-marca">
            <span class="logo-marca claro">${this.logoSVG(46, '#F4F1E8')}</span>
            <p>${c.nombreCompleto}.<br>${c.convenio}.</p>
          </div>
          <div class="footer-cols">
            <div>
              <h4>Instituto</h4>
              <ul>
                <li><a href="/#instituto">Por qué INGEA</a></li>
                <li><a href="/#certificacion">Certificación</a></li>
                <li><a href="/#testimonios">Egresados</a></li>
                <li><a href="/verificar">Verificar certificado</a></li>
              </ul>
            </div>
            <div>
              <h4>Cursos</h4>
              <ul>
                <li><a href="/curso/instrumentos-gestion-ambiental">Instrumentos de Gestión</a></li>
                <li><a href="/curso/fiscalizacion-ambiental-oefa">Fiscalización OEFA</a></li>
                <li><a href="/curso/monitoreo-calidad-ambiental">Monitoreo Ambiental</a></li>
                <li><a href="/#cursos">Ver todos ↗</a></li>
              </ul>
            </div>
            <div>
              <h4>Contacto</h4>
              <ul>
                <li><a href="#" data-ws="Hola INGEA, quiero información sobre sus cursos.">${c.whatsappDisplay}</a></li>
                <li><a href="mailto:${c.email}">${c.email}</a></li>
                <li>${c.direccion}</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="footer-gigante" aria-hidden="true">INGEA</div>
        <div class="footer-legal">
          <span>© ${new Date().getFullYear()} ${c.instituto} — Todos los derechos reservados.</span>
          <a href="/admin">Acceso administrativo</a>
        </div>
      </div>
    </footer>
    <a class="ws-flotante" id="wsFlotante" href="#" target="_blank" rel="noopener" aria-label="WhatsApp">${this.svgWhatsApp(28)}</a>`;
  },

  activarNav() {
    const btn = document.getElementById('btnMenu');
    const links = document.getElementById('navLinks');
    if (btn && links) btn.addEventListener('click', () => {
      links.classList.toggle('abierto');
      btn.classList.toggle('abierto');
    });
    const nav = document.getElementById('navBar');
    let ultimo = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      nav.classList.toggle('compacta', y > 40);
      // histéresis: solo ocultar/mostrar con desplazamientos claros, evita parpadeo con la rueda
      if (Math.abs(y - ultimo) > 12) {
        nav.classList.toggle('oculta', y > 320 && y > ultimo);
        ultimo = y;
      }
    }, { passive: true });
  },

  // Botones magnéticos (micro-interacción de escritorio)
  activarMagneticos() {
    if (matchMedia('(pointer: coarse)').matches) return;
    document.querySelectorAll('.btn-mag').forEach((b) => {
      b.addEventListener('mousemove', (e) => {
        const r = b.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        b.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
      });
      b.addEventListener('mouseleave', () => { b.style.transform = ''; });
    });
  },

  // Animaciones de scroll: GSAP si está disponible, IntersectionObserver como respaldo
  animar() {
    const prefiereQuieto = matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (window.gsap && window.ScrollTrigger && !prefiereQuieto) {
      gsap.registerPlugin(ScrollTrigger);

      // scroll suave con Lenis, sincronizado con ScrollTrigger
      ScrollTrigger.config({ ignoreMobileResize: true });
      if (window.Lenis) {
        const lenis = new Lenis({ lerp: 0.12, smoothWheel: true, wheelMultiplier: 1 });
        this._lenis = lenis;
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((t) => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);

        // anclas internas: desplazarse con Lenis (el smooth nativo pelearía con él)
        document.querySelectorAll('a[href*="#"]').forEach((a) => {
          const href = a.getAttribute('href');
          let url;
          try { url = new URL(href, location.href); } catch { return; }
          if (url.pathname !== location.pathname || !url.hash) return;
          a.addEventListener('click', (e) => {
            const destino = document.querySelector(url.hash);
            if (!destino) return;
            e.preventDefault();
            lenis.scrollTo(destino, { offset: -72, duration: 1.1 });
          });
        });
      }

      // recalcular posiciones cuando terminan de cargar las imágenes
      // (si no, los pins y triggers quedan desalineados y el scroll "se buguea")
      window.addEventListener('load', () => ScrollTrigger.refresh());

      // líneas del hero
      gsap.utils.toArray('[data-linea]').forEach((el, i) => {
        gsap.fromTo(el, { yPercent: 110 }, { yPercent: 0, duration: 1.1, delay: 0.15 + i * 0.12, ease: 'power4.out' });
      });
      gsap.utils.toArray('[data-fundido]').forEach((el, i) => {
        gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, delay: 0.7 + i * 0.1, ease: 'power3.out' });
      });

      // apariciones al hacer scroll
      gsap.utils.toArray('[data-subir]').forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 48 }, {
          opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 86%' },
        });
      });
      gsap.utils.toArray('[data-grupo]').forEach((grupo) => {
        gsap.fromTo(grupo.children, { opacity: 0, y: 40 }, {
          opacity: 1, y: 0, duration: 0.9, stagger: 0.09, ease: 'power3.out',
          scrollTrigger: { trigger: grupo, start: 'top 84%' },
        });
      });

      // contadores
      gsap.utils.toArray('[data-contar]').forEach((el) => {
        const fin = Number(el.dataset.contar);
        const obj = { n: 0 };
        gsap.to(obj, {
          n: fin, duration: 1.8, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
          onUpdate: () => { el.textContent = Math.round(obj.n).toLocaleString('es-PE'); },
        });
      });

      // parallax sutil
      gsap.utils.toArray('[data-parallax]').forEach((el) => {
        gsap.to(el, {
          yPercent: Number(el.dataset.parallax) || -12, ease: 'none',
          scrollTrigger: { trigger: el.parentElement, scrub: 1.2, start: 'top bottom', end: 'bottom top' },
        });
      });

      // cortinas de imagen
      gsap.utils.toArray('[data-cortina]').forEach((el) => {
        ScrollTrigger.create({ trigger: el, start: 'top 82%', once: true, onEnter: () => el.classList.add('revelada') });
      });
    } else {
      // respaldo sin GSAP
      document.querySelectorAll('[data-linea],[data-fundido],[data-subir]').forEach((el) => el.classList.add('anim-lista'));
      const obs = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('anim-lista'); obs.unobserve(e.target); }
      }), { threshold: 0.1 });
      document.querySelectorAll('[data-grupo]').forEach((g) => [...g.children].forEach((el) => { el.classList.add('anim-esperando'); obs.observe(el); }));
      document.querySelectorAll('[data-contar]').forEach((el) => { el.textContent = Number(el.dataset.contar).toLocaleString('es-PE'); });
      const obsCortina = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('revelada'); obsCortina.unobserve(e.target); }
      }), { threshold: 0.15 });
      document.querySelectorAll('[data-cortina]').forEach((el) => obsCortina.observe(el));
    }
  },

  // Inserta nav + footer y conecta los enlaces de WhatsApp
  async montarBase(mensajeWs = 'Hola INGEA, quiero información sobre sus cursos de especialización ambiental.') {
    await this.cargarConfig();
    const nav = document.getElementById('appNav');
    const pie = document.getElementById('appFooter');
    if (nav) nav.innerHTML = this.navHTML();
    if (pie) pie.innerHTML = this.footerHTML();
    const url = this.linkWhatsApp(mensajeWs);
    const navWs = document.getElementById('navWs');
    const flot = document.getElementById('wsFlotante');
    if (navWs) navWs.href = url;
    if (flot) flot.href = url;
    document.querySelectorAll('[data-ws]').forEach((a) => {
      a.href = this.linkWhatsApp(a.dataset.ws);
      a.target = '_blank';
      a.rel = 'noopener';
    });
    this.activarNav();
    this.activarMagneticos();
  },
};
