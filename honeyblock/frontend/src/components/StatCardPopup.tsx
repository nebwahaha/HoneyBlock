import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../theme'

interface PopupRow {
  primary: string
  secondary?: string
}

interface Props {
  icon: React.ReactNode
  label: string
  value: string | number
  /** accent colour used for icon tint, hover glow, etc. Defaults to brand */
  color?: string
  /** stagger index for the pop-in animation */
  delay?: number
  fetchRows: (page: number) => Promise<{ rows: PopupRow[]; hasMore: boolean }>
}

function StatCardPopup({ icon, label, value, color, delay = 0, fetchRows }: Props) {
  const { theme } = useTheme()
  const [hovered, setHovered] = useState(false)
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<PopupRow[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const accent = color ?? theme.brand

  const load = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const result = await fetchRows(p)
      setRows(prev => p === 1 ? result.rows : [...prev, ...result.rows])
      setHasMore(result.hasMore)
      setPage(p)
    } finally {
      setLoading(false)
    }
  }, [fetchRows])

  const handleOpen = () => {
    setRows([])
    setPage(1)
    setHasMore(false)
    setOpen(true)
  }

  useEffect(() => {
    if (open) {
      load(1)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => setOpen(false)

  return (
    <>
      {/* Card */}
      <div
        onClick={handleOpen}
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
          animation: `stat-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${delay * 0.07}s both`,
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
        <div>
          <div style={{ color: theme.heading, fontSize: 26, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.5px' }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          <div style={{ color: theme.textSecondary, fontSize: 11, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            {label}
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div
          onClick={handleClose}
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
              width: 420,
              maxHeight: '70vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: `0 16px 48px ${theme.modalOverlay}`,
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderBottom: `1px solid ${theme.cardBorder}`,
            }}>
              <span style={{ color: theme.heading, fontSize: 15, fontWeight: 600 }}>{label}</span>
              <button
                onClick={handleClose}
                style={{
                  background: 'none', border: 'none', color: theme.textSecondary,
                  fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: '0 4px',
                }}
              >
                ✕
              </button>
            </div>

            {/* List */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {rows.length === 0 && !loading && (
                <div style={{ color: theme.textSecondary, fontSize: 13, padding: 24, textAlign: 'center' }}>
                  No data.
                </div>
              )}
              {rows.map((r, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 20px', borderBottom: `1px solid ${theme.cardBorder}`,
                }}>
                  <span style={{ color: theme.textPrimary, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>{r.primary}</span>
                  {r.secondary && (
                    <span style={{ color: accent, fontSize: 12, fontWeight: 600 }}>{r.secondary}</span>
                  )}
                </div>
              ))}
              {loading && (
                <div style={{ color: theme.textSecondary, fontSize: 13, padding: 16, textAlign: 'center' }}>
                  Loading...
                </div>
              )}
            </div>

            {/* Footer */}
            {hasMore && !loading && (
              <div style={{ padding: '12px 20px', borderTop: `1px solid ${theme.cardBorder}` }}>
                <button
                  onClick={() => load(page + 1)}
                  style={{
                    width: '100%', padding: '8px', background: theme.btnBg,
                    border: `1px solid ${theme.btnBorder}`, borderRadius: 6,
                    color: theme.btnText, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  Show more
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default StatCardPopup
