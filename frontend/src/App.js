import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GeneratePage from './pages/GeneratePage';
import RequireAuth from './routes/RequireAuth';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/generate"
          element={
            <RequireAuth>
              <GeneratePage />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
