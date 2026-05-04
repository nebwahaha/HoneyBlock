import { useState, useEffect } from 'react'
import { useTheme, themes } from '../theme'
import NotificationBell from '../components/NotificationBell'

function Configurations() {
  const { theme, themeName, setThemeName } = useTheme()
  const [cowrieRunning, setCowrieRunning] = useState<boolean | null>(null)
  const [autoStart, setAutoStart] = useState<boolean | null>(null)
  const [autoBlock, setAutoBlock] = useState<boolean | null>(null)
  const [toggling, setToggling] = useState(false)
  const [togglingAuto, setTogglingAuto] = useState(false)
  const [togglingAutoBlock, setTogglingAutoBlock] = useState(false)
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)

  const fetchStatus = async () => {
    try {
      const [cowrieRes, autoRes, autoBlockRes] = await Promise.all([
        fetch('/api/cowrie/status'),
        fetch('/api/autostart/status'),
        fetch('/api/autoblock/status'),
      ])
      if (cowrieRes.ok) {
        const data = await cowrieRes.json()
        setCowrieRunning(data.running)
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
    padding: '12px 16px',
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 14,
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
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 16 }}>
        <NotificationBell />
      </div>

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

      <div style={rowCard}>
        <div style={iconBox(!!cowrieRunning)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
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

      {/* ─── Automation ─── */}
      <div style={{ ...sectionLabel, marginTop: 14 }}>Automation</div>

      <div style={rowCard}>
        <div style={iconBox(!!autoStart)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
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
        <div style={{ flex: 1 }}>
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

      {/* ─── Themes ─── */}
      {(() => {
        const allThemes = Object.values(themes)
        const darkThemes = allThemes.filter(t => t.kind === 'dark')
        const lightThemes = allThemes.filter(t => t.kind === 'light')

        const renderThemeButton = (t: typeof allThemes[number]) => {
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
          </>
        )
      })()}
    </div>
  )
}

export default Configurations
