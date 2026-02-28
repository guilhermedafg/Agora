import { useState, useEffect } from 'react'
import Page from '../components/Page'

const HABITS = [
  { id: 'pilates', label: 'Pilates' },
  { id: 'academia', label: 'Academia' },
  { id: 'corrida', label: 'Corrida' },
  { id: 'alimentacao', label: 'Alimentação' },
]

function todayKey() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `habitos-${yyyy}-${mm}-${dd}`
}

function loadState() {
  try {
    const raw = localStorage.getItem(todayKey())
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return {}
}

function saveState(state) {
  try {
    localStorage.setItem(todayKey(), JSON.stringify(state))
  } catch (_) {}
}

export default function Hoje() {
  const [checked, setChecked] = useState(() => loadState())

  // Reset if day changed (tab left open overnight)
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        setChecked(loadState())
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  function toggle(id) {
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] }
      saveState(next)
      return next
    })
  }

  const done = HABITS.filter(h => checked[h.id]).length
  const total = HABITS.length
  const allDone = done === total
  const progress = (done / total) * 100

  return (
    <Page>
      <div className="flex flex-col min-h-full px-5 pt-10 pb-6">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-medium tracking-widest uppercase opacity-40 mb-1">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-2xl font-semibold" style={{ color: '#2d2926' }}>
            Hoje
          </h1>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm font-medium" style={{ color: '#2d2926' }}>
              Hábitos
            </span>
            <span className="text-sm font-medium tabular-nums" style={{ color: '#2d2926', opacity: 0.5 }}>
              {done}/{total}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#2d292618' }}>
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%`, backgroundColor: '#2d2926' }}
            />
          </div>
        </div>

        {/* Checklist */}
        <ul className="flex flex-col gap-1">
          {HABITS.map(({ id, label }) => {
            const isChecked = !!checked[id]
            return (
              <li key={id}>
                <button
                  onClick={() => toggle(id)}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 active:scale-[0.98]"
                  style={{
                    backgroundColor: isChecked ? '#2d292610' : '#2d292606',
                  }}
                >
                  {/* Checkbox */}
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                    style={{
                      borderColor: isChecked ? '#2d2926' : '#2d292640',
                      backgroundColor: isChecked ? '#2d2926' : 'transparent',
                    }}
                  >
                    {isChecked && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="#f7f5f1"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>

                  {/* Label */}
                  <span
                    className="text-base font-medium transition-all duration-200"
                    style={{
                      color: '#2d2926',
                      opacity: isChecked ? 0.35 : 1,
                      textDecoration: isChecked ? 'line-through' : 'none',
                    }}
                  >
                    {label}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        {/* Encouragement when nothing done yet */}
        {done === 0 && (
          <p className="text-center text-sm mt-8" style={{ color: '#2d2926', opacity: 0.3 }}>
            Um hábito de cada vez. Começa pelo mais fácil.
          </p>
        )}

        {/* Congratulations */}
        {allDone && (
          <div
            className="mt-8 px-5 py-5 rounded-2xl text-center animate-[fadeIn_0.4s_ease-out]"
            style={{ backgroundColor: '#2d292610' }}
          >
            <p className="text-lg font-semibold" style={{ color: '#2d2926' }}>
              Dia completo
            </p>
            <p className="text-sm mt-1" style={{ color: '#2d2926', opacity: 0.5 }}>
              Todos os hábitos concluídos. Bom trabalho.
            </p>
          </div>
        )}
      </div>
    </Page>
  )
}
