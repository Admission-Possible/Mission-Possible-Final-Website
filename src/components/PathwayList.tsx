import { useRef, useState, type CSSProperties } from 'react';
import { pathways } from '../data/site';

export function PathwayList() {
  const [active, setActive] = useState<number | null>(null);
  const preview = useRef<HTMLDivElement>(null);
  return (
    <div className={`pathway-list${active !== null ? ' has-active' : ''}`} onMouseLeave={() => setActive(null)}>
      {pathways.map((pathway, i) => (
        <a
          className={`pathway-row${active === i ? ' is-active' : ''}`}
          href={pathway.href}
          key={pathway.name}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setActive(i)}
          onFocus={(event) => {
            setActive(i);
            if (preview.current) {
              preview.current.style.left = `${Math.min(window.innerWidth - 320, window.innerWidth * 0.5)}px`;
              preview.current.style.top = `${Math.min(window.innerHeight - 320, Math.max(110, event.currentTarget.getBoundingClientRect().top - 105))}px`;
            }
          }}
          onBlur={() => setActive(null)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setActive(null);
          }}
          onMouseMove={(event) => {
            if (preview.current) {
              preview.current.style.left = `${Math.min(window.innerWidth - 320, Math.max(18, event.clientX + 22))}px`;
              preview.current.style.top = `${Math.min(window.innerHeight - 320, Math.max(18, event.clientY - 140))}px`;
            }
          }}
        >
          <span className="pathway-row__number">0{i + 1}</span>
          <h3>{pathway.name}</h3>
          <span className="pathway-row__detail">{pathway.detail}</span>
          <span className="pathway-row__arrow" aria-hidden="true">
            ↗
          </span>
          <span className="sr-only"> — official website, opens in a new tab</span>
          <span className="pathway-row__mobile-mark" aria-hidden="true">
            <img src={`/logos/${pathway.logo}`} alt="" />
          </span>
        </a>
      ))}
      <div
        ref={preview}
        className={`pathway-preview${active !== null ? ' is-visible' : ''}`}
        aria-hidden="true"
        style={{ '--preview-color': active !== null ? pathways[active].color : '#eee' } as CSSProperties}
      >
        {active !== null && (
          <>
            <span className="eyebrow">YOUR NEXT POSSIBILITY</span>
            <img src={`/logos/${pathways[active].logo}`} alt="" />
            <span>
              {pathways[active].name}
              <span>↗</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
