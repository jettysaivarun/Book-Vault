
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
import MyBooks from './pages/MyBooks'
import Settings from './pages/Settings'
import EBooks from './pages/Ebooks'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
  path="/settings"
  element={<Settings />}
/>

<Route
  path="/settings/profile"
  element={<Settings />}
/>

<Route
  path="/settings/username"
  element={<Settings />}
/>

<Route
  path="/settings/email"
  element={<Settings />}
/>

<Route
  path="/settings/password"
  element={<Settings />}
/>

<Route
  path="/settings/notifications"
  element={<Settings />}
/>

<Route
  path="/settings/account"
  element={<Settings />}
/>
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
<Route
  path="/my-books"
  element={<MyBooks />}
/>
<Route
  path="/ebooks"
  element={<EBooks />}
/>

      </Routes>
    </BrowserRouter>
  )
}

export default App

