import { useEffect, useState } from 'react'
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
Search,
Bookmark,
RotateCcw,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './AllBooks.css'

function AllBooks() {
const navigate = useNavigate()

const [books, setBooks] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')

const [search, setSearch] = useState('')
const [category, setCategory] = useState('ALL')
const [language, setLanguage] = useState('ALL')

const username =
localStorage.getItem('username') || 'Ketan'

useEffect(() => {
const fetchBooks = async () => {
try {
setLoading(true)
setError('')


    const response = await api.get(
      '/api/librarymanagement/books/'
    )

    setBooks(response.data)
  } catch (error) {
    console.error('Failed to fetch books:', error)

    if (error.response?.status === 401) {
      setError(
        'Your session has expired. Please log in again.'
      )
    } else {
      setError(
        'Unable to load the books. Please try again.'
      )
    }
  } finally {
    setLoading(false)
  }
}

fetchBooks()


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
const searchValue = search.toLowerCase().trim()


const matchesSearch =
  !searchValue ||
  book.title?.toLowerCase().includes(searchValue) ||
  book.author?.toLowerCase().includes(searchValue) ||
  book.category?.toLowerCase().includes(searchValue) ||
  book.language?.toLowerCase().includes(searchValue) ||
  book.publisher?.toLowerCase().includes(searchValue) ||
  book.isbn?.toLowerCase().includes(searchValue)

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

const clearFilters = () => {
setSearch('')
setCategory('ALL')
setLanguage('ALL')
}

const hasActiveFilters =
search.trim() !== '' ||
category !== 'ALL' ||
language !== 'ALL'

return ( <main className="all-books-page">


  {/* SIDEBAR */}

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
        className="dashboard-nav-item active"
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


  {/* MAIN CONTENT */}

  <section className="all-books-content">

    {/* TOP BAR */}

    <header className="all-books-topbar">

      <div className="all-books-header-brand">

        <Leaf
          size={42}
          strokeWidth={1.4}
        />

        <div>

          <h1>
            BookVault
          </h1>

          <p>
            Your Library&nbsp;&nbsp; Your World
          </p>

        </div>

      </div>


      <div className="all-books-user-area">

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

            <span>
              Hello,
            </span>

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


    {/* VIDEO HERO */}

    <motion.section
      className="all-books-hero"
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.6,
        ease: 'easeOut',
      }}
    >

      <video
        className="all-books-hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source
          src="/videos/library-background.mp4"
          type="video/mp4"
        />
      </video>

      <div className="all-books-hero-overlay" />

      <div className="all-books-hero-content">

        <div className="all-books-hero-text">

          <p className="all-books-eyebrow">
            BOOKVAULT COLLECTION
          </p>

          <h2>
            All Books
          </h2>

          <span>
            Discover, explore and find your next great read.
          </span>

        </div>

      </div>

    </motion.section>


    {/* SEARCH + FILTERS */}

    <div className="all-books-filter-bar">

      <div className="all-books-search">

        <Search
          size={20}
          strokeWidth={1.7}
        />

        <input
          type="text"
          placeholder="Search by title, author, category, ISBN or publisher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>


      <div className="all-books-filter">

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >

          <option value="ALL">
            Category
          </option>

          {categories.map((item) => (

            <option
              key={item}
              value={item}
            >
              {item}
            </option>

          ))}

        </select>

      </div>


      <div className="all-books-filter">

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >

          <option value="ALL">
            Language
          </option>

          {languages.map((item) => (

            <option
              key={item}
              value={item}
            >
              {item}
            </option>

          ))}

        </select>

      </div>


      <button
        type="button"
        className={`all-books-clear ${
          hasActiveFilters
            ? 'has-filters'
            : ''
        }`}
        onClick={clearFilters}
      >

        <RotateCcw
          size={16}
          strokeWidth={1.8}
        />

        <span>
          Clear
        </span>

      </button>


      {/* BOOK COUNT */}

      <div className="all-books-count">

        <strong>
          {books.length}
        </strong>

        <span>
          {books.length === 1
            ? 'Book Available'
            : 'Books Available'}
        </span>

      </div>

    </div>


    {/* LOADING */}

    {loading && (

      <div className="all-books-loading">

        <div />
        <div />

      </div>

    )}


    {/* ERROR */}

    {!loading && error && (

      <div className="all-books-message">

        <Leaf
          size={38}
          strokeWidth={1.3}
        />

        <h3>
          Unable to load books
        </h3>

        <p>
          {error}
        </p>

      </div>

    )}


    {/* NO RESULTS */}

    {!loading &&
      !error &&
      filteredBooks.length === 0 && (

      <div className="all-books-message">

        <BookOpen
          size={38}
          strokeWidth={1.3}
        />

        <h3>
          No books found
        </h3>

        <p>
          Try changing your search or filters.
        </p>

        {hasActiveFilters && (

          <button
            type="button"
            className="all-books-message-button"
            onClick={clearFilters}
          >
            Clear Filters
          </button>

        )}

      </div>

    )}


    {/* BOOK GRID */}

    {!loading &&
      !error &&
      filteredBooks.length > 0 && (

      <motion.section
        className="books-grid"
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
          delay: 0.1,
        }}
      >

        {filteredBooks.map((book) => (

          <motion.article
            className="all-book-card"
            key={book.id}
            whileHover={{
              y: -4,
            }}
            transition={{
              duration: 0.2,
            }}
          >

            {/* COVER */}

            <div className="all-book-cover">

              {getBookImage(book.image) ? (

                <img
                  src={getBookImage(book.image)}
                  alt={book.title}
                />

              ) : (

                <div className="all-book-cover-placeholder">

                  <BookOpen
                    size={38}
                    strokeWidth={1.2}
                  />

                  <span>
                    {book.title}
                  </span>

                </div>

              )}

            </div>


            {/* BOOK DETAILS */}

            <div className="all-book-details">

              <div className="all-book-top-row">

                <span className="all-book-category">
                  {book.category || 'GENERAL'}
                </span>

                <button
                  type="button"
                  className="all-book-bookmark"
                  aria-label={`Bookmark ${book.title}`}
                >

                  <Bookmark
                    size={18}
                    strokeWidth={1.6}
                  />

                </button>

              </div>

              <h3>
                {book.title}
              </h3>

              <p className="all-book-author">
                {book.author}
              </p>

              <p className="all-book-description">

                {book.title === 'Pride and Prejudice'
                  ? 'A timeless classic exploring love, society and the journey of Elizabeth Bennet.'
                  : book.title === '1984'
                    ? 'A dystopian novel exploring surveillance, power and the dangers of totalitarianism.'
                    : `Explore ${book.title} through the BookVault collection.`}

              </p>


              <div className="all-book-meta">

                <div>

                  <BookOpen
                    size={16}
                    strokeWidth={1.7}
                  />

                  <span>
                    {book.language || '—'}
                  </span>

                </div>

                <div>

                  <span className="meta-label">
                    Publisher
                  </span>

                  <span>
                    {book.publisher || '—'}
                  </span>

                </div>

                <div>

                  <span className="meta-label">
                    ISBN
                  </span>

                  <span>
                    {book.isbn || '—'}
                  </span>

                </div>

              </div>


              <button
                type="button"
                className="all-book-button"
              >

                <span>
                  View Details
                </span>

                <ArrowRight
                  size={17}
                />

              </button>

            </div>

          </motion.article>

        ))}

      </motion.section>

    )}


    {/* RESULT COUNT */}

    {!loading &&
      !error &&
      filteredBooks.length > 0 && (

      <div className="all-books-footer">

        <span>
          Showing {filteredBooks.length} of {books.length} books
        </span>

      </div>

    )}

  </section>

</main>


)
}

export default AllBooks
