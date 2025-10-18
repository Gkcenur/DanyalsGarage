import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Play from './pages/Play'
import './global.css'

// --- Not: Vercel'de basename kullanmaya gerek yok.
// --- Normal BrowserRouter yeterlidir.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Ana sayfa */}
        <Route path="/" element={<App />} />

        {/* Oyun sayfası */}
        <Route path="/play" element={<Play />} />

        {/* Fallback route (404 → ana sayfaya yönlendir) */}
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
