(() => {
  const root=document.documentElement, $=id=>document.getElementById(id);
  // En el sitio publicado cada idioma tiene su URL (/ y /es/): <html data-lang data-alt> los pone tools/build_site.py.
  // En la página fuente (bilingüe) el botón EN/ES cambia el idioma en la misma página.
  const altURL=root.dataset.alt;
  let L=root.dataset.lang==='es'?'es':'en', stored=null;
  try{stored=localStorage.getItem('ug-lang');}catch(e){}
  if(altURL){ if((stored==='es'||stored==='en')&&stored!==L){location.replace(altURL+location.hash);return;} }
  else if(stored==='es'||stored==='en') L=stored;
  const goLang=l=>{ if(altURL&&l!==L){try{localStorage.setItem('ug-lang',l)}catch(e){} location.href=altURL+location.hash; return true;} return false; };

  // ---- Language
  function setLang(l){
    L=l; root.dataset.lang=l; root.lang=l;
    try{localStorage.setItem('ug-lang',l)}catch(e){}
    document.querySelectorAll('.lang button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.set===l)));
    document.querySelectorAll('[data-ph-en]').forEach(el=>el.placeholder=el.dataset[l==='en'?'phEn':'phEs']);
    chatReset();
  }
  document.querySelectorAll('.lang button').forEach(b=>b.addEventListener('click',()=>{ if(!goLang(b.dataset.set)) setLang(b.dataset.set); }));

  // ---- Chat demo
  const CHAT={
    en:[["in","Hi! How much is catering for 40 people?","11:52 PM"],["out","Hi! 👋 Our catering for 40 starts at our Classic menu. Is it for an office or a private event?","11:52 PM · AI"],["in","Office, next Friday","11:53 PM"],["out","Perfect. I can book a 10-minute call tomorrow at 9:00 AM to confirm the menu. Does that work?","11:53 PM · AI"],["in","Yes 🙌","11:54 PM"],["out","Done! ✅ Booked for tomorrow 9:00 AM. You’ll get a reminder here.","11:54 PM · AI"]],
    es:[["in","¡Hola! ¿Cuánto cuesta el catering para 40 personas?","11:52 PM"],["out","¡Hola! 👋 El catering para 40 empieza con nuestro menú Clásico. ¿Es para oficina o evento privado?","11:52 PM · AI"],["in","Oficina, el viernes que viene","11:53 PM"],["out","Perfecto. Puedo agendarte una llamada de 10 minutos mañana a las 9:00 AM para confirmar el menú. ¿Te funciona?","11:53 PM · AI"],["in","Sí 🙌","11:54 PM"],["out","¡Listo! ✅ Agendado para mañana 9:00 AM. Te llegará un recordatorio por aquí.","11:54 PM · AI"]]
  };
  const chat=$('chat'), reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc=s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  let ci=0, timer;
  const bubble=([w,t,s])=>`<div class="msg ${w}">${esc(t)}<small>${esc(s)}</small></div>`;
  function chatReset(){
    clearInterval(timer);
    if(reduce){chat.innerHTML=CHAT[L].slice(-4).map(bubble).join('');return;}
    ci=3; chat.innerHTML=CHAT[L].slice(0,3).map(bubble).join('');
    timer=setInterval(()=>{
      const m=CHAT[L];
      if(ci>=m.length){ci=0;chat.innerHTML='';}
      chat.insertAdjacentHTML('beforeend',bubble(m[ci++]));
      while(chat.children.length>4) chat.firstElementChild.remove();
    },2600);
  }

  // ---- Formulario de contacto: lo envía el servidor (/api/contact) al Outlook de Update Group
  const formStart=Date.now();
  $('lead-form').addEventListener('submit',async e=>{
    e.preventDefault();
    const f=e.currentTarget, n=$('f-note'), btn=f.querySelector('button[type=submit]');
    const t=(en,es)=>L==='en'?en:es;
    const show=(msg,ok)=>{n.hidden=false;n.textContent=msg;n.classList.toggle('err-note',!ok);};
    const name=$('f-name').value.trim(), phone=$('f-phone').value.trim(), email=$('f-email').value.trim();
    if(!name||phone.replace(/\D/g,'').length<7){show(t('Enter your name and a valid phone number.','Escribe tu nombre y un teléfono válido.'),false);(!name?$('f-name'):$('f-phone')).focus();return;}
    if(email&&!$('f-email').checkValidity()){show(t('Check your email address.','Revisa tu email.'),false);$('f-email').focus();return;}
    btn.disabled=true; const label=btn.innerHTML; btn.innerHTML=t('Sending…','Enviando…');
    try{
      const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,business:$('f-biz').value.trim(),phone,email,message:$('f-msg').value.trim(),lang:L,website:$('f-website').value,t:formStart})});
      if(r.ok){f.reset();show(t("Thanks! We got your request and will contact you soon.","¡Gracias! Recibimos tu solicitud y te contactaremos pronto."),true);}
      else if(r.status===429){show(t('Too many requests. Please try again later or message us on WhatsApp.','Demasiados intentos. Intenta más tarde o escríbenos por WhatsApp.'),false);}
      else{throw new Error(r.status);}
    }catch(err){show(t("We couldn't send your request. Please message us on WhatsApp at (787) 949-4781.","No pudimos enviar tu solicitud. Escríbenos por WhatsApp al (787) 949-4781."),false);}
    finally{btn.disabled=false;btn.innerHTML=label;}
  });

  // ---- Enlaces viejos a #portal ahora van al portal nuevo
  if(location.hash==='#portal') location.replace('portal.html');

  // ---- Servicios en movimiento: entrada escalonada, inclinación y brillo que sigue el cursor
  const motionOK=!matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tiles=[...document.querySelectorAll('.svc-bento .tile')];
  // Elementos que entran al hacer scroll: [selector, variante, retraso escalonado]
  const RV=[['.intro h2','rv-left',0],['.intro-grid > div','rv-right',0],['#proceso .head','',0],['.proc li','',.14],['.portal-wide','rv-zoom',0],['#contacto .cta','',0],['.certs-head','',0],['.cert-grid li','rv-zoom',.1]];
  const extra=[];
  RV.forEach(([sel,v,step])=>document.querySelectorAll(sel).forEach((el,i)=>{el.classList.add('rv');if(v)el.classList.add(v);el.style.setProperty('--delay',(i*step)+'s');extra.push(el);}));
  const revealEls=[...tiles, document.querySelector('.band-title'), ...extra].filter(Boolean);
  tiles.forEach((t,i)=>{t.style.setProperty('--delay',(i*0.12)+'s'); const ic=t.querySelector('.ico svg'); if(ic) ic.style.setProperty('--b',(i*0.4)+'s');});
  if(motionOK && 'IntersectionObserver' in window){
    root.classList.add('js-motion');
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target);}}),{threshold:.15});
    revealEls.forEach(el=>io.observe(el));
    if(matchMedia('(hover:hover)').matches){
      tiles.forEach(t=>{
        t.addEventListener('pointermove',ev=>{
          const r=t.getBoundingClientRect(), x=(ev.clientX-r.left)/r.width, y=(ev.clientY-r.top)/r.height;
          t.style.setProperty('--mx',(x*100)+'%'); t.style.setProperty('--my',(y*100)+'%');
          t.style.setProperty('--ry',((x-.5)*7)+'deg'); t.style.setProperty('--rx',((.5-y)*7)+'deg');
        });
        t.addEventListener('pointerleave',()=>{t.style.setProperty('--rx','0deg');t.style.setProperty('--ry','0deg');});
      });
    }
  } else {
    revealEls.forEach(el=>el.classList.add('is-in'));
  }

  setLang(L);
})();
