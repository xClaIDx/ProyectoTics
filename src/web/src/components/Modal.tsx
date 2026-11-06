import { useEffect, type ReactNode } from 'react';
import { IconX } from './Icons';

export function Modal({ titulo, onClose, children, lateral }: { titulo: string; onClose: () => void; children: ReactNode; lateral?: boolean }) {
  useEffect(() => {
    const f = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', f);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', f); document.body.style.overflow = ''; };
  }, [onClose]);
  return (
    <div className="velo" onClick={onClose}>
      <div className={lateral ? 'panel-lateral' : 'modal'} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={titulo}>
        <header className="modal-cab">
          <h3>{titulo}</h3>
          <button className="btn-icono" onClick={onClose} aria-label="Cerrar"><IconX /></button>
        </header>
        <div className="modal-cuerpo">{children}</div>
      </div>
    </div>
  );
}
