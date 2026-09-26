import { PriceChartTimeframe } from '@subwallet/extension-base/background/KoniTypes';

export const timeframes: PriceChartTimeframe[] = ['1D', '1W', '1M', '3M', 'YTD', '1Y'];

export const timeframeLabelMap: Record<PriceChartTimeframe, string> = {
  '1D': '24h',
  '1W': '7d',
  '1M': '1m',
  '3M': '3m',
  '1Y': '1y',
  YTD: 'YTD',
  ALL: 'Max',
};

// Seconds between two points of each timeframe. Used to decide whether a live price
// updates the last point or is appended as a new one.
export const timeframeIntervals: Record<PriceChartTimeframe, number> = {
  '1D': 300,
  '1W': 3600,
  '1M': 14400,
  '3M': 43200,
  YTD: 86400,
  '1Y': 86400,
  ALL: 604800,
};

export const CHART_HEIGHT = 162;
export const CHART_TOP_PADDING = 22;
export const CHART_BOTTOM_PADDING = 16;
export const CHART_RIGHT_PADDING = 16;
export const CHART_LINE_WIDTH = 3;
export const CHART_MUTED_COLOR = 'rgba(255, 255, 255, 0.12)';
