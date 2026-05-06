import { useState, useEffect, useRef, useMemo } from 'react'
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps'
import { geoMercator } from 'd3-geo'
import type { Attacker } from '../types'
import { useTheme } from '../theme'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

// Comprehensive country → [lng, lat] mapping (capitals / centroids)
const COUNTRY_COORDS: Record<string, [number, number]> = {
  // ── Africa ──
  'Algeria': [3, 28], 'Angola': [17, -12], 'Benin': [2, 9], 'Botswana': [24, -22],
  'Burkina Faso': [-2, 13], 'Burundi': [30, -3], 'Cabo Verde': [-24, 15], 'Cape Verde': [-24, 15],
  'Cameroon': [12, 6], 'Central African Republic': [21, 7], 'Chad': [19, 15],
  'Comoros': [44, -12], 'Congo': [16, -1], 'Republic of the Congo': [16, -1],
  'Democratic Republic of the Congo': [24, -3], 'DR Congo': [24, -3],
  "Côte d'Ivoire": [-5, 7], 'Ivory Coast': [-5, 7], 'Djibouti': [43, 12],
  'Egypt': [30, 27], 'Equatorial Guinea': [10, 2], 'Eritrea': [39, 15],
  'Eswatini': [31, -27], 'Swaziland': [31, -27], 'Ethiopia': [40, 9],
  'Gabon': [12, -1], 'Gambia': [-16, 13], 'Ghana': [-2, 8], 'Guinea': [-10, 11],
  'Guinea-Bissau': [-15, 12], 'Kenya': [38, 0], 'Lesotho': [29, -30],
  'Liberia': [-10, 6], 'Libya': [17, 27], 'Madagascar': [47, -19], 'Malawi': [34, -14],
  'Mali': [-4, 17], 'Mauritania': [-10, 20], 'Mauritius': [58, -20],
  'Morocco': [-6, 32], 'Mozambique': [35, -18], 'Namibia': [17, -22],
  'Niger': [8, 16], 'Nigeria': [8, 10], 'Rwanda': [30, -2],
  'São Tomé and Príncipe': [7, 1], 'Senegal': [-14, 14], 'Seychelles': [55, -5],
  'Sierra Leone': [-12, 9], 'Somalia': [46, 6], 'South Africa': [25, -29],
  'South Sudan': [32, 7], 'Sudan': [30, 16], 'Tanzania': [35, -6],
  'Togo': [1, 8], 'Tunisia': [9, 34], 'Uganda': [32, 1], 'Zambia': [28, -15],
  'Zimbabwe': [30, -20], 'Réunion': [55, -21],

  // ── Americas ──
  'Antigua and Barbuda': [-62, 17], 'Argentina': [-64, -34], 'Bahamas': [-77, 25],
  'Barbados': [-60, 13], 'Belize': [-89, 17], 'Bolivia': [-65, -17], 'Brazil': [-51, -14],
  'Canada': [-106, 56], 'Chile': [-71, -35], 'Colombia': [-74, 4], 'Costa Rica': [-84, 10],
  'Cuba': [-80, 22], 'Dominica': [-61, 15], 'Dominican Republic': [-70, 19],
  'Ecuador': [-78, -2], 'El Salvador': [-89, 14], 'Grenada': [-62, 12],
  'Guatemala': [-90, 15], 'Guyana': [-59, 5], 'Haiti': [-72, 19],
  'Honduras': [-87, 15], 'Jamaica': [-77, 18], 'Mexico': [-102, 23],
  'Nicaragua': [-85, 13], 'Panama': [-80, 9], 'Paraguay': [-58, -23],
  'Peru': [-76, -10], 'Puerto Rico': [-66, 18], 'Saint Kitts and Nevis': [-63, 17],
  'Saint Lucia': [-61, 14], 'Saint Vincent and the Grenadines': [-61, 13],
  'Suriname': [-56, 4], 'Trinidad and Tobago': [-61, 11], 'United States': [-95, 38],
  'Uruguay': [-56, -33], 'Venezuela': [-66, 7],

  // ── Asia ──
  'Afghanistan': [67, 33], 'Armenia': [45, 40], 'Azerbaijan': [50, 41],
  'Bahrain': [51, 26], 'Bangladesh': [90, 24], 'Bhutan': [90, 28],
  'Brunei': [115, 5], 'Brunei Darussalam': [115, 5], 'Cambodia': [105, 13],
  'China': [105, 35], 'Cyprus': [33, 35], 'Georgia': [44, 42],
  'Hong Kong': [114, 22], 'India': [78, 21], 'Indonesia': [120, -5],
  'Iran': [53, 33], 'Iran, Islamic Republic of': [53, 33], 'Iraq': [44, 33],
  'Israel': [35, 31], 'Japan': [138, 36], 'Jordan': [36, 31],
  'Kazakhstan': [67, 48], 'Kuwait': [48, 29], 'Kyrgyzstan': [75, 41],
  'Laos': [103, 18], "Lao People's Democratic Republic": [103, 18],
  'Lebanon': [36, 34], 'Macau': [114, 22], 'Macao': [114, 22],
  'Malaysia': [102, 4], 'Maldives': [73, 3], 'Mongolia': [104, 47],
  'Myanmar': [96, 20], 'Nepal': [84, 28], 'North Korea': [127, 40],
  "Korea, Democratic People's Republic of": [127, 40],
  'Oman': [56, 21], 'Pakistan': [70, 30], 'Palestine': [35, 32],
  'Palestinian Territory': [35, 32], 'Philippines': [122, 12], 'Qatar': [51, 25],
  'Saudi Arabia': [45, 24], 'Singapore': [104, 1], 'South Korea': [128, 36],
  'Korea': [128, 36], 'Republic of Korea': [128, 36], 'Korea, Republic of': [128, 36],
  'Sri Lanka': [81, 7], 'Syria': [38, 35], 'Syrian Arab Republic': [38, 35],
  'Taiwan': [121, 24], 'Taiwan, Province of China': [121, 24],
  'Tajikistan': [69, 39], 'Thailand': [101, 14], 'Timor-Leste': [126, -9],
  'Turkey': [35, 39], 'Türkiye': [35, 39], 'Turkmenistan': [59, 39],
  'United Arab Emirates': [54, 24], 'Uzbekistan': [64, 41],
  'Vietnam': [106, 16], 'Viet Nam': [106, 16], 'Yemen': [48, 15],

  // ── Europe ──
  'Albania': [20, 41], 'Andorra': [2, 43], 'Austria': [14, 47],
  'Belarus': [28, 54], 'Belgium': [4, 51], 'Bosnia and Herzegovina': [18, 44],
  'Bulgaria': [25, 43], 'Croatia': [16, 45], 'Czech Republic': [15, 50],
  'Czechia': [15, 50], 'Denmark': [10, 56], 'Estonia': [26, 59],
  'Finland': [26, 64], 'France': [2, 47], 'Germany': [10, 51],
  'Greece': [22, 39], 'Hungary': [20, 47], 'Iceland': [-19, 65],
  'Ireland': [-8, 53], 'Italy': [12, 42], 'Kosovo': [21, 43],
  'Latvia': [25, 57], 'Liechtenstein': [10, 47], 'Lithuania': [24, 56],
  'Luxembourg': [6, 50], 'Malta': [14, 36], 'Moldova': [29, 47],
  'Republic of Moldova': [29, 47], 'Monaco': [7, 44], 'Montenegro': [19, 43],
  'Netherlands': [5, 52], 'The Netherlands': [5, 52], 'North Macedonia': [22, 41],
  'Norway': [10, 62], 'Poland': [20, 52], 'Portugal': [-8, 40],
  'Romania': [25, 46], 'Russia': [90, 60], 'Russian Federation': [90, 60],
  'San Marino': [12, 44], 'Serbia': [21, 44], 'Slovakia': [19, 49],
  'Slovenia': [15, 46], 'Spain': [-4, 40], 'Sweden': [18, 62],
  'Switzerland': [8, 47], 'Ukraine': [32, 49], 'United Kingdom': [-2, 54],
  'Vatican City': [12, 42],

  // ── Oceania ──
  'Australia': [134, -25], 'Fiji': [178, -18], 'New Zealand': [174, -41],
  'Papua New Guinea': [147, -6], 'Samoa': [-172, -14], 'Solomon Islands': [160, -9],
  'Tonga': [-175, -21], 'Vanuatu': [167, -16],
}

