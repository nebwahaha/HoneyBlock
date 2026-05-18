import { useState, useEffect, useRef } from 'react'
import type { BlockEntry } from '../types'
import { useTheme } from '../theme'

const SEEN_BLOCK_IDS_KEY = 'hb_notif_seen_block_ids'
const SEEN_ACTIVE_IPS_KEY = 'hb_notif_seen_active_ips'
const NOTIFICATIONS_ENABLED_KEY = 'hb_notifications_enabled'
const NOTIFY_CONNECTIONS_KEY = 'hb_notifications_connections'
const NOTIFY_BLOCKS_KEY = 'hb_notifications_blocks'

type NotificationCategory = 'connection' | 'block'

function isCategoryEnabled(category: NotificationCategory): boolean {
  if (localStorage.getItem(NOTIFICATIONS_ENABLED_KEY) === 'false') return false
  const key = category === 'connection' ? NOTIFY_CONNECTIONS_KEY : NOTIFY_BLOCKS_KEY
  return localStorage.getItem(key) !== 'false'
}

function loadIdSet<T>(key: string): Set<T> {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return new Set<T>()
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? new Set<T>(parsed) : new Set<T>()
  } catch {
    return new Set<T>()
  }
}

type Section = 'active' | 'system'

interface ActiveSession {
  ip: string
  last_seen: string
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5"
      style={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function SectionHeader({
  label, count, badge, expanded, color, onClick,
}: {
  label: string
  count: number
  badge?: number
  expanded: boolean
  color: string
  onClick: () => void
}) {
  const { theme } = useTheme()
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '11px 16px', cursor: 'pointer',
        background: hovered ? theme.cardHoverBg : 'transparent',
        borderBottom: `1px solid ${theme.cardBorder}`,
        transition: 'background 0.15s',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: color, flexShrink: 0,
          boxShadow: `0 0 6px ${color}`,
        }} />
        <span style={{ color: theme.textPrimary, fontSize: 13, fontWeight: 600 }}>{label}</span>
        {badge !== undefined && badge > 0 && (
          <span style={{
            background: theme.badgeRed, color: '#fff',
            borderRadius: 4, padding: '1px 6px',
            fontSize: 10, fontWeight: 700,
          }}>
            {badge > 99 ? '99+' : badge} new
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: theme.textSecondary, fontSize: 12 }}>{count}</span>
        <ChevronIcon expanded={expanded} />
      </div>
    </div>
  )
}

function sendDesktopNotification(category: NotificationCategory, title: string, body: string) {
  if (!isCategoryEnabled(category)) return
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  try {
    new Notification(title, { body, icon: '/favicon.ico' })
  } catch {
    // Silent fail — some environments block the constructor
  }
}

