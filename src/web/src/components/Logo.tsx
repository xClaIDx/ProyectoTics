import { Link } from 'react-router-dom';
export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="CasaScore, inicio">
      <svg width="26" height="26" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="16" fill="var(--primario)" />
        <path d="M14 34 32 18l18 16v14a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2z" fill="#fff" />
        <path d="M27 50V38h10v12" fill="var(--primario)" />
      </svg>
      <span>casa<b>score</b></span>
    </Link>
  );
}
