/* Utilidades compartidas del portal: modo de animación, títulos palabra por palabra y revelado al hacer scroll. */
window.UG = (function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add(reduce ? 'no-anim' : 'js-anim');

  // Escapa texto y convierte **así** en un resaltado animado
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const rich = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<mark class="hl">$1</mark>');

  // Separa un título en palabras que suben una a una (mantiene el degradado de .gt)
  function split(el){
    let i = 0;
    const walk = (node, gt) => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const s = document.createElement('span'); s.textContent = part; s.style.setProperty('--i', i++);
            if (gt) s.className = 'gt';
            w.appendChild(s); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) {
          const isGt = n.classList.contains('gt');
          if (isGt) n.classList.remove('gt');
          walk(n, gt || isGt);
        }
      });
    };
    walk(el, false); el.classList.add('split');
    return el;
  }

  // Marca con .in todo lo que entra en pantalla
  let io = null;
  function reveal(root){
    const els = (root || document).querySelectorAll('[data-rv],.split,.rv-hl');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    io = io || new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .14, rootMargin: '0px 0px -6% 0px' });
    els.forEach(e => { if (!e.classList.contains('in')) io.observe(e); });
  }

  function getCode(){
    const fromHash = decodeURIComponent(location.hash.slice(1)).toLowerCase().replace(/[^a-z0-9-]/g, '');
    let saved = '';
    try { saved = sessionStorage.getItem('ug-prop') || ''; } catch (_) {}
    const code = fromHash || saved;
    if (code) try { sessionStorage.setItem('ug-prop', code); } catch (_) {}
    return code;
  }

  return { reduce, esc, rich, split, reveal, getCode };
})();
