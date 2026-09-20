
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home,
  BookOpen,
  Library,
  FileText,
  Settings,
  Bell,
  Leaf,
  ArrowRight,
} from 'lucide-react'
import api from '../services/api'
import './Dashboard.css'

function Dashboard() {
    const navigate = useNavigate()
  const [bookOfTheDay, setBookOfTheDay] = useState(null)
  const [loadingBook, setLoadingBook] = useState(true)
  const [bookError, setBookError] = useState('')

  const username =
    localStorage.getItem('username') || 'Ketan'

  useEffect(() => {
    const fetchBookOfTheDay = async () => {
      try {
        setLoadingBook(true)
        setBookError('')

        const response = await api.get(
          '/api/librarymanagement/books/get_book_of_the_day/'
        )

        setBookOfTheDay(response.data)
      } catch (error) {
        console.error(
          'Failed to fetch Book of the Day:',
          error
        )

        if (error.response?.status === 401) {
          setBookError(
            'Your session has expired. Please log in again.'
          )
        } else if (error.response?.status === 404) {
          setBookError(
            'No Book of the Day has been selected yet.'
          )
        } else {
          setBookError(
            'Unable to load the Book of the Day.'
          )
        }
      } finally {
        setLoadingBook(false)
      }
    }

    fetchBookOfTheDay()
  }, [])

 const getBookImage = (image) => {
  if (!image) {
    return null
  }

  const markdownMatch = image.match(
    /\]\((https?:\/\/[^)]+)\)/
  )

  if (markdownMatch) {
    return markdownMatch[1]
  }

  if (
    image.startsWith('http://') ||
    image.startsWith('https://')
  ) {
    return image
  }

  if (image.startsWith('/')) {
    return `http://127.0.0.1:8000${image}`
  }

  return `http://127.0.0.1:8000/media/${image}`
}

  return (
    <main className="dashboard-page">

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside className="dashboard-sidebar">

        <div className="dashboard-logo">

          <Leaf
            size={43}
            strokeWidth={1.4}
          />

          <h1>BookVault</h1>

          <p>
            Your Library&nbsp;&nbsp; Your World
          </p>

        </div>


        <nav className="dashboard-nav">

          <button
            type="button"
            className="dashboard-nav-item active"
          >
            <Home
              size={21}
              strokeWidth={1.8}
            />

            <span>Home</span>
          </button>


          <button
            type="button"
            className="dashboard-nav-item"
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
            className="dashboard-nav-item"
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
          >
            <FileText
              size={21}
              strokeWidth={1.8}
            />

            <span>E Books</span>
          </button>


          <button
            type="button"
            className="dashboard-nav-item"
          >
            <Settings
              size={21}
              strokeWidth={1.8}
            />

            <span>Settings</span>
          </button>

        </nav>


        <div className="dashboard-sidebar-quote">

          <p>
            “A reader lives
            <br />
            a thousand lives.”
          </p>

          <span />

        </div>

      </aside>


      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <section className="dashboard-content">


        {/* =========================================
            TOP BAR
        ========================================= */}

        <header className="dashboard-topbar">

          


          <div className="dashboard-user-area">

            <button
              type="button"
              className="dashboard-notification"
            >

              <Bell
                size={22}
                strokeWidth={1.7}
              />

              <span />

            </button>


            <div className="dashboard-user">

              <div className="dashboard-avatar">
                {username.charAt(0).toUpperCase()}
              </div>

              <div className="dashboard-user-name">

                <span>Hello,</span>

                <strong>
                  {username}
                </strong>

              </div>

              <span className="dashboard-user-arrow">
                ˅
              </span>

            </div>

          </div>

        </header>


        {/* =========================================
            WELCOME HERO
        ========================================= */}

        <motion.section
          className="dashboard-welcome"
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            ease: 'easeOut',
          }}
        >

          <div className="dashboard-welcome-content">

            <p>
              Welcome back,
            </p>

            <h2>

              {username}

              <Leaf
                size={34}
                strokeWidth={1.4}
              />

            </h2>

            <div className="dashboard-welcome-line" />

            <span>
              A new chapter is always waiting for you.
            </span>

          </div>


          <div className="dashboard-welcome-quote">

            <p>
              “Good books
              <br />
              better humans.”
            </p>

            <div className="dashboard-welcome-books">

              <span>Read</span>
              <span>Learn</span>
              <span>Grow</span>

            </div>

          </div>

        </motion.section>


        {/* =========================================
            BOOK OF THE DAY
        ========================================= */}

        <motion.section
          className="book-day-section"
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            delay: 0.15,
            ease: 'easeOut',
          }}
        >

          <div className="section-heading">

            <div>

              <h2>
                Book of the Day
              </h2>

              <p>
                A new story to inspire you today.
              </p>

            </div>

          </div>


          {/* LOADING */}

          {loadingBook && (

            <div className="book-day-card book-day-loading">

              <div className="book-loading-cover" />

              <div className="book-loading-content">

                <span />
                <span />
                <span />
                <span />

              </div>

            </div>

          )}


          {/* ERROR */}

          {!loadingBook && bookError && (

            <div className="book-day-card book-day-empty">

              <Leaf
                size={40}
                strokeWidth={1.3}
              />

              <h3>
                Book of the Day
              </h3>

              <p>
                {bookError}
              </p>

            </div>

          )}


          {/* BOOK */}

          {!loadingBook &&
            !bookError &&
            bookOfTheDay && (

            <div className="book-day-card">

              {/* COVER */}

              <div className="book-cover-container">

                {getBookImage(bookOfTheDay.image) ? (

                  <img
                    src={getBookImage(
                      bookOfTheDay.image
                    )}
                    alt={bookOfTheDay.title}
                    className="book-cover-image"
                  />

                ) : (

                  <div className="book-cover-placeholder">

                    <BookOpen
                      size={48}
                      strokeWidth={1.2}
                    />

                    <span>
                      {bookOfTheDay.title}
                    </span>

                  </div>

                )}

              </div>


              {/* DETAILS */}

              <div className="book-day-details">

                <span className="book-day-label">
                  TODAY'S FEATURED BOOK
                </span>

                <h3>
                  {bookOfTheDay.title}
                </h3>

                <p className="book-author">
                  {bookOfTheDay.author}
                </p>


                <div className="book-information">

                  <div>

                    <span>
                      Category
                    </span>

                    <strong>
                      {bookOfTheDay.category || '—'}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Language
                    </span>

                    <strong>
                      {bookOfTheDay.language || '—'}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Publisher
                    </span>

                    <strong>
                      {bookOfTheDay.publisher || '—'}
                    </strong>

                  </div>

                </div>


                <p className="book-description">

                  Discover{' '}
                  <strong>
                    {bookOfTheDay.title}
                  </strong>
                  {' '}by{' '}
                  <strong>
                    {bookOfTheDay.author}
                  </strong>
                  {' '}and explore it through the
                  BookVault collection.

                </p>


                <button
                  type="button"
                  className="book-details-button"
                >

                  <span>
                    View Details
                  </span>

                  <ArrowRight
                    size={18}
                  />

                </button>

              </div>


              {/* QUOTE */}

              <div className="book-day-quote">

                <Leaf
                  size={34}
                  strokeWidth={1.2}
                />

                <blockquote>

                  “A book is a
                  <br />
                  journey waiting
                  <br />
                  to begin.”

                </blockquote>

                <span>
                  — BookVault
                </span>

              </div>

            </div>

          )}

        </motion.section>


        {/* =========================================
            ABOUT BOOKVAULT
        ========================================= */}

        <motion.section
          className="dashboard-about"
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            delay: 0.25,
            ease: 'easeOut',
          }}
        >

          <div className="about-intro">

            <div className="about-eyebrow">

              <span />

              MORE THAN A LIBRARY

            </div>


            <h2>

              Your Space to Read,
              <br />
              Learn and Grow

            </h2>


            <p>

              BookVault helps you organize your
              books, explore new reads, access
              eBooks and keep track of your reading
              journey — all in one place.

            </p>

          </div>


          <div className="about-features">


            <div className="about-feature">

              <div className="about-feature-icon">

                <BookOpen
                  size={25}
                  strokeWidth={1.7}
                />

              </div>

              <h3>
                Explore
              </h3>

              <p>
                Discover a wide collection
                of books across genres.
              </p>

            </div>


            <div className="about-feature">

              <div className="about-feature-icon">

                <Leaf
                  size={25}
                  strokeWidth={1.7}
                />

              </div>

              <h3>
                Organize
              </h3>

              <p>
                Keep track of what you read,
                are reading and want to read.
              </p>

            </div>


            <div className="about-feature">

              <div className="about-feature-icon">

                <Library
                  size={25}
                  strokeWidth={1.7}
                />

              </div>

              <h3>
                Grow
              </h3>

              <p>
                Build better reading habits
                and become a better you.
              </p>

            </div>


          </div>

        </motion.section>

      </section>

    </main>
  )
}

export default Dashboard

