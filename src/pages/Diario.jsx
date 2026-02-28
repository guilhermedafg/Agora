import { useState, useRef, useEffect } from 'react'
import Page from '../components/Page'

const STORAGE_KEY = 'diario'

function useIsDesktop() {
  const [v, setV] = useState(() => window.innerWidth >= 768)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const fn = e => setV(e.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return v
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function fmtDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return []
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch (_) {}
}

function preview(text, len = 100) {
  if (text.length <= len) return text
  return text.slice(0, len).trimEnd() + '\u2026'
}

export default function Diario() {
  const isDesktop = useIsDesktop()

  const [entries, setEntries] = useState(() => loadData())
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ data: todayStr(), texto: '' })
  const [expandedId, setExpandedId] = useState(null)   // mobile only
  const [selectedId, setSelectedId] = useState(null)   // desktop only
  const [search, setSearch] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    if ((formOpen || editingId) && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [formOpen, editingId])

  const selectedEntry = entries.find(e => e.id === selectedId) || null

  function persist(next) {
    setEntries(next)
    saveData(next)
  }

  function openNew() {
    setEditingId(null)
    setFormData({ data: todayStr(), texto: '' })
    setFormOpen(true)
    setExpandedId(null)
  }

  function openEdit(entry) {
    setFormOpen(false)
    setEditingId(entry.id)
    setFormData({ data: entry.data, texto: entry.texto })
    setExpandedId(null)
    setSelectedId(entry.id)
  }

  function cancel() {
    setFormOpen(false)
    setEditingId(null)
    setFormData({ data: todayStr(), texto: '' })
  }

  function handleSave(e) {
    e.preventDefault()
    const texto = formData.texto.trim()
    if (!formData.data || !texto) return

    if (editingId) {
      const next = entries.map(ent =>
        ent.id === editingId ? { ...ent, data: formData.data, texto } : ent
      )
      persist(next)
      setEditingId(null)
    } else {
      const newId = Date.now()
      const entry = { id: newId, data: formData.data, texto }
      persist([entry, ...entries])
      setFormOpen(false)
      setSelectedId(newId)
    }
    setFormData({ data: todayStr(), texto: '' })
  }

  function handleDelete(id) {
    persist(entries.filter(e => e.id !== id))
    if (expandedId === id) setExpandedId(null)
    if (editingId === id) cancel()
    if (selectedId === id) setSelectedId(null)
  }

  const sorted = [...entries].sort((a, b) => {
    const cmp = b.data.localeCompare(a.data)
    return cmp !== 0 ? cmp : b.id - a.id
  })

  const q = search.toLowerCase().trim()
  const filtered = q
    ? sorted.filter(e => e.texto.toLowerCase().includes(q) || e.data.includes(q))
    : sorted

  const inputStyle = { backgroundColor: 'rgba(26,25,22,0.04)', color: '#1A1916', border: '1px solid #E5E2DC' }
  const inputClass = 'w-full rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-all duration-150 focus:ring-2 focus:ring-[#1A1916]/20'

  function renderForm(isEdit) {
    return (
      <form
        onSubmit={handleSave}
        className="rounded-lg px-5 py-5 mb-4 bg-white shadow-sm animate-[fadeIn_0.3s_ease-out]"
      >
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-medium mb-1.5 block" style={{ color: '#1A1916', opacity: 0.4 }}>
              Data
            </label>
            <input
              type="date"
              value={formData.data}
              onChange={e => setFormData(f => ({ ...f, data: e.target.value }))}
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-medium mb-1.5 block" style={{ color: '#1A1916', opacity: 0.4 }}>
              Anotações
            </label>
            <textarea
              ref={textareaRef}
              rows={isDesktop ? 10 : 5}
              value={formData.texto}
              onChange={e => setFormData(f => ({ ...f, texto: e.target.value }))}
              placeholder="Escreve aqui..."
              className={`${inputClass} resize-none leading-relaxed`}
              style={inputStyle}
            />
          </div>
          <div className="flex gap-2 mt-1">
            <button
              type="submit"
              className="flex-1 py-3 rounded-lg text-sm font-semibold transition-all duration-150 active:scale-[0.98]"
              style={{ backgroundColor: '#1A1916', color: '#F2F0EB' }}
            >
              {isEdit ? 'Atualizar' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="px-5 py-3 rounded-lg text-sm font-medium transition-all duration-150 active:scale-[0.98]"
              style={{ backgroundColor: 'rgba(26,25,22,0.06)', color: '#1A1916' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
    )
  }

  /* -------- Search bar -------- */
  function renderSearch() {
    return (
      <div className="mb-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#1A1916" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ opacity: 0.25 }}
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar nas sessões..."
            className="w-full rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none transition-all duration-150 focus:ring-2 focus:ring-[#1A1916]/20"
            style={inputStyle}
          />
        </div>
      </div>
    )
  }

  return (
    <Page>
      <div className="flex flex-col md:flex-row min-h-full">

        {/* ===== LEFT PANEL ===== */}
        <div
          className="flex flex-col px-5 pt-10 pb-6 md:w-[300px] md:flex-shrink-0 md:overflow-y-auto"
          style={{ borderRight: isDesktop ? '1px solid #E5E2DC' : 'none' }}
        >
          {/* Header */}
          <div className="flex items-baseline justify-between mb-6">
            <h1
              className="text-4xl md:text-5xl"
              style={{ color: '#1A1916', fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
            >
              Diário
            </h1>
            {!(formOpen || editingId) && (
              <button
                onClick={openNew}
                className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-150 active:scale-95"
                style={{ backgroundColor: '#1A1916', color: '#F2F0EB' }}
              >
                + Sessão
              </button>
            )}
          </div>

          {/* Mobile: new form inline */}
          {formOpen && !isDesktop && renderForm(false)}

          {/* Search — always on desktop, hidden on mobile when form is active */}
          {entries.length > 0 && (isDesktop || (!formOpen && !editingId)) && renderSearch()}

          {/* Entries list */}
          {filtered.length > 0 && (
            <div className="flex flex-col gap-2">
              {filtered.map(entry => {
                const isExpanded = expandedId === entry.id
                const isEditing = editingId === entry.id
                const isSelected = selectedId === entry.id

                // Mobile inline edit
                if (isEditing && !isDesktop) {
                  return <div key={entry.id}>{renderForm(true)}</div>
                }

                return (
                  <div
                    key={entry.id}
                    className={`rounded-lg px-5 py-4 bg-white shadow-sm transition-all duration-150 ${
                      isSelected ? 'ring-1 ring-[#1A1916]/25' : ''
                    }`}
                  >
                    <button
                      onClick={() => {
                        if (isDesktop) {
                          setSelectedId(entry.id)
                          setFormOpen(false)
                          setEditingId(null)
                        } else {
                          setExpandedId(isExpanded ? null : entry.id)
                        }
                      }}
                      className="w-full text-left"
                    >
                      <p className="text-[10px] uppercase tracking-widest font-medium mb-1.5" style={{ color: '#1A1916', opacity: 0.35 }}>
                        {fmtDate(entry.data)}
                      </p>
                      <p
                        className="text-sm leading-relaxed whitespace-pre-line"
                        style={{ color: '#1A1916', opacity: isExpanded ? 1 : 0.6 }}
                      >
                        {isDesktop
                          ? preview(entry.texto, 80)
                          : isExpanded ? entry.texto : preview(entry.texto)}
                      </p>
                    </button>

                    {/* Mobile expanded actions */}
                    {isExpanded && !isDesktop && (
                      <div className="flex gap-4 mt-3 pt-3" style={{ borderTop: '1px solid #E5E2DC' }}>
                        <button
                          onClick={() => openEdit(entry)}
                          className="text-xs font-medium py-1 transition-all duration-150 active:scale-95"
                          style={{ color: '#1A1916', opacity: 0.35 }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-xs font-medium py-1 transition-all duration-150 active:scale-95"
                          style={{ color: '#1A1916', opacity: 0.35 }}
                        >
                          Apagar
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Search empty */}
          {entries.length > 0 && filtered.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm" style={{ color: '#1A1916', opacity: 0.25 }}>
                Nenhum resultado para &ldquo;{search}&rdquo;
              </p>
            </div>
          )}

          {/* Empty state (mobile) */}
          {entries.length === 0 && !formOpen && !isDesktop && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1A1916" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.15 }} className="mb-4">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <p className="text-sm font-medium" style={{ color: '#1A1916', opacity: 0.35 }}>
                Nenhuma sessão ainda
              </p>
              <p className="text-xs mt-1" style={{ color: '#1A1916', opacity: 0.2 }}>
                Escreve o que quiseres. Isto é só teu.
              </p>
            </div>
          )}
        </div>

        {/* ===== RIGHT PANEL (desktop only) ===== */}
        {isDesktop && (
          <div className="flex-1 flex flex-col px-10 pt-10 pb-6">
            {(formOpen || editingId) ? (
              <div className="max-w-[500px]">
                {renderForm(!!editingId)}
              </div>
            ) : selectedEntry ? (
              <div className="max-w-[640px] animate-[fadeIn_0.2s_ease-out]">
                <p
                  className="text-[10px] uppercase tracking-widest font-medium mb-5"
                  style={{ color: '#1A1916', opacity: 0.35 }}
                >
                  {fmtDate(selectedEntry.data)}
                </p>
                <p
                  className="text-base leading-relaxed whitespace-pre-line"
                  style={{ color: '#1A1916' }}
                >
                  {selectedEntry.texto}
                </p>
                <div
                  className="flex gap-4 mt-10 pt-6"
                  style={{ borderTop: '1px solid #E5E2DC' }}
                >
                  <button
                    onClick={() => openEdit(selectedEntry)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-150 active:scale-95"
                    style={{ backgroundColor: '#1A1916', color: '#F2F0EB' }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(selectedEntry.id)}
                    className="text-xs font-medium py-1.5 px-3 rounded-full transition-all duration-150 active:scale-95"
                    style={{ backgroundColor: 'rgba(26,25,22,0.06)', color: '#1A1916' }}
                  >
                    Apagar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-24">
                {entries.length === 0 ? (
                  <>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1A1916" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.15 }} className="mb-4">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    <p className="text-sm font-medium" style={{ color: '#1A1916', opacity: 0.35 }}>
                      Nenhuma sessão ainda
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#1A1916', opacity: 0.2 }}>
                      Escreve o que quiseres. Isto é só teu.
                    </p>
                  </>
                ) : (
                  <p className="text-sm" style={{ color: '#1A1916', opacity: 0.25 }}>
                    Seleciona uma sessão para ler
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Page>
  )
}
