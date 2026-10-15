import { Route, Routes } from "react-router-dom"
import Home from "./client/pages/home"
import NotFound from "./client/pages/not-found"
import "leaflet/dist/leaflet.css";
import GymComingSoon from "./client/pages/coming-soon/gym";
import BadmintonComingSoon from "./client/pages/coming-soon/badminton";
import GamingComingSoon from "./client/pages/coming-soon/gaming";
import CarwashComingSoon from "./client/pages/coming-soon/carwash";
import CafeComingSoon from "./client/pages/coming-soon/cafe";
import Sample from "./client/sample";
import SalonComingSoon from "./client/pages/coming-soon/salon";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/gym" element={<GymComingSoon />} />
      <Route path="/carwash" element={<CarwashComingSoon />} />
      <Route path="/badminton" element={<BadmintonComingSoon />} />
      <Route path="/gaming" element={<GamingComingSoon />} />
      <Route path="/cafe" element={<CafeComingSoon />} />
      <Route path="/salon" element={<SalonComingSoon />} />
      <Route path="/sample" element={<Sample />} />
    </Routes>
  )
}

export default App
