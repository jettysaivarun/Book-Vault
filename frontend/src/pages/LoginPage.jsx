import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Eye,
  EyeOff,
  UserRound,
  LockKeyhole,
  ArrowRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './Login.css'

function Login() {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [formError, setFormError] = useState('')

  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()

    setUsernameError('')
    setPasswordError('')
    setFormError('')

    let hasError = false

    if (!username.trim()) {
      setUsernameError('Username is required.')
      hasError = true
    }

    if (!password) {
      setPasswordError('Password is required.')
      hasError = true
    }

    if (hasError) {
      return
    }

    try {
      setLoading(true)

      const response = await api.post('/api/auth/login/', {
        username: username.trim(),
        password,
      })

      const { access, refresh } = response.data

      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)

      console.log('Login successful')

      // Dashboard will be added next.
      // For now, stay on the login page after successful authentication.

    } catch (error) {
      console.error('Login failed:', error)

      const data = error.response?.data

      if (!data) {
        setFormError(
          'Unable to connect to the server. Please try again.'
        )
        return
      }

      if (error.response?.status === 401) {
        setFormError('Invalid username or password.')
        return
      }

      if (data.detail) {
        setFormError('Invalid username or password.')
        return
      }

      if (data.username) {
        setUsernameError(
          Array.isArray(data.username)
            ? data.username[0]
            : data.username
        )
      }

      if (data.password) {
        setPasswordError(
          Array.isArray(data.password)
            ? data.password[0]
            : data.password
        )
      }

      if (
        !data.username &&
        !data.password &&
        !data.detail
      ) {
        setFormError(
          'Login failed. Please check your details and try again.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">

      <motion.section
        className="login-visual"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="visual-content">

          <div className="visual-line" />

          <p className="visual-eyebrow">
            KNOWLEDGE LIVES HERE
          </p>

          <h1>
            More Books
            <br />
            <span>Brighter</span>
            <br />
            <span>Futures</span>
          </h1>

          <div className="visual-divider" />

          <p className="visual-description">
            A smarter way to manage,
            <br />
            explore and grow with books.
          </p>

          <div className="visual-footer">
            <span>READ</span>
            <span>•</span>
            <span>LEARN</span>
            <span>•</span>
            <span>GROW</span>
          </div>

        </div>
      </motion.section>

      <section className="login-background">

        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />

        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: 35, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.7,
            delay: 0.15,
            ease: 'easeOut',
          }}
        >

          <div className="welcome-text">
            Welcome Back <span>♥</span>
          </div>

          <div className="brand">
            <span className="brand-book">Book</span>
            <span className="brand-vault">Vault</span>
          </div>

          <p className="brand-tagline">
            Books Today&nbsp;&nbsp; Better Tomorrows
          </p>

          <form onSubmit={handleLogin}>

            <div className="login-field">

              <div
                className={`input-wrapper ${
                  usernameError ? 'login-input-error' : ''
                }`}
              >
                <UserRound
                  size={21}
                  strokeWidth={1.7}
                />

                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setUsernameError('')
                    setFormError('')
                  }}
                  required
                  autoComplete="username"
                />
              </div>

              {usernameError && (
                <p className="login-field-error">
                  {usernameError}
                </p>
              )}

            </div>

            <div className="login-field">

              <div
                className={`input-wrapper ${
                  passwordError ? 'login-input-error' : ''
                }`}
              >
                <LockKeyhole
                  size={21}
                  strokeWidth={1.7}
                />

                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setPasswordError('')
                    setFormError('')
                  }}
                  required
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff
                      size={21}
                      strokeWidth={1.7}
                    />
                  ) : (
                    <Eye
                      size={21}
                      strokeWidth={1.7}
                    />
                  )}
                </button>
              </div>

              {passwordError && (
                <p className="login-field-error">
                  {passwordError}
                </p>
              )}

            </div>

            {formError && (
              <motion.p
                className="login-form-error"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {formError}
              </motion.p>
            )}

            <motion.button
              type="submit"
              className="login-button"
              disabled={loading}
              whileHover={!loading ? { y: -2 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              <span>
                {loading ? 'Logging In...' : 'Log In'}
              </span>

              {!loading && <ArrowRight size={19} />}
            </motion.button>

          </form>

          <div className="or-divider">
            <span />
            <p>OR</p>
            <span />
          </div>

          <p className="account-question">
            Don't have an account?
          </p>

          <motion.button
            type="button"
            className="register-button"
            onClick={() => navigate('/register')}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Create New Account
          </motion.button>

        </motion.div>

      </section>

    </main>
  )
}

export default Login