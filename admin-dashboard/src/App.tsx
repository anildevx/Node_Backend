import { Routes, Route, Link, Outlet } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import PageNotFound from './pages/PageNotFound'

function AdminLayout() {
  return (
    <div>
      <nav style={{ marginBottom: '20px' }}>
        <Link to="/admin">Home</Link> | <Link to="/admin/about">About</Link> |{' '}
        <Link to="/admin/contact">Contact</Link>
      </nav>

      {/* Renders nested routes */}
      <Outlet />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Home />} /> {/* Matches /admin */}
        <Route path="about" element={<About />} /> {/* Matches /admin/about */}
        <Route path="contact" element={<Contact />} /> {/* Matches /admin/contact */}
        <Route path="*" element={<PageNotFound />} /> {/* Catch-all under /admin */}
      </Route>

      {/* Catch-all outside /admin */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  )
}

export default App
