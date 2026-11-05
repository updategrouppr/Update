/* Visor de trabajos en pantalla completa: flechas, teclado (← → Esc) y deslizar con el dedo.
   Uso: UG.lightbox(lista, posición), donde lista = [{ src, title, cap }]. */
(function(){
  const lb = document.getElementById('lb');
  if (!lb) return;
  const img = document.getElementById('lb-img'), t = document.getElementById('lb-t'), c = document.getElementById('lb-c');
  let list = [], i = 0, back = null;

  function show(){
    const it = list[i];
    img.src = it.src; img.alt = it.title + ': ' + it.cap;
    t.textContent = it.title; c.textContent = it.cap + ' · ' + (i + 1) + ' de ' + list.length;
  }
  function open(items, at){
    list = items; i = at; back = document.activeElement; show();
    lb.classList.add('open'); document.body.style.overflow = 'hidden';
    lb.querySelector('.lb-close').focus();
  }
  function close(){
    lb.classList.remove('open'); document.body.style.overflow = '';
    if (back) back.focus();
  }
  const go = d => { i = (i + d + list.length) % list.length; show(); };

  lb.querySelector('.lb-prev').addEventListener('click', () => go(-1));
  lb.querySelector('.lb-next').addEventListener('click', () => go(1));
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'Tab') { // mantener el foco dentro del visor
      const f = [...lb.querySelectorAll('button')], a = f.indexOf(document.activeElement);
      e.preventDefault(); f[(a + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
  let x0 = null;
  lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  });

  UG.lightbox = open;
})();
