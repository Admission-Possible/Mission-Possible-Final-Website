import { useRef, useState } from 'react';
import { steps } from '../data/site';

export function StepRail() {
  const rail = useRef<HTMLOListElement>(null);
  const [position, setPosition] = useState(0);
  const [end, setEnd] = useState(false);
  const move = (direction: number) => {
    const el = rail.current;
    if (!el) return;
    const card = el.querySelector('li');
    el.scrollBy({
      left: direction * ((card?.getBoundingClientRect().width ?? 400) + 24),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  };
  return (
    <>
      <div className="section-heading process-heading">
        <h2>
          Five steps from where you are
          <br className="desktop-break" /> to where you’re going.
        </h2>
        <div className="rail-controls">
          <button onClick={() => move(-1)} disabled={position < 8} aria-label="Previous steps">
            ←
          </button>
          <button onClick={() => move(1)} disabled={end} aria-label="Next steps">
            →
          </button>
        </div>
      </div>
      <ol
        className="step-rail"
        ref={rail}
        aria-label="Your five-step application journey"
        tabIndex={0}
        onScroll={(event) => {
          const el = event.currentTarget;
          setPosition(el.scrollLeft);
          setEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
        }}
      >
        {steps.map((step, i) => (
          <li className="step-card" key={step.title}>
            <div className="step-card__image">
              <img
                src={step.image}
                srcSet={`${step.image.replace('-1600', '-800')} 800w, ${step.image} 1600w, ${step.image.replace('-1600', '-3840')} 3840w`}
                sizes="(max-width: 760px) 79vw, (max-width: 1100px) 38vw, 30vw"
                alt={`${step.campus} campus`}
                loading="lazy"
                decoding="async"
                width="800"
                height="600"
              />
              <span className="step-card__campus">
                {step.campus}
                <span aria-hidden="true">↗</span>
              </span>
            </div>
            <span className="step-card__number">0{i + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
      <p className="rail-hint">Your pace. Your path. Someone in your corner.</p>
    </>
  );
}