interface Props {
  attackers: Attacker[]
  onCountryClick?: (country: string) => void
}

const USER_COUNTRY = 'Philippines'
const PROJECTION = geoMercator().scale(120).translate([400, 300]).center([0, 0])

interface MarkerData {
  country: string
  coords: [number, number]
  count: number
}

interface Laser {
  id: number
  source: [number, number]
  control: [number, number]
  target: [number, number]
  progress: number
  speed: number
  tailFrac: number
}

function bezierPoint(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  t: number,
): [number, number] {
  const u = 1 - t
  return [
    u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
    u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
  ]
}

function LaserLayer({ markers, zoom }: { markers: MarkerData[]; zoom: number }) {
  const [lasers, setLasers] = useState<Laser[]>([])

  const validSources = useMemo(
    () => markers.filter((m) => m.country !== USER_COUNTRY),
    [markers],
  )

  // Spawn lasers on a sparse, randomized cadence — max 2 concurrent.
  useEffect(() => {
    const userCoords = COUNTRY_COORDS[USER_COUNTRY]
    if (!userCoords || validSources.length === 0) return
    const target = PROJECTION(userCoords) as [number, number] | null
    if (!target) return

    let timeout: number | undefined
    const spawn = () => {
      setLasers((prev) => {
        if (prev.length >= 3) return prev
        const m = validSources[Math.floor(Math.random() * validSources.length)]
        const source = PROJECTION(m.coords) as [number, number] | null
        if (!source) return prev
        const midX = (source[0] + target[0]) / 2
        const midY = (source[1] + target[1]) / 2
        const dx = target[0] - source[0]
        const dy = target[1] - source[1]
        const len = Math.sqrt(dx * dx + dy * dy) || 1
        const perpX = -dy / len
        const perpY = dx / len
        const bulge = len * 0.22 * (Math.random() > 0.5 ? 1 : -1)
        const control: [number, number] = [
          midX + perpX * bulge,
          midY + perpY * bulge,
        ]
        // Cap bolt length in SVG units so far-away attacks don't draw long streaks.
        const tailFrac = Math.min(0.12, 22 / Math.max(len, 1))
        return [
          ...prev,
          {
            id: Date.now() + Math.random(),
            source,
            control,
            target,
            progress: 0,
            speed: 0.7 + Math.random() * 0.3,
            tailFrac,
          },
        ]
      })
      timeout = window.setTimeout(spawn, 900 + Math.random() * 1400)
    }
    timeout = window.setTimeout(spawn, 400 + Math.random() * 800)
    return () => {
      if (timeout !== undefined) clearTimeout(timeout)
    }
  }, [validSources])

  // Drive bolt position with rAF; idles when no lasers are active.
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      setLasers((prev) => {
        if (prev.length === 0) return prev
        return prev
          .map((l) => ({ ...l, progress: l.progress + l.speed * dt }))
          .filter((l) => l.progress < 1.15)
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const w = 1 / Math.sqrt(zoom)

  return (
    <g style={{ pointerEvents: 'none' }}>
      {lasers.map((l) => {
        const headT = Math.min(l.progress, 1)
        const tailT = Math.min(Math.max(0, l.progress - l.tailFrac), 1)
        const head = bezierPoint(l.source, l.control, l.target, headT)
        const tail = bezierPoint(l.source, l.control, l.target, tailT)
        // Faint terminal fade only as the bolt fully collapses into the target.
        const fade = tailT > 0.97 ? Math.max(0, 1 - (tailT - 0.97) * 30) : 1
        return (
          <g key={l.id}>
            <line
              x1={tail[0]}
              y1={tail[1]}
              x2={head[0]}
              y2={head[1]}
              stroke="#ff2233"
              strokeWidth={7 * w}
              strokeLinecap="round"
              opacity={0.18 * fade}
            />
            <line
              x1={tail[0]}
              y1={tail[1]}
              x2={head[0]}
              y2={head[1]}
              stroke="#ff5566"
              strokeWidth={3.5 * w}
              strokeLinecap="round"
              opacity={0.55 * fade}
            />
            <line
              x1={tail[0]}
              y1={tail[1]}
              x2={head[0]}
              y2={head[1]}
              stroke="#ffffff"
              strokeWidth={1.2 * w}
              strokeLinecap="round"
              opacity={0.95 * fade}
            />
          </g>
        )
      })}
    </g>
  )
}

function AttackMap({ attackers, onCountryClick }: Props) {
  const { theme } = useTheme()
  const [zoom, setZoom] = useState(2.5)
  const [center, setCenter] = useState<[number, number]>([70, 20])
  const [tooltip, setTooltip] = useState<{ country: string; count: number; x: number; y: number } | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  const btnStyle: React.CSSProperties = {
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: theme.btnBg,
    border: `1px solid ${theme.btnBorder}`,
    borderRadius: 4,
    color: theme.btnText,
    fontSize: 16,
    cursor: 'pointer',
    lineHeight: 1,
  }

  useEffect(() => {
    const el = mapRef.current
    if (!el) return
    const svg = el.querySelector('svg')
    if (!svg) return
    const blockZoom = (e: WheelEvent) => { e.stopPropagation() }
    svg.addEventListener('wheel', blockZoom, { passive: true, capture: true })
    return () => svg.removeEventListener('wheel', blockZoom, { capture: true })
  })

  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.4, 8))
  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.4, 1))

  const handleMoveEnd = ({ coordinates, zoom: z }: { coordinates: [number, number]; zoom: number }) => {
    const lng = Math.max(-180, Math.min(180, coordinates[0]))
    const lat = Math.max(-60, Math.min(75, coordinates[1]))
    setCenter([lng, lat])
    setZoom(z)
  }

  const markers = useMemo<MarkerData[]>(() =>
    attackers
      .filter(a => a.country && COUNTRY_COORDS[a.country])
      .reduce<MarkerData[]>((acc, a) => {
        const existing = acc.find(m => m.country === a.country)
        if (existing) {
          existing.count++
        } else {
          acc.push({
            country: a.country!,
            coords: COUNTRY_COORDS[a.country!],
            count: 1,
          })
        }
        return acc
      }, []),
    [attackers],
  )

  return (
    <div ref={mapRef} style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 120, center: [0, 0] }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup
          zoom={zoom}
          center={center}
          onMoveEnd={handleMoveEnd}
          minZoom={1}
          maxZoom={8}
          translateExtent={[[-800, -400], [800, 600]]}
        >
          <defs>
            <radialGradient id="attackerMarkerGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={theme.mapMarker} stopOpacity="1" />
              <stop offset="45%" stopColor={theme.mapMarker} stopOpacity="0.85" />
              <stop offset="100%" stopColor={theme.mapMarker} stopOpacity="0" />
            </radialGradient>
          </defs>

          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={theme.mapFill}
                  stroke={theme.mapStroke}
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: theme.mapStroke, outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {markers.map((m) => (
            <Marker key={m.country} coordinates={m.coords}>
              <circle
                r={Math.min(5 + m.count * 2.4, 17) / Math.sqrt(zoom)}
                fill="url(#attackerMarkerGrad)"
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  const rect = (e.target as SVGCircleElement).closest('div')?.getBoundingClientRect()
                  const svgRect = (e.target as SVGCircleElement).getBoundingClientRect()
                  if (rect) {
                    setTooltip({
                      country: m.country,
                      count: m.count,
                      x: svgRect.left - rect.left + svgRect.width / 2,
                      y: svgRect.top - rect.top - 8,
                    })
                  }
                }}
                onMouseLeave={() => setTooltip(null)}
                onClick={() => onCountryClick?.(m.country)}
              />
            </Marker>
          ))}

          <LaserLayer markers={markers} zoom={zoom} />

          {COUNTRY_COORDS[USER_COUNTRY] && (
            <Marker coordinates={COUNTRY_COORDS[USER_COUNTRY]}>
              <g
                transform={`scale(${1 / Math.sqrt(zoom)})`}
                style={{ pointerEvents: 'none' }}
              >
                <circle r={3} fill="none" stroke={theme.success} strokeWidth={1.2} opacity={0.7}>
                  <animate
                    attributeName="r"
                    values="3;14;14"
                    dur="2.2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.7;0;0"
                    dur="2.2s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r={3} fill="none" stroke={theme.success} strokeWidth={1.2} opacity={0.7}>
                  <animate
                    attributeName="r"
                    values="3;14;14"
                    dur="2.2s"
                    begin="1.1s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.7;0;0"
                    dur="2.2s"
                    begin="1.1s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r={6} fill={theme.success} opacity={0.22} />
                <circle r={3.5} fill={theme.success} opacity={0.55} />
                <circle r={1.6} fill="#ffffff" />
              </g>
            </Marker>
          )}
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            background: theme.tooltipBg,
            border: `1px solid ${theme.tooltipBorder}`,
            borderRadius: 6,
            padding: '6px 10px',
            color: theme.textPrimary,
            fontSize: 12,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: `0 4px 12px ${theme.shadow}`,
            zIndex: 10,
          }}
        >
          <div style={{ fontWeight: 600, color: theme.heading }}>{tooltip.country}</div>
          <div>{tooltip.count} attacker{tooltip.count !== 1 ? 's' : ''}</div>
        </div>
      )}

      {/* Zoom controls */}
      <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <button onClick={handleZoomIn} style={btnStyle}>+</button>
        <button onClick={handleZoomOut} style={btnStyle}>-</button>
      </div>

      {markers.length === 0 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: theme.textSecondary,
            fontSize: 13,
          }}
        >
          No geolocation data yet.
        </div>
      )}
    </div>
  )
}

export default AttackMap
