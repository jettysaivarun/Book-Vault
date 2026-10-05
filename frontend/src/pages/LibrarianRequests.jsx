import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home,
  BookOpen,
  Library,
  FileText,
  Settings,
  Leaf,
  Clock,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Users,
  BookMarked,
} from 'lucide-react'
import api from '../services/api'
import NotificationBell from '../components/NotificationBell'
import './LibrarianRequests.css'

const API_URL =
  import.meta.env.VITE_API_URL || '${API_URL}'

function LibrarianRequests() {
  const navigate = useNavigate()

  const [records, setRecords] = useState([])
  const [books, setBooks] = useState([])
  const [copies, setCopies] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const username =
    localStorage.getItem('username') || 'Librarian'

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError('')

      const [
        recordsResponse,
        booksResponse,
        copiesResponse,
      ] = await Promise.all([
        api.get('/api/librarymanagement/borrow/'),
        api.get('/api/librarymanagement/books/'),
        api.get('/api/librarymanagement/bookcopies/'),
      ])

      setRecords(recordsResponse.data)
      setBooks(booksResponse.data)
      setCopies(copiesResponse.data)
    } catch (error) {
      console.error(
        'Failed to load librarian requests:',
        error
      )

      if (error.response?.status === 401) {
        setError(
          'Your session has expired. Please log in again.'
        )
      } else if (error.response?.status === 403) {
        setError(
          'You do not have librarian access to this page.'
        )
      } else {
        setError(
          'Unable to load library requests. Please try again.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const getBookForRecord = (record) => {
    const copy = copies.find(
      (item) =>
        Number(item.id) === Number(record.book_copy)
    )

    if (!copy) {
      return null
    }

    return books.find(
      (book) => Number(book.id) === Number(copy.book)
    )
  }

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
      return `${API_URL}${image}`
    }

    return `${API_URL}/media/${image}`
  }

  const pendingBorrowRequests = records.filter(
    (record) => record.status === 'BORROW PENDING'
  )

  const activeLoans = records.filter(
    (record) => record.status === 'ACTIVE'
  )

  const pendingReturnRequests = records.filter(
    (record) => record.status === 'RETURN PENDING'
  )

  const handleAcceptBorrow = async (recordId) => {
    try {
      setProcessingId(recordId)
      setError('')
      setSuccess('')

      const response = await api.post(
        '/api/librarymanagement/borrow/borrow_accept_request/',
        {
          copy_id: recordId,
        }
      )

      setRecords((current) =>
        current.map((record) =>
          record.id === recordId
            ? response.data
            : record
        )
      )

      setSuccess(
        'Borrow request accepted successfully.'
      )
    } catch (error) {
      console.error(
        'Failed to accept borrow request:',
        error
      )

      if (error.response?.status === 403) {
        setError(
          'Only a librarian can approve borrow requests.'
        )
      } else if (error.response?.status === 400) {
        setError(
          error.response.data?.error ||
          'This borrow request is no longer available.'
        )
      } else if (error.response?.status === 401) {
        setError(
          'Your session has expired. Please log in again.'
        )
      } else {
        setError(
          'Unable to accept the borrow request.'
        )
      }
    } finally {
      setProcessingId(null)
    }
  }

  const handleAcceptReturn = async (recordId) => {
    try {
      setProcessingId(recordId)
      setError('')
      setSuccess('')

      const response = await api.post(
        '/api/librarymanagement/borrow/return_accept_request/',
        {
          copy_id: recordId,
        }
      )

      setRecords((current) =>
        current.map((record) =>
          record.id === recordId
            ? response.data
            : record
        )
      )

      setSuccess(
        'Return request accepted successfully.'
      )
    } catch (error) {
      console.error(
        'Failed to accept return request:',
        error
      )

      if (error.response?.status === 403) {
        setError(
          'Only a librarian can approve return requests.'
        )
      } else if (error.response?.status === 400) {
        setError(
          error.response.data?.error ||
          'This return request is no longer available.'
        )
      } else if (error.response?.status === 401) {
        setError(
          'Your session has expired. Please log in again.'
        )
      } else {
        setError(
          'Unable to accept the return request.'
        )
      }
    } finally {
      setProcessingId(null)
    }
  }

  const formatDate = (date) => {
    if (!date) {
      return '—'
    }

    return new Date(date).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    )
  }

  const getDaysLate = (record) => {
    if (!record.exp_return) {
      return 0
    }

    const today = new Date()
    const expected = new Date(record.exp_return)

    today.setHours(0, 0, 0, 0)
    expected.setHours(0, 0, 0, 0)

    const difference =
      Math.floor(
        (today - expected) /
        (1000 * 60 * 60 * 24)
      )

    return Math.max(0, difference)
  }

  const renderBookCover = (book) => {
    if (getBookImage(book?.image)) {
      return (
        <img
          src={getBookImage(book.image)}
          alt={book.title}
        />
      )
    }

    return (
      <div className="librarian-book-placeholder">
        <BookOpen
          size={30}
          strokeWidth={1.3}
        />
      </div>
    )
  }

  const renderBorrowRequest = (record) => {
    const book = getBookForRecord(record)

    if (!book) {
      return null
    }

    const processing =
      processingId === record.id

    return (
      <article
        className="librarian-request-card"
        key={record.id}
      >
        <div className="librarian-book-cover">
          {renderBookCover(book)}
        </div>

        <div className="librarian-request-details">
          <div className="librarian-request-top">
            <div>
              <span className="librarian-category">
                {book.category || 'GENERAL'}
              </span>

              <h3>{book.title}</h3>

              <p>{book.author}</p>
            </div>

            <div className="librarian-status pending">
              <Clock size={15} />
              Borrow Pending
            </div>
          </div>

          <div className="librarian-request-info">
            <div>
              <span>Member</span>
              <strong>
                #{record.member}
              </strong>
            </div>

            <div>
              <span>Requested</span>
              <strong>
                {formatDate(record.date)}
              </strong>
            </div>

            <div>
              <span>Return Date</span>
              <strong>
                {formatDate(record.exp_return)}
              </strong>
            </div>

            <div>
              <span>Borrow Fee</span>
              <strong>
                ₹{record.borrow_fee || 0}
              </strong>
            </div>
          </div>

          <div className="librarian-request-footer">
            <span>
              Request ID #{record.id}
            </span>

            <button
              type="button"
              className="librarian-accept-button"
              disabled={processing}
              onClick={() =>
                handleAcceptBorrow(record.id)
              }
            >
              {processing ? (
                'Processing...'
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Accept Request
                </>
              )}
            </button>
          </div>
        </div>
      </article>
    )
  }

  const renderReturnRequest = (record) => {
    const book = getBookForRecord(record)

    if (!book) {
      return null
    }

    const processing =
      processingId === record.id

    const daysLate = getDaysLate(record)
    const estimatedFine = daysLate * 10

    return (
      <article
        className="librarian-request-card return-card"
        key={record.id}
      >
        <div className="librarian-book-cover">
          {renderBookCover(book)}
        </div>

        <div className="librarian-request-details">
          <div className="librarian-request-top">
            <div>
              <span className="librarian-category">
                {book.category || 'GENERAL'}
              </span>

              <h3>{book.title}</h3>

              <p>{book.author}</p>
            </div>

            <div className="librarian-status return">
              <RotateCcw size={15} />
              Return Pending
            </div>
          </div>

          <div className="librarian-request-info">
            <div>
              <span>Member</span>
              <strong>
                #{record.member}
              </strong>
            </div>

            <div>
              <span>Expected Return</span>
              <strong>
                {formatDate(record.exp_return)}
              </strong>
            </div>

            <div>
              <span>Late Days</span>
              <strong>
                {daysLate}
              </strong>
            </div>

            <div>
              <span>Current Fine</span>
              <strong>
                ₹{estimatedFine}
              </strong>
            </div>
          </div>

          <div className="librarian-request-footer">
            <span>
              Request ID #{record.id}
            </span>

            <button
              type="button"
              className="librarian-return-button"
              disabled={processing}
              onClick={() =>
                handleAcceptReturn(record.id)
              }
            >
              {processing ? (
                'Processing...'
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Accept Return
                </>
              )}
            </button>
          </div>
        </div>
      </article>
    )
  }

  return (
    <main className="librarian-page">

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
            className="dashboard-nav-item"
            onClick={() =>
              navigate('/ebooks')
            }
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

      <section className="librarian-content">

        <header className="librarian-topbar">

          <div className="librarian-brand">
            <Leaf
              size={38}
              strokeWidth={1.4}
            />

            <div>
              <h1>BookVault</h1>
              <p>LIBRARY MANAGEMENT</p>
            </div>
          </div>

          <div className="librarian-user-area">

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

        <section className="librarian-heading">

          <div>
            <p>LIBRARY ADMINISTRATION</p>

            <h2>
              Requests & Loans
            </h2>

            <span>
              Manage borrow and return requests.
            </span>
          </div>

          <div className="librarian-heading-icon">
            <BookMarked
              size={30}
              strokeWidth={1.3}
            />
          </div>

        </section>

        {error && (
          <div className="librarian-alert error">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="librarian-alert success">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        <section className="librarian-stats">

          <div className="librarian-stat-card">
            <div className="librarian-stat-icon pending">
              <Clock size={21} />
            </div>

            <div>
              <strong>
                {pendingBorrowRequests.length}
              </strong>

              <span>
                Pending Borrows
              </span>
            </div>
          </div>

          <div className="librarian-stat-card">
            <div className="librarian-stat-icon active">
              <BookOpen size={21} />
            </div>

            <div>
              <strong>
                {activeLoans.length}
              </strong>

              <span>
                Active Loans
              </span>
            </div>
          </div>

          <div className="librarian-stat-card">
            <div className="librarian-stat-icon return">
              <RotateCcw size={21} />
            </div>

            <div>
              <strong>
                {pendingReturnRequests.length}
              </strong>

              <span>
                Pending Returns
              </span>
            </div>
          </div>

          <div className="librarian-stat-card">
            <div className="librarian-stat-icon total">
              <Users size={21} />
            </div>

            <div>
              <strong>
                {records.length}
              </strong>

              <span>
                Total Records
              </span>
            </div>
          </div>

        </section>

        {loading ? (
          <section className="librarian-loading-grid">
            <div />
            <div />
          </section>
        ) : !error ? (
          <>
            <section className="librarian-section">

              <div className="librarian-section-heading">
                <div>
                  <p>AWAITING APPROVAL</p>

                  <h3>
                    Borrow Requests
                  </h3>
                </div>

                <span>
                  {pendingBorrowRequests.length}
                </span>
              </div>

              {pendingBorrowRequests.length === 0 ? (
                <div className="librarian-empty">
                  <CheckCircle2 size={36} />

                  <h4>
                    No pending borrow requests
                  </h4>

                  <p>
                    New borrow requests will appear here.
                  </p>
                </div>
              ) : (
                <div className="librarian-request-list">
                  {pendingBorrowRequests.map(
                    renderBorrowRequest
                  )}
                </div>
              )}

            </section>

            <section className="librarian-section">

              <div className="librarian-section-heading">
                <div>
                  <p>AWAITING RETURN</p>

                  <h3>
                    Return Requests
                  </h3>
                </div>

                <span>
                  {pendingReturnRequests.length}
                </span>
              </div>

              {pendingReturnRequests.length === 0 ? (
                <div className="librarian-empty">
                  <CheckCircle2 size={36} />

                  <h4>
                    No pending return requests
                  </h4>

                  <p>
                    Returned-book requests will appear here.
                  </p>
                </div>
              ) : (
                <div className="librarian-request-list">
                  {pendingReturnRequests.map(
                    renderReturnRequest
                  )}
                </div>
              )}

            </section>
          </>
        ) : null}

      </section>

    </main>
  )
}

export default LibrarianRequests