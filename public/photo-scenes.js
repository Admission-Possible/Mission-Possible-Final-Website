// Original photo choreography, using only the project's university photographs.
export function initializePhotoScenes(images, reduced, isPaused) {
  const scenes = [...document.querySelectorAll('[data-scene]')].map(el => {
    const final = el.dataset.scene === 'final';
    const selection = final ? images : [0, 8, 4, 12, 2, 7, 14, 6, 13, 17, 1, 16, 3].map(i => images[i]);
    const nodes = selection.map((photo, i) => {
      const img = document.createElement('img');
      img.src = photo.src; img.alt = ''; img.className = 'photo-panel';
      img.loading = final ? 'lazy' : 'eager'; img.decoding = 'async';
      el.append(img);
      return {img, i};
    });
    const scene = {el, final, nodes, width: 0, height: 0, visible: false, started: null};
    new ResizeObserver(([entry]) => {scene.width = entry.contentRect.width; scene.height = entry.contentRect.height; size(scene)}).observe(el);
    return scene;
  });
  function size(scene) {
    const {width: w, height: h, final} = scene;
    const width = final ? Math.min(220, Math.max(112, w * .115)) : Math.min(260, Math.max(112, w * .16));
    const height = width;
    scene.nodes.forEach(({img}) => {img.style.width = `${width}px`; img.style.height = `${height}px`;});
  }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    const scene = scenes.find(s => s.el === entry.target); scene.visible = entry.isIntersecting;
  }), {rootMargin: '120px'});
  scenes.forEach(scene => observer.observe(scene.el));
  let time = 0, last = 0;
  function frame(now) {
    const delta = last ? Math.min(now - last, 50) / 1000 : 0; last = now;
    if (!isPaused() && !reduced.matches && !document.hidden) time += delta;
    scenes.forEach(scene => {
      if (!scene.visible || !scene.width) return;
      scene.started ??= time;
      const {width: w, height: h, final, nodes} = scene;
      nodes.forEach(({img, i}) => {
        let x, y, scale, rotate, perspective = 0, opacity = 1;
        if (final) {
          // Each panel crosses the same continuous arc and wraps entirely offscreen.
          const t = (i / nodes.length + time / 34) % 1;
          const extent = w + 620;
          x = -310 + t * extent;
          const n = (x - w / 2) / (w / 2);
          y = h * .36 + Math.cos(Math.min(1.4, Math.abs(n)) * Math.PI) * h * .20;
          scale = .88 + Math.min(1, Math.abs(n)) * .18;
          rotate = Math.sin(n * Math.PI) * 9;
        } else {
          // A continuous center-outward conveyor: every panel enters at center,
          // travels to an outer edge, then wraps as the next panel arrives.
          const phase = (i / nodes.length + time / 8.5) % 1;
          const direction = i % 2 ? -1 : 1;
          const travel = w * .68 + 90;
          const progress = Math.min(1, phase / .82);
          const ease = 1 - Math.pow(1 - progress, 3);
          x = w / 2 + direction * ease * travel;
          y = h * .5 + Math.sin(phase * Math.PI + i * .7) * h * .12;
          scale = .42 + ease * .52;
          rotate = direction * (-4 + phase * 10) + (reduced.matches ? 0 : Math.sin(time * .3 + i) * 1.5);
          perspective = direction * -10;
          opacity = phase < .12 ? phase / .12 : phase > .84 ? (1 - phase) / .16 : 1;
          if (isPaused() || reduced.matches) opacity = Math.max(opacity, .8);
        }
        img.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%) perspective(1000px) rotateY(${perspective}deg) rotate(${rotate}deg) scale(${scale})`;
        img.style.opacity = opacity;
        img.style.zIndex = String(final ? i : Math.abs(i - 6));
      });
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
