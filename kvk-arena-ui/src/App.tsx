import { Route, Routes } from "react-router-dom"
import Home from "./client/pages/home"
import NotFound from "./client/pages/not-found"
import "leaflet/dist/leaflet.css";
import GymHome from "./client/pages/home/gym";
import BadmintonHome from "./client/pages/home/badminton";
import GamingHome from "./client/pages/home/gaming";
import CarwashHome from "./client/pages/home/carwash";
import CafeHome from "./client/pages/home/cafe";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/gym" element={<GymHome />} />
      <Route path="/carwash" element={<CarwashHome />} />
      <Route path="/badminton" element={<BadmintonHome />} />
      <Route path="/gaming" element={<GamingHome />} />
      <Route path="/cafe" element={<CafeHome />} />
    </Routes>
  )
}

export default App
