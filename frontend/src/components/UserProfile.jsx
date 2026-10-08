import { useEffect, useState } from 'react'
import api from '../services/api'

function UserProfile({ avatarClassName = 'dashboard-avatar' }) {
  const username =
    localStorage.getItem('username') || 'Ketan'

  const [profilePicture, setProfilePicture] = useState(null)

  useEffect(() => {
    const loadProfilePicture = async () => {
      try {
        const response = await api.get(
          '/api/librarymanagement/members/current_member/'
        )

        const picture = response.data.profile_picture

        if (picture) {
          const profileUrl = picture.startsWith('http')
            ? picture
            : `https://res.cloudinary.com/y4b8yqds/${picture}`

          setProfilePicture(profileUrl)
        }
      } catch (error) {
        console.error(
          'Failed to load profile picture:',
          error
        )
      }
    }

    loadProfilePicture()
  }, [])

  return (
    <div className={avatarClassName}>
      {profilePicture ? (
        <img
          src={profilePicture}
          alt="Profile"
        />
      ) : (
        username.charAt(0).toUpperCase()
      )}
    </div>
  )
}

export default UserProfile