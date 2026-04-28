import Chart from 'chart.js/auto'

// Brings chart.js visual defaults in line with the app's design language:
// Greycliff CF font, the theme colour palette, soft grid lines, and a
// white tooltip with shadow that matches the modal panels.
//
// Imported once at app startup; effects are global on the Chart class.

const FONT_FAMILY = "'Greycliff CF', Arial, sans-serif"
const COLOR_TEXT = '#3d5372'      // grey-800 — primary axis/legend text
const COLOR_TEXT_MUTED = '#7f8fa4' // grey-700 — secondary
const COLOR_GRID = '#e8eaf1'      // grey-200 — subtle separators
const COLOR_BG = '#ffffff'

Chart.defaults.font.family = FONT_FAMILY
Chart.defaults.font.size = 14
Chart.defaults.color = COLOR_TEXT
Chart.defaults.borderColor = COLOR_GRID

// Disable canvas-wide animations — modal opens are short, animation feels
// twitchy and the components disable it per-chart anyway.
Chart.defaults.animation = false

// Pin legend to the bottom of every chart. chart.js otherwise auto-flips
// it to the side when the chart is narrow, producing inconsistent
// placements across the unified Statistieken modal.
Chart.defaults.plugins.legend.position = 'bottom'
Chart.defaults.plugins.legend.labels.color = COLOR_TEXT
Chart.defaults.plugins.legend.labels.boxWidth = 14
Chart.defaults.plugins.legend.labels.boxHeight = 14
Chart.defaults.plugins.legend.labels.padding = 14
Chart.defaults.plugins.legend.labels.font = { family: FONT_FAMILY, size: 14 }

// Section headings own the title — disable chart.js's own title plugin
// by default. Defaults below keep the styling sensible if a chart
// re-enables it.
Chart.defaults.plugins.title.display = false
Chart.defaults.plugins.title.color = COLOR_TEXT
Chart.defaults.plugins.title.font = { family: FONT_FAMILY, size: 16, weight: 'bold' }
Chart.defaults.plugins.title.padding = { top: 4, bottom: 16 }

Chart.defaults.plugins.tooltip.backgroundColor = COLOR_BG
Chart.defaults.plugins.tooltip.titleColor = COLOR_TEXT
Chart.defaults.plugins.tooltip.bodyColor = COLOR_TEXT_MUTED
Chart.defaults.plugins.tooltip.borderColor = COLOR_GRID
Chart.defaults.plugins.tooltip.borderWidth = 1
Chart.defaults.plugins.tooltip.padding = 12
Chart.defaults.plugins.tooltip.cornerRadius = 6
Chart.defaults.plugins.tooltip.titleFont = { family: FONT_FAMILY, weight: 'bold', size: 13 }
Chart.defaults.plugins.tooltip.bodyFont = { family: FONT_FAMILY, size: 13 }
Chart.defaults.plugins.tooltip.boxPadding = 4

// Theme palette for chart fills/borders. Solid versions are used for
// bars/lines; the lighter half-tone versions are for stacked or
// distribution backgrounds.
export const CHART_PALETTE = {
  blue: '#17a4ea',
  green: '#28cc8b',
  yellow: '#ffcc69',
  orange: '#ea5d17',
  red: '#ed1c24',
  pink: '#ce007c',
  grey: '#7f8fa4',
  navy: '#191e3c',
} as const

export const CHART_PALETTE_SOFT = {
  blue: '#d1edfb',
  green: '#afecd4',
  yellow: '#fff3d9',
  orange: '#fbd6c2',
  red: '#fbd2d4',
  pink: '#f5cce4',
  grey: '#e8eaf1',
  navy: '#bcc1d4',
} as const

// Risk grade colors (A → E). Used by foundationRiskDistribution.
export const RISK_PALETTE: Record<string, string> = {
  A: CHART_PALETTE.green,
  B: CHART_PALETTE.green,
  C: CHART_PALETTE.yellow,
  D: CHART_PALETTE.orange,
  E: CHART_PALETTE.red,
}
