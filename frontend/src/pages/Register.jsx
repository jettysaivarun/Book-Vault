
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './Register.css'

function Register() {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [usernameError, setUsernameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [formError, setFormError] = useState('')

  const [loading, setLoading] = useState(false)

  const passwordIsValid =
    password.length >= 8 &&
    /[^A-Za-z0-9]/.test(password)

  const confirmPasswordIsValid =
    confirmPassword.length > 0 &&
    confirmPassword === password

  const checkUsername = async (value) => {
    const usernameValue = value.trim()

    if (!usernameValue) {
      setUsernameError('')
      return
    }

    try {
      await api.post('/api/auth/check_user/', {
        username: usernameValue,
      })

      setUsernameError('')
    } catch (error) {
      if (error.response?.status === 400) {
        setUsernameError('Username already exists.')
      } else {
        setUsernameError('')
      }
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    setUsernameError('')
    setEmailError('')
    setPasswordError('')
    setConfirmPasswordError('')
    setFormError('')

    let hasError = false

    if (!username.trim()) {
      setUsernameError('Username is required.')
      hasError = true
    }

    if (!email.trim()) {
      setEmailError('Email address is required.')
      hasError = true
    }

    if (!password) {
      setPasswordError('Password is required.')
      hasError = true
    } else if (!passwordIsValid) {
      setPasswordError(
        'Password must be at least 8 characters and contain at least one special character.'
      )
      hasError = true
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password.')
      hasError = true
    } else if (!confirmPasswordIsValid) {
      setConfirmPasswordError('Passwords do not match.')
      hasError = true
    }

    if (hasError) {
      return
    }

    try {
      setLoading(true)

      const response = await api.post('/api/auth/register/', {
  username: username.trim(),
  email: email.trim(),
  password,
})
const { access, refresh, username: registeredUsername } = response.data

      console.log('Registration successful:', response.data)

      localStorage.setItem('access_token', access)
localStorage.setItem('refresh_token', refresh)
localStorage.setItem('username', registeredUsername)

navigate('/dashboard')
    } catch (error) {
      console.error('Registration failed:', error)

      const data = error.response?.data

      if (!data) {
        setFormError(
          'Unable to connect to the server. Please try again.'
        )
        return
      }

      if (data.username) {
        setUsernameError(
          Array.isArray(data.username)
            ? data.username[0]
            : data.username
        )
      }

      if (data.email) {
        setEmailError(
          Array.isArray(data.email)
            ? data.email[0]
            : data.email
        )
      }

      if (data.password) {
        setPasswordError(
          Array.isArray(data.password)
            ? data.password[0]
            : data.password
        )
      }

      if (data.detail) {
        setFormError(data.detail)
      }

      if (
        !data.username &&
        !data.email &&
        !data.password &&
        !data.detail
      ) {
        setFormError(
          'Registration failed. Please check your details and try again.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="register-page">

      <motion.section
        className="register-visual"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="register-visual-content">

          <div className="register-visual-line" />

          <p className="register-visual-eyebrow">
            KNOWLEDGE LIVES HERE
          </p>

          <h1>
            More Books
            <br />
            <span>Brighter</span>
            <br />
            <span>Futures</span>
          </h1>

          <div className="register-visual-divider" />

          <p className="register-visual-description">
            A smarter way to manage,
            <br />
            explore and grow with books.
          </p>

          <div className="register-visual-footer">
            <span>READ</span>
            <span>•</span>
            <span>LEARN</span>
            <span>•</span>
            <span>GROW</span>
          </div>

        </div>
      </motion.section>

      <section className="register-background">

        <div className="register-ambient register-ambient-one" />
        <div className="register-ambient register-ambient-two" />

        <motion.div
          className="register-card"
          initial={{ opacity: 0, y: 35, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.7,
            delay: 0.15,
            ease: 'easeOut',
          }}
        >

          <div className="register-welcome">
            Join BookVault <span>♥</span>
          </div>

          <div className="register-brand">
            <span className="register-brand-book">
              Book
            </span>

            <span className="register-brand-vault">
              Vault
            </span>
          </div>

          <p className="register-tagline">
            Your Library&nbsp;&nbsp; Your World
          </p>

          <form onSubmit={handleRegister}>

            <div className="register-field">

              <div
                className={`register-input-wrapper ${
                  usernameError ? 'register-input-error' : ''
                }`}
              >
                <UserRound
                  size={20}
                  strokeWidth={1.7}
                />

                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => {
                    const value = e.target.value

                    setUsername(value)
                    setFormError('')

                    checkUsername(value)
                  }}
                  required
                />
              </div>

              {usernameError && (
                <p className="register-field-error">
                  {usernameError}
                </p>
              )}

            </div>

            <div className="register-field">

              <div
                className={`register-input-wrapper ${
                  emailError ? 'register-input-error' : ''
                }`}
              >
                <Mail
                  size={20}
                  strokeWidth={1.7}
                />

                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setEmailError('')
                    setFormError('')
                  }}
                  required
                />
              </div>

              {emailError && (
                <p className="register-field-error">
                  {emailError}
                </p>
              )}

            </div>

            <div className="register-field">

              <div
                className={`register-input-wrapper ${
                  password.length > 0
                    ? passwordIsValid
                      ? 'register-input-valid'
                      : 'register-input-error'
                    : passwordError
                      ? 'register-input-error'
                      : ''
                }`}
              >
                <LockKeyhole
                  size={20}
                  strokeWidth={1.7}
                />

                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    const newPassword = e.target.value

                    setPassword(newPassword)
                    setPasswordError('')
                    setFormError('')

                    if (
                      confirmPassword &&
                      newPassword !== confirmPassword
                    ) {
                      setConfirmPasswordError(
                        'Passwords do not match.'
                      )
                    } else if (
                      confirmPassword &&
                      newPassword === confirmPassword
                    ) {
                      setConfirmPasswordError('')
                    }
                  }}
                  required
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>

              </div>

              {password.length > 0 && !passwordIsValid && (
                <p className="register-field-hint register-password-hint">
                  Use at least 8 characters and at least one special character.
                </p>
              )}

              {password.length > 0 && passwordIsValid && (
                <p className="register-field-success">
                  ✓ Password meets all requirements.
                </p>
              )}

              {passwordError && (
                <p className="register-field-error">
                  {passwordError}
                </p>
              )}

            </div>

            <div className="register-field">

              <div
                className={`register-input-wrapper ${
                  confirmPassword.length > 0
                    ? confirmPasswordIsValid
                      ? 'register-input-valid'
                      : 'register-input-error'
                    : confirmPasswordError
                      ? 'register-input-error'
                      : ''
                }`}
              >
                <LockKeyhole
                  size={20}
                  strokeWidth={1.7}
                />

                <input
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => {
                    const newConfirmPassword =
                      e.target.value

                    setConfirmPassword(newConfirmPassword)
                    setConfirmPasswordError('')
                    setFormError('')

                    if (
                      newConfirmPassword &&
                      newConfirmPassword !== password
                    ) {
                      setConfirmPasswordError(
                        'Passwords do not match.'
                      )
                    }
                  }}
                  required
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>

              </div>

              {confirmPassword.length > 0 &&
                !confirmPasswordIsValid && (
                  <p className="register-field-error">
                    Passwords do not match.
                  </p>
                )}

              {confirmPassword.length > 0 &&
                confirmPasswordIsValid && (
                  <p className="register-field-success">
                    ✓ Passwords match.
                  </p>
                )}

              {confirmPasswordError &&
                confirmPassword.length === 0 && (
                  <p className="register-field-error">
                    {confirmPasswordError}
                  </p>
                )}

            </div>

            {formError && (
              <motion.p
                className="register-form-error"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {formError}
              </motion.p>
            )}

            <motion.button
              type="submit"
              className="register-submit-button"
              disabled={loading}
              whileHover={!loading ? { y: -2 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              <span>
                {loading
                  ? 'Creating Account...'
                  : 'Create Account'}
              </span>

              {!loading && <ArrowRight size={19} />}
            </motion.button>

          </form>

          <p className="register-login-question">
            Already have an account?
          </p>

          <motion.button
            type="button"
            className="register-login-button"
            onClick={() => navigate('/login')}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Back to Login
          </motion.button>

        </motion.div>

      </section>

    </main>
  )
}

export default Register

