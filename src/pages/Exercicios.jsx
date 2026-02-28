import { useState, useCallback } from 'react'
import Page from '../components/Page'

const ACTIVITIES = [
  { id: 'pilates', label: 'Pilates' },
  { id: 'academia', label: 'Academia' },
  { id: 'corrida', label: 'Corrida' },
]

const STORAGE_KEY = 'exercicios'
const WEEKDAYS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']

function pad(n) { return String(n).padStart(2, '0') }
function fmtDate(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}` }

function todayStr() {
  const d = new Date()
  return fmtDate(d.getFullYear(), d.getMonth(), d.getDate())
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return {}
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch (_) {}
}

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay()
  const offset = (firstDay + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return { offset, daysInMonth }
}

function computeStreak(days, today) {
  if (!days) return 0
  let streak = 0
  const d = new Date(today + 'T12:00:00')
  while (true) {
    const key = fmtDate(d.getFullYear(), d.getMonth(), d.getDate())
    if (days[key]) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

function countMonth(days, year, month) {
  if (!days) return 0
  const prefix = `${year}-${pad(month + 1)}-`
  return Object.keys(days).filter(k => k.startsWith(prefix) && days[k]).length
}

function ActivityCard({ activity, days, onToggle }) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const today = todayStr()
  const { offset, daysInMonth } = getMonthDays(year, month)

  const streak = computeStreak(days, today)
  const total = countMonth(days, year, month)

  const monthLabel = new Date(year, month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="rounded-2xl px-4 py-5" style={{ backgroundColor: '#2d292608' }}>
      {/* Header */}
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ color: '#2d2926' }}>
          {activity.label}
        </h2>
        <div className="flex gap-3">
          <span className="text-[11px] font-medium" style={{ color: '#2d2926', opacity: 0.45 }}>
            {streak}d seguidos
          </span>
          <span className="text-[11px] font-medium" style={{ color: '#2d2926', opacity: 0.45 }}>
            {total}x mês
          </span>
        </div>
      </div>

      {/* Month label */}
      <p className="text-[10px] uppercase tracking-widest font-medium mb-2 capitalize" style={{ color: '#2d2926', opacity: 0.35 }}>
        {monthLabel}
      </p>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-[3px] mb-1">
        {WEEKDAYS.map((w, i) => (
          <span key={i} className="text-[10px] text-center font-medium" style={{ color: '#2d2926', opacity: 0.25 }}>
            {w}
          </span>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-[3px]">
        {Array.from({ length: offset }, (_, i) => (
          <span key={`off-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const dateStr = fmtDate(year, month, day)
          const done = !!(days && days[dateStr])
          const isFuture = dateStr > today
          const isToday = dateStr === today

          let bg = 'transparent'
          let border = '1.5px solid rgba(45,41,38,0.08)'
          let textOpacity = 0.3

          if (done) {
            bg = '#2d2926'
            border = '1.5px solid #2d2926'
            textOpacity = 1
          } else if (isFuture) {
            border = '1.5px solid rgba(45,41,38,0.06)'
            textOpacity = 0.15
          } else {
            bg = 'rgba(45,41,38,0.04)'
            border = '1.5px solid rgba(45,41,38,0.04)'
            textOpacity = 0.25
          }

          return (
            <button
              key={day}
              onClick={() => !isFuture && onToggle(activity.id, dateStr)}
              disabled={isFuture}
              className={`aspect-square rounded-lg flex items-center justify-center text-[11px] font-medium transition-all duration-150 ${
                isFuture ? 'cursor-default' : 'cursor-pointer active:scale-90'
              } ${isToday && !done ? 'ring-1 ring-[#2d2926]/25' : ''}`}
              style={{
                backgroundColor: bg,
                border,
                color: done ? '#f7f5f1' : '#2d2926',
                opacity: done ? 1 : textOpacity,
              }}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function Exercicios() {
  const [data, setData] = useState(() => loadData())

  const toggle = useCallback((activityId, dateStr) => {
    setData(prev => {
      const actDays = prev[activityId] || {}
      const next = {
        ...prev,
        [activityId]: {
          ...actDays,
          [dateStr]: !actDays[dateStr],
        },
      }
      if (!next[activityId][dateStr]) {
        delete next[activityId][dateStr]
      }
      saveData(next)
      return next
    })
  }, [])

  return (
    <Page>
      <div className="flex flex-col min-h-full px-5 pt-10 pb-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold" style={{ color: '#2d2926' }}>
            Exercícios
          </h1>
          <p className="text-sm mt-1" style={{ color: '#2d2926', opacity: 0.35 }}>
            Toca num dia para marcar presença
          </p>
        </div>

        {/* Activity cards */}
        <div className="flex flex-col gap-4">
          {ACTIVITIES.map(activity => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              days={data[activity.id] || {}}
              onToggle={toggle}
            />
          ))}
        </div>
      </div>
    </Page>
  )
}
