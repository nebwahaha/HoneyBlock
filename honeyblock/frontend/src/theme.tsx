import { createContext, useContext, useState, useEffect } from 'react'

export interface Theme {
  name: string
  label: string
  // Page
  pageBg: string
  text: string
  scrollbarThumb: string
  // Sidebar
  sidebarBg: string
  sidebarBorder: string
  brand: string
  navText: string
  navActiveBg: string
  navActiveText: string
  // Cards
  cardBg: string
  cardBorder: string
  cardHoverBg: string
  cardHoverBorder: string
  iconAccentBg: string
  iconAccent: string
  // Text
  heading: string
  textPrimary: string
  textSecondary: string
  textTertiary: string
  axisTick: string
  // Tooltip
  tooltipBg: string
  tooltipBorder: string
  // Status
  success: string
  error: string
  badgeRed: string
  bluePrimary: string
  blueLink: string
  amber: string
  orange: string
  // Translucent action buttons (HoneyTrap design)
  blockBtn: string
  blockBtnText: string
  blockBtnBorder: string
  unblockBtn: string
  unblockBtnText: string
  unblockBtnBorder: string
  // Tables
  tableHeaderBg: string
  tableRowEven: string
  tableRowOdd: string
  // Feed
  feedBg: string
  feedBorder: string
  arrow: string
  // Map
  mapFill: string
  mapStroke: string
  mapMarker: string
  // Overlays
  modalOverlay: string
  shadow: string
  dropdownShadow: string
  barCursor: string
  // Live feed action colors
  sessionClosed: string
  tcpTunnel: string
  fileDownload: string
  // Notification
  blockStatusActiveBg: string
  blockStatusInactiveBg: string
  notifItemBg: string
  // Config toggles
  toggleActiveBorder: string
  toggleActiveText: string
  toggleInactiveBorder: string
  toggleInactiveText: string
  toggleDisabledBg: string
  // Messages
  messageBgError: string
  messageBgSuccess: string
  // Pie chart stroke
  pieStroke: string
  // Toolbar button
  btnBg: string
  btnBorder: string
  btnText: string
}

// ★ Default: HoneyTrap — hacker-terminal dark, amber threat-intel glow
export const obsidianTheme: Theme = {
  name: 'obsidian',
  label: 'HoneyTrap',
  pageBg: '#090909',
  text: '#8a8a8a',
  scrollbarThumb: '#1e1e1e',
  sidebarBg: '#0d0d0d',
  sidebarBorder: '#1a1a1a',
  brand: '#e8a020',
  navText: '#3a3a3a',
  navActiveBg: 'rgba(232,160,32,0.07)',
  navActiveText: '#e8a020',
  cardBg: '#111111',
  cardBorder: '#1e1e1e',
  cardHoverBg: '#161616',
  cardHoverBorder: '#2a2a2a',
  iconAccentBg: 'rgba(232,160,32,0.08)',
  iconAccent: '#e8a020',
  heading: '#e8e4dc',
  textPrimary: '#8a8a8a',
  textSecondary: '#5a5a5a',
  textTertiary: '#3a3a3a',
  axisTick: '#3a3a3a',
  tooltipBg: '#111111',
  tooltipBorder: '#1e1e1e',
  success: '#39c974',
  error: '#e8394a',
  badgeRed: '#e8394a',
  bluePrimary: '#1e1e1e',
  blueLink: '#60b8f0',
  amber: '#e8a020',
  orange: '#f0c060',
  blockBtn: 'rgba(232,57,74,0.13)',
  blockBtnText: '#e8394a',
  blockBtnBorder: 'rgba(232,57,74,0.30)',
  unblockBtn: 'rgba(57,201,116,0.10)',
  unblockBtnText: '#39c974',
  unblockBtnBorder: 'rgba(57,201,116,0.28)',
  tableHeaderBg: '#0d0d0d',
  tableRowEven: '#111111',
  tableRowOdd: '#0d0d0d',
  feedBg: '#0d0d0d',
  feedBorder: '#1a1a1a',
  arrow: '#222222',
  mapFill: '#1a1a1a',
  mapStroke: '#1e1e1e',
  mapMarker: '#e8a020',
  modalOverlay: 'rgba(0,0,0,0.75)',
  shadow: 'rgba(0,0,0,0.8)',
  dropdownShadow: 'rgba(0,0,0,0.95)',
  barCursor: 'rgba(232,160,32,0.08)',
  sessionClosed: '#3a3a3a',
  tcpTunnel: '#60b8f0',
  fileDownload: '#e8394a',
  blockStatusActiveBg: 'rgba(232,57,74,0.07)',
  blockStatusInactiveBg: '#111111',
  notifItemBg: '#0d0d0d',
  toggleActiveBorder: '#e8a020',
  toggleActiveText: '#e8a020',
  toggleInactiveBorder: '#1e1e1e',
  toggleInactiveText: '#3a3a3a',
  toggleDisabledBg: '#1a1a1a',
  messageBgError: 'rgba(232,57,74,0.07)',
  messageBgSuccess: 'rgba(57,201,116,0.07)',
  pieStroke: '#090909',
  btnBg: '#111111',
  btnBorder: '#1e1e1e',
  btnText: '#5a5a5a',
}

