import { useCallback, useEffect, useRef, useState } from 'react';
import { steps } from '../data/site';
import { UniversityStrip } from './UniversityStrip';
import '../styles/hero.css';

type HeroProps = {
  paused: boolean;
  opening: boolean;
  onToggleMotion: () => void;
  onJoin: () => void;
};

/** One quiet frame, moving through real campus photographs at a reading-friendly pace. */
export function Hero({ paused, opening, onToggleMotion, onJoin }: HeroProps) {
  const frame = useRef<HTMLDivElement>(null);
  const current = useRef(0);
  const target = useRef<number | null>(null);
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const move = useCallback((direction: number, announce = false) => {
    const element = frame.current;
    if (!element) return;
    const from = target.current ?? current.current;
    const next = (from + direction + steps.length) % steps.length;
    target.current = next;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wrap = Math.abs(next - from) > 1;
    element.scrollTo({ left: next * element.clientWidth, behavior: reduced || wrap ? 'instant' : 'smooth' });
    if (announce) setAnnouncement(`${steps[next].campus}, image ${next + 1} of ${steps.length}`);
  }, []);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer: ReturnType<typeof setInterval> | undefined;
    let visible = false;
    const sync = () => {
      clearInterval(timer);
      if (!paused && !opening && !hovered && !focused && visible && !document.hidden && !motion.matches)
        timer = setInterval(() => move(1), 8000);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRatio >= 0.25;
        sync();
      },
      { threshold: 0.25 },
    );
    observer.observe(element);
    motion.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      clearInterval(timer);
      observer.disconnect();
      motion.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [paused, opening, hovered, focused, move]);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    let width = element.clientWidth;
    let settle: ReturnType<typeof setTimeout> | undefined;
    const resetTarget = () => {
      target.current = null;
    };
    const onScroll = () => {
      clearTimeout(settle);
      // Fallback for browsers without the scrollend event.
      settle = setTimeout(resetTarget, 160);
    };
    const resize = new ResizeObserver(() => {
      if (width === element.clientWidth) return;
      width = element.clientWidth;
      const selected = target.current ?? current.current;
      target.current = null;
      element.scrollTo({ left: selected * width, behavior: 'instant' });
    });
    resize.observe(element);
    element.addEventListener('scroll', onScroll, { passive: true });
    element.addEventListener('scrollend', resetTarget);
    return () => {
      clearTimeout(settle);
      resize.disconnect();
      element.removeEventListener('scroll', onScroll);
      element.removeEventListener('scrollend', resetTarget);
    };
  }, []);

  return (
    <section id="home" className="hero" aria-labelledby="hero-title">
      <div className="hero-editorial">
        <div className="hero-topline">
          <p className="eyebrow">BIG DREAMS. ENDLESS POSSIBILITIES.</p>
          <span>YOUR NEXT CHAPTER STARTS HERE ↘</span>
        </div>
        <div className="hero-composition">
          <div className="hero-copy">
            <h1 id="hero-title">
              <span>Impossible</span> <span className="hero-becomes">becomes</span>{' '}
              <span className="hero-possible">Possible.</span>
            </h1>
            <p className="hero-description">
              A college journey, with someone in your corner. Personal mentorship from your first question to your final
              application.
            </p>
            <div className="hero-actions">
              <button className="hero-primary" onClick={onJoin} aria-haspopup="dialog">
                Find your mentor <span aria-hidden="true">↗</span>
              </button>
              <a className="hero-secondary" href="#how-it-works">
                How it works
              </a>
            </div>
          </div>
          <div
            className="hero-gallery"
            role="group"
            aria-roledescription="carousel"
            aria-label="A world of campus possibilities"
            onPointerEnter={(event) => {
              if (event.pointerType !== 'touch') setHovered(true);
            }}
            onPointerLeave={() => setHovered(false)}
            onFocus={() => setFocused(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
            }}
          >
            <div
              ref={frame}
              className="hero-gallery__frame"
              onScroll={(event) => {
                const element = event.currentTarget;
                const next = Math.max(
                  0,
                  Math.min(steps.length - 1, Math.round(element.scrollLeft / element.clientWidth)),
                );
                current.current = next;
                setIndex(next);
              }}
            >
              {steps.map((step, i) => (
                <div className="hero-gallery__slide" key={step.campus} aria-hidden={i !== index}>
                  <img
                    src={step.image}
                    srcSet={`${step.image.replace('-1600', '-800')} 800w, ${step.image} 1600w, ${step.image.replace('-1600', '-3840')} 3840w`}
                    sizes="(max-width: 760px) calc(100vw - 44px), (min-width: 1800px) 760px, 44vw"
                    alt={`A view of ${step.campus}`}
                    width="1600"
                    height="1200"
                    loading={i === 0 ? 'eager' : 'lazy'}
                    fetchPriority={i === 0 ? 'high' : 'auto'}
                    decoding="async"
                  />
                </div>
              ))}
            </div>
            <div className="hero-gallery__caption">
              <p>
                <span className="hero-gallery__index">
                  0{index + 1} / 0{steps.length}
                </span>
                <span>{steps[index].campus}</span>
              </p>
              <div className="hero-gallery__controls">
                <button onClick={() => move(-1, true)} aria-label="Previous campus image">
                  <span aria-hidden="true">←</span>
                </button>
                <button onClick={() => move(1, true)} aria-label="Next campus image">
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
            <p className="sr-only" role="status">
              {announcement}
            </p>
          </div>
        </div>
        <div className="hero-footline">
          <p>STUDENT-LED. PERSONALLY GUIDED.</p>
          <button className="hero-motion" onClick={onToggleMotion} aria-pressed={paused}>
            <span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span>
            {paused ? 'Play motion' : 'Pause motion'}
          </button>
        </div>
      </div>
      <UniversityStrip paused={paused || opening} />
    </section>
  );
}
