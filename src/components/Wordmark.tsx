export function Wordmark({ white = false, large = false }: { white?: boolean; large?: boolean }) {
  return (
    <span className={`wordmark${white ? ' wordmark--white' : ''}${large ? ' wordmark--large' : ''}`}>
      <img src="/brand/cap-no-star.png" alt="" width="905" height="668" />
      <span>
        (Ad)mission<span className="wordmark__break"> </span>Possible
      </span>
    </span>
  );
}
