/* Acceso al portal de clientes (portal.html).
   Prototipo: la clave solo busca el archivo proposals/<clave>.json. No es seguridad real;
   antes de subir propuestas de clientes de verdad, el acceso tiene que validarse en el servidor. */
(function(){
  document.querySelectorAll('[data-split]').forEach(UG.split);
  requestAnimationFrame(() => requestAnimationFrame(() => document.querySelectorAll('.split').forEach(el => el.classList.add('in'))));

  const form = document.getElementById('gate'), input = document.getElementById('code'),
        err = document.getElementById('err'), btn = document.getElementById('go');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const code = input.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!code) return fail('Escribe tu clave de acceso.');
    btn.disabled = true; btn.textContent = 'Abriendo…';
    try {
      const r = await fetch('proposals/' + code + '.json', { cache: 'no-store' });
      if (!r.ok) throw new Error(r.status);
      await r.json();
      try { sessionStorage.setItem('ug-prop', code); } catch (_) {}
      location.href = 'propuesta.html#' + encodeURIComponent(code);
    } catch (_) {
      fail('Esa clave no coincide. Revisa el mensaje que te enviamos o escríbenos por WhatsApp.');
      btn.disabled = false; btn.textContent = 'Ver mi propuesta';
    }
  });

  function fail(msg){
    err.textContent = msg;
    input.classList.remove('shake'); void input.offsetWidth; input.classList.add('shake');
    input.focus();
  }
})();
