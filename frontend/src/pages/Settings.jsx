import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Home,
  BookOpen,
  Library,
  FileText,
  Settings as SettingsIcon,
  Leaf,
  User,
  Lock,
  Mail,
  AtSign,
  Bell,
  LogOut,
  Trash2,
  ChevronRight,
  Pencil,
  Eye,
  EyeOff,
  CalendarDays,
  RotateCcw,
  Megaphone,
  BookMarked,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import NotificationBell from '../components/NotificationBell'
import { logout } from '../services/api'
import './Settings.css'

function Settings() {
  const navigate = useNavigate()
  const location = useLocation()

  const username =
    localStorage.getItem('username') || 'Ketan'

  const [newUsername, setNewUsername] = useState('')
  const [currentEmail, setCurrentEmail] = useState(
    localStorage.getItem('email') || ''
  )
  const [newEmail, setNewEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false)
  const [showNewPassword, setShowNewPassword] =
    useState(false)
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false)

  const [notifications, setNotifications] = useState({
    dueDates: true,
    borrowRequests: true,
    returnRequests: true,
    announcements: true,
  })

  const path = location.pathname

  const activeSection =
    path === '/settings/profile'
      ? 'profile'
      : path === '/settings/username'
        ? 'username'
        : path === '/settings/email'
          ? 'email'
          : path === '/settings/password'
            ? 'password'
            : path === '/settings/notifications'
              ? 'notifications'
              : path === '/settings/account'
                ? 'account'
                : 'home'

  const settingsItems = [
    {
      path: '/settings/profile',
      icon: User,
      title: 'Profile',
      description:
        'View and update your personal information',
    },
    {
      path: '/settings/password',
      icon: Lock,
      title: 'Change Password',
      description:
        'Update your password to keep your account secure',
    },
    {
      path: '/settings/email',
      icon: Mail,
      title: 'Change Email',
      description: 'Update your email address',
    },
    {
      path: '/settings/username',
      icon: AtSign,
      title: 'Change Username',
      description: 'Update your username',
    },
    {
      path: '/settings/notifications',
      icon: Bell,
      title: 'Notification Reminders',
      description:
        'Manage your notification reminders',
    },
    {
      path: '/settings/account',
      icon: LogOut,
      title: 'Account Actions',
      description:
        'Log out or delete your account',
    },
  ]

  const toggleNotification = (key) => {
    setNotifications((previous) => ({
      ...previous,
      [key]: !previous[key],
    }))
  }

  const handleUsernameUpdate = (event) => {
    event.preventDefault()

    if (!newUsername.trim()) {
      return
    }

    localStorage.setItem(
      'username',
      newUsername.trim()
    )

    setNewUsername('')
    window.location.reload()
  }

  const handleEmailUpdate = (event) => {
    event.preventDefault()

    if (
      !newEmail.trim() ||
      newEmail !== confirmEmail
    ) {
      return
    }

    localStorage.setItem('email', newEmail.trim())

    setCurrentEmail(newEmail.trim())
    setNewEmail('')
    setConfirmEmail('')
  }

  const handlePasswordUpdate = (event) => {
    event.preventDefault()

    if (
      !currentPassword ||
      !newPassword ||
      newPassword !== confirmPassword
    ) {
      return
    }

    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const renderTopbar = () => (
    <header className="settings-topbar">
      <div className="settings-header-brand">
        <Leaf
          size={42}
          strokeWidth={1.4}
        />

        <div>
          <h1>BookVault</h1>
          <p>
            Your Library&nbsp;&nbsp; Your World
          </p>
        </div>
      </div>

      <div className="settings-user-area">
        <NotificationBell />

        <div className="settings-user">
          <div className="settings-avatar">
            {username.charAt(0).toUpperCase()}
          </div>

          <div className="settings-user-name">
            <span>Hello,</span>
            <strong>{username}</strong>
          </div>

          <span className="settings-user-arrow">
            ˅
          </span>
        </div>
      </div>
    </header>
  )

  const renderSidebar = () => (
    <aside className="settings-sidebar">
      <div className="settings-sidebar-logo">
        <Leaf
          size={43}
          strokeWidth={1.4}
        />

        <h1>BookVault</h1>

        <p>
          Your Library&nbsp;&nbsp; Your World
        </p>
      </div>

      <nav className="settings-nav">
        <button
          type="button"
          className="settings-nav-item"
          onClick={() => navigate('/dashboard')}
        >
          <Home
            size={21}
            strokeWidth={1.8}
          />
          <span>Home</span>
        </button>

        <button
          type="button"
          className="settings-nav-item"
          onClick={() => navigate('/all-books')}
        >
          <BookOpen
            size={21}
            strokeWidth={1.8}
          />
          <span>All Books</span>
        </button>

        <button
          type="button"
          className="settings-nav-item"
          onClick={() => navigate('/my-books')}
        >
          <Library
            size={21}
            strokeWidth={1.8}
          />
          <span>My Books</span>
        </button>

        <button
          type="button"
          className="settings-nav-item"
        >
          <FileText
            size={21}
            strokeWidth={1.8}
          />
          <span>E Books</span>
        </button>

        <button
          type="button"
          className="settings-nav-item active"
          onClick={() => navigate('/settings')}
        >
          <SettingsIcon
            size={21}
            strokeWidth={1.8}
          />
          <span>Settings</span>
        </button>
      </nav>

      <div className="settings-sidebar-quote">
        <p>
          “A reader lives
          <br />
          a thousand lives.”
        </p>

        <span />
      </div>
    </aside>
  )

  const renderPageHeader = (
    title,
    subtitle
  ) => (
    <div className="settings-page-header">
      <div>
        <p className="settings-eyebrow">
          BOOKVAULT
        </p>

        <h2>{title}</h2>

        <span>{subtitle}</span>
      </div>
    </div>
  )

  const renderSettingsHome = () => (
    <>
      {renderPageHeader(
        'Settings',
        'Manage your account and preferences'
      )}

      <motion.div
        className="settings-card-grid"
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
        }}
      >
        {settingsItems.map((item) => {
          const Icon = item.icon

          return (
            <motion.button
              key={item.path}
              type="button"
              className="settings-option-card"
              whileHover={{
                y: -3,
              }}
              whileTap={{
                scale: 0.99,
              }}
              onClick={() =>
                navigate(item.path)
              }
            >
              <div className="settings-option-icon">
                <Icon
                  size={23}
                  strokeWidth={1.6}
                />
              </div>

              <div className="settings-option-content">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>

              <ChevronRight
                className="settings-option-arrow"
                size={21}
                strokeWidth={1.7}
              />
            </motion.button>
          )
        })}
      </motion.div>
    </>
  )

  const renderBackButton = () => (
    <button
      type="button"
      className="settings-back"
      onClick={() => navigate('/settings')}
    >
      ← Settings
    </button>
  )

  const renderProfile = () => (
    <>
      {renderBackButton()}

      {renderPageHeader(
        'Profile',
        'Update your personal information'
      )}

      <motion.section
        className="settings-profile-card"
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        <div className="settings-profile-photo-section">
          <div className="settings-profile-avatar">
            {username.charAt(0).toUpperCase()}

            <button
              type="button"
              className="settings-photo-edit"
            >
              <Pencil
                size={16}
                strokeWidth={2}
              />
            </button>
          </div>

          <button
            type="button"
            className="settings-change-photo"
          >
            <Pencil
              size={15}
              strokeWidth={1.8}
            />
            Change Photo
          </button>

          <p>
            JPG, PNG or WEBP. Max size 5MB.
          </p>
        </div>

        <div className="settings-personal-details">
          <div className="settings-section-heading">
            <div className="settings-small-icon">
              <User
                size={20}
                strokeWidth={1.7}
              />
            </div>

            <div>
              <h3>Personal Details</h3>
              <p>
                Your BookVault account information
              </p>
            </div>
          </div>

          <div className="settings-field">
            <label>Username</label>

            <div className="settings-input-with-icon">
              <input
                value={username}
                readOnly
              />

              <button
                type="button"
                onClick={() =>
                  navigate('/settings/username')
                }
              >
                <Pencil size={16} />
              </button>
            </div>
          </div>

          <div className="settings-field">
            <label>Email</label>

            <div className="settings-input-with-icon">
              <input
                value={
                  currentEmail ||
                  'Email not available'
                }
                readOnly
              />

              <button
                type="button"
                onClick={() =>
                  navigate('/settings/email')
                }
              >
                <Pencil size={16} />
              </button>
            </div>
          </div>

          <div className="settings-info-box">
            <span>ⓘ</span>

            <p>
              Use the options below to change your
              username or email address.
            </p>
          </div>
        </div>
      </motion.section>
    </>
  )

  const renderUsername = () => (
    <>
      {renderBackButton()}

      {renderPageHeader(
        'Change Username',
        'Update your username'
      )}

      <motion.form
        className="settings-form-card"
        onSubmit={handleUsernameUpdate}
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        <div className="settings-form-field">
          <label>Current Username</label>

          <input
            value={username}
            readOnly
            className="settings-disabled-input"
          />
        </div>

        <div className="settings-form-field">
          <label>New Username</label>

          <input
            type="text"
            placeholder="Enter new username"
            value={newUsername}
            onChange={(event) =>
              setNewUsername(event.target.value)
            }
          />
        </div>

        <p className="settings-field-hint">
          Username must be 3–20 characters and can
          contain letters, numbers and underscores.
        </p>

        <button
          type="submit"
          className="settings-primary-button"
        >
          Update Username
        </button>
      </motion.form>
    </>
  )

  const renderEmail = () => (
    <>
      {renderBackButton()}

      {renderPageHeader(
        'Change Email',
        'Update your email address'
      )}

      <motion.form
        className="settings-form-card"
        onSubmit={handleEmailUpdate}
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        <div className="settings-form-field">
          <label>Current Email</label>

          <input
            value={
              currentEmail ||
              'Email not available'
            }
            readOnly
            className="settings-disabled-input"
          />
        </div>

        <div className="settings-form-field">
          <label>New Email</label>

          <div className="settings-input-container">
            <input
              type="email"
              placeholder="Enter new email address"
              value={newEmail}
              onChange={(event) =>
                setNewEmail(event.target.value)
              }
            />

            <Mail size={17} />
          </div>
        </div>

        <div className="settings-form-field">
          <label>Confirm New Email</label>

          <div className="settings-input-container">
            <input
              type="email"
              placeholder="Confirm new email address"
              value={confirmEmail}
              onChange={(event) =>
                setConfirmEmail(
                  event.target.value
                )
              }
            />

            <Mail size={17} />
          </div>
        </div>

        <button
          type="submit"
          className="settings-primary-button"
        >
          Update Email
        </button>
      </motion.form>
    </>
  )

  const renderPassword = () => (
    <>
      {renderBackButton()}

      {renderPageHeader(
        'Change Password',
        'Update your password to keep your account secure'
      )}

      <motion.form
        className="settings-form-card settings-password-form"
        onSubmit={handlePasswordUpdate}
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        <div className="settings-form-field">
          <label>Current Password</label>

          <div className="settings-input-container">
            <input
              type={
                showCurrentPassword
                  ? 'text'
                  : 'password'
              }
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(event) =>
                setCurrentPassword(
                  event.target.value
                )
              }
            />

            <button
              type="button"
              onClick={() =>
                setShowCurrentPassword(
                  !showCurrentPassword
                )
              }
            >
              {showCurrentPassword ? (
                <EyeOff size={17} />
              ) : (
                <Eye size={17} />
              )}
            </button>
          </div>
        </div>

        <div className="settings-form-field">
          <label>New Password</label>

          <div className="settings-input-container">
            <input
              type={
                showNewPassword
                  ? 'text'
                  : 'password'
              }
              placeholder="Enter new password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(
                  event.target.value
                )
              }
            />

            <button
              type="button"
              onClick={() =>
                setShowNewPassword(
                  !showNewPassword
                )
              }
            >
              {showNewPassword ? (
                <EyeOff size={17} />
              ) : (
                <Eye size={17} />
              )}
            </button>
          </div>
        </div>

        <div className="settings-form-field">
          <label>Confirm New Password</label>

          <div className="settings-input-container">
            <input
              type={
                showConfirmPassword
                  ? 'text'
                  : 'password'
              }
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
            >
              {showConfirmPassword ? (
                <EyeOff size={17} />
              ) : (
                <Eye size={17} />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="settings-primary-button"
        >
          Update Password
        </button>
      </motion.form>
    </>
  )

  const renderNotifications = () => (
    <>
      {renderBackButton()}

      {renderPageHeader(
        'Notification Reminders',
        'Choose what notifications you want to receive'
      )}

      <motion.section
        className="settings-notification-card"
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        <NotificationSetting
          icon={CalendarDays}
          title="Due Date Reminders"
          description="Get reminded before your books are due"
          enabled={notifications.dueDates}
          onToggle={() =>
            toggleNotification('dueDates')
          }
        />

        <NotificationSetting
          icon={BookMarked}
          title="Borrow Request Updates"
          description="Get notified about borrow request status"
          enabled={
            notifications.borrowRequests
          }
          onToggle={() =>
            toggleNotification(
              'borrowRequests'
            )
          }
        />

        <NotificationSetting
          icon={RotateCcw}
          title="Return Request Updates"
          description="Get notified about return request status"
          enabled={
            notifications.returnRequests
          }
          onToggle={() =>
            toggleNotification(
              'returnRequests'
            )
          }
        />

        <NotificationSetting
          icon={Megaphone}
          title="Library Announcements"
          description="Get important updates from the library"
          enabled={
            notifications.announcements
          }
          onToggle={() =>
            toggleNotification(
              'announcements'
            )
          }
        />
      </motion.section>
    </>
  )

  const renderAccount = () => (
    <>
      {renderBackButton()}

      {renderPageHeader(
        'Account Actions',
        'Manage your BookVault account'
      )}

      <motion.section
        className="settings-account-grid"
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        <div className="settings-danger-card logout-card">
          <div className="settings-danger-icon">
            <LogOut size={22} />
          </div>

          <div>
            <h3>Log Out</h3>
            <p>
              Log out from your account on this
              device.
            </p>
          </div>

          <button
            type="button"
            className="settings-logout-button"
            onClick={logout}
          >
            <LogOut size={17} />
            Log Out
          </button>
        </div>

        <div className="settings-danger-card delete-card">
          <div className="settings-delete-icon">
            <Trash2 size={22} />
          </div>

          <div>
            <h3>Delete Account</h3>
            <p>
              This will permanently delete your
              account and all associated data.
              This action cannot be undone.
            </p>
          </div>

          <button
            type="button"
            className="settings-delete-button"
          >
            <Trash2 size={17} />
            Delete Account
          </button>
        </div>
      </motion.section>
    </>
  )

  const renderContent = () => {
    if (activeSection === 'profile') {
      return renderProfile()
    }

    if (activeSection === 'username') {
      return renderUsername()
    }

    if (activeSection === 'email') {
      return renderEmail()
    }

    if (activeSection === 'password') {
      return renderPassword()
    }

    if (activeSection === 'notifications') {
      return renderNotifications()
    }

    if (activeSection === 'account') {
      return renderAccount()
    }

    return renderSettingsHome()
  }

  return (
    <main className="settings-page">
      {renderSidebar()}

      <section className="settings-content">
        {renderTopbar()}

        <div className="settings-main">
          {renderContent()}
        </div>
      </section>
    </main>
  )
}

function NotificationSetting({
  icon: Icon,
  title,
  description,
  enabled,
  onToggle,
}) {
  return (
    <div className="notification-setting">
      <div className="notification-setting-icon">
        <Icon
          size={21}
          strokeWidth={1.7}
        />
      </div>

      <div className="notification-setting-text">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <button
        type="button"
        className={`notification-toggle ${
          enabled ? 'enabled' : ''
        }`}
        onClick={onToggle}
        aria-label={`Toggle ${title}`}
      >
        <span />
      </button>
    </div>
  )
}

export default Settings