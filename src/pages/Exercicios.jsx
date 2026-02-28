import { useState, useCallback } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import Page from '../components/Page'

const ACTIVITIES = [
  { id: 'pilates', label: 'Pilates',  color: '#6366f1' },
  { id: 'academia', label: 'Academia', color: '#f59e0b' },
  { id: 'corrida', label: 'Corrida',  color: '#10b981' },
]

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

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

function NavBtn({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="w-7 h-7 flex items-center justify-center rounded-md text-lg leading-none transition-all active:scale-90 hover:bg-black/5"
      style={{ color: '#1A1916' }}
    >
      {children}
    </button>
  )
}

function ActivityCard({ activity, days, onToggle, year, month }) {
  const today = todayStr()
  const { offset, daysInMonth } = getMonthDays(year, month)
  const streak = computeStreak(days, today)
  const total = countMonth(days, year, month)

  return (
    <div className="rounded-lg px-4 py-5 bg-white shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-base font-medium" style={{ color: '#1A1916' }}>
          {activity.label}
        </h2>
        <div className="flex gap-3">
          <span className="text-[11px] font-medium" style={{ color: '#1A1916', opacity: 0.4 }}>
            {streak}d seguidos
          </span>
          <span className="text-[11px] font-medium" style={{ color: '#1A1916', opacity: 0.4 }}>
            {total}x mês
          </span>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-[3px] mb-1">
        {WEEKDAYS.map((w, i) => (
          <span key={i} className="text-[10px] text-center font-medium" style={{ color: '#1A1916', opacity: 0.25 }}>
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
          let border = '1.5px solid #E5E2DC'
          let textOpacity = 0.35

          if (done) {
            bg = '#1A1916'
            border = '1.5px solid #1A1916'
            textOpacity = 1
          } else if (isFuture) {
            border = '1.5px solid rgba(26,25,22,0.08)'
            textOpacity = 0.15
          } else {
            bg = 'rgba(26,25,22,0.04)'
            border = '1.5px solid rgba(26,25,22,0.06)'
            textOpacity = 0.3
          }

          return (
            <button
              key={day}
              onClick={() => !isFuture && onToggle(activity.id, dateStr)}
              disabled={isFuture}
              className={`aspect-square rounded-lg flex items-center justify-center text-[11px] font-medium transition-all duration-150 ${
                isFuture ? 'cursor-default' : 'cursor-pointer active:scale-90'
              } ${isToday && !done ? 'ring-1 ring-[#1A1916]/30' : ''}`}
              style={{
                backgroundColor: bg,
                border,
                color: done ? '#F2F0EB' : '#1A1916',
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

function buildChartData(data, year) {
  return MONTH_LABELS.map((label, month) => {
    const entry = { month: label }
    ACTIVITIES.forEach(({ id }) => {
      entry[id] = countMonth(data[id], year, month)
    })
    return entry
  })
}

function FrequencyChart({ data, year }) {
  const chartData = buildChartData(data, year)

  return (
    <div className="rounded-lg bg-white shadow-sm px-4 pt-5 pb-4 mt-6">
      <p
        className="text-sm font-medium mb-4"
        style={{ color: '#1A1916' }}
      >
        Frequência mensal — {year}
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,25,22,0.07)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: 'rgba(26,25,22,0.45)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: 'rgba(26,25,22,0.45)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid rgba(26,25,22,0.1)',
              borderRadius: 8,
              fontSize: 12,
              color: '#1A1916',
            }}
            itemStyle={{ color: '#1A1916' }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            formatter={(value) => ACTIVITIES.find(a => a.id === value)?.label ?? value}
          />
          {ACTIVITIES.map(({ id, color }) => (
            <Line
              key={id}
              type="monotone"
              dataKey={id}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 3, fill: color }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function Exercicios() {
  const now = new Date()
  const [data, setData] = useState(() => loadData())
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }
  const prevYear = () => setViewYear(y => y - 1)
  const nextYear = () => setViewYear(y => y + 1)

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('pt-BR', { month: 'long' })

  const toggle = useCallback((activityId, dateStr) => {
    setData(prev => {
      const actDays = prev[activityId] || {}
      const next = {
        ...prev,
        [activityId]: { ...actDays, [dateStr]: !actDays[dateStr] },
      }
      if (!next[activityId][dateStr]) delete next[activityId][dateStr]
      saveData(next)
      return next
    })
  }, [])

  return (
    <Page>
      <div className="flex flex-col min-h-full px-5 md:px-8 pt-10 pb-6">
        {/* Header */}
        <div className="mb-6">
          <h1
            className="text-4xl md:text-5xl"
            style={{ color: '#1A1916', fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
          >
            Exercícios
          </h1>
          <p className="text-sm mt-1" style={{ color: '#1A1916', opacity: 0.4 }}>
            Toca num dia para marcar presença
          </p>
        </div>

        {/* Month / Year navigation */}
        <div className="flex items-center gap-6 mb-6">
          {/* Month */}
          <div className="flex items-center gap-1">
            <NavBtn onClick={prevMonth}>‹</NavBtn>
            <span
              className="text-sm font-medium capitalize text-center"
              style={{ color: '#1A1916', minWidth: '6rem' }}
            >
              {monthLabel}
            </span>
            <NavBtn onClick={nextMonth}>›</NavBtn>
          </div>

          {/* Year */}
          <div className="flex items-center gap-1">
            <NavBtn onClick={prevYear}>‹</NavBtn>
            <span
              className="text-sm font-medium text-center"
              style={{ color: '#1A1916', minWidth: '3rem' }}
            >
              {viewYear}
            </span>
            <NavBtn onClick={nextYear}>›</NavBtn>
          </div>
        </div>

        {/* Activity cards — 1 col mobile, 3 cols desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ACTIVITIES.map(activity => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              days={data[activity.id] || {}}
              onToggle={toggle}
              year={viewYear}
              month={viewMonth}
            />
          ))}
        </div>

        {/* Line chart */}
        <FrequencyChart data={data} year={viewYear} />
      </div>
    </Page>
  )
}
