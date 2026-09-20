import {
  X,
  BookOpen,
  Bookmark,
  Share2,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import './BookDetails.css'

function BookDetails({ book, imageUrl, onClose }) {
  if (!book) {
    return null
  }

  const description =
    book.title === 'Pride and Prejudice'
      ? 'A timeless classic exploring love, society and the journey of Elizabeth Bennet.'
      : book.title === '1984'
        ? 'A dystopian novel exploring surveillance, power and the dangers of totalitarianism.'
        : `Explore ${book.title} through the BookVault collection.`

  const copyCounts = book.copy_counts || {}

  const available = copyCounts.available ?? 0
  const borrowed = copyCounts.borrowed ?? 0
  const reserved = copyCounts.reserved ?? 0
  const lost = copyCounts.lost ?? 0
  const damaged = copyCounts.damaged ?? 0
  const total = copyCounts.total ?? 0

  return (
    <div
      className="book-details-backdrop"
      onClick={onClose}
    >

      <div
        className="book-details-modal"
        onClick={(event) => event.stopPropagation()}
      >

        {/* CLOSE */}

        <button
          type="button"
          className="book-details-close"
          onClick={onClose}
          aria-label="Close book details"
        >
          <X size={22} />
        </button>


        {/* LEFT SIDE */}

        <aside className="book-details-left">

          <div className="book-details-cover">

            {imageUrl ? (
              <img
                src={imageUrl}
                alt={book.title}
              />
            ) : (
              <div className="book-details-cover-placeholder">

                <BookOpen
                  size={48}
                  strokeWidth={1.2}
                />

                <span>
                  {book.title}
                </span>

              </div>
            )}

          </div>


          {/* BORROW */}

          <button
            type="button"
            className="book-details-action primary"
            disabled={available === 0}
          >

            <BookOpen size={20} />

            <span>
              {available > 0
                ? 'Borrow Book'
                : 'No Copies Available'}
            </span>

          </button>


          {/* RESERVE */}

          <button
            type="button"
            className="book-details-action"
          >

            <CalendarDays size={20} />

            <span>
              Reserve Book
            </span>

          </button>


          {/* SHARE */}

          <button
            type="button"
            className="book-details-action"
          >

            <Share2 size={20} />

            <span>
              Share Book
            </span>

          </button>

        </aside>


        {/* RIGHT SIDE */}

        <section className="book-details-main">

          {/* HEADING */}

          <div className="book-details-heading">

            <div>

              <span className="book-details-category">
                {book.category || 'GENERAL'}
              </span>

              <h2>
                {book.title}
              </h2>

              <p className="book-details-author">
                {book.author}
              </p>

            </div>

          </div>


          {/* BOOK METADATA */}

          <div className="book-details-meta">

            <div>

              <BookOpen size={20} />

              <span>

                <small>
                  ISBN
                </small>

                {book.isbn || '—'}

              </span>

            </div>


            <div>

              <Bookmark size={20} />

              <span>

                <small>
                  Publisher
                </small>

                {book.publisher || '—'}

              </span>

            </div>


            <div>

              <Bookmark size={20} />

              <span>

                <small>
                  Category
                </small>

                {book.category || '—'}

              </span>

            </div>


            <div>

              <BookOpen size={20} />

              <span>

                <small>
                  Language
                </small>

                {book.language || '—'}

              </span>

            </div>

          </div>


          {/* ABOUT */}

          <div className="book-details-about">

            <h3>
              About This Book
            </h3>

            <p>
              {description}
            </p>

          </div>


          {/* COPY INFORMATION */}

          <div className="book-details-copies">

            <div className="book-details-section-heading">

              <div>

                <h3>
                  Book Copies
                </h3>

                <p>
                  Total copies: {total}
                </p>

              </div>

              <span>
                Live Availability
              </span>

            </div>


            <div className="book-details-copy-grid">

              {/* AVAILABLE */}

              <div className="book-copy-status available">

                <div className="book-copy-icon">

                  <CheckCircle2
                    size={22}
                  />

                </div>

                <strong>
                  {available}
                </strong>

                <span>
                  Available
                </span>

              </div>


              {/* BORROWED */}

              <div className="book-copy-status borrowed">

                <div className="book-copy-icon">

                  <BookOpen
                    size={22}
                  />

                </div>

                <strong>
                  {borrowed}
                </strong>

                <span>
                  Borrowed
                </span>

              </div>


              {/* RESERVED */}

              <div className="book-copy-status reserved">

                <div className="book-copy-icon">

                  <CalendarDays
                    size={22}
                  />

                </div>

                <strong>
                  {reserved}
                </strong>

                <span>
                  Reserved
                </span>

              </div>


              {/* LOST */}

              <div className="book-copy-status lost">

                <div className="book-copy-icon">

                  <AlertTriangle
                    size={22}
                  />

                </div>

                <strong>
                  {lost}
                </strong>

                <span>
                  Lost
                </span>

              </div>


              {/* DAMAGED */}

              <div className="book-copy-status damaged">

                <div className="book-copy-icon">

                  <AlertTriangle
                    size={22}
                  />

                </div>

                <strong>
                  {damaged}
                </strong>

                <span>
                  Damaged
                </span>

              </div>

            </div>

          </div>


          {/* AVAILABILITY STATUS */}

          <div
            className={`book-details-status ${
              available > 0
                ? 'is-available'
                : 'is-unavailable'
            }`}
          >

            <div className="book-details-status-icon">

              {available > 0 ? (
                <CheckCircle2 size={25} />
              ) : (
                <AlertTriangle size={25} />
              )}

            </div>


            <div>

              {available > 0 ? (
                <>
                  <strong>
                    {available}{' '}
                    {available === 1
                      ? 'copy is'
                      : 'copies are'}{' '}
                    available for borrowing
                  </strong>

                  <p>
                    You can borrow this book now.
                  </p>
                </>
              ) : (
                <>
                  <strong>
                    No copies are currently available
                  </strong>

                  <p>
                    You can reserve this book instead.
                  </p>
                </>
              )}

            </div>

          </div>

        </section>

      </div>

    </div>
  )
}

export default BookDetails