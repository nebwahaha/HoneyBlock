import { createContext, useContext, useState, useEffect } from 'react'

export interface Theme {
  name: string
  label: string
  kind: 'dark' | 'light'
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

// ★ Default — hacker-terminal dark, amber threat-intel glow
export const obsidianTheme: Theme = {
  name: 'obsidian',
  label: 'Default',
  kind: 'dark',
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

// Monokai Dimmed — VS Code's desaturated Monokai palette.
// Brand = muted purple (#9872a2, the keyword color), strings olive (#9aa83a),
// types soft blue (#76aaff), comments gray (#9a9b99). No vivid orange.
export const monokaiTheme: Theme = {
  name: 'monokai',
  label: 'Monokai Dimmed',
  kind: 'dark',
  pageBg: '#1e1e1e',
  text: '#c5c8c6',
  scrollbarThumb: '#3a3a3a',
  sidebarBg: '#252526',
  sidebarBorder: '#2e2e2e',
  brand: '#9872a2',
  navText: '#5a5a5a',
  navActiveBg: 'rgba(152,114,162,0.10)',
  navActiveText: '#9872a2',
  cardBg: '#272727',
  cardBorder: '#333333',
  cardHoverBg: '#2e2e2e',
  cardHoverBorder: '#444444',
  iconAccentBg: 'rgba(152,114,162,0.10)',
  iconAccent: '#9872a2',
  heading: '#dcdcdc',
  textPrimary: '#c5c8c6',
  textSecondary: '#9a9b99',
  textTertiary: '#5a5b58',
  axisTick: '#9a9b99',
  tooltipBg: '#252526',
  tooltipBorder: '#333333',
  success: '#9aa83a',
  error: '#cf6679',
  badgeRed: '#cf6679',
  bluePrimary: '#333333',
  blueLink: '#76aaff',
  amber: '#d9bf6c',
  orange: '#d68646',
  blockBtn: 'rgba(207,102,121,0.14)',
  blockBtnText: '#cf6679',
  blockBtnBorder: 'rgba(207,102,121,0.30)',
  unblockBtn: 'rgba(154,168,58,0.11)',
  unblockBtnText: '#9aa83a',
  unblockBtnBorder: 'rgba(154,168,58,0.28)',
  tableHeaderBg: '#222222',
  tableRowEven: '#272727',
  tableRowOdd: '#232323',
  feedBg: '#222222',
  feedBorder: '#2e2e2e',
  arrow: '#3a3a3a',
  mapFill: '#2e2e2e',
  mapStroke: '#333333',
  mapMarker: '#9872a2',
  modalOverlay: 'rgba(0,0,0,0.6)',
  shadow: 'rgba(0,0,0,0.5)',
  dropdownShadow: 'rgba(0,0,0,0.7)',
  barCursor: 'rgba(152,114,162,0.10)',
  sessionClosed: '#9a9b99',
  tcpTunnel: '#76aaff',
  fileDownload: '#cf6679',
  blockStatusActiveBg: 'rgba(207,102,121,0.08)',
  blockStatusInactiveBg: '#272727',
  notifItemBg: '#232323',
  toggleActiveBorder: '#9872a2',
  toggleActiveText: '#9872a2',
  toggleInactiveBorder: '#333333',
  toggleInactiveText: '#5a5a5a',
  toggleDisabledBg: '#2e2e2e',
  messageBgError: 'rgba(207,102,121,0.08)',
  messageBgSuccess: 'rgba(154,168,58,0.08)',
  pieStroke: '#1e1e1e',
  btnBg: '#2e2e2e',
  btnBorder: '#3a3a3a',
  btnText: '#9a9b99',
}

export const draculaTheme: Theme = {
  name: 'dracula',
  label: 'Dracula',
  kind: 'dark',
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
  kind: 'dark',
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
  kind: 'dark',
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

// ─── Light themes ─────────────────────────────────────────────────

// Solarized Light — Ethan Schoonover's classic warm cream palette.
export const solarizedLightTheme: Theme = {
  name: 'solarized-light',
  label: 'Solarized Light',
  kind: 'light',
  pageBg: '#fdf6e3',
  text: '#586e75',
  scrollbarThumb: '#cdc7b3',
  sidebarBg: '#f5eecc',
  sidebarBorder: '#e6dec0',
  brand: '#268bd2',
  navText: '#93a1a1',
  navActiveBg: 'rgba(38,139,210,0.10)',
  navActiveText: '#268bd2',
  cardBg: '#fbf3df',
  cardBorder: '#e6dec0',
  cardHoverBg: '#f3ead0',
  cardHoverBorder: '#d8cfb0',
  iconAccentBg: 'rgba(38,139,210,0.10)',
  iconAccent: '#268bd2',
  heading: '#073642',
  textPrimary: '#586e75',
  textSecondary: '#93a1a1',
  textTertiary: '#a8b1ad',
  axisTick: '#93a1a1',
  tooltipBg: '#fdf6e3',
  tooltipBorder: '#e6dec0',
  success: '#859900',
  error: '#dc322f',
  badgeRed: '#dc322f',
  bluePrimary: '#268bd2',
  blueLink: '#268bd2',
  amber: '#b58900',
  orange: '#cb4b16',
  blockBtn: 'rgba(220,50,47,0.12)',
  blockBtnText: '#dc322f',
  blockBtnBorder: 'rgba(220,50,47,0.30)',
  unblockBtn: 'rgba(133,153,0,0.12)',
  unblockBtnText: '#859900',
  unblockBtnBorder: 'rgba(133,153,0,0.30)',
  tableHeaderBg: '#f5eecc',
  tableRowEven: '#fbf3df',
  tableRowOdd: '#f6eed4',
  feedBg: '#fbf3df',
  feedBorder: '#e6dec0',
  arrow: '#a8b1ad',
  mapFill: '#eee8d5',
  mapStroke: '#d8cfb0',
  mapMarker: '#268bd2',
  modalOverlay: 'rgba(7,54,66,0.4)',
  shadow: 'rgba(0,0,0,0.10)',
  dropdownShadow: 'rgba(0,0,0,0.15)',
  barCursor: 'rgba(38,139,210,0.10)',
  sessionClosed: '#93a1a1',
  tcpTunnel: '#268bd2',
  fileDownload: '#dc322f',
  blockStatusActiveBg: 'rgba(220,50,47,0.10)',
  blockStatusInactiveBg: '#fbf3df',
  notifItemBg: '#fbf3df',
  toggleActiveBorder: '#268bd2',
  toggleActiveText: '#268bd2',
  toggleInactiveBorder: '#d8cfb0',
  toggleInactiveText: '#93a1a1',
  toggleDisabledBg: '#e6dec0',
  messageBgError: 'rgba(220,50,47,0.10)',
  messageBgSuccess: 'rgba(133,153,0,0.10)',
  pieStroke: '#fdf6e3',
  btnBg: '#fbf3df',
  btnBorder: '#e6dec0',
  btnText: '#93a1a1',
}

// GitHub Light — clean modern white + blue accent.
export const githubLightTheme: Theme = {
  name: 'github-light',
  label: 'GitHub Light',
  kind: 'light',
  pageBg: '#ffffff',
  text: '#1f2328',
  scrollbarThumb: '#d0d7de',
  sidebarBg: '#f6f8fa',
  sidebarBorder: '#d0d7de',
  brand: '#0969da',
  navText: '#656d76',
  navActiveBg: 'rgba(9,105,218,0.10)',
  navActiveText: '#0969da',
  cardBg: '#ffffff',
  cardBorder: '#d0d7de',
  cardHoverBg: '#f6f8fa',
  cardHoverBorder: '#afb8c1',
  iconAccentBg: 'rgba(9,105,218,0.10)',
  iconAccent: '#0969da',
  heading: '#1f2328',
  textPrimary: '#1f2328',
  textSecondary: '#656d76',
  textTertiary: '#8c959f',
  axisTick: '#656d76',
  tooltipBg: '#ffffff',
  tooltipBorder: '#d0d7de',
  success: '#1a7f37',
  error: '#cf222e',
  badgeRed: '#cf222e',
  bluePrimary: '#0969da',
  blueLink: '#0969da',
  amber: '#9a6700',
  orange: '#bc4c00',
  blockBtn: 'rgba(207,34,46,0.10)',
  blockBtnText: '#cf222e',
  blockBtnBorder: 'rgba(207,34,46,0.30)',
  unblockBtn: 'rgba(26,127,55,0.10)',
  unblockBtnText: '#1a7f37',
  unblockBtnBorder: 'rgba(26,127,55,0.30)',
  tableHeaderBg: '#f6f8fa',
  tableRowEven: '#ffffff',
  tableRowOdd: '#f6f8fa',
  feedBg: '#f6f8fa',
  feedBorder: '#d0d7de',
  arrow: '#8c959f',
  mapFill: '#eaeef2',
  mapStroke: '#d0d7de',
  mapMarker: '#0969da',
  modalOverlay: 'rgba(31,35,40,0.4)',
  shadow: 'rgba(31,35,40,0.08)',
  dropdownShadow: 'rgba(31,35,40,0.15)',
  barCursor: 'rgba(9,105,218,0.10)',
  sessionClosed: '#8c959f',
  tcpTunnel: '#0969da',
  fileDownload: '#cf222e',
  blockStatusActiveBg: 'rgba(207,34,46,0.08)',
  blockStatusInactiveBg: '#ffffff',
  notifItemBg: '#f6f8fa',
  toggleActiveBorder: '#0969da',
  toggleActiveText: '#0969da',
  toggleInactiveBorder: '#d0d7de',
  toggleInactiveText: '#8c959f',
  toggleDisabledBg: '#eaeef2',
  messageBgError: 'rgba(207,34,46,0.08)',
  messageBgSuccess: 'rgba(26,127,55,0.08)',
  pieStroke: '#ffffff',
  btnBg: '#f6f8fa',
  btnBorder: '#d0d7de',
  btnText: '#656d76',
}

// Ubuntu (Yaru) — warm white + the iconic Ubuntu orange #e95420.
export const ubuntuTheme: Theme = {
  name: 'ubuntu',
  label: 'Ubuntu',
  kind: 'light',
  pageBg: '#fafafa',
  text: '#3d3d3d',
  scrollbarThumb: '#c8c4c0',
  sidebarBg: '#f4f1ee',
  sidebarBorder: '#d8d4cf',
  brand: '#e95420',
  navText: '#5e5c5a',
  navActiveBg: 'rgba(233,84,32,0.10)',
  navActiveText: '#e95420',
  cardBg: '#ffffff',
  cardBorder: '#d8d4cf',
  cardHoverBg: '#f9f7f5',
  cardHoverBorder: '#c2bdb6',
  iconAccentBg: 'rgba(233,84,32,0.10)',
  iconAccent: '#e95420',
  heading: '#3d3d3d',
  textPrimary: '#3d3d3d',
  textSecondary: '#7c7975',
  textTertiary: '#9b9893',
  axisTick: '#7c7975',
  tooltipBg: '#ffffff',
  tooltipBorder: '#d8d4cf',
  success: '#0e8420',
  error: '#c7162b',
  badgeRed: '#c7162b',
  bluePrimary: '#0073e6',
  blueLink: '#0073e6',
  amber: '#a86500',
  orange: '#e95420',
  blockBtn: 'rgba(199,22,43,0.10)',
  blockBtnText: '#c7162b',
  blockBtnBorder: 'rgba(199,22,43,0.30)',
  unblockBtn: 'rgba(14,132,32,0.10)',
  unblockBtnText: '#0e8420',
  unblockBtnBorder: 'rgba(14,132,32,0.30)',
  tableHeaderBg: '#f4f1ee',
  tableRowEven: '#ffffff',
  tableRowOdd: '#f9f7f5',
  feedBg: '#f4f1ee',
  feedBorder: '#d8d4cf',
  arrow: '#9b9893',
  mapFill: '#e6e3df',
  mapStroke: '#d8d4cf',
  mapMarker: '#e95420',
  modalOverlay: 'rgba(33,33,33,0.4)',
  shadow: 'rgba(0,0,0,0.10)',
  dropdownShadow: 'rgba(0,0,0,0.15)',
  barCursor: 'rgba(233,84,32,0.10)',
  sessionClosed: '#9b9893',
  tcpTunnel: '#0073e6',
  fileDownload: '#c7162b',
  blockStatusActiveBg: 'rgba(199,22,43,0.08)',
  blockStatusInactiveBg: '#ffffff',
  notifItemBg: '#f9f7f5',
  toggleActiveBorder: '#e95420',
  toggleActiveText: '#e95420',
  toggleInactiveBorder: '#d8d4cf',
  toggleInactiveText: '#9b9893',
  toggleDisabledBg: '#e6e3df',
  messageBgError: 'rgba(199,22,43,0.08)',
  messageBgSuccess: 'rgba(14,132,32,0.08)',
  pieStroke: '#ffffff',
  btnBg: '#f4f1ee',
  btnBorder: '#d8d4cf',
  btnText: '#7c7975',
}

export const themes: Record<string, Theme> = {
  obsidian: obsidianTheme,
  monokai: monokaiTheme,
  dracula: draculaTheme,
  nord: nordTheme,
  forest: forestTheme,
  'solarized-light': solarizedLightTheme,
  'github-light': githubLightTheme,
  ubuntu: ubuntuTheme,
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
