import { useEffect,useRef,useState } from 'react'
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
import api,{ logout } from '../services/api'
import './Settings.css'
import UserProfile from '../components/UserProfile'

const API_URL =import.meta.env.VITE_API_URL || '${API_URL}'
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
  const [emailPassword, setEmailPassword] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [deletePassword, setDeletePassword] = useState('')
  const [showDeletePassword, setShowDeletePassword] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false)
  const [showNewPassword, setShowNewPassword] =
    useState(false)
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false)

  const [notifications, setNotifications] = useState({
  borrowRequests: true,
  returnRequests: true,
})

const [profilePicture, setProfilePicture] = useState(null)
const [profilePreview, setProfilePreview] = useState(null)
const profileInputRef = useRef(null)

useEffect(() => {
  const loadMemberData = async () => {
    try {
      const response = await api.get(
        '/api/librarymanagement/members/current_member/'
      )
      console.log('GET CURRENT MEMBER:', response.data)
console.log('GET PROFILE URL:', response.data.profile_picture)

      setNotifications((previous) => ({
        ...previous,
        borrowRequests: response.data.borrow_updates,
        returnRequests: response.data.return_updates,
      }))

      if (response.data.profile_picture) {
  const profileUrl = response.data.profile_picture.startsWith('http')
    ? response.data.profile_picture
    : `https://res.cloudinary.com/y4b8yqds/${response.data.profile_picture}`

  setProfilePicture(profileUrl)
}
    } catch (error) {
      console.error(
        'Failed to load member data:',
        error
      )
    }
  }

  loadMemberData()
}, [])

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

  
const toggleNotification = async (key) => {
  if (key !== 'borrowRequests' && key !== 'returnRequests') {
    setNotifications((previous) => ({
      ...previous,
      [key]: !previous[key],
    }))
    return
  }

  const newValue = !notifications[key]

  let endpoint

  if (key === 'borrowRequests') {
    endpoint = newValue
      ? '/api/librarymanagement/members/enable_borrow_notifications/'
      : '/api/librarymanagement/members/disable_borrow_notifications/'
  } else {
    endpoint = newValue
      ? '/api/librarymanagement/members/enable_return_notifications/'
      : '/api/librarymanagement/members/disable_return_notifications/'
  }

  try {
    await api.post(endpoint)

    setNotifications((previous) => ({
      ...previous,
      [key]: newValue,
    }))
  } catch (error) {
    console.error('Failed to update notification setting:', error)

    alert(
      error.response?.data?.error ||
        'Unable to update notification setting.'
    )
  }
}

