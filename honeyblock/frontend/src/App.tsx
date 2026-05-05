import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
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

// Sidebar order — drives slide direction. Going further down the list = forward.
const PAGE_ORDER = ['/', '/blocking', '/configurations']

// iOS-style smooth ease-out (matches what most native dashboards use).
const SLIDE_MS = 360
const SLIDE_EASING = 'cubic-bezier(0.32, 0.72, 0, 1)'

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
          width: 176,
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

/**
 * PageStack — single sliding track that holds all pages side-by-side and
 * translates as ONE element. This is the classic iOS / Linear / mobile-app
 * pattern for buttery navigation:
 *
 *   ┌──────────────────────── viewport ────────────────────────┐
 *   │ ┌─────────────┬─────────────┬─────────────────┐ <- track │
 *   │ │  Dashboard  │  Blocking   │ Configurations  │   (300%) │
 *   │ └─────────────┴─────────────┴─────────────────┘          │
 *   └──────────────────────────────────────────────────────────┘
 *                  (the track slides left/right)
 *
 * Why this is smooth:
 *  • Pages mount once and stay alive forever — no re-mounting heavy charts /
 *    maps / polling effects on every navigation. Returning to Dashboard is
 *    free, no flash.
 *  • A single CSS transition on a single transform property. The browser
 *    composites this entirely on the GPU; no JS animation orchestration.
 *  • Lazy-mounted: pages aren't created until their first visit, so initial
 *    load isn't bloated.
 */
function PageStack({ currentPath }: { currentPath: string }) {
  // Track which pages have ever been visited, so we lazy-mount on first visit
  // but keep them alive thereafter. Setting state during render is OK in
  // React 18+ as long as it's guarded — this just schedules an immediate
  // re-render so the new page mounts before the slide starts.
  const [visited, setVisited] = useState<Set<string>>(() => new Set([currentPath]))
  if (!visited.has(currentPath)) {
    setVisited(prev => new Set([...prev, currentPath]))
  }

  const currentIdx = Math.max(0, PAGE_ORDER.indexOf(currentPath))
  const N = PAGE_ORDER.length
  // Each page slot is 1/N of the track's width, so translating the track by
  // -(currentIdx / N) of its own width brings the active slot into view.
  const trackTranslate = -(currentIdx * 100) / N

  const slotStyle = (pagePath: string): React.CSSProperties => ({
    width: `${100 / N}%`,
    height: '100%',
    flexShrink: 0,
    padding: 18,
    overflowY: pagePath === currentPath ? 'auto' : 'hidden',
    pointerEvents: pagePath === currentPath ? 'auto' : 'none',
  })

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          height: '100%',
          width: `${100 * N}%`,
          transform: `translate3d(${trackTranslate}%, 0, 0)`,
          transition: `transform ${SLIDE_MS}ms ${SLIDE_EASING}`,
          willChange: 'transform',
          backfaceVisibility: 'hidden',
        }}
      >
        <div style={slotStyle('/')} aria-hidden={currentPath !== '/'}>
          {visited.has('/') && <Dashboard />}
        </div>
        <div style={slotStyle('/blocking')} aria-hidden={currentPath !== '/blocking'}>
          {visited.has('/blocking') && <Blocking />}
        </div>
        <div style={slotStyle('/configurations')} aria-hidden={currentPath !== '/configurations'}>
          {visited.has('/configurations') && <Configurations />}
        </div>
      </div>
    </div>
  )
}

function App() {
  const { theme } = useTheme()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [cowrieRunning, setCowrieRunning] = useState<boolean | null>(null)
  const [watcherRunning, setWatcherRunning] = useState<boolean | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    let cancelled = false
    const fetchStatus = async () => {
      try {
        const [cowrieRes, watcherRes] = await Promise.all([
          fetch('/api/cowrie/status'),
          fetch('/api/watcher/status'),
        ])
        if (cowrieRes.ok) {
          const data = await cowrieRes.json()
          if (!cancelled) setCowrieRunning(!!data.running)
        }
        if (watcherRes.ok) {
          const data = await watcherRes.json()
          if (!cancelled) setWatcherRunning(!!data.running)
        }
      } catch {
        // retry next tick
      }
    }
    fetchStatus()
    const id = setInterval(fetchStatus, 10_000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  if (loading) return <Skeleton />

  const pageLabel = PAGE_LABELS[location.pathname] ?? 'Dashboard'
  const statusPill = (
    running: boolean | null,
    label: string,
  ): { color: string; text: string; tooltip: string } => {
    if (running === null) {
      return { color: theme.textTertiary, text: `${label} · Checking…`, tooltip: `${label} status unknown` }
    }
    if (running) {
      return { color: theme.success, text: `${label} · Running`, tooltip: `${label} is running` }
    }
    return { color: theme.error, text: `${label} · Stopped`, tooltip: `${label} is stopped` }
  }
  const cowriePill = statusPill(cowrieRunning, 'Cowrie')
  const watcherPill = statusPill(watcherRunning, 'Watcher')

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {[
              { pill: cowriePill, running: cowrieRunning },
              { pill: watcherPill, running: watcherRunning },
            ].map(({ pill, running }, i) => (
              <div
                key={i}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                title={pill.tooltip}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: pill.color,
                    color: pill.color,
                    animation: running ? 'pulse-dot 2s infinite' : undefined,
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    color: pill.color,
                    fontFamily: "'JetBrains Mono', 'Consolas', monospace",
                  }}
                >
                  {pill.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <main style={{ flex: 1, overflow: 'hidden', position: 'relative', minHeight: 0 }}>
          <PageStack currentPath={location.pathname} />
        </main>
      </div>
    </div>
  )
}

export default App
