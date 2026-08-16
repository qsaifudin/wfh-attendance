// Literal hex values, mirroring globals.css — SVG chart fills need concrete
// colors rather than CSS vars, and dark mode here is a selected second set
// validated against the dark surface, not an automatic inversion.

export const chartColors = {
  light: {
    surface: '#fcfcfb',
    present: '#12a06b',
    late: '#e8a317',
    grid: '#e1e0d9',
    axis: '#898781',
    dept: ['#0d8f80', '#eb6834', '#4a3aa7', '#eda100'],
  },
  dark: {
    surface: '#1a1a19',
    present: '#14a870',
    late: '#c98500',
    grid: '#2c2c2a',
    axis: '#898781',
    dept: ['#199e8d', '#d95926', '#9085e9', '#c98500'],
  },
};

export function getChartColors(isDark: boolean) {
  return isDark ? chartColors.dark : chartColors.light;
}
