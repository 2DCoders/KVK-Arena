import { Route, Routes } from "react-router-dom"
import Home from "./client/pages/home"
import "leaflet/dist/leaflet.css";
import GymHome from "./client/pages/home/gym";
import BadmintonHome from "./client/pages/home/badminton";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/gym" element={<GymHome />} />
      <Route path="/badminton" element={<BadmintonHome />} />
    </Routes>
  )
}

export default App
