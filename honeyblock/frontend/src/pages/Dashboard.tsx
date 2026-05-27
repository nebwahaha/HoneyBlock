import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { Stats, Attacker } from '../types'
import { useTheme } from '../theme'
import TotalSessionsCard from '../components/TotalSessionsCard'
import TopAttackersChart from '../components/TopAttackersChart'
import AttackerActivityModal from '../components/AttackerActivityModal'
import AttackMap from '../components/AttackMap'
import LiveFeed from '../components/LiveFeed'
import CountryPieChart from '../components/CountryPieChart'
import StatCardPopup from '../components/StatCardPopup'
import ProtocolChart from '../components/ProtocolChart'
import EventsHistogram from '../components/EventsHistogram'
import NotificationBell from '../components/NotificationBell'
const REFRESH_SKELETON_MS = 1500

// Match App.tsx's page-slide easing/duration so card swaps feel like the same animation.
const SLIDE_MS = 360
const SLIDE_EASING = 'cubic-bezier(0.32, 0.72, 0, 1)'

/**
 * SlideSwap — same single-track pattern as App.tsx's PageStack, scoped to
 * a card. Both panels are mounted side-by-side and the track translates as
 * one element so the GPU composites the slide. Lazy-mount: a panel isn't
 * created until its first activation.
 */
function SlideSwap({
  active,
  panels,
}: {
  active: number
  panels: Array<{ key: string; render: () => React.ReactNode; scroll?: boolean }>
}) {
  const [visited, setVisited] = useState<Set<string>>(() => new Set([panels[active].key]))
  if (!visited.has(panels[active].key)) {
    setVisited(prev => new Set([...prev, panels[active].key]))
  }
  const N = panels.length
  const trackTranslate = -(active * 100) / N
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          width: `${N * 100}%`,
          height: '100%',
          transform: `translate3d(${trackTranslate}%, 0, 0)`,
          transition: `transform ${SLIDE_MS}ms ${SLIDE_EASING}`,
          willChange: 'transform',
          backfaceVisibility: 'hidden',
        }}
      >
        {panels.map((p, i) => (
          <div
            key={p.key}
            aria-hidden={i !== active}
            style={{
              width: `${100 / N}%`,
              height: '100%',
              flexShrink: 0,
              overflowY: p.scroll ? (i === active ? 'auto' : 'hidden') : 'visible',
              overflowX: 'hidden',
              pointerEvents: i === active ? 'auto' : 'none',
            }}
          >
            {visited.has(p.key) && p.render()}
          </div>
        ))}
      </div>
    </div>
  )
}

