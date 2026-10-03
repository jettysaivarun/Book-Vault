import { useEffect, useState } from 'react'
import {
  Home,
  BookOpen,
  Library,
  FileText,
  Settings,
  Leaf,
  Search,
  BookMarked,
  ExternalLink,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../services/api'
import NotificationBell from '../components/NotificationBell'
import './Ebooks.css'

function EBooks() {
  const navigate = useNavigate()

  const username =
    localStorage.getItem('username') || 'Ketan'

  const [books, setBooks] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('ALL')
  const [language, setLanguage] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEBooks = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get(
          '/api/librarymanagement/books/'
        )

        const ebookBooks = response.data.filter(
          (book) => book.ebook
        )

        setBooks(ebookBooks)
      } catch (error) {
        console.error(
          'Failed to load e-books:',
          error
        )

        if (error.response?.status === 401) {
          setError(
            'Your session has expired. Please log in again.'
          )
        } else {
          setError(
            'Unable to load e-books. Please try again.'
          )
        }
      } finally {
        setLoading(false)
      }
    }

    fetchEBooks()
  }, [])

  const categories = [
    ...new Set(
      books
        .map((book) => book.category)
        .filter(Boolean)
    ),
  ]

  const languages = [
    ...new Set(
      books
        .map((book) => book.language)
        .filter(Boolean)
    ),
  ]

  const filteredBooks = books.filter((book) => {
    const searchValue =
      search.toLowerCase().trim()

    const matchesSearch =
      !searchValue ||
      book.title
        ?.toLowerCase()
        .includes(searchValue) ||
      book.author
        ?.toLowerCase()
        .includes(searchValue) ||
      book.category
        ?.toLowerCase()
        .includes(searchValue) ||
      book.language
        ?.toLowerCase()
        .includes(searchValue)

    const matchesCategory =
      category === 'ALL' ||
      book.category === category

    const matchesLanguage =
      language === 'ALL' ||
      book.language === language

    return (
      matchesSearch &&
      matchesCategory &&
      matchesLanguage
    )
  })

  const getImageUrl = (image) => {
    if (!image) {
      return null
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

  const getEBookUrl = (ebook) => {
    if (!ebook) {
      return null
    }

    if (
      ebook.startsWith('http://') ||
      ebook.startsWith('https://')
    ) {
      return ebook
    }

    if (ebook.startsWith('/')) {
      return `http://127.0.0.1:8000${ebook}`
    }

    return `http://127.0.0.1:8000/media/${ebook}`
  }

  const clearFilters = () => {
    setSearch('')
    setCategory('ALL')
    setLanguage('ALL')
  }

  const hasActiveFilters =
    search.trim() !== '' ||
    category !== 'ALL' ||
    language !== 'ALL'

  return (
    <main className="ebooks-page">

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
            className="dashboard-nav-item"
            onClick={() =>
              navigate('/dashboard')
            }
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
            onClick={() =>
              navigate('/all-books')
            }
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
            onClick={() =>
              navigate('/my-books')
            }
          >
            <Library
              size={21}
              strokeWidth={1.8}
            />

            <span>My Books</span>
          </button>

          <button
            type="button"
            className="dashboard-nav-item active"
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
            onClick={() =>
              navigate('/settings')
            }
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

      <section className="ebooks-content">

        <header className="ebooks-topbar">

          <div className="ebooks-header-brand">

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

          <div className="ebooks-user-area">

            <NotificationBell />

            <div className="dashboard-user">

              <div className="dashboard-avatar">
                {username
                  .charAt(0)
                  .toUpperCase()}
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

        <div className="ebooks-main">

          <motion.div
            className="ebooks-heading"
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
          >

            <div>

              <span>
                DIGITAL LIBRARY
              </span>

              <h2>E Books</h2>

              <p>
                Your digital reading collection
              </p>

            </div>

            <div className="ebooks-count">

              <BookMarked
                size={22}
                strokeWidth={1.7}
              />

              <div>
                <strong>
                  {books.length}
                </strong>

                <span>
                  Digital Books
                </span>
              </div>

            </div>

          </motion.div>

          <div className="ebooks-filters">

            <div className="ebooks-search">

              <Search
                size={19}
                strokeWidth={1.8}
              />

              <input
                type="text"
                placeholder="Search e-books..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

            </div>

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
            >
              <option value="ALL">
                All Categories
              </option>

              {categories.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item.replace(
                      /_/g,
                      ' '
                    )}
                  </option>
                )
              )}

            </select>

            <select
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value)
              }
            >
              <option value="ALL">
                All Languages
              </option>

              {languages.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}

            </select>

            {hasActiveFilters && (
              <button
                type="button"
                className="ebooks-clear"
                onClick={clearFilters}
              >
                Clear
              </button>
            )}

          </div>

          {loading && (
            <div className="ebooks-message">
              <div className="ebooks-loader" />
              <p>
                Loading your digital library...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="ebooks-message ebooks-error">
              <p>{error}</p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
              >
                Try Again
              </button>
            </div>
          )}

          {!loading &&
            !error &&
            filteredBooks.length === 0 && (
              <div className="ebooks-message">

                <FileText
                  size={42}
                  strokeWidth={1.3}
                />

                <h3>
                  No e-books found
                </h3>

                <p>
                  {books.length === 0
                    ? 'No digital books have been added to the library yet.'
                    : 'Try changing your search or filters.'}
                </p>

              </div>
            )}

          {!loading &&
            !error &&
            filteredBooks.length > 0 && (
              <motion.div
                className="ebooks-grid"
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.1,
                }}
              >

                {filteredBooks.map(
                  (book) => {

                    const imageUrl =
                      getImageUrl(
                        book.image
                      )

                    const ebookUrl =
                      getEBookUrl(
                        book.ebook
                      )

                    return (
                      <article
                        className="ebook-card"
                        key={book.id}
                      >

                        <div className="ebook-cover">

                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={
                                book.title
                              }
                            />
                          ) : (
                            <div className="ebook-cover-placeholder">

                              <BookOpen
                                size={48}
                                strokeWidth={1.2}
                              />

                            </div>
                          )}

                          <span className="ebook-format">
                            E BOOK
                          </span>

                        </div>

                        <div className="ebook-info">

                          <span className="ebook-category">
                            {book.category?.replace(
                              /_/g,
                              ' '
                            )}
                          </span>

                          <h3>
                            {book.title}
                          </h3>

                          <p className="ebook-author">
                            {book.author}
                          </p>

                          <p className="ebook-language">
                            {book.language}
                          </p>

                          <div className="ebook-actions">

                            <button
                              type="button"
                              onClick={() =>
                                window.open(
                                  ebookUrl,
                                  '_blank',
                                  'noopener,noreferrer'
                                )
                              }
                            >
                              Read E-Book

                              <ExternalLink
                                size={16}
                                strokeWidth={1.8}
                              />

                            </button>

                          </div>

                        </div>

                      </article>
                    )
                  }
                )}

              </motion.div>
            )}

        </div>

      </section>

    </main>
  )
}

export default EBooks