export const monokaiTheme: Theme = {
  name: 'monokai',
  label: 'Monokai',
  pageBg: '#1e1e1e',
  text: '#cfcfc2',
  scrollbarThumb: '#3a3a3a',
  sidebarBg: '#252526',
  sidebarBorder: '#2e2e2e',
  brand: '#fd971f',
  navText: '#5a5a5a',
  navActiveBg: 'rgba(253,151,31,0.08)',
  navActiveText: '#fd971f',
  cardBg: '#272727',
  cardBorder: '#333333',
  cardHoverBg: '#2e2e2e',
  cardHoverBorder: '#444444',
  iconAccentBg: 'rgba(253,151,31,0.10)',
  iconAccent: '#fd971f',
  heading: '#f8f8f2',
  textPrimary: '#cfcfc2',
  textSecondary: '#75715e',
  textTertiary: '#49483e',
  axisTick: '#75715e',
  tooltipBg: '#252526',
  tooltipBorder: '#333333',
  success: '#a6e22e',
  error: '#f92672',
  badgeRed: '#f92672',
  bluePrimary: '#333333',
  blueLink: '#66d9e8',
  amber: '#fd971f',
  orange: '#e6db74',
  blockBtn: 'rgba(249,38,114,0.14)',
  blockBtnText: '#f92672',
  blockBtnBorder: 'rgba(249,38,114,0.30)',
  unblockBtn: 'rgba(166,226,46,0.11)',
  unblockBtnText: '#a6e22e',
  unblockBtnBorder: 'rgba(166,226,46,0.28)',
  tableHeaderBg: '#222222',
  tableRowEven: '#272727',
  tableRowOdd: '#232323',
  feedBg: '#222222',
  feedBorder: '#2e2e2e',
  arrow: '#3a3a3a',
  mapFill: '#2e2e2e',
  mapStroke: '#333333',
  mapMarker: '#fd971f',
  modalOverlay: 'rgba(0,0,0,0.6)',
  shadow: 'rgba(0,0,0,0.5)',
  dropdownShadow: 'rgba(0,0,0,0.7)',
  barCursor: 'rgba(253,151,31,0.10)',
  sessionClosed: '#75715e',
  tcpTunnel: '#66d9e8',
  fileDownload: '#f92672',
  blockStatusActiveBg: 'rgba(249,38,114,0.08)',
  blockStatusInactiveBg: '#272727',
  notifItemBg: '#232323',
  toggleActiveBorder: '#fd971f',
  toggleActiveText: '#fd971f',
  toggleInactiveBorder: '#333333',
  toggleInactiveText: '#5a5a5a',
  toggleDisabledBg: '#2e2e2e',
  messageBgError: 'rgba(249,38,114,0.08)',
  messageBgSuccess: 'rgba(166,226,46,0.08)',
  pieStroke: '#1e1e1e',
  btnBg: '#2e2e2e',
  btnBorder: '#3a3a3a',
  btnText: '#75715e',
}

