import { useState, useEffect, useMemo } from 'react'
import type { Attacker, BlockEntry } from '../types'
import { useTheme } from '../theme'

type SortDir = 'asc' | 'desc'
type AttackersSortKey = 'first_detected' | 'last_detected' | 'chances_left' | null
type HistorySortKey = 'block_date' | 'expiration_date' | null

function Blocking() {
  const { theme } = useTheme()
  const [attackers, setAttackers] = useState<Attacker[]>([])
  const [blocklist, setBlocklist] = useState<BlockEntry[]>([])
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)
  const [autoBlockEnabled, setAutoBlockEnabled] = useState(false)
  const [threshold, setThreshold] = useState(20)
  const [thresholdInput, setThresholdInput] = useState('20')
  const [savingThreshold, setSavingThreshold] = useState(false)
  const [blockDuration, setBlockDuration] = useState('never')
  const [savingDuration, setSavingDuration] = useState(false)

  // Detected Attackers filters + sort
  const [aStatus, setAStatus] = useState<'all' | 'blocked' | 'not_blocked'>('all')
  const [aAction, setAAction] = useState<'all' | 'block' | 'unblock'>('all')
  const [aCountry, setACountry] = useState<string>('all')
  const [aSort, setASort] = useState<{ key: AttackersSortKey; dir: SortDir }>({ key: 'last_detected', dir: 'desc' })

  // Block History filters + sort
  const [hStatus, setHStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [hBlockedBy, setHBlockedBy] = useState<string>('all')
  const [hSort, setHSort] = useState<{ key: HistorySortKey; dir: SortDir }>({ key: 'block_date', dir: 'desc' })

  const fetchData = async () => {
    try {
      const [attackersRes, blockedRes, autoBlockRes] = await Promise.all([
        fetch('/api/attackers'),
        fetch('/api/blocked'),
        fetch('/api/autoblock/status'),
      ])
      if (attackersRes.ok) setAttackers(await attackersRes.json())
      if (blockedRes.ok) {
        const data = await blockedRes.json()
        setBlocklist(data.data ?? [])
      }
      if (autoBlockRes.ok) {
        const data = await autoBlockRes.json()
        setAutoBlockEnabled(data.enabled)
        setThreshold(data.threshold)
        setThresholdInput(String(data.threshold))
        setBlockDuration(data.block_duration ?? 'never')
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

  const blockIp = async (ip: string) => {
    setActionInProgress(ip)
    setMessage(null)
    try {
      const res = await fetch('/api/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({ text: `Blocked ${ip}`, error: false })
        await fetchData()
      } else {
        setMessage({ text: data.message ?? 'Failed to block', error: true })
      }
    } catch {
      setMessage({ text: 'Network error', error: true })
    } finally {
      setActionInProgress(null)
    }
  }

  const unblockIp = async (ip: string) => {
    setActionInProgress(ip)
    setMessage(null)
    try {
      const res = await fetch('/api/unblock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({ text: `Unblocked ${ip}`, error: false })
        await fetchData()
      } else {
        setMessage({ text: data.message ?? 'Failed to unblock', error: true })
      }
    } catch {
      setMessage({ text: 'Network error', error: true })
    } finally {
      setActionInProgress(null)
    }
  }

  const saveThreshold = async () => {
    const val = parseInt(thresholdInput, 10)
    if (isNaN(val) || val < 1) {
      setMessage({ text: 'Threshold must be a number greater than 0', error: true })
      return
    }
    setSavingThreshold(true)
    setMessage(null)
    try {
      const res = await fetch('/api/autoblock/threshold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold: val }),
      })
      const data = await res.json()
      if (res.ok) {
        setThreshold(data.threshold)
        setThresholdInput(String(data.threshold))
        setMessage({ text: `Session limit updated to ${data.threshold}`, error: false })
      } else {
        setMessage({ text: data.message ?? 'Failed to update threshold', error: true })
      }
    } catch {
      setMessage({ text: 'Network error', error: true })
    } finally {
      setSavingThreshold(false)
    }
  }

  const saveDuration = async (value: string) => {
    setSavingDuration(true)
    setMessage(null)
    try {
      const res = await fetch('/api/autoblock/duration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ block_duration: value }),
      })
      const data = await res.json()
      if (res.ok) {
        setBlockDuration(data.block_duration)
        const labels: Record<string, string> = { never: 'Never', '1d': '1 Day', '1w': '1 Week', '1m': '1 Month' }
        setMessage({ text: `Block expiration set to ${labels[data.block_duration] ?? data.block_duration}`, error: false })
      } else {
        setMessage({ text: data.message ?? 'Failed to update expiration', error: true })
      }
    } catch {
      setMessage({ text: 'Network error', error: true })
    } finally {
      setSavingDuration(false)
    }
  }

  // Country options derived from attackers list
  const countryOptions = useMemo(() => {
    const set = new Set<string>()
    attackers.forEach(a => { if (a.country) set.add(a.country) })
    return Array.from(set).sort()
  }, [attackers])

  const blockedByOptions = useMemo(() => {
    const set = new Set<string>()
    blocklist.forEach(b => { if (b.blocked_by) set.add(b.blocked_by) })
    return Array.from(set).sort()
  }, [blocklist])

  const filteredAttackers = useMemo(() => {
    const rows = attackers.filter(a => {
      const isBlocked = a.is_blocked === 'Blocked'
      if (aStatus === 'blocked' && !isBlocked) return false
      if (aStatus === 'not_blocked' && isBlocked) return false
      if (aAction === 'block' && isBlocked) return false
      if (aAction === 'unblock' && !isBlocked) return false
      if (aCountry !== 'all' && (a.country ?? '') !== aCountry) return false
      return true
    })
    const { key, dir } = aSort
    if (!key) return rows
    const mult = dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      if (key === 'chances_left') {
        const av = a.chances_left ?? -Infinity
        const bv = b.chances_left ?? -Infinity
        return (av - bv) * mult
      }
      const av = key === 'first_detected' ? a.initial_detection : a.last_detected
      const bv = key === 'first_detected' ? b.initial_detection : b.last_detected
      return (av ?? '').localeCompare(bv ?? '') * mult
    })
  }, [attackers, aStatus, aAction, aCountry, aSort])

  const filteredHistory = useMemo(() => {
    const rows = blocklist.filter(b => {
      const active = b.is_active === 'Block_active'
      if (hStatus === 'active' && !active) return false
      if (hStatus === 'inactive' && active) return false
      if (hBlockedBy !== 'all' && (b.blocked_by ?? '') !== hBlockedBy) return false
      return true
    })
    const { key, dir } = hSort
    if (!key) return rows
    const mult = dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const av = key === 'block_date' ? a.block_date : (a.expiration_date ?? '')
      const bv = key === 'block_date' ? b.block_date : (b.expiration_date ?? '')
      return (av ?? '').localeCompare(bv ?? '') * mult
    })
  }, [blocklist, hStatus, hBlockedBy, hSort])

  const toggleASort = (key: NonNullable<AttackersSortKey>) => {
    setASort(prev => prev.key === key
      ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
      : { key, dir: 'desc' })
  }

  const toggleHSort = (key: NonNullable<HistorySortKey>) => {
    setHSort(prev => prev.key === key
      ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
      : { key, dir: 'desc' })
  }

  const thStyle: React.CSSProperties = {
    background: theme.tableHeaderBg,
    color: theme.textTertiary,
    textAlign: 'left',
    padding: '8px 12px',
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    borderBottom: `1px solid ${theme.cardBorder}`,
    whiteSpace: 'nowrap',
  }

  const sortIndicator = (active: boolean, dir: SortDir) => (
    <span
      style={{
        marginLeft: 6,
        color: active ? theme.brand : theme.textSecondary,
        fontSize: 11,
        fontWeight: 700,
        lineHeight: 1,
      }}
    >
      {active ? (dir === 'asc' ? '▲' : '▼') : '↕'}
    </span>
  )

  const SortableTh = ({
    label,
    active,
    dir,
    onClick,
  }: {
    label: string
    active: boolean
    dir: SortDir
    onClick: () => void
  }) => (
    <th
      onClick={onClick}
      style={{
        ...thStyle,
        cursor: 'pointer',
        userSelect: 'none',
        color: active ? theme.brand : theme.textTertiary,
      }}
      title={`Sort by ${label}`}
      onMouseEnter={(e) => { e.currentTarget.style.background = theme.cardHoverBg }}
      onMouseLeave={(e) => { e.currentTarget.style.background = theme.tableHeaderBg }}
    >
      {label}
      {sortIndicator(active, dir)}
    </th>
  )

  // Filter dropdown rendered inside a <th>. The label is the column name (e.g. "COUNTRY"),
  // the dropdown value shows the chosen filter and lights up in the brand color when active.
  const FilterTh = ({
    label,
    value,
    onChange,
    options,
    width = 150,
  }: {
    label: string
    value: string
    onChange: (v: string) => void
    options: { value: string; label: string }[]
    /** fixed width in px so changing the selected option doesn't resize the column */
    width?: number
  }) => {
    const active = value !== 'all'
    return (
      <th style={{ ...thStyle, padding: '4px 8px', width }}>
        <div
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            title={`Filter by ${label}`}
            aria-label={`Filter by ${label}`}
            style={{
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              width: '100%',
              padding: '5px 22px 5px 10px',
              background: active ? `${theme.brand}1a` : theme.btnBg,
              color: active ? theme.brand : theme.textTertiary,
              border: `1px solid ${active ? theme.brand + '88' : theme.btnBorder}`,
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              cursor: 'pointer',
              outline: 'none',
              fontFamily: 'inherit',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value} style={{ textTransform: 'none' }}>
                {label}: {o.label}
              </option>
            ))}
          </select>
          <span
            style={{
              position: 'absolute',
              right: 7,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: active ? theme.brand : theme.textTertiary,
              fontSize: 9,
              lineHeight: 1,
            }}
          >
            ▼
          </span>
        </div>
      </th>
    )
  }

  const tdStyle: React.CSSProperties = {
    padding: '9px 12px',
    fontSize: 12,
    color: theme.textPrimary,
    borderBottom: `1px solid ${theme.cardBorder}`,
  }

  const cardStyle: React.CSSProperties = {
    background: theme.cardBg,
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: 10,
    padding: 16,
  }

  return (
    <div>
      {message && message.error && (
        <div style={{
          padding: '10px 16px', marginBottom: 16, borderRadius: 6,
          background: theme.messageBgError, color: theme.error, fontSize: 13,
        }}>
          {message.text}
        </div>
      )}

      {/* Settings row — session limit + block expiration */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
      <div
        data-onboarding="block-session-limit"
        style={{
          ...cardStyle,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <h3 style={{ color: theme.heading, fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
            Automatic Blocking Session Limit
          </h3>
          <p style={{ color: theme.textSecondary, fontSize: 13, margin: 0 }}>
            Attackers are automatically blocked after reaching this number of sessions.
            {' '}
            <span style={{ color: autoBlockEnabled ? theme.success : theme.error, fontWeight: 600 }}>
              {autoBlockEnabled ? 'Auto-blocking is ON' : 'Auto-blocking is OFF'}
            </span>
            {!autoBlockEnabled && (
              <span style={{ color: theme.textSecondary }}> ---enable it in Configurations.</span>
            )}
          </p>
        </div>
        {(() => {
          const parsed = parseInt(thresholdInput, 10)
          const isValid = !isNaN(parsed) && parsed >= 1
          const isDirty = isValid && parsed !== threshold
          const canSave = isDirty && !savingThreshold

          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Stepper */}
              <div style={{
                display: 'flex', alignItems: 'center',
                background: theme.tableHeaderBg, border: `1px solid ${theme.tooltipBorder}`,
                borderRadius: 8, overflow: 'hidden',
              }}>
                <button
                  onClick={() => setThresholdInput(v => {
                    const n = parseInt(v, 10)
                    return String(Math.max(1, (isNaN(n) ? 1 : n) - 1))
                  })}
                  aria-label="Decrease session limit"
                  style={{
                    width: 36, height: 36, background: 'transparent',
                    border: 'none', color: theme.textTertiary, fontSize: 18,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'inherit',
                  }}
                >−</button>
                <input
                  type="number"
                  className="no-spinner"
                  min={1}
                  value={thresholdInput}
                  onChange={(e) => {
                    // Allow empty string while editing; strip non-digits
                    const raw = e.target.value.replace(/[^\d]/g, '')
                    setThresholdInput(raw)
                  }}
                  onBlur={() => {
                    // Snap empty/zero back to 1 when the user leaves the field
                    const n = parseInt(thresholdInput, 10)
                    if (isNaN(n) || n < 1) setThresholdInput('1')
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter' && canSave) saveThreshold() }}
                  aria-label="Session limit"
                  style={{
                    width: 56, textAlign: 'center',
                    color: isValid ? theme.heading : theme.error,
                    fontSize: 15, fontWeight: 700,
                    borderLeft: `1px solid ${theme.tooltipBorder}`,
                    borderRight: `1px solid ${theme.tooltipBorder}`,
                    borderTop: 'none', borderBottom: 'none',
                    background: 'transparent',
                    padding: '0 8px', height: 36,
                    fontFamily: 'inherit',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={() => setThresholdInput(v => {
                    const n = parseInt(v, 10)
                    return String((isNaN(n) ? 0 : n) + 1)
                  })}
                  aria-label="Increase session limit"
                  style={{
                    width: 36, height: 36, background: 'transparent',
                    border: 'none', color: theme.textTertiary, fontSize: 18,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'inherit',
                  }}
                >+</button>
              </div>
              <button
                onClick={saveThreshold}
                disabled={!canSave}
                style={{
                  padding: '8px 20px',
                  border: `1px solid ${canSave ? theme.brand : theme.cardBorder}`,
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: canSave ? 'pointer' : 'not-allowed',
                  color: canSave ? theme.pageBg : theme.textTertiary,
                  background: canSave ? theme.brand : theme.cardBg,
                  transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                  fontFamily: 'inherit',
                  minWidth: 80,
                }}
              >
                {savingThreshold ? 'Saving...' : 'Save'}
              </button>
            </div>
          )
        })()}
      </div>

      {/* Block expiration duration */}
      <div
        data-onboarding="block-expiration"
        style={{
          ...cardStyle,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <h3 style={{ color: theme.heading, fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
            Block Expiration
          </h3>
          <p style={{ color: theme.textSecondary, fontSize: 13, margin: 0 }}>
            How long blocked IPs stay blocked before the block expires.
          </p>
        </div>
        <select
          value={blockDuration}
          disabled={savingDuration}
          onChange={(e) => saveDuration(e.target.value)}
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            border: `1px solid ${theme.tooltipBorder}`,
            background: theme.tableHeaderBg,
            color: theme.heading,
            fontSize: 13,
            fontWeight: 600,
            cursor: savingDuration ? 'wait' : 'pointer',
            outline: 'none',
          }}
        >
          <option value="never">Never</option>
          <option value="1d">1 Day</option>
          <option value="1w">1 Week</option>
          <option value="1m">1 Month</option>
        </select>
      </div>
      </div>

      {/* Attacker list with block/unblock buttons */}
      <div data-onboarding="block-detected-attackers" style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: 12, marginBottom: 14, flexWrap: 'wrap',
        }}>
          <h3 style={{ color: theme.heading, fontSize: 13, fontWeight: 700, margin: 0 }}>
            Detected Attackers
          </h3>
          {(() => {
            const hasFilters = aAction !== 'all' || aStatus !== 'all' || aCountry !== 'all'
            return (
              <button
                onClick={() => { setAAction('all'); setAStatus('all'); setACountry('all') }}
                disabled={!hasFilters}
                aria-hidden={!hasFilters}
                tabIndex={hasFilters ? 0 : -1}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 6,
                  border: `1px solid ${theme.blockBtnBorder}`,
                  background: theme.blockBtn,
                  color: theme.blockBtnText,
                  fontSize: 11, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.4px',
                  cursor: hasFilters ? 'pointer' : 'default',
                  fontFamily: 'inherit',
                  opacity: hasFilters ? 1 : 0,
                  transform: hasFilters ? 'scale(1)' : 'scale(0.8)',
                  transition: 'opacity 0.18s ease-out, transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  pointerEvents: hasFilters ? 'auto' : 'none',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Clear filters
              </button>
            )
          })()}
        </div>

        {attackers.length === 0 ? (
          <div style={{ color: theme.textSecondary, textAlign: 'center', padding: 30 }}>
            No attackers detected yet.
          </div>
        ) : (
          <div style={{ overflowY: 'auto', maxHeight: 400, borderRadius: 6, border: `1px solid ${theme.cardBorder}` }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <th style={thStyle}>IP Address</th>
                  <FilterTh
                    label="Country"
                    value={aCountry}
                    onChange={setACountry}
                    options={[
                      { value: 'all', label: 'All' },
                      ...countryOptions.map((c) => ({ value: c, label: c })),
                    ]}
                  />
                  <SortableTh
                    label="First Detected"
                    active={aSort.key === 'first_detected'}
                    dir={aSort.key === 'first_detected' ? aSort.dir : 'desc'}
                    onClick={() => toggleASort('first_detected')}
                  />
                  <SortableTh
                    label="Last Detected"
                    active={aSort.key === 'last_detected'}
                    dir={aSort.key === 'last_detected' ? aSort.dir : 'desc'}
                    onClick={() => toggleASort('last_detected')}
                  />
                  {autoBlockEnabled && (
                    <SortableTh
                      label="Chances Left"
                      active={aSort.key === 'chances_left'}
                      dir={aSort.key === 'chances_left' ? aSort.dir : 'desc'}
                      onClick={() => toggleASort('chances_left')}
                    />
                  )}
                  <FilterTh
                    label="Status"
                    value={aStatus}
                    onChange={(v) => setAStatus(v as typeof aStatus)}
                    options={[
                      { value: 'all', label: 'All' },
                      { value: 'blocked', label: 'Blocked' },
                      { value: 'not_blocked', label: 'Not blocked' },
                    ]}
                  />
                  <FilterTh
                    label="Action"
                    value={aAction}
                    onChange={(v) => setAAction(v as typeof aAction)}
                    options={[
                      { value: 'all', label: 'All' },
                      { value: 'block', label: 'Block' },
                      { value: 'unblock', label: 'Unblock' },
                    ]}
                  />
                </tr>
              </thead>
              <tbody>
                {filteredAttackers.length === 0 && (
                  <tr>
                    <td
                      colSpan={autoBlockEnabled ? 7 : 6}
                      style={{ ...tdStyle, textAlign: 'center', color: theme.textSecondary, padding: 30 }}
                    >
                      No attackers match the current filters.
                    </td>
                  </tr>
                )}
                {filteredAttackers.map((a, i) => {
                  const isBlocked = a.is_blocked === 'Blocked'
                  return (
                    <tr
                      key={a.ip}
                      style={{
                        background: i % 2 === 0 ? theme.tableRowEven : theme.tableRowOdd,
                        borderBottom: `1px solid ${theme.cardBorder}`,
                      }}
                    >
                      <td style={{ ...tdStyle, fontFamily: "'JetBrains Mono', 'Consolas', monospace", fontSize: 11 }}>{a.ip}</td>
                      <td style={tdStyle}>{a.country ?? '--'}</td>
                      <td style={tdStyle}>{a.initial_detection}</td>
                      <td style={tdStyle}>{a.last_detected}</td>
                      {autoBlockEnabled && (
                        <td style={{
                          ...tdStyle,
                          color: isBlocked ? theme.textSecondary : a.chances_left != null && a.chances_left <= 3 ? theme.error : theme.amber,
                          fontWeight: 600,
                        }}>
                          {isBlocked ? '--' : a.chances_left ?? '--'}
                        </td>
                      )}
                      <td style={{ ...tdStyle, color: isBlocked ? theme.error : theme.success }}>
                        {isBlocked ? 'Blocked' : 'Not blocked'}
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => isBlocked ? unblockIp(a.ip) : blockIp(a.ip)}
                          disabled={actionInProgress === a.ip}
                          style={{
                            padding: '5px 12px',
                            borderRadius: 6,
                            border: `1px solid ${isBlocked ? theme.unblockBtnBorder : theme.blockBtnBorder}`,
                            fontWeight: 600,
                            fontSize: 11,
                            cursor: actionInProgress === a.ip ? 'wait' : 'pointer',
                            color: isBlocked ? theme.unblockBtnText : theme.blockBtnText,
                            background: isBlocked ? theme.unblockBtn : theme.blockBtn,
                            transition: 'all 0.15s',
                            fontFamily: 'inherit',
                          }}
                        >
                          {actionInProgress === a.ip ? '...' : isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Blocklist history */}
      <div data-onboarding="block-history" style={cardStyle}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: 12, marginBottom: 14, flexWrap: 'wrap',
        }}>
          <h3 style={{ color: theme.heading, fontSize: 13, fontWeight: 700, margin: 0 }}>
            Block History
          </h3>
          {(() => {
            const hasFilters = hBlockedBy !== 'all' || hStatus !== 'all'
            return (
              <button
                onClick={() => { setHBlockedBy('all'); setHStatus('all') }}
                disabled={!hasFilters}
                aria-hidden={!hasFilters}
                tabIndex={hasFilters ? 0 : -1}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 6,
                  border: `1px solid ${theme.blockBtnBorder}`,
                  background: theme.blockBtn,
                  color: theme.blockBtnText,
                  fontSize: 11, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.4px',
                  cursor: hasFilters ? 'pointer' : 'default',
                  fontFamily: 'inherit',
                  opacity: hasFilters ? 1 : 0,
                  transform: hasFilters ? 'scale(1)' : 'scale(0.8)',
                  transition: 'opacity 0.18s ease-out, transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  pointerEvents: hasFilters ? 'auto' : 'none',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Clear filters
              </button>
            )
          })()}
        </div>

        {blocklist.length === 0 ? (
          <div style={{ color: theme.textSecondary, textAlign: 'center', padding: 30 }}>
            No blocks recorded yet.
          </div>
        ) : (
          <div style={{ overflowY: 'auto', maxHeight: 400, borderRadius: 6, border: `1px solid ${theme.cardBorder}` }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>IP Address</th>
                  <SortableTh
                    label="Block Date"
                    active={hSort.key === 'block_date'}
                    dir={hSort.key === 'block_date' ? hSort.dir : 'desc'}
                    onClick={() => toggleHSort('block_date')}
                  />
                  <FilterTh
                    label="Blocked By"
                    value={hBlockedBy}
                    onChange={setHBlockedBy}
                    options={[
                      { value: 'all', label: 'All' },
                      ...blockedByOptions.map((b) => ({ value: b, label: b })),
                    ]}
                  />
                  <SortableTh
                    label="Expiration"
                    active={hSort.key === 'expiration_date'}
                    dir={hSort.key === 'expiration_date' ? hSort.dir : 'desc'}
                    onClick={() => toggleHSort('expiration_date')}
                  />
                  <FilterTh
                    label="Status"
                    value={hStatus}
                    onChange={(v) => setHStatus(v as typeof hStatus)}
                    options={[
                      { value: 'all', label: 'All' },
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' },
                    ]}
                  />
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{ ...tdStyle, textAlign: 'center', color: theme.textSecondary, padding: 30 }}
                    >
                      No blocks match the current filters.
                    </td>
                  </tr>
                )}
                {filteredHistory.map((b, i) => (
                  <tr
                    key={b.block_id}
                    style={{
                      background: i % 2 === 0 ? theme.tableRowEven : theme.tableRowOdd,
                      borderBottom: `1px solid ${theme.cardBorder}`,
                    }}
                  >
                    <td style={tdStyle}>{b.block_id}</td>
                    <td style={{ ...tdStyle, fontFamily: "'JetBrains Mono', 'Consolas', monospace", fontSize: 11 }}>{b.ip}</td>
                    <td style={tdStyle}>{b.block_date}</td>
                    <td style={tdStyle}>{b.blocked_by ?? '--'}</td>
                    <td style={tdStyle}>{b.expiration_date ?? 'Never'}</td>
                    <td style={{ ...tdStyle, color: b.is_active === 'Block_active' ? theme.error : theme.textSecondary }}>
                      {b.is_active === 'Block_active' ? 'Active' : 'Inactive'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Blocking
