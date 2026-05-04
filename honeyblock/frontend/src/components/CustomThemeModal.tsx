import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  buildCustomTheme,
  CustomThemeInput,
  DEFAULT_CUSTOM_INPUT,
  HEX_REGEX,
  Theme,
  useTheme,
} from '../theme'

interface Props {
  open: boolean
  onClose: () => void
}

const COLOR_FIELDS: Array<{
  key: keyof Omit<CustomThemeInput, 'base'>
  label: string
  hint?: string
}> = [
  { key: 'pageBg',      label: 'Page background',    hint: 'The page outside cards' },
  { key: 'cardBg',      label: 'Card background',    hint: 'Surfaces, charts, tables' },
  { key: 'sidebarBg',   label: 'Sidebar background' },
  { key: 'brand',       label: 'Brand / accent',     hint: 'Logo, active nav, icon tints' },
  { key: 'heading',     label: 'Heading text',       hint: 'Stat values, titles' },
  { key: 'textPrimary', label: 'Body text',          hint: 'Tables, labels, paragraphs' },
  { key: 'success',     label: 'Success',            hint: 'Running indicator, unblock' },
  { key: 'error',       label: 'Error',              hint: 'Stopped indicator, block' },
]

function CustomThemeModal({ open, onClose }: Props) {
  const { theme, customTheme, saveCustomTheme, setThemeName } = useTheme()

  // When opened, seed the editor either from the existing custom theme or
  // from the current theme so the user has a sensible starting point.
  const [input, setInput] = useState<CustomThemeInput>(() => seedInput(customTheme, theme))

  useEffect(() => {
    if (open) setInput(seedInput(customTheme, theme))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  const previewTheme = buildCustomTheme(input)

  const handleSave = () => {
    saveCustomTheme(previewTheme)
    setThemeName('custom')
    onClose()
  }

  const handleDelete = () => {
    saveCustomTheme(null)
    onClose()
  }

  const handleResetToBase = () => {
    setInput({ ...DEFAULT_CUSTOM_INPUT, base: input.base })
  }

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
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
          maxWidth: 940,
          maxHeight: '92vh',
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
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: theme.heading }}>
              Customize Theme
            </div>
            <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}>
              Pick eight colors and we'll derive the rest.
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              color: theme.textSecondary,
              cursor: 'pointer',
              fontSize: 20,
              lineHeight: 1,
              padding: 4,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Editor column */}
          <div
            style={{
              width: 380,
              flexShrink: 0,
              padding: '16px 20px',
              borderRight: `1px solid ${theme.cardBorder}`,
              overflowY: 'auto',
            }}
          >
            <div style={{ marginBottom: 14 }}>
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
                Base mode
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['dark', 'light'] as const).map(b => {
                  const active = input.base === b
                  return (
                    <button
                      key={b}
                      onClick={() => setInput(s => ({ ...s, base: b }))}
                      style={{
                        flex: 1,
                        padding: '7px 10px',
                        borderRadius: 7,
                        border: `1px solid ${active ? theme.brand + '66' : theme.cardBorder}`,
                        background: active ? `${theme.brand}12` : 'transparent',
                        color: active ? theme.heading : theme.textSecondary,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                        fontFamily: 'inherit',
                      }}
                    >
                      {b}
                    </button>
                  )
                })}
              </div>
              <div style={{ fontSize: 10, color: theme.textTertiary, marginTop: 6 }}>
                Affects how borders, table stripes, and overlays are derived.
              </div>
            </div>

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
              Colors
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {COLOR_FIELDS.map(({ key, label, hint }) => (
                <ColorRow
                  key={key}
                  label={label}
                  hint={hint}
                  value={input[key] as string}
                  onChange={v => setInput(s => ({ ...s, [key]: v }))}
                />
              ))}
            </div>

            <button
              onClick={handleResetToBase}
              style={{
                marginTop: 14,
                padding: '7px 12px',
                borderRadius: 7,
                background: 'transparent',
                border: `1px solid ${theme.cardBorder}`,
                color: theme.textSecondary,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                width: '100%',
              }}
            >
              Reset colors to defaults
            </button>
          </div>

          {/* Preview column */}
          <div
            style={{
              flex: 1,
              padding: 18,
              background: theme.pageBg,
              overflow: 'auto',
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: theme.textTertiary,
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              Live preview
            </div>
            <Preview previewTheme={previewTheme} />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: `1px solid ${theme.cardBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <div>
            {customTheme && (
              <button
                onClick={handleDelete}
                style={{
                  padding: '7px 14px',
                  borderRadius: 7,
                  background: alphaSafe(theme.error, 0.10),
                  border: `1px solid ${alphaSafe(theme.error, 0.30)}`,
                  color: theme.error,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Delete custom theme
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onClose}
              style={{
                padding: '7px 14px',
                borderRadius: 7,
                background: 'transparent',
                border: `1px solid ${theme.cardBorder}`,
                color: theme.textSecondary,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '7px 16px',
                borderRadius: 7,
                background: theme.brand,
                border: `1px solid ${theme.brand}`,
                color: theme.pageBg,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function seedInput(custom: Theme | null, fallback: Theme): CustomThemeInput {
  const src = custom ?? fallback
  return {
    base: src.kind,
    pageBg: src.pageBg,
    cardBg: src.cardBg,
    sidebarBg: src.sidebarBg,
    brand: src.brand,
    heading: src.heading,
    textPrimary: src.textPrimary,
    success: src.success,
    error: src.error,
  }
}

function alphaSafe(hex: string, a: number): string {
  // Convert any hex to rgba; fallback for already-rgba inputs
  if (hex.startsWith('rgba') || hex.startsWith('rgb(')) return hex
  let cleaned = hex.replace('#', '')
  if (cleaned.length === 3) cleaned = cleaned.split('').map(c => c + c).join('')
  const r = parseInt(cleaned.slice(0, 2), 16)
  const g = parseInt(cleaned.slice(2, 4), 16)
  const b = parseInt(cleaned.slice(4, 6), 16)
  if ([r, g, b].some(n => isNaN(n))) return hex
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

// ─── Color row (visual picker + hex text input) ───────────────────

function ColorRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
}) {
  const { theme } = useTheme()
  const [hexText, setHexText] = useState(value)

  // Sync local hex input when external value changes (e.g. base-mode reset)
  useEffect(() => { setHexText(value) }, [value])

  const handleHexChange = (v: string) => {
    setHexText(v)
    if (HEX_REGEX.test(v)) onChange(v)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: theme.heading }}>{label}</div>
        {hint && (
          <div style={{ fontSize: 10, color: theme.textTertiary, marginTop: 1 }}>{hint}</div>
        )}
      </div>
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label={`${label} color picker`}
        style={{
          width: 32,
          height: 28,
          padding: 0,
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: 6,
          background: 'transparent',
          cursor: 'pointer',
        }}
      />
      <input
        type="text"
        value={hexText}
        onChange={e => handleHexChange(e.target.value)}
        spellCheck={false}
        maxLength={7}
        style={{
          width: 80,
          padding: '5px 8px',
          borderRadius: 6,
          border: `1px solid ${theme.cardBorder}`,
          background: theme.btnBg,
          color: HEX_REGEX.test(hexText) ? theme.textPrimary : theme.error,
          fontFamily: "'JetBrains Mono', 'Consolas', monospace",
          fontSize: 11,
          outline: 'none',
        }}
      />
    </div>
  )
}

// ─── Live preview (mini-dashboard mock) ───────────────────────────

function Preview({ previewTheme: t }: { previewTheme: Theme }) {
  return (
    <div
      style={{
        background: t.pageBg,
        color: t.textPrimary,
        border: `1px solid ${t.cardBorder}`,
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: `0 8px 24px ${t.shadow}`,
      }}
    >
      {/* Topbar */}
      <div
        style={{
          height: 32,
          background: t.sidebarBg,
          borderBottom: `1px solid ${t.sidebarBorder}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: 6,
          fontSize: 10,
        }}
      >
        <span style={{ color: t.textTertiary }}>HoneyBlock</span>
        <span style={{ color: t.textTertiary }}>/</span>
        <span style={{ color: t.heading, fontWeight: 600 }}>Dashboard</span>
        <div style={{ flex: 1 }} />
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: t.success,
          }}
        />
        <span style={{ color: t.textTertiary, fontFamily: "'JetBrains Mono', monospace", fontSize: 9 }}>
          Cowrie · Running
        </span>
      </div>

      <div style={{ display: 'flex', minHeight: 240 }}>
        {/* Sidebar */}
        <div
          style={{
            width: 90,
            background: t.sidebarBg,
            borderRight: `1px solid ${t.sidebarBorder}`,
            padding: '10px 6px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div
            style={{
              color: t.brand,
              fontFamily: "'Bungee', cursive",
              fontSize: 11,
              letterSpacing: '0.5px',
              padding: '0 4px 8px',
              borderBottom: `1px solid ${t.sidebarBorder}`,
              marginBottom: 6,
            }}
          >
            HoneyBlock
          </div>
          <NavRow t={t} active label="Dashboard" />
          <NavRow t={t} label="Blocking" />
          <NavRow t={t} label="Settings" />
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            <PreviewStat t={t} accent={t.error}   label="Attacks" value="3,411" />
            <PreviewStat t={t} accent={t.brand}   label="Unique IPs" value="50" />
            <PreviewStat t={t} accent={t.success} label="Active" value="0" />
          </div>

          {/* Mini chart card */}
          <div
            style={{
              background: t.cardBg,
              border: `1px solid ${t.cardBorder}`,
              borderRadius: 8,
              padding: 8,
              flex: 1,
              minHeight: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, color: t.heading }}>Top Attackers</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              {[80, 55, 70, 40, 30].map((w, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div
                    style={{
                      width: 60,
                      fontSize: 9,
                      color: t.textTertiary,
                      fontFamily: "'JetBrains Mono', monospace",
                      textAlign: 'right',
                    }}
                  >
                    185.220.101.{45 - i}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      height: 8,
                      background: t.cardBorder,
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${w}%`,
                        height: '100%',
                        background: t.brand,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      width: 18,
                      fontSize: 9,
                      color: t.textSecondary,
                      textAlign: 'right',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {Math.round(w / 2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action chips */}
          <div style={{ display: 'flex', gap: 6 }}>
            <ChipButton t={t} kind="error" label="Block" />
            <ChipButton t={t} kind="success" label="Unblock" />
          </div>
        </div>
      </div>
    </div>
  )
}

function NavRow({ t, label, active }: { t: Theme; label: string; active?: boolean }) {
  return (
    <div
      style={{
        position: 'relative',
        padding: '5px 7px',
        borderRadius: 5,
        background: active ? t.navActiveBg : 'transparent',
        color: active ? t.navActiveText : t.navText,
        fontSize: 9,
        fontWeight: 500,
        border: `1px solid ${active ? t.brand + '22' : 'transparent'}`,
      }}
    >
      {active && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '20%',
            bottom: '20%',
            width: 2,
            borderRadius: '0 2px 2px 0',
            background: t.brand,
            boxShadow: `0 0 6px ${t.brand}`,
          }}
        />
      )}
      {label}
    </div>
  )
}

function PreviewStat({
  t,
  accent,
  label,
  value,
}: {
  t: Theme
  accent: string
  label: string
  value: string
}) {
  return (
    <div
      style={{
        background: t.cardBg,
        border: `1px solid ${t.cardBorder}`,
        borderRadius: 8,
        padding: '8px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 5,
          background: alphaSafe(accent, 0.12),
          border: `1px solid ${alphaSafe(accent, 0.3)}`,
          flexShrink: 0,
        }}
      />
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            color: t.heading,
            fontSize: 13,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.3px',
          }}
        >
          {value}
        </div>
        <div
          style={{
            color: t.textSecondary,
            fontSize: 8,
            marginTop: 1,
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
          }}
        >
          {label}
        </div>
      </div>
    </div>
  )
}

function ChipButton({ t, kind, label }: { t: Theme; kind: 'error' | 'success'; label: string }) {
  const isErr = kind === 'error'
  return (
    <div
      style={{
        padding: '4px 10px',
        borderRadius: 5,
        border: `1px solid ${isErr ? t.blockBtnBorder : t.unblockBtnBorder}`,
        background: isErr ? t.blockBtn : t.unblockBtn,
        color: isErr ? t.blockBtnText : t.unblockBtnText,
        fontSize: 10,
        fontWeight: 600,
      }}
    >
      {label}
    </div>
  )
}

export default CustomThemeModal
