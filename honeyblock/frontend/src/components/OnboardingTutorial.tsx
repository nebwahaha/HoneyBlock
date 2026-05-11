import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../theme'

const STORAGE_KEY = 'hb_onboarding_seen'

/** Fire on `window` to manually open the tutorial (e.g. from a sidebar
 * "Take a Tour" button). Bypasses the localStorage first-launch gate.
 *
 * Optional `detail.section` scopes the tour to a single page's steps. Omit
 * to run the full tour. */
export const ONBOARDING_OPEN_EVENT = 'hb-onboarding-start'

type Section = 'dashboard' | 'blocking' | 'configurations' | 'transition'

interface Step {
  id: string
  /** Pathname where this step's target lives. The tutorial routes here automatically. */
  page: string
  /** Used for filtering the step list when a manual tour is opened from a single page. */
  section: Section
  title: string
  body: string
  /** Renders the bubble with warning styling (amber border, warning icon). */
  warning?: boolean
}

const STEPS: Step[] = [
  // ─── Dashboard ───
  {
    id: 'status-pills',
    page: '/',
    section: 'dashboard',
    title: 'System Status',
    body: 'This indicator in the top-right shows whether Cowrie (the honeypot) is running. A pulsing green dot means the service is healthy and ingesting events.',
  },
  {
    id: 'dash-time-filter',
    page: '/',
    section: 'dashboard',
    title: 'Time Range',
    body: 'Scopes every chart, table, and stat card on this page to a time window — All Time, Today, This Week, This Month, or This Year. Useful for spotting recent surges or comparing periods.',
  },
  {
    id: 'dash-refresh',
    page: '/',
    section: 'dashboard',
    title: 'Manual Refresh',
    body: 'Forces an immediate pull of the latest data. The dashboard already auto-refreshes every 15 seconds, but tap this if you want a fresh snapshot right now.',
  },
  {
    id: 'dash-live-logs',
    page: '/',
    section: 'dashboard',
    title: 'Live Logs',
    body: 'Slides up a streaming feed of every event the honeypot is capturing in real time. A red dot on the icon means new events have arrived since you last opened the panel.',
  },
  {
    id: 'dash-notifications',
    page: '/',
    section: 'dashboard',
    title: 'Notifications',
    body: 'Recent block / unblock activity and other system notifications land here. The bell shows a badge whenever something new happens so nothing slips by unnoticed.',
  },
  {
    id: 'stat-total-sessions',
    page: '/',
    section: 'dashboard',
    title: 'Total Sessions',
    body: 'The total number of attack sessions captured — every login attempt, command run, and connection attackers made on the honeypot rolls up into this number.',
  },
  {
    id: 'stat-unique-ips',
    page: '/',
    section: 'dashboard',
    title: 'Unique IPs',
    body: 'How many distinct attacker IP addresses you have seen. Click the card to open the full list and drill into any single IP for its activity.',
  },
  {
    id: 'stat-blocked-ips',
    page: '/',
    section: 'dashboard',
    title: 'Blocked IPs',
    body: 'IPs that currently have an active block in place. Click the card to view the full block list — useful for auditing or unblocking by mistake.',
  },
  {
    id: 'stat-active-sessions',
    page: '/',
    section: 'dashboard',
    title: 'Active Sessions',
    body: 'Live attacker sessions happening right now. Click to inspect them in real time and block on the spot.',
  },
  {
    id: 'top-attackers',
    page: '/',
    section: 'dashboard',
    title: 'Top 5 Attacker IPs',
    body: 'The five most aggressive IPs in the selected time range. Use the toggle button in the corner to swap this card to a Protocols breakdown showing how attacks are distributed across SSH, Telnet, etc.',
  },
  {
    id: 'general-location',
    page: '/',
    section: 'dashboard',
    title: 'Geography of Attacks',
    body: 'A world map plotting where attacks originate. Click "Countries" to switch to a country pie chart, and click any marker or slice to drill into the attackers from that location.',
  },
  {
    id: 'top-creds',
    page: '/',
    section: 'dashboard',
    title: 'Top Usernames & Passwords',
    body: 'The most-tried usernames in the honeypot. Toggle to see the most-tried passwords — a great window into the credential dictionaries attackers are using.',
  },
  {
    id: 'events-histogram',
    page: '/',
    section: 'dashboard',
    title: 'Honeypot Events Histogram',
    body: 'A timeline of honeypot activity. Spikes here often correlate with new scanning campaigns or worms targeting your environment.',
  },
  {
    id: 'common-commands',
    page: '/',
    section: 'dashboard',
    title: 'Commands Executed',
    body: 'The most common shell commands attackers ran once they "got in". This is where you see what they are actually after — credential theft, crypto miners, recon, etc.',
  },

  // ─── Transition: head over to Blocking ───
  {
    id: 'nav-blocking',
    page: '/',
    section: 'transition',
    title: 'Next: Blocking',
    body: "We'll head to the Blocking page next, where you manage which attacker IPs get cut off. Hit Next to jump there.",
  },

  // ─── Blocking page ───
  {
    id: 'block-session-limit',
    page: '/blocking',
    section: 'blocking',
    title: 'Session Limit',
    body: 'The number of attack sessions an IP can rack up before automatic blocking kicks in. Lower numbers cut off aggressive scanners faster, higher numbers give noisy clients more rope.',
  },
  {
    id: 'block-expiration',
    page: '/blocking',
    section: 'blocking',
    title: 'Block Expiration',
    body: 'How long blocks stay in effect — Never (permanent), 1 Day, 1 Week, or 1 Month. Use shorter durations if you want legit IPs caught by mistake to recover automatically.',
  },
  {
    id: 'block-detected-attackers',
    page: '/blocking',
    section: 'blocking',
    title: 'Detected Attackers',
    body: 'Every IP the honeypot has seen, with country, first/last activity, and (when auto-block is on) the chances left before the block triggers. Use the Block / Unblock buttons here for manual control.',
  },
  {
    id: 'block-history',
    page: '/blocking',
    section: 'blocking',
    title: 'Block History',
    body: 'A historical record of every block ever applied — who blocked, when, and when it expires. Good for audits and for unwinding past mistakes.',
  },

  // ─── Transition: head over to Configurations ───
  {
    id: 'nav-configurations',
    page: '/blocking',
    section: 'transition',
    title: 'Next: Configurations',
    body: "Last stop — the Configurations page covers service controls, automation toggles, and themes.",
  },

  // ─── Configurations page ───
  {
    id: 'cfg-service-controls',
    page: '/configurations',
    section: 'configurations',
    title: 'Service Controls',
    body: 'Start and stop the Cowrie honeypot from here. The Log Watcher that feeds your dashboard runs on its own in the background — no controls needed.',
  },
  {
    id: 'cfg-automation',
    page: '/configurations',
    section: 'configurations',
    title: 'Automation',
    body: 'Auto-Start runs the services automatically when the system boots. Automatic Blocking blocks any IP that exceeds the session limit you set on the Blocking page — set it and forget it.',
  },
  {
    id: 'cfg-themes',
    page: '/configurations',
    section: 'configurations',
    title: 'Themes',
    body: 'Switch between built-in dark and light themes. Click any swatch to apply it instantly — your choice is remembered the next time you open HoneyBlock.',
  },
  {
    id: 'cfg-custom-theme',
    page: '/configurations',
    section: 'configurations',
    title: 'Custom Theme',
    body: 'Want your own palette? Open the Custom Theme builder to pick page, card, sidebar, and brand colors and save them as a theme of your own.',
  },
]

