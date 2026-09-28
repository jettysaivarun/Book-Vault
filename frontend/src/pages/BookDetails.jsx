import { useEffect, useState } from 'react'

import {
  X,
  BookOpen,
  Bookmark,
  Share2,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react'

import api from '../services/api'

import './BookDetails.css'


function BookDetails({ book, imageUrl, onClose }) {

  /* ========================================
     BORROW STATE

     idle
     confirming
     pending
     borrowed
  ======================================== */

  const [borrowStatus, setBorrowStatus] =
    useState('idle')

  const [borrowLoading, setBorrowLoading] =
    useState(false)

  const [borrowError, setBorrowError] =
    useState('')

  const [borrowConfirmation, setBorrowConfirmation] =
    useState(false)

  const [selectedCopy, setSelectedCopy] =
    useState(null)

  const [borrowRecordId, setBorrowRecordId] =
    useState(null)


  /* ========================================
     COPY COUNTS
  ======================================== */

  const [copyCounts, setCopyCounts] =
    useState(book?.copy_counts || {})


  /* ========================================
     SYNC BOOK
  ======================================== */

  useEffect(() => {

    setCopyCounts(
      book?.copy_counts || {}
    )

    setBorrowError('')

    setBorrowConfirmation(false)

    setSelectedCopy(null)

    /*
      Check whether this browser already has
      a pending borrow request for this book.
    */

    if (book?.id) {

      const savedRecordId =
        localStorage.getItem(
          `pending_borrow_${book.id}`
        )

      if (savedRecordId) {

        setBorrowRecordId(
          Number(savedRecordId)
        )

        setBorrowStatus('pending')

      } else {

        setBorrowRecordId(null)

        setBorrowStatus('idle')

      }

    }

  }, [book])


  /* ========================================
     NO BOOK
  ======================================== */

  if (!book) {
    return null
  }


  /* ========================================
     DESCRIPTION
  ======================================== */

  const description =
    book.title === 'Pride and Prejudice'
      ? 'A timeless classic exploring love, society and the journey of Elizabeth Bennet.'
      : book.title === '1984'
        ? 'A dystopian novel exploring surveillance, power and the dangers of totalitarianism.'
        : `Explore ${book.title} through the BookVault collection.`


  /* ========================================
     COPY COUNTS
  ======================================== */

  const available =
    copyCounts.available ?? 0

  const borrowed =
    copyCounts.borrowed ?? 0

  const reserved =
    copyCounts.reserved ?? 0

  const lost =
    copyCounts.lost ?? 0

  const damaged =
    copyCounts.damaged ?? 0

  const total =
    copyCounts.total ?? 0


  /* ========================================
     FIND AVAILABLE COPY
  ======================================== */

  const handleBorrowClick = async () => {

    setBorrowError('')

    try {

      setBorrowLoading(true)


      /*
        Get all book copies
      */

      const response = await api.get(
        '/api/librarymanagement/bookcopies/'
      )


      const copies =
        response.data


      /*
        Find an AVAILABLE copy
        belonging to this book
      */

      const availableCopy =
        copies.find(
          (copy) =>
            Number(copy.book) === Number(book.id) &&
            copy.status === 'AVAILABLE'
        )


      if (!availableCopy) {

        setBorrowError(
          'No available copy was found. Please try again.'
        )

        return
      }


      /*
        Store selected copy
      */

      setSelectedCopy(
        availableCopy
      )


      /*
        Open confirmation panel
      */

      setBorrowConfirmation(true)

      setBorrowStatus('confirming')

    } catch (error) {

      console.error(
        'Failed to find available copy:',
        error
      )


      if (
        error.response?.status === 401
      ) {

        setBorrowError(
          'Your session has expired. Please log in again.'
        )

      } else {

        setBorrowError(
          'Unable to check book availability. Please try again.'
        )

      }

    } finally {

      setBorrowLoading(false)

    }

  }


  /* ========================================
     CONFIRM BORROW REQUEST

     IMPORTANT:

     This does NOT mean the book is borrowed.

     It only creates:

     BorrowRecord = PENDING

     BookCopy = RESERVED
  ======================================== */

 const confirmBorrow = async () => {

  if (!selectedCopy) {
    return
  }

  try {

    setBorrowLoading(true)
    setBorrowError('')


    /* ========================================
       STEP 1
       REFRESH COPIES BEFORE SUBMITTING

       Never trust the copy selected earlier.
    ======================================== */

    const copiesResponse = await api.get(
      '/api/librarymanagement/bookcopies/'
    )

    const latestCopies =
      copiesResponse.data


    /* ========================================
       STEP 2
       FIND THE SAME COPY AGAIN

       We check its CURRENT backend status.
    ======================================== */

    const latestSelectedCopy =
      latestCopies.find(
        (copy) =>
          Number(copy.id) ===
          Number(selectedCopy.id)
      )


    /* ========================================
       COPY NO LONGER EXISTS
    ======================================== */

    if (!latestSelectedCopy) {

      setBorrowError(
        'This book copy is no longer available.'
      )

      setBorrowConfirmation(false)

      setSelectedCopy(null)

      return
    }


    /* ========================================
       COPY IS NO LONGER AVAILABLE
    ======================================== */

    if (
      latestSelectedCopy.status !== 'AVAILABLE'
    ) {

      setBorrowError(
        `Copy #${latestSelectedCopy.copy_number} is no longer available. Its current status is ${latestSelectedCopy.status}.`
      )


      /*
        Close the confirmation because
        the information displayed there
        is no longer valid.
      */

      setBorrowConfirmation(false)

      setSelectedCopy(null)


      /*
        Refresh counts from current copies.
      */

      const currentCounts = {
        available:
          latestCopies.filter(
            (copy) =>
              Number(copy.book) ===
                Number(book.id) &&
              copy.status === 'AVAILABLE'
          ).length,

        borrowed:
          latestCopies.filter(
            (copy) =>
              Number(copy.book) ===
                Number(book.id) &&
              copy.status === 'BORROWED'
          ).length,

        reserved:
          latestCopies.filter(
            (copy) =>
              Number(copy.book) ===
                Number(book.id) &&
              copy.status === 'RESERVED'
          ).length,

        lost:
          latestCopies.filter(
            (copy) =>
              Number(copy.book) ===
                Number(book.id) &&
              copy.status === 'LOST'
          ).length,

        damaged:
          latestCopies.filter(
            (copy) =>
              Number(copy.book) ===
                Number(book.id) &&
              copy.status === 'DAMAGED'
          ).length,

        total:
          latestCopies.filter(
            (copy) =>
              Number(copy.book) ===
              Number(book.id)
          ).length,
      }


      setCopyCounts(
        currentCounts
      )

      return
    }


    /* ========================================
       STEP 3
       SEND REQUEST

       At this point we KNOW that the
       copy is AVAILABLE according to
       the latest backend state.
    ======================================== */

    const response = await api.post(
      '/api/librarymanagement/borrow/borrow_record/',
      {
        copy_id: latestSelectedCopy.id,
      }
    )


    console.log(
      'Borrow request created:',
      response.data
    )


    /* ========================================
       STEP 4
       GET BORROW RECORD ID
    ======================================== */

    const recordId =
      response.data.id


    if (!recordId) {

      setBorrowError(
        'The borrow request was created, but no request ID was returned.'
      )

      return
    }


    /* ========================================
       STEP 5
       SAVE PENDING REQUEST
    ======================================== */

    localStorage.setItem(
      `pending_borrow_${book.id}`,
      String(recordId)
    )


    setBorrowRecordId(
      recordId
    )


    /* ========================================
       STEP 6
       UPDATE UI

       AVAILABLE → RESERVED

       NOT:

       AVAILABLE → BORROWED
    ======================================== */

    setCopyCounts(
      (current) => ({

        ...current,

        available:
          Math.max(
            0,
            (current.available ?? 0) - 1
          ),

        reserved:
          (current.reserved ?? 0) + 1,

      })
    )


    /* ========================================
       STEP 7
       CLOSE CONFIRMATION
    ======================================== */

    setBorrowConfirmation(
      false
    )

    setSelectedCopy(
      null
    )


    /* ========================================
       STEP 8
       SHOW PENDING
    ======================================== */

    setBorrowStatus(
      'pending'
    )

  } catch (error) {

    console.error(
      'Borrow request failed:',
      error
    )


    /* ========================================
       BACKEND REJECTED REQUEST
    ======================================== */

    if (
      error.response?.status === 400
    ) {

      setBorrowError(
        error.response.data?.error ||
        'This book copy is no longer available.'
      )

      /*
        The confirmation is no longer valid.
      */

      setBorrowConfirmation(
        false
      )

      setSelectedCopy(
        null
      )

    } else if (
      error.response?.status === 401
    ) {

      setBorrowError(
        'Your session has expired. Please log in again.'
      )

    } else {

      setBorrowError(
        'Unable to submit your borrow request. Please try again.'
      )

    }

  } finally {

    setBorrowLoading(
      false
    )

  }

}


  /* ========================================
     POLL BORROW REQUEST

     PENDING:
       keep waiting

     ACTIVE:
       book successfully borrowed

     RETURNED / LOST / DAMAGED:
       request is no longer active
  ======================================== */

  useEffect(() => {

    if (
      !borrowRecordId ||
      borrowStatus !== 'pending'
    ) {
      return
    }


    let cancelled = false


    const checkBorrowStatus = async () => {

      try {

        const response = await api.get(
          `/api/librarymanagement/borrow/${borrowRecordId}/`
        )


        if (cancelled) {
          return
        }


        const record =
          response.data


        console.log(
          'Current borrow status:',
          record.status
        )


        /*
          ========================================
          REQUEST STILL WAITING
          ========================================
        */

        if (
          record.status === 'PENDING'
        ) {

          return
        }


        /*
          ========================================
          ADMIN ACCEPTED

          PENDING → ACTIVE
          RESERVED → BORROWED
          ========================================
        */

        if (
          record.status === 'ACTIVE'
        ) {

          setBorrowStatus(
            'borrowed'
          )


          setCopyCounts((current) => ({

            ...current,

            reserved:
              Math.max(
                0,
                (current.reserved ?? 0) - 1
              ),

            borrowed:
              (current.borrowed ?? 0) + 1,

          }))


          /*
            Request is no longer pending
          */

          localStorage.removeItem(
            `pending_borrow_${book.id}`
          )


          setBorrowRecordId(
            null
          )


          return
        }


        /*
          ========================================
          REQUEST NO LONGER ACTIVE
          ========================================
        */

        if (
          record.status === 'RETURNED' ||
          record.status === 'LOST' ||
          record.status === 'DAMAGED'
        ) {

          localStorage.removeItem(
            `pending_borrow_${book.id}`
          )

          setBorrowRecordId(
            null
          )

          setBorrowStatus(
            'idle'
          )

        }

      } catch (error) {

        console.error(
          'Failed to check borrow request:',
          error
        )

      }

    }


    /*
      Check immediately
    */

    checkBorrowStatus()


    /*
      Then check every 5 seconds
    */

    const interval =
      setInterval(
        checkBorrowStatus,
        5000
      )


    return () => {

      cancelled = true

      clearInterval(
        interval
      )

    }

  }, [
    borrowRecordId,
    borrowStatus,
    book.id,
  ])


  /* ========================================
     CANCEL BORROW
  ======================================== */

  const cancelBorrow = () => {

    if (borrowLoading) {
      return
    }

    setBorrowConfirmation(false)

    setSelectedCopy(null)

    setBorrowError('')

    setBorrowStatus('idle')

  }


  /* ========================================
     CLOSE MODAL
  ======================================== */

  const handleClose = () => {

    if (borrowLoading) {
      return
    }

    onClose()

  }


  return (

    <div
      className="book-details-backdrop"
      onClick={handleClose}
    >

      <div
        className="book-details-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >


        {/* ========================================
            CLOSE
        ======================================== */}

        <button
          type="button"
          className="book-details-close"
          onClick={handleClose}
          aria-label="Close book details"
          disabled={borrowLoading}
        >

          <X
            size={22}
          />

        </button>


        {/* ========================================
            LEFT SIDE
        ======================================== */}

        <aside className="book-details-left">


          {/* COVER */}

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


          {/* ========================================
              BORROW BUTTON
          ======================================== */}

          <button
            type="button"
            className="book-details-action primary"

            disabled={
              available === 0 ||
              borrowLoading ||
              borrowStatus === 'pending' ||
              borrowStatus === 'borrowed'
            }

            onClick={handleBorrowClick}
          >

            {borrowLoading ? (

              <Loader2
                size={20}
                className="borrow-spinner"
              />

            ) : borrowStatus === 'pending' ? (

              <Loader2
                size={20}
                className="borrow-spinner"
              />

            ) : borrowStatus === 'borrowed' ? (

              <CheckCircle2
                size={20}
              />

            ) : (

              <BookOpen
                size={20}
              />

            )}


            <span>

              {borrowStatus === 'pending'

                ? 'Request Pending'

                : borrowStatus === 'borrowed'

                  ? 'Book Borrowed'

                  : borrowLoading

                    ? 'Checking...'

                    : available > 0

                      ? 'Borrow Book'

                      : 'No Copies Available'}

            </span>

          </button>


          {/* ========================================
              RESERVE
          ======================================== */}

          <button
            type="button"
            className="book-details-action"
          >

            <CalendarDays
              size={20}
            />

            <span>
              Reserve Book
            </span>

          </button>


          {/* ========================================
              SHARE
          ======================================== */}

          <button
            type="button"
            className="book-details-action"
          >

            <Share2
              size={20}
            />

            <span>
              Share Book
            </span>

          </button>


        </aside>


        {/* ========================================
            RIGHT SIDE
        ======================================== */}

        <section className="book-details-main">


          {/* HEADING */}

          <div className="book-details-heading">

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


          {/* METADATA */}

          <div className="book-details-meta">


            <div>

              <BookOpen
                size={20}
              />

              <span>

                <small>
                  ISBN
                </small>

                {book.isbn || '—'}

              </span>

            </div>


            <div>

              <Bookmark
                size={20}
              />

              <span>

                <small>
                  Publisher
                </small>

                {book.publisher || '—'}

              </span>

            </div>


            <div>

              <Bookmark
                size={20}
              />

              <span>

                <small>
                  Category
                </small>

                {book.category || '—'}

              </span>

            </div>


            <div>

              <BookOpen
                size={20}
              />

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


          {/* ========================================
              BORROW CONFIRMATION
          ======================================== */}

          {borrowConfirmation &&
            selectedCopy && (

            <div className="borrow-confirmation">

              <div className="borrow-confirmation-icon">

                <BookOpen
                  size={24}
                />

              </div>


              <div className="borrow-confirmation-content">

                <h3>
                  Borrow this book?
                </h3>

                <p>
                  Copy #{selectedCopy.copy_number}
                  {' '}
                  is currently available.
                </p>

                <span>
                  Your request will be sent
                  to the librarian for approval.
                </span>


                <div className="borrow-confirmation-actions">

                  <button
                    type="button"
                    className="borrow-cancel-button"
                    onClick={cancelBorrow}
                    disabled={borrowLoading}
                  >
                    Cancel
                  </button>


                  <button
                    type="button"
                    className="borrow-confirm-button"
                    onClick={confirmBorrow}
                    disabled={borrowLoading}
                  >

                    {borrowLoading ? (

                      <>

                        <Loader2
                          size={16}
                          className="borrow-spinner"
                        />

                        Sending Request...

                      </>

                    ) : (

                      'Send Borrow Request'

                    )}

                  </button>

                </div>

              </div>

            </div>

          )}


          {/* ========================================
              PENDING REQUEST
          ======================================== */}

          {borrowStatus === 'pending' && (

            <div className="borrow-pending">

              <div className="borrow-pending-icon">

                <Loader2
                  size={24}
                  className="borrow-spinner"
                />

              </div>


              <div>

                <strong>
                  Borrow request pending
                </strong>

                <p>
                  Your request has been sent to
                  the librarian. The book will be
                  borrowed only after the request
                  is accepted.
                </p>

              </div>

            </div>

          )}


          {/* ========================================
              BORROWED SUCCESS
          ======================================== */}

          {borrowStatus === 'borrowed' && (

            <div className="borrow-success">

              <div className="borrow-success-icon">

                <CheckCircle2
                  size={25}
                />

              </div>


              <div>

                <strong>
                  Book borrowed successfully!
                </strong>

                <p>
                  Your borrow request has been
                  accepted by the librarian.
                </p>

              </div>

            </div>

          )}


          {/* ========================================
              ERROR
          ======================================== */}

          {borrowError && (

            <div className="borrow-error">

              <AlertTriangle
                size={20}
              />

              <span>
                {borrowError}
              </span>

            </div>

          )}


          {/* ========================================
              AVAILABILITY STATUS
          ======================================== */}

          <div
            className={`book-details-status ${
              available > 0
                ? 'is-available'
                : 'is-unavailable'
            }`}
          >

            <div className="book-details-status-icon">

              {available > 0 ? (

                <CheckCircle2
                  size={25}
                />

              ) : (

                <AlertTriangle
                  size={25}
                />

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


          {/* ========================================
              BOOK COPIES
          ======================================== */}

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


              {/* TOTAL */}

              <div className="book-copy-status total">

                <div className="book-copy-icon">

                  <BookOpen
                    size={22}
                  />

                </div>

                <strong>
                  {total}
                </strong>

                <span>
                  Total
                </span>

              </div>


            </div>

          </div>


        </section>

      </div>

    </div>

  )
}


export default BookDetails