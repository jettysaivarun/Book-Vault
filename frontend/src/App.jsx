
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import Login from './pages/LoginPage'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AllBooks from './pages/AllBooks'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
        <Route
  path="/all-books"
  element={<AllBooks />}
/>

      </Routes>
    </BrowserRouter>
  )
}

export default App

