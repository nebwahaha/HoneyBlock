import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTheme } from '../theme'

interface ActivityRow {
  ip: string
  event_type: string | null
  username_attempt: string | null
  password_attempt: string | null
  command_used: string | null
  protocol: string | null
  timestamp: string | null
}

interface ActivityResponse {
  ip: string
  country: string | null
  data: ActivityRow[]
}

interface Props {
  ip: string | null
  onClose: () => void
  /** when true, refetch every 3s while the modal is open */
  live?: boolean
  /** when set, render a "Block IP" button in the header that calls this with the IP */
  onBlock?: (ip: string) => Promise<void> | void
}

function AttackerActivityModal({ ip, onClose, live, onBlock }: Props) {
  const { theme } = useTheme()
  const [data, setData] = useState<ActivityResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [blocking, setBlocking] = useState(false)

  // Fetch on open (and poll if live)
  useEffect(() => {
    if (!ip) return
    let cancelled = false
    const fetchOnce = (initial: boolean) => {
      if (initial) {
        setData(null)
        setError(null)
        setLoading(true)
      }
      fetch(`/api/attacker/${encodeURIComponent(ip)}/activity?limit=300`)
        .then(r => {
          if (!r.ok) throw new Error(`Status ${r.status}`)
          return r.json()
        })
        .then((json: ActivityResponse) => { if (!cancelled) setData(json) })
        .catch(err => { if (!cancelled && initial) setError(String(err.message ?? err)) })
        .finally(() => { if (!cancelled && initial) setLoading(false) })
    }
    fetchOnce(true)
    let interval: number | undefined
    if (live) {
      interval = window.setInterval(() => fetchOnce(false), 3000)
    }
    return () => {
      cancelled = true
      if (interval !== undefined) clearInterval(interval)
    }
  }, [ip, live])

  const handleBlock = async () => {
    if (!ip || !onBlock) return
    setBlocking(true)
    try { await onBlock(ip) } finally { setBlocking(false) }
  }

  // ESC closes
  useEffect(() => {
    if (!ip) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ip, onClose])

  if (!ip) return null

  // Group rows by event type and pull out commands separately
  const rows = data?.data ?? []
  const commands = rows
    .filter(r => r.command_used)
    .map(r => ({ command: r.command_used as string, ts: r.timestamp }))
  const credentials = rows
    .filter(r => r.username_attempt || r.password_attempt)
    .map(r => ({
      user: r.username_attempt ?? '',
      pass: r.password_attempt ?? '',
      ts: r.timestamp,
    }))
  const eventCounts: Record<string, number> = {}
  for (const r of rows) {
    if (r.event_type) eventCounts[r.event_type] = (eventCounts[r.event_type] ?? 0) + 1
  }
  const protocols = Array.from(new Set(rows.map(r => r.protocol).filter((p): p is string => !!p)))

  const fmtTs = (ts: string | null): string => {
    if (!ts) return '—'
    try { return new Date(ts).toLocaleString() } catch { return ts }
  }

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: theme.modalOverlay,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: theme.cardBg,
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: 14,
          width: '100%',
          maxWidth: 760,
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: `0 24px 64px ${theme.shadow}`,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: `1px solid ${theme.cardBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: `${theme.error}18`,
                border: `1px solid ${theme.error}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.error,
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', 'Consolas', monospace",
                  fontSize: 14,
                  fontWeight: 700,
                  color: theme.heading,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {ip}
              </div>
              <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                {live && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: theme.success,
                      animation: 'pulse-dot 2s ease-in-out infinite',
                    }} />
                    <span style={{ color: theme.success, fontWeight: 600, letterSpacing: '0.5px' }}>LIVE</span>
                    <span>·</span>
                  </span>
                )}
                <span>
                  {data?.country ? `${data.country} · ` : ''}
                  {loading ? 'Loading…' : `${rows.length} events`}
                  {protocols.length > 0 && ` · ${protocols.join(', ')}`}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {onBlock && (
            <button
              onClick={handleBlock}
              disabled={blocking}
              style={{
                background: theme.blockBtn,
                color: theme.blockBtnText,
                border: `1px solid ${theme.blockBtnBorder}`,
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 600,
                cursor: blocking ? 'wait' : 'pointer',
                opacity: blocking ? 0.6 : 1,
              }}
            >
              {blocking ? 'Blocking…' : 'Block IP'}
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              color: theme.textSecondary,
              cursor: 'pointer',
              fontSize: 22,
              lineHeight: 1,
              padding: 4,
            }}
          >
            ×
          </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px' }}>
          {loading && (
            <div style={{ color: theme.textSecondary, fontSize: 13, padding: 20, textAlign: 'center' }}>
              Loading activity…
            </div>
          )}

          {error && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: theme.messageBgError,
                color: theme.error,
                border: `1px solid ${theme.error}40`,
                fontSize: 12,
                fontFamily: "'JetBrains Mono', 'Consolas', monospace",
              }}
            >
              Failed to load activity: {error}
            </div>
          )}

          {!loading && !error && rows.length === 0 && (
            <div style={{ color: theme.textSecondary, fontSize: 13, padding: 30, textAlign: 'center' }}>
              No recorded activity for this IP.
            </div>
          )}

          {!loading && !error && rows.length > 0 && (
            <>
              {/* Event-type summary chips */}
              {Object.keys(eventCounts).length > 0 && (
                <Section theme={theme} title={`Events (${rows.length})`}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {Object.entries(eventCounts).map(([type, n]) => (
                      <span
                        key={type}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 600,
                          background: `${theme.brand}14`,
                          border: `1px solid ${theme.brand}40`,
                          color: theme.brand,
                          fontFamily: "'JetBrains Mono', 'Consolas', monospace",
                        }}
                      >
                        {type} · {n}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Commands executed */}
              {commands.length > 0 && (
                <Section theme={theme} title={`Commands executed (${commands.length})`}>
                  <div
                    style={{
                      background: theme.feedBg,
                      border: `1px solid ${theme.feedBorder}`,
                      borderRadius: 8,
                      maxHeight: 240,
                      overflowY: 'auto',
                      fontFamily: "'JetBrains Mono', 'Consolas', monospace",
                      fontSize: 12,
                    }}
                  >
                    {commands.map((c, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '8px 12px',
                          borderBottom: i < commands.length - 1 ? `1px solid ${theme.feedBorder}` : 'none',
                          display: 'flex',
                          gap: 10,
                        }}
                      >
                        <span style={{ color: theme.textTertiary, flexShrink: 0, minWidth: 130 }}>
                          {fmtTs(c.ts)}
                        </span>
                        <span style={{ color: theme.brand, flexShrink: 0 }}>$</span>
                        <span style={{ color: theme.textPrimary, wordBreak: 'break-all' }}>
                          {c.command}
                        </span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Login attempts */}
              {credentials.length > 0 && (
                <Section theme={theme} title={`Login attempts (${credentials.length})`}>
                  <div
                    style={{
                      background: theme.feedBg,
                      border: `1px solid ${theme.feedBorder}`,
                      borderRadius: 8,
                      maxHeight: 240,
                      overflowY: 'auto',
                    }}
                  >
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                        <tr>
                          <th style={thStyle(theme)}>Username</th>
                          <th style={thStyle(theme)}>Password</th>
                          <th style={{ ...thStyle(theme), textAlign: 'right' }}>When</th>
                        </tr>
                      </thead>
                      <tbody>
                        {credentials.map((c, i) => (
                          <tr
                            key={i}
                            style={{ background: i % 2 === 0 ? theme.tableRowEven : theme.tableRowOdd }}
                          >
                            <td
                              style={{
                                ...tdStyle(theme),
                                fontFamily: "'JetBrains Mono', 'Consolas', monospace",
                                color: theme.textPrimary,
                              }}
                            >
                              {c.user || '—'}
                            </td>
                            <td
                              style={{
                                ...tdStyle(theme),
                                fontFamily: "'JetBrains Mono', 'Consolas', monospace",
                                color: theme.error,
                              }}
                            >
                              {c.pass || '—'}
                            </td>
                            <td
                              style={{
                                ...tdStyle(theme),
                                textAlign: 'right',
                                color: theme.textSecondary,
                              }}
                            >
                              {fmtTs(c.ts)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Section>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

function Section({
  theme,
  title,
  children,
}: {
  theme: ReturnType<typeof useTheme>['theme']
  title: string
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: theme.textTertiary,
          letterSpacing: '1.2px',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}

function thStyle(theme: ReturnType<typeof useTheme>['theme']): React.CSSProperties {
  return {
    padding: '8px 12px',
    color: theme.textTertiary,
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    background: theme.tableHeaderBg,
    borderBottom: `1px solid ${theme.cardBorder}`,
    textAlign: 'left',
  }
}

function tdStyle(theme: ReturnType<typeof useTheme>['theme']): React.CSSProperties {
  return {
    padding: '7px 12px',
    fontSize: 12,
    borderBottom: `1px solid ${theme.cardBorder}`,
  }
}

export default AttackerActivityModal
