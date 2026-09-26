// Run before first paint; storage failures must never block the homepage.
(() => {
  const key = 'ap-intro-seen-v1';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let seen = false;
  try { seen = sessionStorage.getItem(key) === '1'; } catch {}
  if (seen || reduced.matches || location.hash) return;
  document.documentElement.classList.add('intro-pending');
  let finished = false;
  let resizeObserver;
  const finish = () => {
    if (finished) return;
    finished = true;
    resizeObserver?.disconnect();
    const overlay = document.getElementById('opening-intro');
    const focused = overlay?.contains(document.activeElement);
    document.documentElement.classList.remove('intro-pending','intro-revealing');
    document.querySelectorAll('[data-intro-inert]').forEach(el => { el.inert = false; el.removeAttribute('data-intro-inert'); });
    overlay?.remove();
    try { sessionStorage.setItem(key, '1'); } catch {}
    if (focused) document.querySelector('header .brand')?.focus({preventScroll:true});
  };
  // A fail-safe also covers interrupted animations, hidden tabs and runtime errors.
  setTimeout(finish, 6500);
  document.addEventListener('DOMContentLoaded', () => {
    if (finished) return;
    const overlay = document.createElement('div');
    overlay.id = 'opening-intro';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Welcome to Admission Possible');
    overlay.innerHTML = '<div class="intro-card" aria-hidden="true"><div class="intro-zone intro-top"><span class="intro-impossible">Impossible</span><span class="intro-admission">Admission</span></div><div class="intro-zone intro-middle"><span>Becomes</span></div><div class="intro-zone intro-bottom"><span class="intro-possible">Possible</span></div></div><button class="intro-skip" type="button">Skip Intro <span aria-hidden="true">+</span></button>';
    [...document.body.children].forEach(el => { if (['SCRIPT','STYLE'].includes(el.tagName) || el.inert) return; el.inert=true; el.setAttribute('data-intro-inert',''); });
    document.body.append(overlay);
    const card = overlay.querySelector('.intro-card');
    const fitWords = () => {
      const width = card.clientWidth * .92;
      overlay.querySelectorAll('.intro-zone > span').forEach(word => {
        if (word.offsetWidth) word.style.scale = `${width / word.offsetWidth} 1`;
      });
    };
    fitWords();
    resizeObserver = new ResizeObserver(fitWords);
    resizeObserver.observe(card);
    const skip = overlay.querySelector('button');
    skip.addEventListener('click', finish);
    skip.focus({preventScroll:true});
    overlay.addEventListener('keydown', e => { if(e.key==='Escape') finish(); if(e.key==='Tab'){e.preventDefault();skip.focus();} });
    overlay.addEventListener('animationend', e => { if(e.animationName==='intro-exit') finish(); });
    overlay.addEventListener('animationstart', e => { if(e.animationName==='intro-exit') document.documentElement.classList.add('intro-revealing'); });
    reduced.addEventListener('change', e => { if(e.matches) finish(); }, {once:true});
  }, {once:true});
})();
