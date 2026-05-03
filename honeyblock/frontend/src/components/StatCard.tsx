import { useState } from 'react'
import { useTheme } from '../theme'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  /** accent colour used for icon tint, hover glow, etc. Defaults to brand */
  color?: string
  /** stagger index for the pop-in animation */
  delay?: number
}

function StatCard({ icon, label, value, color, delay = 0 }: StatCardProps) {
  const { theme } = useTheme()
  const [hovered, setHovered] = useState(false)
  const accent = color ?? theme.brand

  return (
    <div
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
  )
}

export default StatCard
