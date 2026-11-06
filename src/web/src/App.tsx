import { Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { RoomDetail } from './pages/RoomDetail';
import { Publish } from './pages/Publish';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { HowItWorks } from './pages/HowItWorks';

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cuarto/:id" element={<RoomDetail />} />
        <Route path="/publicar" element={<Publish />} />
        <Route path="/publicar/:id" element={<Publish />} />
        <Route path="/ingresar" element={<Login />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/como-funciona" element={<HowItWorks />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <footer className="pie"><div className="contenedor">CasaScore (AlquilaPuno) · Team Sobrevivientes · Puno, 2026 · Mapas © colaboradores de OpenStreetMap</div></footer>
    </>
  );
}
