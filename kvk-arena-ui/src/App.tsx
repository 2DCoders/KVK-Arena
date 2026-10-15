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
import GymHome from "./client/pages/home/gym";
import BadmintonHome from "./client/pages/home/badminton";
import GamingHome from "./client/pages/home/gaming";
import CarwashHome from "./client/pages/home/carwash";
import CafeHome from "./client/pages/home/cafe";
import SalonHome from "./client/pages/home/salon";
import { getEnv } from "./env";

function App() {
  const env = getEnv();
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/gym" element={env.GYM_COMING_SOON ? <GymComingSoon /> : <GymHome />} />
      <Route path="/carwash" element={env.CARWASH_COMING_SOON ? <CarwashComingSoon /> : <CarwashHome />} />
      <Route path="/badminton" element={env.BADMINTON_COMING_SOON ? <BadmintonComingSoon /> : <BadmintonHome />} />
      <Route path="/gaming" element={env.GAMING_COMING_SOON ? <GamingComingSoon /> : <GamingHome />} />
      <Route path="/cafe" element={env.CAFE_COMING_SOON ? <CafeComingSoon /> : <CafeHome />} />
      <Route path="/salon" element={env.SALON_COMING_SOON ? <SalonComingSoon /> : <SalonHome />} />
      <Route path="/sample" element={<Sample />} />
    </Routes>
  )
}

export default App
