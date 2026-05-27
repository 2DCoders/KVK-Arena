import { Route, Routes } from "react-router-dom"
import Home from "./client/pages/home"
import "leaflet/dist/leaflet.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  )
}

export default App
