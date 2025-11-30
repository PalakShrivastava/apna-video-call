import "./App.css";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Authentication from "./pages/Authentication";
import VideoMeet from "./pages/VideoMeet";
import Home from "./pages/Home";
import History from "./pages/History";
import { AuthProvider } from "./contexts/AuthContext";
import WithAuth from "./utils/WithAuth";

function App() {
  const ProtectedHome = WithAuth(Home);
  const ProtectedHistory = WithAuth(History);
  const ProtectedMeet = WithAuth(VideoMeet);

  return (
    <Router>
      <AuthProvider>
        <Routes>

          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Authentication />} />

          {/* Protected routes */}
          <Route path="/home" element={<ProtectedHome />} />
          <Route path="/history" element={<ProtectedHistory />} />
          <Route path="/meet/:url" element={<ProtectedMeet />} />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
