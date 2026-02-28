import { useState } from 'react'
import Page from '../components/Page'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

const STORAGE_KEY = 'corpo'
const CHARTS = [
  { key: 'peso', label: 'Peso (kg)' },
  { key: 'massaMagra', label: 'Massa magra (kg)' },
  { key: 'percGordura', label: '% Gordura' },
]

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return parsed.sort((a, b) => a.data.localeCompare(b.data))
    }
  } catch (_) {}
  return []
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch (_) {}
}

function fmtDate(iso) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}`
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.[0]) return null
  return (
    <div className="rounded-lg px-3 py-2 text-xs font-medium shadow-sm" style={{ backgroundColor: '#2d2926', color: '#f7f5f1' }}>
      <span>{label}: </span>
      <span>{payload[0].value}</span>
    </div>
  )
}

function StatCard({ label, value, unit }) {
  return (
    <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: '#2d292608' }}>
      <p className="text-[10px] uppercase tracking-widest font-medium mb-1" style={{ color: '#2d2926', opacity: 0.35 }}>
        {label}
      </p>
      <p className="text-xl font-semibold tabular-nums" style={{ color: '#2d2926' }}>
        {value}
        {unit && <span className="text-xs font-medium ml-0.5" style={{ opacity: 0.4 }}>{unit}</span>}
      </p>
    </div>
  )
}

function MiniChart({ data, dataKey, label }) {
  if (data.length < 2) return null
  return (
    <div className="rounded-2xl px-4 pt-4 pb-2" style={{ backgroundColor: '#2d292608' }}>
      <p className="text-xs font-medium mb-3" style={{ color: '#2d2926', opacity: 0.5 }}>
        {label}
      </p>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,41,38,0.06)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#2d2926', opacity: 0.3 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={['dataMin - 1', 'dataMax + 1']}
            tick={{ fontSize: 10, fill: '#2d2926', opacity: 0.3 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="#2d2926"
            strokeWidth={2}
            dot={{ r: 3, fill: '#2d2926', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#2d2926', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function Corpo() {
  const [records, setRecords] = useState(() => loadData())
  const [formData, setFormData] = useState({ data: todayStr(), peso: '', massaMagra: '' })
  const [formOpen, setFormOpen] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const peso = parseFloat(formData.peso)
    const massaMagra = parseFloat(formData.massaMagra)
    if (!formData.data || isNaN(peso) || isNaN(massaMagra) || peso <= 0 || massaMagra <= 0 || massaMagra > peso) return

    const percMassa = Math.round((massaMagra / peso) * 1000) / 10
    const percGordura = Math.round((100 - percMassa) * 10) / 10

    const entry = {
      data: formData.data,
      peso,
      massaMagra,
      percMassa,
      percGordura,
    }

    const existing = records.filter(r => r.data !== formData.data)
    const next = [...existing, entry].sort((a, b) => a.data.localeCompare(b.data))
    setRecords(next)
    saveData(next)
    setFormData({ data: todayStr(), peso: '', massaMagra: '' })
    setFormOpen(false)
  }

  function handleDelete(dateStr) {
    const next = records.filter(r => r.data !== dateStr)
    setRecords(next)
    saveData(next)
  }

  const latest = records.length > 0 ? records[records.length - 1] : null
  const chartData = records.map(r => ({
    label: fmtDate(r.data),
    peso: r.peso,
    massaMagra: r.massaMagra,
    percGordura: r.percGordura,
  }))

  const inputClass = 'w-full rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-all duration-150 focus:ring-2'

  return (
    <Page>
      <div className="flex flex-col min-h-full px-5 pt-10 pb-6">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-8">
          <h1 className="text-2xl font-semibold" style={{ color: '#2d2926' }}>Corpo</h1>
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-150 active:scale-95"
            style={{ backgroundColor: '#2d2926', color: '#f7f5f1' }}
          >
            {formOpen ? 'Cancelar' : '+ Registro'}
          </button>
        </div>

        {/* Form */}
        {formOpen && (
          <form onSubmit={handleSubmit} className="rounded-2xl px-5 py-5 mb-6 animate-[fadeIn_0.3s_ease-out]" style={{ backgroundColor: '#2d292608' }}>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-medium mb-1.5 block" style={{ color: '#2d2926', opacity: 0.4 }}>
                  Data
                </label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={e => setFormData(f => ({ ...f, data: e.target.value }))}
                  className={inputClass}
                  style={{ backgroundColor: '#2d292608', color: '#2d2926' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-medium mb-1.5 block" style={{ color: '#2d2926', opacity: 0.4 }}>
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    inputMode="decimal"
                    placeholder="80.0"
                    value={formData.peso}
                    onChange={e => setFormData(f => ({ ...f, peso: e.target.value }))}
                    className={inputClass}
                    style={{ backgroundColor: '#2d292608', color: '#2d2926' }}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-medium mb-1.5 block" style={{ color: '#2d2926', opacity: 0.4 }}>
                    Massa magra (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    inputMode="decimal"
                    placeholder="62.0"
                    value={formData.massaMagra}
                    onChange={e => setFormData(f => ({ ...f, massaMagra: e.target.value }))}
                    className={inputClass}
                    style={{ backgroundColor: '#2d292608', color: '#2d2926' }}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-1 w-full py-3 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98]"
                style={{ backgroundColor: '#2d2926', color: '#f7f5f1' }}
              >
                Salvar
              </button>
            </div>
          </form>
        )}

        {/* Stats cards */}
        {latest && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <StatCard label="Peso" value={latest.peso} unit="kg" />
            <StatCard label="Massa magra" value={latest.massaMagra} unit="kg" />
            <StatCard label="% Gordura" value={latest.percGordura} unit="%" />
            <StatCard label="% Massa magra" value={latest.percMassa} unit="%" />
          </div>
        )}

        {/* Charts */}
        {chartData.length >= 2 && (
          <div className="flex flex-col gap-4 mb-6">
            {CHARTS.map(c => (
              <MiniChart key={c.key} data={chartData} dataKey={c.key} label={c.label} />
            ))}
          </div>
        )}

        {/* Records list */}
        {records.length > 0 && (
          <div>
            <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: '#2d2926', opacity: 0.35 }}>
              Registros
            </p>
            <div className="flex flex-col gap-1.5">
              {[...records].reverse().map(r => (
                <div
                  key={r.data}
                  className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{ backgroundColor: '#2d292606' }}
                >
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 items-baseline min-w-0">
                    <span className="text-sm font-semibold tabular-nums" style={{ color: '#2d2926' }}>
                      {fmtDate(r.data)}
                    </span>
                    <span className="text-xs tabular-nums" style={{ color: '#2d2926', opacity: 0.5 }}>
                      {r.peso}kg
                    </span>
                    <span className="text-xs tabular-nums" style={{ color: '#2d2926', opacity: 0.5 }}>
                      {r.massaMagra}kg magra
                    </span>
                    <span className="text-xs tabular-nums" style={{ color: '#2d2926', opacity: 0.5 }}>
                      {r.percGordura}% gord
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(r.data)}
                    className="flex-shrink-0 p-2 -mr-1 rounded-lg transition-all duration-150 active:scale-90"
                    style={{ color: '#2d2926', opacity: 0.25 }}
                    title="Apagar registro"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {records.length === 0 && !formOpen && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2d2926" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.15 }} className="mb-4">
              <circle cx="12" cy="5" r="2" />
              <path d="M12 7v8M9 10l-3 4M15 10l3 4M9 21l3-6 3 6" />
            </svg>
            <p className="text-sm font-medium" style={{ color: '#2d2926', opacity: 0.35 }}>
              Sem registros ainda
            </p>
            <p className="text-xs mt-1" style={{ color: '#2d2926', opacity: 0.2 }}>
              Adiciona o teu primeiro registo para acompanhar a evolução.
            </p>
          </div>
        )}
      </div>
    </Page>
  )
}
