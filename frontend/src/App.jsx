import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Success from './pages/Success'
import Cancel from './pages/Cancel'
import ErrorPage from './pages/ErrorPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
        <Route path="/error" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  )
}
