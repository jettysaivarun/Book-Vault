import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
} from 'lucide-react'
import api from '../services/api'
import './Reservations.css'

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDate(value) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function Reservation({ book, onClose, onSuccess }) {
  const today = useMemo(() => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  }, [])

  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today))
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [unavailableDates, setUnavailableDates] = useState(new Set())
  const [loadingAvailability, setLoadingAvailability] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadAvailability()
  }, [])

  const loadAvailability = async () => {
    try {
      setLoadingAvailability(true)
      setError('')

      const todayString = formatDate(today)
      const lastDate = addDays(today, 365)

      const response = await api.post(
        '/api/notifications/book_availability/',
        {
          book_id: book.id,
          start_date: todayString,
          end_date: formatDate(lastDate),
        }
      )

      setUnavailableDates(
        new Set(response.data.unavailable_dates || [])
      )
    } catch (err) {
      console.error('Availability error:', err)

      setError(
        err.response?.data?.error ||
        'Unable to load book availability.'
      )
    } finally {
      setLoadingAvailability(false)
    }
  }

  const monthName = currentMonth.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  })

  const calendarDays = useMemo(() => {
    const firstDay = startOfMonth(currentMonth)
    const firstWeekday = firstDay.getDay()

    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate()

    const days = []

    for (let i = 0; i < firstWeekday; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth(),
          day
        )
      )
    }

    return days
  }, [currentMonth])

  const isPast = (date) => {
    return date < today
  }

  const isUnavailable = (date) => {
    return unavailableDates.has(formatDate(date))
  }

  const isSelected = (date) => {
    if (!date) return false

    const value = formatDate(date)

    return value === startDate || value === endDate
  }

  const isInRange = (date) => {
    if (!date || !startDate || !endDate) return false

    const current = formatDate(date)

    return current > startDate && current < endDate
  }

  const rangeContainsUnavailableDate = (start, end) => {
    let current = parseDate(start)
    const final = parseDate(end)

    while (current <= final) {
      if (unavailableDates.has(formatDate(current))) {
        return true
      }

      current = addDays(current, 1)
    }

    return false
  }

  const handleDateClick = (date) => {
    if (!date || loadingAvailability || submitting) return

    const value = formatDate(date)

    if (isPast(date) || isUnavailable(date)) return

    setError('')

    if (!startDate || (startDate && endDate)) {
      setStartDate(value)
      setEndDate('')
      return
    }

    if (value < startDate) {
      setStartDate(value)
      setEndDate('')
      return
    }

    const difference =
      Math.round(
        (parseDate(value) - parseDate(startDate)) /
        (1000 * 60 * 60 * 24)
      )

    if (difference > 14) {
      setError('A reservation can be for a maximum of 14 days.')
      return
    }

    if (rangeContainsUnavailableDate(startDate, value)) {
      setError(
        'One or more dates in this range are unavailable. Please select another range.'
      )
      return
    }

    setEndDate(value)
  }

  const goToPreviousMonth = () => {
    const previous = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1
    )

    if (
      previous.getFullYear() < today.getFullYear() ||
      (
        previous.getFullYear() === today.getFullYear() &&
        previous.getMonth() < today.getMonth()
      )
    ) {
      return
    }

    setCurrentMonth(previous)
  }

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1
      )
    )
  }

  const handleReserve = async () => {
    if (!startDate || !endDate) {
      setError('Please select both reservation start and end dates.')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      await api.post(
        '/api/notifications/reserve/',
        {
          book_id: book.id,
          reserved_date: startDate,
          exp_return: endDate,
        }
      )

      setSuccess(true)

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error('Reservation error:', err)

      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Unable to reserve this book.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="reservation-overlay">
        <div className="reservation-modal reservation-success-modal">
          <button
            type="button"
            className="reservation-close"
            onClick={onClose}
          >
            <X size={20} />
          </button>

          <div className="reservation-success-icon">
            <CheckCircle2 size={58} />
          </div>

          <h2>Book Reserved Successfully!</h2>

          <p>
            <strong>{book.title}</strong> has been reserved for you.
          </p>

          <div className="reservation-success-details">
            <div>
              <span>Reservation date</span>
              <strong>{startDate}</strong>
            </div>

            <div>
              <span>Expected return</span>
              <strong>{endDate}</strong>
            </div>
          </div>

          <p className="reservation-success-note">
            Visit the library on your reservation date to collect the book.
          </p>

          <button
            type="button"
            className="reservation-primary-btn"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="reservation-overlay">
      <div className="reservation-modal">
        <div className="reservation-header">
          <div>
            <div className="reservation-title-row">
              <CalendarDays size={23} />
              <h2>Reserve Book</h2>
            </div>

            <p>
              Select the dates you want to reserve this book.
            </p>
          </div>

          <button
            type="button"
            className="reservation-close"
            onClick={onClose}
            disabled={submitting}
          >
            <X size={20} />
          </button>
        </div>

        <div className="reservation-book-info">
          <div>
            <span>Book</span>
            <strong>{book.title}</strong>
          </div>

          <div>
            <span>Maximum duration</span>
            <strong>14 days</strong>
          </div>
        </div>

        {error && (
          <div className="reservation-error">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="reservation-calendar">
          <div className="reservation-calendar-header">
            <button
              type="button"
              onClick={goToPreviousMonth}
              disabled={loadingAvailability || submitting}
            >
              <ChevronLeft size={20} />
            </button>

            <h3>{monthName}</h3>

            <button
              type="button"
              onClick={goToNextMonth}
              disabled={loadingAvailability || submitting}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="reservation-weekdays">
            {[
              'Sun',
              'Mon',
              'Tue',
              'Wed',
              'Thu',
              'Fri',
              'Sat',
            ].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {loadingAvailability ? (
            <div className="reservation-loading">
              <Loader2 size={30} className="reservation-spinner" />
              <span>Checking book availability...</span>
            </div>
          ) : (
            <div className="reservation-days">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="reservation-calendar-empty"
                    />
                  )
                }

                const past = isPast(date)
                const unavailable = isUnavailable(date)
                const selected = isSelected(date)
                const inRange = isInRange(date)

                return (
                  <button
                    key={formatDate(date)}
                    type="button"
                    className={[
                      'reservation-calendar-day',
                      past ? 'is-past' : '',
                      unavailable ? 'is-unavailable' : '',
                      selected ? 'is-selected' : '',
                      inRange ? 'is-in-range' : '',
                    ].join(' ')}
                    disabled={
                      past ||
                      unavailable ||
                      submitting
                    }
                    onClick={() => handleDateClick(date)}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="reservation-legend">
          <div>
            <span className="legend-dot available" />
            Available
          </div>

          <div>
            <span className="legend-dot selected" />
            Selected
          </div>

          <div>
            <span className="legend-dot unavailable" />
            Unavailable
          </div>
        </div>

        <div className="reservation-selection">
          <div>
            <span>Start date</span>
            <strong>
              {startDate || 'Select date'}
            </strong>
          </div>

          <div>
            <span>End date</span>
            <strong>
              {endDate || 'Select date'}
            </strong>
          </div>
        </div>

        <div className="reservation-actions">
          <button
            type="button"
            className="reservation-cancel-btn"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            type="button"
            className="reservation-primary-btn"
            onClick={handleReserve}
            disabled={
              !startDate ||
              !endDate ||
              submitting ||
              loadingAvailability
            }
          >
            {submitting ? (
              <>
                <Loader2
                  size={18}
                  className="reservation-spinner"
                />
                Reserving...
              </>
            ) : (
              <>
                <CalendarDays size={18} />
                Confirm Reservation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Reservation