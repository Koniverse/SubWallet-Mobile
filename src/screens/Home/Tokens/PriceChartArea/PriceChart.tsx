import React, { useCallback, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, PanResponder, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { PriceChartPoint, PriceChartTimeframe } from '@subwallet/extension-base/background/KoniTypes';
import { Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { customFormatDate } from 'utils/customFormatDate';
import { FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import { buildMonotonePath, ChartPoint } from './monotonePath';
import {
  CHART_BOTTOM_PADDING,
  CHART_HEIGHT,
  CHART_LINE_WIDTH,
  CHART_MUTED_COLOR,
  CHART_RIGHT_PADDING,
  CHART_TOP_PADDING,
} from './shared';

interface Props {
  pricePoints: PriceChartPoint[];
  timeframe: PriceChartTimeframe;
  hoverPricePointIndex: number | null;
  setHoverPricePointIndex: (index: number | null) => void;
}

const TOOLTIP_HEIGHT = 18;
const TOOLTIP_EDGE_SPACE = 8;
const TOOLTIP_WIDTH = 132;

export const PriceChart = ({ hoverPricePointIndex, pricePoints, setHoverPricePointIndex, timeframe }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyles(theme);
  const [width, setWidth] = useState(0);
  // PanResponder is created once, so it reads the live values through refs rather
  // than closing over the first render's props.
  const widthRef = useRef(0);
  const pointCountRef = useRef(0);

  pointCountRef.current = pricePoints.length;

  const isUp = useMemo(() => {
    if (pricePoints.length < 2) {
      return true;
    }

    return (pricePoints[pricePoints.length - 1]?.value ?? 0) >= (pricePoints[0]?.value ?? 0);
  }, [pricePoints]);

  const lineColor = isUp ? theme.colorSuccess : theme.colorError;

  const chartPoints = useMemo<ChartPoint[]>(() => {
    if (!width || pricePoints.length === 0) {
      return [];
    }

    const values = pricePoints.map(point => point.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const usableWidth = Math.max(width - CHART_RIGHT_PADDING, 1);
    const usableHeight = CHART_HEIGHT - CHART_TOP_PADDING - CHART_BOTTOM_PADDING;
    const step = pricePoints.length > 1 ? usableWidth / (pricePoints.length - 1) : 0;

    return pricePoints.map((point, index) => ({
      x: index * step,
      y: CHART_TOP_PADDING + (1 - (point.value - min) / span) * usableHeight,
    }));
  }, [pricePoints, width]);

  const fullPath = useMemo(() => buildMonotonePath(chartPoints), [chartPoints]);

  // The coloured line stops at the hovered point, leaving the muted line showing
  // through for the rest, which is how the extension splits the two series.
  const hoveredPath = useMemo(() => {
    if (hoverPricePointIndex === null) {
      return fullPath;
    }

    return buildMonotonePath(chartPoints.slice(0, hoverPricePointIndex + 1));
  }, [chartPoints, fullPath, hoverPricePointIndex]);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;

    widthRef.current = nextWidth;
    setWidth(nextWidth);
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: event => updateHover(event.nativeEvent.locationX),
        onPanResponderMove: event => updateHover(event.nativeEvent.locationX),
        onPanResponderRelease: () => setHoverPricePointIndex(null),
        onPanResponderTerminate: () => setHoverPricePointIndex(null),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  function updateHover(locationX: number) {
    const count = pointCountRef.current;
    const currentWidth = widthRef.current;

    if (count === 0 || currentWidth === 0) {
      return;
    }

    const usableWidth = Math.max(currentWidth - CHART_RIGHT_PADDING, 1);
    const step = count > 1 ? usableWidth / (count - 1) : usableWidth;
    const index = Math.round(locationX / step);

    setHoverPricePointIndex(Math.min(Math.max(index, 0), count - 1));
  }

  const hoveredPoint = hoverPricePointIndex === null ? undefined : chartPoints[hoverPricePointIndex];

  const tooltipLabel = useMemo(() => {
    if (hoverPricePointIndex === null) {
      return '';
    }

    const point = pricePoints[hoverPricePointIndex];

    if (!point) {
      return '';
    }

    const format = ['ALL', 'YTD', '1Y'].includes(timeframe) ? '#MMM# #D# #YYYY#' : '#MMM# #D# at #hhh#:#mm#';

    return customFormatDate(point.time, format);
  }, [hoverPricePointIndex, pricePoints, timeframe]);

  const tooltipLeft = useMemo(() => {
    if (!hoveredPoint || !width) {
      return 0;
    }

    return Math.min(Math.max(hoveredPoint.x - TOOLTIP_WIDTH / 2, TOOLTIP_EDGE_SPACE), width - TOOLTIP_WIDTH - TOOLTIP_EDGE_SPACE);
  }, [hoveredPoint, width]);

  return (
    <View onLayout={onLayout} style={styles.container} {...panResponder.panHandlers}>
      {!!tooltipLabel && (
        <View pointerEvents={'none'} style={[styles.tooltip, { left: tooltipLeft }]}>
          <Typography.Text style={styles.tooltipText}>{tooltipLabel}</Typography.Text>
        </View>
      )}

      {width > 0 && chartPoints.length > 0 && (
        <Svg height={CHART_HEIGHT} width={width}>
          {!!hoveredPoint && (
            <>
              <Line
                stroke={CHART_MUTED_COLOR}
                strokeWidth={1}
                x1={hoveredPoint.x}
                x2={hoveredPoint.x}
                y1={CHART_TOP_PADDING}
                y2={CHART_HEIGHT}
              />
              <Line
                stroke={CHART_MUTED_COLOR}
                strokeDasharray={'3 3'}
                strokeWidth={1}
                x1={0}
                x2={width}
                y1={chartPoints[0].y}
                y2={chartPoints[0].y}
              />
            </>
          )}

          <Path
            d={fullPath}
            fill={'none'}
            stroke={CHART_MUTED_COLOR}
            strokeLinecap={'round'}
            strokeWidth={CHART_LINE_WIDTH}
          />

          <Path
            d={hoveredPath}
            fill={'none'}
            stroke={lineColor}
            strokeLinecap={'round'}
            strokeWidth={CHART_LINE_WIDTH}
          />

          {!!hoveredPoint && (
            <>
              <Circle cx={hoveredPoint.x} cy={hoveredPoint.y} fill={lineColor} fillOpacity={0.1} r={9} />
              <Circle cx={hoveredPoint.x} cy={hoveredPoint.y} fill={lineColor} r={4} />
            </>
          )}
        </Svg>
      )}
    </View>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      height: CHART_HEIGHT,
      justifyContent: 'flex-end',
    },
    tooltip: {
      position: 'absolute',
      top: 0,
      width: TOOLTIP_WIDTH,
      height: TOOLTIP_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tooltipText: {
      fontSize: 10,
      lineHeight: TOOLTIP_HEIGHT,
      color: theme.colorTextLight3,
      ...FontSemiBold,
    },
  });
}
