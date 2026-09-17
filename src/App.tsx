import { HashRouter, Routes, Route } from "react-router-dom";
import PanelProfesor from "./pages/PanelProfesor";
import ManoView from "./pages/ManoView";
import CartaView from "./pages/CartaView";
import VotosView from "./pages/VotosView";
import VotoView from "./pages/VotoView";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<PanelProfesor />} />
        <Route path="/mano" element={<ManoView />} />
        <Route path="/carta/:id" element={<CartaView />} />
        <Route path="/votos" element={<VotosView />} />
        <Route path="/voto/:token" element={<VotoView />} />
      </Routes>
    </HashRouter>
  );
}
