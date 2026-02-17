// Main interactions: particles, intro, 3D tilt, reveal on scroll, skill bars
(function(){
  // Particles on canvas (background + bursts)
  let canvas = document.getElementById('particles');
  if(!canvas){ canvas = document.createElement('canvas'); canvas.id = 'particles'; document.body.appendChild(canvas); }
  const ctx = canvas.getContext && canvas.getContext('2d');
  if(!ctx) return;
  let w, h, particles = [], bursts = [];
  function resize(){ w = canvas.width = innerWidth; h = canvas.height = innerHeight }
  addEventListener('resize', resize); resize();

  function rand(min,max){return Math.random()*(max-min)+min}
  function initParticles(n=120){ particles = []; for(let i=0;i<n;i++){ particles.push({x:rand(0,w),y:rand(0,h),vx:rand(-0.25,0.25),vy:rand(-0.6,0.6),r:rand(0.6,2.8),alpha:rand(0.04,0.28),hue:rand(150,320)}) } }
  initParticles();

  function spawnBurst(x,y,color,count=36){
    for(let i=0;i<count;i++){
      const ang = Math.random()*Math.PI*2;
      const speed = rand(2,6);
      bursts.push({x,y,vx:Math.cos(ang)*speed, vy:Math.sin(ang)*speed, r:rand(1,3.8), life:1, decay:rand(0.015,0.035), color});
    }
  }

  function tick(){
    ctx.clearRect(0,0,w,h);
    // background ambient particles
    for(const p of particles){
      p.x += p.vx; p.y += p.vy; if(p.x<0) p.x=w; if(p.x>w) p.x=0; if(p.y<0) p.y=h; if(p.y>h) p.y=0;
      ctx.beginPath(); ctx.fillStyle = `hsla(${p.hue},85%,60%,${p.alpha})`; ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    }
    // burst particles
    for(let i=bursts.length-1;i>=0;i--){ const b = bursts[i]; b.x += b.vx; b.y += b.vy; b.vx *= 0.98; b.vy *= 0.98; b.life -= b.decay; if(b.life<=0){bursts.splice(i,1); continue;} ctx.beginPath(); ctx.fillStyle = `rgba(${b.color.r},${b.color.g},${b.color.b},${Math.max(0,b.life)})`; ctx.arc(b.x,b.y,b.r*b.life,0,Math.PI*2); ctx.fill(); }
    requestAnimationFrame(tick);
  }
  tick();

  // Cinematic intro timeline
  const intro = document.querySelector('.cinematic-intro');
  function hexToRgb(hex){ const m = hex.replace('#',''); const bigint = parseInt(m,16); return {r:(bigint>>16)&255, g:(bigint>>8)&255, b:bigint&255} }
  if(intro){
    const mark = intro.querySelector('.logo-mark');
    const text = intro.querySelector('.logo-text');
    const glitch = intro.querySelector('.logo-glitch');
    const sheen = intro.querySelector('.light-sheen');
    // prepare glitch data text
    if(glitch && glitch.querySelector('span')) glitch.setAttribute('data-text', glitch.querySelector('span').textContent);

    // animation sequence timed for smooth 60fps feel
    // step 1: initial pop of mark
    mark.style.transform = 'scale(0.8)'; mark.style.opacity = '0';
    setTimeout(()=>{ mark.style.transition='transform .9s cubic-bezier(.2,.9,.2,1),opacity .6s'; mark.style.transform='scale(1)'; mark.style.opacity='1'; }, 120);

    // step 2: light sheen sweep and subtle scale pulse
    setTimeout(()=>{ sheen.classList.add('active'); mark.style.transform='scale(1.06)'; }, 560);

    // step 3: logo text reveal and glitch burst + particle burst
    setTimeout(()=>{
      text.style.transition='opacity .7s ease,transform .7s cubic-bezier(.2,.9,.2,1)'; text.style.opacity=1; text.style.transform='translateY(0) scale(1)';
      // glitch flicker
      glitch.classList.add('active'); glitch.classList.add('glitch-flicker');
      // spawn multicolor burst at center
      const cx = innerWidth/2; const cy = innerHeight/2; spawnBurst(cx,cy,hexToRgb('#00ffd0'), 44); spawnBurst(cx,cy,hexToRgb('#7a6bff'), 34); spawnBurst(cx,cy,hexToRgb('#ff3ec4'), 30);
    }, 1200);

    // step 4: final combined shimmer then out transition
    setTimeout(()=>{
      sheen.classList.remove('active');
      mark.style.transform='scale(0.96) translateY(-6px)';
    }, 2000);

    setTimeout(()=>{
      intro.classList.add('out'); intro.setAttribute('aria-hidden','true');
      // quick extra burst as it goes
      const cx = innerWidth/2; const cy = innerHeight/2; spawnBurst(cx,cy,hexToRgb('#ff3ec4'), 28);
      setTimeout(()=>{ try{ intro.remove(); }catch(e){} }, 900);
    }, 2600);
  }

  // 3D tilt follow mouse for .card3d
  const card = document.querySelector('.card3d');
  if(card){ window.addEventListener('mousemove', e=>{ const r = card.getBoundingClientRect(); const cx = r.left + r.width/2; const cy = r.top + r.height/2; const dx = (e.clientX-cx)/r.width; const dy = (e.clientY-cy)/r.height; card.style.transform = `rotateY(${dx*12}deg) rotateX(${-dy*10}deg)`; }); window.addEventListener('mouseleave', ()=>{card.style.transform='rotateY(0deg) rotateX(0deg)'}); }

  // Reveal on scroll
  const io = new IntersectionObserver((entries)=>{ entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in-view'); }); }, {threshold:0.18});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  // Skill bars animate when in view
  const skillObserver = new IntersectionObserver((entries)=>{ entries.forEach(e=>{ if(e.isIntersecting){ const inner = e.target.querySelector('.bar-inner'); if(inner){ inner.style.width = inner.dataset.width; } } }); }, {threshold:0.3});
  document.querySelectorAll('.skill').forEach(s=>skillObserver.observe(s));

  // Smooth page transitions for internal links
  document.addEventListener('click', (e)=>{
    const a = e.target.closest('a'); if(!a) return; const href = a.getAttribute('href'); if(!href) return; if(href.startsWith('http')||href.startsWith('mailto:')||href.startsWith('tel:')) return; e.preventDefault(); document.querySelector('.page-fade').classList.add('show'); setTimeout(()=>{ location.href = href; }, 500);
  });

})();
