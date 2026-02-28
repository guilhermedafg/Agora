import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Hoje from './pages/Hoje'
import Exercicios from './pages/Exercicios'
import Corpo from './pages/Corpo'
import Diario from './pages/Diario'

export default function App() {
  return (
    <BrowserRouter>
      <div
        className="flex flex-col min-h-svh"
        style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/hoje" replace />} />
          <Route path="/hoje" element={<Hoje />} />
          <Route path="/exercicios" element={<Exercicios />} />
          <Route path="/corpo" element={<Corpo />} />
          <Route path="/diario" element={<Diario />} />
        </Routes>
      </div>
      <BottomNav />
    </BrowserRouter>
  )
}
