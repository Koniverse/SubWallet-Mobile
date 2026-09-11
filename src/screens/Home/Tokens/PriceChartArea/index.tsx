import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { CurrentTokenPrice, PriceChartPoint, PriceChartTimeframe } from '@subwallet/extension-base/background/KoniTypes';
import { cancelSubscription, getHistoryTokenPrice, subscribeCurrentTokenPrice } from 'messaging/index';
import { RootState } from 'stores/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';
import { PriceChart } from './PriceChart';
import { PriceInfoContainer } from './PriceInfoContainer';
import { PriceInfoUI } from './PriceInfoUI';
import { TimeframeSelector } from './TimeframeSelector';
import { timeframeIntervals } from './shared';

interface Props {
  priceId?: string;
  isChartSupported?: boolean;
}

interface ComponentProps {
  priceId: string;
}

// Re-fetching the same timeframe more often than this adds nothing: the backend
// buckets history and the live subscription already covers the latest point.
const HISTORY_REFETCH_INTERVAL = 30000;

const EMPTY_POINTS: PriceChartPoint[] = [];

interface PriceSeries {
  timeframe: PriceChartTimeframe;
  points: PriceChartPoint[];
}

const Component = ({ priceId }: ComponentProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<PriceChartTimeframe>('1D');
  const currency = useSelector((state: RootState) => state.price.currency);
  const priceMap = useSelector((state: RootState) => state.price.priceMap);
  const price24hMap = useSelector((state: RootState) => state.price.price24hMap);
  // The series remembers which timeframe it was loaded for. Without that the
  // previous timeframe's points stay on screen under the newly selected tab
  // until the request returns, which here is long enough to read as a wrong chart.
  const [priceSeries, setPriceSeries] = useState<PriceSeries | null>(null);
  const [hoverPricePointIndex, setHoverPricePointIndex] = useState<number | null>(null);
  const [livePrice, setLivePrice] = useState<CurrentTokenPrice | null>(null);
  const lastFetchPriceHistoryTimeRef = useRef<Record<string, number>>({});
  const prevCurrencyRef = useRef(currency);
  const priceHistoryCacheRef = useRef<Record<string, PriceChartPoint[]>>({});

  const rawPricePoints = priceSeries?.timeframe === selectedTimeframe ? priceSeries.points : EMPTY_POINTS;
  const interval = timeframeIntervals[selectedTimeframe];

  const mergedRawPricePoints = useMemo<PriceChartPoint[]>(() => {
    if (!livePrice || !rawPricePoints.length) {
      return rawPricePoints;
    }

    const last = rawPricePoints[rawPricePoints.length - 1];
    const intervalMs = interval * 1000;

    // Within half an interval the live price belongs to the last bucket rather than
    // to a new one, otherwise the series grows a point on every tick.
    if (livePrice.time - last.time < intervalMs * 0.5) {
      return [...rawPricePoints.slice(0, -1), { ...last, value: livePrice.value }];
    }

    return [...rawPricePoints, { time: livePrice.time, value: livePrice.value }];
  }, [rawPricePoints, livePrice, interval]);

  const onSelectTimeframe = useCallback((timeframe: PriceChartTimeframe) => {
    setHoverPricePointIndex(null);
    setSelectedTimeframe(timeframe);
  }, []);

  useEffect(() => {
    priceHistoryCacheRef.current = {};
    lastFetchPriceHistoryTimeRef.current = {};
    setPriceSeries(null);
  }, [priceId]);

  useEffect(() => {
    let sync = true;

    const loadPriceHistory = async () => {
      const cache = priceHistoryCacheRef.current[selectedTimeframe];
      const nowTs = Date.now();
      const lastFetched = lastFetchPriceHistoryTimeRef.current[selectedTimeframe] || 0;
      const shouldRefetch = nowTs - lastFetched >= HISTORY_REFETCH_INTERVAL;

      if (cache && !shouldRefetch) {
        setPriceSeries({ timeframe: selectedTimeframe, points: cache });

        return;
      }

      if (cache) {
        // Show what we already have while the refresh is in flight, so a revisit
        // never drops back to an empty chart.
        setPriceSeries({ timeframe: selectedTimeframe, points: cache });
      }

      if (!shouldRefetch) {
        return;
      }

      lastFetchPriceHistoryTimeRef.current[selectedTimeframe] = nowTs;

      try {
        const { history } = await getHistoryTokenPrice(priceId, selectedTimeframe);

        if (sync) {
          priceHistoryCacheRef.current[selectedTimeframe] = history;
          setPriceSeries({ timeframe: selectedTimeframe, points: history });
        }
      } catch (e) {
        // The timestamp is stamped before the request to collapse duplicates, so a
        // failure has to release it or the tab stays empty for the whole window.
        delete lastFetchPriceHistoryTimeRef.current[selectedTimeframe];

        throw e;
      }
    };

    loadPriceHistory().catch(console.error);

    return () => {
      sync = false;
    };
  }, [priceId, selectedTimeframe]);

  // A currency change reprices the whole series, so the cache cannot be reused.
  useEffect(() => {
    let sync = true;

    if (currency !== prevCurrencyRef.current) {
      lastFetchPriceHistoryTimeRef.current[selectedTimeframe] = Date.now();

      getHistoryTokenPrice(priceId, selectedTimeframe)
        .then(({ history }) => {
          if (sync) {
            priceHistoryCacheRef.current[selectedTimeframe] = history;
            setPriceSeries({ timeframe: selectedTimeframe, points: history });
          }
        })
        .catch(console.error);

      prevCurrencyRef.current = currency;
    }

    return () => {
      sync = false;
    };
  }, [currency, priceId, selectedTimeframe]);

  useEffect(() => {
    let subscriptionId: string;
    let isSync = true;

    subscribeCurrentTokenPrice(priceId, setLivePrice)
      .then(({ id, price }) => {
        subscriptionId = id;

        if (isSync) {
          setLivePrice(price);
        }
      })
      .catch(console.error);

    return () => {
      isSync = false;

      if (subscriptionId) {
        cancelSubscription(subscriptionId).catch(console.error);
      }
    };
  }, [priceId]);

  // Both are already in the store, so the header can be right from the first frame
  // instead of sitting at $0 for as long as the history request takes. The opening
  // price is only known for 24h; the other timeframes say so rather than guess.
  const fallbackValue = livePrice?.value ?? priceMap[priceId];
  const fallbackFirst = selectedTimeframe === '1D' ? price24hMap[priceId] : undefined;

  return (
    <>
      <PriceInfoContainer
        fallbackFirst={fallbackFirst}
        fallbackValue={fallbackValue}
        hoverPricePointIndex={hoverPricePointIndex}
        pricePoints={mergedRawPricePoints}
      />

      <PriceChart
        hoverPricePointIndex={hoverPricePointIndex}
        isLoading={!mergedRawPricePoints.length}
        pricePoints={mergedRawPricePoints}
        setHoverPricePointIndex={setHoverPricePointIndex}
        timeframe={selectedTimeframe}
      />

      <TimeframeSelector onSelect={onSelectTimeframe} selectedTimeframe={selectedTimeframe} />
    </>
  );
};

export const PriceChartArea = ({ isChartSupported, priceId }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyles(theme);
  const priceMap = useSelector((state: RootState) => state.price.priceMap);

  return (
    <View style={styles.container}>
      {priceId && isChartSupported ? (
        <Component priceId={priceId} />
      ) : (
        <PriceInfoUI change={0} percent={0} value={priceId ? priceMap[priceId] || 0 : 0} />
      )}
    </View>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      // The upper block centres its children, so opt out or the chart and the
      // timeframe row collapse to their content width instead of filling the screen.
      alignSelf: 'stretch',
      paddingBottom: theme.paddingXXS,
      gap: theme.marginXS,
    },
  });
}
