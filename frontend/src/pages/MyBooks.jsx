import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Home,
  BookOpen,
  Library,
  FileText,
  Settings,
  Leaf,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import NotificationBell from '../components/NotificationBell'
import './MyBooks.css'

const API_URL = import.meta.env.VITE_API_URL || '${API_URL}'

function MyBooks() {
  const navigate = useNavigate()

  const [records, setRecords] = useState([])
  const [books, setBooks] = useState([])
  const [copies, setCopies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [bill, setBill] = useState(null)
  const [billLoading, setBillLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  const username =
    localStorage.getItem('username') || 'Ketan'

  useEffect(() => {
    const fetchMyBooks = async () => {
      try {
        setLoading(true)
        setError('')

        const [recordsResponse, booksResponse, copiesResponse] =
          await Promise.all([
            api.get('/api/librarymanagement/borrow/'),
            api.get('/api/librarymanagement/books/'),
            api.get('/api/librarymanagement/bookcopies/'),
          ])

        setRecords(recordsResponse.data)
        setBooks(booksResponse.data)
        setCopies(copiesResponse.data)
      } catch (error) {
        console.error('Failed to load my books:', error)

        if (error.response?.status === 401) {
          setError(
            'Your session has expired. Please log in again.'
          )
        } else {
          setError(
            'Unable to load your books. Please try again.'
          )
        }
      } finally {
        setLoading(false)
      }
    }

    fetchMyBooks()
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
      return `${API_URL}${image}`
    }

    return `${API_URL}/media/${image}`
  }

  const getBookForRecord = (record) => {
    const copy = copies.find(
      (item) => Number(item.id) === Number(record.book_copy)
    )

    if (!copy) {
      return null
    }

    return books.find(
      (book) => Number(book.id) === Number(copy.book)
    )
  }

  const myRecords = records.filter(
    (record) => record.member
  )

  const getStatusClass = (status) => {
    if (status === 'ACTIVE') {
      return 'active'
    }

    if (status === 'BORROW PENDING') {
      return 'pending'
    }

    if (status === 'RETURN PENDING') {
      return 'return-pending'
    }

    if (status === 'RETURNED') {
      return 'returned'
    }

    if (
      status === 'LOST' ||
      status === 'DAMAGED'
    ) {
      return 'problem'
    }

    return 'pending'
  }

  const getStatusLabel = (status) => {
    if (status === 'BORROW PENDING') {
      return 'Borrow Request Pending'
    }

    if (status === 'RETURN PENDING') {
      return 'Return Request Pending'
    }

    if (status === 'ACTIVE') {
      return 'Currently Borrowed'
    }

    if (status === 'RETURNED') {
      return 'Returned'
    }

    if (status === 'LOST') {
      return 'Lost'
    }

    if (status === 'DAMAGED') {
      return 'Damaged'
    }

    return status || 'Unknown'
  }

  const getStatusIcon = (status) => {
    if (status === 'ACTIVE') {
      return <CheckCircle2 size={17} />
    }

    if (
      status === 'LOST' ||
      status === 'DAMAGED'
    ) {
      return <AlertTriangle size={17} />
    }

    if (status === 'RETURNED') {
      return <CheckCircle2 size={17} />
    }

    return <Clock size={17} />
  }

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }

      const script = document.createElement('script')

      script.src = 'https://checkout.razorpay.com/v1/checkout.js'

      script.onload = () => {
        resolve(true)
      }

      script.onerror = () => {
        resolve(false)
      }

      document.body.appendChild(script)
    })
  }

  const handleReturn = async (recordId) => {
    console.log('RETURN CLICKED', recordId)
    try {
      setBillLoading(true)
      setPaymentError('')
      setBill(null)

      const response = await api.post(
        '/api/payments/create-order/',
        {
          borrow_record_id: recordId,
        }
      )

      setBill(response.data)
    } catch (error) {
      console.error('Failed to load return bill:', error)

      if (error.response?.status === 401) {
        setPaymentError(
          'Your session has expired. Please log in again.'
        )
      } else {
        setPaymentError(
          error.response?.data?.error ||
          'Unable to calculate the return bill.'
        )
      }
    } finally {
      setBillLoading(false)
    }
  }

  const closeBill = () => {
    if (paymentLoading) {
      return
    }

    setBill(null)
    setPaymentError('')
  }

  const handlePayment = async () => {
    if (!bill) {
      return
    }

    try {
      setPaymentLoading(true)
      setPaymentError('')

      const razorpayLoaded = await loadRazorpay()

      if (!razorpayLoaded) {
        setPaymentError(
          'Unable to load the payment gateway. Please try again.'
        )
        setPaymentLoading(false)
        return
      }

      const options = {
        key: bill.key_id,
        amount: bill.amount,
        currency: bill.currency,
        name: 'BookVault',
        description: `Return payment for ${bill.book_title}`,
        order_id: bill.order_id,
        handler: async function (response) {
          try {
            const verificationResponse = await api.post(
              '/api/payments/verify/',
              {
                razorpay_payment_id:
                  response.razorpay_payment_id,
                razorpay_order_id:
                  response.razorpay_order_id,
                razorpay_signature:
                  response.razorpay_signature,
              }
            )

            const returnedRecordId =
              verificationResponse.data.borrow_record_id

            setRecords((current) =>
              current.map((record) =>
                record.id === returnedRecordId
                  ? {
                      ...record,
                      status: 'RETURN PENDING',
                    }
                  : record
              )
            )

            setBill(null)
            setPaymentError('')
            setPaymentLoading(false)
          } catch (error) {
            console.error(
              'Payment verification failed:',
              error
            )

            setPaymentError(
              error.response?.data?.error ||
              'Payment verification failed. Please contact the library.'
            )

            setPaymentLoading(false)
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentLoading(false)
          },
        },
        prefill: {
          name: username,
        },
        theme: {
          color: '#154b3d',
        },
      }

      const razorpay = new window.Razorpay(options)

      razorpay.on(
        'payment.failed',
        function () {
          setPaymentError(
            'Payment failed. Please try again.'
          )
          setPaymentLoading(false)
        }
      )

      razorpay.open()
    } catch (error) {
      console.error('Payment initialization failed:', error)

      setPaymentError(
        'Unable to start the payment. Please try again.'
      )

      setPaymentLoading(false)
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

  return (
    <main className="my-books-page">

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
            className="dashboard-nav-item active"
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
            className="dashboard-nav-item"
            onClick={() => navigate('/settings')}
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

      <section className="my-books-content">

        <header className="my-books-topbar">

          <div className="my-books-header-brand">

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

          <div className="my-books-user-area">

            <NotificationBell />

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

        <motion.section
          className="my-books-heading"
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

            <p>BOOKVAULT COLLECTION</p>

            <h2>My Books</h2>

            <span>
              Track your borrow requests and books.
            </span>

          </div>

          <div className="my-books-count">

            <strong>{myRecords.length}</strong>

            <span>
              {myRecords.length === 1
                ? 'Record'
                : 'Records'}
            </span>

          </div>

        </motion.section>

        {loading && (
          <div className="my-books-loading">
            <div />
            <div />
          </div>
        )}

        {!loading && error && (
          <div className="my-books-message">

            <AlertTriangle
              size={38}
              strokeWidth={1.3}
            />

            <h3>
              Unable to load your books
            </h3>

            <p>{error}</p>

          </div>
        )}

        {!loading &&
          !error &&
          myRecords.length === 0 && (
            <div className="my-books-message">

              <Library
                size={40}
                strokeWidth={1.3}
              />

              <h3>
                No books yet
              </h3>

              <p>
                Books you borrow will appear here.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate('/all-books')
                }
              >
                Browse Books
              </button>

            </div>
          )}

        {!loading &&
          !error &&
          myRecords.length > 0 && (

          <motion.section
            className="my-books-grid"
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
            }}
          >

            {myRecords.map((record) => {

              const book =
                getBookForRecord(record)

              if (!book) {
                return null
              }

              return (
                <article
                  className="my-book-card"
                  key={record.id}
                >

                  <div className="my-book-cover">

                    {getBookImage(book.image) ? (

                      <img
                        src={getBookImage(book.image)}
                        alt={book.title}
                      />

                    ) : (

                      <div className="my-book-cover-placeholder">

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

                  <div className="my-book-details">

                    <div className="my-book-category">
                      {book.category || 'GENERAL'}
                    </div>

                    <h3>
                      {book.title}
                    </h3>

                    <p className="my-book-author">
                      {book.author}
                    </p>

                    <div
                      className={`my-book-status ${getStatusClass(
                        record.status
                      )}`}
                    >

                      {getStatusIcon(record.status)}

                      <span>
                        {getStatusLabel(record.status)}
                      </span>

                    </div>

                    {record.status === 'ACTIVE' && (

                      <button
                        type="button"
                        className="my-books-return-button"
                        onClick={() =>
                          handleReturn(record.id)
                        }
                        disabled={billLoading}
                      >
                        <CreditCard size={15} />
                        {billLoading
                          ? 'Preparing Bill...'
                          : 'Return Book'}
                      </button>

                    )}

                    <div className="my-book-info">

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

                    </div>

                    <div className="my-book-record">
                      Request ID #{record.id}
                    </div>

                  </div>

                </article>
              )
            })}

          </motion.section>
        )}

      </section>

      {bill && (

        <div className="return-bill-overlay">

          <motion.div
            className="return-bill-modal"
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 15,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
          >

            <button
              type="button"
              className="return-bill-close"
              onClick={closeBill}
              disabled={paymentLoading}
            >
              <X size={20} />
            </button>

            <div className="return-bill-icon">
              <CreditCard size={25} />
            </div>

            <p className="return-bill-eyebrow">
              BOOK RETURN
            </p>

            <h2>
              Return Bill
            </h2>

            <p className="return-bill-book">
              {bill.book_title}
            </p>

            <div className="return-bill-details">

              <div className="return-bill-row">

                <span>Borrow Fee</span>

                <strong>
                  ₹{Number(bill.borrow_fee || 0).toFixed(2)}
                </strong>

              </div>

              <div className="return-bill-row">

                <span>Late Days</span>

                <strong>
                  {bill.late_days || 0} days
                </strong>

              </div>

              <div className="return-bill-row">

                <span>Late Fine</span>

                <strong>
                  ₹{Number(bill.late_fine || 0).toFixed(2)}
                </strong>

              </div>

              <div className="return-bill-row">

                <span>Already Paid</span>

                <strong>
                  ₹{Number(bill.already_paid || 0).toFixed(2)}
                </strong>

              </div>

            </div>

            <div className="return-bill-total">

              <span>Total Amount</span>

              <strong>
                ₹{Number(bill.total_amount || 0).toFixed(2)}
              </strong>

            </div>

            {paymentError && (

              <div className="return-bill-error">
                <AlertTriangle size={16} />
                <span>{paymentError}</span>
              </div>

            )}

            <button
              type="button"
              className="return-bill-pay-button"
              onClick={handlePayment}
              disabled={
                paymentLoading ||
                Number(bill.total_amount || 0) <= 0
              }
            >

              <CreditCard size={18} />

              {paymentLoading
                ? 'Processing...'
                : Number(bill.total_amount || 0) > 0
                  ? `Pay ₹${Number(
                      bill.total_amount
                    ).toFixed(2)}`
                  : 'No Payment Required'}

            </button>

            <p className="return-bill-note">
              Your return request will be sent to the
              librarian after successful payment.
            </p>

          </motion.div>

        </div>

      )}

    </main>
  )
}

export default MyBooks