export const draculaTheme: Theme = {
  name: 'dracula',
  label: 'Dracula',
  pageBg: '#1a1b26',
  text: '#a9b1d6',
  scrollbarThumb: '#2a2a3d',
  sidebarBg: '#16161e',
  sidebarBorder: '#2a2a3d',
  brand: '#ff9e64',
  navText: '#565f89',
  navActiveBg: 'rgba(255,158,100,0.08)',
  navActiveText: '#ff9e64',
  cardBg: '#1f2335',
  cardBorder: '#2a2a3d',
  cardHoverBg: '#252640',
  cardHoverBorder: '#414868',
  iconAccentBg: 'rgba(255,158,100,0.10)',
  iconAccent: '#ff9e64',
  heading: '#c0caf5',
  textPrimary: '#a9b1d6',
  textSecondary: '#565f89',
  textTertiary: '#414868',
  axisTick: '#565f89',
  tooltipBg: '#1f2335',
  tooltipBorder: '#2a2a3d',
  success: '#9ece6a',
  error: '#f7768e',
  badgeRed: '#f7768e',
  bluePrimary: '#2a2a3d',
  blueLink: '#7dcfff',
  amber: '#ff9e64',
  orange: '#e0af68',
  blockBtn: 'rgba(247,118,142,0.14)',
  blockBtnText: '#f7768e',
  blockBtnBorder: 'rgba(247,118,142,0.30)',
  unblockBtn: 'rgba(158,206,106,0.11)',
  unblockBtnText: '#9ece6a',
  unblockBtnBorder: 'rgba(158,206,106,0.28)',
  tableHeaderBg: '#16161e',
  tableRowEven: '#1f2335',
  tableRowOdd: '#1a1b26',
  feedBg: '#16161e',
  feedBorder: '#2a2a3d',
  arrow: '#2a2a3d',
  mapFill: '#2a2a3d',
  mapStroke: '#414868',
  mapMarker: '#ff9e64',
  modalOverlay: 'rgba(0,0,0,0.6)',
  shadow: 'rgba(0,0,0,0.6)',
  dropdownShadow: 'rgba(0,0,0,0.8)',
  barCursor: 'rgba(255,158,100,0.10)',
  sessionClosed: '#565f89',
  tcpTunnel: '#7dcfff',
  fileDownload: '#f7768e',
  blockStatusActiveBg: 'rgba(247,118,142,0.08)',
  blockStatusInactiveBg: '#1f2335',
  notifItemBg: '#1a1b26',
  toggleActiveBorder: '#ff9e64',
  toggleActiveText: '#ff9e64',
  toggleInactiveBorder: '#2a2a3d',
  toggleInactiveText: '#565f89',
  toggleDisabledBg: '#252640',
  messageBgError: 'rgba(247,118,142,0.08)',
  messageBgSuccess: 'rgba(158,206,106,0.08)',
  pieStroke: '#1a1b26',
  btnBg: '#1f2335',
  btnBorder: '#2a2a3d',
  btnText: '#565f89',
}

export const nordTheme: Theme = {
  name: 'nord',
  label: 'Nord',
  pageBg: '#1a1d23',
  text: '#d8dee9',
  scrollbarThumb: '#252a34',
  sidebarBg: '#161920',
  sidebarBorder: '#252a34',
  brand: '#88c0d0',
  navText: '#3b4252',
  navActiveBg: 'rgba(136,192,208,0.08)',
  navActiveText: '#88c0d0',
  cardBg: '#1f2430',
  cardBorder: '#252a34',
  cardHoverBg: '#242936',
  cardHoverBorder: '#3b4252',
  iconAccentBg: 'rgba(136,192,208,0.09)',
  iconAccent: '#88c0d0',
  heading: '#eceff4',
  textPrimary: '#d8dee9',
  textSecondary: '#4c566a',
  textTertiary: '#3b4252',
  axisTick: '#4c566a',
  tooltipBg: '#1f2430',
  tooltipBorder: '#252a34',
  success: '#a3be8c',
  error: '#bf616a',
  badgeRed: '#bf616a',
  bluePrimary: '#252a34',
  blueLink: '#81a1c1',
  amber: '#ebcb8b',
  orange: '#d08770',
  blockBtn: 'rgba(191,97,106,0.14)',
  blockBtnText: '#bf616a',
  blockBtnBorder: 'rgba(191,97,106,0.30)',
  unblockBtn: 'rgba(163,190,140,0.11)',
  unblockBtnText: '#a3be8c',
  unblockBtnBorder: 'rgba(163,190,140,0.28)',
  tableHeaderBg: '#161920',
  tableRowEven: '#1f2430',
  tableRowOdd: '#1a1d23',
  feedBg: '#161920',
  feedBorder: '#252a34',
  arrow: '#252a34',
  mapFill: '#252a34',
  mapStroke: '#3b4252',
  mapMarker: '#88c0d0',
  modalOverlay: 'rgba(0,0,0,0.5)',
  shadow: 'rgba(0,0,0,0.5)',
  dropdownShadow: 'rgba(0,0,0,0.7)',
  barCursor: 'rgba(136,192,208,0.10)',
  sessionClosed: '#4c566a',
  tcpTunnel: '#81a1c1',
  fileDownload: '#bf616a',
  blockStatusActiveBg: 'rgba(191,97,106,0.08)',
  blockStatusInactiveBg: '#1f2430',
  notifItemBg: '#1a1d23',
  toggleActiveBorder: '#88c0d0',
  toggleActiveText: '#88c0d0',
  toggleInactiveBorder: '#252a34',
  toggleInactiveText: '#3b4252',
  toggleDisabledBg: '#242936',
  messageBgError: 'rgba(191,97,106,0.08)',
  messageBgSuccess: 'rgba(163,190,140,0.08)',
  pieStroke: '#1a1d23',
  btnBg: '#1f2430',
  btnBorder: '#252a34',
  btnText: '#4c566a',
}

