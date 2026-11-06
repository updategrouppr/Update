/* Portafolio (portafolio.html): galería con filtros, entrada escalonada y visor en grande.
   Los trabajos vienen de js/portfolio-data.js. */
(function(){
  const { esc, split, reveal, reduce } = UG;
  const $ = id => document.getElementById(id);
  const all = window.UG_WORK || [];

  // La pestaña "Propuesta" vuelve a la propuesta que el cliente estaba viendo
  try { const c = sessionStorage.getItem('ug-prop'); if (c) $('tab-prop').href = 'propuesta.html#' + c; } catch (_) {}

  const FILTERS = [
    ['todos', 'Todos', () => true],
    ['gob', 'Gobierno', w => w.sector === 'gob'],
    ['marca', 'Marcas', w => w.sector === 'marca'],
    ['causa', 'Educación y causas', w => w.sector === 'causa'],
    ['web', 'Web y digital', w => w.tipo === 'web']
  ];
  $('filters').innerHTML = FILTERS.map(([id, label, fn], k) =>
    `<button type="button" data-f="${id}" aria-pressed="${k === 0}">${esc(label)}<span class="count">${all.filter(fn).length}</span></button>`).join('');

  $('grid').innerHTML = all.map((w, i) =>
    `<button class="mitem" type="button" data-i="${i}" data-rv style="--d:${(i % 4) * .07}s" aria-label="${esc(w.client + ': ' + w.es)}"><img src="img/portfolio/${esc(w.img)}" alt="" width="${w.w}" height="${w.h}" loading="lazy"><span class="cap"><b>${esc(w.client)}</b><span>${esc(w.es)}</span></span></button>`).join('');
  const tiles = [...$('grid').children];

  let visible = all.map((_, i) => i);
  $('filters').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $('filters').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
    const fn = FILTERS.find(f => f[0] === b.dataset.f)[2];
    visible = [];
    let n = 0;
    tiles.forEach((t, i) => {
      const ok = fn(all[i]);
      t.classList.toggle('hide', !ok);
      if (ok) {
        visible.push(i);
        if (!reduce) { // volver a animar la entrada
          t.classList.remove('in'); t.style.setProperty('--d', (Math.min(n++, 12) * .05) + 's');
          void t.offsetWidth; requestAnimationFrame(() => t.classList.add('in'));
        }
      }
    });
  });

  const items = all.map(w => ({ src: 'img/portfolio/' + w.img, title: w.client, cap: w.es }));
  $('grid').addEventListener('click', e => {
    const t = e.target.closest('.mitem'); if (!t) return;
    const i = +t.dataset.i;
    UG.lightbox(visible.map(k => items[k]), visible.indexOf(i));
  });
  $('case-img').addEventListener('click', () => {
    const k = all.findIndex(w => w.img === 'coca-cola-vip-1.jpg');
    UG.lightbox([items[k]], 0);
  });

  // Números que cuentan hacia arriba
  $('st-clients').dataset.count = new Set(all.map(w => w.client)).size;
  $('st-pieces').dataset.count = all.length;
  const stats = document.querySelector('.pf-stats');
  const count = () => stats.querySelectorAll('[data-count]').forEach(el => {
    const end = +el.dataset.count, t0 = performance.now(), dur = 1200;
    if (reduce) { el.textContent = end; return; }
    const step = now => { const p = Math.min(1, (now - t0) / dur); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
  setTimeout(count, 500);

  document.querySelectorAll('[data-split]').forEach(split);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.querySelectorAll('.pf-hero .split, .pf-hero [data-rv]').forEach(el => el.classList.add('in'));
    reveal();
  }));

  const prog = $('prog');
  addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    prog.style.setProperty('--p', max > 0 ? (scrollY / max).toFixed(4) : 0);
  }, { passive: true });
})();