function DashboardSkeleton() {
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

  const card: React.CSSProperties = {
    background: theme.cardBg,
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: 10,
    padding: 14,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
      {/* Toolbar skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={shimmer(140, 14, 4)} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1, 2, 3, 4].map(i => <div key={i} style={shimmer(36, 36, 8)} />)}
        </div>
      </div>

      {/* Stat cards skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            style={{
              ...card,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div style={shimmer(40, 40, 9)} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={shimmer(58, 22, 4)} />
              <div style={shimmer(82, 9, 3)} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts row skeleton (1fr + 2fr to mirror Dashboard layout) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, flex: 1, minHeight: 0 }}>
        <div style={{ ...card, display: 'flex', flexDirection: 'column' }}>
          <div style={{ ...shimmer(120, 12, 3), marginBottom: 14 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1, justifyContent: 'center' }}>
            {[80, 55, 70, 40, 60].map((w, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={shimmer(96, 11, 3)} />
                <div style={{ flex: 1, height: 18, borderRadius: 4, background: theme.cardBorder, overflow: 'hidden' }}>
                  <div style={{ ...shimmer(`${w}%`, 18, 4), width: `${w}%` }} />
                </div>
                <div style={shimmer(24, 11, 3)} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ ...card, gridColumn: 'span 2', display: 'flex', flexDirection: 'column' }}>
          <div style={{ ...shimmer(140, 12, 3), marginBottom: 12 }} />
          <div style={{ ...shimmer('100%', 0, 8), flex: 1 }} />
        </div>
      </div>

      {/* Tables row skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, flex: 1, minHeight: 0 }}>
        {[1, 2, 3].map(col => (
          <div key={col} style={{ ...card, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ ...shimmer(110, 12, 3), marginBottom: 12 }} />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '7px 12px',
                background: theme.tableHeaderBg,
                borderBottom: `1px solid ${theme.cardBorder}`,
                marginLeft: -14,
                marginRight: -14,
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
                  marginLeft: -14,
                  marginRight: -14,
                }}
              >
                <div style={shimmer(r % 2 ? 55 : 70, 10, 3)} />
                <div style={shimmer(25, 10, 3)} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function Dashboard() {
  const { theme } = useTheme()
  const [stats, setStats] = useState<Stats | null>(null)
  const [attackers, setAttackers] = useState<Attacker[]>([])
  const [activeSessions, setActiveSessions] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [selectedAttackerIp, setSelectedAttackerIp] = useState<string | null>(null)
  const [selectedLiveIp, setSelectedLiveIp] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [liveFeedOpen, setLiveFeedOpen] = useState(false)
  const [showProtocol, setShowProtocol] = useState(false)
  const [showCountries, setShowCountries] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)
  const [logCount, setLogCount] = useState(0)
  const [seenLogCount, setSeenLogCount] = useState(0)
  const [timeRange, setTimeRange] = useState<string>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const [drawerHeight, setDrawerHeight] = useState(50) // percentage of vh
  const isDragging = useRef(false)

  const hasNewLogs = logCount > 0 && logCount > seenLogCount

  const handleManualRefresh = () => {
    if (refreshing) return
    setRefreshing(true)
    fetchData()
    setTimeout(() => setRefreshing(false), REFRESH_SKELETON_MS)
  }

  const handleLogsToggle = () => {
    if (!liveFeedOpen) {
      setSeenLogCount(logCount)
    }
    setLiveFeedOpen(!liveFeedOpen)
  }

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    const startY = e.clientY
    const startHeight = drawerHeight

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current) return
      const delta = startY - ev.clientY
      const newHeight = Math.min(90, Math.max(15, startHeight + (delta / window.innerHeight) * 100))
      setDrawerHeight(newHeight)
    }

    const onMouseUp = () => {
      isDragging.current = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  // Poll log count for badge
  useEffect(() => {
    const checkLogs = async () => {
      try {
        const res = await fetch('/api/logs?limit=1')
        if (res.ok) {
          const data = await res.json()
          const total = data.total ?? (data.data ?? []).length
          setLogCount(total)
        }
      } catch { /* ignore */ }
    }
    checkLogs()
    const interval = setInterval(checkLogs, 10_000)
    return () => clearInterval(interval)
  }, [])

  // Close filter dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const fetchData = async () => {
    const rangeParam = timeRange !== 'all' ? `?range=${timeRange}` : ''
    try {
      const [statsRes, attackersRes, activeRes] = await Promise.all([
        fetch(`/api/stats${rangeParam}`),
        fetch(`/api/attackers${rangeParam}`),
        fetch('/api/active-sessions'),
      ])

      if (statsRes.ok) {
        const data: Stats = await statsRes.json()
        setStats(data)
      }
      if (attackersRes.ok) {
        const data: Attacker[] = await attackersRes.json()
        setAttackers(data)
      }
      if (activeRes.ok) {
        const data = await activeRes.json()
        setActiveSessions((data ?? []).length)
      }

      setLastUpdated(new Date().toLocaleTimeString())
    } catch {
      // silently retry on next interval
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15_000)
    return () => clearInterval(interval)
  }, [timeRange])

  const cardStyle: React.CSSProperties = {
    background: theme.cardBg,
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: 10,
    padding: 14,
  }

  const h3Style: React.CSSProperties = {
    color: theme.heading,
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 10,
  }

  const thStyle: React.CSSProperties = {
    padding: '8px 12px',
    color: theme.textTertiary,
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    background: theme.tableHeaderBg,
    borderBottom: `1px solid ${theme.cardBorder}`,
  }

  const tdStyle: React.CSSProperties = {
    padding: '8px 12px',
    color: theme.textPrimary,
    fontSize: 12,
    borderBottom: `1px solid ${theme.cardBorder}`,
  }

  const renderTopList = (
    entries: Array<{ value: string; count: number }>,
    accent: string,
  ) => {
    if (entries.length === 0) {
      return (
        <div style={{ padding: '16px 12px', color: theme.textSecondary, fontSize: 13, textAlign: 'center' }}>
          No data yet.
        </div>
      )
    }
    const max = entries[0]?.count || 1
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {entries.map((e, i) => {
          const pct = Math.max(2, (e.count / max) * 100)
          return (
            <div key={i} style={{ position: 'relative', padding: '7px 10px', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', top: 0, bottom: 0, left: 0,
                width: `${pct}%`,
                background: `${accent}1c`,
                borderLeft: `2px solid ${accent}`,
                borderRadius: 4,
                pointerEvents: 'none',
              }} />
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  flex: 1, color: theme.textPrimary, fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {e.value || <span style={{ color: theme.textTertiary, fontStyle: 'italic' }}>(empty)</span>}
                </span>
                <span style={{
                  color: accent, fontSize: 11, fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                  background: `${accent}15`, padding: '2px 8px', borderRadius: 10,
                }}>{e.count.toLocaleString()}</span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (loading || refreshing) {
    return <DashboardSkeleton />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: theme.textSecondary, fontSize: 12 }}>Last updated: {lastUpdated}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Time range filter */}
          <div ref={filterRef} data-onboarding="dash-time-filter" style={{ position: 'relative' }}>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              style={{
                height: 36,
                borderRadius: 8,
                background: theme.btnBg,
                border: `1px solid ${theme.btnBorder}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '0 12px',
                color: theme.btnText,
                fontSize: 12,
                fontWeight: 600,
                transition: 'all 0.15s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {{ all: 'All Time', today: 'Today', week: 'Week', month: 'Month', year: 'Year' }[timeRange]}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {filterOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  background: theme.cardBg,
                  border: `1px solid ${theme.cardBorder}`,
                  borderRadius: 10,
                  padding: 4,
                  zIndex: 999,
                  minWidth: 140,
                  boxShadow: `0 8px 24px ${theme.shadow}`,
                }}
              >
                {(['all', 'today', 'week', 'month', 'year'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setTimeRange(opt); setFilterOpen(false) }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      border: 'none',
                      borderRadius: 6,
                      background: timeRange === opt ? theme.navActiveBg : 'transparent',
                      color: timeRange === opt ? theme.navActiveText : theme.textPrimary,
                      fontSize: 13,
                      fontWeight: timeRange === opt ? 700 : 500,
                      cursor: 'pointer',
                    }}
                  >
                    {{ all: 'All Time', today: 'Today', week: 'This Week', month: 'This Month', year: 'This Year' }[opt]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            title="Refresh"
            data-onboarding="dash-refresh"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: theme.btnBg,
              border: `1px solid ${theme.btnBorder}`,
              cursor: refreshing ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: refreshing ? theme.brand : theme.btnText,
              transition: 'all 0.15s',
              opacity: refreshing ? 0.85 : 1,
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                animation: refreshing ? 'spin 0.9s linear infinite' : undefined,
                transformOrigin: 'center',
              }}
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
          {/* Live logs button */}
          <button
            onClick={handleLogsToggle}
            title="Live logs"
            data-onboarding="dash-live-logs"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: liveFeedOpen ? theme.navActiveBg : theme.btnBg,
              border: `1px solid ${liveFeedOpen ? theme.brand + '55' : theme.btnBorder}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: liveFeedOpen ? theme.brand : theme.btnText,
              position: 'relative',
              transition: 'all 0.15s',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="18" rx="2" />
              <line x1="6" y1="8" x2="18" y2="8" />
              <line x1="6" y1="12" x2="18" y2="12" />
              <line x1="6" y1="16" x2="12" y2="16" />
            </svg>
            {hasNewLogs && (
              <span
                style={{
                  position: 'absolute',
                  top: -3,
                  right: -3,
                  minWidth: 14,
                  height: 14,
                  padding: '0 4px',
                  borderRadius: 999,
                  background: theme.badgeRed,
                  color: '#fff',
                  fontSize: 9,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
            )}
          </button>
          <span data-onboarding="dash-notifications" style={{ display: 'inline-flex' }}>
            <NotificationBell />
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
        <div data-onboarding="stat-total-sessions" style={{ display: 'flex' }}>
          <TotalSessionsCard
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg>
            }
            label="Total Attacks"
            value={stats?.total_attempts ?? 0}
            color={theme.error}
          />
        </div>
        <div data-onboarding="stat-unique-ips" style={{ display: 'flex' }}>
          <StatCardPopup
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            }
            label="Unique IPs"
            value={stats?.unique_ips ?? 0}
            color={theme.blueLink}
            delay={1}
            fetchRows={async (page) => {
              const rangeQ = timeRange !== 'all' ? `&range=${timeRange}` : ''
              const res = await fetch(`/api/unique-ips?page=${page}&limit=50${rangeQ}`)
              const json = await res.json()
              return {
                rows: json.data.map((d: { ip: string; attack_count: number }) => ({
                  primary: d.ip,
                  secondary: `${d.attack_count} attacks`,
                })),
                hasMore: (page * 50) < json.total,
              }
            }}
            onRowClick={setSelectedAttackerIp}
          />
        </div>
        <div data-onboarding="stat-blocked-ips" style={{ display: 'flex' }}>
          <StatCardPopup
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            }
            label="Blocked IPs"
            value={stats?.blocked_ips ?? 0}
            color={theme.amber}
            delay={2}
            fetchRows={async () => {
              const res = await fetch('/api/blocked')
              const json = await res.json()
              return {
                rows: (json.data ?? [])
                  .filter((d: { is_active: string }) => d.is_active === 'Block_active')
                  .map((d: { ip: string; block_date: string }) => ({
                    primary: d.ip,
                    secondary: new Date(d.block_date).toLocaleDateString(),
                  })),
                hasMore: false,
              }
            }}
          />
        </div>
        <div data-onboarding="stat-active-sessions" style={{ display: 'flex' }}>
          <StatCardPopup
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>
            }
            label="Active Sessions"
            value={activeSessions}
            color={theme.success}
            delay={3}
            fetchRows={async () => {
              const res = await fetch('/api/active-sessions')
              const json = await res.json()
              return {
                rows: (json ?? []).map((d: { ip: string; last_seen: string }) => ({
                  primary: d.ip,
                  secondary: new Date(d.last_seen).toLocaleTimeString(),
                })),
                hasMore: false,
              }
            }}
            onRowClick={setSelectedLiveIp}
          />
        </div>
      </div>

      {/* Charts row — toggleable */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 0, flex: 1, minHeight: 0 }}>
        <div data-onboarding="top-attackers" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ ...h3Style, marginBottom: 0 }}>
              {showProtocol ? 'Attack Protocols' : 'Top 5 Attacker IPs'}
            </h3>
            <button
              onClick={() => setShowProtocol(!showProtocol)}
              style={{
                background: theme.btnBg,
                border: `1px solid ${theme.btnBorder}`,
                borderRadius: 6,
                padding: '4px 10px',
                color: theme.btnText,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {showProtocol ? 'Top 5 IPs' : 'Protocols'}
            </button>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <SlideSwap
              active={showProtocol ? 1 : 0}
              panels={[
                { key: 'top-ips', render: () => <TopAttackersChart data={stats?.top_ips?.slice(0, 5) ?? []} onBarClick={setSelectedAttackerIp} /> },
                { key: 'protocols', render: () => <ProtocolChart data={stats?.protocol_counts ?? []} /> },
              ]}
            />
          </div>
        </div>

        <div data-onboarding="general-location" style={{ ...cardStyle, gridColumn: 'span 3', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ ...h3Style, marginBottom: 0 }}>
              {showCountries ? 'Countries' : 'General Location of Attacks'}
            </h3>
            <button
              onClick={() => setShowCountries(!showCountries)}
              style={{
                background: theme.btnBg,
                border: `1px solid ${theme.btnBorder}`,
                borderRadius: 6,
                padding: '4px 10px',
                color: theme.btnText,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {showCountries ? 'Map' : 'Countries'}
            </button>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <SlideSwap
              active={showCountries ? 1 : 0}
              panels={[
                { key: 'map', render: () => <AttackMap attackers={attackers} onCountryClick={setSelectedCountry} /> },
                { key: 'countries', render: () => <CountryPieChart attackers={attackers} /> },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Top creds, histogram & top commands */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 10, flex: 1, minHeight: 0 }}>
        <div data-onboarding="top-creds" style={{ ...cardStyle, gridColumn: 'span 2', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ ...h3Style, marginBottom: 0 }}>
              {showPasswords ? 'Top 10 Passwords Used by Attackers' : 'Top 10 Usernames Used by Attackers'}
            </h3>
            <button
              onClick={() => setShowPasswords(!showPasswords)}
              style={{
                background: theme.btnBg,
                border: `1px solid ${theme.btnBorder}`,
                borderRadius: 6,
                padding: '4px 10px',
                color: theme.btnText,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {showPasswords ? 'Usernames' : 'Passwords'}
            </button>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <SlideSwap
              active={showPasswords ? 1 : 0}
              panels={[
                {
                  key: 'usernames',
                  scroll: true,
                  render: () => renderTopList(
                    (stats?.top_usernames ?? []).map(e => ({ value: e.username_attempt, count: e.count })),
                    theme.brand,
                  ),
                },
                {
                  key: 'passwords',
                  scroll: true,
                  render: () => renderTopList(
                    (stats?.top_passwords ?? []).map(e => ({ value: e.password_attempt, count: e.count })),
                    theme.brand,
                  ),
                },
              ]}
            />
          </div>
        </div>

        <div data-onboarding="events-histogram" style={{ ...cardStyle, gridColumn: 'span 3', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <h3 style={h3Style}>Honeypot Events Histogram</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <EventsHistogram data={stats?.hourly_histogram ?? []} />
          </div>
        </div>

        <div data-onboarding="common-commands" style={{ ...cardStyle, gridColumn: 'span 3', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <h3 style={h3Style}>Most Common Commands Used by Attackers</h3>
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            {renderTopList(
              (stats?.top_commands ?? []).map(e => ({ value: e.command, count: e.count })),
              theme.brand,
            )}
          </div>
        </div>
      </div>

      {/* Sliding live feed drawer — portaled to <body> so position:fixed
          isn't trapped by the page-transition transform */}
      {createPortal(
        <div
          ref={drawerRef}
          aria-hidden={!liveFeedOpen}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 176,
            right: 0,
            zIndex: 1000,
            pointerEvents: liveFeedOpen ? 'auto' : 'none',
            visibility: liveFeedOpen ? 'visible' : 'hidden',
            transform: liveFeedOpen ? 'translateY(0)' : 'translateY(100%)',
            // On open: flip visibility instantly so the slide-in is visible.
            // On close: keep it visible until the slide-out finishes.
            transition: isDragging.current
              ? 'none'
              : liveFeedOpen
                ? 'transform 0.28s cubic-bezier(0.4,0,0.2,1), visibility 0s linear 0s'
                : 'transform 0.28s cubic-bezier(0.4,0,0.2,1), visibility 0s linear 0.28s',
            height: `${drawerHeight}vh`,
            display: 'flex',
            flexDirection: 'column',
            background: theme.cardBg,
            borderTop: `2px solid ${theme.cardBorder}`,
            borderLeft: `1px solid ${theme.cardBorder}`,
            borderTopLeftRadius: 14,
            borderTopRightRadius: 14,
            boxShadow: `0 -8px 32px ${theme.shadow}`,
          }}
        >
          {/* Drag handle */}
          <div
            onMouseDown={handleDragStart}
            style={{
              cursor: 'ns-resize',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 0',
              flexShrink: 0,
            }}
          >
            <div style={{ width: 36, height: 3, borderRadius: 2, background: theme.textTertiary, opacity: 0.4 }} />
          </div>
          <div
            style={{
              padding: '0 18px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: theme.success,
                  color: theme.success,
                  animation: 'pulse-dot 2s infinite',
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: theme.heading }}>Live Feed</span>
            </div>
            <button
              onClick={() => setLiveFeedOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: theme.textSecondary,
                cursor: 'pointer',
                fontSize: 16,
                lineHeight: 1,
                padding: 4,
              }}
              aria-label="Close live feed"
            >
              ✕
            </button>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '0 18px 14px' }}>
            <LiveFeed />
          </div>
        </div>,
        document.body,
      )}

      {/* Per-attacker activity popup, opened from the Top 5 Attackers bar chart */}
      <AttackerActivityModal
        ip={selectedAttackerIp}
        onClose={() => setSelectedAttackerIp(null)}
      />

      {/* Live session popup, opened from the Active Sessions stat card */}
      <AttackerActivityModal
        ip={selectedLiveIp}
        onClose={() => setSelectedLiveIp(null)}
        live
        onBlock={async (ip) => {
          const res = await fetch('/api/block', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip }),
          })
          if (res.ok) {
            setSelectedLiveIp(null)
            fetchData()
          }
        }}
      />

      {/* Country drill-down — opened from a map marker click */}
      {selectedCountry && createPortal(
        <div
          onClick={() => setSelectedCountry(null)}
          style={{
            position: 'fixed', inset: 0,
            background: theme.modalOverlay,
            zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.tooltipBorder}`,
              borderRadius: 12,
              width: 460,
              maxHeight: '70vh',
              display: 'flex', flexDirection: 'column',
              boxShadow: `0 16px 48px ${theme.modalOverlay}`,
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderBottom: `1px solid ${theme.cardBorder}`,
            }}>
              <span style={{ color: theme.heading, fontSize: 15, fontWeight: 600 }}>
                Attackers from {selectedCountry}
              </span>
              <button
                onClick={() => setSelectedCountry(null)}
                style={{
                  background: 'none', border: 'none', color: theme.textSecondary,
                  fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: '0 4px',
                }}
              >✕</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {(() => {
                const list = attackers.filter(a => a.country === selectedCountry)
                if (list.length === 0) {
                  return (
                    <div style={{ color: theme.textSecondary, fontSize: 13, padding: 24, textAlign: 'center' }}>
                      No attackers from this country.
                    </div>
                  )
                }
                return list.map((a, i) => (
                  <button
                    key={a.ip}
                    onClick={() => {
                      setSelectedAttackerIp(a.ip)
                      setSelectedCountry(null)
                    }}
                    style={{
                      width: '100%',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 20px',
                      borderBottom: i < list.length - 1 ? `1px solid ${theme.cardBorder}` : 'none',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = theme.cardHoverBg)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{
                      color: theme.textPrimary, fontSize: 13,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>{a.ip}</span>
                    <span style={{ color: theme.textTertiary, fontSize: 11 }}>
                      last seen {new Date(a.last_detected).toLocaleString()}
                    </span>
                  </button>
                ))
              })()}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}

export default Dashboard