export const forestTheme: Theme = {
  name: 'forest',
  label: 'Forest',
  pageBg: '#0d1a12',
  text: '#85b898',
  scrollbarThumb: '#1a3020',
  sidebarBg: '#0a1610',
  sidebarBorder: '#162518',
  brand: '#4ec994',
  navText: '#2a5a3a',
  navActiveBg: 'rgba(78,201,148,0.07)',
  navActiveText: '#4ec994',
  cardBg: '#111e15',
  cardBorder: '#1a3020',
  cardHoverBg: '#152318',
  cardHoverBorder: '#254530',
  iconAccentBg: 'rgba(78,201,148,0.09)',
  iconAccent: '#4ec994',
  heading: '#c8e6d2',
  textPrimary: '#85b898',
  textSecondary: '#2a5a3a',
  textTertiary: '#1e4228',
  axisTick: '#2a5a3a',
  tooltipBg: '#111e15',
  tooltipBorder: '#1a3020',
  success: '#4ec994',
  error: '#ff4d6d',
  badgeRed: '#ff4d6d',
  bluePrimary: '#1a3020',
  blueLink: '#60c8f0',
  amber: '#f5a623',
  orange: '#ffcc70',
  blockBtn: 'rgba(255,77,109,0.14)',
  blockBtnText: '#ff4d6d',
  blockBtnBorder: 'rgba(255,77,109,0.30)',
  unblockBtn: 'rgba(78,201,148,0.11)',
  unblockBtnText: '#4ec994',
  unblockBtnBorder: 'rgba(78,201,148,0.28)',
  tableHeaderBg: '#0a1610',
  tableRowEven: '#111e15',
  tableRowOdd: '#0d1a12',
  feedBg: '#0a1610',
  feedBorder: '#1a3020',
  arrow: '#1a3020',
  mapFill: '#1a3020',
  mapStroke: '#254530',
  mapMarker: '#4ec994',
  modalOverlay: 'rgba(0,0,0,0.6)',
  shadow: 'rgba(0,0,0,0.6)',
  dropdownShadow: 'rgba(0,0,0,0.8)',
  barCursor: 'rgba(78,201,148,0.10)',
  sessionClosed: '#1e4228',
  tcpTunnel: '#60c8f0',
  fileDownload: '#ff4d6d',
  blockStatusActiveBg: 'rgba(255,77,109,0.07)',
  blockStatusInactiveBg: '#111e15',
  notifItemBg: '#0d1a12',
  toggleActiveBorder: '#4ec994',
  toggleActiveText: '#4ec994',
  toggleInactiveBorder: '#1a3020',
  toggleInactiveText: '#2a5a3a',
  toggleDisabledBg: '#152318',
  messageBgError: 'rgba(255,77,109,0.07)',
  messageBgSuccess: 'rgba(78,201,148,0.07)',
  pieStroke: '#0d1a12',
  btnBg: '#111e15',
  btnBorder: '#1a3020',
  btnText: '#2a5a3a',
}

export const themes: Record<string, Theme> = {
  obsidian: obsidianTheme,
  monokai: monokaiTheme,
  dracula: draculaTheme,
  nord: nordTheme,
  forest: forestTheme,
}

// Backwards-compat: keep darkTheme export so any leftover imports don't break
export const darkTheme = obsidianTheme

const THEME_KEY = 'hb_theme'

interface ThemeContextValue {
  theme: Theme
  themeName: string
  setThemeName: (name: string) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: obsidianTheme,
  themeName: 'obsidian',
  setThemeName: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY)
    return saved && themes[saved] ? saved : 'obsidian'
  })

  const theme = themes[themeName] ?? obsidianTheme

  useEffect(() => {
    localStorage.setItem(THEME_KEY, themeName)
    const root = document.documentElement
    root.style.setProperty('--page-bg', theme.pageBg)
    root.style.setProperty('--text', theme.text)
    root.style.setProperty('--scrollbar-thumb', theme.scrollbarThumb)
  }, [themeName, theme])

  return (
    <ThemeContext.Provider value={{ theme, themeName, setThemeName }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
