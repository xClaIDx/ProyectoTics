import { colorPuntaje } from '../lib/scoring';
export function ScoreBadge({ valor, grande }: { valor: number; grande?: boolean }) {
  return (
    <span className={`score score-${colorPuntaje(valor)} ${grande ? 'score-grande' : ''}`} title="CASA SCORE de 0 a 100">
      <small>CASA SCORE</small>
      <b>{valor}</b>
    </span>
  );
}
