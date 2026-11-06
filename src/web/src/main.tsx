import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppProvider } from './state/AppContext';
import { errorConexion, inicializar } from './data/repo';
import './styles.css';

inicializar().then(() => {
  if (errorConexion) {
    createRoot(document.getElementById('root')!).render(
      <main className="contenedor pagina vacio">
        <h3>No se pudo cargar CasaScore</h3>
        <p>{errorConexion}</p>
        <p className="tenue">Si es la primera vez, prepara la base de datos con <code>npm run db:init</code>.</p>
        <button className="btn" onClick={() => location.reload()}>Reintentar</button>
      </main>,
    );
    return;
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <AppProvider>
          <App />
        </AppProvider>
      </BrowserRouter>
    </StrictMode>,
  );
});
