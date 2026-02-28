import { NavLink } from 'react-router-dom'

const navItems = [
  {
    to: '/exercicios',
    label: 'Exercícios',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 6.5h11M6.5 17.5h11M3 10h3v4H3zM18 10h3v4h-3z" />
        <line x1="6" y1="12" x2="18" y2="12" />
      </svg>
    ),
  },
  {
    to: '/corpo',
    label: 'Corpo',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v8M9 10l-3 4M15 10l3 4M9 21l3-6 3 6" />
      </svg>
    ),
  },
  {
    to: '/diario',
    label: 'Diário',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col flex-shrink-0 w-[220px] sticky top-0 h-svh"
        style={{ borderRight: '1px solid #E5E2DC', backgroundColor: '#F2F0EB' }}
      >
        <div className="px-6 pt-10 pb-8 flex flex-col h-full">
          <div className="mb-10">
            <span
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: '1.6rem', color: '#1A1916' }}
            >
              agora
            </span>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-[#F2F0EB]'
                      : 'text-[#1A1916] hover:bg-black/5'
                  }`
                }
                style={({ isActive }) => isActive ? { backgroundColor: '#1A1916' } : {}}
              >
                {icon}
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around items-start backdrop-blur-lg z-50"
        style={{
          borderTop: '1px solid #E5E2DC',
          backgroundColor: 'rgba(242, 240, 235, 0.88)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 min-w-[64px] py-2.5 transition-all duration-200 ${
                isActive ? 'opacity-100' : 'opacity-30'
              }`
            }
          >
            {icon}
            <span className="text-[10px] font-medium tracking-wide">{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