const BUBBLE_WIDTH = 340
const BUBBLE_PAD = 14
const SPOTLIGHT_PAD = 8

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

function getTargetRect(id: string): Rect | null {
  const el = document.querySelector(`[data-onboarding="${id}"]`)
  if (!el) return null
  const r = (el as HTMLElement).getBoundingClientRect()
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

interface OnboardingTutorialProps {
  /** Optional external trigger — when toggled true, the tutorial opens regardless of localStorage. */
  forceOpen?: boolean
  onClose?: () => void
}

function OnboardingTutorial({ forceOpen, onClose }: OnboardingTutorialProps) {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const [active, setActive] = useState(false)
  const [stepIdx, setStepIdx] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)
  const [mounted, setMounted] = useState(false)
  /** When set, scopes the tour to a single page's steps (skips transitions). */
  const [scope, setScope] = useState<Section | null>(null)
  /** True only for the auto-launched first-time tour. Manual replays don't
   * trigger the welcome modal. */
  const [wasFirstLaunch, setWasFirstLaunch] = useState(false)
  /** Welcome modal shown once after the first-launch full tour completes. */
  const [showWelcome, setShowWelcome] = useState(false)
  const tickRef = useRef<number | null>(null)

  // Steps to actually walk through, derived from `scope`.
  const steps = useMemo(() => {
    if (!scope) return STEPS
    return STEPS.filter(s => s.section === scope)
  }, [scope])

  // Open on first launch (full tour) or when forceOpen flips on.
  useEffect(() => {
    if (forceOpen) {
      setScope(null)
      setStepIdx(0)
      setWasFirstLaunch(false)
      setActive(true)
      return
    }
    try {
      const seen = localStorage.getItem(STORAGE_KEY)
      if (!seen) {
        // Small delay so the dashboard skeleton has time to swap to real content
        // before we start measuring rects.
        const t = setTimeout(() => {
          setScope(null)
          setStepIdx(0)
          setWasFirstLaunch(true)
          setActive(true)
        }, 1800)
        return () => clearTimeout(t)
      }
    } catch { /* ignore */ }
  }, [forceOpen])

  // Listen for a manual "open tutorial" event (fired by the sidebar "Take a
  // Tour" button). The event detail can specify a section to scope the tour.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ section?: Section }>).detail
      const requestedScope = detail?.section ?? null
      // Only allow per-page scopes; transitions are an internal concept.
      const safeScope = requestedScope === 'transition' ? null : requestedScope
      setScope(safeScope)
      setStepIdx(0)
      setWasFirstLaunch(false)
      setActive(true)
    }
    window.addEventListener(ONBOARDING_OPEN_EVENT, onOpen)
    return () => window.removeEventListener(ONBOARDING_OPEN_EVENT, onOpen)
  }, [])

  // Track visibility for fade-in.
  useEffect(() => {
    if (active) {
      const t = setTimeout(() => setMounted(true), 20)
      return () => clearTimeout(t)
    }
    setMounted(false)
  }, [active])

  const step = steps[stepIdx] ?? steps[0]

  // Auto-navigate when the current step lives on a different page.
  useEffect(() => {
    if (!active || !step) return
    if (step.page !== location.pathname) {
      navigate(step.page)
    }
  }, [active, step, location.pathname, navigate])

  // Re-measure target on every step change. Some targets only mount after data
  // loads (or after a route change), so we poll briefly until the element appears.
  const measure = useCallback(() => {
    if (!active || !step) return
    const r = getTargetRect(step.id)
    setRect(r)
  }, [active, step])

  useLayoutEffect(() => {
    if (!active || !step) return
    measure()
    let elapsed = 0
    const id = window.setInterval(() => {
      const r = getTargetRect(step.id)
      if (r) setRect(r)
      elapsed += 100
      // Poll up to ~3.5s — covers route transitions + lazy data loads.
      if (elapsed > 3500 || r) {
        window.clearInterval(id)
      }
    }, 100)
    return () => window.clearInterval(id)
  }, [active, step, measure])

  useEffect(() => {
    if (!active) return
    const onResize = () => {
      if (tickRef.current) cancelAnimationFrame(tickRef.current)
      tickRef.current = requestAnimationFrame(measure)
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize, true)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize, true)
      if (tickRef.current) cancelAnimationFrame(tickRef.current)
    }
  }, [active, measure])

  const finish = useCallback((completed: boolean = false) => {
    try { localStorage.setItem(STORAGE_KEY, '1') } catch { /* ignore */ }
    setActive(false)
    setStepIdx(0)
    // The "welcome to HoneyBlock" splash only appears the very first time the
    // app is opened AND only if the user actually walked through the full tour
    // (skipping doesn't count). Manual replays never trigger it.
    if (wasFirstLaunch && completed) {
      if (location.pathname !== '/') navigate('/')
      // Wait for the tutorial fade-out + any page slide before showing the
      // welcome so the transitions don't stack on top of each other.
      setTimeout(() => setShowWelcome(true), 380)
    }
    setScope(null)
    setWasFirstLaunch(false)
    onClose?.()
  }, [wasFirstLaunch, location.pathname, navigate, onClose])

  // Keyboard navigation.
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish(false)
      else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (stepIdx < steps.length - 1) setStepIdx(stepIdx + 1)
        else finish(true)
      } else if (e.key === 'ArrowLeft') {
        if (stepIdx > 0) setStepIdx(stepIdx - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, stepIdx, steps.length, finish])

  if (!active && !showWelcome) return null

  // Welcome modal — rendered after the first-launch tour completes. Uses the
  // sidebar's Bungee wordmark for the HoneyBlock title so it feels like the
  // brand "saying hello".
  const welcomePortal = showWelcome ? createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: theme.kind === 'dark' ? 'rgba(0,0,0,0.78)' : 'rgba(15,20,30,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'welcome-fade 280ms ease',
      }}
    >
      <div
        style={{
          background: theme.cardBg,
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: 16,
          padding: '36px 44px',
          width: 460,
          maxWidth: '92vw',
          textAlign: 'center',
          boxShadow: `0 24px 64px ${theme.shadow}, 0 0 0 1px ${theme.brand}33`,
          animation: 'welcome-pop 420ms cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <div
          style={{
            color: theme.textTertiary,
            fontSize: 11,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 10,
          }}
        >
          Welcome to
        </div>
        <div
          style={{
            color: theme.brand,
            fontFamily: "'Bungee', cursive",
            fontSize: 48,
            letterSpacing: '0.5px',
            lineHeight: 1.1,
            marginBottom: 16,
            textShadow: `0 0 32px ${theme.brand}33`,
          }}
        >
          HoneyBlock
        </div>
        <div
          style={{
            color: theme.textSecondary,
            fontSize: 13,
            lineHeight: 1.6,
            marginBottom: 26,
          }}
        >
          Your honeypot dashboard is ready. Cowrie is listening for attackers, and you'll see who they are, where they came from, and what they tried, all in real time.
        </div>
        <button
          onClick={() => setShowWelcome(false)}
          onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.08)')}
          onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(1)')}
          style={{
            padding: '11px 32px',
            borderRadius: 9,
            background: theme.brand,
            border: `1px solid ${theme.brand}`,
            color: theme.kind === 'dark' ? '#0c0c0c' : '#ffffff',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            letterSpacing: '0.3px',
            transition: 'filter 0.15s',
          }}
        >
          Get Started
        </button>
      </div>
    </div>,
    document.body,
  ) : null

  // Tutorial overlay — only rendered while a tour is in progress. The geometry
  // calc lives inside this branch so we don't compute layout while idle.
  let tutorialPortal: React.ReactNode = null
  if (active && step) {
    const vw = window.innerWidth
    const vh = window.innerHeight

    const hasRect = !!rect
    const spotTop = (rect?.top ?? vh / 2) - SPOTLIGHT_PAD
    const spotLeft = (rect?.left ?? vw / 2) - SPOTLIGHT_PAD
    const spotW = (rect?.width ?? 0) + SPOTLIGHT_PAD * 2
    const spotH = (rect?.height ?? 0) + SPOTLIGHT_PAD * 2

    const spaceBelow = vh - (spotTop + spotH)
    const spaceAbove = spotTop
    const placeBelow = spaceBelow >= 200 || spaceBelow >= spaceAbove
    const bubbleTop = placeBelow
      ? Math.min(vh - 240, spotTop + spotH + 12)
      : Math.max(12, spotTop - 12 - 220)
    let bubbleLeft = spotLeft + spotW / 2 - BUBBLE_WIDTH / 2
    bubbleLeft = Math.max(12, Math.min(vw - BUBBLE_WIDTH - 12, bubbleLeft))

    const targetCenterX = spotLeft + spotW / 2
    const arrowLeft = Math.max(20, Math.min(BUBBLE_WIDTH - 20, targetCenterX - bubbleLeft))

    const isFirst = stepIdx === 0
    const isLast = stepIdx === steps.length - 1

    const overlayColor = theme.kind === 'dark' ? 'rgba(0,0,0,0.62)' : 'rgba(15,20,30,0.45)'
    const isWarning = !!step.warning
    const accent = isWarning ? theme.amber : theme.brand

    tutorialPortal = createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        opacity: mounted ? 1 : 0,
        transition: 'opacity 220ms ease',
        pointerEvents: 'auto',
      }}
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Backdrop with spotlight cut-out via box-shadow trick. */}
      <div
        style={{
          position: 'fixed',
          top: hasRect ? spotTop : vh / 2 - 1,
          left: hasRect ? spotLeft : vw / 2 - 1,
          width: hasRect ? spotW : 2,
          height: hasRect ? spotH : 2,
          borderRadius: 12,
          boxShadow: `0 0 0 9999px ${overlayColor}`,
          border: hasRect ? `2px solid ${accent}` : 'none',
          transition: 'top 480ms cubic-bezier(0.32,0.72,0,1), left 480ms cubic-bezier(0.32,0.72,0,1), width 480ms cubic-bezier(0.32,0.72,0,1), height 480ms cubic-bezier(0.32,0.72,0,1), border-color 240ms ease',
          pointerEvents: 'none',
        }}
      />
      {/* Pulsing ring around the spotlight to draw the eye. */}
      {hasRect && (
        <div
          style={{
            position: 'fixed',
            top: spotTop,
            left: spotLeft,
            width: spotW,
            height: spotH,
            borderRadius: 12,
            boxShadow: `0 0 0 0 ${accent}55`,
            animation: 'pulse-dot 2s infinite',
            color: accent,
            pointerEvents: 'none',
            transition: 'top 480ms cubic-bezier(0.32,0.72,0,1), left 480ms cubic-bezier(0.32,0.72,0,1), width 480ms cubic-bezier(0.32,0.72,0,1), height 480ms cubic-bezier(0.32,0.72,0,1)',
          }}
        />
      )}

      {/* Speech bubble. */}
      <div
        role="dialog"
        aria-label={`Tutorial — ${step.title}`}
        style={{
          position: 'fixed',
          top: bubbleTop,
          left: bubbleLeft,
          width: BUBBLE_WIDTH,
          background: theme.cardBg,
          border: `1px solid ${isWarning ? accent + '88' : theme.cardBorder}`,
          borderRadius: 12,
          padding: BUBBLE_PAD,
          boxShadow: `0 12px 36px ${theme.shadow}, 0 0 0 1px ${accent}22`,
          color: theme.textPrimary,
          transition: 'top 480ms cubic-bezier(0.32,0.72,0,1), left 480ms cubic-bezier(0.32,0.72,0,1), border-color 240ms ease',
        }}
      >
        {/* Bubble arrow */}
        {hasRect && (
          <div
            style={{
              position: 'absolute',
              top: placeBelow ? -7 : 'auto',
              bottom: placeBelow ? 'auto' : -7,
              left: arrowLeft - 7,
              width: 12,
              height: 12,
              background: theme.cardBg,
              borderTop: placeBelow ? `1px solid ${isWarning ? accent + '88' : theme.cardBorder}` : 'none',
              borderLeft: placeBelow ? `1px solid ${isWarning ? accent + '88' : theme.cardBorder}` : 'none',
              borderRight: placeBelow ? 'none' : `1px solid ${isWarning ? accent + '88' : theme.cardBorder}`,
              borderBottom: placeBelow ? 'none' : `1px solid ${isWarning ? accent + '88' : theme.cardBorder}`,
              transform: 'rotate(45deg)',
            }}
          />
        )}

        {/* Header: step counter + skip */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: accent,
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {isWarning ? (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            ) : (
              <span
                style={{
                  display: 'inline-block',
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  background: accent,
                }}
              />
            )}
            {isWarning ? 'Heads up' : 'Tutorial'} · {stepIdx + 1} / {steps.length}
          </div>
          <button
            onClick={() => finish(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.textTertiary,
              fontSize: 11,
              cursor: 'pointer',
              padding: '2px 4px',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = theme.textSecondary)}
            onMouseLeave={e => (e.currentTarget.style.color = theme.textTertiary)}
          >
            Skip
          </button>
        </div>

        {/* Title */}
        <div
          style={{
            color: theme.heading,
            fontSize: 15,
            fontWeight: 700,
            marginBottom: 6,
            letterSpacing: '-0.2px',
          }}
        >
          {step.title}
        </div>

        {/* Body */}
        <div
          style={{
            color: theme.textSecondary,
            fontSize: 12.5,
            lineHeight: 1.5,
            marginBottom: 12,
          }}
        >
          {step.body}
        </div>

        {/* Step dots */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 5,
            marginBottom: 12,
          }}
        >
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === stepIdx ? 16 : 5,
                height: 5,
                borderRadius: 3,
                background: i === stepIdx ? accent : theme.cardBorder,
                transition: 'width 220ms ease, background 220ms ease',
              }}
            />
          ))}
        </div>

        {/* Footer buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setStepIdx(stepIdx - 1)}
            disabled={isFirst}
            style={{
              flex: 1,
              height: 32,
              borderRadius: 7,
              background: theme.btnBg,
              border: `1px solid ${theme.btnBorder}`,
              color: isFirst ? theme.textTertiary : theme.btnText,
              fontSize: 12,
              fontWeight: 600,
              cursor: isFirst ? 'not-allowed' : 'pointer',
              opacity: isFirst ? 0.5 : 1,
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              if (!isFirst) e.currentTarget.style.background = theme.cardHoverBg
            }}
            onMouseLeave={e => {
              if (!isFirst) e.currentTarget.style.background = theme.btnBg
            }}
          >
            Back
          </button>
          <button
            onClick={() => {
              if (isLast) finish(true)
              else setStepIdx(stepIdx + 1)
            }}
            style={{
              flex: 1.5,
              height: 32,
              borderRadius: 7,
              background: accent,
              border: `1px solid ${accent}`,
              color: theme.kind === 'dark' ? '#0c0c0c' : '#ffffff',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'filter 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.08)')}
            onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(1)')}
          >
            {isLast ? 'Got it' : 'Next →'}
          </button>
        </div>
      </div>
    </div>,
      document.body,
    )
  }

  return <>{tutorialPortal}{welcomePortal}</>
}

export default OnboardingTutorial
