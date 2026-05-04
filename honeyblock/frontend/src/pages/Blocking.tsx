import { useState, useEffect } from 'react'
import type { Attacker, BlockEntry } from '../types'
import { useTheme } from '../theme'
import NotificationBell from '../components/NotificationBell'

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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 24 }}>
        <NotificationBell />
      </div>

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
              <span style={{ color: theme.textSecondary }}> — enable it in Configurations.</span>
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
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h3 style={{ color: theme.heading, fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
          Detected Attackers
        </h3>

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
                  <th style={thStyle}>Country</th>
                  <th style={thStyle}>First Detected</th>
                  <th style={thStyle}>Last Detected</th>
                  {autoBlockEnabled && <th style={thStyle}>Chances Left</th>}
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {attackers.map((a, i) => {
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
      <div style={cardStyle}>
        <h3 style={{ color: theme.heading, fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
          Block History
        </h3>

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
                  <th style={thStyle}>Block Date</th>
                  <th style={thStyle}>Blocked By</th>
                  <th style={thStyle}>Expiration</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {blocklist.map((b, i) => (
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