function NotificationBell() {
  const { theme } = useTheme()
  const [blocklist, setBlocklist] = useState<BlockEntry[]>([])
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([])
  const [seenBlockIds, setSeenBlockIds] = useState<Set<number>>(() => loadIdSet<number>(SEEN_BLOCK_IDS_KEY))
  const [seenActiveIPs, setSeenActiveIPs] = useState<Set<string>>(() => loadIdSet<string>(SEEN_ACTIVE_IPS_KEY))
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<Section | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  // Track known IPs/blocks so we only notify on genuinely new ones
  const knownActiveIPs = useRef<Set<string> | null>(null)
  const knownBlockIDs = useRef<Set<number> | null>(null)

  // Request desktop notification permission on mount (unless user has disabled notifications)
  useEffect(() => {
    if (localStorage.getItem(NOTIFICATIONS_ENABLED_KEY) === 'false') return
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const fetchData = async () => {
    try {
      const [blockedRes, activeRes] = await Promise.all([
        fetch('/api/blocked'),
        fetch('/api/active-sessions'),
      ])
      if (blockedRes.ok) {
        const data = await blockedRes.json()
        const blocks: BlockEntry[] = data.data ?? []
        setBlocklist(blocks)

        // Desktop notifications for new blocks
        const currentBlockIDs = new Set(blocks.filter(b => b.is_active === 'Block_active').map(b => b.block_id))
        if (knownBlockIDs.current !== null) {
          const newBlocks = blocks.filter(b => b.is_active === 'Block_active' && !knownBlockIDs.current!.has(b.block_id))
          for (const b of newBlocks) {
            sendDesktopNotification(
              'block',
              'HoneyBlock — IP Blocked',
              `${b.ip} was blocked${b.blocked_by ? ` (${b.blocked_by})` : ''}`
            )
          }
        }
        knownBlockIDs.current = currentBlockIDs
      }
      if (activeRes.ok) {
        const data = await activeRes.json()
        const sessions: ActiveSession[] = data ?? []
        setActiveSessions(sessions)

        // Desktop notifications for new connections
        const currentIPs = new Set(sessions.map(s => s.ip))
        if (knownActiveIPs.current !== null) {
          const newIPs = sessions.filter(s => !knownActiveIPs.current!.has(s.ip))
          for (const s of newIPs) {
            sendDesktopNotification(
              'connection',
              'HoneyBlock — New Connection',
              `${s.ip} connected to the honeypot`
            )
          }
        }
        knownActiveIPs.current = currentIPs
      }
    } catch {
      // retry on next interval
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Only show auto-blocks that are still active in the "Blocked by System" section.
  const autoBlocked = blocklist.filter(b => b.blocked_by === 'Auto' && b.is_active === 'Block_active')

  // Identity-based unseen counts: anything currently visible whose id/ip isn't
  // in the seen set is genuinely new. When a session disconnects (or a block
  // expires) it leaves the visible list, so it's no longer counted regardless
  // of seen state — that's the disconnect-clears-badge behaviour.
  const unseenAutoBlocks = autoBlocked.filter(b => !seenBlockIds.has(b.block_id)).length
  const unseenActive = activeSessions.filter(s => !seenActiveIPs.has(s.ip)).length
  const totalBadge = unseenAutoBlocks + unseenActive

  const handleOpen = () => {
    const willOpen = !open
    setOpen(willOpen)
    if (willOpen) {
      // Snapshot the currently visible items as "seen". Anything that disappears
      // afterwards (e.g. a session disconnect) drops out of the visible list so
      // the badge stays accurate. Replacing (not unioning) prevents the seen
      // set from growing unbounded across the lifetime of the install.
      const blockIds = new Set(autoBlocked.map(b => b.block_id))
      const activeIps = new Set(activeSessions.map(s => s.ip))
      setSeenBlockIds(blockIds)
      setSeenActiveIPs(activeIps)
      localStorage.setItem(SEEN_BLOCK_IDS_KEY, JSON.stringify([...blockIds]))
      localStorage.setItem(SEEN_ACTIVE_IPS_KEY, JSON.stringify([...activeIps]))
    }
  }

  const toggleSection = (s: Section) => setExpanded(e => e === s ? null : s)

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        style={{
          position: 'relative', width: 36, height: 36, borderRadius: 8,
          background: open ? theme.navActiveBg : theme.btnBg,
          border: `1px solid ${open ? theme.brand + '55' : theme.btnBorder}`,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: open ? theme.brand : theme.btnText,
          transition: 'all 0.15s',
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {totalBadge > 0 && (
          <span style={{
            position: 'absolute', top: -3, right: -3,
            background: theme.badgeRed, color: '#fff',
            borderRadius: 999, minWidth: 16, height: 16, padding: '0 4px',
            fontSize: 9, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {totalBadge > 99 ? '99+' : totalBadge}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 380,
          background: theme.cardBg, border: `2px solid ${theme.tooltipBorder}`,
          borderRadius: 10, boxShadow: `0 8px 32px ${theme.dropdownShadow}`,
          zIndex: 200, overflow: 'hidden',
        }}>
          {/* Panel header */}
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.tooltipBorder}` }}>
            <span style={{ color: theme.heading, fontSize: 14, fontWeight: 700 }}>Notifications</span>
          </div>

          {/* Active Connections */}
          <SectionHeader
            label="Active Connections"
            count={activeSessions.length}
            badge={unseenActive}
            expanded={expanded === 'active'}
            color={theme.success}
            onClick={() => toggleSection('active')}
          />
          {expanded === 'active' && (
            <div style={{ maxHeight: 220, overflowY: 'auto', borderBottom: `1px solid ${theme.cardBorder}` }}>
              {activeSessions.length === 0 ? (
                <div style={{ color: theme.textSecondary, fontSize: 13, padding: '12px 20px' }}>No active connections.</div>
              ) : (
                activeSessions.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '9px 20px', borderBottom: `1px solid ${theme.cardBorder}`,
                    background: theme.notifItemBg,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: theme.success, display: 'inline-block', boxShadow: `0 0 5px ${theme.success}` }} />
                      <span style={{ color: theme.textPrimary, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>{s.ip}</span>
                    </div>
                    <span style={{ color: theme.textSecondary, fontSize: 11 }}>
                      {new Date(s.last_seen).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Blocked by System */}
          <SectionHeader
            label="Blocked by System"
            count={autoBlocked.length}
            badge={unseenAutoBlocks}
            expanded={expanded === 'system'}
            color={theme.badgeRed}
            onClick={() => toggleSection('system')}
          />
          {expanded === 'system' && (
            <div style={{ maxHeight: 220, overflowY: 'auto', borderBottom: `1px solid ${theme.cardBorder}` }}>
              {autoBlocked.length === 0 ? (
                <div style={{ color: theme.textSecondary, fontSize: 13, padding: '12px 20px' }}>No system blocks yet.</div>
              ) : (
                [...autoBlocked].reverse().map((b) => (
                  <div key={b.block_id} style={{
                    padding: '9px 20px', borderBottom: `1px solid ${theme.cardBorder}`,
                    background: theme.notifItemBg,
                    display: 'flex', flexDirection: 'column', gap: 2,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: theme.textPrimary, fontSize: 13, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{b.ip}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                        background: b.is_active === 'Block_active' ? theme.blockStatusActiveBg : theme.blockStatusInactiveBg,
                        color: b.is_active === 'Block_active' ? theme.error : theme.textSecondary,
                      }}>
                        {b.is_active === 'Block_active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <span style={{ color: theme.textSecondary, fontSize: 11 }}>{new Date(b.block_date).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      )}
    </div>
  )
}

export default NotificationBell
