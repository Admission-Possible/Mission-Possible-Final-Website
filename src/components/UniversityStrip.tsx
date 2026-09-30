import { universityMarks } from '../data/site';

export function UniversityStrip({ paused }: { paused: boolean }) {
  return (
    <div className="university-strip">
      <p>
        A world of
        <br />
        possibilities.
      </p>
      <div
        className={`university-strip__window${paused ? ' is-paused' : ''}`}
        tabIndex={0}
        role="group"
        aria-label="University destinations. Animation pauses on focus."
      >
        <div className="university-strip__track">
          {[0, 1].map((copy) => (
            <div className="university-strip__group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
              {universityMarks.map((mark) => (
                <img key={mark.name} src={`/logos/${mark.src}`} alt={copy ? '' : mark.name} width="160" height="64" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
