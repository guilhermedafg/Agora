import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Exercicios from './pages/Exercicios'
import Corpo from './pages/Corpo'
import Diario from './pages/Diario'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-svh md:max-w-[1100px] md:mx-auto">
        <BottomNav />
        <div className="flex-1 flex flex-col content-main">
          <Routes>
            <Route path="/" element={<Navigate to="/exercicios" replace />} />
            <Route path="/exercicios" element={<Exercicios />} />
            <Route path="/corpo" element={<Corpo />} />
            <Route path="/diario" element={<Diario />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
