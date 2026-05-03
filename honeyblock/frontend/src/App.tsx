import { useEffect, useState, useRef } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useTheme } from './theme'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Blocking from './pages/Blocking'
import Configurations from './pages/Configurations'

const PAGE_LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/blocking': 'Blocking',
  '/configurations': 'Configurations',
}

function Skeleton() {
  const { theme } = useTheme()

  const shimmer = (w: number | string, h: number, r: number = 6, extra: React.CSSProperties = {}): React.CSSProperties => ({
    width: w,
    height: h,
    borderRadius: r,
    background: `linear-gradient(90deg, ${theme.cardBg} 25%, ${theme.cardHoverBg} 50%, ${theme.cardBg} 75%)`,
    backgroundSize: '600px 100%',
    animation: 'shimmer 1.4s infinite linear',
    flexShrink: 0,
    ...extra,
  })

  return (
    <div style={{ display: 'flex', height: '100vh', background: theme.pageBg, overflow: 'hidden' }}>
      {/* Sidebar skeleton */}
      <div
        style={{
          width: 200,
          height: '100vh',
          background: theme.sidebarBg,
          borderRight: `1px solid ${theme.sidebarBorder}`,
          padding: '20px 14px',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        <div style={{ paddingBottom: 18, borderBottom: `1px solid ${theme.sidebarBorder}`, marginBottom: 14 }}>
          <div style={shimmer(110, 22, 4)} />
          <div style={{ ...shimmer(50, 10, 3), marginTop: 6 }} />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            paddingBottom: 14,
            borderBottom: `1px solid ${theme.sidebarBorder}`,
            marginBottom: 14,
          }}
        >
          <div style={shimmer(8, 8, 999)} />
          <div style={shimmer(100, 10, 3)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[80, 65, 90].map((w, i) => (
            <div
              key={i}
              style={{
                padding: '9px 12px',
                borderRadius: 8,
                background: i === 0 ? `${theme.brand}08` : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 9,
              }}
            >
              <div style={shimmer(16, 16, 4)} />
              <div style={shimmer(w, 11, 3)} />
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 'auto',
            padding: '14px 8px 0',
            borderTop: `1px solid ${theme.sidebarBorder}`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div style={shimmer(28, 28, 7)} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={shimmer(55, 11, 3)} />
            <div style={shimmer(80, 9, 3)} />
          </div>
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <div
          style={{
            height: 44,
            flexShrink: 0,
            background: theme.sidebarBg,
            borderBottom: `1px solid ${theme.sidebarBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
          }}
        >
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={shimmer(60, 10, 3)} />
            <div style={shimmer(6, 10, 2)} />
            <div style={shimmer(80, 10, 3)} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2, 3].map(i => <div key={i} style={shimmer(36, 36, 8)} />)}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={shimmer(120, 22, 5)} />
              <div style={shimmer(70, 22, 5)} />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3].map(i => <div key={i} style={shimmer(36, 36, 8)} />)}
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                style={{
                  background: theme.cardBg,
                  border: `1px solid ${theme.cardBorder}`,
                  borderRadius: 10,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <div style={shimmer(40, 40, 9)} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={shimmer(52, 22, 4)} />
                  <div style={shimmer(80, 9, 3)} />
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10, flex: 1, minHeight: 0 }}>
            <div style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 10, padding: 14 }}>
              <div style={{ ...shimmer(100, 12, 3), marginBottom: 16 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {[80, 55, 70, 40, 60].map((w, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={shimmer(108, 11, 3)} />
                    <div style={{ flex: 1, height: 18, borderRadius: 4, background: theme.cardBorder, overflow: 'hidden' }}>
                      <div style={{ ...shimmer(`${w}%`, 18, 4), width: `${w}%` }} />
                    </div>
                    <div style={shimmer(24, 11, 3)} />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 10, padding: 14 }}>
              <div style={{ ...shimmer(130, 12, 3), marginBottom: 12 }} />
              <div style={{ ...shimmer('100%', 0, 8), height: 'calc(100% - 30px)' }} />
            </div>
          </div>

          {/* Tables */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, flex: 1, minHeight: 0 }}>
            {[1, 2, 3].map(col => (
              <div
                key={col}
                style={{
                  background: theme.cardBg,
                  border: `1px solid ${theme.cardBorder}`,
                  borderRadius: 10,
                  padding: 14,
                  overflow: 'hidden',
                }}
              >
                <div style={{ ...shimmer(90, 12, 3), marginBottom: 12 }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '7px 12px',
                      background: theme.tableHeaderBg,
                      borderBottom: `1px solid ${theme.cardBorder}`,
                    }}
                  >
                    <div style={shimmer(60, 9, 2)} />
                    <div style={shimmer(30, 9, 2)} />
                  </div>
                  {[1, 2, 3, 4, 5, 6, 7].map(r => (
                    <div
                      key={r}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderBottom: `1px solid ${theme.cardBorder}`,
                        background: r % 2 === 0 ? theme.tableRowOdd : theme.tableRowEven,
                      }}
                    >
                      <div style={shimmer(r % 2 ? 55 : 70, 10, 3)} />
                      <div style={shimmer(25, 10, 3)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [visible, setVisible] = useState(false)
  const [displayKey, setDisplayKey] = useState(location.pathname)
  const [content, setContent] = useState(children)
  const childrenRef = useRef(children)
  childrenRef.current = children

  useEffect(() => {
    if (location.pathname === displayKey) {
      setVisible(true)
      return
    }
    setVisible(false)
    const t = setTimeout(() => {
      setDisplayKey(location.pathname)
      setContent(childrenRef.current)
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    }, 180)
    return () => clearTimeout(t)
  }, [location.pathname, displayKey])

  // Keep latest content for the same page (data refreshes etc.)
  useEffect(() => {
    if (location.pathname === displayKey) setContent(children)
  }, [children, location.pathname, displayKey])

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.22s ease, transform 0.22s ease',
        height: '100%',
      }}
    >
      {content}
    </div>
  )
}

function App() {
  const { theme } = useTheme()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [cowrieRunning, setCowrieRunning] = useState<boolean | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    let cancelled = false
    const fetchCowrie = async () => {
      try {
        const res = await fetch('/api/cowrie/status')
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setCowrieRunning(!!data.running)
      } catch {
        // retry next tick
      }
    }
    fetchCowrie()
    const id = setInterval(fetchCowrie, 10_000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  if (loading) return <Skeleton />

  const pageLabel = PAGE_LABELS[location.pathname] ?? 'Dashboard'
  const cowrieColor =
    cowrieRunning === null ? theme.textTertiary : cowrieRunning ? theme.success : theme.error
  const cowrieLabel =
    cowrieRunning === null ? 'Checking…' : cowrieRunning ? 'Cowrie · Running' : 'Cowrie · Stopped'

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: theme.pageBg,
        color: theme.textPrimary,
      }}
    >
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Topbar */}
        <div
          style={{
            height: 44,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            borderBottom: `1px solid ${theme.sidebarBorder}`,
            background: theme.sidebarBg,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: theme.textTertiary, fontSize: 12 }}>HoneyBlock</span>
            <span style={{ color: theme.textTertiary, fontSize: 12 }}>/</span>
            <span style={{ color: theme.heading, fontSize: 12, fontWeight: 600 }}>{pageLabel}</span>
          </div>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            title={cowrieRunning === null ? 'Cowrie status unknown' : cowrieRunning ? 'Cowrie honeypot is running' : 'Cowrie honeypot is stopped'}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: cowrieColor,
                color: cowrieColor,
                animation: cowrieRunning ? 'pulse-dot 2s infinite' : undefined,
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: cowrieRunning === null ? theme.textTertiary : cowrieColor,
                fontFamily: "'JetBrains Mono', 'Consolas', monospace",
              }}
            >
              {cowrieLabel}
            </span>
          </div>
        </div>

        <main style={{ flex: 1, padding: 18, overflowY: 'auto' }}>
          <PageWrapper>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/blocking" element={<Blocking />} />
              <Route path="/configurations" element={<Configurations />} />
            </Routes>
          </PageWrapper>
        </main>
      </div>
    </div>
  )
}

export default App
