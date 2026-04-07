'use client'

import { useState, useEffect } from 'react'

type DateRange = { start: Date | null; end: Date | null }

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Consistent picsum images per month (seeded, so always same photo)
const MONTH_IMAGES = MONTHS.map((m, i) =>
  `https://picsum.photos/seed/paperdays-${i}-${m.toLowerCase()}/1400/560`
)

// Common holidays keyed MM-DD
const HOLIDAYS: Record<string, string> = {
  '01-01': "New Year's Day",
  '02-14': "Valentine's Day",
  '03-17': "St. Patrick's Day",
  '04-22': 'Earth Day',
  '05-05': 'Cinco de Mayo',
  '06-19': 'Juneteenth',
  '07-04': 'Independence Day',
  '10-31': 'Halloween',
  '11-11': 'Veterans Day',
  '12-25': 'Christmas',
  '12-31': "New Year's Eve",
}

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

function fmt(d: Date, pattern: string) {
  return pattern
    .replace('MMMM', MONTHS[d.getMonth()])
    .replace('MMM', MONTHS[d.getMonth()].slice(0, 3))
    .replace('yyyy', d.getFullYear().toString())
    .replace('MM', pad(d.getMonth() + 1))
    .replace('dd', pad(d.getDate()))
    .replace('d', d.getDate().toString())
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function inRange(d: Date, a: Date, b: Date) {
  const t = d.getTime()
  return t >= Math.min(a.getTime(), b.getTime()) && t <= Math.max(a.getTime(), b.getTime())
}

function getMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const days: Date[] = []
  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d))
  }
  const blanks = (first.getDay() + 6) % 7 // Monday-first
  return { days, blanks }
}

export default function Calendar() {
  const today = new Date()
  const [cur, setCur] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [range, setRange] = useState<DateRange>({ start: null, end: null })
  const [picking, setPicking] = useState(false) // true = selecting end date
  const [hover, setHover] = useState<Date | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [flipping, setFlipping] = useState(false)
  const [imgVisible, setImgVisible] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('paper-days-notes')
      if (saved) setNotes(JSON.parse(saved))
    } catch {}
    setImgVisible(true)
  }, [])

  const saveNote = (key: string, val: string) => {
    const next = { ...notes, [key]: val }
    setNotes(next)
    localStorage.setItem('paper-days-notes', JSON.stringify(next))
  }

  const navigate = (dir: 1 | -1) => {
    setFlipping(true)
    setImgVisible(false)
    setTimeout(() => {
      setCur(c => new Date(c.getFullYear(), c.getMonth() + dir, 1))
      setFlipping(false)
      setTimeout(() => setImgVisible(true), 50)
    }, 220)
  }

  const { days, blanks } = getMonthDays(cur.getFullYear(), cur.getMonth())

  const handleClick = (day: Date) => {
    if (!picking) {
      setRange({ start: day, end: null })
      setPicking(true)
    } else {
      const s = range.start!
      setRange({
        start: day < s ? day : s,
        end: day < s ? s : day,
      })
      setPicking(false)
      setHover(null)
    }
  }

  const clearRange = () => {
    setRange({ start: null, end: null })
    setPicking(false)
    setHover(null)
  }

  const effectiveEnd = picking && hover ? hover : range.end

  const notesKey =
    range.start && range.end
      ? `r-${fmt(range.start, 'yyyy-MM-dd')}-${fmt(range.end, 'yyyy-MM-dd')}`
      : `m-${fmt(cur, 'yyyy-MM')}`

  const notesLabel =
    range.start && range.end
      ? `${fmt(range.start, 'MMM d')} — ${fmt(range.end, 'MMM d')}`
      : fmt(cur, 'MMMM yyyy')

  return (
    <div className="cal-wrap">

      {/* ── Spiral binding ── */}
      <div className="binding">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="ring" />
        ))}
      </div>

      {/* ── Hero image ── */}
      <div className="hero">
        <img
          key={cur.getMonth()}
          src={MONTH_IMAGES[cur.getMonth()]}
          alt=""
          className={`hero-img${imgVisible ? ' visible' : ''}`}
          onLoad={() => setImgVisible(true)}
        />
        <div className="hero-badge">
          <span className="badge-year">{cur.getFullYear()}</span>
          <span className="badge-month">{MONTHS[cur.getMonth()].toUpperCase()}</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className={`cal-body${flipping ? ' flipping' : ''}`}>

        {/* Left panel */}
        <aside className="left">
          <div>
            <div className="month-big">{MONTHS[cur.getMonth()]}</div>
            <div className="year-small">{cur.getFullYear()}</div>
          </div>

          <nav className="cal-nav">
            <button className="nav-btn" onClick={() => navigate(-1)}>← prev</button>
            <button className="nav-btn" onClick={() => navigate(1)}>next →</button>
          </nav>

          {range.start && (
            <div className="range-pill">
              <span>
                {range.end
                  ? `${fmt(range.start, 'MMM d')} — ${fmt(range.end, 'MMM d')}`
                  : `from ${fmt(range.start, 'MMM d')}…`}
              </span>
              <button className="clear-btn" onClick={clearRange}>×</button>
            </div>
          )}

          <div className="notes-block">
            <div className="notes-head">notes · {notesLabel}</div>
            <textarea
              className="notes-ta"
              placeholder="jot something down..."
              value={notes[notesKey] ?? ''}
              onChange={e => saveNote(notesKey, e.target.value)}
            />
          </div>
        </aside>

        {/* Calendar grid */}
        <section className="right">
          <div className="day-headers">
            {WEEKDAYS.map((d, i) => (
              <div key={d + i} className={`day-hdr${i >= 5 ? ' wknd' : ''}`}>
                {d}
              </div>
            ))}
          </div>

          <div
            className="day-grid"
            onMouseLeave={() => picking && setHover(null)}
          >
            {Array.from({ length: blanks }).map((_, i) => (
              <div key={`b${i}`} className="day-cell blank" />
            ))}

            {days.map(day => {
              const isStart = !!(range.start && sameDay(day, range.start))
              const isEnd = !!(effectiveEnd && sameDay(day, effectiveEnd))
              const isInRange =
                !!(range.start && effectiveEnd && inRange(day, range.start, effectiveEnd)) &&
                !isStart &&
                !isEnd
              const isToday = sameDay(day, today)
              const dow = (day.getDay() + 6) % 7
              const isWeekend = dow >= 5
              const hKey = `${pad(day.getMonth() + 1)}-${pad(day.getDate())}`
              const holiday = HOLIDAYS[hKey]

              const cls = [
                'day-cell',
                isStart ? 'range-s' : '',
                isEnd ? 'range-e' : '',
                isInRange ? 'in-range' : '',
                isToday && !isStart && !isEnd ? 'today' : '',
                isWeekend ? 'wknd-day' : '',
              ]
                .filter(Boolean)
                .join(' ')

              return (
                <div
                  key={day.toISOString()}
                  className={cls}
                  onClick={() => handleClick(day)}
                  onMouseEnter={() => picking && setHover(day)}
                >
                  <span className="day-num">{day.getDate()}</span>
                  {holiday && <span className="h-dot" title={holiday} />}
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
