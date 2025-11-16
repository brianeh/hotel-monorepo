import { BrowserRouter, Route, Routes } from "react-router-dom";
import ApiTestPage from "./components/ApiTestPage";
import HomePage from "./components/HomePage";
import ExplorePage from "./components/ExplorePage";
import ContactPage from "./components/ContactPage";
import AvailableRoomsPage from "./components/AvailableRoomsPage";
import ReservationPage from "./components/ReservationPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/api-test" element={<ApiTestPage />} />
        <Route path="/available-rooms" element={<AvailableRoomsPage />} />
        <Route path="/reservation" element={<ReservationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
