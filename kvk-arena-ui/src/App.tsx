import { Route, Routes } from "react-router-dom"
import Home from "./client/pages/home"
import NotFound from "./client/pages/not-found"
import "leaflet/dist/leaflet.css";
// import GymHome from "./client/pages/home/gym";
// import BadmintonHome from "./client/pages/home/badminton";
// import GamingHome from "./client/pages/home/gaming";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
      {/* <Route path="/gym" element={<GymHome />} />
      <Route path="/badminton" element={<BadmintonHome />} />
      <Route path="/gaming" element={<GamingHome />} /> */}
    </Routes>
  )
}

export default App