const handleProfilePictureChange = async (event) => {
  const file = event.target.files?.[0]

  if (!file) {
    return
  }

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ]

  if (!allowedTypes.includes(file.type)) {
    alert('Please select a JPG, PNG or WEBP image.')
    event.target.value = ''
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('Profile picture must be smaller than 5MB.')
    event.target.value = ''
    return
  }

  const previewUrl = URL.createObjectURL(file)
  setProfilePreview(previewUrl)

  try {
    const formData = new FormData()
    formData.append('profile_picture', file)

    const response = await api.patch(
  '/api/librarymanagement/members/change_profile_pic/',
  formData,
  {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }
)


    setProfilePicture(response.data.profile_picture || previewUrl)

    alert('Profile picture updated successfully.')
  } catch (error) {
  console.error('Failed to update profile picture:', error)
  console.log('Status:', error.response?.status)
  console.log('Response:', error.response?.data)

  setProfilePreview(null)

  alert(
    JSON.stringify(
      error.response?.data ||
        'No response from server'
    )
  )
}

  event.target.value = ''
}



  const handleUsernameUpdate = async (event) => {
  event.preventDefault()

  const usernameValue = newUsername.trim()

  if (!usernameValue) {
    return
  }

  try {
    const response = await api.post('/api/auth/change_username/', {
      new_name: usernameValue,
    })

    localStorage.setItem('username', response.data.username || usernameValue)

    setNewUsername('')
    window.location.reload()
  } catch (error) {
    console.error('Username update failed:', error)

    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      'Unable to update username. Please try again.'

    alert(message)
  }
}

  const handleEmailUpdate = async (event) => {
  event.preventDefault()

  const oldEmail = currentEmail.trim()
  const newEmailValue = newEmail.trim()

  if (!oldEmail || !newEmailValue || !confirmEmail || !emailPassword) {
    alert('Please fill in all fields.')
    return
  }

  if (newEmailValue !== confirmEmail.trim()) {
    alert('New email addresses do not match.')
    return
  }

  if (oldEmail === newEmailValue) {
    alert('New email must be different from your current email.')
    return
  }

  try {
    await api.post('/api/auth/change_email/', {
      old_email: oldEmail,
      password: emailPassword,
      new_email: newEmailValue,
    })

    localStorage.setItem('email', newEmailValue)

    setCurrentEmail(newEmailValue)
    setNewEmail('')
    setConfirmEmail('')
    setEmailPassword('')

    alert('Email changed successfully.')
  } catch (error) {
    console.error('Email update failed:', error)

    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      'Unable to change email. Please try again.'

    alert(message)
  }
}

  const handlePasswordUpdate = async (event) => {
  event.preventDefault()

  if (!currentPassword || !newPassword || !confirmPassword) {
    alert('Please fill in all password fields.')
    return
  }

  if (newPassword !== confirmPassword) {
    alert('New passwords do not match.')
    return
  }

  if (
    newPassword.length < 8 ||
    !/[^A-Za-z0-9]/.test(newPassword)
  ) {
    alert(
      'New password must be at least 8 characters and contain at least one special character.'
    )
    return
  }

  try {
    await api.post('/api/auth/change_password/', {
      old_pass: currentPassword,
      new_pass: newPassword,
    })

    alert('Password changed successfully.')

    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  } catch (error) {
    console.error('Password update failed:', error)

    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      'Unable to change password. Please try again.'

    alert(message)
  }
}
  const handleDeleteAccount = async () => {
  if (!deletePassword) {
    alert('Please enter your password.')
    return
  }

  try {
    await api.post('/api/auth/delete_acc/', {
      password: deletePassword,
    })

    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('username')
    localStorage.removeItem('email')

    window.location.href = '/login'
  } catch (error) {
    console.error('Account deletion failed:', error)

    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      'Unable to delete account. Please try again.'

    alert(message)
  }
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
          <UserProfile avatarClassName="dashboard-avatar" />

          <div className="settings-user-name">
            <span>Hello,</span>
            <strong>{username}</strong>
          </div>

          <span className="settings-user-arrow">
            
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
  className="dashboard-nav-item"
  onClick={() => navigate('/ebooks')}
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
  {profilePreview || profilePicture ? (
    <img
      src={profilePreview || profilePicture}
      alt="Profile"
    />
  ) : (
    username.charAt(0).toUpperCase()
  )}

  <button
    type="button"
    className="settings-photo-edit"
    onClick={() => profileInputRef.current?.click()}
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
  onClick={() => profileInputRef.current?.click()}
>
  
            <Pencil
              size={15}
              strokeWidth={1.8}
            />
            Change Photo
          </button>
          <input
  ref={profileInputRef}
  type="file"
  accept="image/jpeg,image/png,image/webp"
  onChange={handleProfilePictureChange}
  style={{ display: 'none' }}
/>

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
        <div className="settings-form-field">
  <label>Password</label>

  <div className="settings-input-container">
    <input
      type="password"
      placeholder="Enter your password"
      value={emailPassword}
      onChange={(event) =>
        setEmailPassword(event.target.value)
      }
    />

    <Lock size={17} />
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
  onClick={() => setShowDeleteConfirm(true)}
>
  <Trash2 size={17} />
  Delete Account
</button>
        </div>
      </motion.section>
      {showDeleteConfirm && (
  <div className="settings-delete-modal">
    <div className="settings-delete-modal-card">
      <div className="settings-delete-icon">
        <Trash2 size={24} />
      </div>

      <h3>Delete Account?</h3>

      <p>
        This action is permanent and cannot be undone.
        Enter your current password to confirm.
      </p>

      <div className="settings-password-wrapper">
        <input
          type={showDeletePassword ? 'text' : 'password'}
          placeholder="Enter your current password"
          value={deletePassword}
          onChange={(event) =>
            setDeletePassword(event.target.value)
          }
        />

        <button
          type="button"
          onClick={() =>
            setShowDeletePassword(!showDeletePassword)
          }
        >
          {showDeletePassword ? (
            <EyeOff size={17} />
          ) : (
            <Eye size={17} />
          )}
        </button>
      </div>

      <div className="settings-delete-modal-actions">
        <button
          type="button"
          className="settings-cancel-button"
          onClick={() => {
            setShowDeleteConfirm(false)
            setDeletePassword('')
          }}
        >
          Cancel
        </button>

        <button
          type="button"
          className="settings-confirm-delete-button"
          onClick={handleDeleteAccount}
        >
          Delete Account
        </button>
      </div>
    </div>
  </div>
)}
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