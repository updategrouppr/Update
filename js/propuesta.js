/* Propuesta dinámica (propuesta.html): lee proposals/<clave>.json y arma la página con animaciones.
   Para crear una propuesta nueva: copiar proposals/update2026.json con otro nombre y cambiar los textos. */
(async function(){
  const { esc, rich, split, reveal, getCode, reduce } = UG;
  const $ = id => document.getElementById(id);
  const WA = '17879494781';
  const check = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="url(#ckg)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const pad = n => String(n).padStart(2, '0');

  const code = getCode();
  if (!code) { location.replace('portal.html'); return; }
  let P;
  try {
    const r = await fetch('proposals/' + code + '.json', { cache: 'no-store' });
    if (!r.ok) throw new Error(r.status);
    P = await r.json();
  } catch (_) {
    try { sessionStorage.removeItem('ug-prop'); } catch (e) {}
    location.replace('portal.html'); return;
  }

  // Degradado para los íconos de check
  document.body.insertAdjacentHTML('afterbegin', '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="ckg" x1="0" x2="1"><stop offset="0" stop-color="#19CBEA"/><stop offset="1" stop-color="#8BE24C"/></linearGradient></defs></svg>');

  const cli = P.cliente || {};
  document.title = 'Propuesta para ' + cli.nombre + ' | Update Group';
  $('who').textContent = cli.nombre;

  // Portada
  $('c-k').textContent = 'Propuesta para ' + cli.nombre;
  $('c-title').innerHTML = esc(P.titulo);
  $('c-sub').textContent = P.subtitulo || '';
  $('c-meta').innerHTML = [
    ['Preparada para', [cli.contacto, cli.cargo].filter(Boolean).join(', ')],
    ['Propuesta', '#' + P.numero], ['Fecha', P.fecha], ['Vigencia', P.validez]
  ].filter(x => x[1]).map(([k, v]) => `<span>${esc(k)}: <b>${esc(v)}</b></span>`).join('');

  // Resumen
  $('r-body').innerHTML = (P.resumen || []).map((p, i) => `<p class="lead-xl" data-rv style="--d:${i * .08}s">${rich(p)}</p>`).join('');

  // Objetivos
  $('o-body').innerHTML = (P.objetivos || []).map((o, i) =>
    `<article class="goal" data-rv style="--d:${i * .12}s"><span class="n">${pad(i + 1)}</span><h3>${esc(o.titulo)}</h3><p>${esc(o.texto)}</p></article>`).join('');

  // Servicios: tarjetas que se apilan
  $('a-body').innerHTML = (P.alcance || []).map((a, i) =>
    `<article class="scard" style="--i:${i}"><span class="n">${pad(i + 1)}</span><div><h3>${esc(a.titulo)}</h3><p>${esc(a.texto)}</p><ul>${(a.items || []).map(it => `<li>${check}<span>${esc(it)}</span></li>`).join('')}</ul></div></article>`).join('');

  // Plan
  $('p-body').innerHTML = (P.plan || []).map((s, i) =>
    `<div class="tl-step" data-rv="right" style="--d:.05s"><span class="k">${esc(s.etapa)}</span><h3>${esc(s.titulo)}</h3><p>${esc(s.texto)}</p></div>`).join('');

  // Trabajo relacionado: piezas del portafolio que se parecen a lo que pide el cliente
  const want = P.trabajo || {};
  const all = window.UG_WORK || [];
  let work = all.filter(w => (!want.sectores || want.sectores.includes(w.sector)) || (want.tipos && want.tipos.includes(w.tipo) && w.sector !== 'gob'));
  if (work.length < 8) work = work.concat(all.filter(w => !work.includes(w))).slice(0, 12);
  const items = work.map(w => ({ src: 'img/portfolio/' + w.img, title: w.client, cap: w.es }));
  const half = Math.ceil(items.length / 2);
  const rows = [items.slice(0, half), items.slice(half)].filter(r => r.length);
  $('w-body').innerHTML = rows.map((row, ri) => {
    const cards = row.map((it, k) => `<a href="${esc(it.src)}" data-i="${ri * half + k}" aria-label="${esc(it.title + ': ' + it.cap)}"><img src="${esc(it.src)}" alt="" loading="lazy"></a>`).join('');
    // Se repite la fila para que el carrusel no tenga cortes
    return `<div class="reel${ri ? ' rev' : ''}"><div class="reel-track">${cards}${cards.replace(/<a /g, '<a tabindex="-1" aria-hidden="true" ')}</div></div>`;
  }).join('');
  $('w-body').addEventListener('click', e => {
    const a = e.target.closest('a[data-i]'); if (!a || !UG.lightbox) return;
    e.preventDefault(); UG.lightbox(items, +a.dataset.i);
  });

  // Aprobación y cierre
  const msg = t => 'https://wa.me/' + WA + '?text=' + encodeURIComponent(t);
  $('ap-text').textContent = `Con un mensaje confirmas la propuesta #${P.numero} y coordinamos la reunión de arranque.`;
  $('ap-wa').href = msg(`¡Hola Update Group! Apruebo la propuesta #${P.numero} para ${cli.nombre}.`);
  $('ap-q').href = msg(`¡Hola Update Group! Tengo preguntas sobre la propuesta #${P.numero} para ${cli.nombre}.`);
  $('ap-mail').href = 'mailto:info@updategrouppr.com?subject=' + encodeURIComponent(`Propuesta #${P.numero} · ${cli.nombre}`);
  $('s-text').textContent = P.cierre || '';

  // Animaciones
  document.querySelectorAll('[data-split]').forEach(split);
  split($('c-title'));
  $('prop').removeAttribute('aria-busy');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    $('c-title').classList.add('in');
    document.querySelectorAll('#portada [data-rv]').forEach(el => el.classList.add('in'));
    reveal();
  }));

  // Índice lateral
  const chaps = [...document.querySelectorAll('[data-chap]')];
  $('pnav').innerHTML = chaps.map(s => `<a href="#${s.id}"><span>${esc(s.dataset.chap)}</span><i></i></a>`).join('');
  const dots = [...$('pnav').querySelectorAll('a')];
  $('pnav').addEventListener('click', e => {
    const a = e.target.closest('a'); if (!a) return;
    e.preventDefault(); document.querySelector(a.getAttribute('href')).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });
  document.querySelector('.btn-approve').addEventListener('click', e => { e.preventDefault(); $('pasos').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); });

  // Todo lo que depende del scroll, en un solo cuadro por frame
  const prog = $('prog'), tl = $('tl'), steps = [...tl.querySelectorAll('.tl-step')], cards = [...document.querySelectorAll('.scard')];
  let ticking = false;
  function frame(){
    ticking = false;
    const vh = innerHeight, max = document.documentElement.scrollHeight - vh;
    prog.style.setProperty('--p', max > 0 ? (scrollY / max).toFixed(4) : 0);

    let on = 0;
    chaps.forEach((s, k) => { if (s.getBoundingClientRect().top < vh * .45) on = k; });
    dots.forEach((d, k) => d.classList.toggle('on', k === on));

    const r = tl.getBoundingClientRect(), mark = vh * .62;
    tl.style.setProperty('--tp', Math.min(1, Math.max(0, (mark - r.top) / r.height)).toFixed(4));
    steps.forEach(s => s.classList.toggle('lit', s.getBoundingClientRect().top < mark));

    if (!reduce) cards.forEach((c, k) => {
      const next = cards[k + 1]; if (!next) return;
      const a = c.getBoundingClientRect(), b = next.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, 1 - (b.top - a.top) / a.height));
      c.style.transform = p ? `scale(${(1 - p * .05).toFixed(4)})` : '';
      c.style.filter = p ? `brightness(${(1 - p * .4).toFixed(3)})` : '';
    });
  }
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  frame();
})();
