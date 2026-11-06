/* Entrada al portal de clientes (portal.html).
   La contraseña la revisa el servidor (/api/portal/login) y devuelve una sesión de 12 horas.
   Sin esa sesión, el servidor no entrega la propuesta, el portafolio ni las propuestas. */
(function(){
  document.querySelectorAll('[data-split]').forEach(UG.split);
  requestAnimationFrame(() => requestAnimationFrame(() => document.querySelectorAll('.split').forEach(el => el.classList.add('in'))));

  const form = document.getElementById('gate'), input = document.getElementById('code'),
        err = document.getElementById('err'), btn = document.getElementById('go');
  // Enlace directo a una propuesta (portal.html#cliente) → después de entrar se abre esa
  const want = decodeURIComponent(location.hash.slice(1)).toLowerCase().replace(/[^a-z0-9-]/g, '');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const password = input.value;
    if (!password) return fail('Escribe la contraseña.');
    btn.disabled = true; btn.textContent = 'Entrando…';
    try {
      const r = await fetch('/api/portal/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }), credentials: 'same-origin'
      });
      if (r.ok) {
        input.value = '';
        location.href = 'propuesta.html' + (want ? '#' + want : '');
        return;
      }
      fail(r.status === 429
        ? 'Demasiados intentos. Espera unos minutos o escríbenos por WhatsApp al (787) 949-4781.'
        : 'Esa contraseña no es correcta. Revisa el mensaje que te enviamos o escríbenos por WhatsApp.');
    } catch (_) {
      fail('No pudimos conectar. Revisa tu internet e intenta otra vez.');
    }
    btn.disabled = false; btn.textContent = 'Entrar';
  });

  function fail(msg){
    err.textContent = msg;
    input.classList.remove('shake'); void input.offsetWidth; input.classList.add('shake');
    input.focus();
  }
})();
