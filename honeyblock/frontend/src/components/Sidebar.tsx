import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../theme'
import { ONBOARDING_OPEN_EVENT } from './OnboardingTutorial'

function Sidebar() {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [tourHover, setTourHover] = useState(false)

  const startTour = () => {
    // Manual replays are scoped to the page the user is currently on. If we
    // are on a known route, send only that section's steps; otherwise route to
    // the dashboard and run the dashboard tour from there.
    const sectionByPath: Record<string, 'dashboard' | 'blocking' | 'configurations'> = {
      '/': 'dashboard',
      '/blocking': 'blocking',
      '/configurations': 'configurations',
    }
    const section = sectionByPath[location.pathname]
    if (!section) {
      navigate('/')
      requestAnimationFrame(() => {
        window.dispatchEvent(new CustomEvent(ONBOARDING_OPEN_EVENT, { detail: { section: 'dashboard' } }))
      })
    } else {
      window.dispatchEvent(new CustomEvent(ONBOARDING_OPEN_EVENT, { detail: { section } }))
    }
  }

  const navItem = (
    to: string,
    label: string,
    icon: React.ReactNode,
    end?: boolean,
    onboardingId?: string,
  ) => (
    <NavLink
      to={to}
      end={end}
      data-onboarding={onboardingId}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '9px 12px',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 500,
        color: isActive ? theme.navActiveText : theme.navText,
        background: isActive ? theme.navActiveBg : 'transparent',
        border: `1px solid ${isActive ? theme.brand + '22' : 'transparent'}`,
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        position: 'relative',
        transition: 'background 0.15s, color 0.15s, border-color 0.15s',
      })}
    >
      {({ isActive }) => (
        <>
          <span style={{ color: isActive ? theme.brand : theme.navText, transition: 'color 0.15s', flexShrink: 0, display: 'inline-flex' }}>
            {icon}
          </span>
          {label}
          {isActive && (
            <span
              style={{
                position: 'absolute',
                left: 0,
                top: '20%',
                bottom: '20%',
                width: 2,
                borderRadius: '0 2px 2px 0',
                background: theme.brand,
                boxShadow: `0 0 8px ${theme.brand}`,
              }}
            />
          )}
        </>
      )}
    </NavLink>
  )

  return (
    <aside
      style={{
        width: 180,
        height: '100vh',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        background: theme.sidebarBg,
        borderRight: `1px solid ${theme.sidebarBorder}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 10px',
      }}
    >
      {/* Brand wordmark + version */}
      <div style={{ padding: '0 8px 18px', borderBottom: `1px solid ${theme.sidebarBorder}`, marginBottom: 14 }}>
        <div
          style={{
            color: theme.brand,
            fontFamily: "'Bungee', cursive",
            fontSize: 20,
            letterSpacing: '0.5px',
            lineHeight: 1.2,
          }}
        >
          HoneyBlock
        </div>
        <div
          style={{
            color: theme.textTertiary,
            fontFamily: "'JetBrains Mono', 'Consolas', monospace",
            fontSize: 9,
            letterSpacing: '1px',
            marginTop: 3,
          }}
        >
          v2.0.1
        </div>
      </div>

      {/* Live indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '0 8px 14px',
          borderBottom: `1px solid ${theme.sidebarBorder}`,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: theme.success,
            color: theme.success,
            flexShrink: 0,
            animation: 'pulse-dot 2s ease-in-out infinite',
          }}
        />
        <span style={{ fontSize: 10, color: theme.textSecondary, fontFamily: "'JetBrains Mono', 'Consolas', monospace", whiteSpace: 'nowrap' }}>
          Live · localhost:5000
        </span>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItem(
          '/',
          'Dashboard',
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>,
          true,
          'nav-dashboard',
        )}
        {navItem(
          '/blocking',
          'Blocking',
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>,
          false,
          'nav-blocking',
        )}
        {navItem(
          '/configurations',
          'Configurations',
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>,
          false,
          'nav-configurations',
        )}
      </nav>

      {/* "Take a Tour" — replays the onboarding tutorial. Sits just above the
          admin chip; uses the theme's brand color so it picks up whatever
          accent the user has chosen. */}
      <button
        onClick={startTour}
        onMouseEnter={() => setTourHover(true)}
        onMouseLeave={() => setTourHover(false)}
        style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          width: '100%',
          padding: '8px 10px',
          borderRadius: 8,
          background: tourHover ? theme.navActiveBg : 'transparent',
          border: `1px solid ${tourHover ? theme.brand + '44' : theme.brand + '22'}`,
          color: theme.brand,
          fontSize: 12,
          fontWeight: 600,
          fontFamily: 'inherit',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background 0.15s, border-color 0.15s',
        }}
        title="Replay the tutorial for this page"
      >
        <span style={{ flexShrink: 0, display: 'inline-flex', color: theme.brand }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </span>
        Take a Tour
      </button>

      {/* Footer admin chip */}
      <div
        style={{
          marginTop: 8,
          padding: '14px 8px 0',
          borderTop: `1px solid ${theme.sidebarBorder}`,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: theme.navActiveBg,
            border: `1px solid ${theme.brand}33`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.brand,
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: theme.heading }}>Admin</div>
          <div
            style={{
              fontSize: 10,
              color: theme.textTertiary,
              fontFamily: "'JetBrains Mono', 'Consolas', monospace",
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            root@honeypot
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
