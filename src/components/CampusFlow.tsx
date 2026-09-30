import { useEffect, useRef } from 'react';
import { campuses } from '../data/site';

/** The original layered campus panorama, now travelling along one continuous curve. */
export function CampusFlow({ paused, arc = false }: { paused: boolean; arc?: boolean }) {
  const scene = useRef<HTMLDivElement>(null);
  const elapsed = useRef(0);
  useEffect(() => {
    const element = scene.current;
    if (!element) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const nodes = Array.from(element.querySelectorAll('img'));
    let width = element.clientWidth;
    let height = element.clientHeight;
    let visible = false;
    let frame: number | null = null;
    let previous: number | null = null;
    let cardWidth = 0;
    let extent = 0;
    const draw = () => {
      if (!width || !height) return;
      nodes.forEach((node, i) => {
        const t = (i / nodes.length + elapsed.current / (arc ? 48 : 62)) % 1;
        const x = -cardWidth + t * extent;
        const n = (x - width / 2) / (width / 2);
        const distance = Math.min(1, Math.abs(n));
        const y = arc ? height * 0.38 + Math.cos(Math.min(1.4, Math.abs(n)) * Math.PI) * height * 0.24 : height * 0.5;
        const scale = arc ? 0.84 + distance * 0.16 : 0.58 + Math.pow(distance, 0.85) * 0.42;
        const rotation = arc ? Math.sin(n * Math.PI) * 9 : -n * 2;
        node.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%) rotate(${rotation}deg) scale(${scale})`;
        const layer = String(Math.round(distance * 100));
        if (node.style.zIndex !== layer) node.style.zIndex = layer;
      });
    };
    const canAnimate = () => visible && !document.hidden && !paused && !motion.matches;
    const stop = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      previous = null;
    };
    const tick = (now: number) => {
      frame = null;
      if (!canAnimate()) {
        previous = null;
        return;
      }
      if (previous !== null) elapsed.current += Math.min(now - previous, 50) / 1000;
      previous = now;
      draw();
      frame = requestAnimationFrame(tick);
    };
    const syncMotion = () => {
      if (canAnimate()) {
        if (frame === null) frame = requestAnimationFrame(tick);
      } else stop();
    };
    const layout = () => {
      cardWidth = Math.min(250, Math.max(142, width * 0.16));
      const cardHeight = arc ? cardWidth * 0.92 : Math.min(height * 0.94, cardWidth * 1.24);
      extent = width + cardWidth * 2;
      nodes.forEach((node) => {
        node.style.width = `${cardWidth}px`;
        node.style.height = `${cardHeight}px`;
      });
      draw();
    };
    layout();
    const resize = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      layout();
    });
    resize.observe(element);
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        syncMotion();
      },
      { rootMargin: '100px' },
    );
    observer.observe(element);
    motion.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', syncMotion);
    return () => {
      stop();
      resize.disconnect();
      observer.disconnect();
      motion.removeEventListener('change', syncMotion);
      document.removeEventListener('visibilitychange', syncMotion);
    };
  }, [paused, arc]);
  return (
    <div ref={scene} className={`campus-flow${arc ? ' campus-flow--arc' : ''}`} aria-hidden="true">
      {campuses.map((campus, i) => (
        <img
          key={campus.src}
          src={campus.src.replace('/campus/', '/campus/thumbs/')}
          srcSet={`${campus.src.replace('/campus/', '/campus/thumbs/')} 800w, ${campus.src} ${campus.src.endsWith('campus-7.webp') ? 1440 : 1600}w`}
          sizes="250px"
          alt=""
          width="250"
          height="310"
          loading={arc ? 'lazy' : 'eager'}
          decoding="async"
          style={{ left: 0, top: 0, transform: `translateX(${i * 120}px)` }}
        />
      ))}
    </div>
  );
}
