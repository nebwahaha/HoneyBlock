import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTheme } from '../theme'
import LiveFeed from './LiveFeed'

interface Props {
  icon: React.ReactNode
  label: string
  value: string | number
  color?: string
}

function TotalSessionsCard({ icon, label, value, color }: Props) {
  const { theme } = useTheme()
  const [hovered, setHovered] = useState(false)
  const [downloadHovered, setDownloadHovered] = useState(false)
  const [open, setOpen] = useState(false)
  const accent = color ?? theme.brand

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    const a = document.createElement('a')
    a.href = '/api/logs/download'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? theme.cardHoverBg : theme.cardBg,
          border: `1px solid ${hovered ? theme.cardHoverBorder : theme.cardBorder}`,
          borderRadius: 10,
          padding: '16px 20px',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          cursor: 'pointer',
          transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
          boxShadow: hovered ? `0 4px 20px ${accent}22` : 'none',
          transition: 'background 0.18s, border-color 0.18s, transform 0.18s, box-shadow 0.18s',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 9,
            background: `${accent}18`,
            border: `1px solid ${accent}28`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accent,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: theme.heading, fontSize: 26, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.5px' }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          <div style={{ color: theme.textSecondary, fontSize: 11, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            {label}
          </div>
        </div>
        <button
          onClick={handleDownload}
          onMouseEnter={() => setDownloadHovered(true)}
          onMouseLeave={() => setDownloadHovered(false)}
          title="Download parsed logs (JSON)"
          aria-label="Download parsed logs"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: downloadHovered ? `${accent}18` : theme.btnBg,
            border: `1px solid ${downloadHovered ? accent + '55' : theme.btnBorder}`,
            color: downloadHovered ? accent : theme.btnText,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.15s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>

      {open && createPortal(
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: theme.modalOverlay,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.tooltipBorder}`,
              borderRadius: 12,
              width: 'min(900px, 92vw)',
              height: 'min(640px, 80vh)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: `0 16px 48px ${theme.modalOverlay}`,
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderBottom: `1px solid ${theme.cardBorder}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: theme.heading, fontSize: 15, fontWeight: 600 }}>
                  Parsed Logs Preview
                </span>
                <span style={{ color: theme.textTertiary, fontSize: 12 }}>
                  · {typeof value === 'number' ? value.toLocaleString() : value} total
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={handleDownload}
                  title="Download parsed logs (JSON)"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '7px 12px',
                    borderRadius: 7,
                    background: theme.btnBg,
                    border: `1px solid ${theme.btnBorder}`,
                    color: theme.btnText,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download JSON
                </button>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close preview"
                  style={{
                    background: 'none', border: 'none', color: theme.textSecondary,
                    fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: '0 4px',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
            <div style={{ flex: 1, minHeight: 0, padding: '12px 16px' }}>
              <LiveFeed />
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

export default TotalSessionsCard
