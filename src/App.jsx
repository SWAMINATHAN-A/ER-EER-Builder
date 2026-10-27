import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import DiagramBuilder from './pages/DiagramBuilder.jsx';
import PracticeArena from './pages/PracticeArena.jsx';
import Learn from './pages/Learn.jsx';
import Help from './pages/Help.jsx';
import DevelopedBy from './pages/DevelopedBy.jsx';
import HashingVisualizer from './pages/HashingVisualizer.jsx';
import Login from './pages/Login.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { DiagramProvider } from './context/DiagramContext.jsx';
import { NavProvider } from './context/NavContext.jsx';

export default function App() {
  useEffect(() => {
    document.title = "ER/EER Builder";
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <DiagramProvider>
          <NavProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<LandingPage />} />
                <Route path="builder" element={<DiagramBuilder />} />
                <Route path="practice" element={<PracticeArena />} />
                <Route path="hashing" element={<HashingVisualizer />} />
                <Route path="er" element={<Navigate to="/builder?mode=er" replace />} />
                <Route path="eer" element={<Navigate to="/builder?mode=eer" replace />} />
                <Route path="learn" element={<Learn />} />
                <Route path="help" element={<Help />} />
                <Route path="developed-by" element={<DevelopedBy />} />
                <Route path="login" element={<Login />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </NavProvider>
        </DiagramProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
