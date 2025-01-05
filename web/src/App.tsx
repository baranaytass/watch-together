import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Session from './pages/Session';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/session/:sessionId" element={<Session />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App; 