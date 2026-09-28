import { useEffect, useRef, useState } from 'react'
import { Bell, CheckCheck, Clock } from 'lucide-react'
import api from '../services/api'
import './NotificationBell.css'

function NotificationBell() {
const [notifications, setNotifications] = useState([])
const [unreadCount, setUnreadCount] = useState(0)
const [isOpen, setIsOpen] = useState(false)
const [loading, setLoading] = useState(false)

const notificationRef = useRef(null)

const fetchUnreadCount = async () => {
try {
const response = await api.get(
'/api/notifications/unread_count/'
)


  setUnreadCount(response.data.unread_count || 0)
} catch (error) {
  console.error(
    'Failed to fetch unread notification count:',
    error
  )
}


}

const fetchNotifications = async () => {
try {
setLoading(true)


  const response = await api.get(
    '/api/notifications/notification_list/'
  )

  setNotifications(response.data)
} catch (error) {
  console.error(
    'Failed to fetch notifications:',
    error
  )
} finally {
  setLoading(false)
}


}

const handleToggle = () => {
const nextState = !isOpen


setIsOpen(nextState)

if (nextState) {
  fetchNotifications()
}


}

const handleMarkAsRead = async (notification) => {
if (notification.is_read) {
return
}


try {
  await api.patch(
    `/api/notifications/${notification.id}/read/`
  )

  setNotifications((current) =>
    current.map((item) =>
      item.id === notification.id
        ? { ...item, is_read: true }
        : item
    )
  )

  setUnreadCount((current) =>
    Math.max(current - 1, 0)
  )
} catch (error) {
  console.error(
    'Failed to mark notification as read:',
    error
  )
}


}

const handleMarkAllAsRead = async () => {
if (unreadCount === 0) {
return
}


try {
  await api.patch(
    '/api/notifications/markall/'
  )

  setNotifications((current) =>
    current.map((item) => ({
      ...item,
      is_read: true,
    }))
  )

  setUnreadCount(0)
} catch (error) {
  console.error(
    'Failed to mark all notifications as read:',
    error
  )
}


}

useEffect(() => {
fetchUnreadCount()


const interval = setInterval(() => {
  fetchUnreadCount()
}, 30000)

return () => clearInterval(interval)


}, [])

useEffect(() => {
const handleOutsideClick = (event) => {
if (
notificationRef.current &&
!notificationRef.current.contains(event.target)
) {
setIsOpen(false)
}
}


document.addEventListener(
  'mousedown',
  handleOutsideClick
)

return () => {
  document.removeEventListener(
    'mousedown',
    handleOutsideClick
  )
}


}, [])

return ( <div
   className="notification-wrapper"
   ref={notificationRef}
 > <button
     type="button"
     className="notification-bell"
     onClick={handleToggle}
     aria-label="Notifications"
   > <Bell
       size={22}
       strokeWidth={1.7}
     />


    {unreadCount > 0 && (
      <span className="notification-badge">
        {unreadCount > 99
          ? '99+'
          : unreadCount}
      </span>
    )}
  </button>

  {isOpen && (
    <div className="notification-panel">
      <div className="notification-header">
        <div>
          <h3>Notifications</h3>

          <p>
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
              : 'You are all caught up'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className="notification-mark-all"
            onClick={handleMarkAllAsRead}
          >
            <CheckCheck size={15} />
            <span>Mark all</span>
          </button>
        )}
      </div>

      <div className="notification-list">
        {loading ? (
          <div className="notification-empty">
            <Clock size={25} />
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notification-empty">
            <Bell size={25} />
            <h4>No notifications</h4>
            <p>
              New updates will appear here.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              type="button"
              key={notification.id}
              className={`notification-item ${
                notification.is_read
                  ? 'read'
                  : 'unread'
              }`}
              onClick={() =>
                handleMarkAsRead(notification)
              }
            >
              <div className="notification-item-indicator" />

              <div className="notification-item-content">
                <div className="notification-item-top">
                  <h4>
                    {notification.title}
                  </h4>

                  {!notification.is_read && (
                    <span className="notification-new">
                      NEW
                    </span>
                  )}
                </div>

                <p>
                  {notification.message}
                </p>

                <span className="notification-time">
                  {new Date(
                    notification.created_at
                  ).toLocaleString()}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )}
</div>


)
}

export default NotificationBell
