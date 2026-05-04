import { useState, useEffect } from 'react'
import { useTheme } from '../theme'
import CustomThemeModal from '../components/CustomThemeModal'

function Configurations() {
  const { theme, themeName, setThemeName, allThemes, customTheme } = useTheme()
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [cowrieRunning, setCowrieRunning] = useState<boolean | null>(null)
  const [watcherRunning, setWatcherRunning] = useState<boolean | null>(null)
  const [autoStart, setAutoStart] = useState<boolean | null>(null)
  const [autoBlock, setAutoBlock] = useState<boolean | null>(null)
  const [toggling, setToggling] = useState(false)
  const [togglingWatcher, setTogglingWatcher] = useState(false)
  const [restartingWatcher, setRestartingWatcher] = useState(false)
  const [togglingAuto, setTogglingAuto] = useState(false)
  const [togglingAutoBlock, setTogglingAutoBlock] = useState(false)
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)

  const fetchStatus = async () => {
    try {
      const [cowrieRes, watcherRes, autoRes, autoBlockRes] = await Promise.all([
        fetch('/api/cowrie/status'),
        fetch('/api/watcher/status'),
        fetch('/api/autostart/status'),
        fetch('/api/autoblock/status'),
      ])
      if (cowrieRes.ok) {
        const data = await cowrieRes.json()
        setCowrieRunning(data.running)
      }
      if (watcherRes.ok) {
        const data = await watcherRes.json()
        setWatcherRunning(data.running)
      }
      if (autoRes.ok) {
        const data = await autoRes.json()
        setAutoStart(data.enabled)
      }
      if (autoBlockRes.ok) {
        const data = await autoBlockRes.json()
        setAutoBlock(data.enabled)
      }
    } catch {
      // retry next interval
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 10_000)
    return () => clearInterval(interval)
  }, [])

  const toggleCowrie = async () => {
    setToggling(true)
    setMessage(null)
    try {
      const res = await fetch('/api/cowrie/toggle', { method: 'POST' })
      const data = await res.json()
      setCowrieRunning(data.running)
      setMessage({
        text: data.message ?? (data.running ? 'Cowrie started' : 'Cowrie stopped'),
        error: !res.ok,
      })
    } catch {
      setMessage({ text: 'Failed to toggle Cowrie', error: true })
    } finally {
      setToggling(false)
    }
  }

  const toggleWatcher = async () => {
    setTogglingWatcher(true)
    setMessage(null)
    try {
      const res = await fetch('/api/watcher/toggle', { method: 'POST' })
      const data = await res.json()
      setWatcherRunning(data.running)
      setMessage({
        text: data.message ?? (data.running ? 'Log watcher started' : 'Log watcher stopped'),
        error: !res.ok,
      })
    } catch {
      setMessage({ text: 'Failed to toggle log watcher', error: true })
    } finally {
      setTogglingWatcher(false)
    }
  }

  const restartWatcher = async () => {
    setRestartingWatcher(true)
    setMessage(null)
    try {
      const res = await fetch('/api/watcher/restart', { method: 'POST' })
      const data = await res.json()
      setWatcherRunning(data.running)
      setMessage({
        text: data.message ?? 'Log watcher restarted',
        error: !res.ok,
      })
    } catch {
      setMessage({ text: 'Failed to restart log watcher', error: true })
    } finally {
      setRestartingWatcher(false)
    }
  }

  const toggleAutoBlock = async () => {
    setTogglingAutoBlock(true)
    setMessage(null)
    try {
      const res = await fetch('/api/autoblock/toggle', { method: 'POST' })
      const data = await res.json()
      setAutoBlock(data.enabled)
      setMessage({
        text: data.enabled ? 'Automatic blocking enabled' : 'Automatic blocking disabled',
        error: !res.ok,
      })
    } catch {
      setMessage({ text: 'Failed to toggle automatic blocking', error: true })
    } finally {
      setTogglingAutoBlock(false)
    }
  }

  const toggleAutoStart = async () => {
    setTogglingAuto(true)
    setMessage(null)
    try {
      const res = await fetch('/api/autostart/toggle', { method: 'POST' })
      const data = await res.json()
      setAutoStart(data.enabled)
      setMessage({
        text: data.message ?? (data.enabled ? 'Auto-start enabled' : 'Auto-start disabled'),
        error: !res.ok,
      })
    } catch {
      setMessage({ text: 'Failed to toggle auto-start', error: true })
    } finally {
      setTogglingAuto(false)
    }
  }

  const sectionLabel: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: theme.textTertiary,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    marginBottom: 8,
  }

  const rowCard: React.CSSProperties = {
    background: theme.cardBg,
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: 10,
    padding: '16px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    minWidth: 0,
  }

  const grid2Col: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: 10,
  }

  const iconBox = (active: boolean): React.CSSProperties => ({
    width: 34,
    height: 34,
    borderRadius: 8,
    flexShrink: 0,
    background: active ? `${theme.brand}18` : theme.btnBg,
    border: `1px solid ${active ? theme.brand + '33' : theme.cardBorder}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: active ? theme.brand : theme.textTertiary,
    transition: 'all 0.2s',
  })

  /* Animated toggle switch */
  const Toggle = ({ on, onClick, disabled }: { on: boolean | null; onClick: () => void; disabled?: boolean }) => {
    const isOn = !!on
    return (
      <div
        onClick={() => { if (!disabled) onClick() }}
        style={{
          width: 38,
          height: 20,
          borderRadius: 10,
          background: isOn ? `${theme.brand}28` : `${theme.cardBorder}55`,
          border: `1px solid ${isOn ? theme.brand + '55' : theme.cardBorder}`,
          position: 'relative',
          cursor: disabled ? 'wait' : 'pointer',
          transition: 'all 0.22s',
          flexShrink: 0,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 2,
            left: isOn ? 18 : 2,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: isOn ? theme.brand : theme.textTertiary,
            transition: 'left 0.22s cubic-bezier(0.34,1.56,0.64,1), background 0.22s',
            boxShadow: isOn ? `0 0 8px ${theme.brand}88` : undefined,
          }}
        />
      </div>
    )
  }

  return (
    <div>
      {message && (
        <div
          style={{
            padding: '9px 14px',
            marginBottom: 12,
            borderRadius: 8,
            fontSize: 12,
            fontFamily: "'JetBrains Mono', 'Consolas', monospace",
            background: message.error ? theme.messageBgError : theme.messageBgSuccess,
            color: message.error ? theme.error : theme.success,
            border: `1px solid ${message.error ? theme.error + '30' : theme.success + '30'}`,
          }}
        >
          {message.text}
        </div>
      )}

      {/* ─── Service Controls ─── */}
      <div style={sectionLabel}>Service Controls</div>

      <div style={grid2Col}>
      <div style={rowCard}>
        <div style={iconBox(!!cowrieRunning)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: theme.heading }}>Cowrie Honeypot</div>
          <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 1 }}>
            SSH/Telnet honeypot service ·{' '}
            <span style={{ color: cowrieRunning ? theme.success : theme.error, fontWeight: 600 }}>
              {cowrieRunning === null ? 'Checking…' : cowrieRunning ? 'Running' : 'Stopped'}
            </span>
          </div>
        </div>
        <button
          onClick={toggleCowrie}
          disabled={toggling || cowrieRunning === null}
          style={{
            padding: '7px 16px',
            border: `1px solid ${cowrieRunning ? theme.blockBtnBorder : theme.unblockBtnBorder}`,
            borderRadius: 7,
            background: cowrieRunning ? theme.blockBtn : theme.unblockBtn,
            color: cowrieRunning ? theme.blockBtnText : theme.unblockBtnText,
            fontSize: 12,
            fontWeight: 600,
            cursor: toggling ? 'wait' : 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.15s',
            minWidth: 80,
          }}
        >
          {toggling ? '…' : cowrieRunning ? 'Stop' : 'Start'}
        </button>
      </div>

      {/* Log watcher */}
      <div style={rowCard}>
        <div style={iconBox(!!watcherRunning)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: theme.heading }}>Log Watcher</div>
          <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 1 }}>
            Tails Cowrie logs into the database ·{' '}
            <span style={{ color: watcherRunning ? theme.success : theme.error, fontWeight: 600 }}>
              {watcherRunning === null ? 'Checking…' : watcherRunning ? 'Running' : 'Stopped'}
            </span>
          </div>
        </div>
        <button
          onClick={restartWatcher}
          disabled={restartingWatcher || togglingWatcher || watcherRunning === null}
          title="Restart the log watcher"
          aria-label="Restart log watcher"
          style={{
            width: 36,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${theme.btnBorder}`,
            borderRadius: 7,
            background: theme.btnBg,
            color: restartingWatcher ? theme.brand : theme.btnText,
            cursor: restartingWatcher ? 'wait' : 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              animation: restartingWatcher ? 'spin 0.9s linear infinite' : undefined,
              transformOrigin: 'center',
            }}
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </button>
        <button
          onClick={toggleWatcher}
          disabled={togglingWatcher || restartingWatcher || watcherRunning === null}
          style={{
            padding: '7px 16px',
            border: `1px solid ${watcherRunning ? theme.blockBtnBorder : theme.unblockBtnBorder}`,
            borderRadius: 7,
            background: watcherRunning ? theme.blockBtn : theme.unblockBtn,
            color: watcherRunning ? theme.blockBtnText : theme.unblockBtnText,
            fontSize: 12,
            fontWeight: 600,
            cursor: togglingWatcher ? 'wait' : 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.15s',
            minWidth: 80,
          }}
        >
          {togglingWatcher ? '…' : watcherRunning ? 'Stop' : 'Start'}
        </button>
      </div>
      </div>

      {/* ─── Automation ─── */}
      <div style={{ ...sectionLabel, marginTop: 14 }}>Automation</div>

      <div style={grid2Col}>
      <div style={rowCard}>
        <div style={iconBox(!!autoStart)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: theme.heading }}>Auto-Start on Boot</div>
          <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 1 }}>
            Start services when system boots ·{' '}
            <span style={{ color: autoStart ? theme.success : theme.textTertiary, fontWeight: 600 }}>
              {autoStart === null ? 'Checking…' : autoStart ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
        <Toggle on={autoStart} onClick={toggleAutoStart} disabled={togglingAuto || autoStart === null} />
      </div>

      <div style={rowCard}>
        <div style={iconBox(!!autoBlock)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: theme.heading }}>Automatic Blocking</div>
          <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 1 }}>
            Block IPs past session threshold ·{' '}
            <span style={{ color: autoBlock ? theme.success : theme.textTertiary, fontWeight: 600 }}>
              {autoBlock === null ? 'Checking…' : autoBlock ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
        <Toggle on={autoBlock} onClick={toggleAutoBlock} disabled={togglingAutoBlock || autoBlock === null} />
      </div>
      </div>

      {/* ─── Themes ─── */}
      {(() => {
        const allList = Object.values(allThemes).filter(t => t.name !== 'custom')
        const darkThemes = allList.filter(t => t.kind === 'dark')
        const lightThemes = allList.filter(t => t.kind === 'light')

        const renderThemeButton = (t: typeof allList[number]) => {
          const isActive = t.name === themeName
          return (
            <button
              key={t.name}
              onClick={() => setThemeName(t.name)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 8,
                border: `1px solid ${isActive ? t.brand + '66' : theme.cardBorder}`,
                background: isActive ? `${t.brand}12` : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: 'inherit',
              }}
            >
              <div style={{ display: 'flex', gap: 3 }}>
                {[t.pageBg, t.cardBg, t.brand].map((c, i) => (
                  <div
                    key={i}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: c,
                      border: `1px solid ${theme.cardBorder}`,
                    }}
                  />
                ))}
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? theme.heading : theme.textSecondary,
                }}
              >
                {t.label}
              </span>
            </button>
          )
        }

        const groupCard: React.CSSProperties = {
          background: theme.cardBg,
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: 10,
          padding: '12px 16px',
        }

        return (
          <>
            <div style={{ ...sectionLabel, marginTop: 14 }}>Dark Themes</div>
            <div style={groupCard}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {darkThemes.map(renderThemeButton)}
              </div>
            </div>

            <div style={{ ...sectionLabel, marginTop: 14 }}>Light Themes</div>
            <div style={groupCard}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {lightThemes.map(renderThemeButton)}
              </div>
            </div>

            <div style={{ ...sectionLabel, marginTop: 14 }}>Custom Theme</div>
            <div style={groupCard}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 10,
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  {customTheme ? (
                    renderThemeButton(customTheme)
                  ) : (
                    <span style={{ fontSize: 12, color: theme.textSecondary }}>
                      You haven't created a custom theme yet.
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setCustomizeOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: `1px solid ${theme.brand}55`,
                    background: `${theme.brand}12`,
                    color: theme.brand,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 19l7-7 3 3-7 7-3-3z" />
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                    <path d="M2 2l7.586 7.586" />
                    <circle cx="11" cy="11" r="2" />
                  </svg>
                  {customTheme ? 'Edit custom theme' : 'Create custom theme'}
                </button>
              </div>
            </div>
          </>
        )
      })()}

      <CustomThemeModal open={customizeOpen} onClose={() => setCustomizeOpen(false)} />
    </div>
  )
}

export default Configurations
